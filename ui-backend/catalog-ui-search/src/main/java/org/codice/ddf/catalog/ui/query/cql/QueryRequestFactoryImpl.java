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
import java.util.List;
import java.util.Set;
import javax.annotation.Nullable;
import org.codice.ddf.catalog.ui.CqlParseException;
import org.codice.ddf.catalog.ui.query.utility.CqlRequest;
import org.codice.ddf.catalog.ui.query.utility.QueryRequestFactory;

public class QueryRequestFactoryImpl implements QueryRequestFactory {
  @Override
  public QueryRequest build(
      String localSource,
      FilterBuilder filterBuilder,
      List<CqlRequest.Sort> sorts,
      int start,
      int count,
      long timeout,
      String id,
      String cql,
      @Nullable String src,
      @Nullable List<String> srcs,
      boolean isExcludeUnnecessaryAttribute,
      @Nullable String batchId,
      @Nullable String queryType,
      boolean isSpellcheck,
      boolean isPhonetics,
      @Nullable String cacheId,
      @Nullable Set<String> facets,
      boolean fromUI)
      throws CqlParseException {

    QueryRequestBuilder builder =
        new QueryRequestBuilder(localSource, filterBuilder, sorts, start, count, timeout, id, cql);

    if (src != null) {
      builder.setSrc(src);
    }

    if (srcs != null) {
      builder.setSources(srcs);
    }

    builder.setExcludeUnnecessaryAttributes(isExcludeUnnecessaryAttribute);

    builder.setFromUI(fromUI);

    if (batchId != null) {
      builder.setBatchId(batchId);
    }

    if (queryType != null) {
      builder.setQueryType(queryType);
    }

    builder.setSpellcheck(isSpellcheck);
    builder.setPhonetics(isPhonetics);

    if (cacheId != null) {
      builder.setCacheId(cacheId);
    }

    if (facets != null) {
      builder.setFacets(facets);
    }

    return builder.build();
  }
}
