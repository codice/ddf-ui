/// <reference types="react" />
type Props = {
    toggleClustering: () => void;
    isClustering: boolean;
    zoomToHome: () => void;
    saveAsHome: () => void;
    map: {
        doPanZoom: (polygon: any) => void;
    };
    mapLayers: Array<any>;
};
export declare const MapToolbar: (props: Props) => JSX.Element;
declare const _default: (props: Props) => JSX.Element;
export default _default;
