/// <reference types="react" />
import ol from 'openlayers';
import { Translation } from '../interactions.provider';
export declare function translateFromOpenlayersCoordinate(coord: any): ol.Coordinate;
export declare const drawCircle: ({ map, model, rectangle, id, isInteractive, translation, }: {
    map: any;
    model: any;
    rectangle: any;
    id: string;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => void;
export declare const OpenlayersCircleDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => JSX.Element;
