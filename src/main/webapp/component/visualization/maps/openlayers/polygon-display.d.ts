import ol from 'openlayers';
export declare const translateFromOpenlayersCoordinates: (coords: any) => any;
export declare const drawPolygon: ({ map, model, polygon, id, }: {
    map: any;
    model: any;
    polygon: ol.geom.MultiPolygon;
    id: string;
}) => void;
export declare const OpenlayersPolygonDisplay: ({ map, model, }: {
    map: any;
    model: any;
}) => JSX.Element;
