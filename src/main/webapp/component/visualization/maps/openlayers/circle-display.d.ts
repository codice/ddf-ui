import ol from 'openlayers';
export declare function translateFromOpenlayersCoordinate(coord: any): ol.Coordinate;
export declare const drawCircle: ({ map, model, rectangle, id, }: {
    map: any;
    model: any;
    rectangle: any;
    id: string;
}) => void;
export declare const OpenlayersCircleDisplay: ({ map, model, }: {
    map: any;
    model: any;
}) => JSX.Element;
