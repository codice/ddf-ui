/**
 * Copyright (c) Codice Foundation
 *
 * <p>This is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 3 of
 * the License, or any later version.
 *
 * <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public
 * License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.catalog.ui.query.handlers;

import static java.util.stream.Collectors.toList;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import ddf.catalog.data.Attribute;
import ddf.catalog.data.AttributeType;
import ddf.catalog.data.BinaryContent;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.Result;
import ddf.catalog.federation.FederationException;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.impl.QueryImpl;
import ddf.catalog.operation.impl.QueryRequestImpl;
import ddf.catalog.operation.impl.QueryResponseImpl;
import ddf.catalog.source.SourceUnavailableException;
import ddf.catalog.source.UnsupportedQueryException;
import ddf.catalog.transform.CatalogTransformerException;
import ddf.catalog.transform.QueryResponseTransformer;
import ddf.catalog.util.impl.CollectionResultComparator;
import ddf.catalog.util.impl.DistanceResultComparator;
import ddf.catalog.util.impl.RelevanceResultComparator;
import ddf.security.audit.SecurityLogger;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Serializable;
import java.time.Instant;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ws.rs.core.HttpHeaders;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.mime.MimeTypes;
import org.codice.ddf.catalog.ui.CqlParseException;
import org.codice.ddf.catalog.ui.metacard.transformer.CsvTransformImpl;
import org.codice.ddf.catalog.ui.query.cql.CqlRequestImpl;
import org.codice.ddf.catalog.ui.query.utility.CqlQueryResponse;
import org.codice.ddf.catalog.ui.query.utility.CqlRequest;
import org.codice.ddf.catalog.ui.util.CqlQueriesImpl;
import org.codice.ddf.catalog.ui.util.CswConstants;
import org.codice.ddf.catalog.ui.util.EndpointUtil;
import org.codice.gsonsupport.GsonTypeAdapters.DateLongFormatTypeAdapter;
import org.codice.gsonsupport.GsonTypeAdapters.LongDoubleTypeAdapter;
import org.eclipse.jetty.http.HttpStatus;
import org.geotools.api.filter.sort.SortOrder;
import org.geotools.filter.text.ecql.ECQL;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.utils.IOUtils;

public class CqlTransformHandler implements Route {

  public static final String TRANSFORMER_ID_PROPERTY = "id";

  private static final Logger LOGGER = LoggerFactory.getLogger(CqlTransformHandler.class);

  private static final Gson GSON =
      new GsonBuilder()
          .disableHtmlEscaping()
          .serializeNulls()
          .registerTypeAdapterFactory(LongDoubleTypeAdapter.FACTORY)
          .registerTypeAdapter(Date.class, new DateLongFormatTypeAdapter())
          .create();

  private EndpointUtil util;
  private List<ServiceReference> queryResponseTransformers;
  private BundleContext bundleContext;
  private CqlQueriesImpl cqlQueryUtil;
  private SecurityLogger securityLogger;

  public CqlTransformHandler(
      List<ServiceReference> queryResponseTransformers,
      BundleContext bundleContext,
      EndpointUtil endpointUtil,
      CqlQueriesImpl cqlQueryUtil,
      SecurityLogger securityLogger) {
    this.queryResponseTransformers = queryResponseTransformers;
    this.bundleContext = bundleContext;
    this.util = endpointUtil;
    this.cqlQueryUtil = cqlQueryUtil;
    this.securityLogger = securityLogger;
  }

  public class Arguments {
    private Map<String, Object> args;

    public Arguments() {
      this.args = Collections.emptyMap();
    }

    public void setArguments(Map<String, Object> arguments) {
      this.args = arguments;
    }

    public Map<String, Object> getArguments() {
      return this.args;
    }

    public Map<String, Serializable> getSerializableArguments() {
      if (this.args != null) {
        return this.args
            .entrySet()
            .stream()
            .map(
                entry ->
                    entry.getValue() instanceof CharSequence
                        ? new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue().toString())
                        : entry)
            .filter(entry -> entry.getValue() instanceof Serializable)
            .collect(Collectors.toMap(Map.Entry::getKey, e -> (Serializable) e.getValue()));
      }
      return Collections.emptyMap();
    }
  }

  public class CqlTransformRequest {
    private String exportTitle = String.format("export-%s", Instant.now().toString());
    private List<CqlRequestImpl> searches = Collections.emptyList();
    private int count = 0;
    private List<CqlRequest.Sort> sorts = Collections.emptyList();
    private boolean phonetics = false;
    private boolean spellcheck = false;
    private List<String> hiddenResults = Collections.emptyList();
    private String additionalOptions = null;

    public void setSearches(List<CqlRequestImpl> searches) {
      this.searches = searches;
    }

    public List<CqlRequestImpl> getSearches() {
      return this.searches;
    }

    public void setCount(int count) {
      this.count = count;
    }

    public int getCount() {
      return this.count;
    }

    public void setPhonetics(boolean phonetics) {
      this.phonetics = phonetics;
    }

    public boolean getPhonetics() {
      return this.phonetics;
    }

    public void setSpellcheck(boolean spellcheck) {
      this.spellcheck = spellcheck;
    }

    public boolean getSpellcheck() {
      return this.spellcheck;
    }

    public void setSorts(List<CqlRequest.Sort> sorts) {
      this.sorts = sorts;
    }

    public List<CqlRequest.Sort> getSorts() {
      return this.sorts;
    }

    public void setHiddenResults(List<String> hiddenResults) {
      this.hiddenResults = hiddenResults;
    }

    public List<String> getHiddenResults() {
      return this.hiddenResults;
    }

    public void setAdditionalOptions(String additionalOptions) {
      this.additionalOptions = additionalOptions;
    }

    public String getAdditionalOptions() {
      return this.additionalOptions;
    }
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    String transformerId = request.params(":transformerId");
    String body = util.safeGetBody(request);
    CqlTransformRequest cqlTransformRequest;

    try {
      cqlTransformRequest = GSON.fromJson(body, CqlTransformRequest.class);
    } catch (IllegalArgumentException | ArrayIndexOutOfBoundsException e) {
      LOGGER.debug("Error fetching cql request");
      response.status(HttpStatus.BAD_REQUEST_400);
      return ImmutableMap.of("message", "Error retrieving cql request");
    }

    List<CqlRequest> cqlRequests =
        cqlTransformRequest
            .getSearches()
            .stream()
            .filter(
                cqlRequest ->
                    cqlRequest.getCql() != null
                        && (cqlRequest.getSrc() != null
                            || CollectionUtils.isNotEmpty(cqlRequest.getSrcs())))
            .collect(toList());

    cqlRequests.forEach(
        cqlRequest -> {
          cqlRequest.setSorts(cqlTransformRequest.getSorts());
          cqlRequest.setPhonetics((cqlTransformRequest.getPhonetics()));
          cqlRequest.setSpellcheck((cqlTransformRequest.getSpellcheck()));
          cqlRequest.setAdditionalOptions(cqlTransformRequest.getAdditionalOptions());
        });

    if (CollectionUtils.isEmpty(cqlRequests)) {
      LOGGER.debug("Cql not found in request");
      response.status(HttpStatus.BAD_REQUEST_400);
      return ImmutableMap.of("message", "Cql not found in request");
    }

    Map<String, Serializable> arguments =
        GSON.fromJson(body, Arguments.class).getSerializableArguments();

    LOGGER.trace("Finding transformer to transform query response.");

    ServiceReference<QueryResponseTransformer> queryResponseTransformer =
        queryResponseTransformers
            .stream()
            .filter(
                transformer ->
                    transformerId.equals(transformer.getProperty(TRANSFORMER_ID_PROPERTY)))
            .findFirst()
            .orElse(null);

    if (queryResponseTransformer == null) {
      LOGGER.debug("Could not find transformer with id: {}", transformerId);
      response.status(HttpStatus.NOT_FOUND_404);
      return ImmutableMap.of("message", "Service not found");
    }

    List<Result> results =
        cqlRequests
            .stream()
            .map(
                cqlRequest -> {
                  CqlQueryResponse cqlQueryResponse = null;
                  try {
                    cqlQueryResponse = cqlQueryUtil.executeCqlQuery(cqlRequest);
                  } catch (UnsupportedQueryException
                      | SourceUnavailableException
                      | FederationException
                      | CqlParseException e) {
                    LOGGER.debug("Error fetching cql request for {}", cqlRequest.getSrc());
                    return null;
                  }
                  return cqlQueryResponse.getQueryResponse().getResults();
                })
            .filter(cqlResults -> CollectionUtils.isNotEmpty(cqlResults))
            .flatMap(cqlResults -> cqlResults.stream())
            .collect(toList());

    results.sort(getResultComparators(cqlTransformRequest.getSorts()));

    results =
        results.size() > cqlTransformRequest.getCount()
            ? results.subList(0, cqlTransformRequest.getCount())
            : results;

    results =
        CollectionUtils.isEmpty(cqlTransformRequest.getHiddenResults())
            ? results
            : results
                .stream()
                .filter(
                    result ->
                        !cqlTransformRequest
                            .getHiddenResults()
                            .contains(result.getMetacard().getId()))
                .collect(toList());

    String exportTitle =
        (results.size() == 1)
            ? results.get(0).getMetacard().getId()
            : String.format("export-%s", Instant.now().toString());

    Map<String, List<String>> exportsBySource =
        results
            .stream()
            .collect(
                Collectors.toMap(
                    result -> result.getMetacard().getSourceId(),
                    result -> new ArrayList<>(Arrays.asList(result.getMetacard().getId())),
                    (existing, replacement) -> {
                      existing.addAll(replacement);
                      return existing;
                    }));

    for (Map.Entry sourceExportMap : exportsBySource.entrySet()) {
      securityLogger.audit(
          String.format(
              "exported metacards: %s from source: %s to format: %s",
              sourceExportMap.getValue(), sourceExportMap.getKey(), transformerId));
    }

    QueryResponse combinedResponse =
        new QueryResponseImpl(
            new QueryRequestImpl(new QueryImpl(ECQL.toFilter(cqlRequests.get(0).getCql()))),
            results,
            results.size());

    Object schema = queryResponseTransformer.getProperty("schema");

    List<String> mimeTypeServiceProperty =
        queryResponseTransformer.getProperty("mime-type") instanceof List
            ? (List) queryResponseTransformer.getProperty("mime-type")
            : Collections.singletonList((String) queryResponseTransformer.getProperty("mime-type"));

    if (mimeTypeServiceProperty.contains("text/csv")
        || mimeTypeServiceProperty.contains(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        || mimeTypeServiceProperty.contains("application/rtf")) {
      arguments = csvTransformArgumentsAdapter(arguments);
    } else if (schema != null && schema.toString().equals(CswConstants.CSW_NAMESPACE_URI)) {
      arguments = cswTransformArgumentsAdapter();
    }

    List<String> metacardIds =
        results.stream().map(Result::getMetacard).map(Metacard::getId).collect(toList());

    Set<String> sources =
        results
            .stream()
            .map(Result::getMetacard)
            .map(Metacard::getSourceId)
            .collect(Collectors.toSet());

    attachFileToResponse(
        response,
        queryResponseTransformer,
        combinedResponse,
        arguments,
        exportTitle,
        metacardIds,
        sources,
        transformerId);

    return "";
  }

  public List<ServiceReference> getQueryResponseTransformers() {
    return queryResponseTransformers;
  }

  private void setHttpHeaders(Response response, BinaryContent content, String exportTitle)
      throws MimeTypeException {
    String mimeType = content.getMimeTypeValue();

    if (mimeType == null) {
      LOGGER.debug("Failure to fetch file extension, mime-type is empty");
      throw new IllegalArgumentException("Binary Content contains null mime-type value.");
    }

    String fileExt = getFileExtFromMimeType(mimeType);

    response.type(mimeType);
    String attachment = String.format("attachment;filename=\"%s%s\"", exportTitle, fileExt);
    response.header(HttpHeaders.CONTENT_DISPOSITION, attachment);
  }

  private String getFileExtFromMimeType(String mimeType) throws MimeTypeException {
    MimeTypes allTypes = MimeTypes.getDefaultMimeTypes();
    String fileExt = allTypes.forName(mimeType).getExtension();
    if (StringUtils.isEmpty(fileExt)) {
      LOGGER.debug("Null or empty file extension from mime-type {}", mimeType);
    }
    return fileExt;
  }

  private void attachFileToResponse(
      Response response,
      ServiceReference<QueryResponseTransformer> queryResponseTransformer,
      QueryResponse cqlQueryResponse,
      Map<String, Serializable> arguments,
      String exportTitle,
      List<String> metacardIds,
      Set<String> sources,
      String transformerId)
      throws CatalogTransformerException, IOException, MimeTypeException {
    BinaryContent content =
        bundleContext.getService(queryResponseTransformer).transform(cqlQueryResponse, arguments);

    setHttpHeaders(response, content, exportTitle);

    try (OutputStream servletOutputStream = response.raw().getOutputStream();
        InputStream resultStream = content.getInputStream()) {
      long byteCount = IOUtils.copyLarge(resultStream, servletOutputStream);
      securityLogger.audit(
          String.format(
              "exported metacards: %s from source(s): %s to format: %s with output size: %d bytes",
              metacardIds, sources, transformerId, byteCount));
    }

    response.status(HttpStatus.OK_200);

    LOGGER.trace(
        "Successfully output file using transformer id {}",
        queryResponseTransformer.getProperty("id"));
  }

  private CollectionResultComparator getResultComparators(List<CqlRequest.Sort> sorts) {
    CollectionResultComparator resultComparator = new CollectionResultComparator();
    if (sorts == null) {
      return resultComparator;
    }
    for (CqlRequest.Sort sort : sorts) {
      Comparator<Result> comparator;

      String sortType = sort.getAttribute();
      SortOrder sortOrder =
          (sort.getDirection() != null && sort.getDirection().equals("descending"))
              ? SortOrder.DESCENDING
              : SortOrder.ASCENDING;

      if (Result.RELEVANCE.equals(sortType)) {
        comparator = new RelevanceResultComparator(sortOrder);
      } else if (Result.DISTANCE.equals(sortType)) {
        comparator = new DistanceResultComparator(sortOrder);
      } else {
        comparator =
            Comparator.comparing(
                r -> getAttributeValue((Result) r, sortType),
                ((sortOrder == SortOrder.ASCENDING)
                    ? Comparator.nullsLast(Comparator.<Comparable>naturalOrder())
                    : Comparator.nullsLast(Comparator.<Comparable>reverseOrder())));
      }
      resultComparator.addComparator(comparator);
    }
    return resultComparator;
  }

  private static Comparable getAttributeValue(Result result, String attributeName) {
    final Attribute attribute = result.getMetacard().getAttribute(attributeName);

    if (attribute == null) {
      return null;
    }

    AttributeType.AttributeFormat format =
        result
            .getMetacard()
            .getMetacardType()
            .getAttributeDescriptor(attributeName)
            .getType()
            .getAttributeFormat();

    switch (format) {
      case STRING:
        return attribute.getValue() != null ? attribute.getValue().toString().toLowerCase() : "";
      case DATE:
      case BOOLEAN:
      case INTEGER:
      case FLOAT:
        return attribute.getValue() instanceof Comparable
            ? (Comparable) attribute.getValue()
            : null;
      default:
        return "";
    }
  }

  private Map<String, Serializable> cswTransformArgumentsAdapter() {
    Map<String, Serializable> args = new HashMap<>();
    args.put(CswConstants.IS_BY_ID_QUERY, true);
    return args;
  }

  private Map<String, Serializable> csvTransformArgumentsAdapter(
      Map<String, Serializable> arguments) {
    String columnOrder = "\"columnOrder\":" + GSON.toJson(arguments.get("columnOrder"));
    String hiddenFields = "\"hiddenFields\":" + GSON.toJson(arguments.get("hiddenFields"));
    String columnAliasMap = "\"columnAliasMap\":" + GSON.toJson(arguments.get("columnAliasMap"));
    String csvBody = String.format("{%s,%s,%s}", columnOrder, columnAliasMap, hiddenFields);

    CsvTransformImpl queryTransform = GSON.fromJson(csvBody, CsvTransformImpl.class);

    Set<String> hiddenFieldsSet =
        queryTransform.getHiddenFields() != null
            ? queryTransform.getHiddenFields()
            : Collections.emptySet();

    List<String> columnOrderList =
        queryTransform.getColumnOrder() != null
            ? queryTransform.getColumnOrder()
            : Collections.emptyList();

    Map<String, String> aliasMap =
        queryTransform.getColumnAliasMap() != null
            ? queryTransform.getColumnAliasMap()
            : Collections.emptyMap();

    return ImmutableMap.<String, Serializable>builder()
        .put("hiddenFields", (Serializable) hiddenFieldsSet)
        .put("columnOrder", (Serializable) columnOrderList)
        .put("aliases", (Serializable) aliasMap)
        .build();
  }
}
