/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.javacc;

import static org.junit.Assert.assertEquals;

import java.io.StringReader;
import org.junit.Test;

public class ParserTest {

  @Test(expected = ParseException.class)
  public void testBadSyntaxQuery() throws ParseException {
    String searchExpression = "(a or and b)";
    final Parser parser = new Parser(new StringReader(searchExpression));

    String cql = parser.SearchExpression();
  }

  @Test(expected = ParseException.class)
  public void testUnBalancedParenthesis() throws ParseException {
    String searchExpression = "(a or (b and c)))";
    final Parser parser = new Parser(new StringReader(searchExpression));

    String cql = parser.SearchExpression();
  }

  @Test
  public void testValidSyntax() throws ParseException {
    String searchExpression = "a or b and c";
    String expectedQuery = "(anyText ILIKE 'a') or (anyText ILIKE 'b') and (anyText ILIKE 'c')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testValidGrouping() throws ParseException {
    String searchExpression = "(a or b) and c";
    String expectedQuery = "((anyText ILIKE 'a') or (anyText ILIKE 'b')) and (anyText ILIKE 'c')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testValidNegation() throws ParseException {
    String searchExpression = "not (a or b) and c";
    String expectedQuery =
        "(NOT ((anyText ILIKE 'a') or (anyText ILIKE 'b'))) and (anyText ILIKE 'c')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }
}
