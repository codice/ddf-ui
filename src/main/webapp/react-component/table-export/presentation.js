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
import { hot } from 'react-hot-loader';
import * as React from 'react';
import Button from '@material-ui/core/Button';
import properties from '../../js/properties';
import GetAppIcon from '@material-ui/icons/GetApp';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
export default hot(module)(function (props) {
    var exportSize = props.exportSize, exportFormat = props.exportFormat, exportSizeOptions = props.exportSizeOptions, exportFormatOptions = props.exportFormatOptions, handleExportFormatChange = props.handleExportFormatChange, handleExportSizeChange = props.handleExportSizeChange, handleCustomExportCountChange = props.handleCustomExportCountChange, onDownloadClick = props.onDownloadClick, warning = props.warning, customExportCount = props.customExportCount;
    return (React.createElement("div", { className: "w-full h-full overflow-auto p-2" },
        React.createElement("div", { className: "pt-2" },
            React.createElement(Autocomplete, { size: "small", options: exportSizeOptions, onChange: function (_e, newValue) {
                    handleExportSizeChange(newValue.value);
                }, getOptionSelected: function (option) { return option.value === exportSize; }, getOptionLabel: function (option) {
                    return option.label;
                }, disableClearable: true, value: exportSizeOptions.find(function (choice) { return choice.value === exportSize; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Export", variant: "outlined" }))); } })),
        exportSize === 'custom' ? (React.createElement("div", { className: "pt-2" },
            React.createElement(TextField, { fullWidth: true, size: "small", type: "number", label: "", placeholder: "Enter number of results you would like to export", name: "customExport", value: customExportCount, onChange: function (e) {
                    handleCustomExportCountChange(e.target.value);
                }, variant: "outlined" }))) : (React.createElement("div", null)),
        React.createElement("div", { className: "pt-2" },
            React.createElement(Autocomplete, { size: "small", options: exportFormatOptions, onChange: function (_e, newValue) {
                    handleExportFormatChange(newValue.value);
                }, getOptionSelected: function (option) { return option.value === exportFormat; }, getOptionLabel: function (option) {
                    return option.label;
                }, disableClearable: true, value: exportFormatOptions.find(function (choice) { return choice.value === exportFormat; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "as", variant: "outlined" }))); } })),
        warning && (React.createElement("div", { className: "warning text-center pt-1" },
            React.createElement("i", { className: "fa fa-warning" }),
            React.createElement("span", null, warning))),
        React.createElement("div", { className: "pt-2" },
            React.createElement(Button, { fullWidth: true, variant: "contained", color: "primary", disabled: exportSize === 'custom' &&
                    customExportCount > properties.exportResultLimit, onClick: onDownloadClick },
                React.createElement(GetAppIcon, null),
                " Download"))));
});
//# sourceMappingURL=presentation.js.map