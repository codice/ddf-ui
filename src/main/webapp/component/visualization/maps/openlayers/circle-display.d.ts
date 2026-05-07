import { Translation } from '../interactions.provider';
export declare function translateFromOpenlayersCoordinate(coord: any): import("ol/coordinate").Coordinate;
export declare const drawCircle: ({ map, model, rectangle, id, isInteractive, translation, }: {
    map: any;
    model: any;
    rectangle: any;
    id: string;
    isInteractive?: boolean;
    translation?: Translation;
}) => void;
export declare const OpenlayersCircleDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean;
    translation?: Translation;
}) => import("react/jsx-runtime").JSX.Element;
