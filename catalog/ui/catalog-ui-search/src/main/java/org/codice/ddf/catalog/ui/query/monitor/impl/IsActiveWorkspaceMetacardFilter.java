package org.codice.ddf.catalog.ui.query.monitor.impl;

import org.codice.ddf.catalog.ui.metacard.workspace.WorkspaceMetacardImpl;
import org.codice.ddf.catalog.ui.query.monitor.api.WorkspaceMetacardFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class IsActiveWorkspaceMetacardFilter implements WorkspaceMetacardFilter {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(IsActiveWorkspaceMetacardFilter.class);

    private final boolean defaultValue;

    public IsActiveWorkspaceMetacardFilter(boolean defaultValue) {
        this.defaultValue = defaultValue;
    }

    @Override
    public boolean filter(WorkspaceMetacardImpl workspaceMetacard) {
        return workspaceMetacard.isActive(defaultValue);
    }

    @Override
    public String toString() {
        return "IsActiveWorkspaceMetacardFilter{" +
                "defaultValue=" + defaultValue +
                '}';
    }
}
