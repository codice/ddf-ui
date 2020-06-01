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
package org.codice.ddf.catalog.ui.query.cql;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ddf.catalog.operation.ProcessingDetails;
import ddf.catalog.security.SourceWarningsFilter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

public class SourceWarningsFilterManagerTest {

  @Test(expected = IllegalArgumentException.class)
  public void testConstructionOfFilterManagerWithNullFiltersThrowsIllegalArgumentException() {
    new SourceWarningsFilterManager(null);
  }

  @Test
  public void
      testFilterManagerReturnsProcessingDetailsWithEmptyWarningsWhenItFiltersWarningsOfNullProcessingDetails() {
    SourceWarningsFilter mockedFilter = mock(SourceWarningsFilter.class);
    when(mockedFilter.canFilter(any())).thenReturn(true);

    ProcessingDetails mockedDetailsWithNonEmptyWarnings = mock(ProcessingDetails.class);
    when(mockedDetailsWithNonEmptyWarnings.getWarnings())
        .thenReturn(Collections.singletonList("doesn't look empty to me, boss"));
    when(mockedFilter.filter(any())).thenReturn(mockedDetailsWithNonEmptyWarnings);

    SourceWarningsFilterManager filterManager =
        new SourceWarningsFilterManager(Collections.singletonList(mockedFilter));

    ProcessingDetails detailsWithFilteredWarnings = filterManager.filterWarningsOf(null);
    assertThat(detailsWithFilteredWarnings, is(notNullValue()));
    assertThat(detailsWithFilteredWarnings.getWarnings(), is(Collections.emptyList()));
  }

  @Test
  public void
      testFilterManagerWithNoFilterReturnsProcessingDetailsWithEmptyWarningsWhenItFiltersNonEmptyWarningsOfNonNullProcessingDetails() {
    SourceWarningsFilterManager filterManager =
        new SourceWarningsFilterManager(Collections.emptyList());

    ProcessingDetails mockedDetails = mock(ProcessingDetails.class);
    when(mockedDetails.getSourceId()).thenReturn("id of source");
    when(mockedDetails.getWarnings()).thenReturn(Collections.singletonList("no vacancies"));

    ProcessingDetails detailsWithFilteredWarnings = filterManager.filterWarningsOf(mockedDetails);
    assertThat(detailsWithFilteredWarnings, is(notNullValue()));
    assertThat(detailsWithFilteredWarnings.getWarnings(), is(Collections.emptyList()));
  }

  @Test
  public void testFilterManagerIgnoresNullMemberOfFilters() {
    SourceWarningsFilterManager filterManager =
        new SourceWarningsFilterManager(Collections.singletonList(null));

    ProcessingDetails mockedDetails = mock(ProcessingDetails.class);
    when(mockedDetails.getSourceId()).thenReturn("id of source");

    ProcessingDetails detailsWithFilteredWarnings = filterManager.filterWarningsOf(mockedDetails);
    assertThat(detailsWithFilteredWarnings, is(notNullValue()));
    assertThat(detailsWithFilteredWarnings.getWarnings(), is(Collections.emptyList()));
  }

  @Test
  public void
      testFilterManagerWithOnlyIncompatibleFilterReturnsProcessingDetailsWithEmptyWarningsWhenItFiltersNonEmptyWarningsOfNonNullProcessingDetails() {
    SourceWarningsFilter mockedFilter = mock(SourceWarningsFilter.class);
    when(mockedFilter.canFilter(any())).thenReturn(false);

    ProcessingDetails mockedDetailsWithNonEmptyWarnings = mock(ProcessingDetails.class);
    when(mockedDetailsWithNonEmptyWarnings.getWarnings())
        .thenReturn(
            Collections.singletonList(
                "when you gaze into the abyss, the abyss gazes also into you"));
    when(mockedFilter.filter(mockedDetailsWithNonEmptyWarnings))
        .thenReturn(mockedDetailsWithNonEmptyWarnings);

    SourceWarningsFilterManager filterManager =
        new SourceWarningsFilterManager(Collections.singletonList(mockedFilter));

    ProcessingDetails mockedDetails = mock(ProcessingDetails.class);
    when(mockedDetails.getSourceId()).thenReturn("id of source");

    ProcessingDetails detailsWithFilteredWarnings = filterManager.filterWarningsOf(mockedDetails);
    assertThat(detailsWithFilteredWarnings, is(notNullValue()));
    assertThat(detailsWithFilteredWarnings.getWarnings(), is(Collections.emptyList()));
  }

  @Test
  public void
      testFilterManagerWithCompatibleFilterReturnsProcessingDetailsWithFilteredWarningsWhenItFiltersWarningsOfNonNullProcessingDetails() {
    SourceWarningsFilter mockedFilter = mock(SourceWarningsFilter.class);
    when(mockedFilter.canFilter(any())).thenReturn(true);

    List<String> filteredWarnings = Collections.singletonList("filtered warnings");

    ProcessingDetails mockedDetailsWithFilteredWarnings = mock(ProcessingDetails.class);
    when(mockedDetailsWithFilteredWarnings.getWarnings()).thenReturn(filteredWarnings);
    when(mockedFilter.filter(any(ProcessingDetails.class)))
        .thenReturn(mockedDetailsWithFilteredWarnings);

    SourceWarningsFilterManager filterManager =
        new SourceWarningsFilterManager(Collections.singletonList(mockedFilter));

    ProcessingDetails mockedDetails = mock(ProcessingDetails.class);
    when(mockedDetails.getSourceId()).thenReturn("id of source");

    ProcessingDetails detailsWithFilteredWarnings = filterManager.filterWarningsOf(mockedDetails);
    assertThat(detailsWithFilteredWarnings, is(notNullValue()));
    assertThat(detailsWithFilteredWarnings.getWarnings(), is(filteredWarnings));
  }

  @Test
  public void
      testFilterManagerOnlyFiltersWithCompatibleFilterOfHighestPriorityWarningsOfNonNullProcessingDetails() {
    List<SourceWarningsFilter> filters = new ArrayList<>();

    SourceWarningsFilter prioritizedButIncompatibleMockedFilter = mock(SourceWarningsFilter.class);
    when(prioritizedButIncompatibleMockedFilter.canFilter(any())).thenReturn(false);

    ProcessingDetails mockedDetailsWithImproperlyFilteredWarnings = mock(ProcessingDetails.class);
    when(mockedDetailsWithImproperlyFilteredWarnings.getWarnings())
        .thenReturn(Collections.singletonList("improperly filtered warnings"));
    when(prioritizedButIncompatibleMockedFilter.filter(any(ProcessingDetails.class)))
        .thenReturn(mockedDetailsWithImproperlyFilteredWarnings);
    filters.add(prioritizedButIncompatibleMockedFilter);
    filters.add(null);

    SourceWarningsFilter lessPrioritizedButCompatibleMockedFilter =
        mock(SourceWarningsFilter.class);
    when(lessPrioritizedButCompatibleMockedFilter.canFilter(any(ProcessingDetails.class)))
        .thenReturn(true);

    List<String> properlyFilteredWarnings = Collections.singletonList("properly filtered warnings");

    ProcessingDetails mockedDetailsWithProperlyFilteredWarnings = mock(ProcessingDetails.class);
    when(mockedDetailsWithProperlyFilteredWarnings.getWarnings())
        .thenReturn(properlyFilteredWarnings);
    when(lessPrioritizedButCompatibleMockedFilter.filter(any(ProcessingDetails.class)))
        .thenReturn(mockedDetailsWithProperlyFilteredWarnings);
    filters.add(lessPrioritizedButCompatibleMockedFilter);

    SourceWarningsFilter notPrioritizedButCompatibleMockedFilter = mock(SourceWarningsFilter.class);
    when(notPrioritizedButCompatibleMockedFilter.canFilter(any(ProcessingDetails.class)))
        .thenReturn(true);
    when(notPrioritizedButCompatibleMockedFilter.filter(any(ProcessingDetails.class)))
        .thenReturn(mockedDetailsWithImproperlyFilteredWarnings);
    filters.add(notPrioritizedButCompatibleMockedFilter);

    SourceWarningsFilterManager filterManager = new SourceWarningsFilterManager(filters);

    ProcessingDetails mockedDetails = mock(ProcessingDetails.class);
    when(mockedDetails.getSourceId()).thenReturn("id of source");

    ProcessingDetails detailsWithProperlyFilteredWarnings =
        filterManager.filterWarningsOf(mockedDetails);
    assertThat(detailsWithProperlyFilteredWarnings, is(notNullValue()));
    assertThat(detailsWithProperlyFilteredWarnings.getWarnings(), is(properlyFilteredWarnings));
  }
}
