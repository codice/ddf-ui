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
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import SummaryManageAttributes from '../summary-manage-attributes/summary-manage-attributes';
import ProgressButton from '../progress-button';
import { DialogActions, DialogContent, LinearProgress } from '@mui/material';
import useSnack from '../../component/hooks/useSnack';
var ResultsExportComponent = function (_a) {
    var selectedFormat = _a.selectedFormat, exportFormats = _a.exportFormats, exportDisabled = _a.exportDisabled, onExportClick = _a.onExportClick, handleExportOptionChange = _a.handleExportOptionChange, exportSuccessful = _a.exportSuccessful, onClose = _a.onClose, loading = _a.loading;
    var addSnack = useSnack();
    React.useEffect(function () {
        var _a;
        handleExportOptionChange((_a = exportFormats[0]) === null || _a === void 0 ? void 0 : _a.displayName);
    }, [exportFormats]);
    if (exportSuccessful) {
        onClose();
    }
    return exportFormats.length === 0 ? (React.createElement(LinearProgress, { className: "w-full h-2" })) : (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, null,
            React.createElement("div", { className: "p-4", style: { minWidth: '400px' } },
                React.createElement("div", { "data-id": "export-format-select", className: "export-option" },
                    React.createElement(Autocomplete, { key: JSON.stringify(exportFormats), "data-id": "filter-type-autocomplete", fullWidth: true, size: "small", options: exportFormats, getOptionLabel: function (option) { return option.displayName; }, isOptionEqualToValue: function (option, value) {
                            return option.displayName === value.displayName;
                        }, onChange: function (_e, newValue) {
                            handleExportOptionChange(newValue.displayName);
                        }, disableClearable: true, value: exportFormats.find(function (format) { return format.displayName === selectedFormat; }) || exportFormats[0], renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined" }))); } })),
                ['CSV', 'RTF', 'XLSX'].includes(selectedFormat) ? (React.createElement(SummaryManageAttributes, { isExport: true })) : null)),
        React.createElement(DialogActions, null,
            React.createElement("div", { className: "pt-2", style: { display: 'flex', justifyContent: 'flex-end' } },
                React.createElement(Button, { className: "mr-2", disabled: loading, variant: "text", onClick: function () {
                        onClose();
                    } }, "Cancel"),
                React.createElement(ProgressButton, { variant: "contained", color: "primary", "data-id": "export-button", disabled: exportDisabled, onClick: function () {
                        onExportClick(addSnack);
                    }, loading: loading }, "Export")))));
};
export default hot(module)(ResultsExportComponent);
//# sourceMappingURL=presentation.js.map