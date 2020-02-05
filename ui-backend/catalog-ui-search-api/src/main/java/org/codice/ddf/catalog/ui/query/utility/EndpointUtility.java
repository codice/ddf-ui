package org.codice.ddf.catalog.ui.query.utility;

import ddf.catalog.data.Result;
import java.util.Map;

/**
 * <b> This code is experimental. While this interface is functional and tested, it may change or be
 * removed in a future version of the library. </b>
 */
public interface EndpointUtility {
  Map<String, Result> getMetacardsByTag(String tagStr);
}
