export declare function addLayer({ initialized: initializedLayerOrder, all: allLayerOrder, layer: layerId, }: any): any;
export declare function shiftLayers({ prev: previousLayerOrder, cur: currentLayerOrder, }: any): any;
export declare function getShift({ prev: previousLayerOrder, cur: currentLayerOrder, }: any): {
    layer: any;
    method: string;
    count: number;
};
