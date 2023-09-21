import * as React from 'react';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
type Props = {
    model: LazyQueryResult;
};
type State = {
    currentOverlayUrl: string;
};
declare class MapActions extends React.Component<Props, State> {
    constructor(props: Props);
    getActions: () => {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    getMapActions: () => {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    getOverlayActions: () => {
        description: string;
        url: string;
        overlayText: string;
    }[];
    getOverlayText: (actionUrl: String) => string;
    overlayImage: (event: any) => void;
    render(): JSX.Element;
}
declare const _default: typeof MapActions;
export default _default;
