import { __assign } from "tslib";
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
import { Direction } from '../utils/dms-utils';
var dmsLatitude = {
    coordinate: '',
    direction: Direction.North,
};
var dmsLongitude = {
    coordinate: '',
    direction: Direction.East,
};
export var dmsPoint = {
    latitude: __assign({}, dmsLatitude),
    longitude: __assign({}, dmsLongitude),
};
export var dmsModel = {
    shape: 'point',
    point: __assign({}, dmsPoint),
    circle: {
        point: __assign({}, dmsPoint),
        radius: '1',
        units: 'meters',
    },
    line: {
        list: [],
    },
    polygon: {
        list: [],
    },
    boundingbox: {
        north: __assign({}, dmsLatitude),
        south: __assign({}, dmsLatitude),
        east: __assign({}, dmsLongitude),
        west: __assign({}, dmsLongitude),
    },
};
//# sourceMappingURL=dms-model.js.map