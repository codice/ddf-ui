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
package org.codice.ddf.catalog.audit.application;

import io.javalin.Context;
import io.javalin.Handler;
import java.util.List;
import org.apache.http.HttpStatus;
import org.codice.ddf.catalog.audit.api.AuditException;
import org.codice.ddf.catalog.audit.api.AuditItemBasic;
import org.codice.ddf.catalog.audit.api.AuditItemRequestBasic;
import org.codice.ddf.catalog.audit.api.AuditService;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuditHandler implements Handler {

  private static final Logger LOGGER = LoggerFactory.getLogger(AuditHandler.class);

  private final AuditService auditService;

  public AuditHandler(AuditService auditService) {
    this.auditService = auditService;
  }

  @Override
  public void handle(@NotNull Context context) throws AuditException {
    AuditItemRequestBasic requestBasic = context.bodyAsClass(AuditItemRequestBasic.class);

    try {
      List<AuditItemBasic> items = requestBasic.getItems();
      auditService.log(requestBasic.getAction(), requestBasic.getComponent(), items);
      context.status(HttpStatus.SC_OK);
    } catch (AuditException e) {
      LOGGER.error(
          "Unable to log the user's action. Error message: {}", e.getLocalizedMessage(), e);
      context.status(HttpStatus.SC_INTERNAL_SERVER_ERROR);
    }
  }
}
