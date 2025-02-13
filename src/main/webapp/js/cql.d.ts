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
import { CQLStandardFilterBuilderClass, FilterBuilderClass, FilterClass } from '../component/filter-builder/filter.structure';
/**
 * For now, all this does is remove anyDate from cql since that's purely for the UI to track the query basic view state correctly.
 * We might want to reconsider how we do the basic query in order to avoid this necessity (it's really the checkbox).
 *
 * This will only ever happen with a specific structure, so we don't need to recurse or anything.
 */
declare function removeInvalidFilters(cqlAst: FilterBuilderClass | FilterClass | CQLStandardFilterBuilderClass): FilterBuilderClass | FilterClass | boolean | CQLStandardFilterBuilderClass;
declare const _default: {
    /**
     * This function should be used only to test reconstitution, or as a last resort to handle upgrades from a system where the filter tree is
     * no longer compatible.  No loss of accuracy will occur, but nice UX touches like remembering coordinate systems and units will.
     *
     * Also, it may group things slightly different (we do our best effort, but the postfix notation technically causes parens around everything, and from there
     * we do a simplification, which means the resulting filter tree may look simpler than you remember).  However, once again, the accuracy and
     * results returned by the search will remain the same.
     * @param cql
     */
    read(cql?: string): FilterBuilderClass;
    write(filter: FilterBuilderClass): string;
    removeInvalidFilters: typeof removeInvalidFilters;
    simplify(cqlAst: FilterBuilderClass): FilterBuilderClass;
    translateCqlToUserql: (str: string) => string;
    translateUserqlToCql: (str: string) => string;
    ANYTEXT_WILDCARD: string;
    getGeoFilters: (wkt: string, property: string, buffer?: string | undefined) => FilterBuilderClass | FilterClass;
};
export default _default;
