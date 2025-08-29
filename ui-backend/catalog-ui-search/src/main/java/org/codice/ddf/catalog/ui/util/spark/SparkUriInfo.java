package org.codice.ddf.catalog.ui.util.spark;

import java.net.URI;
import java.util.*;
import javax.ws.rs.core.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;

public class SparkUriInfo implements UriInfo {

  private static final Logger LOGGER = LoggerFactory.getLogger(SparkUriInfo.class);
  private final Request sparkRequest;

  public SparkUriInfo(Request sparkRequest) {
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
  public String getPath() {
    LOGGER.warn("Not implemented: SparkUriInfo.getPath()");
    return "";
  }

  @Override
  public String getPath(boolean decode) {
    LOGGER.warn("Not implemented: SparkUriInfo.getPath(boolean)");
    return "";
  }

  @Override
  public List<PathSegment> getPathSegments() {
    LOGGER.warn("Not implemented: SparkUriInfo.getPathSegments()");
    return List.of();

    //    String path = getPath();
    //    String[] segments = path.split("/");
    //    List<PathSegment> pathSegments = new ArrayList<>();
    //    for (String segment : segments) {
    //      if (!segment.isEmpty()) {
    //        pathSegments.add(new PathSegmentImpl(segment));
    //      }
    //    }
    //    return pathSegments;
  }

  @Override
  public List<PathSegment> getPathSegments(boolean b) {
    LOGGER.warn("Not implemented: SparkUriInfo.getPathSegments(boolean)");
    return List.of();
  }

  @Override
  public MultivaluedMap<String, String> getQueryParameters() {
    LOGGER.warn("Not implemented: SparkUriInfo.getQueryParameters()");

    //    MultivaluedMap<String, String> queryParameters = new MultivaluedHashMap<>();
    //    for (String queryParam : sparkRequest.queryParams()) {
    //      queryParameters.add(queryParam, sparkRequest.queryParams(queryParam));
    //    }
    //    return queryParameters;
    return new MultivaluedHashMap<>();
  }

  @Override
  public MultivaluedMap<String, String> getQueryParameters(boolean b) {
    LOGGER.warn("Not implemented: SparkUriInfo.getQueryParameters(boolean)");
    return new MultivaluedHashMap<>();
  }

  @Override
  public List<String> getMatchedURIs() {
    LOGGER.warn("Not implemented: SparkUriInfo.getMatchedURIs()");
    return List.of();
  }

  @Override
  public List<String> getMatchedURIs(boolean b) {
    LOGGER.warn("Not implemented: SparkUriInfo.getMatchedURIs(boolean)");
    return List.of();
  }

  @Override
  public List<Object> getMatchedResources() {
    LOGGER.warn("Not implemented: SparkUriInfo.getMatchedResources()");
    return List.of();
  }

  @Override
  public URI resolve(URI uri) {
    LOGGER.warn("Not implemented: SparkUriInfo.resolve()");
    return null;
  }

  @Override
  public URI relativize(URI uri) {
    LOGGER.warn("Not implemented: SparkUriInfo.relativize()");
    return null;
  }

  @Override
  public URI getRequestUri() {
    LOGGER.warn("Not implemented: SparkUriInfo.getRequestUri()");
    return null;
    //    return URI.create(sparkRequest.url());
  }

  @Override
  public UriBuilder getRequestUriBuilder() {
    LOGGER.warn("Not implemented: SparkUriInfo.getRequestUriBuilder()");
    return null;
  }

  @Override
  public URI getBaseUri() {
    LOGGER.warn("Not implemented: SparkUriInfo.getBaseUri()");
    return null;
  }

  @Override
  public UriBuilder getBaseUriBuilder() {
    LOGGER.warn("Not implemented: SparkUriInfo.getBaseUriBuilder()");
    return null;
  }

  @Override
  public MultivaluedMap<String, String> getPathParameters() {
    LOGGER.warn("Not implemented: SparkUriInfo.getPathParameters()");
    return new MultivaluedHashMap<>();
  }

  @Override
  public MultivaluedMap<String, String> getPathParameters(boolean b) {
    LOGGER.warn("Not implemented: SparkUriInfo.getPathParameters(boolean)");
    return new MultivaluedHashMap<>();
  }
}
