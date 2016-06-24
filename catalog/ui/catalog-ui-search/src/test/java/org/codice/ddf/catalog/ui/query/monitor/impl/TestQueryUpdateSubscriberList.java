package org.codice.ddf.catalog.ui.query.monitor.impl;

import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

import org.codice.ddf.catalog.ui.metacard.workspace.WorkspaceMetacardImpl;
import org.codice.ddf.catalog.ui.query.monitor.api.QueryUpdateSubscriber;
import org.junit.Test;
import org.mockito.Mockito;

public class TestQueryUpdateSubscriberList {

    @Test
    public void testNotify() {
        QueryUpdateSubscriber childSubscriber = mock(QueryUpdateSubscriber.class);
        QueryUpdateSubscriberList queryUpdateSubscriberList = new QueryUpdateSubscriberList(
                Collections.singletonList(childSubscriber));
        Map<WorkspaceMetacardImpl, Long> workspaceMetacardMap = Collections.emptyMap();
        queryUpdateSubscriberList.notify(workspaceMetacardMap);
        verify(childSubscriber).notify(workspaceMetacardMap);
    }

    /**
     * Test that if the first subscriber throws an exception that the second subscriber is
     * still called.
     */
    @Test
    public void testExceptions() {
        Map<WorkspaceMetacardImpl, Long> workspaceMetacardMap = Collections.emptyMap();

        QueryUpdateSubscriber childSubscriber1 = mock(QueryUpdateSubscriber.class);
        QueryUpdateSubscriber childSubscriber2 = mock(QueryUpdateSubscriber.class);

        Mockito.doThrow(RuntimeException.class)
                .when(childSubscriber1)
                .notify(workspaceMetacardMap);

        QueryUpdateSubscriberList queryUpdateSubscriberList =
                new QueryUpdateSubscriberList(Arrays.asList(childSubscriber1, childSubscriber2));
        queryUpdateSubscriberList.notify(workspaceMetacardMap);

        verify(childSubscriber2).notify(workspaceMetacardMap);
    }

    @Test
    public void testToString() {
        assertThat(new QueryUpdateSubscriberList(Collections.emptyList()).toString(),
                notNullValue());
    }

}
