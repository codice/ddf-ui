package org.codice.ddf.catalog.ui.query.utility;

import ddf.action.Action;
import java.util.List;
import java.util.Map;

/**
 * <b> This code is experimental. While this interface is functional and tested, it may change or be
 * removed in a future version of the library. </b>
 */
public interface CqlResult {
  Map<String, Object> getMetacard();

  Double getDistance();

  Double getRelevance();

  List<Action> getActions();

  boolean getHasThumbnail();

  boolean getIsResourceLocal();

  Map<String, Integer> getMatches();
}
