import { __assign, __read } from "tslib";
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
import ResultsExport from '../results-export';
import { MetacardInteraction } from './metacard-interactions';
import { hot } from 'react-hot-loader';
import { getExportResults } from '../utils/export/export';
import { useDialogState } from '../../component/hooks/useDialogState';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';
export var ExportActions = function (props) {
    var _a = __read(React.useState(false), 2), exportSuccessful = _a[0], setExportSuccessful = _a[1];
    var _b = __read(React.useState(false), 2), loading = _b[0], setLoading = _b[1];
    var exportDialogState = useDialogState();
    if (!props.model || props.model.length <= 0) {
        return null;
    }
    if (!props.model[0].parent) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(exportDialogState.MuiDialogComponents.Dialog, __assign({}, exportDialogState.MuiDialogProps, { disableEscapeKeyDown: true, onClose: function (event, reason) {
                if (reason === 'backdropClick') {
                    return;
                }
                exportDialogState.MuiDialogProps.onClose(event, reason);
            } }),
            React.createElement(exportDialogState.MuiDialogComponents.DialogTitle, null,
                React.createElement("div", { className: "flex flex-row items-center justify-between flex-nowrap w-full" }, "Export")),
            React.createElement(Divider, null),
            React.createElement(ResultsExport, { results: getExportResults(props.model), lazyQueryResults: props.model[0].parent, setExportSuccessful: setExportSuccessful, exportSuccessful: exportSuccessful, setLoading: setLoading, loading: loading, onClose: function () {
                    exportDialogState.handleClose();
                } })),
        exportSuccessful && (React.createElement(Dialog, { open: exportSuccessful },
            React.createElement(DialogTitle, null,
                React.createElement("div", { className: "flex flex-row items-center justify-between flex-nowrap w-full" }, "Export Successful!")),
            React.createElement(Divider, null),
            React.createElement(DialogActions, null,
                React.createElement("div", { className: "pt-2", style: { display: 'flex', justifyContent: 'flex-end' } },
                    React.createElement(Button, { color: "primary", onClick: function () { return setExportSuccessful(false); } }, "Close"))))),
        React.createElement(MetacardInteraction, { onClick: function () {
                props.onClose();
                exportDialogState.handleClick();
            }, icon: "fa fa-share", text: "Export as", help: "Starts the export process for the selected results." })));
};
export default hot(module)(ExportActions);
//# sourceMappingURL=export-interaction.js.map