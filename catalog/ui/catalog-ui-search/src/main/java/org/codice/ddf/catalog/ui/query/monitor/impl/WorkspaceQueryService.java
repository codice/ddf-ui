/**
 * Copyright (c) Codice Foundation
 * <p/>
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 * <p/>
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.catalog.ui.query.monitor.impl;

import static org.apache.commons.lang3.Validate.notEmpty;
import static org.apache.commons.lang3.Validate.notNull;
import static org.quartz.JobBuilder.newJob;

import java.io.Serializable;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinTask;
import java.util.concurrent.RecursiveTask;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.BiFunction;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.tuple.Pair;
import org.codice.ddf.catalog.ui.metacard.workspace.QueryMetacardImpl;
import org.codice.ddf.catalog.ui.metacard.workspace.WorkspaceMetacardImpl;
import org.codice.ddf.catalog.ui.query.monitor.api.FilterService;
import org.codice.ddf.catalog.ui.query.monitor.api.QueryService;
import org.codice.ddf.catalog.ui.query.monitor.api.QueryUpdateSubscriber;
import org.codice.ddf.catalog.ui.query.monitor.api.SecurityService;
import org.codice.ddf.catalog.ui.query.monitor.api.WorkspaceService;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.opengis.filter.And;
import org.opengis.filter.Filter;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.Lists;

import ddf.catalog.CatalogFramework;
import ddf.catalog.federation.FederationException;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.QueryRequest;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.impl.QueryImpl;
import ddf.catalog.operation.impl.QueryRequestImpl;
import ddf.catalog.source.SourceUnavailableException;
import ddf.catalog.source.UnsupportedQueryException;

public class WorkspaceQueryService {

    public static final String JOB_IDENTITY = "WorkspaceQueryServiceJob";

    public static final long DEFAULT_QUERY_TIMEOUT_MINUTES = 5;

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkspaceQueryService.class);

    private static final String UNKNOWN_SOURCE = "unknown";

    private static WorkspaceQueryService instance = null;

    private final QueryUpdateSubscriber queryUpdateSubscriber;

    private final WorkspaceService workspaceService;

    private final QueryService queryService;

    private final CatalogFramework catalogFramework;

    private final FilterBuilder filterBuilder;

    @SuppressWarnings("FieldCanBeLocal")
    private Scheduler scheduler;

    private SecurityService securityService;

    private FilterService filterService;

    private long queryTimeoutMinutes = DEFAULT_QUERY_TIMEOUT_MINUTES;

    /**
     * @param queryUpdateSubscriber must be non-null
     * @param workspaceService      must be non-null
     * @param queryService          may be null
     * @param catalogFramework      must be non-null
     * @param filterBuilder         must be non-null
     * @param schedulerSupplier     must be non-null
     * @param triggerSupplier       must be non-null
     * @param securityService       must be non-null
     * @param filterService         must be non-null
     */
    public WorkspaceQueryService(QueryUpdateSubscriber queryUpdateSubscriber,
            WorkspaceService workspaceService, QueryService queryService,
            CatalogFramework catalogFramework, FilterBuilder filterBuilder,
            Supplier<Optional<Scheduler>> schedulerSupplier, Supplier<Trigger> triggerSupplier,
            SecurityService securityService, FilterService filterService)
            throws SchedulerException {

        notNull(queryUpdateSubscriber, "queryUpdateSubscriber must be non-null");
        notNull(workspaceService, "workspaceService must be non-null");
        notNull(catalogFramework, "catalogFramework must be non-null");
        notNull(filterBuilder, "filterBuilder must be non-null");
        notNull(schedulerSupplier, "scheduleSupplier must be non-null");
        notNull(triggerSupplier, "triggerSupplier must be non-null");
        notNull(securityService, "securityService must be non-null");
        notNull(filterService, "filterService must be non-null");

        this.queryUpdateSubscriber = queryUpdateSubscriber;
        this.workspaceService = workspaceService;
        if (queryService != null) {
            this.queryService = queryService;
        } else {
            this.queryService = queryMetacard -> true;
        }
        this.catalogFramework = catalogFramework;
        this.filterBuilder = filterBuilder;
        this.securityService = securityService;
        this.filterService = filterService;

        Optional<Scheduler> schedulerOptional = schedulerSupplier.get();

        instance = this;

        if (schedulerOptional.isPresent()) {
            scheduler = schedulerOptional.get();
            scheduler.scheduleJob(newJob(QueryJob.class).withIdentity(JOB_IDENTITY)
                    .build(), triggerSupplier.get());
            scheduler.start();
        } else {
            LOGGER.warn("unable to get a quartz scheduler object, email notifications will not run");
        }

    }

    public static WorkspaceQueryService getInstance() {
        return instance;
    }

    /**
     * @param queryTimeoutMinutes minutes (must be non-null)
     */
    @SuppressWarnings("unused")
    public void setQueryTimeoutMinutes(Long queryTimeoutMinutes) {
        notNull(queryTimeoutMinutes, "queryTimeoutMinutes must be non-null");
        this.queryTimeoutMinutes = queryTimeoutMinutes;
    }

    /**
     * Main entry point, should be called by a scheduler.
     */
    public void run() {

        LOGGER.debug("running workspace query service");

        Map<WorkspaceMetacardImpl, List<QueryMetacardImpl>> queryMetacards =
                workspaceService.getQueryMetacards();

        LOGGER.debug("queryMetacards: size={}", queryMetacards.size());

        List<WorkspaceTask> workspaceTasks = createWorkspaceTasks(queryMetacards);

        LOGGER.debug("workspaceTasks: size={}", workspaceTasks.size());

        Map<WorkspaceMetacardImpl, Long> results = executeWorkspaceTasks(workspaceTasks,
                queryTimeoutMinutes,
                TimeUnit.MINUTES);

        LOGGER.debug("results: {}", results);

        queryUpdateSubscriber.notify(results);

    }

    private Map<WorkspaceMetacardImpl, Long> executeWorkspaceTasks(
            List<WorkspaceTask> workspaceTasks, long timeout, TimeUnit timeoutUnit) {
        Map<WorkspaceMetacardImpl, Long> results = new ConcurrentHashMap<>();

        workspaceTasks.stream()
                .map(ForkJoinPool.commonPool()::submit)
                .map(task -> getTaskResult(task, timeout, timeoutUnit))
                .filter(Objects::nonNull)
                .forEach(pair -> results.put(pair.getLeft(), pair.getRight()));

        return results;
    }

    private Pair<WorkspaceMetacardImpl, Long> getTaskResult(
            ForkJoinTask<Pair<WorkspaceMetacardImpl, Long>> workspaceTask, long timeout,
            TimeUnit timeoutUnit) {
        try {
            return workspaceTask.get(timeout, timeoutUnit);
        } catch (TimeoutException e) {
            LOGGER.warn("Timeout", e);
        } catch (ExecutionException | InterruptedException e) {
            LOGGER.warn("ForkJoinPool error", e);
        }
        return null;
    }

    private List<WorkspaceTask> createWorkspaceTasks(
            Map<WorkspaceMetacardImpl, List<QueryMetacardImpl>> queryMetacards) {

        List<WorkspaceTask> workspaceTasks = new ArrayList<>();

        for (Map.Entry<WorkspaceMetacardImpl, List<QueryMetacardImpl>> workspaceQueryEntry : queryMetacards.entrySet()) {
            List<QueryMetacardImpl> activeQueryMetacards = filterActiveQueryMetacards(
                    workspaceQueryEntry.getValue());
            Map<String, List<QueryMetacardImpl>> queryMetacardsGroupedBySource = groupBySource(
                    activeQueryMetacards);
            List<QueryRequest> queryRequests =
                    getQueryRequests(queryMetacardsGroupedBySource.values()
                            .stream());
            if (!queryRequests.isEmpty()) {
                workspaceTasks.add(new WorkspaceTask(workspaceQueryEntry.getKey(), queryRequests));
            }
        }

        return workspaceTasks;
    }

    private Map<String, List<QueryMetacardImpl>> groupBySource(
            List<QueryMetacardImpl> queryMetacards) {
        final Map<String, List<QueryMetacardImpl>> groupedBySource = new HashMap<>();
        for (QueryMetacardImpl queryMetacard : queryMetacards) {

            Optional<List<String>> optionalSources = queryMetacard.getSources();

            if (optionalSources.isPresent()) {
                optionalSources.get()
                        .stream()
                        .forEach(sourceId -> groupedBySource.compute(sourceId,
                                addToList(queryMetacard)));
            } else {
                groupedBySource.compute(UNKNOWN_SOURCE, addToList(queryMetacard));
            }
        }
        return groupedBySource;
    }

    private BiFunction<String, List<QueryMetacardImpl>, List<QueryMetacardImpl>> addToList(
            QueryMetacardImpl queryMetacard) {
        return (id, queries) -> {
            if (queries == null) {
                return Lists.newArrayList(queryMetacard);
            } else {
                queries.add(queryMetacard);
                return queries;
            }
        };
    }

    private List<QueryMetacardImpl> filterActiveQueryMetacards(
            List<QueryMetacardImpl> queryMetacards) {
        return queryMetacards.stream()
                .filter(queryService::isActiveStandingQuery)
                .collect(Collectors.toList());
    }

    private List<QueryRequest> getQueryRequests(
            Stream<List<QueryMetacardImpl>> queriesGroupedBySource) {

        final Filter modifiedFilter = filterService.getModifiedDateFilter(getOneDayBack());

        return queriesGroupedBySource.map(queriesForSource -> queriesForSource.stream()
                .map(this::metacard2Filter)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()))
                .map(filterBuilder::anyOf)
                .map(filter -> filterBuilder.allOf(modifiedFilter, filter))
                .map(this::filter2query)
                .map(this::query2queryRequest)
                .collect(Collectors.toList());
    }

    private QueryRequestImpl query2queryRequest(QueryImpl query) {
        final Map<String, Serializable> properties =
                securityService.addSystemSubject(new HashMap<>());
        return new QueryRequestImpl(query, properties);
    }

    private QueryImpl filter2query(And filter) {
        final QueryImpl query = new QueryImpl(filter);
        query.setRequestsTotalResultsCount(true);
        return query;
    }

    private Filter metacard2Filter(QueryMetacardImpl queryMetacard) {
        try {
            return ECQL.toFilter(queryMetacard.getCql());
        } catch (CQLException e) {
            LOGGER.warn("Error parsing CQL", e);
            return null;
        }
    }

    private Date getOneDayBack() {
        return Date.from(Instant.now()
                .minus(1, ChronoUnit.DAYS));
    }

    @Override
    public String toString() {
        return "WorkspaceQueryService{" +
                "queryUpdateSubscriber=" + queryUpdateSubscriber +
                ", workspaceService=" + workspaceService +
                ", queryService=" + queryService +
                ", catalogFramework=" + catalogFramework +
                ", filterBuilder=" + filterBuilder +
                ", scheduler=" + scheduler +
                ", securityService=" + securityService +
                ", filterService=" + filterService +
                ", queryTimeoutMinutes=" + queryTimeoutMinutes +
                '}';
    }

    private class QueryTask extends RecursiveTask<Long> {
        private final QueryRequest queryRequest;

        private QueryTask(QueryRequest queryRequest) {
            this.queryRequest = queryRequest;
        }

        @Override
        protected Long compute() {
            try {
                final QueryResponse response = catalogFramework.query(queryRequest);
                return response.getHits();
            } catch (UnsupportedQueryException | FederationException | SourceUnavailableException e) {
                LOGGER.warn("Query error", e);
                return 0L;
            }
        }
    }

    private class WorkspaceTask extends RecursiveTask<Pair<WorkspaceMetacardImpl, Long>> {
        private final WorkspaceMetacardImpl workspaceMetacard;

        private final List<QueryRequest> queryRequests;

        private WorkspaceTask(WorkspaceMetacardImpl workspaceMetacard,
                List<QueryRequest> queryRequests) {
            notNull(workspaceMetacard, "WorkspaceMetacardImpl must be non-null");
            notNull(queryRequests, "queryRequests must be non-null");
            notEmpty(queryRequests, "queryRequests must be non-empty");
            this.workspaceMetacard = workspaceMetacard;
            this.queryRequests = queryRequests;
        }

        @Override
        protected Pair<WorkspaceMetacardImpl, Long> compute() {
            final long result = queryRequests.stream()
                    .map(QueryTask::new)
                    .map(QueryTask::fork)
                    .mapToLong(ForkJoinTask::join)
                    .sum();

            return Pair.of(workspaceMetacard, result);
        }
    }
}
