import { __assign } from "tslib";
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
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
var ResultsExport = function (props) {
    var selectedFormat = props.selectedFormat, exportFormats = props.exportFormats, downloadDisabled = props.downloadDisabled, onDownloadClick = props.onDownloadClick, handleExportOptionChange = props.handleExportOptionChange;
    React.useEffect(function () {
        var _a;
        handleExportOptionChange((_a = exportFormats[0]) === null || _a === void 0 ? void 0 : _a.displayName);
    }, [exportFormats]);
    return (React.createElement("div", { className: "p-4", style: { minWidth: '400px' } },
        React.createElement("div", { "data-id": "export-format-select", className: "export-option" },
            React.createElement(Autocomplete, { key: JSON.stringify(exportFormats), "data-id": "filter-type-autocomplete", fullWidth: true, size: "small", options: exportFormats, getOptionLabel: function (option) { return option.displayName; }, getOptionSelected: function (option, value) {
                    return option.displayName === value.displayName;
                }, onChange: function (_e, newValue) {
                    handleExportOptionChange(newValue.displayName);
                }, disableClearable: true, value: exportFormats.find(function (format) { return format.displayName === selectedFormat; }) || exportFormats[0], renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { variant: "outlined" })); } })),
        React.createElement(Button, { variant: "contained", color: "primary", "data-id": "download-export-button", disabled: downloadDisabled, onClick: onDownloadClick, className: "mt-3", fullWidth: true },
            React.createElement(GetAppIcon, null),
            " Download")));
};
export default hot(module)(ResultsExport);
//# sourceMappingURL=presentation.js.map