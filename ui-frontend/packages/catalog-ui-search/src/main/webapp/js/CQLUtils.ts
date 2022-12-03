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
import defaultMetacardDefinitions from '../component/singletons/metacard-definitions';
function sanitizeForCql(text: any) {
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
function lineToCQLLine(model: any) {
    const cqlLINE = model.map((point: any) => point[0] + ' ' + point[1]);
    return cqlLINE;
}
function polygonToCQLPolygon(model: any) {
    const cqlPolygon = model.map((point: any) => point[0] + ' ' + point[1]);
    if (cqlPolygon[0] !== cqlPolygon[cqlPolygon.length - 1]) {
        cqlPolygon.push(cqlPolygon[0]);
    }
    return [cqlPolygon];
}
function polygonToCQLMultiPolygon(model: any) {
    return model.map((polygon: any) => polygonToCQLPolygon(polygon));
}
function bboxToCQLPolygon(model: any) {
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
function generateAnyGeoFilter(property: any, model: any) {
    if (model === null) {
        return {
            type: 'IS NULL',
            property,
            value: null,
        };
    }
    const defaultGeoFilter = {
        type: 'INTERSECTS',
        property,
        value: '',
    };
    switch (model.type) {
        case 'LINE':
            if (!Array.isArray(model.line)) {
                return defaultGeoFilter;
            }
            return {
                type: model.lineWidth > 0 ? 'DWITHIN' : 'INTERSECTS',
                property,
                value: 'LINESTRING' +
                    sanitizeForCql(JSON.stringify(lineToCQLLine(model.line))),
                distance: DistanceUtils.getDistanceInMeters(model.lineWidth, model.lineUnits),
            };
        case 'POLYGON':
            if (!Array.isArray(model.polygon)) {
                return defaultGeoFilter;
            }
            return {
                type: model.polygonBufferWidth > 0 ? 'DWITHIN' : 'INTERSECTS',
                property,
                value: `POLYGON${sanitizeForCql(JSON.stringify(polygonToCQLPolygon(model.polygon)))}`,
                ...(model.polygonBufferWidth && {
                    distance: DistanceUtils.getDistanceInMeters(model.polygonBufferWidth, model.polygonBufferUnits),
                }),
            };
        case 'MULTIPOLYGON':
            if (!Array.isArray(model.polygon)) {
                return defaultGeoFilter;
            }
            const poly = 'MULTIPOLYGON' +
                sanitizeForCql(JSON.stringify(polygonToCQLMultiPolygon(model.polygon)));
            return {
                type: model.polygonBufferWidth > 0 ? 'DWITHIN' : 'INTERSECTS',
                property,
                value: poly,
                ...(model.polygonBufferWidth && {
                    distance: DistanceUtils.getDistanceInMeters(model.polygonBufferWidth, model.polygonBufferUnits),
                }),
            };
        case 'BBOX':
            return {
                type: 'INTERSECTS',
                property,
                value: 'POLYGON(' +
                    sanitizeForCql(JSON.stringify(bboxToCQLPolygon(model))) +
                    ')',
            };
        case 'POINT':
        case 'POINTRADIUS':
            return {
                type: 'DWITHIN',
                property,
                value: 'POINT(' + model.lon + ' ' + model.lat + ')',
                distance: DistanceUtils.getDistanceInMeters(model.radius, model.radiusUnits),
            };
        default:
            return defaultGeoFilter;
    }
}
function buildIntersectOrCQL(this: any, shapes: any) {
    let locationFilter = '';
    $.each(shapes, (i, shape) => {
        locationFilter += this.buildIntersectCQL(shape);
        if (i !== shapes.length - 1) {
            locationFilter += ' OR ';
        }
    });
    return locationFilter;
}
function arrayFromPartialWkt(partialWkt: any) {
    // remove the leading and trailing parentheses
    let result = partialWkt.replace(/^\(/, '').replace(/\)$/, '');
    // change parentheses to array brackets
    result = result.replace(/\(/g, '[').replace(/\)/g, ']');
    // change each space-separated coordinate pair to a two-element array
    // eslint-disable-next-line no-useless-escape
    result = result.replace(/([^,\[\]]+)\s+([^,\[\]]+)/g, '[$1,$2]');
    // build nested arrays from the string
    return JSON.parse(result);
}
function sanitizeGeometryCql(cqlString: any) {
    //sanitize polygons
    let polygons = cqlString.match(/'POLYGON\(\((-?[0-9]*.?[0-9]* -?[0-9]*.?[0-9]*,?)*\)\)'/g);
    if (polygons) {
        polygons.forEach((polygon: any) => {
            cqlString = cqlString.replace(polygon, polygon.replace(/'/g, ''));
        });
    }
    //sanitize multipolygons
    let multipolygons = cqlString.match(/'MULTIPOLYGON\(\(\(.*\)\)\)'/g);
    if (multipolygons) {
        multipolygons.forEach((multipolygon: any) => {
            cqlString = cqlString.replace(multipolygon, multipolygon.replace(/'/g, ''));
        });
    }
    //sanitize points
    let points = cqlString.match(/'POINT\(-?[0-9]*.?[0-9]* -?[0-9]*.?[0-9]*\)'/g);
    if (points) {
        points.forEach((point: any) => {
            cqlString = cqlString.replace(point, point.replace(/'/g, ''));
        });
    }
    //sanitize linestrings
    let linestrings = cqlString.match(/'LINESTRING\((-?[0-9]*.?[0-9]* -?[0-9]*.?[0-9]*.?)*\)'/g);
    if (linestrings) {
        linestrings.forEach((linestring: any) => {
            cqlString = cqlString.replace(linestring, linestring.replace(/'/g, ''));
        });
    }
    return cqlString;
}
function getProperty(filter: any) {
    if (typeof filter.property !== 'string') {
        return null;
    }
    return filter.property.split('"').join('');
}
function generateIsEmptyFilter(property: any) {
    return {
        type: 'IS NULL',
        property,
        value: null,
    };
}
function generateFilter(type: any, property: any, value: any, metacardDefinitions: any) {
    if (!metacardDefinitions) {
        metacardDefinitions = defaultMetacardDefinitions;
    }
    if (metacardDefinitions.metacardTypes[property] === undefined) {
        return null;
    }
    switch (metacardDefinitions.metacardTypes[property].type) {
        case 'LOCATION':
        case 'GEOMETRY':
            return generateAnyGeoFilter(property, value);
        default:
            const filter = {
                type,
                property,
                value,
            };
            if (type === 'DURING') {
                const dates = value.split('/');
                (filter as any).from = dates[0];
                (filter as any).to = dates[1];
            }
            if (type === 'BETWEEN') {
                (filter as any).lowerBoundary = value.lower;
                (filter as any).upperBoundary = value.upper;
            }
            return filter;
    }
}
function generateFilterForFilterFunction(filterFunctionName: any, params: any) {
    return {
        type: '=',
        value: true,
        property: {
            type: 'FILTER_FUNCTION',
            filterFunctionName,
            params,
        },
    };
}
function isGeoFilter(type: any) {
    return type === 'DWITHIN' || type === 'INTERSECTS';
}
// function transformFilterToCQL(filter) {
//   // todo:  see if we need the extra surrounding parens
//   return this.sanitizeGeometryCql('(' + cql.write(filter) + ')')
// }
// function transformCQLToFilter(cqlString) {
//   return cql.simplify(cql.read(cqlString))
// }
const isPolygonFilter = (filter: any) => {
    return geometryFilterContainsString(filter, 'POLYGON');
};
const isLineFilter = (filter: any) => {
    return geometryFilterContainsString(filter, 'LINESTRING');
};
function isPointRadiusFilter(filter: any) {
    return geometryFilterContainsString(filter, 'POINT');
}
function geometryFilterContainsString(filter: any, filterSearchString: any) {
    return filter.value && filter.value.indexOf(filterSearchString) >= 0;
}
// @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'this'.
function buildIntersectCQL(this: any, this: any, this: any, this: any, locationGeometry: any) {
    let locationFilter = '';
    let locationWkt = locationGeometry.toWkt();
    const locationType = locationGeometry.toGeoJSON().type.toUpperCase();
    let shapes;
    switch (locationType) {
        case 'POINT':
        case 'LINESTRING':
            locationFilter = '(DWITHIN(anyGeo, ' + locationWkt + ', 1, meters))';
            break;
        case 'POLYGON':
            // Test if the shape wkt contains ,(
            if (/,\(/.test(locationWkt)) {
                shapes = locationWkt.split(',(');
                $.each(shapes, (i, polygon) => {
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
function arrayFromPolygonWkt(wkt: any) {
    // Handle POLYGON with no internal rings (i.e. holes)
    if (wkt.startsWith('POLYGON')) {
        const polygon = wkt.match(/\(\([^()]+\)\)/g);
        return polygon.length === 1 ? arrayFromPartialWkt(polygon[0]) : [];
    }
    // Handle MULTIPOLYGON with no internal rings (i.e. holes)
    const polygons = wkt.match(/\(\([^()]+\)\)/g);
    if (polygons) {
        return polygons.map((polygon: any) => arrayFromPartialWkt(polygon));
    }
    return [];
}
export default {
    sanitizeGeometryCql,
    getProperty,
    generateIsEmptyFilter,
    generateAnyGeoFilter,
    generateFilter,
    generateFilterForFilterFunction,
    isGeoFilter,
    isPolygonFilter,
    isLineFilter,
    isPointRadiusFilter,
    buildIntersectCQL,
    arrayFromPolygonWkt,
};
