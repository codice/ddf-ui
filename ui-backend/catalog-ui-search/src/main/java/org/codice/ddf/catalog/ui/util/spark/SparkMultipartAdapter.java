package org.codice.ddf.catalog.ui.util.spark;

import java.io.InputStream;
import java.util.*;
import javax.servlet.MultipartConfigElement;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import javax.ws.rs.core.MediaType;
import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.ContentDisposition;
import org.apache.cxf.jaxrs.ext.multipart.MultipartBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SparkMultipartAdapter {

  private static final Logger LOGGER = LoggerFactory.getLogger(SparkMultipartAdapter.class);

  public static MultipartBody adapt(HttpServletRequest httpRequest) {
    // Configure the request for multipart processing
    MultipartConfigElement multipartConfigElement =
        new MultipartConfigElement(System.getProperty("java.io.tmpdir"));
    httpRequest.setAttribute("org.eclipse.jetty.multipartConfig", multipartConfigElement);

    List<Attachment> attachments = new ArrayList<>();
    try {
      // Get all parts from the request
      Collection<Part> parts = httpRequest.getParts();
      LOGGER.info("PATPAT: SparkMultipartAdapter.adapt(): totalParts: {}", parts.size());
      for (Part part : parts) {

        String name = part.getName();
        String fileName = part.getSubmittedFileName();
        long size = part.getSize();
        String contentType = part.getContentType();

        LOGGER.info(
            "PATPAT: Processing part: name={}, fileName={}, size={}, contentType={}",
            name,
            fileName,
            size,
            contentType);
        if (size > 0) {
          InputStream partStream = part.getInputStream();
          ContentDisposition contentDisposition =
              new ContentDisposition(
                  "form-data; name=\"" + name + "\"; filename=\"" + fileName + "\"");

          // Add attachment to MultipartBody
          attachments.add(new Attachment(name, partStream, contentDisposition));
        } else {
          LOGGER.warn(
              "PATPAT: Ignored part with empty content: name={}, fileName={}", name, fileName);
        }
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to process multipart request", e);
    }
    return new MultipartBody(attachments, MediaType.MULTIPART_FORM_DATA_TYPE, true);
  }
}
