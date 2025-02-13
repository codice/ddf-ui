/// <reference types="react" />
import { Translation } from '../interactions.provider';
type Polygon = {
    polygon: [number, number][];
};
export declare const CesiumPolygonDisplay: ({ map, model, onDraw, translation, isInteractive, }: {
    map: any;
    model: any;
    onDraw?: ((newPoly: Polygon) => void) | undefined;
    translation?: Translation | undefined;
    isInteractive?: boolean | undefined;
}) => JSX.Element;
export {};
