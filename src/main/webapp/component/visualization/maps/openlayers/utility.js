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
import _ from 'lodash';
import Openlayers from 'openlayers';
import * as Turf from '@turf/turf';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
function convertPointCoordinate(point) {
    var coords = [point[0], point[1]];
    return Openlayers.proj.transform(coords, 'EPSG:4326', StartupDataStore.Configuration.getProjection());
}
function unconvertPointCoordinate(point) {
    return Openlayers.proj.transform(point, StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
}
/*
  A variety of helpful functions for dealing with Openlayers
*/
export default {
    /*
          Calculates the center of given a geometry (WKT)
        */
    calculateOpenlayersCenterOfGeometry: function (propertyModel) {
        var lineObject = propertyModel
            .getPoints()
            .map(function (coordinate) { return convertPointCoordinate(coordinate); });
        var extent = Openlayers.extent.boundingExtent(lineObject);
        return Openlayers.extent.getCenter(extent);
    },
    /*
          Calculates the center of given a geometry (WKT)
        */
    calculateCartographicCenterOfGeometryInDegrees: function (propertyModel) {
        var openlayersCenter = this.calculateOpenlayersCenterOfGeometry(propertyModel);
        return unconvertPointCoordinate(openlayersCenter);
    },
    /*
          Calculates the center of given geometries (WKT)
        */
    calculateOpenlayersCenterOfGeometries: function (propertyModels) {
        var allPoints = _.flatten(propertyModels.map(function (propertyModel) { return propertyModel.getPoints(); })).map(function (coordinate) { return convertPointCoordinate(coordinate); });
        var extent = Openlayers.extent.boundingExtent(allPoints);
        return Openlayers.extent.getCenter(extent);
    },
    /*
          Calculates the center of given geometries (WKT)
        */
    calculateCartographicCenterOfGeometriesInDegrees: function (propertyModels) {
        var openlayersCenter = this.calculateOpenlayersCenterOfGeometries(propertyModels);
        return unconvertPointCoordinate(openlayersCenter);
    },
    convertCoordsToDisplay: function (coordinates) {
        var coords = _.cloneDeep(coordinates);
        coords.forEach(function (coord) {
            if (coord[0] < 0) {
                coord[0] += 360;
            }
        });
        return coords;
    },
    adjustGeoCoords: function (geo) {
        var geometry = geo.geometry;
        var bbox = geo.bbox || Turf.bbox(geo.geometry);
        var width = Math.abs(bbox[0] - bbox[2]);
        var crossesAntiMeridian = width > 180;
        if (crossesAntiMeridian) {
            if (geo.properties.shape === 'Line') {
                var lineStringCoords = geometry.coordinates;
                geometry.coordinates = this.convertCoordsToDisplay(lineStringCoords);
            }
            else if (geo.properties.shape === 'Bounding Box' ||
                geo.properties.shape === 'Polygon') {
                var coords = geometry.coordinates[0];
                geometry.coordinates[0] = this.convertCoordsToDisplay(coords);
            }
        }
    },
};
//# sourceMappingURL=utility.js.map