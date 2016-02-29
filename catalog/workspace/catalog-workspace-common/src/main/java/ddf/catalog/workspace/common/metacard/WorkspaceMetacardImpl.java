package ddf.catalog.workspace.common.metacard;

import ddf.catalog.data.impl.MetacardImpl;
import ddf.catalog.data.impl.MetacardTypeImpl;

/**
 * WorkspaceMetacardImpl is used to provide some convenience methods for getting workspace attributes
 */
public class WorkspaceMetacardImpl extends MetacardImpl {

    private static final WorkspaceMetacardType workspaceMetacardType = new WorkspaceMetacardType();

    public WorkspaceMetacardImpl() {
        super(workspaceMetacardType);
    }

    public WorkspaceMetacardImpl(MetacardTypeImpl type) {
        super(type);
    }
}
