type Circle = {
    lon: number;
    lat: number;
    radius: number;
    radiusUnits: string;
};
export declare const CesiumCircleDisplay: ({ map, model, onDraw, }: {
    map: any;
    model: any;
    onDraw?: ((newCircle: Circle) => void) | undefined;
}) => JSX.Element;
export {};
