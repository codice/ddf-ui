package org.codice.ddf.catalog.ui.util.jaxrs;

import java.net.URI;
import java.util.*;
import javax.ws.rs.core.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;

public class JaxRsUriInfo implements UriInfo {

  private static final Logger LOGGER = LoggerFactory.getLogger(JaxRsUriInfo.class);
  private final Request sparkRequest;

  public JaxRsUriInfo(Request sparkRequest) {
    this.sparkRequest = sparkRequest;
  }

  @Override
  public URI getAbsolutePath() {
    return URI.create(sparkRequest.url());
  }

  @Override
  public UriBuilder getAbsolutePathBuilder() {
    return UriBuilder.fromUri(getAbsolutePath());
  }

  @Override
  public URI getRequestUri() {
    return URI.create(sparkRequest.url());
  }

  @Override
  public String getPath() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getPath()");
    return "";
  }

  @Override
  public String getPath(boolean decode) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getPath(boolean)");
    return "";
  }

  @Override
  public List<PathSegment> getPathSegments() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getPathSegments()");
    return List.of();
  }

  @Override
  public List<PathSegment> getPathSegments(boolean b) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getPathSegments(boolean)");
    return List.of();
  }

  @Override
  public MultivaluedMap<String, String> getQueryParameters() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getQueryParameters()");
    return new MultivaluedHashMap<>();
  }

  @Override
  public MultivaluedMap<String, String> getQueryParameters(boolean b) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getQueryParameters(boolean)");
    return new MultivaluedHashMap<>();
  }

  @Override
  public List<String> getMatchedURIs() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getMatchedURIs()");
    return List.of();
  }

  @Override
  public List<String> getMatchedURIs(boolean b) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getMatchedURIs(boolean)");
    return List.of();
  }

  @Override
  public List<Object> getMatchedResources() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getMatchedResources()");
    return List.of();
  }

  @Override
  public URI resolve(URI uri) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.resolve()");
    return null;
  }

  @Override
  public URI relativize(URI uri) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.relativize()");
    return null;
  }

  @Override
  public UriBuilder getRequestUriBuilder() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getRequestUriBuilder()");
    return null;
  }

  @Override
  public URI getBaseUri() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getBaseUri()");
    return null;
  }

  @Override
  public UriBuilder getBaseUriBuilder() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getBaseUriBuilder()");
    return null;
  }

  @Override
  public MultivaluedMap<String, String> getPathParameters() {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getPathParameters()");
    return new MultivaluedHashMap<>();
  }

  @Override
  public MultivaluedMap<String, String> getPathParameters(boolean b) {
    LOGGER.warn("Not implemented: JaxRsUriInfo.getPathParameters(boolean)");
    return new MultivaluedHashMap<>();
  }
}
