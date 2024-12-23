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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F6ZXR0ZWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9nYXpldHRlZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFlQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUE7QUFDL0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDakUsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLFVBQzVCLGtCQUF5QixFQUN6QixjQUF1QjtJQUV2QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0lBQ3pFLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUE7SUFDekUsSUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7SUFDM0IsSUFBSSx1QkFBdUIsR0FBRztRQUM1QixJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtRQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtRQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtRQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtLQUM5QixDQUFBO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDaEIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDcEIsSUFBSSxVQUdILENBQUE7SUFDRCxJQUFJLFVBR0gsQ0FBQTtJQUNELGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFDLGNBQWM7UUFDcEMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUE7UUFDdkUsVUFBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUE7UUFDdkUsSUFBSSxjQUFjLEVBQUU7WUFDbEIsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLFdBQWdCO2dCQUNyQyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDckQsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNyRCxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDckQsdUJBQXVCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3JDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDZCx1QkFBdUIsQ0FBQyxJQUFJLENBQzdCLENBQUE7Z0JBQ0QsdUJBQXVCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3JDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDZCx1QkFBdUIsQ0FBQyxJQUFJLENBQzdCLENBQUE7Z0JBQ0QsdUJBQXVCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3JDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDZCx1QkFBdUIsQ0FBQyxJQUFJLENBQzdCLENBQUE7Z0JBQ0QsdUJBQXVCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3JDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFDZCx1QkFBdUIsQ0FBQyxJQUFJLENBQzdCLENBQUE7WUFDSCxDQUFDLENBQUMsQ0FBQTtTQUNIO2FBQU07WUFDTCxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQUMsV0FBZ0I7Z0JBQ2xDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNyRCxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDckQsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNyRCx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUNkLHVCQUF1QixDQUFDLElBQUksQ0FDN0IsQ0FBQTtnQkFDRCx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUNkLHVCQUF1QixDQUFDLElBQUksQ0FDN0IsQ0FBQTtnQkFDRCx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUNkLHVCQUF1QixDQUFDLElBQUksQ0FDN0IsQ0FBQTtnQkFDRCx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUNkLHVCQUF1QixDQUFDLElBQUksQ0FDN0IsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1NBQ0g7UUFDRCxXQUFXLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNFLElBQUksV0FBVyxHQUFHLE9BQU8sRUFBRTtZQUN6QixPQUFPLEdBQUcsV0FBVyxDQUFBO1lBQ3JCLFFBQVEsR0FBRyxVQUFVLENBQUE7WUFDckIsUUFBUSxHQUFHLFVBQVUsQ0FBQTtTQUN0QjtJQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0YsSUFBTSw2QkFBNkIsR0FDakMsdUJBQXVCLENBQUMsSUFBSSxHQUFHLHVCQUF1QixDQUFDLElBQUksQ0FBQTtJQUM3RCxJQUFNLDRCQUE0QixHQUNoQyx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFBO0lBQzdELE9BQU8sNEJBQTRCLElBQUksZ0JBQWdCO1FBQ3JELDZCQUE2QixJQUFJLGdCQUFnQjtRQUNqRCxDQUFDLENBQUM7WUFDRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hCLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoQixJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDakI7UUFDSCxDQUFDLENBQUMsdUJBQXVCLENBQUE7QUFDN0IsQ0FBQyxDQUFBO0FBc0NELElBQU0sU0FBUyxHQUFHLFVBQUMsS0FBWTtJQUM3QixJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxJQUFJLFlBQVksQ0FBQTtJQUN6QyxJQUFNLFdBQVcsR0FBRyxVQUFDLEdBQVE7UUFDM0IsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFBO1FBQ2xCLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDcEIsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3BCLE9BQU87Z0JBQ0w7b0JBQ0UsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtvQkFDdkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtpQkFDeEI7Z0JBQ0Q7b0JBQ0UsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtvQkFDdkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtpQkFDeEI7Z0JBQ0Q7b0JBQ0UsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtvQkFDdkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtpQkFDeEI7Z0JBQ0Q7b0JBQ0UsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtvQkFDdkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtpQkFDeEI7YUFDRixDQUFBO1NBQ0Y7UUFDRCxPQUFPLEdBQUcsQ0FBQTtJQUNaLENBQUMsQ0FBQTtJQUNELElBQU0sVUFBVSxHQUFHLFVBQUMsVUFBc0I7UUFDeEMsT0FBTztZQUNMLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFO2dCQUNSLElBQUksRUFBRSxTQUFTO2dCQUNmLFdBQVcsRUFBRTtvQkFDWCxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQVUsSUFBSyxPQUFBO3dCQUM5QyxLQUFLLENBQUMsR0FBRzt3QkFDVCxLQUFLLENBQUMsR0FBRztxQkFDVixFQUgrQyxDQUcvQyxDQUFDO2lCQUNIO2FBQ0Y7WUFDRCxVQUFVLEVBQUUsRUFBRTtZQUNkLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTtTQUNsQixDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSwyQkFBMkIsR0FBRyxVQUFPLEtBQWE7Ozs7d0JBQzFDLHFCQUFNLEtBQUssQ0FDckIsOENBQXVDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFFLENBQ25FLEVBQUE7O29CQUZLLEdBQUcsR0FBRyxTQUVYO29CQUNNLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTt3QkFBdkIsc0JBQU8sU0FBZ0IsRUFBQTs7O1NBQ3hCLENBQUE7SUFDRCxJQUFNLDRCQUE0QixHQUFHLFVBQU8sVUFBc0I7Ozs7O29CQUNoRSxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUN2QyxzQkFBTyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUE7cUJBQzlCO29CQUNPLEVBQUUsR0FBSyxVQUFVLEdBQWYsQ0FBZTtvQkFDYixxQkFBTSxLQUFLLENBQUMsbUNBQTRCLEVBQUUsQ0FBRSxDQUFDLEVBQUE7O29CQUFuRCxHQUFHLEdBQUcsU0FBNkM7b0JBQzVDLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7b0JBQXZCLElBQUksR0FBRyxTQUFnQjtvQkFDdkIsU0FBUyxHQUFHLGNBQWMsQ0FDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQ3pCLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUMxQyxDQUFBO29CQUNELHNCQUFPOzRCQUNMLElBQUksRUFBRSxTQUFTOzRCQUNmLFFBQVEsRUFBRTtnQ0FDUixJQUFJLEVBQUUsU0FBUztnQ0FDZixXQUFXLEVBQUU7b0NBQ1g7d0NBQ0UsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0NBQ2hDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDO3dDQUNoQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQzt3Q0FDaEMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7cUNBQ2pDO2lDQUNGOzZCQUNGOzRCQUNELFVBQVUsRUFBRSxFQUFFOzRCQUNkLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWTt5QkFDdEIsRUFBQTs7O1NBQ0YsQ0FBQTtJQUNELElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxJQUFhO1FBQ3JDLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxNQUFNO2dCQUNULE9BQU8sR0FBRyxDQUFBO1lBQ1osS0FBSyxLQUFLO2dCQUNSLE9BQU8sR0FBRyxDQUFBO1lBQ1osS0FBSyxVQUFVO2dCQUNiLE9BQU8sR0FBRyxDQUFBO1lBQ1o7Z0JBQ0UsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUE7U0FDdEM7SUFDSCxDQUFDLENBQUE7SUFDRCxJQUFNLFNBQVMsR0FBRyxVQUFPLEtBQWE7Ozs7d0JBQ3hCLHFCQUFPLE1BQWMsQ0FBQyxlQUFlLENBQy9DLG1FQUE0RCxrQkFBa0IsQ0FDNUUsS0FBSyxDQUNOLENBQUUsQ0FDSixFQUFBOztvQkFKSyxHQUFHLEdBQUcsU0FJWDtvQkFDbUIscUJBQU0sR0FBRyxDQUFDLElBQUksRUFBRSxFQUFBOztvQkFBOUIsV0FBVyxHQUFHLFNBQWdCO29CQUNwQyxzQkFBTyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBWTs0QkFDbEMsT0FBTztnQ0FDTCxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTTtnQ0FDekQsSUFBSSxFQUFFLEtBQUssQ0FBQyxZQUFZOzZCQUN6QixDQUFBO3dCQUNILENBQUMsQ0FBQyxFQUFBOzs7U0FDSCxDQUFBO0lBQ0QsSUFBTSxjQUFjLEdBQUcsVUFBQyxXQUFrQjtRQUN4QyxPQUFPLENBQ0wsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVM7WUFDbEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FDdEMsQ0FBQTtJQUNILENBQUMsQ0FBQTtJQUNELElBQU0sVUFBVSxHQUFHLFVBQU8sVUFBc0I7Ozs7O29CQUN4QyxLQUFBLE9BQWEsVUFBVSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUEsRUFBcEMsSUFBSSxRQUFBLEVBQUUsRUFBRSxRQUFBLENBQTRCO29CQUMvQixxQkFBTyxNQUFjLENBQUMsZUFBZSxDQUMvQyx5RUFBa0UsSUFBSSxTQUFHLEVBQUUsdUJBQW9CLENBQ2hHLEVBQUE7O29CQUZLLEdBQUcsR0FBRyxTQUVYO29CQUNhLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7b0JBQXhCLElBQUksR0FBRyxDQUFDLFNBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLGdCQUFnQixHQUFHLEVBQUUsQ0FBQTtvQkFDckIsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUM1RCxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ25FLElBQ0UsQ0FBQyxnQkFBZ0IsSUFBSSxnQkFBZ0I7d0JBQ25DLGlCQUFpQixJQUFJLGdCQUFnQixDQUFDO3dCQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUN0Qzt3QkFDTSxTQUFTLEdBQUcsY0FBYyxDQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFDeEIsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQ3pDLENBQUE7d0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFBO3dCQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUE7d0JBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQTt3QkFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFBO3FCQUNyQztvQkFDRCxzQkFBTzs0QkFDTCxJQUFJLEVBQUUsU0FBUzs0QkFDZixRQUFRLEVBQUU7Z0NBQ1IsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsV0FBVyxFQUFFO29DQUNYO3dDQUNFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dDQUMxQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDMUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQzFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FDQUMzQztpQ0FDRjs2QkFDRjs0QkFDRCxVQUFVLEVBQUUsRUFBRTs0QkFDZCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVk7eUJBQ3RCLEVBQUE7OztTQUNGLENBQUE7SUFDRCxPQUFPLENBQ0wsMENBQ0csZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ3JELG9CQUFDLE9BQU8sSUFDTixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFDbEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQ3hCLFNBQVMsRUFBRSxTQUFTLEVBQ3BCLFVBQVUsRUFBRSxVQUFVLEVBQ3RCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVyxFQUM5QixjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFDcEMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEdBQ3RCLENBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FDRixvQkFBQyxPQUFPLElBQ04sS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQ2xCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUN4QixTQUFTLEVBQUUsMkJBQTJCLEVBQ3RDLFVBQVUsRUFBRSw0QkFBNEIsRUFDeEMsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQzlCLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUNwQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FDdEIsQ0FDSCxDQUNBLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELGVBQWUsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBUZXh0RmllbGRQcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgZGVmYXVsdEZldGNoIGZyb20gJy4uL3V0aWxzL2ZldGNoJ1xuaW1wb3J0IEtleXdvcmQgZnJvbSAnLi9rZXl3b3JkJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmV4cG9ydCBjb25zdCBnZXRMYXJnZXN0QmJveCA9IChcbiAgcG9seWdvbkNvb3JkaW5hdGVzOiBhbnlbXSxcbiAgaXNNdWx0aVBvbHlnb246IGJvb2xlYW5cbikgPT4ge1xuICBsZXQgZmluYWxNYXggPSB7IHg6IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLCB5OiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiB9XG4gIGxldCBmaW5hbE1pbiA9IHsgeDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIHk6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIH1cbiAgY29uc3QgYm91bmRpbmdCb3hMaW1pdCA9IDc1XG4gIGxldCBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveCA9IHtcbiAgICBtYXhYOiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUixcbiAgICBtaW5YOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUixcbiAgICBtYXhZOiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUixcbiAgICBtaW5ZOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUixcbiAgfVxuICBsZXQgbWF4QXJlYSA9IC0xXG4gIGxldCBjdXJyZW50QXJlYSA9IC0xXG4gIGxldCBjdXJyZW50TWF4OiB7XG4gICAgeDogbnVtYmVyXG4gICAgeTogbnVtYmVyXG4gIH1cbiAgbGV0IGN1cnJlbnRNaW46IHtcbiAgICB4OiBudW1iZXJcbiAgICB5OiBudW1iZXJcbiAgfVxuICBwb2x5Z29uQ29vcmRpbmF0ZXMubWFwKChyb3dDb29yZGluYXRlcykgPT4ge1xuICAgIGN1cnJlbnRNYXggPSB7IHg6IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLCB5OiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiB9XG4gICAgY3VycmVudE1pbiA9IHsgeDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIHk6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIH1cbiAgICBpZiAoaXNNdWx0aVBvbHlnb24pIHtcbiAgICAgIHJvd0Nvb3JkaW5hdGVzWzBdLm1hcCgoY29vcmRpbmF0ZXM6IGFueSkgPT4ge1xuICAgICAgICBjdXJyZW50TWF4LnggPSBNYXRoLm1heChjb29yZGluYXRlc1swXSwgY3VycmVudE1heC54KVxuICAgICAgICBjdXJyZW50TWF4LnkgPSBNYXRoLm1heChjb29yZGluYXRlc1sxXSwgY3VycmVudE1heC55KVxuICAgICAgICBjdXJyZW50TWluLnggPSBNYXRoLm1pbihjb29yZGluYXRlc1swXSwgY3VycmVudE1pbi54KVxuICAgICAgICBjdXJyZW50TWluLnkgPSBNYXRoLm1pbihjb29yZGluYXRlc1sxXSwgY3VycmVudE1pbi55KVxuICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhYID0gTWF0aC5tYXgoXG4gICAgICAgICAgY29vcmRpbmF0ZXNbMF0sXG4gICAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWF4WFxuICAgICAgICApXG4gICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFkgPSBNYXRoLm1heChcbiAgICAgICAgICBjb29yZGluYXRlc1sxXSxcbiAgICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhZXG4gICAgICAgIClcbiAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWCA9IE1hdGgubWluKFxuICAgICAgICAgIGNvb3JkaW5hdGVzWzBdLFxuICAgICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1pblhcbiAgICAgICAgKVxuICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5ZID0gTWF0aC5taW4oXG4gICAgICAgICAgY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWVxuICAgICAgICApXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICByb3dDb29yZGluYXRlcy5tYXAoKGNvb3JkaW5hdGVzOiBhbnkpID0+IHtcbiAgICAgICAgY3VycmVudE1heC54ID0gTWF0aC5tYXgoY29vcmRpbmF0ZXNbMF0sIGN1cnJlbnRNYXgueClcbiAgICAgICAgY3VycmVudE1heC55ID0gTWF0aC5tYXgoY29vcmRpbmF0ZXNbMV0sIGN1cnJlbnRNYXgueSlcbiAgICAgICAgY3VycmVudE1pbi54ID0gTWF0aC5taW4oY29vcmRpbmF0ZXNbMF0sIGN1cnJlbnRNaW4ueClcbiAgICAgICAgY3VycmVudE1pbi55ID0gTWF0aC5taW4oY29vcmRpbmF0ZXNbMV0sIGN1cnJlbnRNaW4ueSlcbiAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWF4WCA9IE1hdGgubWF4KFxuICAgICAgICAgIGNvb3JkaW5hdGVzWzBdLFxuICAgICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFhcbiAgICAgICAgKVxuICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhZID0gTWF0aC5tYXgoXG4gICAgICAgICAgY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWF4WVxuICAgICAgICApXG4gICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1pblggPSBNYXRoLm1pbihcbiAgICAgICAgICBjb29yZGluYXRlc1swXSxcbiAgICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5YXG4gICAgICAgIClcbiAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWSA9IE1hdGgubWluKFxuICAgICAgICAgIGNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1pbllcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICB9XG4gICAgY3VycmVudEFyZWEgPSAoY3VycmVudE1heC54IC0gY3VycmVudE1pbi54KSAqIChjdXJyZW50TWF4LnkgLSBjdXJyZW50TWluLnkpXG4gICAgaWYgKGN1cnJlbnRBcmVhID4gbWF4QXJlYSkge1xuICAgICAgbWF4QXJlYSA9IGN1cnJlbnRBcmVhXG4gICAgICBmaW5hbE1heCA9IGN1cnJlbnRNYXhcbiAgICAgIGZpbmFsTWluID0gY3VycmVudE1pblxuICAgIH1cbiAgfSlcbiAgY29uc3QgZW5jb21wYXNzaW5nQm91bmRpbmdCb3hIZWlnaHQgPVxuICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFkgLSBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5ZXG4gIGNvbnN0IGVuY29tcGFzc2luZ0JvdW5kaW5nQm94V2lkdGggPVxuICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFggLSBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5YXG4gIHJldHVybiBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveFdpZHRoID49IGJvdW5kaW5nQm94TGltaXQgfHxcbiAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveEhlaWdodCA+PSBib3VuZGluZ0JveExpbWl0XG4gICAgPyB7XG4gICAgICAgIG1heFg6IGZpbmFsTWF4LngsXG4gICAgICAgIG1pblg6IGZpbmFsTWluLngsXG4gICAgICAgIG1heFk6IGZpbmFsTWF4LnksXG4gICAgICAgIG1pblk6IGZpbmFsTWluLnksXG4gICAgICB9XG4gICAgOiBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveFxufVxudHlwZSBQcm9wcyA9IHtcbiAgdmFsdWU/OiBzdHJpbmdcbiAgc2V0U3RhdGU6IGFueVxuICBmZXRjaD86IGFueVxuICBwbGFjZWhvbGRlcj86IHN0cmluZ1xuICBsb2FkaW5nTWVzc2FnZT86IHN0cmluZ1xuICB2YXJpYW50PzogVGV4dEZpZWxkUHJvcHNbJ3ZhcmlhbnQnXVxufVxudHlwZSBQbGFjZSA9IHtcbiAgYm91bmRpbmdib3g6IHN0cmluZ1tdXG4gIGNsYXNzOiBzdHJpbmdcbiAgZGlzcGxheV9uYW1lOiBzdHJpbmdcbiAgaW1wb3J0YW5jZTogbnVtYmVyXG4gIGxhdDogc3RyaW5nXG4gIGxpY2VuY2U6IHN0cmluZ1xuICBsb246IHN0cmluZ1xuICBvc21faWQ6IG51bWJlclxuICBvc21fdHlwZTogT3NtVHlwZVxuICBwbGFjZV9pZDogbnVtYmVyXG4gIHR5cGU6IHN0cmluZ1xufVxudHlwZSBPc21UeXBlID0gJ25vZGUnIHwgJ3dheScgfCAncmVsYXRpb24nXG5leHBvcnQgdHlwZSBTdWdnZXN0aW9uID0ge1xuICBpZDogc3RyaW5nXG4gIG5hbWU6IHN0cmluZ1xuICBnZW8/OiBhbnlcbiAgZXh0ZW5zaW9uR2VvPzogR2VvRmVhdHVyZVxufVxuZXhwb3J0IHR5cGUgR2VvRmVhdHVyZSA9IHtcbiAgdHlwZTogc3RyaW5nXG4gIGdlb21ldHJ5OiB7XG4gICAgdHlwZTogc3RyaW5nXG4gICAgY29vcmRpbmF0ZXM6IGFueVtdW11bXVxuICB9XG4gIHByb3BlcnRpZXM/OiBhbnlcbiAgaWQ6IHN0cmluZ1xufVxuY29uc3QgR2F6ZXR0ZWVyID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCBmZXRjaCA9IHByb3BzLmZldGNoIHx8IGRlZmF1bHRGZXRjaFxuICBjb25zdCBleHBhbmRQb2ludCA9IChnZW86IGFueSkgPT4ge1xuICAgIGNvbnN0IG9mZnNldCA9IDAuMVxuICAgIGlmIChnZW8ubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBwb2ludCA9IGdlb1swXVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIGxhdDogcG9pbnQubGF0ICsgb2Zmc2V0LFxuICAgICAgICAgIGxvbjogcG9pbnQubG9uICsgb2Zmc2V0LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGF0OiBwb2ludC5sYXQgKyBvZmZzZXQsXG4gICAgICAgICAgbG9uOiBwb2ludC5sb24gLSBvZmZzZXQsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYXQ6IHBvaW50LmxhdCAtIG9mZnNldCxcbiAgICAgICAgICBsb246IHBvaW50LmxvbiAtIG9mZnNldCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhdDogcG9pbnQubGF0IC0gb2Zmc2V0LFxuICAgICAgICAgIGxvbjogcG9pbnQubG9uICsgb2Zmc2V0LFxuICAgICAgICB9LFxuICAgICAgXVxuICAgIH1cbiAgICByZXR1cm4gZ2VvXG4gIH1cbiAgY29uc3QgZXh0cmFjdEdlbyA9IChzdWdnZXN0aW9uOiBTdWdnZXN0aW9uKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICBleHBhbmRQb2ludChzdWdnZXN0aW9uLmdlbykubWFwKChjb29yZDogYW55KSA9PiBbXG4gICAgICAgICAgICBjb29yZC5sb24sXG4gICAgICAgICAgICBjb29yZC5sYXQsXG4gICAgICAgICAgXSksXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgcHJvcGVydGllczoge30sXG4gICAgICBpZDogc3VnZ2VzdGlvbi5pZCxcbiAgICB9XG4gIH1cbiAgY29uc3Qgc3VnZ2VzdGVyV2l0aExpdGVyYWxTdXBwb3J0ID0gYXN5bmMgKGlucHV0OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcbiAgICAgIGAuL2ludGVybmFsL2dlb2ZlYXR1cmUvc3VnZ2VzdGlvbnM/cT0ke2VuY29kZVVSSUNvbXBvbmVudChpbnB1dCl9YFxuICAgIClcbiAgICByZXR1cm4gYXdhaXQgcmVzLmpzb24oKVxuICB9XG4gIGNvbnN0IGdlb2ZlYXR1cmVXaXRoTGl0ZXJhbFN1cHBvcnQgPSBhc3luYyAoc3VnZ2VzdGlvbjogU3VnZ2VzdGlvbikgPT4ge1xuICAgIGlmIChzdWdnZXN0aW9uLmlkLnN0YXJ0c1dpdGgoJ0xJVEVSQUwnKSkge1xuICAgICAgcmV0dXJuIGV4dHJhY3RHZW8oc3VnZ2VzdGlvbilcbiAgICB9XG4gICAgY29uc3QgeyBpZCB9ID0gc3VnZ2VzdGlvblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAuL2ludGVybmFsL2dlb2ZlYXR1cmU/aWQ9JHtpZH1gKVxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpXG4gICAgY29uc3QgZmluYWxBcmVhID0gZ2V0TGFyZ2VzdEJib3goXG4gICAgICBkYXRhLmdlb21ldHJ5LmNvb3JkaW5hdGVzLFxuICAgICAgaXNNdWx0aVBvbHlnb24oZGF0YS5nZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICApXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICBbXG4gICAgICAgICAgICBbZmluYWxBcmVhLm1pblgsIGZpbmFsQXJlYS5taW5ZXSxcbiAgICAgICAgICAgIFtmaW5hbEFyZWEubWF4WCwgZmluYWxBcmVhLm1pblldLFxuICAgICAgICAgICAgW2ZpbmFsQXJlYS5tYXhYLCBmaW5hbEFyZWEubWF4WV0sXG4gICAgICAgICAgICBbZmluYWxBcmVhLm1pblgsIGZpbmFsQXJlYS5tYXhZXSxcbiAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgaWQ6IGRhdGEuZGlzcGxheV9uYW1lLFxuICAgIH1cbiAgfVxuICBjb25zdCBnZXRPc21UeXBlU3ltYm9sID0gKHR5cGU6IE9zbVR5cGUpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ25vZGUnOlxuICAgICAgICByZXR1cm4gJ04nXG4gICAgICBjYXNlICd3YXknOlxuICAgICAgICByZXR1cm4gJ1cnXG4gICAgICBjYXNlICdyZWxhdGlvbic6XG4gICAgICAgIHJldHVybiAnUidcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93ICdVbmV4cGVjdGVkIE9TTSB0eXBlICcgKyB0eXBlXG4gICAgfVxuICB9XG4gIGNvbnN0IHN1Z2dlc3RlciA9IGFzeW5jIChpbnB1dDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgKHdpbmRvdyBhcyBhbnkpLl9fZ2xvYmFsX19mZXRjaChcbiAgICAgIGBodHRwczovL25vbWluYXRpbS5vcGVuc3RyZWV0bWFwLm9yZy9zZWFyY2g/Zm9ybWF0PWpzb24mcT0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgaW5wdXRcbiAgICAgICl9YFxuICAgIClcbiAgICBjb25zdCBzdWdnZXN0aW9ucyA9IGF3YWl0IHJlcy5qc29uKClcbiAgICByZXR1cm4gc3VnZ2VzdGlvbnMubWFwKChwbGFjZTogUGxhY2UpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBnZXRPc21UeXBlU3ltYm9sKHBsYWNlLm9zbV90eXBlKSArICc6JyArIHBsYWNlLm9zbV9pZCxcbiAgICAgICAgbmFtZTogcGxhY2UuZGlzcGxheV9uYW1lLFxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgY29uc3QgaXNNdWx0aVBvbHlnb24gPSAoY29vcmRpbmF0ZXM6IGFueVtdKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNvb3JkaW5hdGVzWzBdWzBdWzBdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIGNvb3JkaW5hdGVzWzBdWzBdWzBdWzBdICE9PSB1bmRlZmluZWRcbiAgICApXG4gIH1cbiAgY29uc3QgZ2VvZmVhdHVyZSA9IGFzeW5jIChzdWdnZXN0aW9uOiBTdWdnZXN0aW9uKSA9PiB7XG4gICAgY29uc3QgW3R5cGUsIGlkXSA9IHN1Z2dlc3Rpb24uaWQuc3BsaXQoJzonKVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5fX2dsb2JhbF9fZmV0Y2goXG4gICAgICBgaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvbG9va3VwP2Zvcm1hdD1qc29uJm9zbV9pZHM9JHt0eXBlfSR7aWR9JnBvbHlnb25fZ2VvanNvbj0xYFxuICAgIClcbiAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkpWzBdXG4gICAgY29uc3QgYm91bmRpbmdCb3hMaW1pdCA9IDc1XG4gICAgY29uc3QgYm91bmRpbmdCb3hXaWR0aCA9IGRhdGEuYm91bmRpbmdib3hbM10gLSBkYXRhLmJvdW5kaW5nYm94WzJdXG4gICAgY29uc3QgYm91bmRpbmdCb3hIZWlnaHQgPSBkYXRhLmJvdW5kaW5nYm94WzFdIC0gZGF0YS5ib3VuZGluZ2JveFswXVxuICAgIGlmIChcbiAgICAgIChib3VuZGluZ0JveFdpZHRoID49IGJvdW5kaW5nQm94TGltaXQgfHxcbiAgICAgICAgYm91bmRpbmdCb3hIZWlnaHQgPj0gYm91bmRpbmdCb3hMaW1pdCkgJiZcbiAgICAgIE9iamVjdC5rZXlzKGRhdGEuYWRkcmVzcykubGVuZ3RoID09PSAyXG4gICAgKSB7XG4gICAgICBjb25zdCBmaW5hbEFyZWEgPSBnZXRMYXJnZXN0QmJveChcbiAgICAgICAgZGF0YS5nZW9qc29uLmNvb3JkaW5hdGVzLFxuICAgICAgICBpc011bHRpUG9seWdvbihkYXRhLmdlb2pzb24uY29vcmRpbmF0ZXMpXG4gICAgICApXG4gICAgICBkYXRhLmJvdW5kaW5nYm94WzBdID0gZmluYWxBcmVhLm1pbllcbiAgICAgIGRhdGEuYm91bmRpbmdib3hbMV0gPSBmaW5hbEFyZWEubWF4WVxuICAgICAgZGF0YS5ib3VuZGluZ2JveFsyXSA9IGZpbmFsQXJlYS5taW5YXG4gICAgICBkYXRhLmJvdW5kaW5nYm94WzNdID0gZmluYWxBcmVhLm1heFhcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICBbXG4gICAgICAgICAgICBbZGF0YS5ib3VuZGluZ2JveFsyXSwgZGF0YS5ib3VuZGluZ2JveFswXV0sXG4gICAgICAgICAgICBbZGF0YS5ib3VuZGluZ2JveFszXSwgZGF0YS5ib3VuZGluZ2JveFswXV0sXG4gICAgICAgICAgICBbZGF0YS5ib3VuZGluZ2JveFszXSwgZGF0YS5ib3VuZGluZ2JveFsxXV0sXG4gICAgICAgICAgICBbZGF0YS5ib3VuZGluZ2JveFsyXSwgZGF0YS5ib3VuZGluZ2JveFsxXV0sXG4gICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICAgIGlkOiBkYXRhLmRpc3BsYXlfbmFtZSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge1N0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRPbmxpbmVHYXpldHRlZXIoKSA/IChcbiAgICAgICAgPEtleXdvcmRcbiAgICAgICAgICB2YWx1ZT17cHJvcHMudmFsdWV9XG4gICAgICAgICAgc2V0U3RhdGU9e3Byb3BzLnNldFN0YXRlfVxuICAgICAgICAgIHN1Z2dlc3Rlcj17c3VnZ2VzdGVyfVxuICAgICAgICAgIGdlb2ZlYXR1cmU9e2dlb2ZlYXR1cmV9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3Byb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIGxvYWRpbmdNZXNzYWdlPXtwcm9wcy5sb2FkaW5nTWVzc2FnZX1cbiAgICAgICAgICB2YXJpYW50PXtwcm9wcy52YXJpYW50fVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPEtleXdvcmRcbiAgICAgICAgICB2YWx1ZT17cHJvcHMudmFsdWV9XG4gICAgICAgICAgc2V0U3RhdGU9e3Byb3BzLnNldFN0YXRlfVxuICAgICAgICAgIHN1Z2dlc3Rlcj17c3VnZ2VzdGVyV2l0aExpdGVyYWxTdXBwb3J0fVxuICAgICAgICAgIGdlb2ZlYXR1cmU9e2dlb2ZlYXR1cmVXaXRoTGl0ZXJhbFN1cHBvcnR9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3Byb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIGxvYWRpbmdNZXNzYWdlPXtwcm9wcy5sb2FkaW5nTWVzc2FnZX1cbiAgICAgICAgICB2YXJpYW50PXtwcm9wcy52YXJpYW50fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgR2F6ZXR0ZWVyXG4iXX0=