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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2Nlc2l1bS91dGlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxhQUFhLE1BQU0sOEJBQThCLENBQUE7QUFDeEQsT0FBTyxVQUFVLE1BQU0sMkJBQTJCLENBQUE7QUFDbEQsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLDRCQUE0QixDQUFBO0FBQy9DLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBRWxDLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQTtBQU12Qjs7RUFFRTtBQUNGLGVBQWU7SUFDYjs7UUFFSTtJQUNKLG1DQUFtQyxZQUFDLGFBQWtCO1FBQ3BELE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQ3JDLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN6RSxDQUFDLE1BQU0sQ0FBQTtJQUNWLENBQUM7SUFDRDs7UUFFSTtJQUNKLDhDQUE4QyxZQUFDLGFBQWtCO1FBQy9ELE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQ3RDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxhQUFhLENBQUMsQ0FDeEQsQ0FBQTtJQUNILENBQUM7SUFDRDs7UUFFSTtJQUNKLDhDQUE4QyxZQUFDLGFBQWtCO1FBQy9ELElBQU0sMkJBQTJCLEdBQy9CLElBQUksQ0FBQyw4Q0FBOEMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUNwRSxPQUFPO1lBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQUMsU0FB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Q0FBQTtZQUNYO2dCQUNFLE9BQU8sSUFBSSxDQUFBO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFDRCxjQUFjLFlBQUMsT0FBMEI7O1FBQ3ZDLE9BQU8sTUFBQSxNQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLDBDQUFFLFdBQVcsMENBQUUsTUFBTSxDQUFBO0lBQy9DLENBQUM7SUFDRCxlQUFlLFlBQUMsR0FBc0M7UUFDcEQsSUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQTtRQUM3QixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekMsSUFBTSxtQkFBbUIsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFBO1FBQ3ZDLElBQ0UsbUJBQW1CO1lBQ25CLENBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQ25FLFFBQVEsQ0FBQyxJQUFJLENBQ2QsRUFDRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsVUFBQyxLQUFLO2dCQUN4QixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDakIsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtnQkFDakIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztJQUNILENBQUM7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgRGlzdGFuY2VVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9qcy9EaXN0YW5jZVV0aWxzJ1xuaW1wb3J0IFNoYXBlVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vanMvU2hhcGVVdGlscydcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCAqIGFzIFR1cmYgZnJvbSAnQHR1cmYvdHVyZidcblxuY29uc3QgTUVURVJTID0gJ21ldGVycydcblxuaW50ZXJmYWNlIEZlYXR1cmVXaXRoQ29vcmRzIGV4dGVuZHMgR2VvSlNPTi5GZWF0dXJlIHtcbiAgZ2VvbWV0cnk6IEV4Y2x1ZGU8R2VvSlNPTi5HZW9tZXRyeSwgR2VvSlNPTi5HZW9tZXRyeUNvbGxlY3Rpb24+XG59XG5cbi8qXG4gIEEgdmFyaWV0eSBvZiBoZWxwZnVsIGZ1bmN0aW9ucyBmb3IgZGVhbGluZyB3aXRoIENlc2l1bVxuKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLypcbiAgICAgIENhbGN1bGF0ZXMgdGhlIGNlbnRlciBvZiBnaXZlbiBhIGdlb21ldHJ5IChXS1QpXG4gICAgKi9cbiAgY2FsY3VsYXRlQ2FydGVzaWFuM0NlbnRlck9mR2VvbWV0cnkocHJvcGVydHlNb2RlbDogYW55KSB7XG4gICAgcmV0dXJuIENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5mcm9tUG9pbnRzKFxuICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXNBcnJheShfLmZsYXR0ZW4ocHJvcGVydHlNb2RlbC5nZXRQb2ludHMoKSkpXG4gICAgKS5jZW50ZXJcbiAgfSxcbiAgLypcbiAgICAgIENhbGN1bGF0ZXMgdGhlIGNlbnRlciBvZiBnaXZlbiBhIGdlb21ldHJ5IChXS1QpXG4gICAgKi9cbiAgY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyeUluUmFkaWFucyhwcm9wZXJ0eU1vZGVsOiBhbnkpIHtcbiAgICByZXR1cm4gQ2VzaXVtLkNhcnRvZ3JhcGhpYy5mcm9tQ2FydGVzaWFuKFxuICAgICAgdGhpcy5jYWxjdWxhdGVDYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyeShwcm9wZXJ0eU1vZGVsKVxuICAgIClcbiAgfSxcbiAgLypcbiAgICAgIENhbGN1bGF0ZXMgdGhlIGNlbnRlciBvZiBnaXZlbiBhIGdlb21ldHJ5IChXS1QpXG4gICAgKi9cbiAgY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyeUluRGVncmVlcyhwcm9wZXJ0eU1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBjYXJ0b2dyYXBoaWNDZW50ZXJJblJhZGlhbnMgPVxuICAgICAgdGhpcy5jYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJ5SW5SYWRpYW5zKHByb3BlcnR5TW9kZWwpXG4gICAgcmV0dXJuIFtcbiAgICAgIENlc2l1bS5NYXRoLnRvRGVncmVlcyhjYXJ0b2dyYXBoaWNDZW50ZXJJblJhZGlhbnMubG9uZ2l0dWRlKSxcbiAgICAgIENlc2l1bS5NYXRoLnRvRGVncmVlcyhjYXJ0b2dyYXBoaWNDZW50ZXJJblJhZGlhbnMubGF0aXR1ZGUpLFxuICAgIF1cbiAgfSxcbiAgY2FsY3VsYXRlV2luZG93Q2VudGVyT2ZHZW9tZXRyeShnZW9tZXRyeTogYW55LCBtYXA6IGFueSkge1xuICAgIGxldCBjYXJ0ZXNpYW4zcG9zaXRpb24gPSBnZW9tZXRyeVxuICAgIGlmIChjYXJ0ZXNpYW4zcG9zaXRpb24uY29uc3RydWN0b3IgIT09IENlc2l1bS5DYXJ0ZXNpYW4zKSB7XG4gICAgICBjYXJ0ZXNpYW4zcG9zaXRpb24gPVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJ5KGNhcnRlc2lhbjNwb3NpdGlvbilcbiAgICB9XG4gICAgcmV0dXJuIENlc2l1bS5TY2VuZVRyYW5zZm9ybXMud2dzODRUb1dpbmRvd0Nvb3JkaW5hdGVzKFxuICAgICAgbWFwLnNjZW5lLFxuICAgICAgY2FydGVzaWFuM3Bvc2l0aW9uXG4gICAgKVxuICB9LFxuICAvKlxuICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGdlb21ldHJpZXMgKFdLVClcbiAgICAqL1xuICBjYWxjdWxhdGVDYXJ0ZXNpYW4zQ2VudGVyT2ZHZW9tZXRyaWVzKHByb3BlcnR5TW9kZWxzOiBhbnkpIHtcbiAgICBjb25zdCBhbGxQb2ludHMgPSBwcm9wZXJ0eU1vZGVscy5tYXAoKHByb3BlcnR5TW9kZWw6IGFueSkgPT5cbiAgICAgIHByb3BlcnR5TW9kZWwuZ2V0UG9pbnRzKClcbiAgICApXG4gICAgcmV0dXJuIENlc2l1bS5Cb3VuZGluZ1NwaGVyZS5mcm9tUG9pbnRzKFxuICAgICAgQ2VzaXVtLkNhcnRlc2lhbjMuZnJvbURlZ3JlZXNBcnJheShfLmZsYXR0ZW4oYWxsUG9pbnRzKSlcbiAgICApLmNlbnRlclxuICB9LFxuICAvKlxuICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGdlb21ldHJpZXMgKFdLVClcbiAgICAqL1xuICBjYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJpZXNJblJhZGlhbnMocHJvcGVydHlNb2RlbHM6IGFueSkge1xuICAgIHJldHVybiBDZXNpdW0uQ2FydG9ncmFwaGljLmZyb21DYXJ0ZXNpYW4oXG4gICAgICB0aGlzLmNhbGN1bGF0ZUNhcnRlc2lhbjNDZW50ZXJPZkdlb21ldHJpZXMocHJvcGVydHlNb2RlbHMpXG4gICAgKVxuICB9LFxuICAvKlxuICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGdlb21ldHJpZXMgKFdLVClcbiAgICAqL1xuICBjYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJpZXNJbkRlZ3JlZXMocHJvcGVydHlNb2RlbHM6IGFueSkge1xuICAgIGNvbnN0IGNhcnRvZ3JhcGhpY0NlbnRlckluUmFkaWFucyA9XG4gICAgICB0aGlzLmNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cmllc0luUmFkaWFucyhwcm9wZXJ0eU1vZGVscylcbiAgICByZXR1cm4gW1xuICAgICAgQ2VzaXVtLk1hdGgudG9EZWdyZWVzKGNhcnRvZ3JhcGhpY0NlbnRlckluUmFkaWFucy5sb25naXR1ZGUpLFxuICAgICAgQ2VzaXVtLk1hdGgudG9EZWdyZWVzKGNhcnRvZ3JhcGhpY0NlbnRlckluUmFkaWFucy5sYXRpdHVkZSksXG4gICAgXVxuICB9LFxuICBmZWF0dXJlRnJvbVNoYXBlKHNoYXBlOiBhbnkpIHtcbiAgICBjb25zdCBhdHRycyA9IHNoYXBlLm1vZGVsLmF0dHJpYnV0ZXNcblxuICAgIHN3aXRjaCAoYXR0cnMudHlwZSkge1xuICAgICAgY2FzZSAnTElORSc6XG4gICAgICAgIGNvbnN0IGxpbmUgPSBUdXJmLmxpbmVTdHJpbmcoYXR0cnMubGluZSlcbiAgICAgICAgY29uc3QgbGluZU1ldGVycyA9IERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VJbk1ldGVycyhcbiAgICAgICAgICBhdHRycy5saW5lV2lkdGgsXG4gICAgICAgICAgYXR0cnMubGluZVVuaXRzXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIGxpbmVNZXRlcnNcbiAgICAgICAgICA/IFR1cmYuYnVmZmVyKGxpbmUsIGxpbmVNZXRlcnMsIHsgdW5pdHM6IE1FVEVSUyB9KVxuICAgICAgICAgIDogbGluZVxuICAgICAgY2FzZSAnUE9MWUdPTic6XG4gICAgICAgIGNvbnN0IHBvbHlnb24gPSBUdXJmLnBvbHlnb24oW2F0dHJzLnBvbHlnb25dKVxuICAgICAgICBjb25zdCBwb2x5Z29uTWV0ZXJzID0gRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUluTWV0ZXJzKFxuICAgICAgICAgIGF0dHJzLnBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICAgICAgICBhdHRycy5wb2x5Z29uQnVmZmVyVW5pdHNcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gcG9seWdvbk1ldGVyc1xuICAgICAgICAgID8gVHVyZi5idWZmZXIocG9seWdvbiwgcG9seWdvbk1ldGVycywgeyB1bml0czogTUVURVJTIH0pXG4gICAgICAgICAgOiBwb2x5Z29uXG4gICAgICBjYXNlICdNVUxUSVBPTFlHT04nOlxuICAgICAgICBjb25zdCBpc011bHRpUG9seWdvbiA9IFNoYXBlVXRpbHMuaXNBcnJheTNEKGF0dHJzLnBvbHlnb24pXG4gICAgICAgIGNvbnN0IG11bHRpUG9seWdvbiA9IGlzTXVsdGlQb2x5Z29uXG4gICAgICAgICAgPyBUdXJmLnBvbHlnb24oYXR0cnMucG9seWdvbilcbiAgICAgICAgICA6IFR1cmYucG9seWdvbihbYXR0cnMucG9seWdvbl0pXG4gICAgICAgIGNvbnN0IG11bHRpUG9seWdvbk1ldGVycyA9IERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VJbk1ldGVycyhcbiAgICAgICAgICBhdHRycy5wb2x5Z29uQnVmZmVyV2lkdGgsXG4gICAgICAgICAgYXR0cnMucG9seWdvbkJ1ZmZlclVuaXRzXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIG11bHRpUG9seWdvbk1ldGVyc1xuICAgICAgICAgID8gVHVyZi5idWZmZXIobXVsdGlQb2x5Z29uLCBtdWx0aVBvbHlnb25NZXRlcnMsIHsgdW5pdHM6IE1FVEVSUyB9KVxuICAgICAgICAgIDogbXVsdGlQb2x5Z29uXG4gICAgICBjYXNlICdCQk9YJzpcbiAgICAgICAgcmV0dXJuIFR1cmYuYmJveFBvbHlnb24oW1xuICAgICAgICAgIGF0dHJzLndlc3QsXG4gICAgICAgICAgYXR0cnMuc291dGgsXG4gICAgICAgICAgYXR0cnMuZWFzdCxcbiAgICAgICAgICBhdHRycy5ub3J0aCxcbiAgICAgICAgXSlcbiAgICAgIGNhc2UgJ1BPSU5UUkFESVVTJzpcbiAgICAgICAgY29uc3QgcG9pbnQgPSBUdXJmLnBvaW50KFthdHRycy5sb24sIGF0dHJzLmxhdF0pXG4gICAgICAgIGNvbnN0IHBvaW50UmFkaXVzTWV0ZXJzID0gRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUluTWV0ZXJzKFxuICAgICAgICAgIGF0dHJzLnJhZGl1cyxcbiAgICAgICAgICBhdHRycy5yYWRpdXNVbml0c1xuICAgICAgICApXG4gICAgICAgIHJldHVybiBwb2ludFJhZGl1c01ldGVyc1xuICAgICAgICAgID8gVHVyZi5idWZmZXIocG9pbnQsIHBvaW50UmFkaXVzTWV0ZXJzLCB7IHVuaXRzOiBNRVRFUlMgfSlcbiAgICAgICAgICA6IHBvaW50XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfSxcbiAgZmVhdHVyZUlzVmFsaWQoZmVhdHVyZTogRmVhdHVyZVdpdGhDb29yZHMpIHtcbiAgICByZXR1cm4gZmVhdHVyZT8uZ2VvbWV0cnk/LmNvb3JkaW5hdGVzPy5sZW5ndGhcbiAgfSxcbiAgYWRqdXN0R2VvQ29vcmRzKGdlbzogR2VvSlNPTi5GZWF0dXJlPEdlb0pTT04uR2VvbWV0cnk+KSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBnZW8uZ2VvbWV0cnlcbiAgICBjb25zdCBiYm94ID0gZ2VvLmJib3ggfHwgVHVyZi5iYm94KGdlb21ldHJ5KVxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5hYnMoYmJveFswXSAtIGJib3hbMl0pXG4gICAgY29uc3QgY3Jvc3Nlc0FudGltZXJpZGlhbiA9IHdpZHRoID4gMTgwXG4gICAgaWYgKFxuICAgICAgY3Jvc3Nlc0FudGltZXJpZGlhbiAmJlxuICAgICAgWydMaW5lU3RyaW5nJywgJ011bHRpTGluZVN0cmluZycsICdQb2x5Z29uJywgJ011bHRpUG9seWdvbiddLmluY2x1ZGVzKFxuICAgICAgICBnZW9tZXRyeS50eXBlXG4gICAgICApXG4gICAgKSB7XG4gICAgICBUdXJmLmNvb3JkRWFjaChnZW8sIChjb29yZCkgPT4ge1xuICAgICAgICBpZiAoY29vcmRbMF0gPCAwKSB7XG4gICAgICAgICAgY29vcmRbMF0gKz0gMzYwXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9LFxufVxuIl19