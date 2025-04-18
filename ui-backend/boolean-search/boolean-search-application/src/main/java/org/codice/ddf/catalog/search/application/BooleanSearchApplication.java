/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.application;

import io.javalin.Javalin;
import io.javalin.http.JavalinServlet;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotNull;
import org.codice.ddf.catalog.javalin.utils.JavalinUtils;
import org.codice.ddf.catalog.search.handlers.QueryHandler;
import org.codice.ddf.catalog.search.handlers.SuggestionHandler;

public class BooleanSearchApplication extends HttpServlet {

  static final String BOOLEAN_SEARCH_PATH = "/search/catalog/internal/boolean-search";

  private final Javalin javalin = JavalinUtils.create(BOOLEAN_SEARCH_PATH);

  private final JavalinServlet servlet;

  public BooleanSearchApplication() {
    JavalinUtils.initializeStandardExceptionHandlers(javalin);

    javalin.get(BOOLEAN_SEARCH_PATH + "/cql", new QueryHandler());
    javalin.get(BOOLEAN_SEARCH_PATH + "/suggest", new SuggestionHandler());
    servlet = javalin.servlet();
  }

  @Override
  public void service(@NotNull HttpServletRequest req, @NotNull HttpServletResponse resp)
      throws ServletException, IOException {
    servlet.service(req, resp);
  }
}
