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

import io.javalin.Javalin;
import io.javalin.http.Handler;
import io.javalin.http.JavalinServlet;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.codice.ddf.catalog.javalin.utils.JavalinUtils;
import org.jetbrains.annotations.NotNull;

@WebServlet(
  urlPatterns = {AuditApplication.LOOKUP_PATH + "/*"},
  name = "AuditApplication"
)
public class AuditApplication extends HttpServlet {

  static final String LOOKUP_PATH = "/search/catalog/internal/audit";

  private final Javalin javalin = JavalinUtils.create(LOOKUP_PATH);

  private final JavalinServlet servlet;

  public AuditApplication(Handler auditHandler, Handler simpleAuditHandler) {
    JavalinUtils.initializeStandardExceptionHandlers(javalin);
    javalin.post(LOOKUP_PATH + "/", auditHandler);
    javalin.post(LOOKUP_PATH + "/simple", simpleAuditHandler);
    servlet = javalin.servlet();
  }

  @Override
  public void service(@NotNull HttpServletRequest req, @NotNull HttpServletResponse resp)
      throws ServletException, IOException {
    servlet.service(req, resp);
  }
}
