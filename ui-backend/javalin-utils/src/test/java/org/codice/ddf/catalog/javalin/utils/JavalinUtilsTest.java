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

import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

import java.util.Collections;
import java.util.Map;
import org.junit.Test;
import org.opengis.filter.sort.SortOrder;

public class JavalinUtilsTest {

  @Test
  public void message() {
    final Map<String, Object> message = JavalinUtils.message("test");
    assertThat(message, hasEntry("message", "test"));
  }

  @Test
  public void messageWithOneArg() {
    final Map<String, Object> message = JavalinUtils.message("test - %s", "me");
    assertThat(message, hasEntry("message", "test - me"));
  }

  @Test
  public void messageWithTwoArgs() {
    final Map<String, Object> message = JavalinUtils.message("test - %s - %s", "me", "please");
    assertThat(message, hasEntry("message", "test - me - please"));
  }

  @Test
  public void testGetSortByAscending() {
    SortOrder sortOrder = JavalinUtils.getSortOrder("asc");
    assertThat(sortOrder, is(SortOrder.ASCENDING));
  }

  @Test
  public void testGetSortByDescending() {
    SortOrder sortOrder = JavalinUtils.getSortOrder("other");
    assertThat(sortOrder, is(SortOrder.DESCENDING));
  }

  @Test
  public void testGetOrDefaultParamStringNullQueryParam() {
    String result = JavalinUtils.getOrDefaultParam(null, "default", Collections.singleton("a"));
    assertThat(result, is("default"));
  }

  @Test
  public void testGetOrDefaultParamStringEmptyValidValues() {
    String result = JavalinUtils.getOrDefaultParam("b", "default", Collections.emptySet());
    assertThat(result, is("b"));
  }

  @Test
  public void testGetOrDefaultParamStringValidValues() {
    String result = JavalinUtils.getOrDefaultParam("B", "default", Collections.singleton("b"));
    assertThat(result, is("B"));
  }

  @Test
  public void testGetOrDefaultParamIntNullQueryParam() {
    int result = JavalinUtils.getOrDefaultParam(null, 1);
    assertThat(result, is(1));
  }

  @Test
  public void testGetOrDefaultParamIntNonNullQueryParam() {
    int result = JavalinUtils.getOrDefaultParam("2", 1);
    assertThat(result, is(2));
  }
}
