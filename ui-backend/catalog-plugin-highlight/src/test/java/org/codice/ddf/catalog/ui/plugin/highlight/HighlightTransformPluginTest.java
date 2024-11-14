/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.ui.plugin.highlight;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.Mockito.mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.common.collect.ImmutableMap;

import ddf.catalog.Constants;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.Result;
import ddf.catalog.data.impl.AttributeImpl;
import ddf.catalog.data.impl.MetacardImpl;
import ddf.catalog.data.impl.ResultImpl;
import ddf.catalog.operation.Highlight;
import ddf.catalog.operation.QueryRequest;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.ResultAttributeHighlight;
import ddf.catalog.operation.ResultHighlight;
import ddf.catalog.operation.impl.HighlightImpl;
import ddf.catalog.operation.impl.QueryResponseImpl;
import ddf.catalog.operation.impl.ResultAttributeHighlightImpl;
import ddf.catalog.operation.impl.ResultHighlightImpl;

@RunWith(MockitoJUnitRunner.class)
public class HighlightTransformPluginTest {

  QueryRequest request;

  private QueryResponse input;

  // Use a smaller buffer size for ease of testing
  private HighlightTransformPlugin plugin = new HighlightTransformPlugin(10);

  private String value = "Lorem ipsum dolor sit amet";

  @Before
  public void setup() {
    request = mock(QueryRequest.class);
    input = new QueryResponseImpl(request);
  }

  @Test
  public void testNoHighlights() {
    QueryResponse output = plugin.process(input);
    assertThat(output.getProperties(), hasKey(Constants.QUERY_HIGHLIGHT_KEY));
    assertThat(
        output.getProperties().get(Constants.QUERY_HIGHLIGHT_KEY), is(Collections.EMPTY_LIST));
  }

  @Test
  public void testProcessHighlights() {
    String id = "123456789";
    // Highlight the word "Lorem"
    Highlight highlight = new HighlightImpl(0, 5);

    Metacard metacard = new MetacardImpl();
    metacard.setAttribute(new AttributeImpl("description", value));
    metacard.setAttribute(new AttributeImpl("id", "123456789"));
    Result result = new ResultImpl(metacard);

    QueryResponse response = new QueryResponseImpl(request, Arrays.asList(result), 1);
    ResultAttributeHighlight resultAttributeHighlight =
        new ResultAttributeHighlightImpl("description", Arrays.asList(highlight));
    ResultHighlight resultHighlight =
        new ResultHighlightImpl(id, Arrays.asList(resultAttributeHighlight));

    response
        .getProperties()
        .put(Constants.QUERY_HIGHLIGHT_KEY, (Serializable) Arrays.asList(resultHighlight));

    QueryResponse processedResponse = plugin.process(response);
    assertThat(
        processedResponse.getProperties().containsKey(Constants.QUERY_HIGHLIGHT_KEY), is(true));
    ArrayList<HighlightTransformPlugin.ProcessedHighlight> highlights =
        (ArrayList<HighlightTransformPlugin.ProcessedHighlight>)
            processedResponse.getProperties().get(Constants.QUERY_HIGHLIGHT_KEY);
    assertThat(highlights.get(0).getId(), is("123456789"));
    assertThat(highlights.get(0).getHighlights().get(0).get("attribute"), is("description"));
    assertThat(
        highlights.get(0).getHighlights().get(0).get("highlight"),
        is("<span class=\"highlight\">Lorem</span> ipsum dol..."));
  }

  @Test
  public void testHighlightSourceCollision() {
    String id1 = "123456789";
    String id2 = "987654321";
    // Highlight the word "Lorem"
    Highlight highlight1 = new HighlightImpl(0, 5);
    Highlight highlight2 = new HighlightImpl(7, 12);

    Metacard metacard1 = new MetacardImpl();
    metacard1.setAttribute(new AttributeImpl("description", value));
    metacard1.setAttribute(new AttributeImpl("id", id1));
    Result result1 = new ResultImpl(metacard1);

    Metacard metacard2 = new MetacardImpl();
    metacard2.setAttribute(new AttributeImpl("description", "Offset " + value));
    metacard2.setAttribute(new AttributeImpl("id", id2));
    Result result2 = new ResultImpl(metacard2);

    QueryResponse response = new QueryResponseImpl(request, Arrays.asList(result1, result2), 2);
    ResultAttributeHighlight resultAttributeHighlight1 =
        new ResultAttributeHighlightImpl("description", Arrays.asList(highlight1));
    ResultHighlight resultHighlight1 =
        new ResultHighlightImpl(id1, Arrays.asList(resultAttributeHighlight1));

    // Simulate a source collision for highlights that only contain one highlight
    response
        .getProperties()
        .put(Constants.QUERY_HIGHLIGHT_KEY, (Serializable) Arrays.asList(resultHighlight1));

    ResultAttributeHighlight resultAttributeHighlight2 =
        new ResultAttributeHighlightImpl("description", Arrays.asList(highlight2));
    ResultHighlight resultHighlight2 =
        new ResultHighlightImpl(id2, Arrays.asList(resultAttributeHighlight2));

    response
        .getProperties()
        .put(
            HighlightTransformPlugin.ORIGINAL_SOURCE_PROPERTIES,
            ImmutableMap.of(
                "source1",
                ImmutableMap.of(
                    Constants.QUERY_HIGHLIGHT_KEY, (Serializable) Arrays.asList(resultHighlight1)),
                "source2",
                ImmutableMap.of(
                    Constants.QUERY_HIGHLIGHT_KEY,
                    (Serializable) Arrays.asList(resultHighlight2))));

    QueryResponse processedResponse = plugin.process(response);
    assertThat(
        processedResponse.getProperties().containsKey(Constants.QUERY_HIGHLIGHT_KEY), is(true));
    ArrayList<HighlightTransformPlugin.ProcessedHighlight> highlights =
        (ArrayList<HighlightTransformPlugin.ProcessedHighlight>)
            processedResponse.getProperties().get(Constants.QUERY_HIGHLIGHT_KEY);
    assertThat(highlights.size(), is(2));
    assertThat(highlights.get(0).getId(), is(id1));
    assertThat(highlights.get(0).getHighlights().get(0).get("attribute"), is("description"));
    assertThat(
        highlights.get(0).getHighlights().get(0).get("highlight"),
        is("<span class=\"highlight\">Lorem</span> ipsum dol..."));

    assertThat(highlights.get(1).getId(), is(id2));
    assertThat(highlights.get(1).getHighlights().get(0).get("attribute"), is("description"));
    assertThat(
        highlights.get(1).getHighlights().get(0).get("highlight"),
        is("Offset <span class=\"highlight\">Lorem</span> ipsum dol..."));
  }

  @Test
  public void testProcessHighlightsRedacted() {
    HighlightTransformPlugin highlightPlugin = new HighlightTransformPlugin(10);
    highlightPlugin.setRedactedPattern("REDACTED.*");

    String id = "123456789";
    // Highlight the word "Lorem"
    Highlight highlight = new HighlightImpl(0, 5);

    Metacard metacard = new MetacardImpl();
    metacard.setAttribute(new AttributeImpl("title", "REDACTED DATA"));
    metacard.setAttribute(new AttributeImpl("description", value));
    metacard.setAttribute(new AttributeImpl("id", "123456789"));
    metacard.setAttribute(new AttributeImpl("source", ""));
    Result result = new ResultImpl(metacard);

    QueryResponse response = new QueryResponseImpl(request, Arrays.asList(result), 1);
    ResultAttributeHighlight resultAttributeHighlight =
        new ResultAttributeHighlightImpl("description", Arrays.asList(highlight));
    ResultAttributeHighlight missingAttributeHighlight =
        new ResultAttributeHighlightImpl("extra", Arrays.asList(new HighlightImpl(6, 20)));
    ResultAttributeHighlight emptyStringRedactedAttributeHighlight =
        new ResultAttributeHighlightImpl("source", Arrays.asList(new HighlightImpl(6, 20)));
    ResultAttributeHighlight redactedAttributeHighlight =
        new ResultAttributeHighlightImpl("title", Arrays.asList(new HighlightImpl(10, 20)));

    ResultHighlight resultHighlight =
        new ResultHighlightImpl(
            id,
            Arrays.asList(
                resultAttributeHighlight, missingAttributeHighlight, emptyStringRedactedAttributeHighlight, redactedAttributeHighlight));

    response
        .getProperties()
        .put(Constants.QUERY_HIGHLIGHT_KEY, (Serializable) Arrays.asList(resultHighlight));

    QueryResponse processedResponse = highlightPlugin.process(response);
    assertThat(
        processedResponse.getProperties().containsKey(Constants.QUERY_HIGHLIGHT_KEY), is(true));
    ArrayList<HighlightTransformPlugin.ProcessedHighlight> highlights =
        (ArrayList<HighlightTransformPlugin.ProcessedHighlight>)
            processedResponse.getProperties().get(Constants.QUERY_HIGHLIGHT_KEY);
    assertThat(highlights.size(), is(1));
    assertThat(highlights.get(0).getId(), is("123456789"));
    assertThat(highlights.get(0).getHighlights().get(0).get("attribute"), is("description"));
    assertThat(
        highlights.get(0).getHighlights().get(0).get("highlight"),
        is("<span class=\"highlight\">Lorem</span> ipsum dol..."));
  }

  @Test
  public void testGetStartBufferWithHighlightAtStart() {
    // Highlight the word "Lorem"
    Highlight highlight = new HighlightImpl(0, 5);
    String startBuffer = plugin.getStartBuffer(highlight, value, "description");
    // Assert that the buffer is blank because its the first word in the string
    assertThat(startBuffer, equalTo(""));
  }

  @Test
  public void testGetStartBufferWithHighlightInMiddle() {
    // Highlight the word "dolor"
    Highlight highlight = new HighlightImpl(12, 17);
    String startBuffer = plugin.getStartBuffer(highlight, value, "description");
    // Assert that the buffer contains front trail because its mid string
    assertThat(startBuffer, equalTo("...rem ipsum "));
  }

  @Test
  public void testGetStartBufferAtStartOfValue() {
    // Highlight the word "ipsum"
    Highlight highlight = new HighlightImpl(6, 11);
    String startBuffer = plugin.getStartBuffer(highlight, value, "description");
    // Assert that the buffer doesn't have front trail and starts at first word
    assertThat(startBuffer, equalTo("Lorem "));
  }

  @Test
  public void testGetEndBufferWithHighlightAtEnd() {
    // Highlight the word "amet"
    Highlight highlight = new HighlightImpl(22, 26);
    String startBuffer = plugin.getEndBuffer(highlight, value, "description");
    // Assert that the buffer is blank because its the last word in the string
    assertThat(startBuffer, equalTo(""));
  }

  @Test
  public void testGetEndBufferWithHighlightInMiddle() {
    // Highlight the word "ipsum"
    Highlight highlight = new HighlightImpl(6, 11);
    String endBuffer = plugin.getEndBuffer(highlight, value, "description");
    // Assert that the buffer has end trail as it is mid string
    assertThat(endBuffer, equalTo(" dolor sit..."));
  }

  @Test
  public void testGetEndBufferAtEndOfValue() {
    // Highlight the word "dolor"
    Highlight highlight = new HighlightImpl(12, 17);
    String startBuffer = plugin.getEndBuffer(highlight, value, "description");
    // Assert that the buffer stops on last word
    assertThat(startBuffer, equalTo(" sit amet"));
  }

  @Test
  public void testDontTruncateTitles() {
    // Highlight the word "dolor"
    Highlight highlight = new HighlightImpl(12, 17);
    String resultString = plugin.createHighlightString(highlight, value, "title");
    // Assert that the buffer stops on last word
    assertThat(
        resultString, equalTo("Lorem ipsum <span class=\"highlight\">dolor</span> sit amet"));
  }
}
