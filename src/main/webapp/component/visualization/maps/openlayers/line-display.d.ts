import { LineString } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import { Translation } from '../interactions.provider';
export declare function translateFromOpenlayersCoordinates(coords: Coordinate[]): Coordinate[];
export declare function translateToOpenlayersCoordinates(coords: Coordinate[]): Coordinate[];
export declare const drawLine: ({ map, model, line, id, isInteractive, translation, }: {
    map: any;
    model: any;
    line: LineString;
    id: string;
    isInteractive?: boolean;
    translation?: Translation;
}) => void;
export declare const OpenlayersLineDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean;
    translation?: Translation;
}) => import("react/jsx-runtime").JSX.Element;
