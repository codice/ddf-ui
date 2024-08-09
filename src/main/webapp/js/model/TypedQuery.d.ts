/// <reference types="backbone" />
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
import { Dispatch, SetStateAction } from 'react';
import { FilterBuilderClass } from '../../component/filter-builder/filter.structure';
import { QueryAttributesType, SortType } from './Query.shared-types';
import { QueryType } from './Query';
/**
 * Mainly used by lazy query results, since it gets passed a function that adds in the query ref for it
 */
export type TransformSortsComposedFunctionType = ({ originalSorts, }: {
    originalSorts: SortType[];
}) => SortType[];
export type TransformSortsFunctionType = ({ originalSorts, queryRef, }: {
    originalSorts: SortType[];
    queryRef: Backbone.Model<any>;
}) => SortType[];
export type QueryOptions = {
    /**
     * Pass a function that returns the defaults to use
     */
    transformDefaults?: ({ originalDefaults, queryRef, }: {
        originalDefaults: QueryAttributesType;
        queryRef: Backbone.Model<any>;
    }) => QueryAttributesType;
    /**
     *  Pass a function that returns the cql given a filter tree, allowing such things as mixing in ephemeral filters
     */
    transformFilterTree?: ({ originalFilterTree, queryRef, }: {
        originalFilterTree: FilterBuilderClass;
        queryRef: Backbone.Model<any>;
    }) => string;
    /**
     * Pass a function that returns the sorts to use, allowing such things as substituting ephemeral sorts
     */
    transformSorts?: TransformSortsFunctionType;
    transformCount?: ({ originalCount, queryRef, }: {
        originalCount: number;
        queryRef: Backbone.Model<any>;
    }) => number;
    limitToDeleted?: boolean;
    limitToHistoric?: boolean;
};
export declare const DEFAULT_QUERY_OPTIONS: Readonly<Required<QueryOptions>>;
export declare const Query: (attributes?: QueryAttributesType, options?: QueryOptions) => any;
export declare const DEFAULT_USER_QUERY_OPTIONS: Readonly<Required<QueryOptions>>;
/**
 * This should be used in place of useUserQuery _only_ if you do not intend to listen to changes to user prefs.
 */
export declare const UserQuery: (attributes?: QueryAttributesType, options?: QueryOptions) => any;
export declare const useQuery: ({ attributes, options, }?: {
    attributes?: QueryAttributesType | undefined;
    options?: QueryOptions | undefined;
}) => [QueryType, Dispatch<SetStateAction<QueryType>>];
export declare const useUserQuery: ({ attributes, options, }?: {
    attributes?: QueryAttributesType | undefined;
    options?: QueryOptions | undefined;
}) => [QueryType, Dispatch<SetStateAction<QueryType>>];
