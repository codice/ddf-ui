import { Shape } from 'geospatialdraw/target/webapp/shape-utils';
import { GeometryJSON } from 'geospatialdraw/target/webapp/geometry';
import Map from 'ol/Map';
export declare const removeOldDrawing: ({ map, id }: {
    map: Map;
    id: string;
}) => void;
export declare const getDrawingGeometryFromModel: (model: any) => GeometryJSON | null;
export declare const convertToModel: ({ geo, shape, existingModel, }: {
    geo: GeometryJSON;
    shape: Shape;
    existingModel?: Backbone.Model;
}) => {
    [key: string]: any;
};
export declare const OpenlayersDrawings: ({ map, selectionInterface, }: {
    map: any;
    selectionInterface: any;
}) => import("react/jsx-runtime").JSX.Element;
