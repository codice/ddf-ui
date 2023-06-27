/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.application;

import io.javalin.Javalin;
import io.javalin.core.JavalinServlet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotNull;
import org.codice.ddf.catalog.javalin.utils.JavalinUtils;
import org.codice.ddf.catalog.search.handlers.QueryHandler;
import org.codice.ddf.catalog.search.handlers.SuggestionHandler;

@WebServlet(
  urlPatterns = {BooleanSearchApplication.BOOLEAN_SEARCH_PATH + "/*"},
  name = "BooleanSearchApplication"
)
public class BooleanSearchApplication extends HttpServlet {

  static final String BOOLEAN_SEARCH_PATH = "/search/catalog/internal/boolean-search";

  private final JavalinServlet javalinServlet = JavalinUtils.createServlet(BOOLEAN_SEARCH_PATH);

  public BooleanSearchApplication() {
    final Javalin app = javalinServlet.getJavalin();
    JavalinUtils.initializeStandardExceptionHandlers(app);

    app.get("/cql", new QueryHandler());
    app.get("/suggest", new SuggestionHandler());
  }

  @Override
  public void service(@NotNull HttpServletRequest req, @NotNull HttpServletResponse resp) {
    javalinServlet.service(req, resp);
  }
}
