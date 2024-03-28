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
import Common from './Common';
/*jshint esversion: 6, bitwise: false*/
import ol from 'openlayers';
import { StartupDataStore } from './model/Startup/startup';
export var OpenLayersGeometryUtils = {
    getCoordinatesFromGeometry: function (geometry) {
        var type = geometry.getType();
        switch (type) {
            case 'LineString':
                return geometry.getCoordinates();
            case 'Polygon':
                return geometry.getCoordinates()[0];
            case 'Circle':
                return [geometry.getCenter()];
            default:
                return [];
        }
    },
    setCoordinatesForGeometry: function (geometry, coordinates) {
        var type = geometry.getType();
        switch (type) {
            case 'LineString':
                geometry.setCoordinates(coordinates);
                break;
            case 'Polygon':
                geometry.setCoordinates([coordinates]);
                break;
            case 'Circle':
                geometry.setCenter(coordinates[0]);
                break;
            default:
                break;
        }
    },
    mapCoordinateToLonLat: function (point) {
        return ol.proj.transform(point, StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
    },
    lonLatToMapCoordinate: function (point) {
        return ol.proj.transform(point, 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    },
    wrapCoordinatesFromGeometry: function (geometry) {
        var coordinates = OpenLayersGeometryUtils.getCoordinatesFromGeometry(geometry).map(OpenLayersGeometryUtils.mapCoordinateToLonLat);
        coordinates = Common.wrapMapCoordinatesArray(coordinates).map(OpenLayersGeometryUtils.lonLatToMapCoordinate);
        OpenLayersGeometryUtils.setCoordinatesForGeometry(geometry, coordinates);
        return geometry;
    },
};
export default OpenLayersGeometryUtils;
//# sourceMappingURL=OpenLayersGeometryUtils.js.map