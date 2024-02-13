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

  private boolean fromUI = false;

  private String notesQueryType;

  @Override
  public String getCacheId() {
    return cacheId;
  }

  @Override
  public void setCacheId(String cacheId) {
    this.cacheId = cacheId;
  }

  @Override
  public Set<String> getFacets() {
    return facets;
  }

  @Override
  public void setFacets(Set<String> facets) {
    this.facets = facets;
  }

  @Override
  public List<String> getSrcs() {
    return srcs;
  }

  @Override
  public String getSrc() {
    return src;
  }

  @Override
  public void setQueryType(String queryType) {
    this.queryType = queryType;
  }

  @Override
  public String getQueryType() {
    return queryType;
  }

  @Override
  public void setBatchId(String batchId) {
    this.batchId = batchId;
  }

  @Override
  public String getBatchId() {
    return batchId;
  }

  @Override
  public void setSpellcheck(boolean spellcheck) {
    this.spellcheck = spellcheck;
  }

  @Override
  public boolean getSpellcheck() {
    return spellcheck;
  }

  @Override
  public void setPhonetics(boolean phonetics) {
    this.phonetics = phonetics;
  }

  @Override
  public boolean getPhonetics() {
    return phonetics;
  }

  @Override
  public void setSrc(String src) {
    this.src = src;
  }

  @Override
  public void setSrcs(List<String> srcs) {
    this.srcs = srcs;
  }

  @Override
  public long getTimeout() {
    return timeout;
  }

  @Override
  public void setTimeout(long timeout) {
    this.timeout = timeout;
  }

  @Override
  public int getStart() {
    return start;
  }

  @Override
  public void setStart(int start) {
    this.start = start;
  }

  @Override
  public int getCount() {
    return count;
  }

  @Override
  public void setCount(int count) {
    this.count = count;
  }

  @Override
  public String getCql() {
    return cql;
  }

  @Override
  public void setCql(String cql) {
    this.cql = cql;
  }

  @Override
  public List<Sort> getSorts() {
    return sorts;
  }

  @Override
  public void setSorts(List<Sort> sorts) {
    this.sorts = sorts;
  }

  @Override
  public boolean isNormalize() {
    return normalize;
  }

  @Override
  public void setNormalize(boolean normalize) {
    this.normalize = normalize;
  }

  @Override
  public void setNotesQueryType(String notesQueryType) {
    this.notesQueryType = notesQueryType;
  }

  @Override
  public String getNotesQueryType() {
    return notesQueryType;
  }

  @Override
  public QueryRequest createQueryRequest(String localSource, FilterBuilder filterBuilder)
      throws CqlParseException {

    QueryRequestBuilder builder =
        new QueryRequestBuilder(localSource, filterBuilder, sorts, start, count, timeout, id, cql);

    if (src != null) {
      builder.setSrc(src);
    }

    if (srcs != null) {
      builder.setSources(srcs);
    }

    builder.setExcludeUnnecessaryAttributes(excludeUnnecessaryAttributes);

    builder.setFromUI(fromUI);

    if (batchId != null) {
      builder.setBatchId(batchId);
    }

    if (queryType != null) {
      builder.setQueryType(queryType);
    }

    builder.setSpellcheck(spellcheck);
    builder.setPhonetics(phonetics);
    builder.setNotesQueryType(notesQueryType);

    if (cacheId != null) {
      builder.setCacheId(cacheId);
    }

    if (facets != null) {
      builder.setFacets(facets);
    }

    return builder.build();
  }

  @Override
  public String getSourceResponseString() {
    if (!CollectionUtils.isEmpty(srcs)) {
      return String.join(", ", srcs);
    } else {
      return src;
    }
  }

  @Override
  public String getSource() {
    return src;
  }

  @Override
  public String getId() {
    return id;
  }

  @Override
  public void setId(String id) {
    this.id = id;
  }

  @Override
  public boolean isExcludeUnnecessaryAttributes() {
    return excludeUnnecessaryAttributes;
  }

  @Override
  public void setExcludeUnnecessaryAttributes(boolean excludeUnnecessaryAttributes) {
    this.excludeUnnecessaryAttributes = excludeUnnecessaryAttributes;
  }

  @Override
  public boolean isFromUI() {
    return fromUI;
  }

  @Override
  public void setFromUI(boolean fromUI) {
    this.fromUI = fromUI;
  }
}
