/**
 * Copyright (c) Codice Foundation
 * <p>
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 * <p>
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package ddf.catalog.workspace.common.metacard;

import java.util.HashSet;
import java.util.Set;

import ddf.catalog.data.AttributeDescriptor;
import ddf.catalog.data.impl.AttributeDescriptorImpl;
import ddf.catalog.data.impl.BasicTypes;
import ddf.catalog.data.impl.MetacardTypeImpl;

/**
 * Base MetacardType for all registry MetacardTypes.
 */
public class WorkspaceMetacardType extends MetacardTypeImpl {

    public static final String TAG = "workspace";

    public static final String NAMESPACE = "ddf.workspace";

    public static final String SEARCHES = NAMESPACE + ".searches";

    public static final String METACARDS = NAMESPACE + ".metacards";

    private static Set<AttributeDescriptor> WORKSPACE_DESCRIPTORS;

    static {
        WORKSPACE_DESCRIPTORS = new HashSet<>(BasicTypes.BASIC_METACARD.getAttributeDescriptors());
        WORKSPACE_DESCRIPTORS.add(
                new AttributeDescriptorImpl(SEARCHES, true /* indexed */, true /* stored */, false /* tokenized */,
                        true /* multivalued */, BasicTypes.STRING_TYPE));
        WORKSPACE_DESCRIPTORS.add(
                new AttributeDescriptorImpl(METACARDS, true /* indexed */, true /* stored */, false /* tokenized */,
                        true /* multivalued */, BasicTypes.STRING_TYPE));

    }

    public WorkspaceMetacardType() {
        super(NAMESPACE, WORKSPACE_DESCRIPTORS);
    }

}