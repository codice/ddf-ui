/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.handlers;

import static org.codice.ddf.catalog.javalin.utils.JavalinUtils.message;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.javalin.Context;
import io.javalin.Handler;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import org.codice.ddf.catalog.search.javacc.ParseException;
import org.codice.ddf.catalog.search.javacc.Parser;
import org.codice.ddf.catalog.search.javacc.TokenMgrError;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class QueryHandler implements Handler {

  private static final Logger LOGGER = LoggerFactory.getLogger(QueryHandler.class);

  private static final Gson GSON = new GsonBuilder().disableHtmlEscaping().create();

  public QueryHandler() {
    // implementation not needed
  }

  @Override
  public void handle(@NotNull final Context ctx) {
    final String searchExpression = ctx.queryParam("q");
    final Parser parser = new Parser(new StringReader(searchExpression));
    try {
      String query = parser.SearchExpression();
      final Map<String, Object> response = new HashMap<>();
      response.put("cql", query);

      LOGGER.debug("CQL JSON: {}", query);

      ctx.contentType("application/json");
      ctx.result(GSON.toJson(response));
    } catch (ParseException | TokenMgrError e) {
      LOGGER.debug("Error parsing expression '{}' : '{}'", searchExpression, e);
      ctx.status(400);
      ctx.json(message("Invalid Syntax"));
    }
  }
}
