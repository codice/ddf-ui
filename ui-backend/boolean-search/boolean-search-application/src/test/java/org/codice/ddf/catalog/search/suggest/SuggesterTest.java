/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.suggest;

import static org.junit.Assert.assertEquals;

import java.util.List;
import java.util.Map;
import org.junit.Assert;
import org.junit.Test;

public class SuggesterTest {

  @Test
  public void testLogicalSuggestions() {
    final Suggester suggester = new Suggester("a and b ");
    final Map<String, Object> suggestions = suggester.getSuggestions();

    final Map<String, List<String>> suggestionMap =
        (Map<String, List<String>>) suggestions.get("suggestions");

    List<String> mandatory = suggestionMap.get("mandatory");
    List<String> logical = suggestionMap.get("logical");

    Assert.assertTrue(mandatory.contains("string"));
    Assert.assertTrue(mandatory.contains("quoted string"));
    Assert.assertTrue(logical.contains("and"));
    Assert.assertTrue(logical.contains("or"));
  }

  @Test
  public void testSingleSearchTerm() {
    final Suggester suggester = new Suggester("a");
    final Map<String, Object> suggestions = suggester.getSuggestions();

    final Map<String, List<String>> suggestionMap =
        (Map<String, List<String>>) suggestions.get("suggestions");

    List<String> mandatory = suggestionMap.get("mandatory");
    List<String> logical = suggestionMap.get("logical");

    System.out.println(mandatory);
    System.out.println(logical);

    Assert.assertTrue(mandatory.contains("string"));
  }

  @Test
  public void testSingleSearchTermWithSpace() {
    final Suggester suggester = new Suggester("a ");
    final Map<String, Object> suggestions = suggester.getSuggestions();

    final Map<String, List<String>> suggestionMap =
        (Map<String, List<String>>) suggestions.get("suggestions");

    List<String> mandatory = suggestionMap.get("mandatory");
    List<String> logical = suggestionMap.get("logical");

    Assert.assertTrue(mandatory.contains("string"));
    Assert.assertTrue(mandatory.contains("quoted string"));
    Assert.assertTrue(logical.contains("and"));
    Assert.assertTrue(logical.contains("or"));
  }

  @Test
  public void testSingleTermWithSpace() {
    final Suggester suggester = new Suggester("a ");
    final Map<String, Object> suggestions = suggester.getSuggestions();

    final Map<String, List<String>> suggestionMap =
        (Map<String, List<String>>) suggestions.get("suggestions");

    List<String> mandatory = suggestionMap.get("mandatory");
    List<String> logical = suggestionMap.get("logical");

    Assert.assertTrue(mandatory.contains("string"));
    Assert.assertTrue(mandatory.contains("quoted string"));
    Assert.assertTrue(logical.contains("and"));
    Assert.assertTrue(logical.contains("or"));
  }

  @Test
  public void testEmpty() {
    final Suggester suggester = new Suggester("");
    final Map<String, Object> suggestions = suggester.getSuggestions();
    Assert.assertTrue(suggestions.isEmpty());
  }

  @Test
  public void testErrorAtLocation() {
    final Suggester suggester = new Suggester("a and b )");
    final Map<String, Object> suggestions = suggester.getSuggestions();

    final int errorLocation = (int) suggestions.get("error");

    assertEquals(9, errorLocation);
  }
}
