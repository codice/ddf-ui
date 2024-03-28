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
import _ from 'underscore';
import DistanceUtils from '../../../../js/DistanceUtils';
import ShapeUtils from '../../../../js/ShapeUtils';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import * as Turf from '@turf/turf';
var METERS = 'meters';
/*
  A variety of helpful functions for dealing with Cesium
*/
export default {
    /*
        Calculates the center of given a geometry (WKT)
      */
    calculateCartesian3CenterOfGeometry: function (propertyModel) {
        return Cesium.BoundingSphere.fromPoints(Cesium.Cartesian3.fromDegreesArray(_.flatten(propertyModel.getPoints()))).center;
    },
    /*
        Calculates the center of given a geometry (WKT)
      */
    calculateCartographicCenterOfGeometryInRadians: function (propertyModel) {
        return Cesium.Cartographic.fromCartesian(this.calculateCartesian3CenterOfGeometry(propertyModel));
    },
    /*
        Calculates the center of given a geometry (WKT)
      */
    calculateCartographicCenterOfGeometryInDegrees: function (propertyModel) {
        var cartographicCenterInRadians = this.calculateCartographicCenterOfGeometryInRadians(propertyModel);
        return [
            Cesium.Math.toDegrees(cartographicCenterInRadians.longitude),
            Cesium.Math.toDegrees(cartographicCenterInRadians.latitude),
        ];
    },
    calculateWindowCenterOfGeometry: function (geometry, map) {
        var cartesian3position = geometry;
        if (cartesian3position.constructor !== Cesium.Cartesian3) {
            cartesian3position =
                this.calculateCartesian3CenterOfGeometry(cartesian3position);
        }
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(map.scene, cartesian3position);
    },
    /*
        Calculates the center of given geometries (WKT)
      */
    calculateCartesian3CenterOfGeometries: function (propertyModels) {
        var allPoints = propertyModels.map(function (propertyModel) {
            return propertyModel.getPoints();
        });
        return Cesium.BoundingSphere.fromPoints(Cesium.Cartesian3.fromDegreesArray(_.flatten(allPoints))).center;
    },
    /*
        Calculates the center of given geometries (WKT)
      */
    calculateCartographicCenterOfGeometriesInRadians: function (propertyModels) {
        return Cesium.Cartographic.fromCartesian(this.calculateCartesian3CenterOfGeometries(propertyModels));
    },
    /*
        Calculates the center of given geometries (WKT)
      */
    calculateCartographicCenterOfGeometriesInDegrees: function (propertyModels) {
        var cartographicCenterInRadians = this.calculateCartographicCenterOfGeometriesInRadians(propertyModels);
        return [
            Cesium.Math.toDegrees(cartographicCenterInRadians.longitude),
            Cesium.Math.toDegrees(cartographicCenterInRadians.latitude),
        ];
    },
    featureFromShape: function (shape) {
        var attrs = shape.model.attributes;
        switch (attrs.type) {
            case 'LINE':
                var line = Turf.lineString(attrs.line);
                var lineMeters = DistanceUtils.getDistanceInMeters(attrs.lineWidth, attrs.lineUnits);
                return lineMeters
                    ? Turf.buffer(line, lineMeters, { units: METERS })
                    : line;
            case 'POLYGON':
                var polygon = Turf.polygon([attrs.polygon]);
                var polygonMeters = DistanceUtils.getDistanceInMeters(attrs.polygonBufferWidth, attrs.polygonBufferUnits);
                return polygonMeters
                    ? Turf.buffer(polygon, polygonMeters, { units: METERS })
                    : polygon;
            case 'MULTIPOLYGON':
                var isMultiPolygon = ShapeUtils.isArray3D(attrs.polygon);
                var multiPolygon = isMultiPolygon
                    ? Turf.polygon(attrs.polygon)
                    : Turf.polygon([attrs.polygon]);
                var multiPolygonMeters = DistanceUtils.getDistanceInMeters(attrs.polygonBufferWidth, attrs.polygonBufferUnits);
                return multiPolygonMeters
                    ? Turf.buffer(multiPolygon, multiPolygonMeters, { units: METERS })
                    : multiPolygon;
            case 'BBOX':
                return Turf.bboxPolygon([
                    attrs.west,
                    attrs.south,
                    attrs.east,
                    attrs.north,
                ]);
            case 'POINTRADIUS':
                var point = Turf.point([attrs.lon, attrs.lat]);
                var pointRadiusMeters = DistanceUtils.getDistanceInMeters(attrs.radius, attrs.radiusUnits);
                return pointRadiusMeters
                    ? Turf.buffer(point, pointRadiusMeters, { units: METERS })
                    : point;
            default:
                return null;
        }
    },
    featureIsValid: function (feature) {
        var _a, _b;
        return (_b = (_a = feature === null || feature === void 0 ? void 0 : feature.geometry) === null || _a === void 0 ? void 0 : _a.coordinates) === null || _b === void 0 ? void 0 : _b.length;
    },
    adjustGeoCoords: function (geo) {
        var geometry = geo.geometry;
        var bbox = geo.bbox || Turf.bbox(geometry);
        var width = Math.abs(bbox[0] - bbox[2]);
        var crossesAntimeridian = width > 180;
        if (crossesAntimeridian &&
            ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometry.type)) {
            Turf.coordEach(geo, function (coord) {
                if (coord[0] < 0) {
                    coord[0] += 360;
                }
            });
        }
    },
};
//# sourceMappingURL=utility.js.map