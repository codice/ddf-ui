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
export declare const MapToolbar: (props: Props) => import("react/jsx-runtime").JSX.Element;
export default MapToolbar;
