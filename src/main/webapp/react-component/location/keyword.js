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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5d29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24va2V5d29yZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ2hDLE9BQU8sZUFBZSxNQUFNLHdCQUF3QixDQUFBO0FBQ3BELE9BQU8scUJBQXFCLE1BQU0seUNBQXlDLENBQUE7QUFDM0UsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFBO0FBQy9CLE9BQU8sWUFBWSxNQUFNLGFBQWEsQ0FBQTtBQUV0QyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUV6QyxPQUFPLFFBQVEsTUFBTSxnQ0FBZ0MsQ0FBQTtBQXFCckQsSUFBTSxPQUFPLEdBQUcsVUFBQyxLQUFZO0lBQ3JCLElBQUEsS0FBQSxPQUFvQixRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsSUFBQSxFQUE5QyxLQUFLLFFBQUEsRUFBRSxRQUFRLFFBQStCLENBQUE7SUFDL0MsSUFBQSxLQUFBLE9BQXdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUF0QyxPQUFPLFFBQUEsRUFBRSxVQUFVLFFBQW1CLENBQUE7SUFDdkMsSUFBQSxLQUFBLE9BQW9CLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBQSxFQUEvQixLQUFLLFFBQUEsRUFBRSxRQUFRLFFBQWdCLENBQUE7SUFDdEMsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxZQUFZLENBQUE7SUFDekMsSUFBTSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFFekIsSUFBQSxPQUFPLEdBS0wsS0FBSyxRQUxBLEVBQ1AsY0FBYyxHQUlaLEtBQUssZUFKTyxF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Q3RDLGtCQUFrQixFQUFFLGtCQUFrQixFQUN0QyxjQUFjLEVBQUUsY0FBYyxFQUM5QixRQUFRLEVBQUUsUUFBUSxHQUNsQixDQUNILENBQ0EsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxPQUFPLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCBHYXpldHRlZXJBdXRvQ29tcGxldGUgZnJvbSAnLi4vYXV0by1jb21wbGV0ZS9nYXpldHRlZXItYXV0b2NvbXBsZXRlJ1xuaW1wb3J0IFBvbHlnb24gZnJvbSAnLi9wb2x5Z29uJ1xuaW1wb3J0IE11bHRpUG9seWdvbiBmcm9tICcuL211bHRpcG9seSdcbmltcG9ydCB7IFRleHRGaWVsZFByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgZGVmYXVsdEZldGNoIGZyb20gJy4uL3V0aWxzL2ZldGNoJ1xuaW1wb3J0IHsgU3VnZ2VzdGlvbiwgR2VvRmVhdHVyZSB9IGZyb20gJy4vZ2F6ZXR0ZWVyJ1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uLy4uL2NvbXBvbmVudC9ob29rcy91c2VTbmFjaydcblxudHlwZSBQcm9wcyA9IHtcbiAgc2V0U3RhdGU6IGFueVxuICBmZXRjaD86IGFueVxuICB2YWx1ZT86IHN0cmluZ1xuICBvbkVycm9yPzogKGVycm9yOiBhbnkpID0+IHZvaWRcbiAgc3VnZ2VzdGVyPzogKGlucHV0OiBzdHJpbmcpID0+IFByb21pc2U8U3VnZ2VzdGlvbltdPlxuICBnZW9mZWF0dXJlPzogKHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb24pID0+IFByb21pc2U8R2VvRmVhdHVyZT5cbiAgZXJyb3JNZXNzYWdlPzogc3RyaW5nXG4gIHBvbHlnb24/OiBhbnlbXVxuICBwb2x5VHlwZT86IHN0cmluZ1xuICBzZXRCdWZmZXJTdGF0ZT86IGFueVxuICBwb2x5Z29uQnVmZmVyV2lkdGg/OiBzdHJpbmdcbiAgcG9seWdvbkJ1ZmZlclVuaXRzPzogc3RyaW5nXG4gIGxvYWRpbmdNZXNzYWdlPzogc3RyaW5nXG4gIG1pbmltdW1JbnB1dExlbmd0aD86IG51bWJlclxuICBwbGFjZWhvbGRlcj86IHN0cmluZ1xuICB2YXJpYW50PzogVGV4dEZpZWxkUHJvcHNbJ3ZhcmlhbnQnXVxufVxuXG5jb25zdCBLZXl3b3JkID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCBbdmFsdWUsIHNldFZhbHVlXSA9IHVzZVN0YXRlKHByb3BzLnZhbHVlIHx8ICcnKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgZmV0Y2ggPSBwcm9wcy5mZXRjaCB8fCBkZWZhdWx0RmV0Y2hcbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIGNvbnN0IHtcbiAgICBwb2x5Z29uLFxuICAgIHNldEJ1ZmZlclN0YXRlLFxuICAgIHBvbHlnb25CdWZmZXJXaWR0aCxcbiAgICBwb2x5Z29uQnVmZmVyVW5pdHMsXG4gICAgcG9seVR5cGUsXG4gIH0gPSBwcm9wc1xuXG4gIGNvbnN0IGludGVybmFsU3VnZ2VzdGVyID0gYXN5bmMgKGlucHV0OiBzdHJpbmcpOiBQcm9taXNlPFN1Z2dlc3Rpb25bXT4gPT4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAuL2ludGVybmFsL2dlb2ZlYXR1cmUvc3VnZ2VzdGlvbnM/cT0ke2lucHV0fWApXG4gICAgY29uc3QganNvbiA9IGF3YWl0IHJlcy5qc29uKClcbiAgICByZXR1cm4gYXdhaXQganNvbi5maWx0ZXIoKHsgaWQgfTogU3VnZ2VzdGlvbikgPT4gIWlkLnN0YXJ0c1dpdGgoJ0xJVEVSQUwnKSlcbiAgfVxuXG4gIGNvbnN0IHN1Z2dlc3RlciA9IGFzeW5jIChpbnB1dDogc3RyaW5nKTogUHJvbWlzZTxTdWdnZXN0aW9uW10+ID0+IHtcbiAgICBsZXQgc3VnZ2VzdGlvbnM6IFN1Z2dlc3Rpb25bXSA9IFtdXG5cbiAgICBjb25zdCBleHRlbnNpb25TdWdnZXN0aW9ucyA9IGF3YWl0IEV4dGVuc2lvblBvaW50cy5zdWdnZXN0ZXIoaW5wdXQpXG5cbiAgICBpZiAoZXh0ZW5zaW9uU3VnZ2VzdGlvbnMpIHtcbiAgICAgIHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuY29uY2F0KGV4dGVuc2lvblN1Z2dlc3Rpb25zKVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5zdWdnZXN0ZXIpIHtcbiAgICAgIGNvbnN0IHByb3BzU3VnZ2VzdGlvbnMgPSBhd2FpdCBwcm9wcy5zdWdnZXN0ZXIoaW5wdXQpXG4gICAgICBzdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLmNvbmNhdChwcm9wc1N1Z2dlc3Rpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbnRlcm5hbFN1Z2dlc3Rpb25zID0gYXdhaXQgaW50ZXJuYWxTdWdnZXN0ZXIoaW5wdXQpXG4gICAgICBzdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLmNvbmNhdChpbnRlcm5hbFN1Z2dlc3Rpb25zKVxuICAgIH1cblxuICAgIHJldHVybiBzdWdnZXN0aW9uc1xuICB9XG5cbiAgY29uc3QgaW50ZXJuYWxHZW9mZWF0dXJlID0gYXN5bmMgKHtcbiAgICBpZCxcbiAgfTogU3VnZ2VzdGlvbik6IFByb21pc2U8R2VvRmVhdHVyZT4gPT4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAuL2ludGVybmFsL2dlb2ZlYXR1cmU/aWQ9JHtpZH1gKVxuICAgIHJldHVybiBhd2FpdCByZXMuanNvbigpXG4gIH1cblxuICBjb25zdCBnZW9mZWF0dXJlID0gYXN5bmMgKHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb24pOiBQcm9taXNlPEdlb0ZlYXR1cmU+ID0+IHtcbiAgICBpZiAoc3VnZ2VzdGlvbi5leHRlbnNpb25HZW8pIHtcbiAgICAgIHJldHVybiBzdWdnZXN0aW9uLmV4dGVuc2lvbkdlb1xuICAgIH0gZWxzZSBpZiAocHJvcHMuZ2VvZmVhdHVyZSkge1xuICAgICAgcmV0dXJuIGF3YWl0IHByb3BzLmdlb2ZlYXR1cmUoc3VnZ2VzdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IGludGVybmFsR2VvZmVhdHVyZShzdWdnZXN0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uQ2hhbmdlID0gYXN5bmMgKHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb24pID0+IHtcbiAgICBpZiAoIXN1Z2dlc3Rpb24pIHtcbiAgICAgIHByb3BzLnNldFN0YXRlKHsgaGFzS2V5d29yZDogZmFsc2UsIHZhbHVlOiAnJywgcG9seWdvbjogW10gfSlcbiAgICAgIHNldFZhbHVlKCcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgc2V0RXJyb3IoJycpXG4gICAgc2V0VmFsdWUoc3VnZ2VzdGlvbi5uYW1lKVxuICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyB0eXBlLCBnZW9tZXRyeSB9ID0gYXdhaXQgZ2VvZmVhdHVyZShzdWdnZXN0aW9uKVxuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcblxuICAgICAgc3dpdGNoIChnZW9tZXRyeS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ1BvbHlnb24nOiB7XG4gICAgICAgICAgY29uc3QgcG9seWdvbiA9IGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdXG4gICAgICAgICAgcHJvcHMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGFzS2V5d29yZDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2F0aW9uSWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGxvY2F0aW9uVHlwZTogJ2xhdGxvbicsXG4gICAgICAgICAgICBwb2x5Z29uLFxuICAgICAgICAgICAgcG9seVR5cGU6ICdwb2x5Z29uJyxcbiAgICAgICAgICAgIHZhbHVlOiBzdWdnZXN0aW9uLm5hbWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ011bHRpUG9seWdvbic6IHtcbiAgICAgICAgICAvLyBvdXRlciByaW5nIG9ubHlcbiAgICAgICAgICBjb25zdCBwb2x5Z29uID0gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKChyaW5nOiBhbnlbXSkgPT4gcmluZ1swXSlcblxuICAgICAgICAgIHByb3BzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhhc0tleXdvcmQ6IHRydWUsXG4gICAgICAgICAgICBsb2NhdGlvbklkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBsb2NhdGlvblR5cGU6ICdsYXRsb24nLFxuICAgICAgICAgICAgcG9seWdvbixcbiAgICAgICAgICAgIHBvbHlUeXBlOiAnbXVsdGlwb2x5Z29uJyxcbiAgICAgICAgICAgIHZhbHVlOiBzdWdnZXN0aW9uLm5hbWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAgICdJbnZhbGlkIGZlYXR1cmUgLSBVbnJlY29nbml6ZWQgZmVhdHVyZSB0eXBlOiAnICtcbiAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodHlwZSksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgc2V0RXJyb3IocHJvcHMuZXJyb3JNZXNzYWdlIHx8ICdHZW8gZmVhdHVyZSBlbmRwb2ludCB1bmF2YWlsYWJsZScpXG4gICAgICBwcm9wcy5vbkVycm9yICYmIHByb3BzLm9uRXJyb3IoZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8R2F6ZXR0ZWVyQXV0b0NvbXBsZXRlXG4gICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICBtaW5pbXVtSW5wdXRMZW5ndGg9e3Byb3BzLm1pbmltdW1JbnB1dExlbmd0aCB8fCAxfVxuICAgICAgICBwbGFjZWhvbGRlcj17cHJvcHMucGxhY2Vob2xkZXIgfHwgJ0VudGVyIGEgbG9jYXRpb24nfVxuICAgICAgICBzdWdnZXN0ZXI9e3N1Z2dlc3Rlcn1cbiAgICAgICAgdmFyaWFudD17cHJvcHMudmFyaWFudH1cbiAgICAgIC8+XG4gICAgICB7bG9hZGluZyAmJiAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxMCB9fT5cbiAgICAgICAgICB7cHJvcHMubG9hZGluZ01lc3NhZ2UgfHwgJ0xvYWRpbmcgZ2VvbWV0cnkuLi4nfXsnICd9XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgICAge2Vycm9yICYmIDxkaXY+e2Vycm9yfTwvZGl2Pn1cbiAgICAgIHtwb2x5VHlwZSA9PT0gJ3BvbHlnb24nICYmIChcbiAgICAgICAgPFBvbHlnb25cbiAgICAgICAgICBwb2x5Z29uPXtwb2x5Z29ufVxuICAgICAgICAgIHNldFN0YXRlPXtwcm9wcy5zZXRTdGF0ZX1cbiAgICAgICAgICBwb2x5Z29uQnVmZmVyV2lkdGg9e3BvbHlnb25CdWZmZXJXaWR0aH1cbiAgICAgICAgICBwb2x5Z29uQnVmZmVyVW5pdHM9e3BvbHlnb25CdWZmZXJVbml0c31cbiAgICAgICAgICBzZXRCdWZmZXJTdGF0ZT17c2V0QnVmZmVyU3RhdGV9XG4gICAgICAgICAgcG9seVR5cGU9e3BvbHlUeXBlfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtwb2x5VHlwZSA9PT0gJ211bHRpcG9seWdvbicgJiYgKFxuICAgICAgICA8TXVsdGlQb2x5Z29uXG4gICAgICAgICAgcG9seWdvbj17cG9seWdvbn1cbiAgICAgICAgICBzZXRTdGF0ZT17cHJvcHMuc2V0U3RhdGV9XG4gICAgICAgICAgcG9seWdvbkJ1ZmZlcldpZHRoPXtwb2x5Z29uQnVmZmVyV2lkdGh9XG4gICAgICAgICAgcG9seWdvbkJ1ZmZlclVuaXRzPXtwb2x5Z29uQnVmZmVyVW5pdHN9XG4gICAgICAgICAgc2V0QnVmZmVyU3RhdGU9e3NldEJ1ZmZlclN0YXRlfVxuICAgICAgICAgIHBvbHlUeXBlPXtwb2x5VHlwZX1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5d29yZFxuIl19