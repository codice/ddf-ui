import { __awaiter, __extends, __generator } from "tslib";
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
import { hot } from 'react-hot-loader';
import ResultsExportComponent from './presentation';
import { exportResultSet, OverridableGetColumnOrder, getExportOptions, Transformer, } from '../utils/export';
import { getResultSetCql } from '../utils/cql';
import withListenTo from '../backbone-container';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { OverridableSaveFile } from '../utils/save-file/save-file';
var ResultsExport = /** @class */ (function (_super) {
    __extends(ResultsExport, _super);
    function ResultsExport(props) {
        var _this = _super.call(this, props) || this;
        _this.getTransformerType = function () {
            return !_this.props.isZipped && _this.props.results.length > 1
                ? Transformer.Query
                : Transformer.Metacard;
        };
        _this.fetchExportOptions = function () { return __awaiter(_this, void 0, void 0, function () {
            var formats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getExportOptions(this.getTransformerType())];
                    case 1:
                        formats = _a.sent();
                        this.setState({
                            exportFormats: formats,
                        });
                        return [2 /*return*/];
                }
            });
        }); };
        _this.onExportClick = function (addSnack) { return __awaiter(_this, void 0, void 0, function () {
            var uriEncodedTransformerId, response, count, cql, srcs, searches, columnOrder, filename, contentType, data, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uriEncodedTransformerId = this.getSelectedExportFormatId();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 9, 10, 11]);
                        console.log(this.state.loading);
                        this.setState({ loading: true });
                        console.log(this.state.loading);
                        if (uriEncodedTransformerId === undefined) {
                            return [2 /*return*/];
                        }
                        response = null;
                        count = this.props.results.length;
                        cql = getResultSetCql(this.props.results.map(function (result) { return result.id; }));
                        srcs = Array.from(this.getResultSources());
                        searches = [
                            {
                                srcs: srcs,
                                cql: cql,
                                count: count,
                            },
                        ];
                        columnOrder = OverridableGetColumnOrder.get()();
                        if (!this.props.isZipped) return [3 /*break*/, 3];
                        return [4 /*yield*/, exportResultSet('zipCompression', {
                                searches: searches,
                                count: count,
                                sorts: [],
                                args: {
                                    transformerId: uriEncodedTransformerId,
                                },
                            })];
                    case 2:
                        response = _d.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, exportResultSet(uriEncodedTransformerId, {
                            searches: searches,
                            count: count,
                            sorts: (_a = this.props.lazyQueryResults) === null || _a === void 0 ? void 0 : _a.transformSorts({
                                originalSorts: (_b = this.props.lazyQueryResults) === null || _b === void 0 ? void 0 : _b.persistantSorts,
                            }),
                            args: {
                                hiddenFields: [],
                                columnOrder: columnOrder,
                                columnAliasMap: ((_c = StartupDataStore.Configuration.config) === null || _c === void 0 ? void 0 : _c.attributeAliases) || {},
                            },
                        })];
                    case 4:
                        response = _d.sent();
                        _d.label = 5;
                    case 5:
                        if (!(response.status === 200)) return [3 /*break*/, 7];
                        filename = contentDisposition.parse(response.headers.get('content-disposition')).parameters.filename;
                        contentType = response.headers.get('content-type');
                        return [4 /*yield*/, response.blob()];
                    case 6:
                        data = _d.sent();
                        OverridableSaveFile.get()(filename, 'data:' + contentType, data);
                        this.setExportSuccessful(true);
                        this.onClose();
                        return [3 /*break*/, 8];
                    case 7:
                        this.setState({ exportSuccessful: false });
                        this.setState({ loading: false });
                        addSnack('Error: Could not export results.', {
                            alertProps: { severity: 'error' },
                        });
                        _d.label = 8;
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        error_1 = _d.sent();
                        console.error(error_1);
                        this.setState({ exportSuccessful: false });
                        this.setState({ loading: false });
                        return [3 /*break*/, 11];
                    case 10:
                        this.setState({ loading: false });
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        _this.state = {
            selectedFormat: 'Binary Resource',
            exportFormats: [],
            exportDisabled: true,
            loading: false,
            exportSuccessful: false,
        };
        _this.onClose = props.onClose;
        _this.setExportSuccessful = props.setExportSuccessful;
        _this.setLoading = props.setLoading;
        return _this;
    }
    ResultsExport.prototype.componentDidUpdate = function (_prevProps) {
        if (_prevProps.results !== this.props.results ||
            _prevProps.isZipped !== this.props.isZipped) {
            this.fetchExportOptions();
            this.setState({
                selectedFormat: 'Binary Resource',
                exportDisabled: true,
            });
        }
    };
    ResultsExport.prototype.componentDidMount = function () {
        this.fetchExportOptions();
    };
    ResultsExport.prototype.getResultSources = function () {
        return new Set(this.props.results
            .map(function (result) { return result.source; })
            .map(function (source) { return decodeURIComponent(source); }));
    };
    ResultsExport.prototype.getSelectedExportFormatId = function () {
        var selectedFormat = this.state.selectedFormat;
        var format = this.state.exportFormats.find(function (format) { return format.displayName === selectedFormat; });
        if (format !== undefined) {
            return encodeURIComponent(format.id);
        }
        return undefined;
    };
    ResultsExport.prototype.handleExportOptionChange = function (name) {
        this.setState({
            selectedFormat: name,
            exportDisabled: false,
        });
    };
    ResultsExport.prototype.render = function () {
        return (React.createElement(ResultsExportComponent, { selectedFormat: this.state.selectedFormat, exportFormats: this.state.exportFormats, exportDisabled: this.state.exportDisabled, onExportClick: this.onExportClick.bind(this), handleExportOptionChange: this.handleExportOptionChange.bind(this), onClose: this.onClose.bind(this), loading: this.state.loading, setLoading: this.setLoading.bind(this), exportSuccessful: this.state.exportSuccessful, setExportSuccessful: this.setLoading.bind(this) }));
    };
    return ResultsExport;
}(React.Component));
export default hot(module)(withListenTo(ResultsExport));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9yZXN1bHRzLWV4cG9ydC9jb250YWluZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sc0JBQXNCLE1BQU0sZ0JBQWdCLENBQUE7QUFDbkQsT0FBTyxFQUNMLGVBQWUsRUFDZix5QkFBeUIsRUFDekIsZ0JBQWdCLEVBQ2hCLFdBQVcsR0FFWixNQUFNLGlCQUFpQixDQUFBO0FBQ3hCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDOUMsT0FBTyxZQUFtQyxNQUFNLHVCQUF1QixDQUFBO0FBRXZFLG1KQUFtSjtBQUNuSixPQUFPLGtCQUFrQixNQUFNLHFCQUFxQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDhCQUE4QixDQUFBO0FBNEJsRTtJQUE0QixpQ0FBNkI7SUFJdkQsdUJBQVksS0FBWTtRQUF4QixZQUNFLGtCQUFNLEtBQUssQ0FBQyxTQVdiO1FBZUQsd0JBQWtCLEdBQUc7WUFDbkIsT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUMxRCxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUs7Z0JBQ25CLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFBO1FBQzFCLENBQUMsQ0FBQTtRQU1ELHdCQUFrQixHQUFHOzs7OzRCQUNILHFCQUFNLGdCQUFnQixDQUFD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WTtRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ1osY0FBYyxFQUFFLElBQUk7WUFDcEIsY0FBYyxFQUFFLEtBQUs7U0FDdEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELDhCQUFNLEdBQU47UUFDRSxPQUFPLENBQ0wsb0JBQUMsc0JBQXNCLElBQ3JCLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFDekMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUN2QyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQ3pDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDNUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDbEUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQzNCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDdEMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFDN0MsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQy9DLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUF2S0QsQ0FBNEIsS0FBSyxDQUFDLFNBQVMsR0F1SzFDO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBSZXN1bHRzRXhwb3J0Q29tcG9uZW50IGZyb20gJy4vcHJlc2VudGF0aW9uJ1xuaW1wb3J0IHtcbiAgZXhwb3J0UmVzdWx0U2V0LFxuICBPdmVycmlkYWJsZUdldENvbHVtbk9yZGVyLFxuICBnZXRFeHBvcnRPcHRpb25zLFxuICBUcmFuc2Zvcm1lcixcbiAgRXhwb3J0Rm9ybWF0LFxufSBmcm9tICcuLi91dGlscy9leHBvcnQnXG5pbXBvcnQgeyBnZXRSZXN1bHRTZXRDcWwgfSBmcm9tICcuLi91dGlscy9jcWwnXG5pbXBvcnQgd2l0aExpc3RlblRvLCB7IFdpdGhCYWNrYm9uZVByb3BzIH0gZnJvbSAnLi4vYmFja2JvbmUtY29udGFpbmVyJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0cyB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHRzJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY29udC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgY29udGVudERpc3Bvc2l0aW9uIGZyb20gJ2NvbnRlbnQtZGlzcG9zaXRpb24nXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgT3ZlcnJpZGFibGVTYXZlRmlsZSB9IGZyb20gJy4uL3V0aWxzL3NhdmUtZmlsZS9zYXZlLWZpbGUnXG5pbXBvcnQgeyBBZGRTbmFjayB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zbmFjay9zbmFjay5wcm92aWRlcidcblxudHlwZSBSZXN1bHQgPSB7XG4gIGlkOiBzdHJpbmdcbiAgc291cmNlOiBzdHJpbmdcbiAgYXR0cmlidXRlczogc3RyaW5nW11cbn1cblxudHlwZSBQcm9wcyA9IHtcbiAgcmVzdWx0czogUmVzdWx0W11cbiAgbGF6eVF1ZXJ5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICBpc1ppcHBlZD86IGJvb2xlYW5cbiAgb25DbG9zZT86IGFueVxuICBleHBvcnRTdWNjZXNzZnVsPzogYm9vbGVhblxuICBzZXRFeHBvcnRTdWNjZXNzZnVsPzogYW55XG4gIGxvYWRpbmc/OiBib29sZWFuXG4gIHNldExvYWRpbmc/OiBhbnlcbn0gJiBXaXRoQmFja2JvbmVQcm9wc1xuXG50eXBlIFN0YXRlID0ge1xuICBleHBvcnREaXNhYmxlZDogYm9vbGVhblxuICBzZWxlY3RlZEZvcm1hdDogc3RyaW5nXG4gIGV4cG9ydEZvcm1hdHM6IEV4cG9ydEZvcm1hdFtdXG4gIGxvYWRpbmc/OiBib29sZWFuXG4gIGV4cG9ydFN1Y2Nlc3NmdWw/OiBib29sZWFuXG59XG5cbmNsYXNzIFJlc3VsdHNFeHBvcnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8UHJvcHMsIFN0YXRlPiB7XG4gIHNldEV4cG9ydFN1Y2Nlc3NmdWw6IGFueVxuICBvbkNsb3NlOiBhbnlcbiAgc2V0TG9hZGluZzogYW55XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZEZvcm1hdDogJ0JpbmFyeSBSZXNvdXJjZScsXG4gICAgICBleHBvcnRGb3JtYXRzOiBbXSxcbiAgICAgIGV4cG9ydERpc2FibGVkOiB0cnVlLFxuICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICBleHBvcnRTdWNjZXNzZnVsOiBmYWxzZSxcbiAgICB9XG4gICAgdGhpcy5vbkNsb3NlID0gcHJvcHMub25DbG9zZVxuICAgIHRoaXMuc2V0RXhwb3J0U3VjY2Vzc2Z1bCA9IHByb3BzLnNldEV4cG9ydFN1Y2Nlc3NmdWxcbiAgICB0aGlzLnNldExvYWRpbmcgPSBwcm9wcy5zZXRMb2FkaW5nXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoX3ByZXZQcm9wczogUHJvcHMpIHtcbiAgICBpZiAoXG4gICAgICBfcHJldlByb3BzLnJlc3VsdHMgIT09IHRoaXMucHJvcHMucmVzdWx0cyB8fFxuICAgICAgX3ByZXZQcm9wcy5pc1ppcHBlZCAhPT0gdGhpcy5wcm9wcy5pc1ppcHBlZFxuICAgICkge1xuICAgICAgdGhpcy5mZXRjaEV4cG9ydE9wdGlvbnMoKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkRm9ybWF0OiAnQmluYXJ5IFJlc291cmNlJyxcbiAgICAgICAgZXhwb3J0RGlzYWJsZWQ6IHRydWUsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGdldFRyYW5zZm9ybWVyVHlwZSA9ICgpID0+IHtcbiAgICByZXR1cm4gIXRoaXMucHJvcHMuaXNaaXBwZWQgJiYgdGhpcy5wcm9wcy5yZXN1bHRzLmxlbmd0aCA+IDFcbiAgICAgID8gVHJhbnNmb3JtZXIuUXVlcnlcbiAgICAgIDogVHJhbnNmb3JtZXIuTWV0YWNhcmRcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuZmV0Y2hFeHBvcnRPcHRpb25zKClcbiAgfVxuXG4gIGZldGNoRXhwb3J0T3B0aW9ucyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBmb3JtYXRzID0gYXdhaXQgZ2V0RXhwb3J0T3B0aW9ucyh0aGlzLmdldFRyYW5zZm9ybWVyVHlwZSgpKVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZXhwb3J0Rm9ybWF0czogZm9ybWF0cyxcbiAgICB9KVxuICB9XG5cbiAgZ2V0UmVzdWx0U291cmNlcygpIHtcbiAgICByZXR1cm4gbmV3IFNldChcbiAgICAgIHRoaXMucHJvcHMucmVzdWx0c1xuICAgICAgICAubWFwKChyZXN1bHQ6IFJlc3VsdCkgPT4gcmVzdWx0LnNvdXJjZSlcbiAgICAgICAgLm1hcCgoc291cmNlOiBzdHJpbmcpID0+IGRlY29kZVVSSUNvbXBvbmVudChzb3VyY2UpKVxuICAgIClcbiAgfVxuXG4gIGdldFNlbGVjdGVkRXhwb3J0Rm9ybWF0SWQoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRGb3JtYXQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkRm9ybWF0XG4gICAgY29uc3QgZm9ybWF0ID0gdGhpcy5zdGF0ZS5leHBvcnRGb3JtYXRzLmZpbmQoXG4gICAgICAoZm9ybWF0KSA9PiBmb3JtYXQuZGlzcGxheU5hbWUgPT09IHNlbGVjdGVkRm9ybWF0XG4gICAgKVxuXG4gICAgaWYgKGZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGZvcm1hdC5pZClcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBvbkV4cG9ydENsaWNrID0gYXN5bmMgKGFkZFNuYWNrOiBBZGRTbmFjaykgPT4ge1xuICAgIGNvbnN0IHVyaUVuY29kZWRUcmFuc2Zvcm1lcklkID0gdGhpcy5nZXRTZWxlY3RlZEV4cG9ydEZvcm1hdElkKClcblxuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmxvYWRpbmcpXG4gICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KVxuICAgICAgY29uc29sZS5sb2codGhpcy5zdGF0ZS5sb2FkaW5nKVxuXG4gICAgICBpZiAodXJpRW5jb2RlZFRyYW5zZm9ybWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IHJlc3BvbnNlID0gbnVsbFxuICAgICAgY29uc3QgY291bnQgPSB0aGlzLnByb3BzLnJlc3VsdHMubGVuZ3RoXG4gICAgICBjb25zdCBjcWwgPSBnZXRSZXN1bHRTZXRDcWwoXG4gICAgICAgIHRoaXMucHJvcHMucmVzdWx0cy5tYXAoKHJlc3VsdDogUmVzdWx0KSA9PiByZXN1bHQuaWQpXG4gICAgICApXG4gICAgICBjb25zdCBzcmNzID0gQXJyYXkuZnJvbSh0aGlzLmdldFJlc3VsdFNvdXJjZXMoKSlcbiAgICAgIGNvbnN0IHNlYXJjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgc3JjcyxcbiAgICAgICAgICBjcWwsXG4gICAgICAgICAgY291bnQsXG4gICAgICAgIH0sXG4gICAgICBdXG4gICAgICBjb25zdCBjb2x1bW5PcmRlciA9IE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIuZ2V0KCkoKVxuICAgICAgaWYgKHRoaXMucHJvcHMuaXNaaXBwZWQpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBleHBvcnRSZXN1bHRTZXQoJ3ppcENvbXByZXNzaW9uJywge1xuICAgICAgICAgIHNlYXJjaGVzLFxuICAgICAgICAgIGNvdW50LFxuICAgICAgICAgIHNvcnRzOiBbXSxcbiAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1lcklkOiB1cmlFbmNvZGVkVHJhbnNmb3JtZXJJZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBleHBvcnRSZXN1bHRTZXQodXJpRW5jb2RlZFRyYW5zZm9ybWVySWQsIHtcbiAgICAgICAgICBzZWFyY2hlcyxcbiAgICAgICAgICBjb3VudCxcbiAgICAgICAgICBzb3J0czogdGhpcy5wcm9wcy5sYXp5UXVlcnlSZXN1bHRzPy50cmFuc2Zvcm1Tb3J0cyh7XG4gICAgICAgICAgICBvcmlnaW5hbFNvcnRzOiB0aGlzLnByb3BzLmxhenlRdWVyeVJlc3VsdHM/LnBlcnNpc3RhbnRTb3J0cyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICBoaWRkZW5GaWVsZHM6IFtdLFxuICAgICAgICAgICAgY29sdW1uT3JkZXI6IGNvbHVtbk9yZGVyLFxuICAgICAgICAgICAgY29sdW1uQWxpYXNNYXA6XG4gICAgICAgICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMgfHwge30sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gY29udGVudERpc3Bvc2l0aW9uLnBhcnNlKFxuICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LWRpc3Bvc2l0aW9uJylcbiAgICAgICAgKS5wYXJhbWV0ZXJzLmZpbGVuYW1lXG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5ibG9iKClcbiAgICAgICAgT3ZlcnJpZGFibGVTYXZlRmlsZS5nZXQoKShmaWxlbmFtZSwgJ2RhdGE6JyArIGNvbnRlbnRUeXBlLCBkYXRhKVxuICAgICAgICB0aGlzLnNldEV4cG9ydFN1Y2Nlc3NmdWwodHJ1ZSlcbiAgICAgICAgdGhpcy5vbkNsb3NlKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBleHBvcnRTdWNjZXNzZnVsOiBmYWxzZSB9KVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSlcbiAgICAgICAgYWRkU25hY2soJ0Vycm9yOiBDb3VsZCBub3QgZXhwb3J0IHJlc3VsdHMuJywge1xuICAgICAgICAgIGFsZXJ0UHJvcHM6IHsgc2V2ZXJpdHk6ICdlcnJvcicgfSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBleHBvcnRTdWNjZXNzZnVsOiBmYWxzZSB9KVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV4cG9ydE9wdGlvbkNoYW5nZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkRm9ybWF0OiBuYW1lLFxuICAgICAgZXhwb3J0RGlzYWJsZWQ6IGZhbHNlLFxuICAgIH0pXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8UmVzdWx0c0V4cG9ydENvbXBvbmVudFxuICAgICAgICBzZWxlY3RlZEZvcm1hdD17dGhpcy5zdGF0ZS5zZWxlY3RlZEZvcm1hdH1cbiAgICAgICAgZXhwb3J0Rm9ybWF0cz17dGhpcy5zdGF0ZS5leHBvcnRGb3JtYXRzfVxuICAgICAgICBleHBvcnREaXNhYmxlZD17dGhpcy5zdGF0ZS5leHBvcnREaXNhYmxlZH1cbiAgICAgICAgb25FeHBvcnRDbGljaz17dGhpcy5vbkV4cG9ydENsaWNrLmJpbmQodGhpcyl9XG4gICAgICAgIGhhbmRsZUV4cG9ydE9wdGlvbkNoYW5nZT17dGhpcy5oYW5kbGVFeHBvcnRPcHRpb25DaGFuZ2UuYmluZCh0aGlzKX1cbiAgICAgICAgb25DbG9zZT17dGhpcy5vbkNsb3NlLmJpbmQodGhpcyl9XG4gICAgICAgIGxvYWRpbmc9e3RoaXMuc3RhdGUubG9hZGluZ31cbiAgICAgICAgc2V0TG9hZGluZz17dGhpcy5zZXRMb2FkaW5nLmJpbmQodGhpcyl9XG4gICAgICAgIGV4cG9ydFN1Y2Nlc3NmdWw9e3RoaXMuc3RhdGUuZXhwb3J0U3VjY2Vzc2Z1bH1cbiAgICAgICAgc2V0RXhwb3J0U3VjY2Vzc2Z1bD17dGhpcy5zZXRMb2FkaW5nLmJpbmQodGhpcyl9XG4gICAgICAvPlxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKSh3aXRoTGlzdGVuVG8oUmVzdWx0c0V4cG9ydCkpXG4iXX0=