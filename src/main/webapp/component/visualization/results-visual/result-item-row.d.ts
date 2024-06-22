/// <reference types="react" />
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
type ResultItemFullProps = {
    lazyResult: LazyQueryResult;
    measure: () => void;
    index: number;
    results: LazyQueryResult[];
    selectionInterface: any;
    headerColWidth: Map<string, string>;
    actionWidth: number;
    setMaxActionWidth: (width: number) => void;
    addOnWidth: number;
    setMaxAddOnWidth: (width: number) => void;
};
export declare function clearSelection(): void;
export declare function hasSelection(): boolean;
declare const _default: ({ lazyResult, measure: originalMeasure, index, results, selectionInterface, headerColWidth, actionWidth, setMaxActionWidth, addOnWidth, setMaxAddOnWidth, }: ResultItemFullProps) => JSX.Element;
export default _default;
