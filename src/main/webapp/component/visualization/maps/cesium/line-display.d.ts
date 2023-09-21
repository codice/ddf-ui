/// <reference types="react" />
type Line = {
    line: [number, number][];
};
export declare const constructSolidLinePrimitive: ({ coordinates, model, id, color, buffer, }: {
    coordinates: any;
    model: any;
    id: string;
    color?: string | undefined;
    buffer?: number | undefined;
}) => {
    width: number;
    material: any;
    id: string;
    positions: any;
    buffer: number | undefined;
};
export declare const constructOutlinedLinePrimitive: ({ coordinates, model, id, color, buffer, }: {
    coordinates: any;
    model: any;
    id: string;
    color?: string | undefined;
    buffer?: number | undefined;
}) => {
    width: number;
    material: any;
    id: string;
    positions: any;
    buffer: number | undefined;
};
export declare const CesiumLineDisplay: ({ map, model, onDraw, }: {
    map: any;
    model: any;
    onDraw?: ((newLine: Line) => void) | undefined;
}) => JSX.Element;
export {};
