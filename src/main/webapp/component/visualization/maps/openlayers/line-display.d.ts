import ol from 'openlayers';
type CoordinateType = [number, number];
type CoordinatesType = Array<CoordinateType>;
export declare function translateFromOpenlayersCoordinates(coords: CoordinatesType): CoordinatesType;
export declare function translateToOpenlayersCoordinates(coords: CoordinatesType): CoordinatesType;
export declare const drawLine: ({ map, model, line, id, }: {
    map: any;
    model: any;
    line: ol.geom.LineString;
    id: string;
}) => void;
export declare const OpenlayersLineDisplay: ({ map, model, }: {
    map: any;
    model: any;
}) => JSX.Element;
export {};
