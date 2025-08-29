package org.codice.ddf.catalog.ui.catalog;

import java.util.Collection;
import java.util.List;
import javax.servlet.http.Part;
import javax.ws.rs.core.MediaType;
import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.MultipartBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CleanableMultipartBody extends MultipartBody {

  private static final Logger LOGGER = LoggerFactory.getLogger(CleanableMultipartBody.class);
  private final Collection<Part> parts;

  public CleanableMultipartBody(
      List<Attachment> atts, Collection<Part> parts, MediaType mt, boolean outbound) {
    super(atts, mt, outbound);
    this.parts = parts;
  }

  public void cleanup() {
    try {
      for (Part part : parts) {
        part.delete();
        LOGGER.debug("Temporary file '{}' deleted successfully", part.getName());
      }
    } catch (Exception e) {
      LOGGER.error("Failed to delete temporary files", e);
    }
  }
}
