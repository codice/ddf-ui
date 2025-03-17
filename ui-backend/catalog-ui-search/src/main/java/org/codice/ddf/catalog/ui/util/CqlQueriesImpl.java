/**
 * Copyright (c) Codice Foundation
 *
 * <p>This is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 3 of
 * the License, or any later version.
 *
 * <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public
 * License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.catalog.ui.util;

import static ddf.catalog.Constants.QUERY_LOGGER_NAME;
import static ddf.catalog.impl.operations.QueryOperations.QM_DO_QUERY;
import static ddf.catalog.impl.operations.QueryOperations.QM_POST_QUERY;
import static ddf.catalog.impl.operations.QueryOperations.QM_PRE_QUERY;
import static ddf.catalog.impl.operations.QueryOperations.QM_TIMED_SOURCE;
import static ddf.catalog.impl.operations.QueryOperations.QM_TOTAL_ELAPSED;
import static java.time.ZoneOffset.UTC;
import static java.time.format.DateTimeFormatter.ISO_DATE_TIME;

import com.google.common.base.Stopwatch;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import ddf.action.ActionRegistry;
import ddf.catalog.CatalogFramework;
import ddf.catalog.data.Result;
import ddf.catalog.federation.FederationException;
import ddf.catalog.filter.FilterAdapter;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.ProcessingDetails;
import ddf.catalog.operation.QueryRequest;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.impl.QueryResponseImpl;
import ddf.catalog.source.SourceUnavailableException;
import ddf.catalog.source.UnsupportedQueryException;
import ddf.catalog.util.impl.QueryFunction;
import ddf.catalog.util.impl.ResultIterable;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.codice.ddf.catalog.ui.CqlParseException;
import org.codice.ddf.catalog.ui.metacard.transformer.CsvTransformImpl;
import org.codice.ddf.catalog.ui.query.cql.CqlQueryResponseImpl;
import org.codice.ddf.catalog.ui.query.cql.CqlRequestImpl;
import org.codice.ddf.catalog.ui.query.cql.StatusImpl;
import org.codice.ddf.catalog.ui.query.utility.CqlQueries;
import org.codice.ddf.catalog.ui.query.utility.CqlQueryResponse;
import org.codice.ddf.catalog.ui.query.utility.CqlRequest;
import org.codice.ddf.catalog.ui.query.utility.CsvTransform;
import org.codice.ddf.catalog.ui.query.utility.Status;
import org.codice.ddf.catalog.ui.transformer.TransformerDescriptors;
import org.codice.gsonsupport.GsonTypeAdapters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CqlQueriesImpl implements CqlQueries {

  private static final Logger QUERY_LOGGER = LoggerFactory.getLogger(QUERY_LOGGER_NAME);

  private final CatalogFramework catalogFramework;

  private final FilterBuilder filterBuilder;

  private TransformerDescriptors descriptors;

  private ActionRegistry actionRegistry;

  private FilterAdapter filterAdapter;

  private static final String METRICS_SOURCE_ELAPSED_PREFIX = "metrics.source.elapsed.";

  private static final String CACHE_SOURCES_KEY = "cache-sources";

  private static final Gson GSON =
      new GsonBuilder()
          .disableHtmlEscaping()
          .serializeNulls()
          .registerTypeAdapterFactory(GsonTypeAdapters.LongDoubleTypeAdapter.FACTORY)
          .registerTypeAdapter(Date.class, new GsonTypeAdapters.DateLongFormatTypeAdapter())
          .create();

  public CqlQueriesImpl(
      CatalogFramework catalogFramework,
      FilterBuilder filterBuilder,
      FilterAdapter filterAdapter,
      ActionRegistry actionRegistry) {
    this.catalogFramework = catalogFramework;
    this.filterBuilder = filterBuilder;
    this.filterAdapter = filterAdapter;
    this.actionRegistry = actionRegistry;
  }

  @Override
  public CqlQueryResponse executeCqlQuery(CqlRequest cqlRequest)
      throws UnsupportedQueryException, SourceUnavailableException, FederationException,
          CqlParseException {
    long start = System.nanoTime();
    String startTime = (new Date()).toInstant().atOffset(UTC).format(ISO_DATE_TIME);
    QueryRequest request = cqlRequest.createQueryRequest(catalogFramework.getId(), filterBuilder);
    Stopwatch stopwatch = Stopwatch.createStarted();

    List<QueryResponse> responses = Collections.synchronizedList(new ArrayList<>());

    List<Result> results;
    if (cqlRequest.getCount() == 0) {
      results = retrieveHitCount(request, responses);
    } else {
      results = retrieveResults(cqlRequest, request, responses);
    }

    final List<String> sourceIds = new ArrayList<>();
    if (request.getSourceIds() != null) {
      sourceIds.addAll(request.getSourceIds());
    }

    final Map<String, Serializable> properties =
        responses
            .stream()
            .filter(Objects::nonNull)
            .map(QueryResponse::getProperties)
            .findFirst()
            .orElse(Collections.emptyMap());

    stopwatch.stop();

    final Set<ProcessingDetails> processingDetails =
        responses
            .stream()
            .filter(Objects::nonNull)
            .map(QueryResponse::getProcessingDetails)
            .reduce(
                new HashSet<>(),
                (l, r) -> {
                  l.addAll(r);
                  return l;
                });

    Map<String, Status> statusBySource = new HashMap<>();

    final long totalElapsedtime = stopwatch.elapsed(TimeUnit.MILLISECONDS);

    // If only one source was provided, construct the status dynamically. Otherwise, use the
    // properties.
    if (sourceIds.size() <= 1) {
      final String id = sourceIds.size() == 1 ? sourceIds.get(0) : "cache";
      statusBySource.put(
          id,
          new StatusImpl(
              id, results.size(), totalElapsedtime, responses.get(0).getHits(), processingDetails));
    } else {
      Map<String, Long> hitsPerSource =
          (Map<String, Long>) properties.getOrDefault("hitsPerSource", new HashMap<String, Long>());

      Map<String, Long> elapsedPerSource = new HashMap<>();
      properties.forEach(
          (key, value) -> {
            if (key.startsWith(METRICS_SOURCE_ELAPSED_PREFIX)) {
              String source = key.substring(METRICS_SOURCE_ELAPSED_PREFIX.length());
              if (value instanceof Integer) {
                elapsedPerSource.put(source, new Long((Integer) value));
              }
            }
          });

      Map<String, Long> countPerSource = new HashMap<>();
      sourceIds.forEach(id -> countPerSource.put(id, 0L));
      results
          .stream()
          .map(Result::getMetacard)
          .forEach(
              metacard -> {
                final String sourceId = (String) metacard.getSourceId();
                countPerSource.merge(sourceId, 1L, Long::sum);
              });

      for (int i = 0; i < sourceIds.size(); i++) {
        final String id = sourceIds.get(i);
        long elapsed = elapsedPerSource.getOrDefault(id, 0L);
        long count = countPerSource.getOrDefault(id, 0L);
        long hits = hitsPerSource.getOrDefault(id, 0L);
        statusBySource.put(id, new StatusImpl(id, count, elapsed, hits, processingDetails));
      }
    }

    properties.put("statusBySource", (Serializable) statusBySource);

    QueryResponse response =
        new QueryResponseImpl(
            request,
            results,
            true,
            responses
                .stream()
                .filter(Objects::nonNull)
                .map(QueryResponse::getHits)
                .findFirst()
                .orElse(-1L),
            properties,
            processingDetails);

    response.getProperties().put("start-time", startTime);
    response.getProperties().put(QM_TOTAL_ELAPSED, System.nanoTime() - start);
    QUERY_LOGGER.info("QueryMetrics: {}", getQueryMetricsLog(response));

    return new CqlQueryResponseImpl(
        cqlRequest.getId(),
        request,
        response,
        cqlRequest.getSourceResponseString(),
        cqlRequest.isNormalize(),
        filterAdapter,
        actionRegistry,
        descriptors);
  }

  protected static Map<String, Serializable> collectQueryProperties(
      Map<String, Serializable> requestProps, Map<String, Serializable> responseProps) {
    Map<String, Serializable> allProperties = new HashMap<>();
    if (requestProps != null) {
      allProperties.putAll(requestProps);
    }
    if (responseProps != null) {
      allProperties.putAll(responseProps);
    }
    return allProperties;
  }

  protected static String getQueryMetricsLog(QueryResponse queryResponse) {
    Map<String, Serializable> requestProperties =
        queryResponse.getRequest() == null ? null : queryResponse.getRequest().getProperties();
    Map<String, Serializable> properties =
        collectQueryProperties(requestProperties, queryResponse.getProperties());
    Map<String, Serializable> metricsMap = new HashMap<>();
    // Combine the request and response metrics to log
    metricsMap.put("start-time", properties.get("start-time"));
    metricsMap.put("total-duration", properties.get(QM_TOTAL_ELAPSED));
    metricsMap.put("prequery-duration", properties.get(QM_PRE_QUERY));
    metricsMap.put("query-duration", properties.get(QM_DO_QUERY));
    metricsMap.put("postquery-duration", properties.get(QM_POST_QUERY));
    HashMap<String, Serializable> sourceDurationMap = new HashMap<>();
    properties
        .entrySet()
        .stream()
        .filter(e -> e.getKey() != null && e.getKey().startsWith(QM_TIMED_SOURCE))
        .forEach(e -> sourceDurationMap.put(e.getKey().split(QM_TIMED_SOURCE)[1], e.getValue()));
    Serializable cacheSourceValue = sourceDurationMap.remove("cache");
    if (cacheSourceValue != null) {
      String sourceName = (String) properties.get(CACHE_SOURCES_KEY);
      sourceDurationMap.put(sourceName == null ? "Unknown Source" : sourceName, cacheSourceValue);
    }
    metricsMap.put("source-duration", sourceDurationMap);
    HashMap<String, Serializable> additionalQueryMetrics =
        (HashMap<String, Serializable>) properties.get("additional-query-metrics");
    if (additionalQueryMetrics != null) {
      metricsMap.putAll(additionalQueryMetrics);
    }

    Gson gson = new GsonBuilder().disableHtmlEscaping().create();
    return gson.toJson(metricsMap);
  }

  private List<Result> retrieveHitCount(QueryRequest request, List<QueryResponse> responses)
      throws UnsupportedQueryException, SourceUnavailableException, FederationException {
    QueryResponse queryResponse = catalogFramework.query(request);
    responses.add(queryResponse);
    return queryResponse.getResults();
  }

  /**
   * @param cqlRequest CQL Request (only used for count)
   * @param request Catalog Query Request
   * @param responses List of responses to append to.
   * @return A ResultIterable of results, additionally adding the query response to a mutatable list
   *     for additiol context as we query.
   */
  private List<Result> retrieveResults(
      CqlRequest cqlRequest, QueryRequest request, List<QueryResponse> responses) {
    QueryFunction queryFunction =
        (queryRequest) -> {
          QueryResponse queryResponse = catalogFramework.query(queryRequest);
          responses.add(queryResponse);
          return queryResponse;
        };
    return ResultIterable.resultIterable(queryFunction, request, cqlRequest.getCount())
        .stream()
        .collect(Collectors.toList());
  }

  @Override
  public CqlRequest getCqlRequestFromJson(String jsonBody) {
    return GSON.fromJson(jsonBody, CqlRequestImpl.class);
  }

  @Override
  public CsvTransform getCsvTransformFromJson(String jsonBody) {
    return GSON.fromJson(jsonBody, CsvTransformImpl.class);
  }

  @SuppressWarnings("WeakerAccess" /* setter must be public for blueprint access */)
  public void setDescriptors(TransformerDescriptors descriptors) {
    this.descriptors = descriptors;
  }
}
