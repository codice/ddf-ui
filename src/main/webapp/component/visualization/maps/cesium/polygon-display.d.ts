/// <reference types="react" />
type Polygon = {
    polygon: [number, number][];
};
export declare const CesiumPolygonDisplay: ({ map, model, onDraw, }: {
    map: any;
    model: any;
    onDraw?: ((newPoly: Polygon) => void) | undefined;
}) => JSX.Element;
export {};
