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
package org.codice.ddf.catalog.javalin.utils;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import io.javalin.Javalin;
import io.javalin.http.BadGatewayResponse;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.plugin.json.JavalinJson;
import java.util.Map;
import java.util.Set;
import org.geotools.api.filter.sort.SortOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class JavalinUtils {

  private static final Logger LOGGER = LoggerFactory.getLogger(JavalinUtils.class);

  private static final String MESSAGE = "message";

  private static final String ASCENDING = "asc";

  private static final String SORT_BY = "sort_by";

  private JavalinUtils() {
    // implementation not needed
  }

  static {
    final Gson gson = new Gson();
    JavalinJson.setFromJsonMapper(gson::fromJson);
    JavalinJson.setToJsonMapper(gson::toJson);
  }

  public static String getSortByParam(Context context) {
    return context.queryParam(SORT_BY);
  }

  public static SortOrder getSortOrder(String sortByParam) {
    if (ASCENDING.equals(sortByParam)) {
      return SortOrder.ASCENDING;
    } else {
      return SortOrder.DESCENDING;
    }
  }

  public static String getOrDefaultParam(
      String queryParam, String defaultValue, Set<String> validValues) {

    if (queryParam != null
        && (validValues.isEmpty() || validValues.contains(queryParam.toLowerCase()))) {
      return queryParam;
    }

    return defaultValue;
  }

  public static int getOrDefaultParam(String queryParam, int defaultValue) {

    if (queryParam != null) {
      return Integer.parseInt(queryParam);
    }

    return defaultValue;
  }

  public static Javalin create(String contextPath) {
    return Javalin.create(
        config -> {
          config.showJavalinBanner = false;
          config.defaultContentType = "application/json";
          config.autogenerateEtags = true;
          config.contextPath = contextPath;
        });
  }

  public static Map<String, Object> message(String message) {
    return ImmutableMap.of(MESSAGE, message);
  }

  public static Map<String, Object> message(String message, Object... args) {
    return ImmutableMap.of(MESSAGE, String.format(message, args));
  }

  /** @param app Javalin Application to add exception handlers to. */
  public static void initializeStandardExceptionHandlers(Javalin app) {

    // Kotlin is very strict about @NonNull arguments. When Javalin can't find a route, internally
    // it throws a kotlin#TypeCastException.
    app.exception(
        kotlin.TypeCastException.class,
        (e, ctx) -> {
          final String path = ctx.path();
          LOGGER.debug(
              "TypeCastException while attempting to hit possibly unmapped route [{}]", path, e);
          ctx.status(404);
          ctx.json(message("Unknown Route [%s]", path));
        });

    app.exception(
        BadRequestResponse.class,
        (e, ctx) -> {
          LOGGER.debug("Bad request provided to [{}]", ctx.path(), e);
          ctx.status(400);
          ctx.json(message(e.getMessage()));
        });

    app.exception(
        NotFoundResponse.class,
        (e, ctx) -> {
          LOGGER.debug("Could not find resource while hitting route [{}]", ctx.path(), e);
          ctx.status(404);
          ctx.json(
              message(
                  "Could not find resource at route [%s] using method [%s]",
                  ctx.path(), ctx.method()));
        });

    app.exception(
        NullPointerException.class,
        (e, ctx) -> {
          LOGGER.debug("Null Pointer Exception while hitting route [{}]", ctx.path(), e);
          ctx.status(500);
          ctx.json(message("Unknown Server Error"));
        });

    app.exception(
        RuntimeException.class,
        (e, ctx) -> {
          LOGGER.debug("Runtime Exception while hitting route [{}]", ctx.path(), e);
          ctx.status(500);
          ctx.json(message("Unknown Server Error"));
        });

    app.exception(
        BadGatewayResponse.class,
        (e, ctx) -> {
          LOGGER.debug("Bad Gateway error while hitting route [{}]", ctx.path(), e);
          ctx.status(502);
          ctx.json(message(e.getMessage()));
        });
  }
}
