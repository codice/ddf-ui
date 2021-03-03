/*
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

import com.google.gson.annotations.SerializedName;
import java.util.Set;

public class AuditRequestBasic {

  @SerializedName("action")
  private String action;

  @SerializedName("component")
  private String component;

  @SerializedName("ids")
  private Set<String> ids;

  public AuditRequestBasic() {
    // implementation not needed
  }

  public AuditRequestBasic(Set<String> ids, String component, String action) {
    this.ids = ids;
    this.component = component;
    this.action = action;
  }

  public String getAction() {
    return action;
  }

  public String getComponent() {
    return component;
  }

  public Set<String> getIds() {
    return ids;
  }
}
