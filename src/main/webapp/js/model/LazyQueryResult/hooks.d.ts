import { LazyQueryResult } from './LazyQueryResult';
import { LazyQueryResults } from './LazyQueryResults';
/**
 * If a view cares about whether or not a lazy result is selected,
 * this will let them know.
 */
export declare const useSelectionOfLazyResult: ({ lazyResult, }: {
    lazyResult: LazyQueryResult;
}) => boolean;
/**
 * If a view cares about whether or not a lazy result is filtered,
 * this will let them know.
 */
export declare const useFilteredOfLazyResult: ({ lazyResult, }: {
    lazyResult: LazyQueryResult;
}) => boolean;
/**
 * Used by clusters to respond quickly to changes they care about
 * (in other words the results in their cluster)
 */
export declare const useSelectionOfLazyResults: ({ lazyResults, }: {
    lazyResults: LazyQueryResult[];
}) => "selected" | "unselected" | "partially";
/**
 * If a view cares about the entirety of what results are selected out
 * of a LazyQueryResults object, this will keep them up to date.
 *
 * This is overkill for most components, but needed for things like
 * the inspector.  Most other components will instead respond to changes
 * in a single result.
 */
export declare const useSelectedResults: ({ lazyResults, }: {
    lazyResults?: LazyQueryResults | undefined;
}) => {
    [x: string]: LazyQueryResult;
};
/**
 * If a view cares about the status of a LazyQueryResults object
 */
export declare const useStatusOfLazyResults: ({ lazyResults, }: {
    lazyResults: LazyQueryResults;
}) => {
    status: import("./LazyQueryResults").SearchStatus;
    isSearching: boolean;
    currentAsOf: number;
};
/**
 * If a view cares about the status of a LazyQueryResults object
 */
export declare const useFilterTreeOfLazyResults: ({ lazyResults, }: {
    lazyResults: LazyQueryResults;
}) => import("../../../component/filter-builder/filter.structure").FilterBuilderClass | undefined;
/**
 *  Allow a view to rerender when the backbone model resyncs to the plain model
 */
export declare const useRerenderOnBackboneSync: ({ lazyResult, }: {
    lazyResult?: LazyQueryResult | undefined;
}) => void;
