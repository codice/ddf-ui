/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.suggest;

import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonMap;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toMap;

import com.google.common.collect.ImmutableMap;
import java.io.StringReader;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.codice.ddf.catalog.search.javacc.ParseException;
import org.codice.ddf.catalog.search.javacc.Parser;
import org.codice.ddf.catalog.search.javacc.TokenMgrError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Suggester {

  private static final Logger LOGGER = LoggerFactory.getLogger(Suggester.class);

  private static final Pattern CHARS_TO_REMOVE = Pattern.compile("[<>\"]");

  private static final Pattern CHARS_TO_REPLACE_WITH_SPACE = Pattern.compile("_");

  private static final Pattern TOKEN_MGR_ERROR_COLUMN = Pattern.compile("column (?<col>\\d+)");

  static final String UNCATEGORIZED = "mandatory";

  private static final String LOGICAL = "logical";

  private static final String ARBITRARY_TEXT = "arbitrary text";

  private static final Map<String, String> KEYWORDS_TO_CATEGORIES =
      ImmutableMap.<String, String>builder()
          .put("and", LOGICAL)
          .put("or", LOGICAL)
          .put("not", LOGICAL)
          .build();

  private final String originalSearchExpression;

  public Suggester(final String originalSearchExpression) {
    this.originalSearchExpression = originalSearchExpression;
  }

  public Map<String, Object> getSuggestions() {
    if (originalSearchExpression.trim().isEmpty()) {
      return emptyMap();
    }

    if (!originalSearchExpression.contains(" ")) {
      try {
        parse("\n");
      } catch (ParseException e) {
        return responsePayload(getCategorizedSuggestionsForFirstWord(e));
      } catch (TokenMgrError e) {
        LOGGER.warn("There was an issue parsing the search expression.", e);
        return emptyMap();
      }
    }

    try {
      parse(originalSearchExpression);
    } catch (ParseException e) {
      final int errorIndex = e.currentToken.next.beginColumn;
      LOGGER.debug(
          "Error in original input at index {} (char: '{}').",
          errorIndex,
          originalSearchExpression.charAt(errorIndex - 1),
          e);
      return responsePayload(getCategorizedSuggestions(e), errorIndex);
    } catch (TokenMgrError e) {
      final int errorIndex = getErrorIndex(e, originalSearchExpression.length());
      final int lastSpaceIndex = originalSearchExpression.lastIndexOf(' ');
      final String searchExpressionWithoutLastWord =
          originalSearchExpression.substring(0, lastSpaceIndex);
      try {
        parse(searchExpressionWithoutLastWord);
      } catch (ParseException ex) {
        return responsePayload(getCategorizedSuggestions(ex), errorIndex);
      } catch (TokenMgrError ex) {
        LOGGER.debug(
            "Still couldn't tokenize the expression without the last word: '{}'. Giving up.",
            searchExpressionWithoutLastWord,
            ex);
        return responsePayload(errorIndex);
      }
    }

    try {
      parse(originalSearchExpression + " \n");
    } catch (ParseException e) {
      return responsePayload(getCategorizedSuggestions(e));
    } catch (TokenMgrError e) {
      LOGGER.warn("There was an issue parsing the search expression.", e);
    }

    return emptyMap();
  }

  private void parse(final String searchExpression) throws ParseException {
    final Parser parser = new Parser(new StringReader(searchExpression));
    parser.SearchExpression();
  }

  private Map<String, List<String>> getCategorizedSuggestionsForFirstWord(final ParseException e) {
    final Map<String, List<String>> categorizedSuggestions =
        Arrays.stream(e.expectedTokenSequences)
            .map(ets -> getTokenSequence(ets, e.tokenImage))
            .distinct()
            .collect(
                groupingBy(
                    suggestion -> KEYWORDS_TO_CATEGORIES.getOrDefault(suggestion, UNCATEGORIZED)));
    categorizedSuggestions.remove(ARBITRARY_TEXT);
    return categorizedSuggestions;
  }

  private Map<String, List<String>> getCategorizedSuggestions(final ParseException e) {
    return Arrays.stream(e.expectedTokenSequences)
        .map(ets -> getTokenSequence(ets, e.tokenImage))
        .distinct()
        .collect(
            groupingBy(
                suggestion -> KEYWORDS_TO_CATEGORIES.getOrDefault(suggestion, UNCATEGORIZED)));
  }

  private String getTokenSequence(final int[] expectedTokenSequence, final String[] tokenImage) {
    return Arrays.stream(expectedTokenSequence)
        .mapToObj(tokenIndex -> tokenImage[tokenIndex])
        .map(this::tokenToSuggestion)
        .collect(joining(" "));
  }

  private String tokenToSuggestion(final String tokenImage) {
    String suggestion = CHARS_TO_REMOVE.matcher(tokenImage).replaceAll("");
    suggestion = CHARS_TO_REPLACE_WITH_SPACE.matcher(suggestion).replaceAll(" ");
    return suggestion.toLowerCase();
  }

  private int getErrorIndex(final TokenMgrError e, final int defaultIndex) {
    // Have to extract the column number from the error message because it's the only way to access
    // it from TokenMgrError.
    final Matcher matcher = TOKEN_MGR_ERROR_COLUMN.matcher(e.getMessage());
    return matcher.find() ? Integer.parseInt(matcher.group("col")) : defaultIndex;
  }

  private Map<String, Object> responsePayload(final Map<String, List<String>> suggestions) {
    final Map<String, List<String>> finalSuggestions = removeEmptySuggestionCategories(suggestions);
    return finalSuggestions.isEmpty() ? emptyMap() : singletonMap("suggestions", finalSuggestions);
  }

  private Map<String, Object> responsePayload(final int errorIndex) {
    return singletonMap("error", errorIndex);
  }

  private Map<String, Object> responsePayload(
      final Map<String, List<String>> suggestions, final int errorIndex) {
    final Map<String, Object> result = new HashMap<>();
    final Map<String, List<String>> finalSuggestions = removeEmptySuggestionCategories(suggestions);
    if (!finalSuggestions.isEmpty()) {
      result.put("suggestions", finalSuggestions);
    }
    result.put("error", errorIndex);
    return result;
  }

  private Map<String, List<String>> removeEmptySuggestionCategories(
      final Map<String, List<String>> categorizedSuggestions) {
    return categorizedSuggestions
        .entrySet()
        .stream()
        .filter(entry -> !entry.getValue().isEmpty())
        .collect(toMap(Entry::getKey, Entry::getValue));
  }
}
