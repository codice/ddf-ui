/// <reference types="react" />
import { Translation } from '../interactions.provider';
type Circle = {
    lon: number;
    lat: number;
    radius: number;
    radiusUnits: string;
};
export declare const CesiumCircleDisplay: ({ map, model, onDraw, translation, isInteractive, }: {
    map: any;
    model: any;
    onDraw?: ((newCircle: Circle) => void) | undefined;
    translation?: Translation | undefined;
    isInteractive?: boolean | undefined;
}) => JSX.Element;
export {};
