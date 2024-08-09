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
import { ResultType } from '../Types';
import { LazyQueryResult } from './LazyQueryResult';
import { QuerySortType } from './types';
import { Status } from './status';
import { TransformSortsComposedFunctionType } from '../TypedQuery';
import Backbone from 'backbone';
import { FilterBuilderClass } from '../../../component/filter-builder/filter.structure';
export type SearchStatus = {
    [key: string]: Status;
};
export type AttributeHighlight = {
    highlight: string;
    attribute: string;
    endIndex: string;
    startIndex: string;
    valueIndex: string;
};
export type AttributeHighlights = {
    [key: string]: Array<AttributeHighlight>;
};
/**
 * Example:
 * [
    {
        "id": "29c0c0e9-b205-49bb-9649-ddf3b31e46f7",
        "highlights": [
            {
                "valueIndex": "0",
                "highlight": "Windham County, <span class=\"highlight\">Vermont</span>",
                "startIndex": "16",
                "endIndex": "23",
                "attribute": "title"
            }
        ]
    }
  ]
 */
export type ResponseHighlightType = Array<{
    id: string;
    highlights: Array<AttributeHighlight>;
}>;
/** store highlights in a map
 * Example:
 * {
    "29c0c0e9-b205-49bb-9649-ddf3b31e46f7": {
        "title": [
            {
                "valueIndex": "0",
                "highlight": "Windham County, <span class=\"highlight\">Vermont</span>",
                "startIndex": "16",
                "endIndex": "23",
                "attribute": "title"
            }
        ]
    }
   }
 */
type TransformedHighlightsType = {
    [key: string]: AttributeHighlights;
};
export declare const transformResponseHighlightsToMap: ({ highlights, }: {
    highlights?: ResponseHighlightType | undefined;
}) => TransformedHighlightsType;
type ConstructorProps = {
    filterTree?: FilterBuilderClass;
    results?: ResultType[];
    sorts?: QuerySortType[];
    sources?: string[];
    transformSorts?: TransformSortsComposedFunctionType;
    status?: SearchStatus;
    highlights?: TransformedHighlightsType;
    showingResultsForFields?: any[];
    didYouMeanFields?: any[];
};
type SubscribableType = 'status' | 'filteredResults' | 'selectedResults' | 'results.backboneSync' | 'filterTree';
type SubscriptionType = {
    [key: string]: () => void;
};
/**
 * Constructed with performance in mind, taking advantage of maps whenever possible.
 * This is the heart of our app, so take care when updating / adding things here to
 * do it with performance in mind.
 *
 */
export declare class LazyQueryResults {
    ['subscriptionsToOthers.result.isSelected']: (() => void)[];
    ['subscriptionsToOthers.result.backboneCreated']: (() => void)[];
    ['subscriptionsToOthers.result.backboneSync']: (() => void)[];
    ['subscriptionsToMe.status']: SubscriptionType;
    ['subscriptionsToMe.filteredResults']: SubscriptionType;
    ['subscriptionsToMe.selectedResults']: SubscriptionType;
    ['subscriptionsToMe.filterTree']: SubscriptionType;
    ['subscriptionsToMe.results.backboneSync']: SubscriptionType;
    subscribeTo({ subscribableThing, callback, }: {
        subscribableThing: SubscribableType;
        callback: () => void;
    }): () => void;
    _notifySubscribers(subscribableThing: SubscribableType): void;
    ['_notifySubscribers.status'](): void;
    ['_notifySubscribers.filteredResults'](): void;
    ['_notifySubscribers.selectedResults'](): void;
    ['_notifySubscribers.results.backboneSync'](): void;
    ['_notifySubscribers.filterTree'](): void;
    _turnOnDebouncing(): void;
    compareFunction: (a: LazyQueryResult, b: LazyQueryResult) => number;
    results: {
        [key: string]: LazyQueryResult;
    };
    selectedResults: {
        [key: string]: LazyQueryResult;
    };
    _getMaxIndexOfSelectedResults(): number;
    _getMinIndexOfSelectedResults(): number;
    /**
     * This is used mostly by
     */
    groupSelect(): void;
    /**
     * This will set swathes of sorted results to be selected.  It does not deselect anything.
     * Primarily used in the list view (card / table)
     */
    shiftSelect(target: LazyQueryResult): void;
    /**
     * This takes a list of ids to set to selected, and will deselect all others.
     */
    selectByIds(targets: string[]): void;
    controlSelect(target: LazyQueryResult): void;
    /**
     * This will toggle selection of the lazyResult passed in, and deselect all others.
     */
    select(target: LazyQueryResult): void;
    deselect(): void;
    backboneModel: Backbone.Model;
    /**
     * Can contain distance / best text match
     * (this matches what the query requested)
     */
    persistantSorts: QuerySortType[];
    /**
     * Pass a function that returns the sorts to use, allowing such things as substituting ephemeral sorts
     */
    transformSorts: TransformSortsComposedFunctionType;
    /**
     *  Should really only be set at constructor time (moment a query is done)
     */
    _updatePersistantSorts(sorts: QuerySortType[]): void;
    _updateTransformSorts(transformSorts: TransformSortsComposedFunctionType): void;
    _getSortedResults(results: LazyQueryResult[]): LazyQueryResult[];
    /**
     * The map of results will ultimately be the source of truth here
     * Maps guarantee chronological order for Object.keys operations,
     * so we turn it into an array to sort then feed it back into a map.
     *
     * On resort we have to update the links between results (used for selecting performantly),
     * as well as the indexes which are used similarly
     *
     */
    _resort(): void;
    /**
     * This is purely to force a rerender in scenarios where we update result values and want to update views without resorting
     * (resorting wouldn't make sense to do client side since there could be more results on the server)
     * It also would be weird since things in tables or lists might jump around while the user is working with them.
     */
    _fakeResort(): void;
    highlights: TransformedHighlightsType;
    addHighlights(highlights: TransformedHighlightsType): void;
    resetHighlights(): void;
    constructor({ filterTree, results, sorts, sources, transformSorts, status, highlights, didYouMeanFields, showingResultsForFields, }?: ConstructorProps);
    init(): void;
    _resetSelectedResults(): void;
    reset({ filterTree, results, sorts, sources, transformSorts, status, highlights, didYouMeanFields, showingResultsForFields, }?: ConstructorProps): void;
    destroy(): void;
    isEmpty(): boolean;
    add({ results, }?: {
        results?: ResultType[];
    }): void;
    _updateSelectedResults({ lazyResult }: {
        lazyResult: LazyQueryResult;
    }): void;
    types: MetacardTypes;
    addTypes(types: MetacardTypes): void;
    getCurrentAttributes(): string[];
    sources: string[];
    _resetSources(sources: string[]): void;
    _resetStatus(): void;
    filterTree?: FilterBuilderClass;
    _resetFilterTree(filterTree?: FilterBuilderClass): void;
    cancel(): void;
    updateStatus(status: SearchStatus): void;
    updateStatusWithError({ sources, message, }: {
        sources: string[];
        message: string;
    }): void;
    _updateIsSearching(): void;
    isSearching: boolean;
    currentAsOf: number;
    status: SearchStatus;
    updateDidYouMeanFields(update: any[] | null): void;
    resetDidYouMeanFields(): void;
    didYouMeanFields: any[];
    updateShowingResultsForFields(update: any[] | null): void;
    resetShowingResultsForFields(): void;
    showingResultsForFields: any[];
}
type MetacardTypes = {
    [key: string]: {
        [key: string]: {
            format: string;
            multivalued: boolean;
            indexed: boolean;
        };
    };
};
export {};
