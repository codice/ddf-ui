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
import React from 'react';
import { getAttributeType as defaultGetAttributeType } from '../filterHelper';
import { FilterClass } from '../../../component/filter-builder/filter.structure';
import { ValidationResult } from '../../location/validators';
export type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
    getAttributeType?: typeof defaultGetAttributeType;
};
export declare const FilterInputContext: React.Context<{
    resourceSizeIdentifiers: string[];
}>;
/**
 *  This is how we determine when we should show the resource size input.
 *  The default provider uses the configuration to get the resource size identifiers.
 *
 *  If you want to show the resource size input for a custom filter,
 *  you can create a custom provider and wrap your filter input with it.
 */
export declare const DefaultFilterInputProvider: ({ children, }: {
    children: React.ReactNode;
}) => JSX.Element;
declare const FilterInput: ({ filter, setFilter, errorListener, getAttributeType, }: Props) => JSX.Element | null;
export default FilterInput;
