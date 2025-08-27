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
import * as Turf from '@turf/turf';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import { transform as projTransform } from 'ol/proj';
import { boundingExtent, getCenter } from 'ol/extent';
function convertPointCoordinate(point) {
    var coords = [point[0], point[1]];
    return projTransform(coords, 'EPSG:4326', StartupDataStore.Configuration.getProjection());
}
function unconvertPointCoordinate(point) {
    return projTransform(point, StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
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
        var extent = boundingExtent(lineObject);
        return getCenter(extent);
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
        var extent = boundingExtent(allPoints);
        return getCenter(extent);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL29wZW5sYXllcnMvdXRpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBRWxDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLElBQUksYUFBYSxFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQ3JELFNBQVMsc0JBQXNCLENBQUMsS0FBVTtJQUN4QyxJQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxPQUFPLGFBQWEsQ0FDbEIsTUFBYSxFQUNiLFdBQVcsRUFDWCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQy9DLENBQUE7QUFDSCxDQUFDO0FBQ0QsU0FBUyx3QkFBd0IsQ0FBQyxLQUFVO0lBQzFDLE9BQU8sYUFBYSxDQUNsQixLQUFLLEVBQ0wsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUM5QyxXQUFXLENBQ1osQ0FBQTtBQUNILENBQUM7QUFDRDs7RUFFRTtBQUNGLGVBQWU7SUFDYjs7VUFFTTtJQUNOLG1DQUFtQyxZQUFDLGFBQWtCO1FBQ3BELElBQU0sVUFBVSxHQUFHLGFBQWE7YUFDN0IsU0FBUyxFQUFFO2FBQ1gsR0FBRyxDQUFDLFVBQUMsVUFBZSxJQUFLLE9BQUEsc0JBQXNCLENBQUMsVUFBVSxDQUFDLEVBQWxDLENB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eXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IHsgR2VvbWV0cnlKU09OIH0gZnJvbSAnZ2Vvc3BhdGlhbGRyYXcvdGFyZ2V0L3dlYmFwcC9nZW9tZXRyeSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyB0cmFuc2Zvcm0gYXMgcHJvalRyYW5zZm9ybSB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgeyBib3VuZGluZ0V4dGVudCwgZ2V0Q2VudGVyIH0gZnJvbSAnb2wvZXh0ZW50J1xuZnVuY3Rpb24gY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludDogYW55KSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtwb2ludFswXSwgcG9pbnRbMV1dXG4gIHJldHVybiBwcm9qVHJhbnNmb3JtKFxuICAgIGNvb3JkcyBhcyBhbnksXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG59XG5mdW5jdGlvbiB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUocG9pbnQ6IGFueSkge1xuICByZXR1cm4gcHJvalRyYW5zZm9ybShcbiAgICBwb2ludCxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpLFxuICAgICdFUFNHOjQzMjYnXG4gIClcbn1cbi8qXG4gIEEgdmFyaWV0eSBvZiBoZWxwZnVsIGZ1bmN0aW9ucyBmb3IgZGVhbGluZyB3aXRoIE9wZW5sYXllcnNcbiovXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8qXG4gICAgICAgIENhbGN1bGF0ZXMgdGhlIGNlbnRlciBvZiBnaXZlbiBhIGdlb21ldHJ5IChXS1QpXG4gICAgICAqL1xuICBjYWxjdWxhdGVPcGVubGF5ZXJzQ2VudGVyT2ZHZW9tZXRyeShwcm9wZXJ0eU1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBsaW5lT2JqZWN0ID0gcHJvcGVydHlNb2RlbFxuICAgICAgLmdldFBvaW50cygpXG4gICAgICAubWFwKChjb29yZGluYXRlOiBhbnkpID0+IGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSkpXG4gICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQobGluZU9iamVjdClcbiAgICByZXR1cm4gZ2V0Q2VudGVyKGV4dGVudClcbiAgfSxcbiAgLypcbiAgICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGEgZ2VvbWV0cnkgKFdLVClcbiAgICAgICovXG4gIGNhbGN1bGF0ZUNhcnRvZ3JhcGhpY0NlbnRlck9mR2VvbWV0cnlJbkRlZ3JlZXMocHJvcGVydHlNb2RlbDogYW55KSB7XG4gICAgY29uc3Qgb3BlbmxheWVyc0NlbnRlciA9XG4gICAgICB0aGlzLmNhbGN1bGF0ZU9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KHByb3BlcnR5TW9kZWwpXG4gICAgcmV0dXJuIHVuY29udmVydFBvaW50Q29vcmRpbmF0ZShvcGVubGF5ZXJzQ2VudGVyKVxuICB9LFxuICAvKlxuICAgICAgICBDYWxjdWxhdGVzIHRoZSBjZW50ZXIgb2YgZ2l2ZW4gZ2VvbWV0cmllcyAoV0tUKVxuICAgICAgKi9cbiAgY2FsY3VsYXRlT3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cmllcyhwcm9wZXJ0eU1vZGVsczogYW55KSB7XG4gICAgY29uc3QgYWxsUG9pbnRzID0gXy5mbGF0dGVuKFxuICAgICAgcHJvcGVydHlNb2RlbHMubWFwKChwcm9wZXJ0eU1vZGVsOiBhbnkpID0+IHByb3BlcnR5TW9kZWwuZ2V0UG9pbnRzKCkpXG4gICAgKS5tYXAoKGNvb3JkaW5hdGUpID0+IGNvbnZlcnRQb2ludENvb3JkaW5hdGUoY29vcmRpbmF0ZSkpXG4gICAgY29uc3QgZXh0ZW50ID0gYm91bmRpbmdFeHRlbnQoYWxsUG9pbnRzKVxuICAgIHJldHVybiBnZXRDZW50ZXIoZXh0ZW50KVxuICB9LFxuICAvKlxuICAgICAgICBDYWxjdWxhdGVzIHRoZSBjZW50ZXIgb2YgZ2l2ZW4gZ2VvbWV0cmllcyAoV0tUKVxuICAgICAgKi9cbiAgY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyaWVzSW5EZWdyZWVzKHByb3BlcnR5TW9kZWxzOiBhbnkpIHtcbiAgICBjb25zdCBvcGVubGF5ZXJzQ2VudGVyID1cbiAgICAgIHRoaXMuY2FsY3VsYXRlT3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cmllcyhwcm9wZXJ0eU1vZGVscylcbiAgICByZXR1cm4gdW5jb252ZXJ0UG9pbnRDb29yZGluYXRlKG9wZW5sYXllcnNDZW50ZXIpXG4gIH0sXG4gIGNvbnZlcnRDb29yZHNUb0Rpc3BsYXkoY29vcmRpbmF0ZXM6IEdlb0pTT04uUG9zaXRpb25bXSkge1xuICAgIGNvbnN0IGNvb3JkcyA9IF8uY2xvbmVEZWVwKGNvb3JkaW5hdGVzKVxuICAgIGNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgaWYgKGNvb3JkWzBdIDwgMCkge1xuICAgICAgICBjb29yZFswXSArPSAzNjBcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBjb29yZHNcbiAgfSxcbiAgYWRqdXN0R2VvQ29vcmRzKGdlbzogR2VvbWV0cnlKU09OKSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBnZW8uZ2VvbWV0cnlcbiAgICBjb25zdCBiYm94ID0gZ2VvLmJib3ggfHwgVHVyZi5iYm94KGdlby5nZW9tZXRyeSlcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKGJib3hbMF0gLSBiYm94WzJdKVxuICAgIGNvbnN0IGNyb3NzZXNBbnRpTWVyaWRpYW4gPSB3aWR0aCA+IDE4MFxuICAgIGlmIChjcm9zc2VzQW50aU1lcmlkaWFuKSB7XG4gICAgICBpZiAoZ2VvLnByb3BlcnRpZXMuc2hhcGUgPT09ICdMaW5lJykge1xuICAgICAgICBjb25zdCBsaW5lU3RyaW5nQ29vcmRzID0gKGdlb21ldHJ5IGFzIEdlb0pTT04uTGluZVN0cmluZykuY29vcmRpbmF0ZXNcbiAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSB0aGlzLmNvbnZlcnRDb29yZHNUb0Rpc3BsYXkobGluZVN0cmluZ0Nvb3JkcylcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGdlby5wcm9wZXJ0aWVzLnNoYXBlID09PSAnQm91bmRpbmcgQm94JyB8fFxuICAgICAgICBnZW8ucHJvcGVydGllcy5zaGFwZSA9PT0gJ1BvbHlnb24nXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgY29vcmRzID0gKGdlb21ldHJ5IGFzIEdlb0pTT04uUG9seWdvbikuY29vcmRpbmF0ZXNbMF1cbiAgICAgICAgZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0gPSB0aGlzLmNvbnZlcnRDb29yZHNUb0Rpc3BsYXkoY29vcmRzKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbn1cbiJdfQ==