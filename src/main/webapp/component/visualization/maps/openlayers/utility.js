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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL29wZW5sYXllcnMvdXRpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUNuQyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQTtBQUdsQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUV2RSxTQUFTLHNCQUFzQixDQUFDLEtBQVU7SUFDeEMsSUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbkMsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDOUIsTUFBYSxFQUNiLFdBQVcsRUFDWCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQy9DLENBQUE7QUFDSCxDQUFDO0FBQ0QsU0FBUyx3QkFBd0IsQ0FBQyxLQUFVO0lBQzFDLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQzlCLEtBQUssRUFDTCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLEVBQzlDLFdBQVcsQ0FDWixDQUFBO0FBQ0gsQ0FBQztBQUNEOztFQUVFO0FBQ0YsZUFBZTtJQUNiOztVQUVNO0lBQ04sbUNBQW1DLFlBQUMsYUFBa0I7UUFDcEQsSUFBTSxVQUFVLEdBQUcsYUFBYTthQUM3QixTQUFTLEVBQUU7YUFDWCxHQUFHLENBQUMsVUFBQyxVQUFlLElBQUssT0FBQSxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsRUFBbEMsQ0FBa0MsQ0FBQyxDQUFBO1FBQy9ELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzNELE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUNEOztVQUVNO0lBQ04sOENBQThDLFlBQUMsYUFBa0I7UUFDL0QsSUFBTSxnQkFBZ0IsR0FDcEIsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3pELE9BQU8sd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBQ0Q7O1VBRU07SUFDTixxQ0FBcUMsWUFBQyxjQUFtQjtRQUN2RCxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUN6QixjQUFjLENBQUMsR0FBRyxDQUFDLFVBQUMsYUFBa0IsSUFBSyxPQUFBLGFBQWEsQ0FBQyxTQUFTLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQyxDQUN0RSxDQUFDLEdBQUcsQ0FBQyxVQUFDLFVBQVUsSUFBSyxPQUFBLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLENBQUE7UUFDekQsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDMUQsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM1QyxDQUFDO0lBQ0Q7O1VBRU07SUFDTixnREFBZ0QsWUFBQyxjQUFtQjtRQUNsRSxJQUFNLGdCQUFnQixHQUNwQixJQUFJLENBQUMscUNBQXFDLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDNUQsT0FBTyx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFDRCxzQkFBc0IsWUFBQyxXQUF1QjtRQUM1QyxJQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLO1lBQ25CLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQTthQUNoQjtRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBQ0QsZUFBZSxZQUFDLEdBQWlCO1FBQy9CLElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUE7UUFDN0IsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QyxJQUFNLG1CQUFtQixHQUFHLEtBQUssR0FBRyxHQUFHLENBQUE7UUFDdkMsSUFBSSxtQkFBbUIsRUFBRTtZQUN2QixJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLE1BQU0sRUFBRTtnQkFDbkMsSUFBTSxnQkFBZ0IsR0FBSSxRQUF1QixDQUFDLFdBQVcsQ0FBQTtnQkFDN0QsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTthQUNyRTtpQkFBTSxJQUNMLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLGNBQWM7Z0JBQ3ZDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFDbEM7Z0JBQ0EsSUFBTSxNQUFNLEdBQUksUUFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ25ELFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQzlEO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IE9wZW5sYXllcnMgZnJvbSAnb3BlbmxheWVycydcbmltcG9ydCAqIGFzIFR1cmYgZnJvbSAnQHR1cmYvdHVyZidcbmltcG9ydCB7IFBvc2l0aW9uLCBMaW5lU3RyaW5nLCBQb2x5Z29uIH0gZnJvbSAnQHR1cmYvdHVyZidcbmltcG9ydCB7IEdlb21ldHJ5SlNPTiB9IGZyb20gJ2dlb3NwYXRpYWxkcmF3L3RhcmdldC93ZWJhcHAvZ2VvbWV0cnknXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuXG5mdW5jdGlvbiBjb252ZXJ0UG9pbnRDb29yZGluYXRlKHBvaW50OiBhbnkpIHtcbiAgY29uc3QgY29vcmRzID0gW3BvaW50WzBdLCBwb2ludFsxXV1cbiAgcmV0dXJuIE9wZW5sYXllcnMucHJvai50cmFuc2Zvcm0oXG4gICAgY29vcmRzIGFzIGFueSxcbiAgICAnRVBTRzo0MzI2JyxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gIClcbn1cbmZ1bmN0aW9uIHVuY29udmVydFBvaW50Q29vcmRpbmF0ZShwb2ludDogYW55KSB7XG4gIHJldHVybiBPcGVubGF5ZXJzLnByb2oudHJhbnNmb3JtKFxuICAgIHBvaW50LFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKCksXG4gICAgJ0VQU0c6NDMyNidcbiAgKVxufVxuLypcbiAgQSB2YXJpZXR5IG9mIGhlbHBmdWwgZnVuY3Rpb25zIGZvciBkZWFsaW5nIHdpdGggT3BlbmxheWVyc1xuKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLypcbiAgICAgICAgQ2FsY3VsYXRlcyB0aGUgY2VudGVyIG9mIGdpdmVuIGEgZ2VvbWV0cnkgKFdLVClcbiAgICAgICovXG4gIGNhbGN1bGF0ZU9wZW5sYXllcnNDZW50ZXJPZkdlb21ldHJ5KHByb3BlcnR5TW9kZWw6IGFueSkge1xuICAgIGNvbnN0IGxpbmVPYmplY3QgPSBwcm9wZXJ0eU1vZGVsXG4gICAgICAuZ2V0UG9pbnRzKClcbiAgICAgIC5tYXAoKGNvb3JkaW5hdGU6IGFueSkgPT4gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKSlcbiAgICBjb25zdCBleHRlbnQgPSBPcGVubGF5ZXJzLmV4dGVudC5ib3VuZGluZ0V4dGVudChsaW5lT2JqZWN0KVxuICAgIHJldHVybiBPcGVubGF5ZXJzLmV4dGVudC5nZXRDZW50ZXIoZXh0ZW50KVxuICB9LFxuICAvKlxuICAgICAgICBDYWxjdWxhdGVzIHRoZSBjZW50ZXIgb2YgZ2l2ZW4gYSBnZW9tZXRyeSAoV0tUKVxuICAgICAgKi9cbiAgY2FsY3VsYXRlQ2FydG9ncmFwaGljQ2VudGVyT2ZHZW9tZXRyeUluRGVncmVlcyhwcm9wZXJ0eU1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBvcGVubGF5ZXJzQ2VudGVyID1cbiAgICAgIHRoaXMuY2FsY3VsYXRlT3BlbmxheWVyc0NlbnRlck9mR2VvbWV0cnkocHJvcGVydHlNb2RlbClcbiAgICByZXR1cm4gdW5jb252ZXJ0UG9pbnRDb29yZGluYXRlKG9wZW5sYXllcnNDZW50ZXIpXG4gIH0sXG4gIC8qXG4gICAgICAgIENhbGN1bGF0ZXMgdGhlIGNlbnRlciBvZiBnaXZlbiBnZW9tZXRyaWVzIChXS1QpXG4gICAgICAqL1xuICBjYWxjdWxhdGVPcGVubGF5ZXJzQ2VudGVyT2ZHZW9tZXRyaWVzKHByb3BlcnR5TW9kZWxzOiBhbnkpIHtcbiAgICBjb25zdCBhbGxQb2ludHMgPSBfLmZsYXR0ZW4oXG4gICAgICBwcm9wZXJ0eU1vZGVscy5tYXAoKHByb3BlcnR5TW9kZWw6IGFueSkgPT4gcHJvcGVydHlNb2RlbC5nZXRQb2ludHMoKSlcbiAgICApLm1hcCgoY29vcmRpbmF0ZSkgPT4gY29udmVydFBvaW50Q29vcmRpbmF0ZShjb29yZGluYXRlKSlcbiAgICBjb25zdCBleHRlbnQgPSBPcGVubGF5ZXJzLmV4dGVudC5ib3VuZGluZ0V4dGVudChhbGxQb2ludHMpXG4gICAgcmV0dXJuIE9wZW5sYXllcnMuZXh0ZW50LmdldENlbnRlcihleHRlbnQpXG4gIH0sXG4gIC8qXG4gICAgICAgIENhbGN1bGF0ZXMgdGhlIGNlbnRlciBvZiBnaXZlbiBnZW9tZXRyaWVzIChXS1QpXG4gICAgICAqL1xuICBjYWxjdWxhdGVDYXJ0b2dyYXBoaWNDZW50ZXJPZkdlb21ldHJpZXNJbkRlZ3JlZXMocHJvcGVydHlNb2RlbHM6IGFueSkge1xuICAgIGNvbnN0IG9wZW5sYXllcnNDZW50ZXIgPVxuICAgICAgdGhpcy5jYWxjdWxhdGVPcGVubGF5ZXJzQ2VudGVyT2ZHZW9tZXRyaWVzKHByb3BlcnR5TW9kZWxzKVxuICAgIHJldHVybiB1bmNvbnZlcnRQb2ludENvb3JkaW5hdGUob3BlbmxheWVyc0NlbnRlcilcbiAgfSxcbiAgY29udmVydENvb3Jkc1RvRGlzcGxheShjb29yZGluYXRlczogUG9zaXRpb25bXSkge1xuICAgIGNvbnN0IGNvb3JkcyA9IF8uY2xvbmVEZWVwKGNvb3JkaW5hdGVzKVxuICAgIGNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgaWYgKGNvb3JkWzBdIDwgMCkge1xuICAgICAgICBjb29yZFswXSArPSAzNjBcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBjb29yZHNcbiAgfSxcbiAgYWRqdXN0R2VvQ29vcmRzKGdlbzogR2VvbWV0cnlKU09OKSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBnZW8uZ2VvbWV0cnlcbiAgICBjb25zdCBiYm94ID0gZ2VvLmJib3ggfHwgVHVyZi5iYm94KGdlby5nZW9tZXRyeSlcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKGJib3hbMF0gLSBiYm94WzJdKVxuICAgIGNvbnN0IGNyb3NzZXNBbnRpTWVyaWRpYW4gPSB3aWR0aCA+IDE4MFxuICAgIGlmIChjcm9zc2VzQW50aU1lcmlkaWFuKSB7XG4gICAgICBpZiAoZ2VvLnByb3BlcnRpZXMuc2hhcGUgPT09ICdMaW5lJykge1xuICAgICAgICBjb25zdCBsaW5lU3RyaW5nQ29vcmRzID0gKGdlb21ldHJ5IGFzIExpbmVTdHJpbmcpLmNvb3JkaW5hdGVzXG4gICAgICAgIGdlb21ldHJ5LmNvb3JkaW5hdGVzID0gdGhpcy5jb252ZXJ0Q29vcmRzVG9EaXNwbGF5KGxpbmVTdHJpbmdDb29yZHMpXG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBnZW8ucHJvcGVydGllcy5zaGFwZSA9PT0gJ0JvdW5kaW5nIEJveCcgfHxcbiAgICAgICAgZ2VvLnByb3BlcnRpZXMuc2hhcGUgPT09ICdQb2x5Z29uJ1xuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGNvb3JkcyA9IChnZW9tZXRyeSBhcyBQb2x5Z29uKS5jb29yZGluYXRlc1swXVxuICAgICAgICBnZW9tZXRyeS5jb29yZGluYXRlc1swXSA9IHRoaXMuY29udmVydENvb3Jkc1RvRGlzcGxheShjb29yZHMpXG4gICAgICB9XG4gICAgfVxuICB9LFxufVxuIl19