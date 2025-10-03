package org.codice.ddf.catalog.ui.util.multipart;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import javax.ws.rs.core.MediaType;
import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.ContentDisposition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CleanableMultipartBodyFactory {
  private static final Logger LOGGER = LoggerFactory.getLogger(CleanableMultipartBodyFactory.class);

  private static final String ECLIPSE_MULTIPART_CONFIG = "org.eclipse.jetty.multipartConfig";
  private static final String JAVA_IO_TMPDIR = "java.io.tmpdir";

  private CleanableMultipartBodyFactory() {}

  /**
   * Creates a Cleanable MultipartBody object from HttpServletRequest
   *
   * @param httpRequest the request object
   * @param maxUploadSize the maximum allowed uploaded file size
   * @param fileSizeThreshold the file size threshold stored in memory before written to disk
   * @return a Cleanable MultipartBody
   * @throws ServletException
   * @throws IOException
   */
  public static CleanableMultipartBody create(
      HttpServletRequest httpRequest, long maxUploadSize, int fileSizeThreshold)
      throws ServletException, IOException {
    String location = System.getProperty(JAVA_IO_TMPDIR);
    MultipartConfigElement multipartConfigElement =
        new MultipartConfigElement(location, maxUploadSize, maxUploadSize, fileSizeThreshold);

    LOGGER.debug(
        "Multipart Config Element: location={}, maxFileSize={}, maxRequestSize={}, fileSizeThreshold={}",
        location,
        maxUploadSize,
        maxUploadSize,
        fileSizeThreshold);

    httpRequest.setAttribute(ECLIPSE_MULTIPART_CONFIG, multipartConfigElement);
    List<Attachment> attachments = new ArrayList<>();
    Collection<Part> parts;

    parts = httpRequest.getParts();

    for (Part part : parts) {
      String name = part.getName();
      String fileName = part.getSubmittedFileName();
      long size = part.getSize();
      String contentType = part.getContentType();

      LOGGER.debug(
          "Processing part: name={}, fileName={}, size={}, contentType={}",
          name,
          fileName,
          size,
          contentType);

      if (size > 0) {
        InputStream partStream = part.getInputStream();
        ContentDisposition contentDisposition =
            new ContentDisposition(
                "form-data; name=\"" + name + "\"; filename=\"" + fileName + "\"");

        attachments.add(new Attachment(name, partStream, contentDisposition));
      } else {
        LOGGER.warn("Ignored part with empty content: name={}, fileName={}", name, fileName);
      }
    }

    return new CleanableMultipartBody(attachments, parts, MediaType.MULTIPART_FORM_DATA_TYPE, true);
  }
}
