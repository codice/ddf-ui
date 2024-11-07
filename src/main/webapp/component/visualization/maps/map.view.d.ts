/// <reference types="react" />
type MapViewReactType = {
    setMap: (map: any) => void;
    loadMap: () => any;
    selectionInterface: any;
    mapLayers: any;
};
export declare const MapViewReact: (props: MapViewReactType) => JSX.Element;
export {};
