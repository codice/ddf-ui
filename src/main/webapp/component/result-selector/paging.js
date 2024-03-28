import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks';
import CloseIcon from '@mui/icons-material/Close';
import TableExport from '../table-export/table-export';
import { useDialogState } from '../../component/hooks/useDialogState';
import Divider from '@mui/material/Divider';
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
    var _b = __read(React.useState(determineIsOutdated({ selectionInterface: selectionInterface })), 2), isOutdated = _b[0], setIsOutdated = _b[1];
    var _c = useBackbone(), listenTo = _c.listenTo, stopListening = _c.stopListening;
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
        React.createElement(exportDialogState.MuiDialogComponents.Dialog, __assign({}, exportDialogState.MuiDialogProps),
            React.createElement(exportDialogState.MuiDialogComponents.DialogTitle, null,
                React.createElement("div", { className: "flex flex-row items-center justify-between flex-nowrap w-full" },
                    "Export Results",
                    React.createElement(Button, { className: "ml-auto", onClick: function () {
                            exportDialogState.handleClose();
                        } },
                        React.createElement(CloseIcon, null)))),
            React.createElement(Divider, null),
            React.createElement(TableExport, { selectionInterface: selectionInterface })),
        React.createElement(Button, { "data-id": "export-table-button", className: "".concat(isOutdated ? 'invisible' : ''), disabled: isSearching, onClick: function () {
                exportDialogState.handleClick();
            }, color: "primary" }, "Export")));
};
export default hot(module)(Paging);
//# sourceMappingURL=paging.js.map