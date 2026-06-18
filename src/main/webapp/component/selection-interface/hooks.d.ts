import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults';
type useLazyResultsProps = {
    selectionInterface: any;
};
export type LazyResultsType = {
    [key: string]: LazyQueryResult;
};
export declare const useLazyResultsSelectedResultsFromSelectionInterface: ({ selectionInterface, }: useLazyResultsProps) => {
    [x: string]: LazyQueryResult;
};
export declare const useLazyResultsStatusFromSelectionInterface: ({ selectionInterface, }: useLazyResultsProps) => {
    status: import("../../js/model/LazyQueryResult/LazyQueryResults").SearchStatus;
    isSearching: boolean;
    currentAsOf: number;
};
export declare const useLazyResultsFilterTreeFromSelectionInterface: ({ selectionInterface, }: useLazyResultsProps) => import("../filter-builder/filter.structure").FilterBuilderClass | undefined;
export declare const useLazyResultsFromSelectionInterface: ({ selectionInterface, }: useLazyResultsProps) => LazyQueryResults;
export {};
