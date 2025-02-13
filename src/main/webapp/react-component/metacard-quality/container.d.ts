import * as React from 'react';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    result: LazyQueryResult;
};
type State = {
    attributeValidation: any;
    metacardValidation: any;
    loading: boolean;
};
declare class MetacardQuality extends React.Component<Props, State> {
    constructor(props: Props);
    model: LazyQueryResult;
    componentDidMount(): void;
    getData: (res: any, type: string) => any;
    checkForDuplicate: (metacardValidation: any) => void;
    render(): JSX.Element;
}
declare const _default: typeof MetacardQuality;
export default _default;
