package org.codice.ddf.catalog.ui.catalog;

import java.io.InputStream;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import org.apache.cxf.jaxrs.ext.multipart.MultipartBody;
import org.codice.ddf.endpoints.rest.RESTEndpoint;

@Path("/catalog")
public class CatalogCxfApplication {

  private final RESTEndpoint restEndpoint;

  public CatalogCxfApplication(RESTEndpoint restEndpoint) {
    this.restEndpoint = restEndpoint;
  }

  @POST
  @Consumes({"text/*", "application/*"})
  @Produces(MediaType.APPLICATION_JSON)
  public Response addDocument(
      @Context HttpHeaders headers,
      @Context UriInfo requestUriInfo,
      @Context HttpServletRequest httpRequest,
      @QueryParam("transform") String transformerParam,
      InputStream message) {
    return restEndpoint.addDocument(
        headers, requestUriInfo, httpRequest, transformerParam, message);
  }

  @POST
  @Consumes("multipart/*")
  @Produces(MediaType.APPLICATION_JSON)
  public Response addDocument(
      @Context HttpHeaders headers,
      @Context UriInfo requestUriInfo,
      @Context HttpServletRequest httpRequest,
      MultipartBody multipartBody,
      @QueryParam("transform") String transformerParam,
      InputStream message) {
    return restEndpoint.addDocument(
        headers, requestUriInfo, httpRequest, multipartBody, transformerParam, message);
  }
}
