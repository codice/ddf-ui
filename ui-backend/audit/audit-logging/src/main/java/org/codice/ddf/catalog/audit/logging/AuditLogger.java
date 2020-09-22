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
package org.codice.ddf.catalog.audit.logging;

import ddf.security.audit.SecurityLogger;
import org.apache.commons.lang.StringUtils;
import org.codice.ddf.catalog.audit.api.AuditException;
import org.codice.ddf.catalog.audit.api.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuditLogger implements AuditService {

  private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogger.class);
  private final SecurityLogger securityLogger;
  private static final String INVALID_PARAM_MSG =
      "Invalid parameters: Parameters should not be null nor empty.";

  public AuditLogger(SecurityLogger securityLogger) {
    this.securityLogger = securityLogger;
  }

  @Override
  public void log(String action, String component, String... ids) throws AuditException {
    if (!isValidStrings(action) || !isValidStrings(component) || !isValidStrings(ids)) {
      LOGGER.trace(
          "Invalid parameters, request: action {}, component {}, ids {}.", action, component, ids);
      throw new AuditException(INVALID_PARAM_MSG);
    }

    for (String id : ids) {
      securityLogger.audit("{} a {} with id {}", action, component, id);
    }
  }

  @Override
  public void log(String action, String component) throws AuditException {
    if (!isValidStrings(action) || !isValidStrings(component)) {
      LOGGER.trace("Invalid parameters, request: action {}, component {}.", action, component);
      throw new AuditException(INVALID_PARAM_MSG);
    }

    securityLogger.audit("{} a {}", action, component);
  }

  @Override
  public void logError(String action, String component, Throwable cause) throws AuditException {
    if (!isValidStrings(action) || !isValidStrings(component)) {
      LOGGER.trace("Invalid parameters, request: action {}, component {}.", action, component);
      throw new AuditException(INVALID_PARAM_MSG);
    }
    if (!isValidObjects(cause)) {
      LOGGER.trace("Invalid parameter, cause {}.", cause);
      throw new AuditException(INVALID_PARAM_MSG);
    }

    securityLogger.audit("{} a {} with error {}", action, component, cause);
  }

  private boolean isValidObjects(Object... params) {
    for (Object param : params) {
      if (param == null) {
        return false;
      }
    }
    return true;
  }

  private boolean isValidStrings(String... params) {
    for (String param : params) {
      if (StringUtils.isBlank(param) || param == null) {
        return false;
      }
    }
    return true;
  }
}
