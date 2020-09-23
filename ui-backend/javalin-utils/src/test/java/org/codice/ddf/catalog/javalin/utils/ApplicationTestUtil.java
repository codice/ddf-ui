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
package org.codice.ddf.catalog.javalin.utils;

import static org.junit.Assert.fail;
import static org.mockito.Mockito.when;

import com.google.gson.Gson;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

public class ApplicationTestUtil {

  private ApplicationTestUtil() {
    // implementation not needed
  }

  private static final Gson GSON = new Gson();

  public static void mockRequestBody(HttpServletRequest req, Map<String, Object> body) {
    final String json = GSON.toJson(body);
    try {
      when(req.getInputStream())
          .thenReturn(
              new MockServletInputStream(
                  new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8))));
    } catch (IOException e) {
      fail();
    }
  }

  public static void mockRequestBody(HttpServletRequest req, String body) {
    try {
      when(req.getInputStream())
          .thenReturn(
              new MockServletInputStream(
                  new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8))));
    } catch (IOException e) {
      fail();
    }
  }

  public static <T> T fromJson(String json, Class<T> clazz) {
    return GSON.fromJson(json, clazz);
  }
}
