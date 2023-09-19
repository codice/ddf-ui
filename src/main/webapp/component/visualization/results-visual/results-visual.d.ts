import * as React from 'react';
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    selectionInterface: any;
};
export declare const ResultsViewContext: React.Context<{
    edit: LazyQueryResult | null;
    setEdit: React.Dispatch<LazyQueryResult | null>;
}>;
declare const _default: ({ selectionInterface }: Props) => JSX.Element;
export default _default;
