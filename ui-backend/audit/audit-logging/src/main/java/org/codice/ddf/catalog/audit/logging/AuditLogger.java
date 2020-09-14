package org.codice.ddf.catalog.audit.logging;

import ddf.security.audit.SecurityLogger;
import org.codice.ddf.catalog.audit.api.AuditException;
import org.codice.ddf.catalog.audit.api.AuditService;

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
public class AuditLogger implements AuditService {

  private final SecurityLogger securityLogger;

  public AuditLogger(SecurityLogger securityLogger) {
    this.securityLogger = securityLogger;
  }

  @Override
  public void log(String action, String component, String... ids) {
    for (String id : ids) {
      securityLogger.audit("{} a {} with id {}", action, component, id);
    }
  }

  @Override
  public void log(String action, String component) {
    securityLogger.audit("{} a {}", action, component);
  }

  @Override
  public void logError(String action, String component, Throwable cause) throws AuditException {
    securityLogger.audit("{} a {} with error {}", action, component, cause);
  }
}
