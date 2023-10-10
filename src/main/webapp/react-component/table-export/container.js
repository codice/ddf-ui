import { __extends } from "tslib";
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
import TableExportComponent from './presentation';
import LinearProgress from '@mui/material/LinearProgress';
import { hot } from 'react-hot-loader';
import { StartupDataStore } from '../../js/model/Startup/startup';
export default hot(module)(/** @class */ (function (_super) {
    __extends(TableExport, _super);
    function TableExport(props) {
        var _this = _super.call(this, props) || this;
        _this.handleExportFormatChange = function (value) {
            _this.setState({
                exportFormat: value,
            });
        };
        _this.handleExportSizeChange = function (value) {
            _this.setState({
                exportSize: value,
            });
        };
        _this.handleCustomExportCountChange = function (value) {
            _this.setState({ customExportCount: value });
        };
        _this.state = {
            exportSizes: [
                {
                    label: 'Current Page',
                    value: 'currentPage',
                },
                {
                    label: 'All Results',
                    value: 'all',
                },
                {
                    label: 'Specific Number of Results',
                    value: 'custom',
                },
            ],
            exportSize: 'all',
            exportFormat: 'csv',
            customExportCount: StartupDataStore.Configuration.getExportLimit(),
        };
        return _this;
    }
    TableExport.prototype.render = function () {
        var _a = this.state, exportFormat = _a.exportFormat, exportSizes = _a.exportSizes, exportSize = _a.exportSize, customExportCount = _a.customExportCount;
        var _b = this.props, exportFormats = _b.exportFormats, selectionInterface = _b.selectionInterface, onDownloadClick = _b.onDownloadClick, getWarning = _b.getWarning;
        return exportFormats.length === 0 ? (React.createElement(React.Fragment, null,
            React.createElement(LinearProgress, { className: "w-full h-2" }))) : (React.createElement(React.Fragment, null,
            React.createElement(React.Fragment, null, exportFormats.length > 0 ? (React.createElement(TableExportComponent, { exportFormatOptions: exportFormats, exportFormat: exportFormat, exportSizeOptions: exportSizes, exportSize: exportSize, handleExportFormatChange: this.handleExportFormatChange, handleExportSizeChange: this.handleExportSizeChange, handleCustomExportCountChange: this.handleCustomExportCountChange, onDownloadClick: function () {
                    return onDownloadClick({
                        exportFormat: exportFormat,
                        exportSize: exportSize,
                        selectionInterface: selectionInterface,
                        customExportCount: customExportCount,
                    });
                }, warning: getWarning({
                    exportSize: exportSize,
                    selectionInterface: selectionInterface,
                    customExportCount: customExportCount,
                }), customExportCount: customExportCount })) : null)));
    };
    return TableExport;
}(React.Component)));
//# sourceMappingURL=container.js.map