type BBox = {
    north: number;
    south: number;
    east: number;
    west: number;
};
export declare const CesiumBboxDisplay: ({ map, model, onDraw, }: {
    map: any;
    model: any;
    onDraw?: ((newBbox: BBox) => void) | undefined;
}) => JSX.Element;
export {};
