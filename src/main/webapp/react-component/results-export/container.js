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
        _this.state = {
            selectedFormat: 'Binary Resource',
            exportFormats: [],
            downloadDisabled: true,
        };
        return _this;
    }
    ResultsExport.prototype.componentDidUpdate = function (_prevProps) {
        if (_prevProps.results !== this.props.results ||
            _prevProps.isZipped !== this.props.isZipped) {
            this.fetchExportOptions();
            this.setState({
                selectedFormat: 'Binary Resource',
                downloadDisabled: true,
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
    ResultsExport.prototype.onDownloadClick = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var uriEncodedTransformerId, response, count, cql, srcs, searches, columnOrder, filename, contentType, data;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uriEncodedTransformerId = this.getSelectedExportFormatId();
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
                        if (!this.props.isZipped) return [3 /*break*/, 2];
                        return [4 /*yield*/, exportResultSet('zipCompression', {
                                searches: searches,
                                count: count,
                                sorts: [],
                                args: {
                                    transformerId: uriEncodedTransformerId,
                                },
                            })];
                    case 1:
                        response = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, exportResultSet(uriEncodedTransformerId, {
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
                    case 3:
                        response = _d.sent();
                        _d.label = 4;
                    case 4:
                        if (!(response.status === 200)) return [3 /*break*/, 6];
                        filename = contentDisposition.parse(response.headers.get('content-disposition')).parameters.filename;
                        contentType = response.headers.get('content-type');
                        return [4 /*yield*/, response.blob()];
                    case 5:
                        data = _d.sent();
                        OverridableSaveFile.get()(filename, 'data:' + contentType, data);
                        _d.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ResultsExport.prototype.handleExportOptionChange = function (name) {
        this.setState({
            selectedFormat: name,
            downloadDisabled: false,
        });
    };
    ResultsExport.prototype.render = function () {
        return (React.createElement(ResultsExportComponent, { selectedFormat: this.state.selectedFormat, exportFormats: this.state.exportFormats, downloadDisabled: this.state.downloadDisabled, onDownloadClick: this.onDownloadClick.bind(this), handleExportOptionChange: this.handleExportOptionChange.bind(this) }));
    };
    return ResultsExport;
}(React.Component));
export default hot(module)(withListenTo(ResultsExport));
//# sourceMappingURL=container.js.map