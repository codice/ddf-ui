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
package org.codice.ddf.catalog.ui.plugin.highlight;

import com.google.common.annotations.VisibleForTesting;
import ddf.catalog.Constants;
import ddf.catalog.data.Attribute;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.Result;
import ddf.catalog.operation.Highlight;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.ResultAttributeHighlight;
import ddf.catalog.operation.ResultHighlight;
import ddf.catalog.plugin.PostQueryPlugin;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Transforms solr highlights into an easily displayable format on the frontend */
public class HighlightTransformPlugin implements PostQueryPlugin {

  private int bufferSize;

  private Pattern redactedPattern;

  public HighlightTransformPlugin() {
    // Create a 80 char buffer around the string
    bufferSize = 80;

    redactedPattern = Pattern.compile("REDACTED");
  }

  @VisibleForTesting
  protected HighlightTransformPlugin(int bufferSize) {
    this.bufferSize = bufferSize;
  }

  @VisibleForTesting
  protected static class ProcessedHighlight {

    private String id;
    private List<Map<String, String>> highlights;

    public ProcessedHighlight(String id) {
      this.id = id;
      highlights = new ArrayList<>();
    }

    public void addHighlight(
        String attribute, String highlight, String startIndex, String endIndex, String valueIndex) {
      HashMap<String, String> highlightMap = new HashMap<>();
      highlightMap.put("attribute", attribute);
      highlightMap.put("highlight", highlight);
      highlightMap.put("valueIndex", valueIndex);
      highlightMap.put("startIndex", startIndex);
      highlightMap.put("endIndex", endIndex);
      highlights.add(highlightMap);
    }

    public List<Map<String, String>> getHighlights() {
      return highlights;
    }

    public String getId() {
      return id;
    }
  }

  @Override
  public QueryResponse process(QueryResponse input) {
    ArrayList<ProcessedHighlight> processedHighlights = new ArrayList<>();
    if (input.getProperties().containsKey(Constants.QUERY_HIGHLIGHT_KEY)) {
      List<Result> results = input.getResults();
      List<ResultHighlight> resultHighlights =
          (List<ResultHighlight>) input.getProperties().get(Constants.QUERY_HIGHLIGHT_KEY);
      for (ResultHighlight resultHighlight : resultHighlights) {
        String id = resultHighlight.getResultId();
        ProcessedHighlight processedHighlight = new ProcessedHighlight(id);

        Result matchingResult =
            results
                .stream()
                .filter(result -> result.getMetacard().getId().equals(id))
                .findAny()
                .orElse(null);
        if (matchingResult != null) {
          List<ResultAttributeHighlight> resultAttributeHighlights =
              resultHighlight.getAttributeHighlights();

          for (ResultAttributeHighlight resultAttributeHighlight : resultAttributeHighlights) {
            String attributeName = resultAttributeHighlight.getAttributeName();
            List<Highlight> highlights = resultAttributeHighlight.getHighlights();

            for (Highlight highlight : highlights) {
              processHighlight(processedHighlight, matchingResult, attributeName, highlight);
            }
          }
        }
        addToProcessedHighlights(processedHighlights, processedHighlight);
      }
    }

    input.getProperties().put(Constants.QUERY_HIGHLIGHT_KEY, processedHighlights);
    return input;
  }

  private void processHighlight(
      ProcessedHighlight processedHighlight,
      Result matchingResult,
      String attributeName,
      Highlight highlight) {
    Attribute attribute = matchingResult.getMetacard().getAttribute(attributeName);
    String value = null;
    int index = highlight.getValueIndex();
    if (attribute != null
        && !attribute.getValues().isEmpty()
        && index < attribute.getValues().size()) {
      value = (String) attribute.getValues().get(index);
    }

    if (value != null && (redactedPattern == null || !redactedPattern.matcher(value).matches())) {
      String highlightedString = createHighlightString(highlight, value, attributeName);
      processedHighlight.addHighlight(
          attributeName,
          highlightedString,
          String.valueOf(highlight.getBeginIndex()),
          String.valueOf(highlight.getEndIndex()),
          String.valueOf(highlight.getValueIndex()));
    }
  }

  private void addToProcessedHighlights(
      ArrayList<ProcessedHighlight> processedHighlights, ProcessedHighlight processedHighlight) {
    if (!processedHighlight.getHighlights().isEmpty()) {
      processedHighlights.add(processedHighlight);
    }
  }

  @VisibleForTesting
  protected String createHighlightString(Highlight highlight, String value, String attribute) {
    String startBuffer = getStartBuffer(highlight, value, attribute);
    String endBuffer = getEndBuffer(highlight, value, attribute);

    String substring =
        "<span class=\"highlight\">"
            + value.substring(highlight.getBeginIndex(), highlight.getEndIndex())
            + "</span>";

    return startBuffer + substring + endBuffer;
  }

  @VisibleForTesting
  protected String getStartBuffer(Highlight highlight, String value, String attribute) {
    String startBuffer = "";

    // A special case for title is that we want the whole string
    if (attribute.equals(Metacard.TITLE)) {
      return value.substring(0, highlight.getBeginIndex());
    }
    // if the highlighted section is at the beginning, don't add a start buffer
    if (highlight.getBeginIndex() > 0) {
      int startIndex = highlight.getBeginIndex() - bufferSize;
      if (startIndex <= 0) {
        startBuffer = value.substring(0, highlight.getBeginIndex());
      } else {
        startBuffer = "...".concat(value.substring(startIndex, highlight.getBeginIndex()));
      }
    }
    return startBuffer;
  }

  @VisibleForTesting
  protected String getEndBuffer(Highlight highlight, String value, String attribute) {
    String endBuffer = "";

    // A special case for title is that we want the whole string
    if (attribute.equals(Metacard.TITLE)) {
      return value.substring(highlight.getEndIndex());
    }
    // if the highlighted section is at the end, don't add an end buffer
    if (highlight.getEndIndex() != value.length()) {
      int endIndex = highlight.getEndIndex() + bufferSize;
      if (endIndex >= value.length()) {
        endBuffer = value.substring(highlight.getEndIndex());
      } else {
        endBuffer = value.substring(highlight.getEndIndex(), endIndex).concat("...");
      }
    }
    return endBuffer;
  }

  public void setRedactedPattern(String redactedPattern) {
    if (redactedPattern == null || redactedPattern.trim().isEmpty()) {
      this.redactedPattern = null;
    } else {
      this.redactedPattern = Pattern.compile(redactedPattern);
    }
  }
}
