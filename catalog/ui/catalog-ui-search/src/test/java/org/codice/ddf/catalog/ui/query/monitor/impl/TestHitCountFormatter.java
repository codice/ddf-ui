package org.codice.ddf.catalog.ui.query.monitor.impl;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;

import org.codice.ddf.catalog.ui.metacard.workspace.WorkspaceMetacardImpl;
import org.junit.Test;

public class TestHitCountFormatter {

    @Test
    public void testFormat() {
        HitCountFormatter hitCountFormatter = new HitCountFormatter();
        Long hitCount = 1L;

        String result = hitCountFormatter.format("%[hitCount]",
                mock(WorkspaceMetacardImpl.class),
                hitCount);

        assertThat(result, is(hitCount.toString()));

    }

}
