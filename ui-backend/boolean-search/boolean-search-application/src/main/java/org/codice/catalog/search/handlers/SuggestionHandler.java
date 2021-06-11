/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.handlers;

import io.javalin.Context;
import io.javalin.Handler;
import java.util.Map;
import org.codice.ddf.catalog.search.suggest.Suggester;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SuggestionHandler implements Handler {

  private static final Logger LOGGER = LoggerFactory.getLogger(SuggestionHandler.class);

  public SuggestionHandler() {
    // implementation not needed
  }

  @Override
  public void handle(@NotNull final Context ctx) {
    final String searchExpression = ctx.queryParam("q");
    final Suggester suggester = new Suggester(searchExpression);
    final Map<String, Object> suggestions = suggester.getSuggestions();
    LOGGER.debug("Suggestions for search expression: '{}'", suggestions);
    ctx.json(suggestions);
  }
}
