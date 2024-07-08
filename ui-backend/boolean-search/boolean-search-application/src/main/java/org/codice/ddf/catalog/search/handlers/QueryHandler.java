/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.handlers;

import static java.util.Collections.singletonMap;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.javalin.Context;
import io.javalin.Handler;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import org.codice.ddf.catalog.search.javacc.CustomParseException;
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

  public static String formatSearchProperty(String str) {
    String escapedSymbols = str.replaceAll("[^\\p{L}\\p{Nd}]+", "\\\\$0");
    return "\"" + escapedSymbols + "\"";
  }

  @Override
  public void handle(@NotNull final Context ctx) {
    final String searchExpression = ctx.queryParam("q");
    final String searchProperty = ctx.queryParam("e");
    final Parser parser;

    if (searchProperty == null) {
      parser = new Parser(new StringReader(searchExpression));
    } else {
      parser = new Parser(new StringReader(searchExpression), formatSearchProperty(searchProperty));
    }

    try {
      final String query = parser.SearchExpression();
      final Map<String, Object> response = new HashMap<>();
      response.put("cql", query);

      LOGGER.debug("CQL JSON: {}", query);

      ctx.contentType("application/json");
      ctx.result(GSON.toJson(response));
    } catch (ParseException | TokenMgrError e) {
      LOGGER.debug("Error parsing expression '{}'", searchExpression, e);
      ctx.status(400);
      ctx.json(singletonMap("error", true));
    } catch (CustomParseException e) {
      LOGGER.debug("Error parsing expression '{}'", searchExpression, e);
      ctx.status(400);
      final Map<String, Object> json = new HashMap<>();
      json.put("error", true);
      json.put("errorMessage", e.getMessage());
      ctx.json(json);
    }
  }
}
