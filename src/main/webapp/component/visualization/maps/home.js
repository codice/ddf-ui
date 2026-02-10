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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9tYXBzL2hvbWUudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUNwRSxPQUFPLE9BQU8sTUFBTSxrREFBa0QsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUM5RCxJQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO0FBQzVELElBQU0sc0JBQXNCLEdBQUc7SUFDN0IsSUFBSSxFQUFFLENBQUMsR0FBRztJQUNWLEtBQUssRUFBRSxFQUFFO0lBQ1QsSUFBSSxFQUFFLENBQUMsRUFBRTtJQUNULEtBQUssRUFBRSxFQUFFO0NBQ1YsQ0FBQTtBQUNELE1BQU0sQ0FBQyxJQUFNLE9BQU8sR0FBRztJQUNyQixPQUFPO1FBQ0wsaUJBQWlCLENBQUMsVUFBVSxFQUFFO1FBQzlCLGVBQWU7UUFDZixzQkFBc0I7S0FDdkIsQ0FBQyxJQUFJLENBQUMsVUFBQyxPQUFPLElBQUssT0FBQSxPQUFPLEtBQUssU0FBUyxFQUFyQixDQUFxQixDQUFDLENBQUE7QUFDNUMsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHLFVBQUMsRUFBcUI7UUFBbkIsR0FBRyxTQUFBO0lBQzlCLElBQU0sSUFBSSxHQUFHLE9BQU8sRUFBRSxDQUFBO0lBQ3RCLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3QixDQUFDLENBQUE7QUFDRCxTQUFTLFdBQVcsQ0FBQyxFQUF1QztRQUFyQyxRQUFRLGNBQUEsRUFBRSxRQUFRLGNBQUEsRUFBRSxVQUFVLGdCQUFBO0lBQ25ELElBQUks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QUFTLENBQUE7Z0JBQ2xCLENBQUM7Z0JBQ0QsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQzdCLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUMzQixPQUFPO29CQUNMLEdBQUcsS0FBQTtvQkFDSCxHQUFHLEtBQUE7aUJBQ0osQ0FBQTtZQUNILENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsVUFBQyxhQUFrQjtnQkFDekIsT0FBTyxhQUFhLEtBQUssU0FBUyxDQUFBO1lBQ3BDLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB3cmFwTnVtIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy93cmFwLW51bS93cmFwLW51bSdcbmltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vc2luZ2xldG9ucy9UeXBlZFVzZXInXG5jb25zdCBob21lQm91bmRpbmdCb3ggPSBnZXRCb3VuZGluZ0JveChnZXRIb21lQ29vcmRpbmF0ZXMoKSlcbmNvbnN0IGRlZmF1bHRIb21lQm91bmRpbmdCb3ggPSB7XG4gIHdlc3Q6IC0xMjgsXG4gIHNvdXRoOiAyNCxcbiAgZWFzdDogLTYzLFxuICBub3J0aDogNTIsXG59XG5leHBvcnQgY29uc3QgZ2V0SG9tZSA9ICgpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBUeXBlZFVzZXJJbnN0YW5jZS5nZXRNYXBIb21lKCksXG4gICAgaG9tZUJvdW5kaW5nQm94LFxuICAgIGRlZmF1bHRIb21lQm91bmRpbmdCb3gsXG4gIF0uZmluZCgoZWxlbWVudCkgPT4gZWxlbWVudCAhPT0gdW5kZWZpbmVkKVxufVxuZXhwb3J0IGNvbnN0IHpvb21Ub0hvbWUgPSAoeyBtYXAgfTogeyBtYXA6IGFueSB9KSA9PiB7XG4gIGNvbnN0IGhvbWUgPSBnZXRIb21lKClcbiAgbWFwLnpvb21Ub0JvdW5kaW5nQm94KGhvbWUpXG59XG5mdW5jdGlvbiBmaW5kRXh0cmVtZSh7IG9iakFycmF5LCBwcm9wZXJ0eSwgY29tcGFyYXRvciB9OiBhbnkpIHtcbiAgaWYgKG9iakFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuICByZXR1cm4gb2JqQXJyYXkucmVkdWNlKFxuICAgIChleHRyZW1lOiBhbnksIGNvb3JkaW5hdGVPYmo6IGFueSkgPT5cbiAgICAgIChleHRyZW1lID0gY29tcGFyYXRvcihleHRyZW1lLCBjb29yZGluYXRlT2JqW3Byb3BlcnR5XSkpLFxuICAgIG9iakFycmF5WzBdW3Byb3BlcnR5XVxuICApXG59XG5mdW5jdGlvbiBnZXRCb3VuZGluZ0JveChjb29yZGluYXRlczogYW55KSB7XG4gIGNvbnN0IG5vcnRoID0gZmluZEV4dHJlbWUoe1xuICAgIG9iakFycmF5OiBjb29yZGluYXRlcyxcbiAgICBwcm9wZXJ0eTogJ2xhdCcsXG4gICAgY29tcGFyYXRvcjogTWF0aC5tYXgsXG4gIH0pXG4gIGNvbnN0IHNvdXRoID0gZmluZEV4dHJlbWUoe1xuICAgIG9iakFycmF5OiBjb29yZGluYXRlcyxcbiAgICBwcm9wZXJ0eTogJ2xhdCcsXG4gICAgY29tcGFyYXRvcjogTWF0aC5taW4sXG4gIH0pXG4gIGNvbnN0IGVhc3QgPSBmaW5kRXh0cmVtZSh7XG4gICAgb2JqQXJyYXk6IGNvb3JkaW5hdGVzLFxuICAgIHByb3BlcnR5OiAnbG9uJyxcbiAgICBjb21wYXJhdG9yOiBNYXRoLm1heCxcbiAgfSlcbiAgY29uc3Qgd2VzdCA9IGZpbmRFeHRyZW1lKHtcbiAgICBvYmpBcnJheTogY29vcmRpbmF0ZXMsXG4gICAgcHJvcGVydHk6ICdsb24nLFxuICAgIGNvbXBhcmF0b3I6IE1hdGgubWluLFxuICB9KVxuICBpZiAoXG4gICAgbm9ydGggPT09IHVuZGVmaW5lZCB8fFxuICAgIHNvdXRoID09PSB1bmRlZmluZWQgfHxcbiAgICBlYXN0ID09PSB1bmRlZmluZWQgfHxcbiAgICB3ZXN0ID09PSB1bmRlZmluZWRcbiAgKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIHJldHVybiB7XG4gICAgbm9ydGgsXG4gICAgZWFzdCxcbiAgICBzb3V0aCxcbiAgICB3ZXN0LFxuICB9XG59XG5mdW5jdGlvbiBnZXRIb21lQ29vcmRpbmF0ZXMoKSB7XG4gIGlmIChcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0TWFwSG9tZSgpICE9PSAnJyAmJlxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRNYXBIb21lKCkgIT09IHVuZGVmaW5lZFxuICApIHtcbiAgICBjb25zdCBzZXBhcmF0ZUNvb3JkaW5hdGVzID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldE1hcEhvbWUoKVxuICAgICAgLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgaWYgKHNlcGFyYXRlQ29vcmRpbmF0ZXMubGVuZ3RoICUgMiA9PT0gMCkge1xuICAgICAgcmV0dXJuIHNlcGFyYXRlQ29vcmRpbmF0ZXNcbiAgICAgICAgLnJlZHVjZSgoY29vcmRpbmF0ZXM6IGFueSwgY29vcmRpbmF0ZTogYW55LCBpbmRleDogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKGluZGV4ICUgMiA9PT0gMCkge1xuICAgICAgICAgICAgY29vcmRpbmF0ZXMucHVzaCh7XG4gICAgICAgICAgICAgIGxvbjogY29vcmRpbmF0ZSxcbiAgICAgICAgICAgICAgbGF0OiBzZXBhcmF0ZUNvb3JkaW5hdGVzW2luZGV4ICsgMV0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXNcbiAgICAgICAgfSwgW10pXG4gICAgICAgIC5tYXAoKGNvb3JkaW5hdGVPYmo6IGFueSkgPT4ge1xuICAgICAgICAgIGxldCBsb24gPSBwYXJzZUZsb2F0KGNvb3JkaW5hdGVPYmoubG9uKVxuICAgICAgICAgIGxldCBsYXQgPSBwYXJzZUZsb2F0KGNvb3JkaW5hdGVPYmoubGF0KVxuICAgICAgICAgIGlmIChpc05hTihsb24pIHx8IGlzTmFOKGxhdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9uID0gd3JhcE51bShsb24sIC0xODAsIDE4MClcbiAgICAgICAgICBsYXQgPSB3cmFwTnVtKGxhdCwgLTkwLCA5MClcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbG9uLFxuICAgICAgICAgICAgbGF0LFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcigoY29vcmRpbmF0ZU9iajogYW55KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVPYmogIT09IHVuZGVmaW5lZFxuICAgICAgICB9KVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW11cbiAgfVxufVxuIl19