import ol from 'openlayers';
type CoordinateType = Array<any>;
type PointType = Array<any>;
type GeometryType = {
    getType: () => 'LineString' | 'Polygon' | 'Circle';
    getCoordinates: () => CoordinateType;
    getCenter: () => any;
    setCoordinates: (coords: CoordinateType) => void;
    setCenter: (cords: CoordinateType) => void;
};
export declare const OpenLayersGeometryUtils: {
    getCoordinatesFromGeometry: (geometry: GeometryType) => any;
    setCoordinatesForGeometry: (geometry: GeometryType, coordinates: CoordinateType) => void;
    mapCoordinateToLonLat: (point: PointType) => ol.Coordinate;
    lonLatToMapCoordinate: (point: PointType) => ol.Coordinate;
    wrapCoordinatesFromGeometry: (geometry: GeometryType) => GeometryType;
};
export default OpenLayersGeometryUtils;
