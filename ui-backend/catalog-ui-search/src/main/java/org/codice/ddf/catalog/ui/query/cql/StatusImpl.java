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
import ddf.catalog.operation.QueryResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.codice.ddf.catalog.ui.query.utility.Status;

public class StatusImpl implements Status {

  private final long hits;

  private final long count;

  private final long elapsed;

  private final String id;

  private final boolean successful;

  private List<String> warnings = new ArrayList<>();

  private List<String> errors = new ArrayList<>();

  public StatusImpl(QueryResponse response, String source, long elapsedTime) {
    elapsed = elapsedTime;
    id = source;

    count = response.getResults().size();
    hits = response.getHits();
    successful = isSuccessful(response.getProcessingDetails());
    warnings = getWarnings(response.getProcessingDetails());
    errors = getErrors(response.getProcessingDetails());
  }

  public StatusImpl(
      String source, long count, long elapsedTime, long hits, Set<ProcessingDetails> details) {
    this.id = source;
    this.count = count;
    this.hits = hits;
    this.elapsed = elapsedTime;
    this.successful = isSuccessful(details);
    this.warnings = getWarnings(details);
    this.errors = getErrors(details);
  }

  private boolean isSuccessful(final Set<ProcessingDetails> details) {
    for (ProcessingDetails detail : details) {
      if (detail.hasException()) {
        return false;
      }
    }
    return true;
  }

  private List<String> getWarnings(final Set<ProcessingDetails> details) {
    return details
        .stream()
        .filter(detail -> !detail.hasException())
        .map(detail -> detail.getWarnings())
        .flatMap(procesingWarnings -> procesingWarnings.stream())
        .collect(Collectors.toList());
  }

  private List<String> getErrors(final Set<ProcessingDetails> details) {
    return details
        .stream()
        .filter(detail -> detail.hasException())
        .map(detail -> detail.getWarnings())
        .flatMap(procesingWarnings -> procesingWarnings.stream())
        .collect(Collectors.toList());
  }

  public long getHits() {
    return hits;
  }

  public long getElapsed() {
    return elapsed;
  }

  public String getId() {
    return id;
  }

  public long getCount() {
    return count;
  }

  public boolean getSuccessful() {
    return successful;
  }
}
