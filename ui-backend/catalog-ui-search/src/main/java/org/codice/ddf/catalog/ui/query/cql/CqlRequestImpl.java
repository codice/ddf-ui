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

import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.QueryRequest;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.apache.commons.collections4.CollectionUtils;
import org.codice.ddf.catalog.ui.CqlParseException;
import org.codice.ddf.catalog.ui.query.utility.CqlRequest;

public class CqlRequestImpl implements CqlRequest {

  private String id;

  private String src;

  private List<String> srcs = Collections.emptyList();

  private long timeout = 300000L;

  private int start = 1;

  private int count = 10;

  private String cql;

  private String queryType;

  private String batchId;

  private Boolean spellcheck;

  private Boolean phonetics;

  private String cacheId;

  private List<Sort> sorts = Collections.emptyList();

  private Set<String> facets = Collections.emptySet();

  private boolean normalize = false;

  private boolean excludeUnnecessaryAttributes = true;

  public String getCacheId() {
    return cacheId;
  }

  public void setCacheId(String cacheId) {
    this.cacheId = cacheId;
  }

  public Set<String> getFacets() {
    return facets;
  }

  public void setFacets(Set<String> facets) {
    this.facets = facets;
  }

  public List<String> getSrcs() {
    return srcs;
  }

  public String getSrc() {
    return src;
  }

  public void setQueryType(String queryType) {
    this.queryType = queryType;
  }

  public String getQueryType() {
    return queryType;
  }

  public void setBatchId(String batchId) {
    this.batchId = batchId;
  }

  public String getBatchId() {
    return batchId;
  }

  public void setSpellcheck(boolean spellcheck) {
    this.spellcheck = spellcheck;
  }

  public boolean getSpellcheck() {
    return spellcheck;
  }

  public void setPhonetics(boolean phonetics) {
    this.phonetics = phonetics;
  }

  public boolean getPhonetics() {
    return phonetics;
  }

  public void setSrc(String src) {
    this.src = src;
  }

  public void setSrcs(List<String> srcs) {
    this.srcs = srcs;
  }

  public long getTimeout() {
    return timeout;
  }

  public void setTimeout(long timeout) {
    this.timeout = timeout;
  }

  public int getStart() {
    return start;
  }

  public void setStart(int start) {
    this.start = start;
  }

  public int getCount() {
    return count;
  }

  public void setCount(int count) {
    this.count = count;
  }

  public String getCql() {
    return cql;
  }

  public void setCql(String cql) {
    this.cql = cql;
  }

  public List<Sort> getSorts() {
    return sorts;
  }

  public void setSorts(List<Sort> sorts) {
    this.sorts = sorts;
  }

  public boolean isNormalize() {
    return normalize;
  }

  public void setNormalize(boolean normalize) {
    this.normalize = normalize;
  }

  @Override
  public QueryRequest createQueryRequest(String localSource, FilterBuilder filterBuilder)
      throws CqlParseException {

    QueryRequestBuilder builder =
        new QueryRequestBuilder(localSource, filterBuilder, sorts, start, count, timeout, id, cql);

    QueryRequest queryRequest;
    if (CollectionUtils.isNotEmpty(srcs) && srcs.size() > 1) {
      if (srcs.stream().anyMatch(CACHE_SOURCE::equals)) {
        throw new RuntimeException(
            "If a cache source is provided, it must be the only source provided.");
      }
      parseSrcs(localSource);
      queryRequest = new QueryRequestImpl(query, srcs);
      queryRequest.getProperties().put(MODE, UPDATE);
    } else {
      if (CollectionUtils.isNotEmpty(srcs) && srcs.size() == 1) {
        src = srcs.get(0);
      }
      // if `src` is blank or 'local', replace with the given parameter.
      String source = replaceOrDefaultLocalSource(localSource);
      if (CACHE_SOURCE.equals(source)) {
        queryRequest = new QueryRequestImpl(query, true);
        queryRequest.getProperties().put(MODE, CACHE_SOURCE);
      } else {
        queryRequest = new QueryRequestImpl(query, Collections.singleton(source));
        queryRequest.getProperties().put(MODE, UPDATE);
      }
    }
    
    if (src != null) {
      builder.setSrc(src);
    }

    if (srcs != null) {
      builder.setSources(srcs);
    }

    builder.setExcludeUnnecessaryAttributes(excludeUnnecessaryAttributes);

    if (batchId != null) {
      builder.setBatchId(batchId);
    }

    if (queryType != null) {
      builder.setQueryType(queryType);
    }

    builder.setSpellcheck(spellcheck);
    builder.setPhonetics(phonetics);

    if (cacheId != null) {
      builder.setCacheId(cacheId);
    }

    if (facets != null) {
      builder.setFacets(facets);
    }

    return builder.build();
  }

  private String replaceOrDefaultLocalSource(String localSource) {
    if (StringUtils.equalsIgnoreCase(src, LOCAL_SOURCE) || StringUtils.isBlank(src)) {
      src = localSource;
    }

    return src;
  }

  /**
   * Replace any src in the list of `srcs` that are equal to `local` with the actual local source
   * name.
   *
   * @param localSource The real local source name to use.
   */
  private void parseSrcs(String localSource) {
    for (int i = 0; i < srcs.size(); i++) {
      if (StringUtils.equalsIgnoreCase(srcs.get(i), LOCAL_SOURCE)) {
        srcs.set(i, localSource);
      }
    }
  }

  @Override
  public String getSourceResponseString() {
    if (!CollectionUtils.isEmpty(srcs)) {
      return String.join(", ", srcs);
    } else {
      return src;
    }
  }

  public String getSource() {
    return src;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public boolean isExcludeUnnecessaryAttributes() {
    return excludeUnnecessaryAttributes;
  }

  public void setExcludeUnnecessaryAttributes(boolean excludeUnnecessaryAttributes) {
    this.excludeUnnecessaryAttributes = excludeUnnecessaryAttributes;
  }
}
