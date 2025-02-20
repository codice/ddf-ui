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
    onDraw?: (newCircle: Circle) => void;
    translation?: Translation;
    isInteractive?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export {};
