import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
type UseSearchResultsProps = {
    searchText: string;
    archived?: boolean;
};
type UseSearchResultsReturn = {
    lazyResults: LazyQueryResult[];
    loading: boolean;
};
export declare const useSearchResults: ({ searchText, archived, }: UseSearchResultsProps) => UseSearchResultsReturn;
export {};
