/// <reference types="react" />
import ol from 'openlayers';
import { Translation } from '../interactions.provider';
export declare const translateFromOpenlayersCoordinates: (coords: any) => any;
export declare const drawPolygon: ({ map, model, polygon, id, isInteractive, translation, }: {
    map: any;
    model: any;
    polygon: ol.geom.MultiPolygon;
    id: string;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => void;
export declare const OpenlayersPolygonDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => JSX.Element;
