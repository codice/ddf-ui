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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ddf.action.ActionRegistry;
import ddf.catalog.CatalogFramework;
import ddf.catalog.filter.AttributeBuilder;
import ddf.catalog.filter.ContextualExpressionBuilder;
import ddf.catalog.filter.FilterAdapter;
import ddf.catalog.filter.FilterBuilder;
import ddf.catalog.operation.ProcessingDetails;
import ddf.catalog.operation.QueryResponse;
import ddf.catalog.operation.impl.QueryRequestImpl;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.codice.ddf.catalog.ui.config.ConfigurationApplication;
import org.codice.ddf.catalog.ui.query.cql.CqlRequestImpl;
import org.codice.ddf.catalog.ui.query.utility.CqlQueryResponse;
import org.codice.ddf.catalog.ui.query.utility.CqlResult;
import org.junit.Before;
import org.junit.Test;
import org.opengis.filter.Filter;

public class CqlQueriesImplTest {

  private CqlQueriesImpl cqlQueryUtil;

  private FilterBuilder filterBuilderMock;

  private FilterAdapter filterAdapterMock;

  private ActionRegistry actionRegistryMock;

  private QueryResponse responseMock;

  private ProcessingDetails detailsMock1;

  private ProcessingDetails detailsMock2;

  CatalogFramework catalogFrameworkMock;

  @Before
  public void setUp() throws Exception {

    catalogFrameworkMock = mock(CatalogFramework.class);

    Filter filterMock = mock(Filter.class);

    AttributeBuilder attributeBuilderMock = mock(AttributeBuilder.class);

    ConfigurationApplication configurationApplicationMock = mock(ConfigurationApplication.class);

    ContextualExpressionBuilder contextualExpressionBuilderMock =
        mock(ContextualExpressionBuilder.class);

    filterBuilderMock = mock(FilterBuilder.class);
    filterAdapterMock = mock(FilterAdapter.class);
    actionRegistryMock = mock(ActionRegistry.class);
    responseMock = mock(QueryResponse.class);
    detailsMock1 = mock(ProcessingDetails.class);
    detailsMock2 = mock(ProcessingDetails.class);

    HashSet<ProcessingDetails> details = new HashSet<>();
    details.add(detailsMock1);
    details.add(detailsMock2);
    when(responseMock.getProcessingDetails()).thenReturn(details);
    when(filterBuilderMock.attribute(any())).thenReturn(attributeBuilderMock);
    when(attributeBuilderMock.is()).thenReturn(attributeBuilderMock);
    when(attributeBuilderMock.like()).thenReturn(contextualExpressionBuilderMock);
    when(contextualExpressionBuilderMock.text(anyString())).thenReturn(filterMock);
    when(catalogFrameworkMock.query(any(QueryRequestImpl.class))).thenReturn(responseMock);
    when(configurationApplicationMock.getMaximumUploadSize()).thenReturn((long) (1 << 20));

    cqlQueryUtil =
        new CqlQueriesImpl(
            catalogFrameworkMock, filterBuilderMock, filterAdapterMock, actionRegistryMock);
  }

  private CqlRequestImpl generateCqlRequest(int count) {
    CqlRequestImpl cqlRequest = new CqlRequestImpl();
    cqlRequest.setCount(count);
    cqlRequest.setCql("anyText ILIKE '*'");

    return cqlRequest;
  }

  @Test
  public void testHitCountOnlyQuery() throws Exception {
    long hitCount = 12L;
    when(responseMock.getResults()).thenReturn(Collections.emptyList());
    when(responseMock.getHits()).thenReturn(hitCount);
    when(catalogFrameworkMock.query(any(QueryRequestImpl.class))).thenReturn(responseMock);

    CqlQueryResponse cqlQueryResponse = cqlQueryUtil.executeCqlQuery(generateCqlRequest(0));
    List<CqlResult> results = cqlQueryResponse.getResults();
    assertThat(results, hasSize(0));
    assertThat(cqlQueryResponse.getQueryResponse().getHits(), is(hitCount));
  }

  @Test
  public void testQueryWithDetails() throws Exception {
    long hitCount = 12L;
    when(responseMock.getResults()).thenReturn(Collections.emptyList());
    when(responseMock.getHits()).thenReturn(hitCount);
    when(catalogFrameworkMock.query(any(QueryRequestImpl.class))).thenReturn(responseMock);

    CqlQueryResponse cqlQueryResponse = cqlQueryUtil.executeCqlQuery(generateCqlRequest(1));
    Set<ProcessingDetails> details = cqlQueryResponse.getQueryResponse().getProcessingDetails();
    assertThat(details.size(), is(2));
    assertThat(details, hasItem(detailsMock1));
    assertThat(details, hasItem(detailsMock2));
  }
}
