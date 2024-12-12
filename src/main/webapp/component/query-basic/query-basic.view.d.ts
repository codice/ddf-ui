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
import * as React from 'react';
import { BasicDatatypeFilter, BasicFilterClass } from '../filter-builder/filter.structure';
import { FilterBuilderClass, FilterClass } from '../filter-builder/filter.structure';
import { ValidationResult } from '../../react-component/location/validators';
import { BasicDataTypePropertyName } from '../filter-builder/reserved.properties';
type PropertyValueMapType = {
    anyText: Array<FilterClass>;
    anyDate: Array<BasicFilterClass>;
    anyGeo: Array<FilterClass>;
    [BasicDataTypePropertyName]: {
        on: boolean;
        value: BasicDatatypeFilter;
    };
    [key: string]: any;
};
export declare function downgradeFilterTreeToBasic(filter: FilterBuilderClass): FilterBuilderClass;
export declare function translateFilterToBasicMap(filter: FilterBuilderClass): {
    propertyValueMap: PropertyValueMapType;
    downConversion: boolean;
};
type QueryBasicProps = {
    model: any;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
    Extensions?: React.FunctionComponent;
};
export declare const constructFilterFromBasicFilter: ({ basicFilter, }: {
    basicFilter: PropertyValueMapType;
}) => FilterBuilderClass;
declare const _default: ({ model, errorListener, Extensions }: QueryBasicProps) => JSX.Element;
export default _default;
