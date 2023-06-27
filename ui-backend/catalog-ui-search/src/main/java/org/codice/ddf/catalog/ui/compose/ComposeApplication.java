/*
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
package org.codice.ddf.catalog.ui.compose;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static spark.Spark.after;
import static spark.Spark.exception;
import static spark.Spark.get;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import ddf.catalog.CatalogFramework;
import ddf.catalog.data.AttributeRegistry;
import ddf.catalog.data.MetacardType;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.transform.QueryResponseTransformer;
import ddf.security.SubjectIdentity;
import ddf.security.SubjectOperations;
import ddf.security.audit.SecurityLogger;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.codice.ddf.catalog.ui.catalog.CatalogApplication;
import org.codice.ddf.catalog.ui.config.ConfigurationApplication;
import org.codice.ddf.catalog.ui.configuration.PlatformUiConfigurationApplication;
import org.codice.ddf.catalog.ui.enumeration.ExperimentalEnumerationExtractor;
import org.codice.ddf.catalog.ui.metacard.associations.Associated;
import org.codice.ddf.catalog.ui.metacard.internal.OperationPropertySupplier;
import org.codice.ddf.catalog.ui.metacard.notes.NoteUtil;
import org.codice.ddf.catalog.ui.metacard.validation.Validator;
import org.codice.ddf.catalog.ui.metacard.workspace.transformer.WorkspaceTransformer;
import org.codice.ddf.catalog.ui.metacard.workspace.transformer.impl.AssociatedQueryMetacardsHandler;
import org.codice.ddf.catalog.ui.query.monitor.api.WorkspaceService;
import org.codice.ddf.catalog.ui.security.app.UserApplication;
import org.codice.ddf.catalog.ui.subscription.SubscriptionsPersistentStore;
import org.codice.ddf.catalog.ui.util.EndpointUtil;
import org.codice.ddf.security.Security;
import org.codice.gsonsupport.GsonTypeAdapters.LongDoubleTypeAdapter;
import spark.servlet.SparkApplication;

public class ComposeApplication implements SparkApplication {

  private static final Gson GSON =
      new GsonBuilder()
          .disableHtmlEscaping()
          .serializeNulls()
          .registerTypeAdapterFactory(LongDoubleTypeAdapter.FACTORY)
          .create();

  private final CatalogFramework catalogFramework;
  private final FilterBuilder filterBuilder;
  private final EndpointUtil util;
  private final Validator validator;
  private final WorkspaceTransformer transformer;
  private final ExperimentalEnumerationExtractor enumExtractor;
  private final SubscriptionsPersistentStore subscriptions;
  private final List<MetacardType> types;
  private final Associated associated;
  private final QueryResponseTransformer csvQueryResponseTransformer;
  private final SubjectIdentity subjectIdentity;

  private final AttributeRegistry attributeRegistry;

  private final ConfigurationApplication configuration;

  private final NoteUtil noteUtil;

  private final WorkspaceService workspaceService;

  private final AssociatedQueryMetacardsHandler queryMetacardsHandler;

  private final Security security;

  private OperationPropertySupplier operationPropertySupplier;

  private SubjectOperations subjectOperations;

  private SecurityLogger securityLogger;

  private UserApplication userApplication;
  private PlatformUiConfigurationApplication platformUiConfigurationApplication;

  private CatalogApplication catalogApplication;

  public ComposeApplication(
      CatalogFramework catalogFramework,
      FilterBuilder filterBuilder,
      EndpointUtil endpointUtil,
      Validator validator,
      WorkspaceTransformer transformer,
      ExperimentalEnumerationExtractor enumExtractor,
      SubscriptionsPersistentStore subscriptions,
      List<MetacardType> types,
      Associated associated,
      QueryResponseTransformer csvQueryResponseTransformer,
      AttributeRegistry attributeRegistry,
      ConfigurationApplication configuration,
      NoteUtil noteUtil,
      SubjectIdentity subjectIdentity,
      WorkspaceService workspaceService,
      AssociatedQueryMetacardsHandler queryMetacardsHandler,
      Security security,
      UserApplication userApplication,
      PlatformUiConfigurationApplication platformUiConfigurationApplication,
      CatalogApplication catalogApplication) {
    this.catalogFramework = catalogFramework;
    this.filterBuilder = filterBuilder;
    this.util = endpointUtil;
    this.validator = validator;
    this.transformer = transformer;
    this.enumExtractor = enumExtractor;
    this.subscriptions = subscriptions;
    this.types = types;
    this.associated = associated;
    this.csvQueryResponseTransformer = csvQueryResponseTransformer;
    this.attributeRegistry = attributeRegistry;
    this.configuration = configuration;
    this.noteUtil = noteUtil;
    this.subjectIdentity = subjectIdentity;
    this.workspaceService = workspaceService;
    this.queryMetacardsHandler = queryMetacardsHandler;
    this.security = security;
    this.userApplication = userApplication;
    this.platformUiConfigurationApplication = platformUiConfigurationApplication;
    this.catalogApplication = catalogApplication;
  }

  public void addOperationPropertySupplier(OperationPropertySupplier operationPropertySupplier) {
    this.operationPropertySupplier = operationPropertySupplier;
  }

  public void removeOperationPropertySupplier(OperationPropertySupplier operationPropertySupplier) {
    this.operationPropertySupplier = null;
  }

  private Map<String, Object> getMandatoryAttributes() {
    Map<String, Object> attributeMap = new HashMap<>();

    Map<String, Object> anyText = new HashMap<>();
    anyText.put("id", "anyText");
    anyText.put("type", "STRING");
    anyText.put("multivalued", false);

    Map<String, Object> anyGeo = new HashMap<>();
    anyGeo.put("id", "anyGeo");
    anyGeo.put("type", "LOCATION");
    anyGeo.put("multivalued", false);

    Map<String, Object> anyDate = new HashMap<>();
    anyDate.put("id", "anyDate");
    anyDate.put("type", "DATE");
    anyDate.put("multivalued", false);
    anyDate.put("hidden", true);

    Map<String, Object> metacardType = new HashMap<>();
    metacardType.put("id", "metacard-type");
    metacardType.put("type", "STRING");
    metacardType.put("multivalued", false);
    metacardType.put("readOnly", true);

    Map<String, Object> sourceId = new HashMap<>();
    sourceId.put("id", "source-id");
    sourceId.put("type", "STRING");
    sourceId.put("multivalued", false);
    sourceId.put("readOnly", true);

    Map<String, Object> cached = new HashMap<>();
    cached.put("id", "cached");
    cached.put("type", "STRING");
    cached.put("multivalued", false);

    Map<String, Object> metacardTags = new HashMap<>();
    metacardTags.put("id", "metacard-tags");
    metacardTags.put("type", "STRING");
    metacardTags.put("multivalued", true);

    attributeMap.put("anyText", anyText);
    attributeMap.put("anyGeo", anyGeo);
    attributeMap.put("anyDate", anyDate);
    attributeMap.put("metacard-type", metacardType);
    attributeMap.put("source-id", sourceId);
    attributeMap.put("cached", cached);
    attributeMap.put("metacard-tags", metacardTags);

    return attributeMap;
  }

  private Map<String, Object> addAliases(
      Map<String, Object> originalAttributeMap, Map<String, String> attributeAliases) {
    Map<String, Object> attributeMap = new HashMap<>(originalAttributeMap);

    for (Map.Entry<String, String> alias : attributeAliases.entrySet()) {
      Map<String, Object> attribute = (Map<String, Object>) attributeMap.get(alias.getKey());
      if (attribute != null) {
        attribute.put("alias", alias.getValue());
      }
    }

    return attributeMap;
  }

  private Map<String, Object> addEnumerations(Map<String, Object> originalAttributeMap) {
    Map<String, Object> attributeMap = new HashMap<>(originalAttributeMap);

    for (Entry<String, Object> attributeDefinition : attributeMap.entrySet()) {
      Map<String, Object> attribute =
          (Map<String, Object>) attributeMap.get(attributeDefinition.getKey());
      attribute.put(
          "enumerations",
          enumExtractor
              .getAttributeEnumerations(attributeDefinition.getKey())
              .get(attributeDefinition.getKey()));
    }

    return attributeMap;
  }

  public static List<Map<String, Object>> sortAttributeMapToList(Map<String, Object> attributeMap) {
    List<Map.Entry<String, Object>> entryList = new ArrayList<>(attributeMap.entrySet());

    Collections.sort(
        entryList,
        new Comparator<Map.Entry<String, Object>>() {
          @Override
          public int compare(Map.Entry<String, Object> entry1, Map.Entry<String, Object> entry2) {
            Object value1 = entry1.getValue();
            Object value2 = entry2.getValue();

            if (value1 instanceof Map && value2 instanceof Map) {
              Map<String, Object> map1 = (Map<String, Object>) value1;
              Map<String, Object> map2 = (Map<String, Object>) value2;
              String alias1 = (String) map1.getOrDefault("alias", map1.get("id"));
              String alias2 = (String) map2.getOrDefault("alias", map2.get("id"));
              return alias1.compareTo(alias2);
            }

            // If "alias" is not present, fallback to comparing by key (id)
            return entry1.getKey().compareTo(entry2.getKey());
          }
        });

    List<Map<String, Object>> resultList = new ArrayList<>();
    for (Map.Entry<String, Object> entry : entryList) {
      Object value = entry.getValue();
      if (value instanceof Map) {
        resultList.add((Map<String, Object>) value);
      }
    }

    return resultList;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void init() {

    get(
        "/compose/startup",
        APPLICATION_JSON,
        (req, res) -> {
          Map<String, Object> payload = new HashMap<>();
          Map<String, Object> config = this.configuration.getConfig();
          payload.put("config", config);

          // Retrieve all Metacard types
          Map<String, Object> metacardTypeMap = util.getMetacardTypeMap();

          payload.put("metacardTypes", metacardTypeMap);

          Map<String, Object> attributeMap = getAttributeMap(config, metacardTypeMap);

          payload.put("attributeMap", attributeMap);

          payload.put("sortedAttributes", sortAttributeMapToList(attributeMap));

          // // Retrieve enumerations for each Metacard type
          // Map<String, Map<String, Set<String>>> enumerations = new HashMap<>();
          // for (String typeName : metacardTypes) {
          // Map<String, Set<String>> typeEnumerations =
          // enumExtractor.getEnumerations(typeName);
          // enumerations.put(typeName, typeEnumerations);
          // }
          // payload.put("enumerations", enumerations);

          // // Retrieve deprecated enumerations for each Metacard type
          // Map<String, Map<String, Set<String>>> deprecatedEnumerations = new
          // HashMap<>();
          // for (String typeName : metacardTypes) {
          // Map<String, Set<String>> deprecatedTypeEnumerations =
          // enumExtractor.getDeprecatedEnumerations(typeName);
          // deprecatedEnumerations.put(typeName, deprecatedTypeEnumerations);
          // }
          // payload.put("deprecatedEnums", deprecatedEnumerations);

          payload.put("user", this.userApplication.getUser());
          payload.put(
              "platformUiConfiguration",
              GSON.fromJson(
                  this.platformUiConfigurationApplication.getConfigAsJsonString(), Map.class));
          payload.put("sources", getSources());
          payload.put("localSourceId", catalogFramework.getId());
          return util.getJson(payload);
        });

    after((req, res) -> res.type(APPLICATION_JSON));

    exception(IOException.class, util::handleIOException);

    exception(RuntimeException.class, util::handleRuntimeException);
  }

  private List<Object> getSources() throws IOException {
    String localCatalogId = catalogFramework.getId();
    List<Object> sources = GSON.fromJson(this.catalogApplication.getSources(), List.class);
    sources.forEach(
        source -> {
          Map<String, Object> sourceMap = (Map<String, Object>) source;
          String sourceId = (String) sourceMap.get("id");
          if (sourceId.equals(localCatalogId)) {
            sourceMap.put("local", true);
          }
        });
    return sources;
  }

  private Map<String, Object> getAttributeMap(
      Map<String, Object> config, Map<String, Object> metacardTypeMap) {
    // Add each Metacard type's attributes to a common attribute map
    Map<String, Object> attributeMap = new HashMap<>(getMandatoryAttributes());
    for (Object definition : metacardTypeMap.values()) {
      if (definition instanceof Map) {
        attributeMap.putAll((Map<String, Object>) definition);
      }
    }
    Map<String, Object> attributeMapWithAliases =
        addAliases(attributeMap, (Map<String, String>) config.get("attributeAliases"));

    Map<String, Object> attributeMapWithEnums = addEnumerations(attributeMapWithAliases);
    return attributeMapWithEnums;
  }

  public void setSubjectOperations(SubjectOperations subjectOperations) {
    this.subjectOperations = subjectOperations;
  }

  public void setSecurityLogger(SecurityLogger securityLogger) {
    this.securityLogger = securityLogger;
  }
}
