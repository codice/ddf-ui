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
import { StartupDataStore } from '../../../js/model/Startup/startup';
import wrapNum from '../../../react-component/utils/wrap-num/wrap-num';
import { TypedUserInstance } from '../../singletons/TypedUser';
var homeBoundingBox = getBoundingBox(getHomeCoordinates());
var defaultHomeBoundingBox = {
    west: -128,
    south: 24,
    east: -63,
    north: 52,
};
export var getHome = function () {
    return [
        TypedUserInstance.getMapHome(),
        homeBoundingBox,
        defaultHomeBoundingBox,
    ].find(function (element) { return element !== undefined; });
};
export var zoomToHome = function (_a) {
    var map = _a.map;
    var home = getHome();
    map.zoomToBoundingBox(home);
};
function findExtreme(_a) {
    var objArray = _a.objArray, property = _a.property, comparator = _a.comparator;
    if (objArray.length === 0) {
        return undefined;
    }
    return objArray.reduce(function (extreme, coordinateObj) {
        return (extreme = comparator(extreme, coordinateObj[property]));
    }, objArray[0][property]);
}
function getBoundingBox(coordinates) {
    var north = findExtreme({
        objArray: coordinates,
        property: 'lat',
        comparator: Math.max,
    });
    var south = findExtreme({
        objArray: coordinates,
        property: 'lat',
        comparator: Math.min,
    });
    var east = findExtreme({
        objArray: coordinates,
        property: 'lon',
        comparator: Math.max,
    });
    var west = findExtreme({
        objArray: coordinates,
        property: 'lon',
        comparator: Math.min,
    });
    if (north === undefined ||
        south === undefined ||
        east === undefined ||
        west === undefined) {
        return undefined;
    }
    return {
        north: north,
        east: east,
        south: south,
        west: west,
    };
}
function getHomeCoordinates() {
    if (StartupDataStore.Configuration.getMapHome() !== '' &&
        StartupDataStore.Configuration.getMapHome() !== undefined) {
        var separateCoordinates_1 = StartupDataStore.Configuration.getMapHome()
            .replace(/\s/g, '')
            .split(',');
        if (separateCoordinates_1.length % 2 === 0) {
            return separateCoordinates_1
                .reduce(function (coordinates, coordinate, index) {
                if (index % 2 === 0) {
                    coordinates.push({
                        lon: coordinate,
                        lat: separateCoordinates_1[index + 1],
                    });
                }
                return coordinates;
            }, [])
                .map(function (coordinateObj) {
                var lon = parseFloat(coordinateObj.lon);
                var lat = parseFloat(coordinateObj.lat);
                if (isNaN(lon) || isNaN(lat)) {
                    return undefined;
                }
                lon = wrapNum(lon, -180, 180);
                lat = wrapNum(lat, -90, 90);
                return {
                    lon: lon,
                    lat: lat,
                };
            })
                .filter(function (coordinateObj) {
                return coordinateObj !== undefined;
            });
        }
    }
    else {
        return [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2hvbWUudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUNwRSxPQUFPLE9BQU8sTUFBTSxrREFBa0QsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUM5RCxJQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO0FBQzVELElBQU0sc0JBQXNCLEdBQUc7SUFDN0IsSUFBSSxFQUFFLENBQUMsR0FBRztJQUNWLEtBQUssRUFBRSxFQUFFO0lBQ1QsSUFBSSxFQUFFLENBQUMsRUFBRTtJQUNULEtBQUssRUFBRSxFQUFFO0NBQ1YsQ0FBQTtBQUNELE1BQU0sQ0FBQyxJQUFNLE9BQU8sR0FBRztJQUNyQixPQUFPO1FBQ0wsaUJBQWlCLENBQUMsVUFBVSxFQUFFO1FBQzlCLGVBQWU7UUFDZixzQkFBc0I7S0FDdkIsQ0FBQyxJQUFJLENBQUMsVUFBQyxPQUFPLElBQUssT0FBQSxPQUFPLEtBQUssU0FBUyxFQUFyQixDQUFxQixDQUFDLENBQUE7QUFDNUMsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHLFVBQUMsRUFBcUI7UUFBbkIsR0FBRyxTQUFBO0lBQzlCLElBQU0sSUFBSSxHQUFHLE9BQU8sRUFBRSxDQUFBO0lBQ3RCLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3QixDQUFDLENBQUE7QUFDRCxTQUFTLFdBQVcsQ0FBQyxFQUF1QztRQUFyQyxRQUFRLGNBQUEsRUFBRSxRQUFRLGNBQUEsRUFBRSxVQUFVLGdCQUFBO0lBQ25ELElBQUks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RyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2dCQUM3QixHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFDM0IsT0FBTztvQkFDTCxHQUFHLEtBQUE7b0JBQ0gsR0FBRyxLQUFBO2lCQUNKLENBQUE7WUFDSCxDQUFDLENBQUM7aUJBQ0QsTUFBTSxDQUFDLFVBQUMsYUFBa0I7Z0JBQ3pCLE9BQU8sYUFBYSxLQUFLLFNBQVMsQ0FBQTtZQUNwQyxDQUFDLENBQUMsQ0FBQTtTQUNMO0tBQ0Y7U0FBTTtRQUNMLE9BQU8sRUFBRSxDQUFBO0tBQ1Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHdyYXBOdW0gZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3dyYXAtbnVtL3dyYXAtbnVtJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmNvbnN0IGhvbWVCb3VuZGluZ0JveCA9IGdldEJvdW5kaW5nQm94KGdldEhvbWVDb29yZGluYXRlcygpKVxuY29uc3QgZGVmYXVsdEhvbWVCb3VuZGluZ0JveCA9IHtcbiAgd2VzdDogLTEyOCxcbiAgc291dGg6IDI0LFxuICBlYXN0OiAtNjMsXG4gIG5vcnRoOiA1Mixcbn1cbmV4cG9ydCBjb25zdCBnZXRIb21lID0gKCkgPT4ge1xuICByZXR1cm4gW1xuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldE1hcEhvbWUoKSxcbiAgICBob21lQm91bmRpbmdCb3gsXG4gICAgZGVmYXVsdEhvbWVCb3VuZGluZ0JveCxcbiAgXS5maW5kKChlbGVtZW50KSA9PiBlbGVtZW50ICE9PSB1bmRlZmluZWQpXG59XG5leHBvcnQgY29uc3Qgem9vbVRvSG9tZSA9ICh7IG1hcCB9OiB7IG1hcDogYW55IH0pID0+IHtcbiAgY29uc3QgaG9tZSA9IGdldEhvbWUoKVxuICBtYXAuem9vbVRvQm91bmRpbmdCb3goaG9tZSlcbn1cbmZ1bmN0aW9uIGZpbmRFeHRyZW1lKHsgb2JqQXJyYXksIHByb3BlcnR5LCBjb21wYXJhdG9yIH06IGFueSkge1xuICBpZiAob2JqQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIHJldHVybiBvYmpBcnJheS5yZWR1Y2UoXG4gICAgKGV4dHJlbWU6IGFueSwgY29vcmRpbmF0ZU9iajogYW55KSA9PlxuICAgICAgKGV4dHJlbWUgPSBjb21wYXJhdG9yKGV4dHJlbWUsIGNvb3JkaW5hdGVPYmpbcHJvcGVydHldKSksXG4gICAgb2JqQXJyYXlbMF1bcHJvcGVydHldXG4gIClcbn1cbmZ1bmN0aW9uIGdldEJvdW5kaW5nQm94KGNvb3JkaW5hdGVzOiBhbnkpIHtcbiAgY29uc3Qgbm9ydGggPSBmaW5kRXh0cmVtZSh7XG4gICAgb2JqQXJyYXk6IGNvb3JkaW5hdGVzLFxuICAgIHByb3BlcnR5OiAnbGF0JyxcbiAgICBjb21wYXJhdG9yOiBNYXRoLm1heCxcbiAgfSlcbiAgY29uc3Qgc291dGggPSBmaW5kRXh0cmVtZSh7XG4gICAgb2JqQXJyYXk6IGNvb3JkaW5hdGVzLFxuICAgIHByb3BlcnR5OiAnbGF0JyxcbiAgICBjb21wYXJhdG9yOiBNYXRoLm1pbixcbiAgfSlcbiAgY29uc3QgZWFzdCA9IGZpbmRFeHRyZW1lKHtcbiAgICBvYmpBcnJheTogY29vcmRpbmF0ZXMsXG4gICAgcHJvcGVydHk6ICdsb24nLFxuICAgIGNvbXBhcmF0b3I6IE1hdGgubWF4LFxuICB9KVxuICBjb25zdCB3ZXN0ID0gZmluZEV4dHJlbWUoe1xuICAgIG9iakFycmF5OiBjb29yZGluYXRlcyxcbiAgICBwcm9wZXJ0eTogJ2xvbicsXG4gICAgY29tcGFyYXRvcjogTWF0aC5taW4sXG4gIH0pXG4gIGlmIChcbiAgICBub3J0aCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgc291dGggPT09IHVuZGVmaW5lZCB8fFxuICAgIGVhc3QgPT09IHVuZGVmaW5lZCB8fFxuICAgIHdlc3QgPT09IHVuZGVmaW5lZFxuICApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBub3J0aCxcbiAgICBlYXN0LFxuICAgIHNvdXRoLFxuICAgIHdlc3QsXG4gIH1cbn1cbmZ1bmN0aW9uIGdldEhvbWVDb29yZGluYXRlcygpIHtcbiAgaWYgKFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRNYXBIb21lKCkgIT09ICcnICYmXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldE1hcEhvbWUoKSAhPT0gdW5kZWZpbmVkXG4gICkge1xuICAgIGNvbnN0IHNlcGFyYXRlQ29vcmRpbmF0ZXMgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0TWFwSG9tZSgpXG4gICAgICAucmVwbGFjZSgvXFxzL2csICcnKVxuICAgICAgLnNwbGl0KCcsJylcbiAgICBpZiAoc2VwYXJhdGVDb29yZGluYXRlcy5sZW5ndGggJSAyID09PSAwKSB7XG4gICAgICByZXR1cm4gc2VwYXJhdGVDb29yZGluYXRlc1xuICAgICAgICAucmVkdWNlKChjb29yZGluYXRlczogYW55LCBjb29yZGluYXRlOiBhbnksIGluZGV4OiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoaW5kZXggJSAyID09PSAwKSB7XG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgbG9uOiBjb29yZGluYXRlLFxuICAgICAgICAgICAgICBsYXQ6IHNlcGFyYXRlQ29vcmRpbmF0ZXNbaW5kZXggKyAxXSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb29yZGluYXRlc1xuICAgICAgICB9LCBbXSlcbiAgICAgICAgLm1hcCgoY29vcmRpbmF0ZU9iajogYW55KSA9PiB7XG4gICAgICAgICAgbGV0IGxvbiA9IHBhcnNlRmxvYXQoY29vcmRpbmF0ZU9iai5sb24pXG4gICAgICAgICAgbGV0IGxhdCA9IHBhcnNlRmxvYXQoY29vcmRpbmF0ZU9iai5sYXQpXG4gICAgICAgICAgaWYgKGlzTmFOKGxvbikgfHwgaXNOYU4obGF0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgICBsb24gPSB3cmFwTnVtKGxvbiwgLTE4MCwgMTgwKVxuICAgICAgICAgIGxhdCA9IHdyYXBOdW0obGF0LCAtOTAsIDkwKVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsb24sXG4gICAgICAgICAgICBsYXQsXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKChjb29yZGluYXRlT2JqOiBhbnkpID0+IHtcbiAgICAgICAgICByZXR1cm4gY29vcmRpbmF0ZU9iaiAhPT0gdW5kZWZpbmVkXG4gICAgICAgIH0pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBbXVxuICB9XG59XG4iXX0=