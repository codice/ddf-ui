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

import io.javalin.Handler;
import io.javalin.Javalin;
import io.javalin.core.JavalinServlet;
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

  static final String LOOKUP_PATH = "search/catalog/internal/audit";

  private final JavalinServlet javalinServlet = JavalinUtils.createServlet(LOOKUP_PATH);

  public AuditApplication(Handler auditHandler) {
    final Javalin app = javalinServlet.getJavalin();
    JavalinUtils.initializeStandardExceptionHandlers(app);
    app.post("/", auditHandler);
  }

  @Override
  public void service(@NotNull HttpServletRequest req, @NotNull HttpServletResponse resp) {
    javalinServlet.service(req, resp);
  }
}
