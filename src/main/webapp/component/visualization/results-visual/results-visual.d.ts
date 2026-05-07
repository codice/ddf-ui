import * as React from 'react';
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
import { ResultsState } from '../../golden-layout/golden-layout.types';
type Props = {
    selectionInterface: any;
    componentState: ResultsState;
};
export type ModeType = 'card' | 'table';
export declare const ResultsViewContext: React.Context<{
    edit: null | LazyQueryResult;
    setEdit: React.Dispatch<null | LazyQueryResult>;
}>;
declare const ResultsView: ({ selectionInterface, componentState }: Props) => import("react/jsx-runtime").JSX.Element;
export default ResultsView;
