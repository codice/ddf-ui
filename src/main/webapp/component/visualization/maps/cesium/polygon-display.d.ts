import { Translation } from '../interactions.provider';
type Polygon = {
    polygon: [number, number][];
};
export declare const CesiumPolygonDisplay: ({ map, model, onDraw, translation, isInteractive, }: {
    map: any;
    model: any;
    onDraw?: (newPoly: Polygon) => void;
    translation?: Translation;
    isInteractive?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export {};
