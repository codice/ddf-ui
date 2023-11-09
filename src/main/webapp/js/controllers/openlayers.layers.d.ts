import { Layers } from './layers';
type MakeMapType = {
    zoom: number;
    minZoom: number;
    center: [number, number];
    element: HTMLElement;
};
export declare class OpenlayersLayers {
    layers: Layers;
    map: any;
    isMapCreated: boolean;
    layerForCid: any;
    backboneModel: any;
    constructor();
    makeMap(mapOptions: MakeMapType): any;
    addLayer(model: any): Promise<void>;
    removeLayer(model: any): void;
    reIndexLayers(): void;
    setAlpha(model: any): void;
    setShow(model: any): void;
}
export {};
