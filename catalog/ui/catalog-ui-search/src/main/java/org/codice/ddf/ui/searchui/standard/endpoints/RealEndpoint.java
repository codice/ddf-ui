/**
 * Copyright (c) Codice Foundation
 * <p>
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 * <p>
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.ui.searchui.standard.endpoints;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.boon.json.JsonFactory;
import org.boon.json.JsonParserFactory;
import org.boon.json.JsonSerializerFactory;

import ddf.catalog.CatalogFramework;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.MetacardType;
import ddf.catalog.data.impl.AttributeImpl;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.UpdateResponse;
import ddf.catalog.operation.impl.UpdateRequestImpl;
import ddf.catalog.validation.AttributeValidatorRegistry;
import ddf.catalog.validation.ReportingMetacardValidator;
import ddf.catalog.validation.impl.violation.ValidationViolationImpl;
import ddf.catalog.validation.report.MetacardValidationReport;
import ddf.catalog.validation.violation.ValidationViolation;

public class RealEndpoint {
    private final CatalogFramework catalogFramework;

    private final ReportingMetacardValidator reportingMetacardValidator;

    private final EndpointUtil endpointUtil;

    public RealEndpoint(CatalogFramework catalogFramework,
            ReportingMetacardValidator reportingMetacardValidator, EndpointUtil endpointUtil) {
        this.catalogFramework = catalogFramework;
        this.reportingMetacardValidator = reportingMetacardValidator;
        this.endpointUtil = endpointUtil;
    }

    @GET
    @Path("/metacardtype")
    public Response getMetacardType() throws Exception {
        Map<String, Object> resultTypes = endpointUtil.getMetacardTypeMap();
        return Response.ok(JsonFactory.create()
                .toJson(resultTypes), MediaType.APPLICATION_JSON)
                .build();
    }

    @GET
    @Path("/metacard/{id}")
    public Response getMetacard(@PathParam("id") String id) throws Exception {
        Metacard metacard = endpointUtil.getMetacard(id);
        if (metacard == null) {
            return Response.status(404)
                    .build();
        }

        Map<String, Object> response = endpointUtil.transformToJson(metacard);

        return Response.ok(JsonFactory.create(new JsonParserFactory(),
                new JsonSerializerFactory().includeNulls()
                        .includeEmpty())
                .toJson(response), MediaType.APPLICATION_JSON)
                .build();
    }

    @POST
    @Path("/metacard")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createMetacard(String metacard) throws Exception {
        throw new GoldPlatingException();
    }

    public class GoldPlatingException extends Exception {
    }

    @PUT
    @Path("/metacard")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateMetacard(String metacard) throws Exception {
        Map<String, Object> metacardMap = JsonFactory.create()
                .parser()
                .parseMap(metacard);
        Metacard newMetacard = endpointUtil.getMetacard((String) metacardMap.get(Metacard.ID));
        if (newMetacard == null) {
            return Response.status(404)
                    .build();
        }
        MetacardType metacardType = newMetacard.getMetacardType();

        for (Map.Entry<String, Object> entry : metacardMap.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }

            if (Metacard.THUMBNAIL.equals(entry.getKey())) {
                newMetacard.setAttribute(new AttributeImpl(Metacard.THUMBNAIL,
                        (String) entry.getValue()));
            }

            if (metacardType.getAttributeDescriptor(entry.getKey())
                    .isMultiValued()) {
                newMetacard.setAttribute(new AttributeImpl(entry.getKey(),
                        getSerializableList((List) entry.getValue())));
            } else {
                Serializable data = null;
                if (entry.getValue() instanceof List) {
                    data = getSerializableList((List) entry.getValue()).get(0);
                } else if (entry.getValue() instanceof Long) {
                    data = (Long) entry.getValue();
                } else if (entry.getValue() instanceof String) {
                    data = (String) entry.getValue();
                } else {
                    throw new GoldPlatingException();
                }
                newMetacard.setAttribute(new AttributeImpl(entry.getKey(), data));
            }
        }

        // TODO (RCZ) - don't assume this only service, do for real
        Optional<MetacardValidationReport> metacardValidationReport =
                reportingMetacardValidator.validateMetacard(newMetacard);

        if (metacardValidationReport.isPresent()) {
            Set<ValidationViolation> attributeValidationViolations = metacardValidationReport.get()
                    .getAttributeValidationViolations();

            /*Set<ValidationViolation> resultViolations = new HashSet<>();
            for (ValidationViolation violation : attributeValidationViolations) {
                if (violation.getAttributes()
                        .size() <= 1) {
                    resultViolations.add(violation);
                    continue;
                }
                resultViolations.addAll(violation.getAttributes()
                        .stream()
                        .map(attribute -> new ValidationViolationImpl(Collections.singleton(
                                attribute), violation.getMessage(), violation.getSeverity()))
                        .collect(Collectors.toList()));
            }*/

            Set<AndrewsValidationViolation> resultViolations =
                    attributeValidationViolations.stream()
                            .flatMap(v -> v.getAttributes()
                                    .stream()
                                    .map(attribute -> new AndrewsValidationViolation(attribute,
                                            v.getMessage(),
                                            v.getSeverity()))
                                    .collect(Collectors.toList())
                                    .stream())
                            .collect(Collectors.toSet());

            return Response.status(400)
                    .entity(resultViolations)
                    .build();
        }

        /*UpdateResponse updateResponse =
                catalogFramework.update(new UpdateRequestImpl(newMetacard.getId(), newMetacard));
        if (updateResponse.getProcessingErrors() != null && !updateResponse.getProcessingErrors()
                .isEmpty()) {
            // TODO (RCZ) - should probably pull actual processing errors?
            return Response.status(400)
                    .build();
        }*/

        return Response.ok(JsonFactory.create(new JsonParserFactory(),
                new JsonSerializerFactory().includeNulls()
                        .includeEmpty())
                .toJson(endpointUtil.transformToJson(newMetacard)), MediaType.APPLICATION_JSON)
                .build();
    }

    @GET
    @Path("/metacard/{id}/validation")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response validateMetacard(@PathParam("id") String id) throws Exception {
        Metacard newMetacard = endpointUtil.getMetacard(id);
        MetacardType metacardType = newMetacard.getMetacardType();

        // TODO (RCZ) - don't assume this only service, do for real
        Optional<MetacardValidationReport> metacardValidationReport =
                reportingMetacardValidator.validateMetacard(newMetacard);

        if (metacardValidationReport.isPresent()) {
            Set<ValidationViolation> attributeValidationViolations = metacardValidationReport.get()
                    .getAttributeValidationViolations();

            Set<AndrewsValidationViolation> resultViolations =
                    attributeValidationViolations.stream()
                            .flatMap(v -> v.getAttributes()
                                    .stream()
                                    .map(attribute -> new AndrewsValidationViolation(attribute,
                                            v.getMessage(),
                                            v.getSeverity()))
                                    .collect(Collectors.toList())
                                    .stream())
                            .collect(Collectors.toSet());

            return Response.ok(resultViolations, MediaType.APPLICATION_JSON)
                    .build();

        }
        return Response.ok("[]", MediaType.APPLICATION_JSON)
                .build();
    }

    private List<Serializable> getSerializableList(List list) {
        return new ArrayList<>(list);
    }

    private class AndrewsValidationViolation {
        String attribute;

        String message;

        ValidationViolation.Severity severity;

        private AndrewsValidationViolation(String attribute, String message,
                ValidationViolation.Severity severity) {
            this.attribute = attribute;
            this.message = message;
            this.severity = severity;
        }
    }
}
