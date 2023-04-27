import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
type ResultItemFullProps = {
    lazyResult: LazyQueryResult;
    measure: () => void;
    index: number;
    results: LazyQueryResult[];
    headerColWidth: Map<string, string>;
};
export declare function clearSelection(): void;
export declare function hasSelection(): boolean;
declare const _default: ({ lazyResult, measure, index, results, headerColWidth, }: ResultItemFullProps) => JSX.Element;
export default _default;
