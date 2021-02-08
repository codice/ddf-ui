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
package org.codice.ddf.catalog.audit.api;

import com.google.common.annotations.VisibleForTesting;
import com.google.gson.annotations.SerializedName;

public class AuditItemBasic {
  @SerializedName("id")
  private String id;

  @SerializedName("source-id")
  private String sourceId;

  private AuditItemBasic() {
    // Implementation not needed
  }

  @VisibleForTesting
  public AuditItemBasic(String id, String sourceId) {
    this.id = id;
    this.sourceId = sourceId;
  }

  public String getId() {
    return id;
  }

  public String getSourceId() {
    return sourceId;
  }
}
