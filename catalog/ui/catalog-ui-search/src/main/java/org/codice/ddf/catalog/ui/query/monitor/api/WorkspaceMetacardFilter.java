package org.codice.ddf.catalog.ui.query.monitor.api;

import org.codice.ddf.catalog.ui.metacard.workspace.WorkspaceMetacardImpl;

public interface WorkspaceMetacardFilter {

    boolean filter(WorkspaceMetacardImpl workspaceMetacard);

}
