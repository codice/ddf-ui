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
package org.codice.ddf.catalog.ui.enumeration;

import static org.apache.commons.lang.StringUtils.isBlank;

import com.google.common.collect.Sets;
import ddf.catalog.data.AttributeDescriptor;
import ddf.catalog.data.AttributeInjector;
import ddf.catalog.data.Metacard;
import ddf.catalog.data.MetacardType;
import ddf.catalog.data.impl.AttributeImpl;
import ddf.catalog.data.impl.MetacardImpl;
import ddf.catalog.validation.AttributeValidatorRegistry;
import ddf.catalog.validation.violation.ValidationViolation;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import org.codice.ddf.catalog.ui.enumeration.api.DeprecatableEnumeration;

/** This class is Experimental and subject to change */
public class ExperimentalEnumerationExtractor {
  private final AttributeValidatorRegistry attributeValidatorRegistry;

  private final List<MetacardType> metacardTypes;

  private final List<AttributeInjector> attributeInjectors;

  private final List<DeprecatableEnumeration> deprecatableEnumerations;

  /**
   * @deprecated This constructor does not take into account injected attributes. The other
   *     constructor {@link #ExperimentalEnumerationExtractor(AttributeValidatorRegistry, List,
   *     List, List)} should be used.
   */
  @Deprecated
  public ExperimentalEnumerationExtractor(
      AttributeValidatorRegistry attributeValidatorRegistry, List<MetacardType> metacardTypes) {
    this(
        attributeValidatorRegistry,
        metacardTypes,
        Collections.emptyList(),
        Collections.emptyList());
  }

  /**
   * @param attributeValidatorRegistry validators to build enumerations from
   * @param metacardTypes metacard types to associate attributes with types
   * @param attributeInjectors injected attributes
   */
  public ExperimentalEnumerationExtractor(
      AttributeValidatorRegistry attributeValidatorRegistry,
      List<MetacardType> metacardTypes,
      List<AttributeInjector> attributeInjectors,
      List<DeprecatableEnumeration> deprecatableEnumerations) {
    this.attributeValidatorRegistry = attributeValidatorRegistry;
    this.metacardTypes = metacardTypes;
    this.attributeInjectors = attributeInjectors;
    this.deprecatableEnumerations = deprecatableEnumerations;
  }

  public Map<String, Set<String>> getAttributeEnumerations(String attribute) {
    return attributeValidatorRegistry
        .getValidators(attribute)
        .stream()
        .map(av -> av.validate(new AttributeImpl(attribute, "null")))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .filter(avr -> !avr.getSuggestedValues().isEmpty())
        .map(
            avr ->
                avr.getAttributeValidationViolations()
                    .stream()
                    .map(ValidationViolation::getAttributes)
                    .flatMap(Set::stream)
                    .distinct()
                    .collect(Collectors.toMap(o -> o, o -> avr.getSuggestedValues())))
        .reduce(this::union)
        .orElseGet(HashMap::new);
  }

  public Map<String, Set<String>> getDeprecatedEnumerations(@Nullable String metacardType) {
    if (isBlank(metacardType)) {
      metacardType = MetacardImpl.BASIC_METACARD.getName();
    }
    MetacardType type = getTypeFromName(metacardType);

    if (type == null) {
      return new HashMap<>();
    }

    type = applyInjectors(type, attributeInjectors);

    return type.getAttributeDescriptors()
        .stream()
        .map(this::toDeprecatedEnumeration)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .filter(this::isNotEmpty)
        .map(this::toMap)
        .reduce(this::union)
        .orElseGet(HashMap::new);
  }

  public Map<String, Set<String>> getEnumerations(@Nullable String metacardType) {
    if (isBlank(metacardType)) {
      metacardType = MetacardImpl.BASIC_METACARD.getName();
    }
    MetacardType type = getTypeFromName(metacardType);

    if (type == null) {
      return new HashMap<>();
    }

    type = applyInjectors(type, attributeInjectors);

    return type.getAttributeDescriptors()
        .stream()
        .flatMap(
            ad ->
                attributeValidatorRegistry
                    .getValidators(ad.getName())
                    .stream()
                    .map(av -> av.validate(new AttributeImpl(ad.getName(), "null"))))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .filter(avr -> !avr.getSuggestedValues().isEmpty())
        .map(
            avr ->
                avr.getAttributeValidationViolations()
                    .stream()
                    .map(ValidationViolation::getAttributes)
                    .flatMap(Set::stream)
                    .distinct()
                    .collect(Collectors.toMap(o -> o, o -> avr.getSuggestedValues())))
        .reduce(this::union)
        .orElseGet(HashMap::new);
  }

  private Optional<DeprecatableEnumeration> toDeprecatedEnumeration(
      AttributeDescriptor attributeDescriptor) {
    return getDeprecatedAttributeEnumerations(attributeDescriptor.getName());
  }

  private boolean isNotEmpty(DeprecatableEnumeration deprecatableEnumeration) {
    return !deprecatableEnumeration.getDeprecatedValues().isEmpty();
  }

  private Map<String, Set<String>> union(
      Map<String, Set<String>> firstMap, Map<String, Set<String>> secondMap) {
    secondMap.forEach((key, value) -> firstMap.merge(key, value, Sets::union));
    return firstMap;
  }

  private Map<String, Set<String>> toMap(DeprecatableEnumeration deprecatableEnumeration) {
    Map<String, Set<String>> map = new HashMap<>();
    map.put(deprecatableEnumeration.getAttribute(), deprecatableEnumeration.getDeprecatedValues());
    return map;
  }

  private Optional<DeprecatableEnumeration> getDeprecatedAttributeEnumerations(String attribute) {
    return deprecatableEnumerations
        .stream()
        .filter(deprecatableEnumeration -> deprecatableEnumeration.getAttribute().equals(attribute))
        .findFirst();
  }

  @Nullable
  private MetacardType getTypeFromName(String metacardType) {
    return metacardTypes
        .stream()
        .filter(mt -> mt.getName().equals(metacardType))
        .findFirst()
        .orElse(null);
  }

  private MetacardType applyInjectors(MetacardType original, List<AttributeInjector> injectors) {
    Metacard metacard = new MetacardImpl(original);
    for (AttributeInjector injector : injectors) {
      metacard = injector.injectAttributes(metacard);
    }
    return metacard.getMetacardType();
  }
}
