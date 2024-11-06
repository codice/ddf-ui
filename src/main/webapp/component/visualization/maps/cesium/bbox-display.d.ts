/// <reference types="react" />
import { Translation } from '../interactions.provider';
type BBox = {
    north: number;
    south: number;
    east: number;
    west: number;
};
export declare const CesiumBboxDisplay: ({ map, model, onDraw, translation, isInteractive, }: {
    map: any;
    model: any;
    onDraw?: ((newBbox: BBox) => void) | undefined;
    translation?: Translation | undefined;
    isInteractive?: boolean | undefined;
}) => JSX.Element;
export {};
