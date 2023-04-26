import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Button from '@material-ui/core/Button';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks';
import { Elevations } from '../theme/theme';
import CloseIcon from '@material-ui/icons/Close';
import TableExport from '../table-export/table-export';
import { useDialog } from '../dialog';
import { DarkDivider } from '../dark-divider/dark-divider';
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
        selectionInterface: selectionInterface
    }).isSearching;
    var dialogContext = useDialog();
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
        React.createElement(Button, { "data-id": "export-table-button", className: "".concat(isOutdated ? 'invisible' : ''), disabled: isSearching, onClick: function () {
                dialogContext.setProps({
                    PaperProps: {
                        style: {
                            minWidth: 'none'
                        },
                        elevation: Elevations.panels
                    },
                    open: true,
                    disableEnforceFocus: true,
                    children: (React.createElement("div", { className: "min-w-screen-1/2", style: {
                            minHeight: '60vh'
                        } },
                        React.createElement("div", { className: "text-2xl text-center px-2 pb-2 pt-4 font-normal relative" },
                            "Export",
                            React.createElement(Button, { "data-id": "close-button", className: "absolute right-0 top-0 mr-1 mt-1", variant: "text", color: "default", size: "small", onClick: function () {
                                    dialogContext.setProps({
                                        open: false,
                                        children: null
                                    });
                                } },
                                React.createElement(CloseIcon, null))),
                        React.createElement(DarkDivider, { className: "w-full h-min" }),
                        React.createElement(TableExport, { selectionInterface: selectionInterface, filteredAttributes: [] })))
                });
            }, color: "primary" }, "Export")));
};
export default hot(module)(Paging);
//# sourceMappingURL=paging.js.map