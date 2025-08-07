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
import { StartupDataStore } from './model/Startup/startup';
import { transform as projTransform } from 'ol/proj';
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
        return projTransform(point, StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
    },
    lonLatToMapCoordinate: function (point) {
        return projTransform(point, 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    },
    wrapCoordinatesFromGeometry: function (geometry) {
        var coordinates = OpenLayersGeometryUtils.getCoordinatesFromGeometry(geometry).map(OpenLayersGeometryUtils.mapCoordinateToLonLat);
        coordinates = Common.wrapMapCoordinatesArray(coordinates).map(OpenLayersGeometryUtils.lonLatToMapCoordinate);
        OpenLayersGeometryUtils.setCoordinatesForGeometry(geometry, coordinates);
        return geometry;
    },
};
export default OpenLayersGeometryUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFDN0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDMUQsT0FBTyxFQUFFLFNBQVMsSUFBSSxhQUFhLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFXcEQsTUFBTSxDQUFDLElBQU0sdUJBQXVCLEdBQUc7SUFDckMsMEJBQTBCLEVBQUUsVUFBQyxRQUFzQjtRQUNqRCxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDL0IsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUNiLEtBQUssWUFBWTtnQkFDZixPQUFPLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUNsQyxLQUFLLFNBQVM7Z0JBQ1osT0FBTyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDckMsS0FBSyxRQUFRO2dCQUNYLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtZQUMvQjtnQkFDRSxPQUFPLEVBQUUsQ0FBQTtRQUNiLENBQUM7SUFDSCxDQUFDO0lBQ0QseUJBQXlCLEVBQUUsVUFDekIsUUFBc0IsRUFDdEIsV0FBMkI7UUFFM0IsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQy9CLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDYixLQUFLLFlBQVk7Z0JBQ2YsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtnQkFDcEMsTUFBSztZQUNQLEtBQUssU0FBUztnQkFDWixRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtnQkFDdEMsTUFBSztZQUNQLEtBQUssUUFBUTtnQkFDWCxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNsQyxNQUFLO1lBQ1A7Z0JBQ0UsTUFBSztRQUNULENBQUM7SUFDSCxDQUFDO0lBQ0QscUJBQXFCLEVBQUUsVUFBQyxLQUFnQjtRQUN0QyxPQUFBLGFBQWEsQ0FDWCxLQUFZLEVBQ1osZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUM5QyxXQUFXLENBQ1o7SUFKRCxDQUlDO0lBQ0gscUJBQXFCLEVBQUUsVUFBQyxLQUFnQjtRQUN0QyxPQUFBLGFBQWEsQ0FDWCxLQUFZLEVBQ1osV0FBVyxFQUNYLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FDL0M7SUFKRCxDQUlDO0lBQ0gsMkJBQTJCLEVBQUUsVUFBQyxRQUFzQjtRQUNsRCxJQUFJLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQywwQkFBMEIsQ0FDbEUsUUFBUSxDQUNULENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDcEQsV0FBVyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQzNELHVCQUF1QixDQUFDLHFCQUFxQixDQUM5QyxDQUFBO1FBQ0QsdUJBQXVCLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQ3hFLE9BQU8sUUFBUSxDQUFBO0lBQ2pCLENBQUM7Q0FDRixDQUFBO0FBQ0QsZUFBZSx1QkFBdUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IENvbW1vbiBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHRyYW5zZm9ybSBhcyBwcm9qVHJhbnNmb3JtIH0gZnJvbSAnb2wvcHJvaidcblxudHlwZSBDb29yZGluYXRlVHlwZSA9IEFycmF5PGFueT5cbnR5cGUgUG9pbnRUeXBlID0gQXJyYXk8YW55PlxudHlwZSBHZW9tZXRyeVR5cGUgPSB7XG4gIGdldFR5cGU6ICgpID0+ICdMaW5lU3RyaW5nJyB8ICdQb2x5Z29uJyB8ICdDaXJjbGUnXG4gIGdldENvb3JkaW5hdGVzOiAoKSA9PiBDb29yZGluYXRlVHlwZVxuICBnZXRDZW50ZXI6ICgpID0+IGFueVxuICBzZXRDb29yZGluYXRlczogKGNvb3JkczogQ29vcmRpbmF0ZVR5cGUpID0+IHZvaWRcbiAgc2V0Q2VudGVyOiAoY29yZHM6IENvb3JkaW5hdGVUeXBlKSA9PiB2b2lkXG59XG5leHBvcnQgY29uc3QgT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMgPSB7XG4gIGdldENvb3JkaW5hdGVzRnJvbUdlb21ldHJ5OiAoZ2VvbWV0cnk6IEdlb21ldHJ5VHlwZSkgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBnZW9tZXRyeS5nZXRUeXBlKClcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuZ2V0Q29vcmRpbmF0ZXMoKVxuICAgICAgY2FzZSAnUG9seWdvbic6XG4gICAgICAgIHJldHVybiBnZW9tZXRyeS5nZXRDb29yZGluYXRlcygpWzBdXG4gICAgICBjYXNlICdDaXJjbGUnOlxuICAgICAgICByZXR1cm4gW2dlb21ldHJ5LmdldENlbnRlcigpXVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9LFxuICBzZXRDb29yZGluYXRlc0Zvckdlb21ldHJ5OiAoXG4gICAgZ2VvbWV0cnk6IEdlb21ldHJ5VHlwZSxcbiAgICBjb29yZGluYXRlczogQ29vcmRpbmF0ZVR5cGVcbiAgKSA9PiB7XG4gICAgY29uc3QgdHlwZSA9IGdlb21ldHJ5LmdldFR5cGUoKVxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKGNvb3JkaW5hdGVzKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnUG9seWdvbic6XG4gICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKFtjb29yZGluYXRlc10pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdDaXJjbGUnOlxuICAgICAgICBnZW9tZXRyeS5zZXRDZW50ZXIoY29vcmRpbmF0ZXNbMF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVha1xuICAgIH1cbiAgfSxcbiAgbWFwQ29vcmRpbmF0ZVRvTG9uTGF0OiAocG9pbnQ6IFBvaW50VHlwZSkgPT5cbiAgICBwcm9qVHJhbnNmb3JtKFxuICAgICAgcG9pbnQgYXMgYW55LFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSxcbiAgICAgICdFUFNHOjQzMjYnXG4gICAgKSxcbiAgbG9uTGF0VG9NYXBDb29yZGluYXRlOiAocG9pbnQ6IFBvaW50VHlwZSkgPT5cbiAgICBwcm9qVHJhbnNmb3JtKFxuICAgICAgcG9pbnQgYXMgYW55LFxuICAgICAgJ0VQU0c6NDMyNicsXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gICAgKSxcbiAgd3JhcENvb3JkaW5hdGVzRnJvbUdlb21ldHJ5OiAoZ2VvbWV0cnk6IEdlb21ldHJ5VHlwZSkgPT4ge1xuICAgIGxldCBjb29yZGluYXRlcyA9IE9wZW5MYXllcnNHZW9tZXRyeVV0aWxzLmdldENvb3JkaW5hdGVzRnJvbUdlb21ldHJ5KFxuICAgICAgZ2VvbWV0cnlcbiAgICApLm1hcChPcGVuTGF5ZXJzR2VvbWV0cnlVdGlscy5tYXBDb29yZGluYXRlVG9Mb25MYXQpXG4gICAgY29vcmRpbmF0ZXMgPSBDb21tb24ud3JhcE1hcENvb3JkaW5hdGVzQXJyYXkoY29vcmRpbmF0ZXMpLm1hcChcbiAgICAgIE9wZW5MYXllcnNHZW9tZXRyeVV0aWxzLmxvbkxhdFRvTWFwQ29vcmRpbmF0ZVxuICAgIClcbiAgICBPcGVuTGF5ZXJzR2VvbWV0cnlVdGlscy5zZXRDb29yZGluYXRlc0Zvckdlb21ldHJ5KGdlb21ldHJ5LCBjb29yZGluYXRlcylcbiAgICByZXR1cm4gZ2VvbWV0cnlcbiAgfSxcbn1cbmV4cG9ydCBkZWZhdWx0IE9wZW5MYXllcnNHZW9tZXRyeVV0aWxzXG4iXX0=