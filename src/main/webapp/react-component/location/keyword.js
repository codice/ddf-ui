import { __awaiter, __generator, __read } from "tslib";
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
import * as React from 'react';
import { useState } from 'react';
import ExtensionPoints from '../../extension-points';
import GazetteerAutoComplete from '../auto-complete/gazetteer-autocomplete';
import Polygon from './polygon';
import MultiPolygon from './multipoly';
import defaultFetch from '../utils/fetch';
import useSnack from '../../component/hooks/useSnack';
var Keyword = function (props) {
    var _a = __read(useState(props.value || ''), 2), value = _a[0], setValue = _a[1];
    var _b = __read(useState(false), 2), loading = _b[0], setLoading = _b[1];
    var _c = __read(useState(''), 2), error = _c[0], setError = _c[1];
    var fetch = props.fetch || defaultFetch;
    var addSnack = useSnack();
    var polygon = props.polygon, setBufferState = props.setBufferState, polygonBufferWidth = props.polygonBufferWidth, polygonBufferUnits = props.polygonBufferUnits, polyType = props.polyType;
    var internalSuggester = function (input) { return __awaiter(void 0, void 0, void 0, function () {
        var res, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("./internal/geofeature/suggestions?q=".concat(input))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _a.sent();
                    return [4 /*yield*/, json.filter(function (_a) {
                            var id = _a.id;
                            return !id.startsWith('LITERAL');
                        })];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var suggester = function (input) { return __awaiter(void 0, void 0, void 0, function () {
        var suggestions, extensionSuggestions, propsSuggestions, internalSuggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    suggestions = [];
                    return [4 /*yield*/, ExtensionPoints.suggester(input)];
                case 1:
                    extensionSuggestions = _a.sent();
                    if (extensionSuggestions) {
                        suggestions = suggestions.concat(extensionSuggestions);
                    }
                    if (!props.suggester) return [3 /*break*/, 3];
                    return [4 /*yield*/, props.suggester(input)];
                case 2:
                    propsSuggestions = _a.sent();
                    suggestions = suggestions.concat(propsSuggestions);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, internalSuggester(input)];
                case 4:
                    internalSuggestions = _a.sent();
                    suggestions = suggestions.concat(internalSuggestions);
                    _a.label = 5;
                case 5: return [2 /*return*/, suggestions];
            }
        });
    }); };
    var internalGeofeature = function (_a) {
        var id = _a.id;
        return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("./internal/geofeature?id=".concat(id))];
                    case 1:
                        res = _b.sent();
                        return [4 /*yield*/, res.json()];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    var geofeature = function (suggestion) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!suggestion.extensionGeo) return [3 /*break*/, 1];
                    return [2 /*return*/, suggestion.extensionGeo];
                case 1:
                    if (!props.geofeature) return [3 /*break*/, 3];
                    return [4 /*yield*/, props.geofeature(suggestion)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [4 /*yield*/, internalGeofeature(suggestion)];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var onChange = function (suggestion) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, type, geometry, polygon_1, polygon_2, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!suggestion) {
                        props.setState({ hasKeyword: false, value: '', polygon: [] });
                        setValue('');
                        return [2 /*return*/];
                    }
                    setError('');
                    setValue(suggestion.name);
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, geofeature(suggestion)];
                case 2:
                    _a = _b.sent(), type = _a.type, geometry = _a.geometry;
                    setLoading(false);
                    switch (geometry.type) {
                        case 'Polygon': {
                            polygon_1 = geometry.coordinates[0];
                            props.setState({
                                hasKeyword: true,
                                locationId: undefined,
                                locationType: 'latlon',
                                polygon: polygon_1,
                                polyType: 'polygon',
                                value: suggestion.name,
                            });
                            break;
                        }
                        case 'MultiPolygon': {
                            polygon_2 = geometry.coordinates.map(function (ring) { return ring[0]; });
                            props.setState({
                                hasKeyword: true,
                                locationId: undefined,
                                locationType: 'latlon',
                                polygon: polygon_2,
                                polyType: 'multipolygon',
                                value: suggestion.name,
                            });
                            break;
                        }
                        default: {
                            addSnack('Invalid feature - Unrecognized feature type: ' +
                                JSON.stringify(type), {
                                alertProps: {
                                    severity: 'error',
                                },
                            });
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    console.error(e_1);
                    setLoading(false);
                    setError(props.errorMessage || 'Geo feature endpoint unavailable');
                    props.onError && props.onError(e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(React.Fragment, null,
        React.createElement(GazetteerAutoComplete, { value: value, onChange: onChange, minimumInputLength: props.minimumInputLength || 1, placeholder: props.placeholder || 'Enter a location', suggester: suggester, variant: props.variant }),
        loading && (React.createElement("div", { style: { marginTop: 10 } },
            props.loadingMessage || 'Loading geometry...',
            ' ',
            React.createElement("span", { className: "fa fa-refresh fa-spin" }))),
        error && React.createElement("div", null, error),
        polyType === 'polygon' && (React.createElement(Polygon, { polygon: polygon, setState: props.setState, polygonBufferWidth: polygonBufferWidth, polygonBufferUnits: polygonBufferUnits, setBufferState: setBufferState, polyType: polyType })),
        polyType === 'multipolygon' && (React.createElement(MultiPolygon, { polygon: polygon, setState: props.setState, polygonBufferWidth: polygonBufferWidth, polygonBufferUnits: polygonBufferUnits, setBufferState: setBufferState, polyType: polyType }))));
};
export default Keyword;
//# sourceMappingURL=keyword.js.map