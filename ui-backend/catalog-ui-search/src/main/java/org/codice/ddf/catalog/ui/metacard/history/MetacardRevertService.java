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
package org.codice.ddf.catalog.ui.metacard.history;

import static ddf.catalog.util.impl.ResultIterable.resultIterable;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.io.ByteSource;
import ddf.catalog.CatalogFramework;
import ddf.catalog.content.data.ContentItem;
import ddf.catalog.content.data.impl.ContentItemImpl;
import ddf.catalog.content.operation.impl.CreateStorageRequestImpl;
import ddf.catalog.content.operation.impl.UpdateStorageRequestImpl;
import ddf.catalog.core.versioning.DeletedMetacard;
import ddf.catalog.core.versioning.MetacardVersion;
import ddf.catalog.core.versioning.MetacardVersion.Action;
import ddf.catalog.core.versioning.impl.MetacardVersionImpl;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.Result;
import ddf.catalog.data.types.Core;
import ddf.catalog.federation.FederationException;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.ResourceResponse;
import ddf.catalog.operation.impl.CreateRequestImpl;
import ddf.catalog.operation.impl.DeleteRequestImpl;
import ddf.catalog.operation.impl.QueryImpl;
import ddf.catalog.operation.impl.QueryRequestImpl;
import ddf.catalog.operation.impl.ResourceRequestById;
import ddf.catalog.operation.impl.UpdateRequestImpl;
import ddf.catalog.resource.ResourceNotFoundException;
import ddf.catalog.resource.ResourceNotSupportedException;
import ddf.catalog.source.IngestException;
import ddf.catalog.source.SourceUnavailableException;
import ddf.catalog.source.UnsupportedQueryException;
import ddf.catalog.util.impl.ResultIterable;
import ddf.security.audit.SecurityLogger;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import javax.ws.rs.NotFoundException;
import org.codice.ddf.catalog.ui.metacard.internal.OperationPropertySupplier;
import org.opengis.filter.Filter;
import org.opengis.filter.sort.SortBy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MetacardRevertService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MetacardRevertService.class);

  private static final String ISO_8601_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";

  private static final int PAGE_SIZE = 250;

  private static final Set<Action> DELETE_ACTIONS =
      ImmutableSet.of(Action.DELETED, Action.DELETED_CONTENT);

  private static final Set<Action> CONTENT_ACTIONS =
      ImmutableSet.of(Action.VERSIONED_CONTENT, Action.DELETED_CONTENT);

  private final CatalogFramework catalogFramework;

  private final FilterBuilder filterBuilder;

  private OperationPropertySupplier operationPropertySupplier;

  private SecurityLogger securityLogger;

  public MetacardRevertService(CatalogFramework catalogFramework, FilterBuilder filterBuilder) {
    this.catalogFramework = catalogFramework;
    this.filterBuilder = filterBuilder;
  }

  public void addOperationPropertySupplier(OperationPropertySupplier operationPropertySupplier) {
    this.operationPropertySupplier = operationPropertySupplier;
  }

  public void removeOperationPropertySupplier(OperationPropertySupplier operationPropertySupplier) {
    this.operationPropertySupplier = null;
  }

  public Metacard revert(String id, String revertId, String storeId)
      throws UnsupportedQueryException, SourceUnavailableException, FederationException,
          IngestException, ResourceNotFoundException, IOException, ResourceNotSupportedException {
    try {
      Map<String, Serializable> properties =
          operationPropertySupplier == null
              ? new HashMap<>()
              : operationPropertySupplier.properties(OperationPropertySupplier.QUERY_TYPE);

      Metacard versionMetacard = getMetacardById(revertId, properties);

      List<Result> queryResponse = getMetacardHistory(id, storeId);
      if (queryResponse.isEmpty()) {
        throw new NotFoundException("Could not find metacard with id: " + id);
      }

      Optional<Metacard> contentVersion =
          queryResponse
              .stream()
              .map(Result::getMetacard)
              .filter(
                  mc ->
                      getVersionedOnDate(mc).isAfter(getVersionedOnDate(versionMetacard))
                          || getVersionedOnDate(mc).equals(getVersionedOnDate(versionMetacard)))
              .filter(mc -> CONTENT_ACTIONS.contains(Action.ofMetacard(mc)))
              .filter(mc -> mc.getResourceURI() != null)
              .filter(mc -> ContentItem.CONTENT_SCHEME.equals(mc.getResourceURI().getScheme()))
              .min(
                  Comparator.comparing(
                      mc -> parseToDate(mc.getAttribute(MetacardVersion.VERSIONED_ON).getValue())));

      if (!contentVersion.isPresent()) {
        /* no content versions, just restore metacard */
        revertMetacard(versionMetacard, id, false);
      } else {
        revertContentandMetacard(contentVersion.get(), versionMetacard, id);
      }

      securityLogger.audit("Reverted {} to metacard {}", revertId, id);

      return versionMetacard;
    } catch (UnsupportedQueryException
        | SourceUnavailableException
        | FederationException
        | IngestException
        | ResourceNotFoundException
        | IOException
        | ResourceNotSupportedException e) {
      securityLogger.audit("Failed to revert {} to metcard {}", revertId, id, e);
      throw e;
    }
  }

  public List<Result> getMetacardHistory(String id, String sourceId) {
    Map<String, Serializable> properties =
        operationPropertySupplier == null
            ? new HashMap<>()
            : operationPropertySupplier.properties(OperationPropertySupplier.QUERY_TYPE);

    Filter historyFilter =
        filterBuilder.attribute(Metacard.TAGS).is().equalTo().text(MetacardVersion.VERSION_TAG);
    Filter idFilter =
        filterBuilder.attribute(MetacardVersion.VERSION_OF_ID).is().equalTo().text(id);

    Filter filter = filterBuilder.allOf(historyFilter, idFilter);
    Set<String> sources = sourceId != null ? Collections.singleton(sourceId) : null;
    ResultIterable resultIterable =
        resultIterable(
            catalogFramework,
            new QueryRequestImpl(
                new QueryImpl(
                    filter,
                    1,
                    PAGE_SIZE,
                    SortBy.NATURAL_ORDER,
                    false,
                    TimeUnit.SECONDS.toMillis(10)),
                false,
                sources,
                properties));
    return Lists.newArrayList(resultIterable);
  }

  private void revertMetacard(Metacard versionMetacard, String id, boolean alreadyCreated)
      throws SourceUnavailableException, IngestException {
    LOGGER.trace("Reverting metacard [{}] to version [{}]", id, versionMetacard.getId());
    Metacard revertMetacard = MetacardVersionImpl.toMetacard(versionMetacard);
    Action action =
        Action.fromKey((String) versionMetacard.getAttribute(MetacardVersion.ACTION).getValue());

    if (DELETE_ACTIONS.contains(action)) {
      attemptDeleteDeletedMetacard(id);
      if (!alreadyCreated) {
        Map<String, Serializable> properties =
            operationPropertySupplier == null
                ? new HashMap<>()
                : operationPropertySupplier.properties(OperationPropertySupplier.CREATE_TYPE);

        catalogFramework.create(
            new CreateRequestImpl(Collections.singletonList(revertMetacard), properties));
      }
    } else {
      tryUpdate(
          4,
          () -> {
            catalogFramework.update(new UpdateRequestImpl(id, revertMetacard));
            return true;
          });
    }
  }

  private void revertContentandMetacard(Metacard latestContent, Metacard versionMetacard, String id)
      throws SourceUnavailableException, IngestException, ResourceNotFoundException, IOException,
          ResourceNotSupportedException {
    LOGGER.trace(
        "Reverting content and metacard for metacard [{}]. \nLatest content: [{}] \nVersion metacard: [{}]",
        id,
        latestContent.getId(),
        versionMetacard.getId());
    Map<String, Serializable> properties = new HashMap<>();
    properties.put("no-default-tags", true);
    ResourceResponse latestResource =
        catalogFramework.getLocalResource(
            new ResourceRequestById(latestContent.getId(), properties));

    ContentItemImpl contentItem =
        new ContentItemImpl(
            id,
            new ByteSourceWrapper(() -> latestResource.getResource().getInputStream()),
            latestResource.getResource().getMimeTypeValue(),
            latestResource.getResource().getName(),
            latestResource.getResource().getSize(),
            MetacardVersionImpl.toMetacard(versionMetacard));

    // Try to delete the "deleted metacard" marker first.
    boolean alreadyCreated = false;
    Action action =
        Action.fromKey((String) versionMetacard.getAttribute(MetacardVersion.ACTION).getValue());
    if (DELETE_ACTIONS.contains(action)) {
      alreadyCreated = true;
      catalogFramework.create(
          new CreateStorageRequestImpl(
              Collections.singletonList(contentItem), id, new HashMap<>()));
    } else {
      // Currently we can't guarantee the metacard will exist yet because of the 1
      // second
      // soft commit in solr. this busy wait loop should be fixed when alternate
      // solution
      // is found.
      tryUpdate(
          4,
          () -> {
            catalogFramework.update(
                new UpdateStorageRequestImpl(
                    Collections.singletonList(contentItem), id, new HashMap<>()));
            return true;
          });
    }
    LOGGER.trace("Successfully reverted metacard content for [{}]", id);
    revertMetacard(versionMetacard, id, alreadyCreated);
  }

  private Metacard getMetacardById(String id, Map<String, Serializable> properties)
      throws UnsupportedQueryException, SourceUnavailableException, FederationException {
    Filter idFilter = filterBuilder.attribute(Core.ID).is().equalTo().text(id);
    Filter tagsFilter = filterBuilder.attribute(Core.METACARD_TAGS).is().like().text("*");
    Filter filter = filterBuilder.allOf(idFilter, tagsFilter);

    QueryResponse queryResponse =
        catalogFramework.query(
            new QueryRequestImpl(new QueryImpl(filter), false, null, properties));

    if (queryResponse.getResults().isEmpty()) {
      throw new NotFoundException("Could not find metacard for id: " + id);
    }

    Result result = queryResponse.getResults().get(0);

    return result.getMetacard();
  }

  private Instant parseToDate(Serializable value) {
    if (value instanceof Instant) {
      return ((Instant) value);
    }
    if (value instanceof Date) {
      return ((Date) value).toInstant();
    }
    SimpleDateFormat dateFormat = new SimpleDateFormat(ISO_8601_DATE_FORMAT);
    dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
    try {
      return dateFormat.parse(value.toString()).toInstant();
    } catch (ParseException e) {
      throw new IllegalArgumentException(e);
    }
  }

  private void attemptDeleteDeletedMetacard(String id) {
    LOGGER.trace("Attemping to delete metacard [{}]", id);
    Filter tags =
        filterBuilder.attribute(Metacard.TAGS).is().like().text(DeletedMetacard.DELETED_TAG);
    Filter deletion =
        filterBuilder.attribute(DeletedMetacard.DELETION_OF_ID).is().equalTo().text(id);
    Filter filter = filterBuilder.allOf(tags, deletion);

    Map<String, Serializable> properties =
        operationPropertySupplier == null
            ? new HashMap<>()
            : operationPropertySupplier.properties(OperationPropertySupplier.QUERY_TYPE);

    QueryResponse response = null;
    try {
      response =
          catalogFramework.query(
              new QueryRequestImpl(new QueryImpl(filter), false, null, properties));
    } catch (UnsupportedQueryException | SourceUnavailableException | FederationException e) {
      LOGGER.debug("Could not find the deleted metacard marker to delete", e);
    }

    if (response == null || response.getResults() == null || response.getResults().size() != 1) {
      LOGGER.debug("There should have been one deleted metacard marker");
      return;
    }

    final DeleteRequestImpl deleteRequest =
        new DeleteRequestImpl(response.getResults().get(0).getMetacard().getId());
    deleteRequest.getProperties().put("operation.query-tags", ImmutableSet.of("*"));
    try {
      catalogFramework.delete(deleteRequest);
    } catch (IngestException | SourceUnavailableException e) {
      LOGGER.debug("Could not delete the deleted metacard marker", e);
    }
    LOGGER.trace("Deleted delete marker metacard successfully");
  }

  private void tryUpdate(int retries, Callable<Boolean> func) throws IngestException {
    if (retries <= 0) {
      throw new IngestException("Could not update metacard!");
    }
    LOGGER.trace("Trying to update metacard.");
    try {
      func.call();
      LOGGER.trace("Successfully updated metacard.");
    } catch (Exception e) {
      LOGGER.trace("Failed to update metacard");
      trySleep();
      tryUpdate(retries - 1, func);
    }
  }

  private void trySleep() {
    try {
      Thread.sleep(350);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  private Instant getVersionedOnDate(Metacard mc) {
    return parseToDate(mc.getAttribute(MetacardVersion.VERSIONED_ON).getValue());
  }

  public void setSecurityLogger(SecurityLogger securityLogger) {
    this.securityLogger = securityLogger;
  }

  private static class ByteSourceWrapper extends ByteSource {
    Supplier<InputStream> supplier;

    ByteSourceWrapper(Supplier<InputStream> supplier) {
      this.supplier = supplier;
    }

    @Override
    public InputStream openStream() {
      return supplier.get();
    }
  }
}
