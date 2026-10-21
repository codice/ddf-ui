import { Shape } from 'geospatialdraw/target/webapp/shape-utils';
export declare const SHAPE_ID_PREFIX = "shape";
export declare const getIdFromModelForDisplay: ({ model }: {
    model: any;
}) => string;
export declare const getIdFromModelForDrawing: ({ model }: {
    model: any;
}) => string;
export type DrawModeType = 'line' | 'poly' | 'circle' | 'bbox' | 'keyword';
type LocationTypeType = 'LINE' | 'POLYGON' | 'MULTIPOLYGON' | 'BBOX' | 'POINTRADIUS' | 'POINT';
export declare const getLocationTypeFromModel: ({ model }: {
    model: any;
}) => LocationTypeType;
export declare const getDrawModeFromModel: ({ model, }: {
    model: any;
}) => DrawModeType;
export declare const getShapeFromDrawMode: (drawMode: DrawModeType) => Shape;
export declare const getDrawModeFromShape: (shape: Shape) => DrawModeType;
export declare const useDrawingAndDisplayModels: ({ selectionInterface, map, }: {
    selectionInterface: any;
    map: any;
}) => {
    models: any[];
    drawingModels: any[];
    filterModels: any[];
};
export {};
