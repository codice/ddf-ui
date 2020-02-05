package org.codice.ddf.catalog.ui.query.utility;

import ddf.catalog.operation.QueryResponse;
import java.util.List;
import java.util.Map;

/**
 * <b> This code is experimental. While this interface is functional and tested, it may change or be
 * removed in a future version of the library. </b>
 */
public interface CqlQueryResponse {

  QueryResponse getQueryResponse();

  List<CqlResult> getResults();

  Map<String, Map<String, MetacardAttribute>> getTypes();

  String getId();

  Status getStatus();
}
