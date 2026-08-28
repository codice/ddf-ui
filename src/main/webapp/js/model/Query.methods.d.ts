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
export declare const getIndexOfNoMoreResultsForSourceGroup: ({ queryStatus, isLocal, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
}) => IndexForSourceGroupType;
/**
 *  This is the index of the final result for a source group.
 */
export declare const getIndexOfLastResultForSourceGroup: ({ queryStatus, isLocal, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
}) => IndexForSourceGroupType;
export declare const hasPreviousPageForSourceGroup: ({ currentIndexForSourceGroup, }: {
    currentIndexForSourceGroup: IndexForSourceGroupType;
}) => boolean;
export declare const hasNextPageForSourceGroup: ({ queryStatus, isLocal, currentIndexForSourceGroup, count, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
    currentIndexForSourceGroup: IndexForSourceGroupType;
    count: number;
}) => boolean;
export declare const getFirstPageForSourceGroup: ({ sources, isLocal, }: {
    sources: Array<string>;
    isLocal: (id: string) => boolean;
}) => IndexForSourceGroupType;
export type QueryStartAndEndType = {
    start: number;
    end: number;
    hits: number;
};
export declare const getCurrentStartAndEndForSourceGroup: ({ queryStatus, currentIndexForSourceGroup, isLocal, }: {
    queryStatus: QueryStatus;
    currentIndexForSourceGroup: IndexForSourceGroupType;
    isLocal: (id: string) => boolean;
}) => QueryStartAndEndType;
/**
 * Ensures that the next page indices for a group of sources make sense.  We do this by examining the farthest index, since paging is done individually for each source.
 * If the farthest index is beyond the hits for a source, we essentially "lock" the source to the end to ensure we don't recieve further results.
 **/
export declare const getConstrainedNextPageForSourceGroup: ({ currentIndexForSourceGroup, sources, isLocal, count, queryStatus, }: {
    sources: Array<string>;
    isLocal: (id: string) => boolean;
    currentIndexForSourceGroup: IndexForSourceGroupType;
    count: number;
    queryStatus: QueryStatus;
}) => IndexForSourceGroupType;
/**
 *  The final index for a source group is not the same as the final index when thinking about the very last page, since we have multiple sources.
 *  Some sources may have already "exhausted" their results, so we need to make sure that if we don't return results that we've already "passed".
 */
export declare const getConstrainedFinalPageForSourceGroup: ({ queryStatus, isLocal, count, }: {
    queryStatus: QueryStatus;
    isLocal: (id: string) => boolean;
    count: number;
}) => IndexForSourceGroupType;
/**
 * Ensures that the next page indices for a group of sources make sense.  We do this by examining the farthest index, since paging is done individually for each source.
 * If the farthest index is beyond the hits for a source, we essentially "lock" the source to the end to ensure we don't recieve further results.
 **/
export declare const getConstrainedPreviousPageForSourceGroup: ({ currentIndexForSourceGroup, sources, isLocal, count, queryStatus, }: {
    sources: Array<string>;
    isLocal: (id: string) => boolean;
    currentIndexForSourceGroup: IndexForSourceGroupType;
    count: number;
    queryStatus: QueryStatus;
}) => IndexForSourceGroupType;
