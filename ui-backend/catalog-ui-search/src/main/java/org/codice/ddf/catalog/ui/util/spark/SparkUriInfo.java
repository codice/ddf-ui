package org.codice.ddf.catalog.ui.util.spark;

import java.net.URI;
import java.util.*;
import javax.ws.rs.core.*;
import org.apache.cxf.jaxrs.impl.PathSegmentImpl;
import spark.Request;

public class SparkUriInfo implements UriInfo {
  private final Request sparkRequest;

  public SparkUriInfo(Request sparkRequest) {
    this.sparkRequest = sparkRequest;
  }

  @Override
  public String getPath() {
    return sparkRequest.pathInfo();
  }

  @Override
  public String getPath(boolean decode) {
    return sparkRequest.pathInfo(); // Decoding isn't handled here
  }

  @Override
  public List<PathSegment> getPathSegments() {
    String path = getPath();
    String[] segments = path.split("/");
    List<PathSegment> pathSegments = new ArrayList<>();
    for (String segment : segments) {
      if (!segment.isEmpty()) {
        pathSegments.add(new PathSegmentImpl(segment));
      }
    }
    return pathSegments;
  }

  @Override
  public List<PathSegment> getPathSegments(boolean b) {
    return List.of();
  }

  @Override
  public MultivaluedMap<String, String> getQueryParameters() {
    MultivaluedMap<String, String> queryParameters = new MultivaluedHashMap<>();
    for (String queryParam : sparkRequest.queryParams()) {
      queryParameters.add(queryParam, sparkRequest.queryParams(queryParam));
    }
    return queryParameters;
  }

  @Override
  public MultivaluedMap<String, String> getQueryParameters(boolean b) {
    return null;
  }

  @Override
  public List<String> getMatchedURIs() {
    return List.of();
  }

  @Override
  public List<String> getMatchedURIs(boolean b) {
    return List.of();
  }

  @Override
  public List<Object> getMatchedResources() {
    return List.of();
  }

  @Override
  public URI resolve(URI uri) {
    return null;
  }

  @Override
  public URI relativize(URI uri) {
    return null;
  }

  @Override
  public URI getRequestUri() {
    return URI.create(sparkRequest.url());
  }

  @Override
  public UriBuilder getRequestUriBuilder() {
    return null;
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
  public URI getBaseUri() {
    return null;
  }

  @Override
  public UriBuilder getBaseUriBuilder() {
    return null;
  }

  @Override
  public MultivaluedMap<String, String> getPathParameters() {
    return null;
  }

  @Override
  public MultivaluedMap<String, String> getPathParameters(boolean b) {
    return null;
  }

  // Other methods from UriInfo can be implemented as needed
}
