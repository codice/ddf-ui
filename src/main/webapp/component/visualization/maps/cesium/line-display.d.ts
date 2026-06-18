import { Translation } from '../interactions.provider';
type Line = {
    line: [number, number][];
};
export declare const constructSolidLinePrimitive: ({ coordinates, model, id, color, buffer, isInteractive, }: {
    coordinates: any;
    model: any;
    id: string;
    color?: string;
    buffer?: number;
    isInteractive?: boolean;
}) => {
    width: number;
    material: any;
    id: string;
    positions: any;
    buffer: number | undefined;
};
export declare const constructOutlinedLinePrimitive: ({ coordinates, model, id, color, buffer, isInteractive, }: {
    coordinates: any;
    model: any;
    id: string;
    color?: string;
    buffer?: number;
    isInteractive?: boolean;
}) => {
    width: number;
    material: any;
    id: string;
    positions: any;
    buffer: number | undefined;
};
export declare const constructDottedLinePrimitive: ({ coordinates, model, isInteractive, }: {
    coordinates: any;
    model: any;
    isInteractive?: boolean;
}) => {
    width: number;
    material: any;
    id: string;
    positions: any;
};
export declare const CesiumLineDisplay: ({ map, model, onDraw, translation, isInteractive, }: {
    map: any;
    model: any;
    onDraw?: (newLine: Line) => void;
    translation?: Translation;
    isInteractive?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export {};
