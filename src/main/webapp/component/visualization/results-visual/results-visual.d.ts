import * as React from 'react';
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
import { ResultsState } from '../../golden-layout/golden-layout.types';
type Props = {
    selectionInterface: any;
    componentState: ResultsState;
};
export type ModeType = 'card' | 'table';
export declare const ResultsViewContext: React.Context<{
    edit: LazyQueryResult | null;
    setEdit: React.Dispatch<LazyQueryResult | null>;
}>;
declare const _default: ({ selectionInterface, componentState }: Props) => JSX.Element;
export default _default;
