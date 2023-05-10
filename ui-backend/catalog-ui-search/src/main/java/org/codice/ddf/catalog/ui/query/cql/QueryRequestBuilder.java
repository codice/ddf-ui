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
package org.codice.ddf.catalog.ui.query.cql;

import static ddf.catalog.Constants.ADDITIONAL_SORT_BYS;

import com.google.common.collect.Sets;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.Result;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.filter.FilterDelegate;
import ddf.catalog.filter.impl.SortByImpl;
import ddf.catalog.operation.Query;
import ddf.catalog.operation.QueryRequest;
import ddf.catalog.operation.impl.FacetedQueryRequest;
import ddf.catalog.operation.impl.QueryImpl;
import ddf.catalog.operation.impl.QueryRequestImpl;
import ddf.catalog.operation.impl.TermFacetPropertiesImpl;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.codice.ddf.catalog.ui.CqlParseException;
import org.codice.ddf.catalog.ui.query.utility.CqlRequest;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.opengis.filter.Filter;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class QueryRequestBuilder {

  private static final Logger LOGGER = LoggerFactory.getLogger(QueryRequestBuilder.class);

  private static final String LOCAL_SOURCE = "local";

  private static final String CACHE_SOURCE = "cache";

  private static final String DEFAULT_SORT_ORDER = "desc";

  private static final String MODE = "mode";

  private static final String UPDATE = "update";

  private final String localSource;

  private final FilterBuilder filterBuilder;

  private final List<CqlRequest.Sort> sorts;

  private final int start;

  private final int count;

  private final long timeout;

  private List<String> srcs = Collections.emptyList();

  private String src;

  private boolean excludeUnnecessaryAttributes = true;

  private boolean fromUI = false;

  private final String id;

  private String batchId;

  private String queryType;

  private Boolean spellcheck;

  private Boolean phonetics;

  private String cacheId;

  private Set<String> facets = Collections.emptySet();

  private final String cql;

  public QueryRequestBuilder(
      String localSource,
      FilterBuilder filterBuilder,
      List<CqlRequest.Sort> sorts,
      int start,
      int count,
      long timeout,
      String id,
      String cql) {
    this.localSource = localSource;
    this.filterBuilder = filterBuilder;
    this.sorts = sorts;
    this.start = start;
    this.count = count;
    this.timeout = timeout;
    this.id = id;
    this.cql = cql;
  }

  public QueryRequestBuilder setSrc(String src) {
    this.src = src;
    return this;
  }

  public QueryRequestBuilder setSources(List<String> srcs) {
    this.srcs = srcs;
    return this;
  }

  public QueryRequestBuilder setExcludeUnnecessaryAttributes(
      boolean isExcludeUnnecessaryAttributes) {
    this.excludeUnnecessaryAttributes = isExcludeUnnecessaryAttributes;
    return this;
  }

  public QueryRequestBuilder setFromUI(boolean fromUI) {
    this.fromUI = fromUI;
    return this;
  }

  public QueryRequestBuilder setBatchId(String batchId) {
    this.batchId = batchId;
    return this;
  }

  public QueryRequestBuilder setQueryType(String queryType) {
    this.queryType = queryType;
    return this;
  }

  public QueryRequestBuilder setSpellcheck(Boolean isSpellcheck) {
    this.spellcheck = isSpellcheck;
    return this;
  }

  public QueryRequestBuilder setPhonetics(Boolean isPhonetics) {
    this.phonetics = isPhonetics;
    return this;
  }

  public QueryRequestBuilder setCacheId(String cacheId) {
    this.cacheId = cacheId;
    return this;
  }

  public QueryRequestBuilder setFacets(Set<String> facets) {
    this.facets = facets;
    return this;
  }

  public QueryRequest build() throws CqlParseException {

    List<SortBy> sortBys =
        sorts == null
            ? new ArrayList<>()
            : sorts
                .stream()
                .filter(
                    s ->
                        StringUtils.isNotEmpty(s.getAttribute())
                            && StringUtils.isNotEmpty(s.getDirection()))
                .map(s -> parseSort(s.getAttribute(), s.getDirection()))
                .collect(Collectors.toList());
    if (sortBys.isEmpty()) {
      sortBys.add(new SortByImpl(Result.TEMPORAL, DEFAULT_SORT_ORDER));
    }
    Query query =
        new QueryImpl(createFilter(filterBuilder), start, count, sortBys.get(0), true, timeout);

    QueryRequest queryRequest;
    if (!CollectionUtils.isEmpty(srcs)) {
      parseSrcs(localSource);
      queryRequest = new QueryRequestImpl(query, srcs);
      queryRequest.getProperties().put(MODE, UPDATE);
    } else {
      String source = parseSrc(localSource);
      if (CACHE_SOURCE.equals(source)) {
        queryRequest = new QueryRequestImpl(query, true);
        queryRequest.getProperties().put(MODE, CACHE_SOURCE);
      } else {
        queryRequest = new QueryRequestImpl(query, Collections.singleton(source));
        queryRequest.getProperties().put(MODE, UPDATE);
      }
    }

    queryRequest = facetQueryRequest(queryRequest);

    if (excludeUnnecessaryAttributes) {
      queryRequest
          .getProperties()
          .put("excludeAttributes", Sets.newHashSet(Metacard.METADATA, "lux"));
    }

    if (sortBys.size() > 1) {
      queryRequest
          .getProperties()
          .put(ADDITIONAL_SORT_BYS, sortBys.subList(1, sortBys.size()).toArray(new SortBy[0]));
    }

    queryRequest.getProperties().put("requestId", id);

    if (StringUtils.isNotEmpty(batchId)) {
      queryRequest.getProperties().put("batchId", batchId);
    }

    if (StringUtils.isNotEmpty(queryType)) {
      queryRequest.getProperties().put("queryType", queryType);
    }

    if (spellcheck != null) {
      queryRequest.getProperties().put("spellcheck", spellcheck);
    }

    if (phonetics != null) {
      queryRequest.getProperties().put("phonetics", phonetics);
    }

    if (cacheId != null) {
      queryRequest.getProperties().put("cacheId", cacheId);
    }

    queryRequest.getProperties().put("fromUI", fromUI);

    return queryRequest;
  }

  private QueryRequest facetQueryRequest(QueryRequest request) {
    if (facets.isEmpty()) {
      return request;
    }

    return new FacetedQueryRequest(
        request.getQuery(),
        request.isEnterprise(),
        request.getSourceIds(),
        request.getProperties(),
        new TermFacetPropertiesImpl(facets));
  }

  private Filter createFilter(FilterBuilder filterBuilder) throws CqlParseException {

    Filter filter;
    try {
      filter = ECQL.toFilter(cql);
    } catch (CQLException e) {
      throw new CqlParseException(e);
    }

    if (filter == null) {
      LOGGER.debug("Received an empty filter. Using a wildcard contextual filter instead.");
      filter =
          filterBuilder.attribute(Metacard.ANY_TEXT).is().like().text(FilterDelegate.WILDCARD_CHAR);
    }

    return filter;
  }

  private String parseSrc(String localSource) {
    if (StringUtils.equalsIgnoreCase(src, LOCAL_SOURCE) || StringUtils.isBlank(src)) {
      src = localSource;
    }

    return src;
  }

  private void parseSrcs(String localSource) {
    for (int i = 0; i < srcs.size(); i++) {
      if (StringUtils.equalsIgnoreCase(srcs.get(i), LOCAL_SOURCE)) {
        srcs.set(i, localSource);
      }
    }
  }

  private SortBy parseSort(String sortField, String sortOrder) {
    SortBy sort;
    switch (sortOrder.toLowerCase(Locale.getDefault())) {
      case "ascending":
      case "asc":
        sort = new SortByImpl(sortField, SortOrder.ASCENDING);
        break;
      case "descending":
      case "desc":
        sort = new SortByImpl(sortField, SortOrder.DESCENDING);
        break;
      default:
        throw new IllegalArgumentException(
            "Incorrect sort order received, must be 'asc', 'ascending', 'desc', or 'descending'");
    }

    return sort;
  }
}
