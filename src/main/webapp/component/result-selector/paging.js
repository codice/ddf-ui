import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks';
import TableExport from '../table-export/table-export';
import { useDialogState } from '../../component/hooks/useDialogState';
import Divider from '@mui/material/Divider';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';
var determineIsOutdated = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var search = selectionInterface.get('currentQuery');
    if (search) {
        return search.get('isOutdated');
    }
    return false;
};
var Paging = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var isSearching = useLazyResultsStatusFromSelectionInterface({
        selectionInterface: selectionInterface,
    }).isSearching;
    var exportDialogState = useDialogState();
    var _b = __read(React.useState(false), 2), exportSuccessful = _b[0], setExportSuccessful = _b[1];
    var _c = __read(React.useState(determineIsOutdated({ selectionInterface: selectionInterface })), 2), isOutdated = _c[0], setIsOutdated = _c[1];
    var _d = useBackbone(), listenTo = _d.listenTo, stopListening = _d.stopListening;
    React.useEffect(function () {
        var search = selectionInterface.get('currentQuery');
        if (search) {
            listenTo(search, 'change:isOutdated', function () {
                setIsOutdated(determineIsOutdated({ selectionInterface: selectionInterface }));
            });
        }
        return function () {
            if (search) {
                stopListening(search);
            }
        };
    });
    if (!selectionInterface.get('currentQuery') ||
        !selectionInterface.get('currentQuery').get('result')) {
        return null;
    }
    var isPreviousDisabled = isOutdated ||
        selectionInterface.get('currentQuery').hasPreviousServerPage() === false;
    var isNextDisabled = isOutdated ||
        selectionInterface.get('currentQuery').hasNextServerPage() === false;
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { "data-id": "prev-page-button", className: "".concat(isPreviousDisabled ? 'invisible' : ''), disabled: isPreviousDisabled, onClick: function () {
                selectionInterface.get('currentQuery').getPreviousServerPage();
            } }, "Prev Page"),
        React.createElement(Button, { "data-id": "next-page-button", className: "".concat(isPreviousDisabled && isNextDisabled ? 'invisible' : ''), disabled: isNextDisabled, onClick: function () {
                selectionInterface.get('currentQuery').getNextServerPage();
            } }, "Next Page"),
        React.createElement(exportDialogState.MuiDialogComponents.Dialog, __assign({}, exportDialogState.MuiDialogProps, { disableEscapeKeyDown: true, onClose: function (event, reason) {
                if (reason === 'backdropClick') {
                    return;
                }
                exportDialogState.MuiDialogProps.onClose(event, reason);
            } }),
            React.createElement(exportDialogState.MuiDialogComponents.DialogTitle, null,
                React.createElement("div", { className: "flex flex-row items-center justify-between flex-nowrap w-full" }, "Export Results")),
            React.createElement(Divider, null),
            React.createElement(TableExport, { selectionInterface: selectionInterface, setExportSuccessful: setExportSuccessful, exportSuccessful: exportSuccessful, onClose: function () {
                    exportDialogState.handleClose();
                } })),
        React.createElement(Button, { "data-id": "export-table-button", className: "".concat(isOutdated ? 'invisible' : ''), disabled: isSearching, onClick: function () {
                exportDialogState.handleClick();
            }, color: "primary" }, "Export"),
        exportSuccessful && (React.createElement(Dialog, { open: exportSuccessful },
            React.createElement(DialogTitle, null,
                React.createElement("div", { className: "flex flex-row items-center justify-between flex-nowrap w-full" }, "Export Successful!")),
            React.createElement(Divider, null),
            React.createElement(DialogActions, null,
                React.createElement("div", { className: "pt-2", style: { display: 'flex', justifyContent: 'flex-end' } },
                    React.createElement(Button, { color: "primary", onClick: function () { return setExportSuccessful(false); } }, "Close")))))));
};
export default hot(module)(Paging);
//# sourceMappingURL=paging.js.map