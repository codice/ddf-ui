/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
/// <reference types="react" />
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks';
import { BasicDatatypeFilter } from '../filter-builder/filter.structure';
import { DataTypesConfiguration, ReverseDataTypesConfiguration } from '../datatypes/datatypes';
export declare function getDataTypesConfiguration({ Configuration, MetacardDefinitions, }: {
    Configuration: ReturnType<typeof useConfiguration>;
    MetacardDefinitions: ReturnType<typeof useMetacardDefinitions>;
}): {
    groupMap: DataTypesConfiguration;
    valueMap: ReverseDataTypesConfiguration;
};
export declare function generateSortedValues({ dataTypesConfiguration, }: {
    dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>;
}): {
    label: string;
    value: string;
}[];
export declare function generateGroupsToValues({ dataTypesConfiguration, }: {
    dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>;
}): {
    [key: string]: string[];
};
export declare function generateKnownGroups({ dataTypesConfiguration, }: {
    dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>;
}): string[];
export declare const ReservedBasicDatatype: ({ value, onChange, }: {
    value: BasicDatatypeFilter['value'];
    onChange: (value: BasicDatatypeFilter['value']) => void;
}) => JSX.Element | null;
