import * as React from 'react';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    result: LazyQueryResult;
};
type State = {
    history: any;
    selectedVersion: any;
    loading: boolean;
};
declare class MetacardHistory extends React.Component<Props, State> {
    constructor(props: Props);
    model: LazyQueryResult;
    componentDidMount(): void;
    getSourceId(): any;
    loadData(): void;
    onClick: (event: any) => void;
    revertToSelectedVersion: () => Promise<void>;
    render(): JSX.Element;
}
declare const _default: typeof MetacardHistory;
export default _default;
