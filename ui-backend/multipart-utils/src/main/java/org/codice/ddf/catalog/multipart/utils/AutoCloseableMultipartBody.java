package org.codice.ddf.catalog.multipart.utils;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import javax.servlet.http.Part;
import javax.ws.rs.core.MediaType;
import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.MultipartBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AutoCloseableMultipartBody extends MultipartBody implements AutoCloseable {

  private static final Logger LOGGER = LoggerFactory.getLogger(AutoCloseableMultipartBody.class);
  private final Collection<Part> parts;

  public AutoCloseableMultipartBody(
      List<Attachment> atts, Collection<Part> parts, MediaType mt, boolean outbound) {
    super(atts, mt, outbound);
    this.parts = parts;
  }

  @Override
  public void close() {
    try {
      for (Part part : parts) {
        part.delete();
        LOGGER.debug("Temporary file '{}' deleted successfully", part.getName());
      }
    } catch (IOException e) {
      LOGGER.error("Failed to delete temporary files", e);
    }
  }

  public Collection<Part> getParts() {
    return parts;
  }
}
