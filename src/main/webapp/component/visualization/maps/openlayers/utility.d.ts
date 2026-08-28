import { GeometryJSON } from 'geospatialdraw/target/webapp/geometry';
declare const _default: {
    calculateOpenlayersCenterOfGeometry(propertyModel: any): import("ol/coordinate").Coordinate;
    calculateCartographicCenterOfGeometryInDegrees(propertyModel: any): import("ol/coordinate").Coordinate;
    calculateOpenlayersCenterOfGeometries(propertyModels: any): import("ol/coordinate").Coordinate;
    calculateCartographicCenterOfGeometriesInDegrees(propertyModels: any): import("ol/coordinate").Coordinate;
    convertCoordsToDisplay(coordinates: GeoJSON.Position[]): import("geojson").Position[];
    adjustGeoCoords(geo: GeometryJSON): void;
};
export default _default;
