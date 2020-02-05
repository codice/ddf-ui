package org.codice.ddf.catalog.ui.query.utility;

/**
 * <b> This code is experimental. While this interface is functional and tested, it may change or be
 * removed in a future version of the library. </b>
 */
public interface Status {
  long getHits();

  long getElapsed();

  String getId();

  long getCount();

  boolean getSuccessful();
}
