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

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;
import java.util.Arrays;
import java.util.Collections;
import org.codice.ddf.catalog.ui.metacard.internal.PropertySupplier;
import org.junit.Test;

public class PropertyCoordinatorTest {

  private static final String SUPPLIER1_CREATE_KEY = "CREATE1";
  private static final Long SUPPLIER1_CREATE_VALUE = 1L;
  private static final String SUPPLIER1_QUERY_KEY = "QUERY1";
  private static final Long SUPPLIER1_QUERY_VALUE = 2L;

  private static final String SUPPLIER2_CREATE_KEY = "CREATE2";
  private static final Long SUPPLIER2_CREATE_VALUE = 3L;
  private static final String SUPPLIER2_QUERY_KEY = "QUERY2";
  private static final Long SUPPLIER2_QUERY_VALUE = 4L;

  @Test
  public void testMultipleSuppliers() {

    PropertySupplier propertySupplier1 = mock(PropertySupplier.class);
    when(propertySupplier1.createProperties())
        .thenReturn(Collections.singletonMap(SUPPLIER1_CREATE_KEY, SUPPLIER1_CREATE_VALUE));
    when(propertySupplier1.queryProperties())
        .thenReturn(Collections.singletonMap(SUPPLIER1_QUERY_KEY, SUPPLIER1_QUERY_VALUE));

    PropertySupplier propertySupplier2 = mock(PropertySupplier.class);
    when(propertySupplier2.createProperties())
        .thenReturn(Collections.singletonMap(SUPPLIER2_CREATE_KEY, SUPPLIER2_CREATE_VALUE));
    when(propertySupplier2.queryProperties())
        .thenReturn(Collections.singletonMap(SUPPLIER2_QUERY_KEY, SUPPLIER2_QUERY_VALUE));

    PropertyCoordinator propertyCoordinator =
        new PropertyCoordinator(Arrays.asList(propertySupplier1, propertySupplier2));

    assertThat(
        propertyCoordinator.gatherCreateProperties(),
        is(
            ImmutableMap.of(
                SUPPLIER1_CREATE_KEY,
                SUPPLIER1_CREATE_VALUE,
                SUPPLIER2_CREATE_KEY,
                SUPPLIER2_CREATE_VALUE)));
    assertThat(
        propertyCoordinator.gatherQueryProperties(),
        is(
            ImmutableMap.of(
                SUPPLIER1_QUERY_KEY,
                SUPPLIER1_QUERY_VALUE,
                SUPPLIER2_QUERY_KEY,
                SUPPLIER2_QUERY_VALUE)));
  }
}
