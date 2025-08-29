package org.codice.ddf.catalog.ui.util.spark;

import java.util.*;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;

public class SparkHttpHeaders implements HttpHeaders {
  private static final Logger LOGGER = LoggerFactory.getLogger(SparkHttpHeaders.class);
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
    LOGGER.warn("Not implemented: SparkHttpHeaders.getHeaderString()");
    return "";
  }

  @Override
  public MultivaluedMap<String, String> getRequestHeaders() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getRequestHeaders()");
    return new MultivaluedHashMap<>();
  }

  @Override
  public List<MediaType> getAcceptableMediaTypes() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getAcceptableMediaTypes()");
    return List.of();
  }

  @Override
  public List<Locale> getAcceptableLanguages() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getAcceptableLanguages()");
    return List.of();
  }

  @Override
  public MediaType getMediaType() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getMediaType()");
    return null;
  }

  @Override
  public Locale getLanguage() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getLanguage()");
    return null;
  }

  @Override
  public Map<String, Cookie> getCookies() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getCookies()");
    return Map.of();
  }

  @Override
  public Date getDate() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getDate()");
    return null;
  }

  @Override
  public int getLength() {
    LOGGER.warn("Not implemented: SparkHttpHeaders.getLength()");
    return 0;
  }
}
