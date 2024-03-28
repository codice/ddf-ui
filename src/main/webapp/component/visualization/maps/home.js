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
//# sourceMappingURL=home.js.map