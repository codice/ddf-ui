package org.codice.ddf.catalog.ui.query.monitor.impl;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

import org.codice.ddf.catalog.ui.metacard.workspace.WorkspaceMetacardImpl;
import org.junit.Test;

public class TestAttributeMetacardFormatter {

    @Test
    public void testFormatNonDefault() {

        String template = "%[attribute=id]";

        String id = "the-id";

        WorkspaceMetacardImpl workspaceMetacard = new WorkspaceMetacardImpl(id);

        AttributeMetacardFormatter attributeMetacardFormatter =
                new AttributeMetacardFormatter("n/a");

        String result = attributeMetacardFormatter.format(template, workspaceMetacard, 0L);

        assertThat(result, is(id));

    }

    @Test
    public void testFormatDefault() {

        String template = "%[attribute=xyz]";

        String defaultValue = "n/a";

        WorkspaceMetacardImpl workspaceMetacard = new WorkspaceMetacardImpl();

        AttributeMetacardFormatter attributeMetacardFormatter = new AttributeMetacardFormatter(
                defaultValue);

        String result = attributeMetacardFormatter.format(template, workspaceMetacard, 0L);

        assertThat(result, is(defaultValue));

    }

    @Test
    public void testComplex() {
        String template =
                "The workspace '%[attribute=title]' (id: %[attribute=id]) contains up to %[hitCount] query hits.";

        String id = "the-id";

        WorkspaceMetacardImpl workspaceMetacard = new WorkspaceMetacardImpl(id);
        workspaceMetacard.setAttribute("title", "the-title");

        AttributeMetacardFormatter attributeMetacardFormatter =
                new AttributeMetacardFormatter("n/a");

        String result = attributeMetacardFormatter.format(template, workspaceMetacard, 1L);

        assertThat(result,
                is("The workspace 'the-title' (id: the-id) contains up to %[hitCount] query hits."));

    }

}
