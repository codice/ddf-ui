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
/*jshint bitwise: false*/
import $ from 'jquery';
import DistanceUtils from './DistanceUtils';
import { StartupDataStore } from './model/Startup/startup';
function sanitizeForCql(text) {
    return text
        .split('[')
        .join('(')
        .split(']')
        .join(')')
        .split("'")
        .join('')
        .split('"')
        .join('');
}
function lineToCQLLine(model) {
    var cqlLINE = model.map(function (point) { return point[0] + ' ' + point[1]; });
    return cqlLINE;
}
function polygonToCQLPolygon(model) {
    var cqlPolygon = model.map(function (point) { return point[0] + ' ' + point[1]; });
    if (cqlPolygon[0] !== cqlPolygon[cqlPolygon.length - 1]) {
        cqlPolygon.push(cqlPolygon[0]);
    }
    return [cqlPolygon];
}
function polygonToCQLMultiPolygon(model) {
    return model.map(function (polygon) { return polygonToCQLPolygon(polygon); });
}
function bboxToCQLPolygon(model) {
    if (model.locationType === 'usng') {
        return [
            model.mapWest + ' ' + model.mapSouth,
            model.mapWest + ' ' + model.mapNorth,
            model.mapEast + ' ' + model.mapNorth,
            model.mapEast + ' ' + model.mapSouth,
            model.mapWest + ' ' + model.mapSouth,
        ];
    }
    else {
        return [
            model.west + ' ' + model.south,
            model.west + ' ' + model.north,
            model.east + ' ' + model.north,
            model.east + ' ' + model.south,
            model.west + ' ' + model.south,
        ];
    }
}
function generateAnyGeoFilter(property, model) {
    if (model === null) {
        return {
            type: 'IS NULL',
            property: property,
            value: null,
        };
    }
    var defaultGeoFilter = {
        type: 'INTERSECTS',
        property: property,
        value: '',
    };
    switch (model.type) {
        case 'LINE':
            if (!Array.isArray(model.line)) {
                return defaultGeoFilter;
            }
            return {
                type: model.lineWidth > 0 ? 'DWITHIN' : 'INTERSECTS',
                property: property,
                value: 'LINESTRING' +
                    sanitizeForCql(JSON.stringify(lineToCQLLine(model.line))),
                distance: DistanceUtils.getDistanceInMeters(model.lineWidth, model.lineUnits),
            };
        case 'POLYGON':
            if (!Array.isArray(model.polygon)) {
                return defaultGeoFilter;
            }
            return __assign({ type: model.polygonBufferWidth > 0 ? 'DWITHIN' : 'INTERSECTS', property: property, value: "POLYGON".concat(sanitizeForCql(JSON.stringify(polygonToCQLPolygon(model.polygon)))) }, (model.polygonBufferWidth && {
                distance: DistanceUtils.getDistanceInMeters(model.polygonBufferWidth, model.polygonBufferUnits),
            }));
        case 'MULTIPOLYGON':
            if (!Array.isArray(model.polygon)) {
                return defaultGeoFilter;
            }
            var poly = 'MULTIPOLYGON' +
                sanitizeForCql(JSON.stringify(polygonToCQLMultiPolygon(model.polygon)));
            return __assign({ type: model.polygonBufferWidth > 0 ? 'DWITHIN' : 'INTERSECTS', property: property, value: poly }, (model.polygonBufferWidth && {
                distance: DistanceUtils.getDistanceInMeters(model.polygonBufferWidth, model.polygonBufferUnits),
            }));
        case 'BBOX':
            return {
                type: 'INTERSECTS',
                property: property,
                value: 'POLYGON(' +
                    sanitizeForCql(JSON.stringify(bboxToCQLPolygon(model))) +
                    ')',
            };
        case 'POINT':
        case 'POINTRADIUS':
            return {
                type: 'DWITHIN',
                property: property,
                value: 'POINT(' + model.lon + ' ' + model.lat + ')',
                distance: DistanceUtils.getDistanceInMeters(model.radius, model.radiusUnits),
            };
        default:
            return defaultGeoFilter;
    }
}
function buildIntersectOrCQL(shapes) {
    var _this = this;
    var locationFilter = '';
    $.each(shapes, function (i, shape) {
        locationFilter += _this.buildIntersectCQL(shape);
        if (i !== shapes.length - 1) {
            locationFilter += ' OR ';
        }
    });
    return locationFilter;
}
function arrayFromPartialWkt(partialWkt) {
    var result = partialWkt;
    if (partialWkt.startsWith('((')) {
        // remove the leading and trailing parentheses
        result = partialWkt.replace(/^\(/, '').replace(/\)$/, '');
    }
    // change parentheses to array brackets
    result = result.replace(/\(/g, '[').replace(/\)/g, ']');
    // change each space-separated coordinate pair to a two-element array
    // eslint-disable-next-line no-useless-escape
    result = result.replace(/([^,\[\]]+)\s+([^,\[\]]+)/g, '[$1,$2]');
    // build nested arrays from the string
    return JSON.parse(result);
}
function sanitizeGeometryCql(cqlString) {
    //sanitize polygons
    var polygons = cqlString.match(/'POLYGON\(\((-?[0-9]*.?[0-9]* -?[0-9]*.?[0-9]*,?)*\)\)'/g);
    if (polygons) {
        polygons.forEach(function (polygon) {
            cqlString = cqlString.replace(polygon, polygon.replace(/'/g, ''));
        });
    }
    //sanitize multipolygons
    var multipolygons = cqlString.match(/'MULTIPOLYGON\(\(\(.*\)\)\)'/g);
    if (multipolygons) {
        multipolygons.forEach(function (multipolygon) {
            cqlString = cqlString.replace(multipolygon, multipolygon.replace(/'/g, ''));
        });
    }
    //sanitize points
    var points = cqlString.match(/'POINT\(-?[0-9]*.?[0-9]* -?[0-9]*.?[0-9]*\)'/g);
    if (points) {
        points.forEach(function (point) {
            cqlString = cqlString.replace(point, point.replace(/'/g, ''));
        });
    }
    //sanitize linestrings
    var linestrings = cqlString.match(/'LINESTRING\((-?[0-9]*.?[0-9]* -?[0-9]*.?[0-9]*.?)*\)'/g);
    if (linestrings) {
        linestrings.forEach(function (linestring) {
            cqlString = cqlString.replace(linestring, linestring.replace(/'/g, ''));
        });
    }
    return cqlString;
}
function getProperty(filter) {
    if (typeof filter.property !== 'string') {
        return null;
    }
    return filter.property.split('"').join('');
}
function generateIsEmptyFilter(property) {
    return {
        type: 'IS NULL',
        property: property,
        value: null,
    };
}
function generateFilter(type, property, value, metacardDefinitions) {
    if (!metacardDefinitions) {
        metacardDefinitions = StartupDataStore.MetacardDefinitions;
    }
    if (metacardDefinitions.getAttributeMap()[property] === undefined) {
        return null;
    }
    switch (metacardDefinitions.getAttributeMap()[property].type) {
        case 'LOCATION':
        case 'GEOMETRY':
            return generateAnyGeoFilter(property, value);
        default:
            var filter = {
                type: type,
                property: property,
                value: value,
            };
            if (type === 'DURING') {
                var dates = value.split('/');
                filter.from = dates[0];
                filter.to = dates[1];
            }
            if (type === 'BETWEEN') {
                ;
                filter.lowerBoundary = value.lower;
                filter.upperBoundary = value.upper;
            }
            return filter;
    }
}
function generateFilterForFilterFunction(filterFunctionName, params) {
    return {
        type: '=',
        value: true,
        property: {
            type: 'FILTER_FUNCTION',
            filterFunctionName: filterFunctionName,
            params: params,
        },
    };
}
function isGeoFilter(type) {
    return type === 'DWITHIN' || type === 'INTERSECTS';
}
// function transformFilterToCQL(filter) {
//   // todo:  see if we need the extra surrounding parens
//   return this.sanitizeGeometryCql('(' + cql.write(filter) + ')')
// }
// function transformCQLToFilter(cqlString) {
//   return cql.simplify(cql.read(cqlString))
// }
var isPolygonFilter = function (filter) {
    return geometryFilterContainsString(filter, 'POLYGON');
};
var isLineFilter = function (filter) {
    return geometryFilterContainsString(filter, 'LINESTRING');
};
function isPointRadiusFilter(filter) {
    return geometryFilterContainsString(filter, 'POINT');
}
function geometryFilterContainsString(filter, filterSearchString) {
    return filter.value && filter.value.indexOf(filterSearchString) >= 0;
}
function buildIntersectCQL(locationGeometry) {
    var locationFilter = '';
    var locationWkt = locationGeometry.toWkt();
    var locationType = locationGeometry.toGeoJSON().type.toUpperCase();
    var shapes;
    switch (locationType) {
        case 'POINT':
        case 'LINESTRING':
            locationFilter = '(DWITHIN(anyGeo, ' + locationWkt + ', 1, meters))';
            break;
        case 'POLYGON':
            // Test if the shape wkt contains ,(
            if (/,\(/.test(locationWkt)) {
                shapes = locationWkt.split(',(');
                $.each(shapes, function (i, polygon) {
                    locationWkt = polygon.replace(/POLYGON|[()]/g, '');
                    locationWkt = 'POLYGON((' + locationWkt + '))';
                    locationFilter += '(INTERSECTS(anyGeo, ' + locationWkt + '))';
                    if (i !== shapes.length - 1) {
                        locationFilter += ' OR ';
                    }
                });
            }
            else {
                locationFilter = '(INTERSECTS(anyGeo, ' + locationWkt + '))';
            }
            break;
        case 'MULTIPOINT':
            shapes = locationGeometry.points;
            locationFilter = buildIntersectOrCQL.call(this, shapes);
            break;
        case 'MULTIPOLYGON':
            shapes = locationGeometry.polygons;
            locationFilter = buildIntersectOrCQL.call(this, shapes);
            break;
        case 'MULTILINESTRING':
            shapes = locationGeometry.lineStrings;
            locationFilter = buildIntersectOrCQL.call(this, shapes);
            break;
        case 'GEOMETRYCOLLECTION':
            shapes = locationGeometry.geometries;
            locationFilter = buildIntersectOrCQL.call(this, shapes);
            break;
        default:
            console.error('unknown location type');
            return;
    }
    return locationFilter;
}
function arrayFromPolygonWkt(wkt) {
    // Handle POLYGON with no internal rings (i.e. holes)
    if (wkt.startsWith('POLYGON')) {
        var polygon = wkt.match(/\(\([^()]+\)\)/g);
        return polygon.length === 1 ? arrayFromPartialWkt(polygon[0]) : [];
    }
    // Handle MULTIPOLYGON with no internal rings (i.e. holes)
    var polygons = wkt.match(/\(\([^()]+\)\)/g);
    if (polygons) {
        return polygons.map(function (polygon) { return arrayFromPartialWkt(polygon); });
    }
    return [];
}
var arrayFromLinestringWkt = function (wkt) {
    var lines = wkt.match(/\([^()]+\)/g);
    if (lines && lines.length > 0) {
        return arrayFromPartialWkt(lines[0]);
    }
    return [];
};
var arrayFromMultilinestringWkt = function (wkt) {
    var lines = wkt.match(/\([^()]+\)/g);
    if (lines && lines.length > 0) {
        return lines.map(function (line) { return arrayFromPartialWkt(line); });
    }
    return [];
};
var arrayFromPointWkt = function (wkt) {
    var points = wkt.match(/\([^()]+\)/g);
    if (points && points.length > 0) {
        return arrayFromPartialWkt(points[0]);
    }
    return [];
};
export default {
    sanitizeGeometryCql: sanitizeGeometryCql,
    getProperty: getProperty,
    generateIsEmptyFilter: generateIsEmptyFilter,
    generateAnyGeoFilter: generateAnyGeoFilter,
    generateFilter: generateFilter,
    generateFilterForFilterFunction: generateFilterForFilterFunction,
    isGeoFilter: isGeoFilter,
    isPolygonFilter: isPolygonFilter,
    isLineFilter: isLineFilter,
    isPointRadiusFilter: isPointRadiusFilter,
    buildIntersectCQL: buildIntersectCQL,
    arrayFromPolygonWkt: arrayFromPolygonWkt,
    arrayFromLinestringWkt: arrayFromLinestringWkt,
    arrayFromMultilinestringWkt: arrayFromMultilinestringWkt,
    arrayFromPointWkt: arrayFromPointWkt,
};
//# sourceMappingURL=CQLUtils.js.map