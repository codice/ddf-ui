import MultiPolygon from 'ol/geom/MultiPolygon';
import { Translation } from '../interactions.provider';
export declare const translateFromOpenlayersCoordinates: (coords: any) => any;
export declare const drawPolygon: ({ map, model, polygon, id, isInteractive, translation, }: {
    map: any;
    model: any;
    polygon: MultiPolygon;
    id: string;
    isInteractive?: boolean;
    translation?: Translation;
}) => void;
export declare const OpenlayersPolygonDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean;
    translation?: Translation;
}) => import("react/jsx-runtime").JSX.Element;
