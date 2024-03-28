import { __awaiter, __generator, __read } from "tslib";
import * as React from 'react';
import defaultFetch from '../utils/fetch';
import Keyword from './keyword';
import { StartupDataStore } from '../../js/model/Startup/startup';
export var getLargestBbox = function (polygonCoordinates, isMultiPolygon) {
    var finalMax = { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER };
    var finalMin = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
    var boundingBoxLimit = 75;
    var encompassingBoundingBox = {
        maxX: Number.MIN_SAFE_INTEGER,
        minX: Number.MAX_SAFE_INTEGER,
        maxY: Number.MIN_SAFE_INTEGER,
        minY: Number.MAX_SAFE_INTEGER,
    };
    var maxArea = -1;
    var currentArea = -1;
    var currentMax;
    var currentMin;
    polygonCoordinates.map(function (rowCoordinates) {
        currentMax = { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER };
        currentMin = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
        if (isMultiPolygon) {
            rowCoordinates[0].map(function (coordinates) {
                currentMax.x = Math.max(coordinates[0], currentMax.x);
                currentMax.y = Math.max(coordinates[1], currentMax.y);
                currentMin.x = Math.min(coordinates[0], currentMin.x);
                currentMin.y = Math.min(coordinates[1], currentMin.y);
                encompassingBoundingBox.maxX = Math.max(coordinates[0], encompassingBoundingBox.maxX);
                encompassingBoundingBox.maxY = Math.max(coordinates[1], encompassingBoundingBox.maxY);
                encompassingBoundingBox.minX = Math.min(coordinates[0], encompassingBoundingBox.minX);
                encompassingBoundingBox.minY = Math.min(coordinates[1], encompassingBoundingBox.minY);
            });
        }
        else {
            rowCoordinates.map(function (coordinates) {
                currentMax.x = Math.max(coordinates[0], currentMax.x);
                currentMax.y = Math.max(coordinates[1], currentMax.y);
                currentMin.x = Math.min(coordinates[0], currentMin.x);
                currentMin.y = Math.min(coordinates[1], currentMin.y);
                encompassingBoundingBox.maxX = Math.max(coordinates[0], encompassingBoundingBox.maxX);
                encompassingBoundingBox.maxY = Math.max(coordinates[1], encompassingBoundingBox.maxY);
                encompassingBoundingBox.minX = Math.min(coordinates[0], encompassingBoundingBox.minX);
                encompassingBoundingBox.minY = Math.min(coordinates[1], encompassingBoundingBox.minY);
            });
        }
        currentArea = (currentMax.x - currentMin.x) * (currentMax.y - currentMin.y);
        if (currentArea > maxArea) {
            maxArea = currentArea;
            finalMax = currentMax;
            finalMin = currentMin;
        }
    });
    var encompassingBoundingBoxHeight = encompassingBoundingBox.maxY - encompassingBoundingBox.minY;
    var encompassingBoundingBoxWidth = encompassingBoundingBox.maxX - encompassingBoundingBox.minX;
    return encompassingBoundingBoxWidth >= boundingBoxLimit ||
        encompassingBoundingBoxHeight >= boundingBoxLimit
        ? {
            maxX: finalMax.x,
            minX: finalMin.x,
            maxY: finalMax.y,
            minY: finalMin.y,
        }
        : encompassingBoundingBox;
};
var Gazetteer = function (props) {
    var fetch = props.fetch || defaultFetch;
    var expandPoint = function (geo) {
        var offset = 0.1;
        if (geo.length === 1) {
            var point = geo[0];
            return [
                {
                    lat: point.lat + offset,
                    lon: point.lon + offset,
                },
                {
                    lat: point.lat + offset,
                    lon: point.lon - offset,
                },
                {
                    lat: point.lat - offset,
                    lon: point.lon - offset,
                },
                {
                    lat: point.lat - offset,
                    lon: point.lon + offset,
                },
            ];
        }
        return geo;
    };
    var extractGeo = function (suggestion) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    expandPoint(suggestion.geo).map(function (coord) { return [
                        coord.lon,
                        coord.lat,
                    ]; }),
                ],
            },
            properties: {},
            id: suggestion.id,
        };
    };
    var suggesterWithLiteralSupport = function (input) { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("./internal/geofeature/suggestions?q=".concat(encodeURIComponent(input)))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var geofeatureWithLiteralSupport = function (suggestion) { return __awaiter(void 0, void 0, void 0, function () {
        var id, res, data, finalArea;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (suggestion.id.startsWith('LITERAL')) {
                        return [2 /*return*/, extractGeo(suggestion)];
                    }
                    id = suggestion.id;
                    return [4 /*yield*/, fetch("./internal/geofeature?id=".concat(id))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    finalArea = getLargestBbox(data.geometry.coordinates, isMultiPolygon(data.geometry.coordinates));
                    return [2 /*return*/, {
                            type: 'Feature',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [
                                    [
                                        [finalArea.minX, finalArea.minY],
                                        [finalArea.maxX, finalArea.minY],
                                        [finalArea.maxX, finalArea.maxY],
                                        [finalArea.minX, finalArea.maxY],
                                    ],
                                ],
                            },
                            properties: {},
                            id: data.display_name,
                        }];
            }
        });
    }); };
    var getOsmTypeSymbol = function (type) {
        switch (type) {
            case 'node':
                return 'N';
            case 'way':
                return 'W';
            case 'relation':
                return 'R';
            default:
                throw 'Unexpected OSM type ' + type;
        }
    };
    var suggester = function (input) { return __awaiter(void 0, void 0, void 0, function () {
        var res, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, window.__global__fetch("https://nominatim.openstreetmap.org/search?format=json&q=".concat(encodeURIComponent(input)))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    suggestions = _a.sent();
                    return [2 /*return*/, suggestions.map(function (place) {
                            return {
                                id: getOsmTypeSymbol(place.osm_type) + ':' + place.osm_id,
                                name: place.display_name,
                            };
                        })];
            }
        });
    }); };
    var isMultiPolygon = function (coordinates) {
        return (coordinates[0][0][0] !== undefined &&
            coordinates[0][0][0][0] !== undefined);
    };
    var geofeature = function (suggestion) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, type, id, res, data, boundingBoxLimit, boundingBoxWidth, boundingBoxHeight, finalArea;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = __read(suggestion.id.split(':'), 2), type = _a[0], id = _a[1];
                    return [4 /*yield*/, window.__global__fetch("https://nominatim.openstreetmap.org/lookup?format=json&osm_ids=".concat(type).concat(id, "&polygon_geojson=1"))];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = (_b.sent())[0];
                    boundingBoxLimit = 75;
                    boundingBoxWidth = data.boundingbox[3] - data.boundingbox[2];
                    boundingBoxHeight = data.boundingbox[1] - data.boundingbox[0];
                    if ((boundingBoxWidth >= boundingBoxLimit ||
                        boundingBoxHeight >= boundingBoxLimit) &&
                        Object.keys(data.address).length === 2) {
                        finalArea = getLargestBbox(data.geojson.coordinates, isMultiPolygon(data.geojson.coordinates));
                        data.boundingbox[0] = finalArea.minY;
                        data.boundingbox[1] = finalArea.maxY;
                        data.boundingbox[2] = finalArea.minX;
                        data.boundingbox[3] = finalArea.maxX;
                    }
                    return [2 /*return*/, {
                            type: 'Feature',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [
                                    [
                                        [data.boundingbox[2], data.boundingbox[0]],
                                        [data.boundingbox[3], data.boundingbox[0]],
                                        [data.boundingbox[3], data.boundingbox[1]],
                                        [data.boundingbox[2], data.boundingbox[1]],
                                    ],
                                ],
                            },
                            properties: {},
                            id: data.display_name,
                        }];
            }
        });
    }); };
    return (React.createElement(React.Fragment, null, StartupDataStore.Configuration.getOnlineGazetteer() ? (React.createElement(Keyword, { value: props.value, setState: props.setState, suggester: suggester, geofeature: geofeature, placeholder: props.placeholder, loadingMessage: props.loadingMessage, variant: props.variant })) : (React.createElement(Keyword, { value: props.value, setState: props.setState, suggester: suggesterWithLiteralSupport, geofeature: geofeatureWithLiteralSupport, placeholder: props.placeholder, loadingMessage: props.loadingMessage, variant: props.variant }))));
};
export default Gazetteer;
//# sourceMappingURL=gazetteer.js.map