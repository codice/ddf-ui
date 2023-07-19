/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.javacc;

import static org.junit.Assert.assertEquals;

import java.io.StringReader;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

public class ParserTest {
  @Rule public ExpectedException expectedException = ExpectedException.none();

  @Test(expected = ParseException.class)
  public void testBadSyntaxQuery() throws ParseException, CustomParseException {
    String searchExpression = "(a or and b)";
    final Parser parser = new Parser(new StringReader(searchExpression));

    String cql = parser.SearchExpression();
  }

  @Test(expected = ParseException.class)
  public void testUnBalancedParenthesis() throws ParseException, CustomParseException {
    String searchExpression = "(a or (b and c)))";
    final Parser parser = new Parser(new StringReader(searchExpression));

    String cql = parser.SearchExpression();
  }

  @Test
  public void testValidSyntax() throws ParseException, CustomParseException {
    String searchExpression = "a or b and c";
    String expectedQuery = "(anyText ILIKE 'a') or (anyText ILIKE 'b') and (anyText ILIKE 'c')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testValidGrouping() throws ParseException, CustomParseException {
    String searchExpression = "(a or b) and c";
    String expectedQuery = "((anyText ILIKE 'a') or (anyText ILIKE 'b')) and (anyText ILIKE 'c')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testValidNegation() throws ParseException, CustomParseException {
    String searchExpression = "not (a or b) and c";
    String expectedQuery =
        "(NOT ((anyText ILIKE 'a') or (anyText ILIKE 'b'))) and (anyText ILIKE 'c')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testAllowSingleCharWildcard() throws ParseException, CustomParseException {
    final String searchExpression = "not (?at or b?d) and i?";
    final String expectedQuery =
        "(NOT ((anyText ILIKE '?at') or (anyText ILIKE 'b?d'))) and (anyText ILIKE 'i?')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testAllowMultiCharWildcard() throws ParseException, CustomParseException {
    final String searchExpression = "not (*at or b*d) and i*";
    final String expectedQuery =
        "(NOT ((anyText ILIKE '*at') or (anyText ILIKE 'b*d'))) and (anyText ILIKE 'i*')";

    final Parser parser = new Parser(new StringReader(searchExpression));
    String result = parser.SearchExpression();

    assertEquals(result, expectedQuery);
  }

  @Test
  public void testSingleCharWildcardNotAllowedInPhrase()
      throws ParseException, CustomParseException {
    expectedException.expect(CustomParseException.class);
    expectedException.expectMessage("Wildcards are not allowed in search phrases.");

    final String searchExpression = "\"st?ck index\"";

    final Parser parser = new Parser(new StringReader(searchExpression));
    parser.SearchExpression();
  }

  @Test
  public void testMultiCharWildcardNotAllowedInPhrase()
      throws ParseException, CustomParseException {
    expectedException.expect(CustomParseException.class);
    expectedException.expectMessage("Wildcards are not allowed in search phrases.");

    final String searchExpression = "\"st*ck index\"";

    final Parser parser = new Parser(new StringReader(searchExpression));
    parser.SearchExpression();
  }
}
