/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.models;

import java.util.List;
import java.util.stream.Collectors;

public class BooleanTextFilter {

  private String property;

  private String type;

  private String value;

  public BooleanTextFilter(String property, String type, String value) {
    this.property = property;
    this.type = type;
    this.value = value;
  }

  public BooleanTextFilter(final String value) {
    this("ILIKE", "anyText", value);
  }

  public String getProperty() {
    return property;
  }

  public void setProperty(String property) {
    this.property = property;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  @Override
  public String toString() { // ("anyText" ILIKE 'a1')
    return "(" + type + " " + property + " " + "'" + value + "'" + ")";
  }

  public static String implicitOr(List<BooleanTextFilter> filters) {
    return filters.stream().map(BooleanTextFilter::toString).collect(Collectors.joining(" OR "));
  }
}
