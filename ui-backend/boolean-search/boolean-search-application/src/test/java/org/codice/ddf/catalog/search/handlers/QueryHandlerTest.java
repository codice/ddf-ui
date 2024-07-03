/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.handlers;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class QueryHandlerTest {
  @Test
  public void testFormatSearchProperty() {
    String input = "test";
    String expectedResult = "\"test\"";
    String actualResult = QueryHandler.formatSearchProperty(input);
    assertEquals(actualResult, expectedResult);

    input = "foo.bar";
    expectedResult = "\"foo\\.bar\"";
    actualResult = QueryHandler.formatSearchProperty(input);
    assertEquals(actualResult, expectedResult);

    input = "a-b.c";
    expectedResult = "\"a\\-b\\.c\"";
    actualResult = QueryHandler.formatSearchProperty(input);
    assertEquals(actualResult, expectedResult);
  }
}
