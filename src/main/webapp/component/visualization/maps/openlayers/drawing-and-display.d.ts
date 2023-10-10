/// <reference types="react" />
import { Shape } from 'geospatialdraw/target/webapp/shape-utils';
import { GeometryJSON } from 'geospatialdraw/target/webapp/geometry';
import * as ol from 'openlayers';
export declare const removeOldDrawing: ({ map, id }: {
    map: ol.Map;
    id: string;
}) => void;
export declare const getDrawingGeometryFromModel: (model: any) => GeometryJSON | null;
export declare const convertToModel: (geo: GeometryJSON, shape: Shape) => {
    type: string;
    mode: import("../drawing-and-display").DrawModeType;
};
export declare const OpenlayersDrawings: ({ map, selectionInterface, }: {
    map: any;
    selectionInterface: any;
}) => JSX.Element;
