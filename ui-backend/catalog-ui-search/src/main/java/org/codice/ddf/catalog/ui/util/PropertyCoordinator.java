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
package org.codice.ddf.catalog.ui.util;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.codice.ddf.catalog.ui.metacard.internal.PropertySupplier;

/**
 * Merge the results of multiple PropertySupplier instances. If the same key is returned by multiple
 * instances, then the results are undefined.
 */
public class PropertyCoordinator {

  private final List<PropertySupplier> propertySuppliers;

  public PropertyCoordinator(List<PropertySupplier> propertySuppliers) {
    this.propertySuppliers = propertySuppliers;
  }

  public Map<String, Serializable> gatherQueryProperties() {
    return gatherProperties(PropertySupplier::queryProperties);
  }

  public Map<String, Serializable> gatherCreateProperties() {
    return gatherProperties(PropertySupplier::createProperties);
  }

  private Map<String, Serializable> gatherProperties(
      Function<PropertySupplier, Map<String, Serializable>> function) {
    return propertySuppliers
        .stream()
        .map(function)
        .flatMap(
            (Function<Map<String, Serializable>, Stream<Map.Entry<String, Serializable>>>)
                stringSerializableMap -> stringSerializableMap.entrySet().stream())
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }
}
