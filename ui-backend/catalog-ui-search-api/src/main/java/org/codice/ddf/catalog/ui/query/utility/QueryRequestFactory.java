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
package org.codice.ddf.catalog.ui.query.utility;

import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.QueryRequest;
import java.util.List;
import java.util.Set;
import javax.annotation.Nullable;
import org.codice.ddf.catalog.ui.CqlParseException;

/**
 * This is a factory that builds a QueryRequest object based on several query parameters.
 *
 * <p><i>This code is experimental. While this interface is functional and tested, it may change or
 * * be removed in a future version of the library.</i>
 */
public interface QueryRequestFactory {

  QueryRequest build(
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
      boolean fromUI
      // ,@Nullable String notesQueryType
      ) throws CqlParseException;
}
