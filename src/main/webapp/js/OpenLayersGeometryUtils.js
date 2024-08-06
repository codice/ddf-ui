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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFDN0IsdUNBQXVDO0FBQ3ZDLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUMzQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQVUxRCxNQUFNLENBQUMsSUFBTSx1QkFBdUIsR0FBRztJQUNyQywwQkFBMEIsRUFBRSxVQUFDLFFBQXNCO1FBQ2pELElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUMvQixRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssWUFBWTtnQkFDZixPQUFPLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUNsQyxLQUFLLFNBQVM7Z0JBQ1osT0FBTyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDckMsS0FBSyxRQUFRO2dCQUNYLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtZQUMvQjtnQkFDRSxPQUFPLEVBQUUsQ0FBQTtTQUNaO0lBQ0gsQ0FBQztJQUNELHlCQUF5QixFQUFFLFVBQ3pCLFFBQXNCLEVBQ3RCLFdBQTJCO1FBRTNCLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUMvQixRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssWUFBWTtnQkFDZixRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUNwQyxNQUFLO1lBQ1AsS0FBSyxTQUFTO2dCQUNaLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO2dCQUN0QyxNQUFLO1lBQ1AsS0FBSyxRQUFRO2dCQUNYLFFBQVEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ2xDLE1BQUs7WUFDUDtnQkFDRSxNQUFLO1NBQ1I7SUFDSCxDQUFDO0lBQ0QscUJBQXFCLEVBQUUsVUFBQyxLQUFnQjtRQUN0QyxPQUFBLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUNmLEtBQVksRUFDWixnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLEVBQzlDLFdBQVcsQ0FDWjtJQUpELENBSUM7SUFDSCxxQkFBcUIsRUFBRSxVQUFDLEtBQWdCO1FBQ3RDLE9BQUEsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ2YsS0FBWSxFQUNaLFdBQVcsRUFDWCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQy9DO0lBSkQsQ0FJQztJQUNILDJCQUEyQixFQUFFLFVBQUMsUUFBc0I7UUFDbEQsSUFBSSxXQUFXLEdBQUcsdUJBQXVCLENBQUMsMEJBQTBCLENBQ2xFLFFBQVEsQ0FDVCxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQ3BELFdBQVcsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUMzRCx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FDOUMsQ0FBQTtRQUNELHVCQUF1QixDQUFDLHlCQUF5QixDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUN4RSxPQUFPLFFBQVEsQ0FBQTtJQUNqQixDQUFDO0NBQ0YsQ0FBQTtBQUNELGVBQWUsdUJBQXVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBDb21tb24gZnJvbSAnLi9Db21tb24nXG4vKmpzaGludCBlc3ZlcnNpb246IDYsIGJpdHdpc2U6IGZhbHNlKi9cbmltcG9ydCBvbCBmcm9tICdvcGVubGF5ZXJzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xudHlwZSBDb29yZGluYXRlVHlwZSA9IEFycmF5PGFueT5cbnR5cGUgUG9pbnRUeXBlID0gQXJyYXk8YW55PlxudHlwZSBHZW9tZXRyeVR5cGUgPSB7XG4gIGdldFR5cGU6ICgpID0+ICdMaW5lU3RyaW5nJyB8ICdQb2x5Z29uJyB8ICdDaXJjbGUnXG4gIGdldENvb3JkaW5hdGVzOiAoKSA9PiBDb29yZGluYXRlVHlwZVxuICBnZXRDZW50ZXI6ICgpID0+IGFueVxuICBzZXRDb29yZGluYXRlczogKGNvb3JkczogQ29vcmRpbmF0ZVR5cGUpID0+IHZvaWRcbiAgc2V0Q2VudGVyOiAoY29yZHM6IENvb3JkaW5hdGVUeXBlKSA9PiB2b2lkXG59XG5leHBvcnQgY29uc3QgT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMgPSB7XG4gIGdldENvb3JkaW5hdGVzRnJvbUdlb21ldHJ5OiAoZ2VvbWV0cnk6IEdlb21ldHJ5VHlwZSkgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBnZW9tZXRyeS5nZXRUeXBlKClcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuZ2V0Q29vcmRpbmF0ZXMoKVxuICAgICAgY2FzZSAnUG9seWdvbic6XG4gICAgICAgIHJldHVybiBnZW9tZXRyeS5nZXRDb29yZGluYXRlcygpWzBdXG4gICAgICBjYXNlICdDaXJjbGUnOlxuICAgICAgICByZXR1cm4gW2dlb21ldHJ5LmdldENlbnRlcigpXVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9LFxuICBzZXRDb29yZGluYXRlc0Zvckdlb21ldHJ5OiAoXG4gICAgZ2VvbWV0cnk6IEdlb21ldHJ5VHlwZSxcbiAgICBjb29yZGluYXRlczogQ29vcmRpbmF0ZVR5cGVcbiAgKSA9PiB7XG4gICAgY29uc3QgdHlwZSA9IGdlb21ldHJ5LmdldFR5cGUoKVxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKGNvb3JkaW5hdGVzKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnUG9seWdvbic6XG4gICAgICAgIGdlb21ldHJ5LnNldENvb3JkaW5hdGVzKFtjb29yZGluYXRlc10pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdDaXJjbGUnOlxuICAgICAgICBnZW9tZXRyeS5zZXRDZW50ZXIoY29vcmRpbmF0ZXNbMF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVha1xuICAgIH1cbiAgfSxcbiAgbWFwQ29vcmRpbmF0ZVRvTG9uTGF0OiAocG9pbnQ6IFBvaW50VHlwZSkgPT5cbiAgICBvbC5wcm9qLnRyYW5zZm9ybShcbiAgICAgIHBvaW50IGFzIGFueSxcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKCksXG4gICAgICAnRVBTRzo0MzI2J1xuICAgICksXG4gIGxvbkxhdFRvTWFwQ29vcmRpbmF0ZTogKHBvaW50OiBQb2ludFR5cGUpID0+XG4gICAgb2wucHJvai50cmFuc2Zvcm0oXG4gICAgICBwb2ludCBhcyBhbnksXG4gICAgICAnRVBTRzo0MzI2JyxcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgICApLFxuICB3cmFwQ29vcmRpbmF0ZXNGcm9tR2VvbWV0cnk6IChnZW9tZXRyeTogR2VvbWV0cnlUeXBlKSA9PiB7XG4gICAgbGV0IGNvb3JkaW5hdGVzID0gT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMuZ2V0Q29vcmRpbmF0ZXNGcm9tR2VvbWV0cnkoXG4gICAgICBnZW9tZXRyeVxuICAgICkubWFwKE9wZW5MYXllcnNHZW9tZXRyeVV0aWxzLm1hcENvb3JkaW5hdGVUb0xvbkxhdClcbiAgICBjb29yZGluYXRlcyA9IENvbW1vbi53cmFwTWFwQ29vcmRpbmF0ZXNBcnJheShjb29yZGluYXRlcykubWFwKFxuICAgICAgT3BlbkxheWVyc0dlb21ldHJ5VXRpbHMubG9uTGF0VG9NYXBDb29yZGluYXRlXG4gICAgKVxuICAgIE9wZW5MYXllcnNHZW9tZXRyeVV0aWxzLnNldENvb3JkaW5hdGVzRm9yR2VvbWV0cnkoZ2VvbWV0cnksIGNvb3JkaW5hdGVzKVxuICAgIHJldHVybiBnZW9tZXRyeVxuICB9LFxufVxuZXhwb3J0IGRlZmF1bHQgT3BlbkxheWVyc0dlb21ldHJ5VXRpbHNcbiJdfQ==