import { __awaiter, __generator, __read } from "tslib";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsx(_Fragment, { children: StartupDataStore.Configuration.getOnlineGazetteer() ? (_jsx(Keyword, { value: props.value, setState: props.setState, suggester: suggester, geofeature: geofeature, placeholder: props.placeholder, loadingMessage: props.loadingMessage, variant: props.variant })) : (_jsx(Keyword, { value: props.value, setState: props.setState, suggester: suggesterWithLiteralSupport, geofeature: geofeatureWithLiteralSupport, placeholder: props.placeholder, loadingMessage: props.loadingMessage, variant: props.variant })) }));
};
export default Gazetteer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F6ZXR0ZWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9nYXpldHRlZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBZ0JBLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFBO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQTtBQUMvQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsVUFDNUIsa0JBQXlCLEVBQ3pCLGNBQXVCO0lBRXZCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUE7SUFDekUsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtJQUN6RSxJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQTtJQUMzQixJQUFJLHVCQUF1QixHQUFHO1FBQzVCLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCO1FBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCO1FBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCO1FBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCO0tBQzlCLENBQUE7SUFDRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNoQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNwQixJQUFJLFVBR0gsQ0FBQTtJQUNELElBQUksVUFHSCxDQUFBO0lBQ0Qsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQUMsY0FBYztRQUNwQyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtRQUN2RSxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtRQUN2RSxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ25CLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxXQUFnQjtnQkFDckMsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNyRCxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDckQsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO2dCQUNELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO2dCQUNELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO2dCQUNELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO2FBQU0sQ0FBQztZQUNOLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQyxXQUFnQjtnQkFDbEMsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNyRCxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDckQsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO2dCQUNELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO2dCQUNELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO2dCQUNELHVCQUF1QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQ2QsdUJBQXVCLENBQUMsSUFBSSxDQUM3QixDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsV0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzRSxJQUFJLFdBQVcsR0FBRyxPQUFPLEVBQUUsQ0FBQztZQUMxQixPQUFPLEdBQUcsV0FBVyxDQUFBO1lBQ3JCLFFBQVEsR0FBRyxVQUFVLENBQUE7WUFDckIsUUFBUSxHQUFHLFVBQVUsQ0FBQTtRQUN2QixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDRixJQUFNLDZCQUE2QixHQUNqQyx1QkFBdUIsQ0FBQyxJQUFJLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFBO0lBQzdELElBQU0sNEJBQTRCLEdBQ2hDLHVCQUF1QixDQUFDLElBQUksR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUE7SUFDN0QsT0FBTyw0QkFBNEIsSUFBSSxnQkFBZ0I7UUFDckQsNkJBQTZCLElBQUksZ0JBQWdCO1FBQ2pELENBQUMsQ0FBQztZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoQixJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hCLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNqQjtRQUNILENBQUMsQ0FBQyx1QkFBdUIsQ0FBQTtBQUM3QixDQUFDLENBQUE7QUFzQ0QsSUFBTSxTQUFTLEdBQUcsVUFBQyxLQUFZO0lBQzdCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFBO0lBQ3pDLElBQU0sV0FBVyxHQUFHLFVBQUMsR0FBUTtRQUMzQixJQUFNLE1BQU0sR0FBRyxHQUFHLENBQUE7UUFDbEIsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3JCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNwQixPQUFPO2dCQUNMO29CQUNFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07b0JBQ3ZCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07aUJBQ3hCO2dCQUNEO29CQUNFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07b0JBQ3ZCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07aUJBQ3hCO2dCQUNEO29CQUNFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07b0JBQ3ZCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07aUJBQ3hCO2dCQUNEO29CQUNFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07b0JBQ3ZCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07aUJBQ3hCO2FBQ0YsQ0FBQTtRQUNILENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQTtJQUNaLENBQUMsQ0FBQTtJQUNELElBQU0sVUFBVSxHQUFHLFVBQUMsVUFBc0I7UUFDeEMsT0FBTztZQUNMLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFO2dCQUNSLElBQUksRUFBRSxTQUFTO2dCQUNmLFdBQVcsRUFBRTtvQkFDWCxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQVUsSUFBSyxPQUFBO3dCQUM5QyxLQUFLLENBQUMsR0FBRzt3QkFDVCxLQUFLLENBQUMsR0FBRztxQkFDVixFQUgrQyxDQUcvQyxDQUFDO2lCQUNIO2FBQ0Y7WUFDRCxVQUFVLEVBQUUsRUFBRTtZQUNkLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTtTQUNsQixDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSwyQkFBMkIsR0FBRyxVQUFPLEtBQWE7Ozs7d0JBQzFDLHFCQUFNLEtBQUssQ0FDckIsOENBQXVDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFFLENBQ25FLEVBQUE7O29CQUZLLEdBQUcsR0FBRyxTQUVYO29CQUNNLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTt3QkFBdkIsc0JBQU8sU0FBZ0IsRUFBQTs7O1NBQ3hCLENBQUE7SUFDRCxJQUFNLDRCQUE0QixHQUFHLFVBQU8sVUFBc0I7Ozs7O29CQUNoRSxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7d0JBQ3hDLHNCQUFPLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBQTtvQkFDL0IsQ0FBQztvQkFDTyxFQUFFLEdBQUssVUFBVSxHQUFmLENBQWU7b0JBQ2IscUJBQU0sS0FBSyxDQUFDLG1DQUE0QixFQUFFLENBQUUsQ0FBQyxFQUFBOztvQkFBbkQsR0FBRyxHQUFHLFNBQTZDO29CQUM1QyxxQkFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUE7O29CQUF2QixJQUFJLEdBQUcsU0FBZ0I7b0JBQ3ZCLFNBQVMsR0FBRyxjQUFjLENBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUN6QixjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FDMUMsQ0FBQTtvQkFDRCxzQkFBTzs0QkFDTCxJQUFJLEVBQUUsU0FBUzs0QkFDZixRQUFRLEVBQUU7Z0NBQ1IsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsV0FBVyxFQUFFO29DQUNYO3dDQUNFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDO3dDQUNoQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQzt3Q0FDaEMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0NBQ2hDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDO3FDQUNqQztpQ0FDRjs2QkFDRjs0QkFDRCxVQUFVLEVBQUUsRUFBRTs0QkFDZCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVk7eUJBQ3RCLEVBQUE7OztTQUNGLENBQUE7SUFDRCxJQUFNLGdCQUFnQixHQUFHLFVBQUMsSUFBYTtRQUNyQyxRQUFRLElBQUksRUFBRSxDQUFDO1lBQ2IsS0FBSyxNQUFNO2dCQUNULE9BQU8sR0FBRyxDQUFBO1lBQ1osS0FBSyxLQUFLO2dCQUNSLE9BQU8sR0FBRyxDQUFBO1lBQ1osS0FBSyxVQUFVO2dCQUNiLE9BQU8sR0FBRyxDQUFBO1lBQ1o7Z0JBQ0UsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUE7UUFDdkMsQ0FBQztJQUNILENBQUMsQ0FBQTtJQUNELElBQU0sU0FBUyxHQUFHLFVBQU8sS0FBYTs7Ozt3QkFDeEIscUJBQU8sTUFBYyxDQUFDLGVBQWUsQ0FDL0MsbUVBQTRELGtCQUFrQixDQUM1RSxLQUFLLENBQ04sQ0FBRSxDQUNKLEVBQUE7O29CQUpLLEdBQUcsR0FBRyxTQUlYO29CQUNtQixxQkFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUE7O29CQUE5QixXQUFXLEdBQUcsU0FBZ0I7b0JBQ3BDLHNCQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFZOzRCQUNsQyxPQUFPO2dDQUNMLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNO2dDQUN6RCxJQUFJLEVBQUUsS0FBSyxDQUFDLFlBQVk7NkJBQ3pCLENBQUE7d0JBQ0gsQ0FBQyxDQUFDLEVBQUE7OztTQUNILENBQUE7SUFDRCxJQUFNLGNBQWMsR0FBRyxVQUFDLFdBQWtCO1FBQ3hDLE9BQU8sQ0FDTCxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUztZQUNsQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUN0QyxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSxVQUFVLEdBQUcsVUFBTyxVQUFzQjs7Ozs7b0JBQ3hDLEtBQUEsT0FBYSxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSxFQUFwQyxJQUFJLFFBQUEsRUFBRSxFQUFFLFFBQUEsQ0FBNEI7b0JBQy9CLHFCQUFPLE1BQWMsQ0FBQyxlQUFlLENBQy9DLHlFQUFrRSxJQUFJLFNBQUcsRUFBRSx1QkFBb0IsQ0FDaEcsRUFBQTs7b0JBRkssR0FBRyxHQUFHLFNBRVg7b0JBQ2EscUJBQU0sR0FBRyxDQUFDLElBQUksRUFBRSxFQUFBOztvQkFBeEIsSUFBSSxHQUFHLENBQUMsU0FBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO29CQUNyQixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQzVELGlCQUFpQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtvQkFDbkUsSUFDRSxDQUFDLGdCQUFnQixJQUFJLGdCQUFnQjt3QkFDbkMsaUJBQWlCLElBQUksZ0JBQWdCLENBQUM7d0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQ3RDLENBQUM7d0JBQ0ssU0FBUyxHQUFHLGNBQWMsQ0FDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQ3hCLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUN6QyxDQUFBO3dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQTt3QkFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFBO3dCQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUE7d0JBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQTtvQkFDdEMsQ0FBQztvQkFDRCxzQkFBTzs0QkFDTCxJQUFJLEVBQUUsU0FBUzs0QkFDZixRQUFRLEVBQUU7Z0NBQ1IsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsV0FBVyxFQUFFO29DQUNYO3dDQUNFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dDQUMxQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDMUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQzFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FDQUMzQztpQ0FDRjs2QkFDRjs0QkFDRCxVQUFVLEVBQUUsRUFBRTs0QkFDZCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVk7eUJBQ3RCLEVBQUE7OztTQUNGLENBQUE7SUFDRCxPQUFPLENBQ0wsNEJBQ0csZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ3JELEtBQUMsT0FBTyxJQUNOLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUNsQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFDeEIsU0FBUyxFQUFFLFNBQVMsRUFDcEIsVUFBVSxFQUFFLFVBQVUsRUFDdEIsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQzlCLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUNwQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FDdEIsQ0FDSCxDQUFDLENBQUMsQ0FBQyxDQUNGLEtBQUMsT0FBTyxJQUNOLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUNsQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFDeEIsU0FBUyxFQUFFLDJCQUEyQixFQUN0QyxVQUFVLEVBQUUsNEJBQTRCLEVBQ3hDLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVyxFQUM5QixjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFDcEMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEdBQ3RCLENBQ0gsR0FDQSxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgVGV4dEZpZWxkUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcblxuaW1wb3J0IGRlZmF1bHRGZXRjaCBmcm9tICcuLi91dGlscy9mZXRjaCdcbmltcG9ydCBLZXl3b3JkIGZyb20gJy4va2V5d29yZCdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5leHBvcnQgY29uc3QgZ2V0TGFyZ2VzdEJib3ggPSAoXG4gIHBvbHlnb25Db29yZGluYXRlczogYW55W10sXG4gIGlzTXVsdGlQb2x5Z29uOiBib29sZWFuXG4pID0+IHtcbiAgbGV0IGZpbmFsTWF4ID0geyB4OiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgeTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIgfVxuICBsZXQgZmluYWxNaW4gPSB7IHg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLCB5OiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB9XG4gIGNvbnN0IGJvdW5kaW5nQm94TGltaXQgPSA3NVxuICBsZXQgZW5jb21wYXNzaW5nQm91bmRpbmdCb3ggPSB7XG4gICAgbWF4WDogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgbWluWDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG4gICAgbWF4WTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgbWluWTogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG4gIH1cbiAgbGV0IG1heEFyZWEgPSAtMVxuICBsZXQgY3VycmVudEFyZWEgPSAtMVxuICBsZXQgY3VycmVudE1heDoge1xuICAgIHg6IG51bWJlclxuICAgIHk6IG51bWJlclxuICB9XG4gIGxldCBjdXJyZW50TWluOiB7XG4gICAgeDogbnVtYmVyXG4gICAgeTogbnVtYmVyXG4gIH1cbiAgcG9seWdvbkNvb3JkaW5hdGVzLm1hcCgocm93Q29vcmRpbmF0ZXMpID0+IHtcbiAgICBjdXJyZW50TWF4ID0geyB4OiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgeTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIgfVxuICAgIGN1cnJlbnRNaW4gPSB7IHg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLCB5OiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB9XG4gICAgaWYgKGlzTXVsdGlQb2x5Z29uKSB7XG4gICAgICByb3dDb29yZGluYXRlc1swXS5tYXAoKGNvb3JkaW5hdGVzOiBhbnkpID0+IHtcbiAgICAgICAgY3VycmVudE1heC54ID0gTWF0aC5tYXgoY29vcmRpbmF0ZXNbMF0sIGN1cnJlbnRNYXgueClcbiAgICAgICAgY3VycmVudE1heC55ID0gTWF0aC5tYXgoY29vcmRpbmF0ZXNbMV0sIGN1cnJlbnRNYXgueSlcbiAgICAgICAgY3VycmVudE1pbi54ID0gTWF0aC5taW4oY29vcmRpbmF0ZXNbMF0sIGN1cnJlbnRNaW4ueClcbiAgICAgICAgY3VycmVudE1pbi55ID0gTWF0aC5taW4oY29vcmRpbmF0ZXNbMV0sIGN1cnJlbnRNaW4ueSlcbiAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWF4WCA9IE1hdGgubWF4KFxuICAgICAgICAgIGNvb3JkaW5hdGVzWzBdLFxuICAgICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFhcbiAgICAgICAgKVxuICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhZID0gTWF0aC5tYXgoXG4gICAgICAgICAgY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWF4WVxuICAgICAgICApXG4gICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1pblggPSBNYXRoLm1pbihcbiAgICAgICAgICBjb29yZGluYXRlc1swXSxcbiAgICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5YXG4gICAgICAgIClcbiAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWSA9IE1hdGgubWluKFxuICAgICAgICAgIGNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1pbllcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcm93Q29vcmRpbmF0ZXMubWFwKChjb29yZGluYXRlczogYW55KSA9PiB7XG4gICAgICAgIGN1cnJlbnRNYXgueCA9IE1hdGgubWF4KGNvb3JkaW5hdGVzWzBdLCBjdXJyZW50TWF4LngpXG4gICAgICAgIGN1cnJlbnRNYXgueSA9IE1hdGgubWF4KGNvb3JkaW5hdGVzWzFdLCBjdXJyZW50TWF4LnkpXG4gICAgICAgIGN1cnJlbnRNaW4ueCA9IE1hdGgubWluKGNvb3JkaW5hdGVzWzBdLCBjdXJyZW50TWluLngpXG4gICAgICAgIGN1cnJlbnRNaW4ueSA9IE1hdGgubWluKGNvb3JkaW5hdGVzWzFdLCBjdXJyZW50TWluLnkpXG4gICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFggPSBNYXRoLm1heChcbiAgICAgICAgICBjb29yZGluYXRlc1swXSxcbiAgICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhYXG4gICAgICAgIClcbiAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWF4WSA9IE1hdGgubWF4KFxuICAgICAgICAgIGNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1heFlcbiAgICAgICAgKVxuICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5YID0gTWF0aC5taW4oXG4gICAgICAgICAgY29vcmRpbmF0ZXNbMF0sXG4gICAgICAgICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWFxuICAgICAgICApXG4gICAgICAgIGVuY29tcGFzc2luZ0JvdW5kaW5nQm94Lm1pblkgPSBNYXRoLm1pbihcbiAgICAgICAgICBjb29yZGluYXRlc1sxXSxcbiAgICAgICAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5taW5ZXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgfVxuICAgIGN1cnJlbnRBcmVhID0gKGN1cnJlbnRNYXgueCAtIGN1cnJlbnRNaW4ueCkgKiAoY3VycmVudE1heC55IC0gY3VycmVudE1pbi55KVxuICAgIGlmIChjdXJyZW50QXJlYSA+IG1heEFyZWEpIHtcbiAgICAgIG1heEFyZWEgPSBjdXJyZW50QXJlYVxuICAgICAgZmluYWxNYXggPSBjdXJyZW50TWF4XG4gICAgICBmaW5hbE1pbiA9IGN1cnJlbnRNaW5cbiAgICB9XG4gIH0pXG4gIGNvbnN0IGVuY29tcGFzc2luZ0JvdW5kaW5nQm94SGVpZ2h0ID1cbiAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhZIC0gZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWVxuICBjb25zdCBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveFdpZHRoID1cbiAgICBlbmNvbXBhc3NpbmdCb3VuZGluZ0JveC5tYXhYIC0gZW5jb21wYXNzaW5nQm91bmRpbmdCb3gubWluWFxuICByZXR1cm4gZW5jb21wYXNzaW5nQm91bmRpbmdCb3hXaWR0aCA+PSBib3VuZGluZ0JveExpbWl0IHx8XG4gICAgZW5jb21wYXNzaW5nQm91bmRpbmdCb3hIZWlnaHQgPj0gYm91bmRpbmdCb3hMaW1pdFxuICAgID8ge1xuICAgICAgICBtYXhYOiBmaW5hbE1heC54LFxuICAgICAgICBtaW5YOiBmaW5hbE1pbi54LFxuICAgICAgICBtYXhZOiBmaW5hbE1heC55LFxuICAgICAgICBtaW5ZOiBmaW5hbE1pbi55LFxuICAgICAgfVxuICAgIDogZW5jb21wYXNzaW5nQm91bmRpbmdCb3hcbn1cbnR5cGUgUHJvcHMgPSB7XG4gIHZhbHVlPzogc3RyaW5nXG4gIHNldFN0YXRlOiBhbnlcbiAgZmV0Y2g/OiBhbnlcbiAgcGxhY2Vob2xkZXI/OiBzdHJpbmdcbiAgbG9hZGluZ01lc3NhZ2U/OiBzdHJpbmdcbiAgdmFyaWFudD86IFRleHRGaWVsZFByb3BzWyd2YXJpYW50J11cbn1cbnR5cGUgUGxhY2UgPSB7XG4gIGJvdW5kaW5nYm94OiBzdHJpbmdbXVxuICBjbGFzczogc3RyaW5nXG4gIGRpc3BsYXlfbmFtZTogc3RyaW5nXG4gIGltcG9ydGFuY2U6IG51bWJlclxuICBsYXQ6IHN0cmluZ1xuICBsaWNlbmNlOiBzdHJpbmdcbiAgbG9uOiBzdHJpbmdcbiAgb3NtX2lkOiBudW1iZXJcbiAgb3NtX3R5cGU6IE9zbVR5cGVcbiAgcGxhY2VfaWQ6IG51bWJlclxuICB0eXBlOiBzdHJpbmdcbn1cbnR5cGUgT3NtVHlwZSA9ICdub2RlJyB8ICd3YXknIHwgJ3JlbGF0aW9uJ1xuZXhwb3J0IHR5cGUgU3VnZ2VzdGlvbiA9IHtcbiAgaWQ6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgZ2VvPzogYW55XG4gIGV4dGVuc2lvbkdlbz86IEdlb0ZlYXR1cmVcbn1cbmV4cG9ydCB0eXBlIEdlb0ZlYXR1cmUgPSB7XG4gIHR5cGU6IHN0cmluZ1xuICBnZW9tZXRyeToge1xuICAgIHR5cGU6IHN0cmluZ1xuICAgIGNvb3JkaW5hdGVzOiBhbnlbXVtdW11cbiAgfVxuICBwcm9wZXJ0aWVzPzogYW55XG4gIGlkOiBzdHJpbmdcbn1cbmNvbnN0IEdhemV0dGVlciA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgZmV0Y2ggPSBwcm9wcy5mZXRjaCB8fCBkZWZhdWx0RmV0Y2hcbiAgY29uc3QgZXhwYW5kUG9pbnQgPSAoZ2VvOiBhbnkpID0+IHtcbiAgICBjb25zdCBvZmZzZXQgPSAwLjFcbiAgICBpZiAoZ2VvLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBnZW9bMF1cbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYXQ6IHBvaW50LmxhdCArIG9mZnNldCxcbiAgICAgICAgICBsb246IHBvaW50LmxvbiArIG9mZnNldCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhdDogcG9pbnQubGF0ICsgb2Zmc2V0LFxuICAgICAgICAgIGxvbjogcG9pbnQubG9uIC0gb2Zmc2V0LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGF0OiBwb2ludC5sYXQgLSBvZmZzZXQsXG4gICAgICAgICAgbG9uOiBwb2ludC5sb24gLSBvZmZzZXQsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYXQ6IHBvaW50LmxhdCAtIG9mZnNldCxcbiAgICAgICAgICBsb246IHBvaW50LmxvbiArIG9mZnNldCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9XG4gICAgcmV0dXJuIGdlb1xuICB9XG4gIGNvbnN0IGV4dHJhY3RHZW8gPSAoc3VnZ2VzdGlvbjogU3VnZ2VzdGlvbikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICBnZW9tZXRyeToge1xuICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgZXhwYW5kUG9pbnQoc3VnZ2VzdGlvbi5nZW8pLm1hcCgoY29vcmQ6IGFueSkgPT4gW1xuICAgICAgICAgICAgY29vcmQubG9uLFxuICAgICAgICAgICAgY29vcmQubGF0LFxuICAgICAgICAgIF0pLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgaWQ6IHN1Z2dlc3Rpb24uaWQsXG4gICAgfVxuICB9XG4gIGNvbnN0IHN1Z2dlc3RlcldpdGhMaXRlcmFsU3VwcG9ydCA9IGFzeW5jIChpbnB1dDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goXG4gICAgICBgLi9pbnRlcm5hbC9nZW9mZWF0dXJlL3N1Z2dlc3Rpb25zP3E9JHtlbmNvZGVVUklDb21wb25lbnQoaW5wdXQpfWBcbiAgICApXG4gICAgcmV0dXJuIGF3YWl0IHJlcy5qc29uKClcbiAgfVxuICBjb25zdCBnZW9mZWF0dXJlV2l0aExpdGVyYWxTdXBwb3J0ID0gYXN5bmMgKHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb24pID0+IHtcbiAgICBpZiAoc3VnZ2VzdGlvbi5pZC5zdGFydHNXaXRoKCdMSVRFUkFMJykpIHtcbiAgICAgIHJldHVybiBleHRyYWN0R2VvKHN1Z2dlc3Rpb24pXG4gICAgfVxuICAgIGNvbnN0IHsgaWQgfSA9IHN1Z2dlc3Rpb25cbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgLi9pbnRlcm5hbC9nZW9mZWF0dXJlP2lkPSR7aWR9YClcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKVxuICAgIGNvbnN0IGZpbmFsQXJlYSA9IGdldExhcmdlc3RCYm94KFxuICAgICAgZGF0YS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgIGlzTXVsdGlQb2x5Z29uKGRhdGEuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpXG4gICAgKVxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICBnZW9tZXRyeToge1xuICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgW1xuICAgICAgICAgICAgW2ZpbmFsQXJlYS5taW5YLCBmaW5hbEFyZWEubWluWV0sXG4gICAgICAgICAgICBbZmluYWxBcmVhLm1heFgsIGZpbmFsQXJlYS5taW5ZXSxcbiAgICAgICAgICAgIFtmaW5hbEFyZWEubWF4WCwgZmluYWxBcmVhLm1heFldLFxuICAgICAgICAgICAgW2ZpbmFsQXJlYS5taW5YLCBmaW5hbEFyZWEubWF4WV0sXG4gICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICAgIGlkOiBkYXRhLmRpc3BsYXlfbmFtZSxcbiAgICB9XG4gIH1cbiAgY29uc3QgZ2V0T3NtVHlwZVN5bWJvbCA9ICh0eXBlOiBPc21UeXBlKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdub2RlJzpcbiAgICAgICAgcmV0dXJuICdOJ1xuICAgICAgY2FzZSAnd2F5JzpcbiAgICAgICAgcmV0dXJuICdXJ1xuICAgICAgY2FzZSAncmVsYXRpb24nOlxuICAgICAgICByZXR1cm4gJ1InXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyAnVW5leHBlY3RlZCBPU00gdHlwZSAnICsgdHlwZVxuICAgIH1cbiAgfVxuICBjb25zdCBzdWdnZXN0ZXIgPSBhc3luYyAoaW5wdXQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5fX2dsb2JhbF9fZmV0Y2goXG4gICAgICBgaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoP2Zvcm1hdD1qc29uJnE9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgIGlucHV0XG4gICAgICApfWBcbiAgICApXG4gICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBhd2FpdCByZXMuanNvbigpXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb25zLm1hcCgocGxhY2U6IFBsYWNlKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogZ2V0T3NtVHlwZVN5bWJvbChwbGFjZS5vc21fdHlwZSkgKyAnOicgKyBwbGFjZS5vc21faWQsXG4gICAgICAgIG5hbWU6IHBsYWNlLmRpc3BsYXlfbmFtZSxcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGNvbnN0IGlzTXVsdGlQb2x5Z29uID0gKGNvb3JkaW5hdGVzOiBhbnlbXSkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICBjb29yZGluYXRlc1swXVswXVswXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBjb29yZGluYXRlc1swXVswXVswXVswXSAhPT0gdW5kZWZpbmVkXG4gICAgKVxuICB9XG4gIGNvbnN0IGdlb2ZlYXR1cmUgPSBhc3luYyAoc3VnZ2VzdGlvbjogU3VnZ2VzdGlvbikgPT4ge1xuICAgIGNvbnN0IFt0eXBlLCBpZF0gPSBzdWdnZXN0aW9uLmlkLnNwbGl0KCc6JylcbiAgICBjb25zdCByZXMgPSBhd2FpdCAod2luZG93IGFzIGFueSkuX19nbG9iYWxfX2ZldGNoKFxuICAgICAgYGh0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL2xvb2t1cD9mb3JtYXQ9anNvbiZvc21faWRzPSR7dHlwZX0ke2lkfSZwb2x5Z29uX2dlb2pzb249MWBcbiAgICApXG4gICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpKVswXVxuICAgIGNvbnN0IGJvdW5kaW5nQm94TGltaXQgPSA3NVxuICAgIGNvbnN0IGJvdW5kaW5nQm94V2lkdGggPSBkYXRhLmJvdW5kaW5nYm94WzNdIC0gZGF0YS5ib3VuZGluZ2JveFsyXVxuICAgIGNvbnN0IGJvdW5kaW5nQm94SGVpZ2h0ID0gZGF0YS5ib3VuZGluZ2JveFsxXSAtIGRhdGEuYm91bmRpbmdib3hbMF1cbiAgICBpZiAoXG4gICAgICAoYm91bmRpbmdCb3hXaWR0aCA+PSBib3VuZGluZ0JveExpbWl0IHx8XG4gICAgICAgIGJvdW5kaW5nQm94SGVpZ2h0ID49IGJvdW5kaW5nQm94TGltaXQpICYmXG4gICAgICBPYmplY3Qua2V5cyhkYXRhLmFkZHJlc3MpLmxlbmd0aCA9PT0gMlxuICAgICkge1xuICAgICAgY29uc3QgZmluYWxBcmVhID0gZ2V0TGFyZ2VzdEJib3goXG4gICAgICAgIGRhdGEuZ2VvanNvbi5jb29yZGluYXRlcyxcbiAgICAgICAgaXNNdWx0aVBvbHlnb24oZGF0YS5nZW9qc29uLmNvb3JkaW5hdGVzKVxuICAgICAgKVxuICAgICAgZGF0YS5ib3VuZGluZ2JveFswXSA9IGZpbmFsQXJlYS5taW5ZXG4gICAgICBkYXRhLmJvdW5kaW5nYm94WzFdID0gZmluYWxBcmVhLm1heFlcbiAgICAgIGRhdGEuYm91bmRpbmdib3hbMl0gPSBmaW5hbEFyZWEubWluWFxuICAgICAgZGF0YS5ib3VuZGluZ2JveFszXSA9IGZpbmFsQXJlYS5tYXhYXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICBnZW9tZXRyeToge1xuICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgW1xuICAgICAgICAgICAgW2RhdGEuYm91bmRpbmdib3hbMl0sIGRhdGEuYm91bmRpbmdib3hbMF1dLFxuICAgICAgICAgICAgW2RhdGEuYm91bmRpbmdib3hbM10sIGRhdGEuYm91bmRpbmdib3hbMF1dLFxuICAgICAgICAgICAgW2RhdGEuYm91bmRpbmdib3hbM10sIGRhdGEuYm91bmRpbmdib3hbMV1dLFxuICAgICAgICAgICAgW2RhdGEuYm91bmRpbmdib3hbMl0sIGRhdGEuYm91bmRpbmdib3hbMV1dLFxuICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgcHJvcGVydGllczoge30sXG4gICAgICBpZDogZGF0YS5kaXNwbGF5X25hbWUsXG4gICAgfVxuICB9XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0T25saW5lR2F6ZXR0ZWVyKCkgPyAoXG4gICAgICAgIDxLZXl3b3JkXG4gICAgICAgICAgdmFsdWU9e3Byb3BzLnZhbHVlfVxuICAgICAgICAgIHNldFN0YXRlPXtwcm9wcy5zZXRTdGF0ZX1cbiAgICAgICAgICBzdWdnZXN0ZXI9e3N1Z2dlc3Rlcn1cbiAgICAgICAgICBnZW9mZWF0dXJlPXtnZW9mZWF0dXJlfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtwcm9wcy5wbGFjZWhvbGRlcn1cbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZT17cHJvcHMubG9hZGluZ01lc3NhZ2V9XG4gICAgICAgICAgdmFyaWFudD17cHJvcHMudmFyaWFudH1cbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxLZXl3b3JkXG4gICAgICAgICAgdmFsdWU9e3Byb3BzLnZhbHVlfVxuICAgICAgICAgIHNldFN0YXRlPXtwcm9wcy5zZXRTdGF0ZX1cbiAgICAgICAgICBzdWdnZXN0ZXI9e3N1Z2dlc3RlcldpdGhMaXRlcmFsU3VwcG9ydH1cbiAgICAgICAgICBnZW9mZWF0dXJlPXtnZW9mZWF0dXJlV2l0aExpdGVyYWxTdXBwb3J0fVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtwcm9wcy5wbGFjZWhvbGRlcn1cbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZT17cHJvcHMubG9hZGluZ01lc3NhZ2V9XG4gICAgICAgICAgdmFyaWFudD17cHJvcHMudmFyaWFudH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IEdhemV0dGVlclxuIl19