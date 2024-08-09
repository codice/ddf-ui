import Openlayers from 'openlayers';
import * as Turf from '@turf/turf';
import { Position } from '@turf/turf';
import { GeometryJSON } from 'geospatialdraw/target/webapp/geometry';
declare const _default: {
    calculateOpenlayersCenterOfGeometry(propertyModel: any): Openlayers.Coordinate;
    calculateCartographicCenterOfGeometryInDegrees(propertyModel: any): Openlayers.Coordinate;
    calculateOpenlayersCenterOfGeometries(propertyModels: any): Openlayers.Coordinate;
    calculateCartographicCenterOfGeometriesInDegrees(propertyModels: any): Openlayers.Coordinate;
    convertCoordsToDisplay(coordinates: Position[]): Turf.helpers.Position[];
    adjustGeoCoords(geo: GeometryJSON): void;
};
export default _default;
