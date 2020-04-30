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

import ddf.catalog.operation.ProcessingDetails;
import ddf.catalog.operation.impl.ProcessingDetailsImpl;
import ddf.catalog.security.SourceWarningsFilter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * A {@code SourceWarningsFilterManager} {@linkplain #filterWarningsOf(ProcessingDetails) filters
 * the {@code warnings} of} {@link ProcessingDetails} with the {@linkplain
 * #getBestCompatibleFilterFor(ProcessingDetails) best compatible} {@link SourceWarningsFilter} in
 * its {@code filters}} such that the {@link ProcessingDetails} only contain {@code warnings} which
 * the {@link SourceWarningsFilter} deems useful to the user.
 */
public class SourceWarningsFilterManager {

  private final List<SourceWarningsFilter> filters;

  public SourceWarningsFilterManager(List<SourceWarningsFilter> filters) {
    if (filters == null) {
      throw new IllegalArgumentException(
          "the constructor of SourceWarningsFilterManager received a null List of Filters");
    }

    this.filters = filters;
  }

  public ProcessingDetails filterWarningsOf(ProcessingDetails processingDetails) {
    if (!canInspect(processingDetails)) {
      return new ProcessingDetailsImpl();
    }

    return getBestCompatibleFilterFor(processingDetails)
        .map(bestFilter -> bestFilter.filter(processingDetails))
        .orElse(new ProcessingDetailsImpl());
  }

  private boolean canInspect(ProcessingDetails processingDetails) {
    return processingDetails != null && !filters.isEmpty();
  }

  private Optional<SourceWarningsFilter> getBestCompatibleFilterFor(
      ProcessingDetails processingDetails) {
    return filters
        .stream()
        .filter(Objects::nonNull)
        .filter(filter -> filter.canFilter(processingDetails))
        .findFirst();
  }
}
