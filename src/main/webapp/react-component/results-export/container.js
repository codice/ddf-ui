import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
        return (_jsx(ResultsExportComponent, { selectedFormat: this.state.selectedFormat, exportFormats: this.state.exportFormats, exportDisabled: this.state.exportDisabled, onExportClick: this.onExportClick.bind(this), handleExportOptionChange: this.handleExportOptionChange.bind(this), onClose: this.onClose.bind(this), loading: this.state.loading, setLoading: this.setLoading.bind(this), exportSuccessful: this.state.exportSuccessful, setExportSuccessful: this.setLoading.bind(this) }));
    };
    return ResultsExport;
}(React.Component));
export default withListenTo(ResultsExport);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9yZXN1bHRzLWV4cG9ydC9jb250YWluZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sc0JBQXNCLE1BQU0sZ0JBQWdCLENBQUE7QUFDbkQsT0FBTyxFQUNMLGVBQWUsRUFDZix5QkFBeUIsRUFDekIsZ0JBQWdCLEVBQ2hCLFdBQVcsR0FFWixNQUFNLGlCQUFpQixDQUFBO0FBQ3hCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDOUMsT0FBTyxZQUFtQyxNQUFNLHVCQUF1QixDQUFBO0FBRXZFLG1KQUFtSjtBQUNuSixPQUFPLGtCQUFrQixNQUFNLHFCQUFxQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDhCQUE4QixDQUFBO0FBNEJsRTtJQUE0QixpQ0FBNkI7SUFJdkQsdUJBQVksS0FBWTtRQUN0QixZQUFBLE1BQUssWUFBQyxLQUFLLENBQUMsU0FBQTtRQTBCZCx3QkFBa0IsR0FBRztZQUNuQixPQUFPLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQzFELENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSztnQkFDbkIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUE7UUFDMUIsQ0FBQyxDQUFBO1FBTUQsd0JBQWtCLEdBQUc7Ozs7NEJBQ0gscUJBQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBQTs7d0JB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LElBQUksQ0FBQyxRQUFRLENBQUM7WUFDWixjQUFjLEVBQUUsSUFBSTtZQUNwQixjQUFjLEVBQUUsS0FBSztTQUN0QixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsOEJBQU0sR0FBTjtRQUNFLE9BQU8sQ0FDTCxLQUFDLHNCQUFzQixJQUNyQixjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQ3pDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFDdkMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUN6QyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzVDLHdCQUF3QixFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2xFLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDaEMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUMzQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3RDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQzdDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUMvQyxDQUNILENBQUE7SUFDSCxDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBdktELENBQTRCLEtBQUssQ0FBQyxTQUFTLEdBdUsxQztBQUVELGVBQWUsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IFJlc3VsdHNFeHBvcnRDb21wb25lbnQgZnJvbSAnLi9wcmVzZW50YXRpb24nXG5pbXBvcnQge1xuICBleHBvcnRSZXN1bHRTZXQsXG4gIE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIsXG4gIGdldEV4cG9ydE9wdGlvbnMsXG4gIFRyYW5zZm9ybWVyLFxuICBFeHBvcnRGb3JtYXQsXG59IGZyb20gJy4uL3V0aWxzL2V4cG9ydCdcbmltcG9ydCB7IGdldFJlc3VsdFNldENxbCB9IGZyb20gJy4uL3V0aWxzL2NxbCdcbmltcG9ydCB3aXRoTGlzdGVuVG8sIHsgV2l0aEJhY2tib25lUHJvcHMgfSBmcm9tICcuLi9iYWNrYm9uZS1jb250YWluZXInXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHRzIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdHMnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjb250Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBjb250ZW50RGlzcG9zaXRpb24gZnJvbSAnY29udGVudC1kaXNwb3NpdGlvbidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBPdmVycmlkYWJsZVNhdmVGaWxlIH0gZnJvbSAnLi4vdXRpbHMvc2F2ZS1maWxlL3NhdmUtZmlsZSdcbmltcG9ydCB7IEFkZFNuYWNrIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3NuYWNrL3NuYWNrLnByb3ZpZGVyJ1xuXG50eXBlIFJlc3VsdCA9IHtcbiAgaWQ6IHN0cmluZ1xuICBzb3VyY2U6IHN0cmluZ1xuICBhdHRyaWJ1dGVzOiBzdHJpbmdbXVxufVxuXG50eXBlIFByb3BzID0ge1xuICByZXN1bHRzOiBSZXN1bHRbXVxuICBsYXp5UXVlcnlSZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRzXG4gIGlzWmlwcGVkPzogYm9vbGVhblxuICBvbkNsb3NlPzogYW55XG4gIGV4cG9ydFN1Y2Nlc3NmdWw/OiBib29sZWFuXG4gIHNldEV4cG9ydFN1Y2Nlc3NmdWw/OiBhbnlcbiAgbG9hZGluZz86IGJvb2xlYW5cbiAgc2V0TG9hZGluZz86IGFueVxufSAmIFdpdGhCYWNrYm9uZVByb3BzXG5cbnR5cGUgU3RhdGUgPSB7XG4gIGV4cG9ydERpc2FibGVkOiBib29sZWFuXG4gIHNlbGVjdGVkRm9ybWF0OiBzdHJpbmdcbiAgZXhwb3J0Rm9ybWF0czogRXhwb3J0Rm9ybWF0W11cbiAgbG9hZGluZz86IGJvb2xlYW5cbiAgZXhwb3J0U3VjY2Vzc2Z1bD86IGJvb2xlYW5cbn1cblxuY2xhc3MgUmVzdWx0c0V4cG9ydCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgc2V0RXhwb3J0U3VjY2Vzc2Z1bDogYW55XG4gIG9uQ2xvc2U6IGFueVxuICBzZXRMb2FkaW5nOiBhbnlcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGVkRm9ybWF0OiAnQmluYXJ5IFJlc291cmNlJyxcbiAgICAgIGV4cG9ydEZvcm1hdHM6IFtdLFxuICAgICAgZXhwb3J0RGlzYWJsZWQ6IHRydWUsXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGV4cG9ydFN1Y2Nlc3NmdWw6IGZhbHNlLFxuICAgIH1cbiAgICB0aGlzLm9uQ2xvc2UgPSBwcm9wcy5vbkNsb3NlXG4gICAgdGhpcy5zZXRFeHBvcnRTdWNjZXNzZnVsID0gcHJvcHMuc2V0RXhwb3J0U3VjY2Vzc2Z1bFxuICAgIHRoaXMuc2V0TG9hZGluZyA9IHByb3BzLnNldExvYWRpbmdcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShfcHJldlByb3BzOiBQcm9wcykge1xuICAgIGlmIChcbiAgICAgIF9wcmV2UHJvcHMucmVzdWx0cyAhPT0gdGhpcy5wcm9wcy5yZXN1bHRzIHx8XG4gICAgICBfcHJldlByb3BzLmlzWmlwcGVkICE9PSB0aGlzLnByb3BzLmlzWmlwcGVkXG4gICAgKSB7XG4gICAgICB0aGlzLmZldGNoRXhwb3J0T3B0aW9ucygpXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2VsZWN0ZWRGb3JtYXQ6ICdCaW5hcnkgUmVzb3VyY2UnLFxuICAgICAgICBleHBvcnREaXNhYmxlZDogdHJ1ZSxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0VHJhbnNmb3JtZXJUeXBlID0gKCkgPT4ge1xuICAgIHJldHVybiAhdGhpcy5wcm9wcy5pc1ppcHBlZCAmJiB0aGlzLnByb3BzLnJlc3VsdHMubGVuZ3RoID4gMVxuICAgICAgPyBUcmFuc2Zvcm1lci5RdWVyeVxuICAgICAgOiBUcmFuc2Zvcm1lci5NZXRhY2FyZFxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5mZXRjaEV4cG9ydE9wdGlvbnMoKVxuICB9XG5cbiAgZmV0Y2hFeHBvcnRPcHRpb25zID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGZvcm1hdHMgPSBhd2FpdCBnZXRFeHBvcnRPcHRpb25zKHRoaXMuZ2V0VHJhbnNmb3JtZXJUeXBlKCkpXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBleHBvcnRGb3JtYXRzOiBmb3JtYXRzLFxuICAgIH0pXG4gIH1cblxuICBnZXRSZXN1bHRTb3VyY2VzKCkge1xuICAgIHJldHVybiBuZXcgU2V0KFxuICAgICAgdGhpcy5wcm9wcy5yZXN1bHRzXG4gICAgICAgIC5tYXAoKHJlc3VsdDogUmVzdWx0KSA9PiByZXN1bHQuc291cmNlKVxuICAgICAgICAubWFwKChzb3VyY2U6IHN0cmluZykgPT4gZGVjb2RlVVJJQ29tcG9uZW50KHNvdXJjZSkpXG4gICAgKVxuICB9XG5cbiAgZ2V0U2VsZWN0ZWRFeHBvcnRGb3JtYXRJZCgpIHtcbiAgICBjb25zdCBzZWxlY3RlZEZvcm1hdCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRGb3JtYXRcbiAgICBjb25zdCBmb3JtYXQgPSB0aGlzLnN0YXRlLmV4cG9ydEZvcm1hdHMuZmluZChcbiAgICAgIChmb3JtYXQpID0+IGZvcm1hdC5kaXNwbGF5TmFtZSA9PT0gc2VsZWN0ZWRGb3JtYXRcbiAgICApXG5cbiAgICBpZiAoZm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoZm9ybWF0LmlkKVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIG9uRXhwb3J0Q2xpY2sgPSBhc3luYyAoYWRkU25hY2s6IEFkZFNuYWNrKSA9PiB7XG4gICAgY29uc3QgdXJpRW5jb2RlZFRyYW5zZm9ybWVySWQgPSB0aGlzLmdldFNlbGVjdGVkRXhwb3J0Rm9ybWF0SWQoKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUubG9hZGluZylcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmxvYWRpbmcpXG5cbiAgICAgIGlmICh1cmlFbmNvZGVkVHJhbnNmb3JtZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBsZXQgcmVzcG9uc2UgPSBudWxsXG4gICAgICBjb25zdCBjb3VudCA9IHRoaXMucHJvcHMucmVzdWx0cy5sZW5ndGhcbiAgICAgIGNvbnN0IGNxbCA9IGdldFJlc3VsdFNldENxbChcbiAgICAgICAgdGhpcy5wcm9wcy5yZXN1bHRzLm1hcCgocmVzdWx0OiBSZXN1bHQpID0+IHJlc3VsdC5pZClcbiAgICAgIClcbiAgICAgIGNvbnN0IHNyY3MgPSBBcnJheS5mcm9tKHRoaXMuZ2V0UmVzdWx0U291cmNlcygpKVxuICAgICAgY29uc3Qgc2VhcmNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBzcmNzLFxuICAgICAgICAgIGNxbCxcbiAgICAgICAgICBjb3VudCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICAgIGNvbnN0IGNvbHVtbk9yZGVyID0gT3ZlcnJpZGFibGVHZXRDb2x1bW5PcmRlci5nZXQoKSgpXG4gICAgICBpZiAodGhpcy5wcm9wcy5pc1ppcHBlZCkge1xuICAgICAgICByZXNwb25zZSA9IGF3YWl0IGV4cG9ydFJlc3VsdFNldCgnemlwQ29tcHJlc3Npb24nLCB7XG4gICAgICAgICAgc2VhcmNoZXMsXG4gICAgICAgICAgY291bnQsXG4gICAgICAgICAgc29ydHM6IFtdLFxuICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybWVySWQ6IHVyaUVuY29kZWRUcmFuc2Zvcm1lcklkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZSA9IGF3YWl0IGV4cG9ydFJlc3VsdFNldCh1cmlFbmNvZGVkVHJhbnNmb3JtZXJJZCwge1xuICAgICAgICAgIHNlYXJjaGVzLFxuICAgICAgICAgIGNvdW50LFxuICAgICAgICAgIHNvcnRzOiB0aGlzLnByb3BzLmxhenlRdWVyeVJlc3VsdHM/LnRyYW5zZm9ybVNvcnRzKHtcbiAgICAgICAgICAgIG9yaWdpbmFsU29ydHM6IHRoaXMucHJvcHMubGF6eVF1ZXJ5UmVzdWx0cz8ucGVyc2lzdGFudFNvcnRzLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgIGhpZGRlbkZpZWxkczogW10sXG4gICAgICAgICAgICBjb2x1bW5PcmRlcjogY29sdW1uT3JkZXIsXG4gICAgICAgICAgICBjb2x1bW5BbGlhc01hcDpcbiAgICAgICAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZz8uYXR0cmlidXRlQWxpYXNlcyB8fCB7fSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZW50RGlzcG9zaXRpb24ucGFyc2UoXG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtZGlzcG9zaXRpb24nKVxuICAgICAgICApLnBhcmFtZXRlcnMuZmlsZW5hbWVcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJylcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKVxuICAgICAgICBPdmVycmlkYWJsZVNhdmVGaWxlLmdldCgpKGZpbGVuYW1lLCAnZGF0YTonICsgY29udGVudFR5cGUsIGRhdGEpXG4gICAgICAgIHRoaXMuc2V0RXhwb3J0U3VjY2Vzc2Z1bCh0cnVlKVxuICAgICAgICB0aGlzLm9uQ2xvc2UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGV4cG9ydFN1Y2Nlc3NmdWw6IGZhbHNlIH0pXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KVxuICAgICAgICBhZGRTbmFjaygnRXJyb3I6IENvdWxkIG5vdCBleHBvcnQgcmVzdWx0cy4nLCB7XG4gICAgICAgICAgYWxlcnRQcm9wczogeyBzZXZlcml0eTogJ2Vycm9yJyB9LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGV4cG9ydFN1Y2Nlc3NmdWw6IGZhbHNlIH0pXG4gICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlRXhwb3J0T3B0aW9uQ2hhbmdlKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRGb3JtYXQ6IG5hbWUsXG4gICAgICBleHBvcnREaXNhYmxlZDogZmFsc2UsXG4gICAgfSlcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSZXN1bHRzRXhwb3J0Q29tcG9uZW50XG4gICAgICAgIHNlbGVjdGVkRm9ybWF0PXt0aGlzLnN0YXRlLnNlbGVjdGVkRm9ybWF0fVxuICAgICAgICBleHBvcnRGb3JtYXRzPXt0aGlzLnN0YXRlLmV4cG9ydEZvcm1hdHN9XG4gICAgICAgIGV4cG9ydERpc2FibGVkPXt0aGlzLnN0YXRlLmV4cG9ydERpc2FibGVkfVxuICAgICAgICBvbkV4cG9ydENsaWNrPXt0aGlzLm9uRXhwb3J0Q2xpY2suYmluZCh0aGlzKX1cbiAgICAgICAgaGFuZGxlRXhwb3J0T3B0aW9uQ2hhbmdlPXt0aGlzLmhhbmRsZUV4cG9ydE9wdGlvbkNoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2UuYmluZCh0aGlzKX1cbiAgICAgICAgbG9hZGluZz17dGhpcy5zdGF0ZS5sb2FkaW5nfVxuICAgICAgICBzZXRMb2FkaW5nPXt0aGlzLnNldExvYWRpbmcuYmluZCh0aGlzKX1cbiAgICAgICAgZXhwb3J0U3VjY2Vzc2Z1bD17dGhpcy5zdGF0ZS5leHBvcnRTdWNjZXNzZnVsfVxuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsPXt0aGlzLnNldExvYWRpbmcuYmluZCh0aGlzKX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhMaXN0ZW5UbyhSZXN1bHRzRXhwb3J0KVxuIl19