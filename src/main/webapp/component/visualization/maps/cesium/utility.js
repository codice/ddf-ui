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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS91dGlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxhQUFhLE1BQU0sOEJBQThCLENBQUE7QUFDeEQsT0FBTyxVQUFVLE1BQU0sMkJBQTJCLENBQUE7QUFDbEQsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBR2xDLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQTtBQU12Qjs7RUFFRTtBQUNGLGVBQWU7SUFDYjs7UUFFSTtJQUNKLG1DQUFtQyxZQUFDLGFBQWtCO1FBQ3BELE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQ3JDLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN6RSxDQUFDLE1BQU0sQ0FBQTtJQUNWLENBQUM7SUFDRDs7UUFFSTtJQUNKLDhDQUE4QyxZQUFDLGFBQWtCO1FBQy9ELE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQ3RDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxhQUFhLENBQUMsQ0FDeEQsQ0FBQTtJQUNILENBQUM7SUFDRDs7UUFFSTtJQUNKLDhDQUE4QyxZQUFDLGFBQWtCO1FBQy9ELElBQU0sMkJBQTJCLEdBQy9CLElBQUksQ0FBQyw4Q0FBOEMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUNwRSxPQUFPO1lBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQUMsU0FB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LE9BQU8sSUFBSSxDQUFBO1NBQ2Q7SUFDSCxDQUFDO0lBQ0QsY0FBYyxZQUFDLE9BQTBCOztRQUN2QyxPQUFPLE1BQUEsTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsUUFBUSwwQ0FBRSxXQUFXLDBDQUFFLE1BQU0sQ0FBQTtJQUMvQyxDQUFDO0lBQ0QsZUFBZSxZQUFDLEdBQXNCO1FBQ3BDLElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUE7UUFDN0IsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pDLElBQU0sbUJBQW1CLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQTtRQUN2QyxJQUNFLG1CQUFtQjtZQUNuQixDQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUNuRSxRQUFRLENBQUMsSUFBSSxDQUNkLEVBQ0Q7WUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFDLEtBQUs7Z0JBQ3hCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDaEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtpQkFDaEI7WUFDSCxDQUFDLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQztDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG5pbXBvcnQgU2hhcGVVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9qcy9TaGFwZVV0aWxzJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY2VzaS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgQ2VzaXVtIGZyb20gJ2Nlc2l1bS9CdWlsZC9DZXNpdW0vQ2VzaXVtJ1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHsgRmVhdHVyZSwgR2VvbWV0cnkgfSBmcm9tICdAdHVyZi90dXJmJ1xuXG5jb25zdCBNRVRFUlMgPSAnbWV0ZXJzJ1xuXG5pbnRlcmZhY2UgRmVhdHVyZVdpdGhDb29yZHMgZXh0ZW5kcyBHZW9KU09OLkZlYXR1cmUge1xuICBnZW9tZXRyeTogRXhjbHVkZTxHZW9KU09OLkdlb21ldHJ5LCBHZW9KU09OLkdlb21ldHJ5Q29sbGVjdGlvbj5cbn1cblxuLypcbiAgQSB2YXJpZXR5IG9mIGhlbHBmdWwgZnVuY3Rpb25zIGZvciBkZWFsaW5nIHdpdGggQ2VzaXVtXG4qL1xuZXhwb3J0IGRlZmF1bHQge1xuICAvKlxuICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGEgZ2VvbWV0cnkgKFdLVClcbiAgICAqL1xuICBjYWxjdWxhdGVDYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeShwcm9wZXJ0eU1vZGVsOiBhbnkpIHtcbiAgICByZXR1cm4gQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmZyb21Qb2ludHMoXG4gICAgICBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tRGVncmVlc0FycmF5KF8uZmxhdHRlbihwcm9wZXJ0eU1vZGVsLmdldFBvaW50cygpKSlcbiAgICApLmNlbnRlclxuICB9LFxuICAvKlxuICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGEgZ2VvbWV0cnkgKFdLVClcbiAgICAqL1xuICBjYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJ5SW5SYWRpYW5zKHByb3BlcnR5TW9kZWw6IGFueSkge1xuICAgIHJldHVybiBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4oXG4gICAgICB0aGlzLmNhbGN1bGF0ZUNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5KHByb3BlcnR5TW9kZWwpXG4gICAgKVxuICB9LFxuICAvKlxuICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGEgZ2VvbWV0cnkgKFdLVClcbiAgICAqL1xuICBjYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJ5SW5EZWdyZWVzKHByb3BlcnR5TW9kZWw6IGFueSkge1xuICAgIGNvbnN0IGNhcnRvZ3JhcGhpY0NlbnRlckluUmFkaWFucyA9XG4gICAgICB0aGlzLmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cnlJblJhZGlhbnMocHJvcGVydHlNb2RlbClcbiAgICByZXR1cm4gW1xuICAgICAgQ2VzaXVtLk1hdGgudG9EZWdyZWVzKGNhcnRvZ3JhcGhpY0NlbnRlckluUmFkaWFucy5sb25naXR1ZGUpLFxuICAgICAgQ2VzaXVtLk1hdGgudG9EZWdyZWVzKGNhcnRvZ3JhcGhpY0NlbnRlckluUmFkaWFucy5sYXRpdHVkZSksXG4gICAgXVxuICB9LFxuICBjYWxjdWxhdGVXaW5kb3dDZW50ZXJPZkdlb21ldHJ5KGdlb21ldHJ5OiBhbnksIG1hcDogYW55KSB7XG4gICAgbGV0IGNhcnRlc2lhbjNwb3NpdGlvbiA9IGdlb21ldHJ5XG4gICAgaWYgKGNhcnRlc2lhbjNwb3NpdGlvbi5jb25zdHJ1Y3RvciAhPT0gQ2VzaXVtLkNhcnRlc2lhbjMpIHtcbiAgICAgIGNhcnRlc2lhbjNwb3NpdGlvbiA9XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnkoY2FydGVzaWFuM3Bvc2l0aW9uKVxuICAgIH1cbiAgICByZXR1cm4gQ2VzaXVtLlNjZW5lVHJhbnNmb3Jtcy53Z3M4NFRvV2luZG93Q29vcmRpbmF0ZXMoXG4gICAgICBtYXAuc2NlbmUsXG4gICAgICBjYXJ0ZXNpYW4zcG9zaXRpb25cbiAgICApXG4gIH0sXG4gIC8qXG4gICAgICBDYWxjdWxhdGVzIHRoZSBjZW50ZXIgb2YgZ2l2ZW4gZ2VvbWV0cmllcyAoV0tUKVxuICAgICovXG4gIGNhbGN1bGF0ZUNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJpZXMocHJvcGVydHlNb2RlbHM6IGFueSkge1xuICAgIGNvbnN0IGFsbFBvaW50cyA9IHByb3BlcnR5TW9kZWxzLm1hcCgocHJvcGVydHlNb2RlbDogYW55KSA9PlxuICAgICAgcHJvcGVydHlNb2RlbC5nZXRQb2ludHMoKVxuICAgIClcbiAgICByZXR1cm4gQ2VzaXVtLkJvdW5kaW5nU3BoZXJlLmZyb21Qb2ludHMoXG4gICAgICBDZXNpdW0uQ2FydGVzaWFuMy5mcm9tRGVncmVlc0FycmF5KF8uZmxhdHRlbihhbGxQb2ludHMpKVxuICAgICkuY2VudGVyXG4gIH0sXG4gIC8qXG4gICAgICBDYWxjdWxhdGVzIHRoZSBjZW50ZXIgb2YgZ2l2ZW4gZ2VvbWV0cmllcyAoV0tUKVxuICAgICovXG4gIGNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luUmFkaWFucyhwcm9wZXJ0eU1vZGVsczogYW55KSB7XG4gICAgcmV0dXJuIENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbUNhcnRlc2lhbihcbiAgICAgIHRoaXMuY2FsY3VsYXRlQ2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cmllcyhwcm9wZXJ0eU1vZGVscylcbiAgICApXG4gIH0sXG4gIC8qXG4gICAgICBDYWxjdWxhdGVzIHRoZSBjZW50ZXIgb2YgZ2l2ZW4gZ2VvbWV0cmllcyAoV0tUKVxuICAgICovXG4gIGNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luRGVncmVlcyhwcm9wZXJ0eU1vZGVsczogYW55KSB7XG4gICAgY29uc3QgY2FydG9ncmFwaGljQ2VudGVySW5SYWRpYW5zID1cbiAgICAgIHRoaXMuY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyaWVzSW5SYWRpYW5zKHByb3BlcnR5TW9kZWxzKVxuICAgIHJldHVybiBbXG4gICAgICBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoY2FydG9ncmFwaGljQ2VudGVySW5SYWRpYW5zLmxvbmdpdHVkZSksXG4gICAgICBDZXNpdW0uTWF0aC50b0RlZ3JlZXMoY2FydG9ncmFwaGljQ2VudGVySW5SYWRpYW5zLmxhdGl0dWRlKSxcbiAgICBdXG4gIH0sXG4gIGZlYXR1cmVGcm9tU2hhcGUoc2hhcGU6IGFueSkge1xuICAgIGNvbnN0IGF0dHJzID0gc2hhcGUubW9kZWwuYXR0cmlidXRlc1xuXG4gICAgc3dpdGNoIChhdHRycy50eXBlKSB7XG4gICAgICBjYXNlICdMSU5FJzpcbiAgICAgICAgY29uc3QgbGluZSA9IFR1cmYubGluZVN0cmluZyhhdHRycy5saW5lKVxuICAgICAgICBjb25zdCBsaW5lTWV0ZXJzID0gRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUluTWV0ZXJzKFxuICAgICAgICAgIGF0dHJzLmxpbmVXaWR0aCxcbiAgICAgICAgICBhdHRycy5saW5lVW5pdHNcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gbGluZU1ldGVyc1xuICAgICAgICAgID8gVHVyZi5idWZmZXIobGluZSwgbGluZU1ldGVycywgeyB1bml0czogTUVURVJTIH0pXG4gICAgICAgICAgOiBsaW5lXG4gICAgICBjYXNlICdQT0xZR09OJzpcbiAgICAgICAgY29uc3QgcG9seWdvbiA9IFR1cmYucG9seWdvbihbYXR0cnMucG9seWdvbl0pXG4gICAgICAgIGNvbnN0IHBvbHlnb25NZXRlcnMgPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoXG4gICAgICAgICAgYXR0cnMucG9seWdvbkJ1ZmZlcldpZHRoLFxuICAgICAgICAgIGF0dHJzLnBvbHlnb25CdWZmZXJVbml0c1xuICAgICAgICApXG4gICAgICAgIHJldHVybiBwb2x5Z29uTWV0ZXJzXG4gICAgICAgICAgPyBUdXJmLmJ1ZmZlcihwb2x5Z29uLCBwb2x5Z29uTWV0ZXJzLCB7IHVuaXRzOiBNRVRFUlMgfSlcbiAgICAgICAgICA6IHBvbHlnb25cbiAgICAgIGNhc2UgJ01VTFRJUE9MWUdPTic6XG4gICAgICAgIGNvbnN0IGlzTXVsdGlQb2x5Z29uID0gU2hhcGVVdGlscy5pc0FycmF5M0QoYXR0cnMucG9seWdvbilcbiAgICAgICAgY29uc3QgbXVsdGlQb2x5Z29uID0gaXNNdWx0aVBvbHlnb25cbiAgICAgICAgICA/IFR1cmYucG9seWdvbihhdHRycy5wb2x5Z29uKVxuICAgICAgICAgIDogVHVyZi5wb2x5Z29uKFthdHRycy5wb2x5Z29uXSlcbiAgICAgICAgY29uc3QgbXVsdGlQb2x5Z29uTWV0ZXJzID0gRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUluTWV0ZXJzKFxuICAgICAgICAgIGF0dHJzLnBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICAgICAgICBhdHRycy5wb2x5Z29uQnVmZmVyVW5pdHNcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gbXVsdGlQb2x5Z29uTWV0ZXJzXG4gICAgICAgICAgPyBUdXJmLmJ1ZmZlcihtdWx0aVBvbHlnb24sIG11bHRpUG9seWdvbk1ldGVycywgeyB1bml0czogTUVURVJTIH0pXG4gICAgICAgICAgOiBtdWx0aVBvbHlnb25cbiAgICAgIGNhc2UgJ0JCT1gnOlxuICAgICAgICByZXR1cm4gVHVyZi5iYm94UG9seWdvbihbXG4gICAgICAgICAgYXR0cnMud2VzdCxcbiAgICAgICAgICBhdHRycy5zb3V0aCxcbiAgICAgICAgICBhdHRycy5lYXN0LFxuICAgICAgICAgIGF0dHJzLm5vcnRoLFxuICAgICAgICBdKVxuICAgICAgY2FzZSAnUE9JTlRSQURJVVMnOlxuICAgICAgICBjb25zdCBwb2ludCA9IFR1cmYucG9pbnQoW2F0dHJzLmxvbiwgYXR0cnMubGF0XSlcbiAgICAgICAgY29uc3QgcG9pbnRSYWRpdXNNZXRlcnMgPSBEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlSW5NZXRlcnMoXG4gICAgICAgICAgYXR0cnMucmFkaXVzLFxuICAgICAgICAgIGF0dHJzLnJhZGl1c1VuaXRzXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIHBvaW50UmFkaXVzTWV0ZXJzXG4gICAgICAgICAgPyBUdXJmLmJ1ZmZlcihwb2ludCwgcG9pbnRSYWRpdXNNZXRlcnMsIHsgdW5pdHM6IE1FVEVSUyB9KVxuICAgICAgICAgIDogcG9pbnRcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9LFxuICBmZWF0dXJlSXNWYWxpZChmZWF0dXJlOiBGZWF0dXJlV2l0aENvb3Jkcykge1xuICAgIHJldHVybiBmZWF0dXJlPy5nZW9tZXRyeT8uY29vcmRpbmF0ZXM/Lmxlbmd0aFxuICB9LFxuICBhZGp1c3RHZW9Db29yZHMoZ2VvOiBGZWF0dXJlPEdlb21ldHJ5Pikge1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gZ2VvLmdlb21ldHJ5XG4gICAgY29uc3QgYmJveCA9IGdlby5iYm94IHx8IFR1cmYuYmJveChnZW9tZXRyeSlcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKGJib3hbMF0gLSBiYm94WzJdKVxuICAgIGNvbnN0IGNyb3NzZXNBbnRpbWVyaWRpYW4gPSB3aWR0aCA+IDE4MFxuICAgIGlmIChcbiAgICAgIGNyb3NzZXNBbnRpbWVyaWRpYW4gJiZcbiAgICAgIFsnTGluZVN0cmluZycsICdNdWx0aUxpbmVTdHJpbmcnLCAnUG9seWdvbicsICdNdWx0aVBvbHlnb24nXS5pbmNsdWRlcyhcbiAgICAgICAgZ2VvbWV0cnkudHlwZVxuICAgICAgKVxuICAgICkge1xuICAgICAgVHVyZi5jb29yZEVhY2goZ2VvLCAoY29vcmQpID0+IHtcbiAgICAgICAgaWYgKGNvb3JkWzBdIDwgMCkge1xuICAgICAgICAgIGNvb3JkWzBdICs9IDM2MFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSxcbn1cbiJdfQ==