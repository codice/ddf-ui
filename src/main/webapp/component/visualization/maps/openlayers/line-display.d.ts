/// <reference types="react" />
import ol from 'openlayers';
import { Translation } from '../interactions.provider';
type CoordinateType = [number, number];
type CoordinatesType = Array<CoordinateType>;
export declare function translateFromOpenlayersCoordinates(coords: CoordinatesType): CoordinatesType;
export declare function translateToOpenlayersCoordinates(coords: CoordinatesType): CoordinatesType;
export declare const drawLine: ({ map, model, line, id, isInteractive, translation, }: {
    map: any;
    model: any;
    line: ol.geom.LineString;
    id: string;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => void;
export declare const OpenlayersLineDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => JSX.Element;
export {};
