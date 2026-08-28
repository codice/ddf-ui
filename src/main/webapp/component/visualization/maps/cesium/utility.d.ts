/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
interface FeatureWithCoords extends GeoJSON.Feature {
    geometry: Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>;
}
declare const _default: {
    calculateCartesian3CenterOfGeometry(propertyModel: any): any;
    calculateCartographicCenterOfGeometryInRadians(propertyModel: any): any;
    calculateCartographicCenterOfGeometryInDegrees(propertyModel: any): any[];
    calculateWindowCenterOfGeometry(geometry: any, map: any): any;
    calculateCartesian3CenterOfGeometries(propertyModels: any): any;
    calculateCartographicCenterOfGeometriesInRadians(propertyModels: any): any;
    calculateCartographicCenterOfGeometriesInDegrees(propertyModels: any): any[];
    featureFromShape(shape: any): import("geojson").Feature<import("geojson").LineString, import("geojson").GeoJsonProperties> | import("geojson").Feature<import("geojson").Polygon | import("geojson").MultiPolygon, import("geojson").GeoJsonProperties> | import("geojson").Feature<import("geojson").Point, import("geojson").GeoJsonProperties> | null | undefined;
    featureIsValid(feature: FeatureWithCoords): number;
    adjustGeoCoords(geo: GeoJSON.Feature<GeoJSON.Geometry>): void;
};
export default _default;
