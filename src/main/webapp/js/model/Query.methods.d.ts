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
export type IndexForSourceGroupType = {
    [key: string]: number;
};
export type SourceStatus = {
    id: string;
    count: number;
    hasReturned: boolean;
    hits: number;
    elapsed: number;
    successful: boolean;
    warnings: [];
};
export type QueryStatus = {
    [key: string]: SourceStatus;
};
/**
 *  We use the current status + current index to calculate next index.
 *  Local sources get grouped into a single index.
 *
 *  If current index is blank it's assumed to be the start.
 *
 *  We throw an error if status is provided while current index is blank, as that doesn't make sense.
 *
 *  Notice that a good chunk of the logic is dedicated to ensuring we don't go beyond hits.
 *  Locally this doesn't matter, but remote sources tend to throw errors if we do.
 */
export declare const calculateNextIndexForSourceGroupNextPage: ({ queryStatus, sources, isLocal, currentIndexForSourceGroup, }: {
    queryStatus: QueryStatus;
    sources: Array<string>;
    isLocal: (id: string) => boolean;
    currentIndexForSourceGroup: IndexForSourceGroupType;
}) => IndexForSourceGroupType;
export declare const getMaxIndexForSourceGroup: ({ queryStatus, isLocal, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
}) => IndexForSourceGroupType;
export declare const hasPreviousPageForSourceGroup: ({ currentIndexForSourceGroup, }: {
    currentIndexForSourceGroup: IndexForSourceGroupType;
}) => boolean;
export declare const getNextPageForSourceGroup: ({ currentIndexForSourceGroup, sources, isLocal, count, }: {
    sources: Array<string>;
    isLocal: (id: string) => boolean;
    currentIndexForSourceGroup: IndexForSourceGroupType;
    count: number;
}) => IndexForSourceGroupType;
export declare const hasNextPageForSourceGroup: ({ queryStatus, isLocal, currentIndexForSourceGroup, count, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
    currentIndexForSourceGroup: IndexForSourceGroupType;
    count: number;
}) => boolean;
export declare const getPreviousPageForSourceGroup: ({ currentIndexForSourceGroup, count, }: {
    currentIndexForSourceGroup: IndexForSourceGroupType;
    count: number;
}) => IndexForSourceGroupType;
export declare const getFirstPageForSourceGroup: ({ sources, isLocal, }: {
    sources: Array<string>;
    isLocal: (id: string) => boolean;
}) => IndexForSourceGroupType;
export declare const getFinalPageForSourceGroup: ({ queryStatus, isLocal, count, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
    count: number;
}) => IndexForSourceGroupType;
export type QueryStartAndEndType = {
    start: number;
    end: number;
    hits: number;
};
export declare const getCurrentStartAndEndForSourceGroup: ({ queryStatus, currentIndexForSourceGroup, }: {
    queryStatus: QueryStatus;
    currentIndexForSourceGroup: IndexForSourceGroupType;
}) => QueryStartAndEndType;
export declare const getConstrainedFinalPageForSourceGroup: ({ queryStatus, isLocal, count, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
    count: number;
}) => IndexForSourceGroupType;
