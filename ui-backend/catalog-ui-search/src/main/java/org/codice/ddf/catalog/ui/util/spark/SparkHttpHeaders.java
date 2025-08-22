package org.codice.ddf.catalog.ui.util.spark;

import java.util.*;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;
import spark.Request;

public class SparkHttpHeaders implements HttpHeaders {
  private final Request sparkRequest;

  public SparkHttpHeaders(Request sparkRequest) {
    this.sparkRequest = sparkRequest;
  }

  @Override
  public List<String> getRequestHeader(String name) {
    String header = sparkRequest.headers(name);
    return header != null ? Collections.singletonList(header) : Collections.emptyList();
  }

  @Override
  public String getHeaderString(String s) {
    return "";
  }

  @Override
  public MultivaluedMap<String, String> getRequestHeaders() {
    MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();
    for (String headerName : sparkRequest.headers()) {
      headers.add(headerName, sparkRequest.headers(headerName));
    }
    return headers;
  }

  @Override
  public List<MediaType> getAcceptableMediaTypes() {
    return List.of();
  }

  @Override
  public List<Locale> getAcceptableLanguages() {
    return List.of();
  }

  @Override
  public MediaType getMediaType() {
    String contentType = sparkRequest.contentType();
    return contentType != null ? MediaType.valueOf(contentType) : null;
  }

  @Override
  public Locale getLanguage() {
    return null;
  }

  @Override
  public Map<String, Cookie> getCookies() {
    return Map.of();
  }

  @Override
  public Date getDate() {
    return null;
  }

  @Override
  public int getLength() {
    return 0;
  }

  // Other methods can be implemented as necessary
}
