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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9yZXN1bHQtc2VsZWN0b3IvcGFnaW5nLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsMENBQTBDLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RixPQUFPLFdBQVcsTUFBTSw4QkFBOEIsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDckUsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBU2xFLElBQU0sbUJBQW1CLEdBQUcsVUFBQyxFQUE2QjtRQUEzQixrQkFBa0Isd0JBQUE7SUFDL0MsSUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQ3JELElBQUksTUFBTSxFQUFFO1FBQ1YsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBWSxDQUFBO0tBQzNDO0lBQ0QsT0FBTyxLQUFLLENBQUE7QUFDZCxDQUFDLENBQUE7QUFFRCxJQUFNLE1BQU0sR0FBRyxVQUFDLEVBQTZCO1FBQTNCLGtCQUFrQix3QkFBQTtJQUMxQixJQUFBLFdBQVcsR0FBSywwQ0FBMEMsQ0FBQztRQUNqRSxrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQyxZQUZpQixDQUVqQjtJQUNGLElBQU0saUJBQWlCLEdBQUcsY0FBYyxFQUFF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RUFBRSxrQkFBa0IsRUFDdEMsbUJBQW1CLEVBQUUsbUJBQW1CLEVBQ3hDLGdCQUFnQixFQUFFLGdCQUFnQixFQUNsQyxPQUFPLEVBQUU7b0JBQ1AsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUE7Z0JBQ2pDLENBQUMsR0FDRCxDQUMyQztRQUMvQyxvQkFBQyxNQUFNLGVBQ0cscUJBQXFCLEVBQzdCLFNBQVMsRUFBRSxVQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsRUFDN0MsUUFBUSxFQUFFLFdBQVcsRUFDckIsT0FBTyxFQUFFO2dCQUNQLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQ2pDLENBQUMsRUFDRCxLQUFLLEVBQUMsU0FBUyxhQUdSO1FBQ1IsZ0JBQWdCLElBQUksQ0FDbkIsb0JBQUMsTUFBTSxJQUFDLElBQUksRUFBRSxnQkFBZ0I7WUFDNUIsb0JBQUMsV0FBVztnQkFDViw2QkFBSyxTQUFTLEVBQUMsK0RBQStELHlCQUV4RSxDQUNNO1lBQ2Qsb0JBQUMsT0FBTyxPQUFHO1lBQ1gsb0JBQUMsYUFBYTtnQkFDWiw2QkFDRSxTQUFTLEVBQUMsTUFBTSxFQUNoQixLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7b0JBRXRELG9CQUFDLE1BQU0sSUFDTCxLQUFLLEVBQUMsU0FBUyxFQUNmLE9BQU8sRUFBRSxjQUFNLE9BQUEsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQTFCLENBQTBCLFlBR2xDLENBQ0wsQ0FDUSxDQUNULENBQ1YsQ0FDQSxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyB1c2VCYWNrYm9uZSB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNTdGF0dXNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCBUYWJsZUV4cG9ydCBmcm9tICcuLi90YWJsZS1leHBvcnQvdGFibGUtZXhwb3J0J1xuaW1wb3J0IHsgdXNlRGlhbG9nU3RhdGUgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvaG9va3MvdXNlRGlhbG9nU3RhdGUnXG5pbXBvcnQgRGl2aWRlciBmcm9tICdAbXVpL21hdGVyaWFsL0RpdmlkZXInXG5pbXBvcnQgeyBEaWFsb2csIERpYWxvZ0FjdGlvbnMsIERpYWxvZ1RpdGxlIH0gZnJvbSAnQG11aS9tYXRlcmlhbCdcblxudHlwZSBQcm9wcyA9IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgb25DbG9zZT86IGFueVxuICBleHBvcnRTdWNjZXNzZnVsPzogYm9vbGVhblxuICBzZXRFeHBvcnRTdWNjZXNzZnVsPzogKCkgPT4gdm9pZFxufVxuXG5jb25zdCBkZXRlcm1pbmVJc091dGRhdGVkID0gKHsgc2VsZWN0aW9uSW50ZXJmYWNlIH06IFByb3BzKSA9PiB7XG4gIGNvbnN0IHNlYXJjaCA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXQoJ2N1cnJlbnRRdWVyeScpXG4gIGlmIChzZWFyY2gpIHtcbiAgICByZXR1cm4gc2VhcmNoLmdldCgnaXNPdXRkYXRlZCcpIGFzIGJvb2xlYW5cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuY29uc3QgUGFnaW5nID0gKHsgc2VsZWN0aW9uSW50ZXJmYWNlIH06IFByb3BzKSA9PiB7XG4gIGNvbnN0IHsgaXNTZWFyY2hpbmcgfSA9IHVzZUxhenlSZXN1bHRzU3RhdHVzRnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCBleHBvcnREaWFsb2dTdGF0ZSA9IHVzZURpYWxvZ1N0YXRlKClcblxuICBjb25zdCBbZXhwb3J0U3VjY2Vzc2Z1bCwgc2V0RXhwb3J0U3VjY2Vzc2Z1bF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBbaXNPdXRkYXRlZCwgc2V0SXNPdXRkYXRlZF0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBkZXRlcm1pbmVJc091dGRhdGVkKHsgc2VsZWN0aW9uSW50ZXJmYWNlIH0pXG4gIClcbiAgY29uc3QgeyBsaXN0ZW5Ubywgc3RvcExpc3RlbmluZyB9ID0gdXNlQmFja2JvbmUoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHNlYXJjaCA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXQoJ2N1cnJlbnRRdWVyeScpXG4gICAgaWYgKHNlYXJjaCkge1xuICAgICAgbGlzdGVuVG8oc2VhcmNoLCAnY2hhbmdlOmlzT3V0ZGF0ZWQnLCAoKSA9PiB7XG4gICAgICAgIHNldElzT3V0ZGF0ZWQoZGV0ZXJtaW5lSXNPdXRkYXRlZCh7IHNlbGVjdGlvbkludGVyZmFjZSB9KSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgIHN0b3BMaXN0ZW5pbmcoc2VhcmNoKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgaWYgKFxuICAgICFzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKSB8fFxuICAgICFzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKS5nZXQoJ3Jlc3VsdCcpXG4gICkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBpc1ByZXZpb3VzRGlzYWJsZWQgPVxuICAgIGlzT3V0ZGF0ZWQgfHxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKS5oYXNQcmV2aW91c1NlcnZlclBhZ2UoKSA9PT0gZmFsc2VcbiAgY29uc3QgaXNOZXh0RGlzYWJsZWQgPVxuICAgIGlzT3V0ZGF0ZWQgfHxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKS5oYXNOZXh0U2VydmVyUGFnZSgpID09PSBmYWxzZVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8QnV0dG9uXG4gICAgICAgIGRhdGEtaWQ9XCJwcmV2LXBhZ2UtYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgJHtpc1ByZXZpb3VzRGlzYWJsZWQgPyAnaW52aXNpYmxlJyA6ICcnfWB9XG4gICAgICAgIGRpc2FibGVkPXtpc1ByZXZpb3VzRGlzYWJsZWR9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKS5nZXRQcmV2aW91c1NlcnZlclBhZ2UoKVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBQcmV2IFBhZ2VcbiAgICAgIDwvQnV0dG9uPlxuICAgICAgPEJ1dHRvblxuICAgICAgICBkYXRhLWlkPVwibmV4dC1wYWdlLWJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YCR7aXNQcmV2aW91c0Rpc2FibGVkICYmIGlzTmV4dERpc2FibGVkID8gJ2ludmlzaWJsZScgOiAnJ31gfVxuICAgICAgICBkaXNhYmxlZD17aXNOZXh0RGlzYWJsZWR9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0KCdjdXJyZW50UXVlcnknKS5nZXROZXh0U2VydmVyUGFnZSgpXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIE5leHQgUGFnZVxuICAgICAgPC9CdXR0b24+XG4gICAgICA8ZXhwb3J0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2dcbiAgICAgICAgey4uLmV4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ1Byb3BzfVxuICAgICAgICBkaXNhYmxlRXNjYXBlS2V5RG93blxuICAgICAgICBvbkNsb3NlPXsoZXZlbnQsIHJlYXNvbikgPT4ge1xuICAgICAgICAgIGlmIChyZWFzb24gPT09ICdiYWNrZHJvcENsaWNrJykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGV4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ1Byb3BzLm9uQ2xvc2UoZXZlbnQsIHJlYXNvbilcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPGV4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nVGl0bGU+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZmxleC1ub3dyYXAgdy1mdWxsXCI+XG4gICAgICAgICAgICBFeHBvcnQgUmVzdWx0c1xuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2V4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nVGl0bGU+XG4gICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgIDxUYWJsZUV4cG9ydFxuICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgIHNldEV4cG9ydFN1Y2Nlc3NmdWw9e3NldEV4cG9ydFN1Y2Nlc3NmdWx9XG4gICAgICAgICAgZXhwb3J0U3VjY2Vzc2Z1bD17ZXhwb3J0U3VjY2Vzc2Z1bH1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgICBleHBvcnREaWFsb2dTdGF0ZS5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvZXhwb3J0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2c+XG4gICAgICA8QnV0dG9uXG4gICAgICAgIGRhdGEtaWQ9XCJleHBvcnQtdGFibGUtYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgJHtpc091dGRhdGVkID8gJ2ludmlzaWJsZScgOiAnJ31gfVxuICAgICAgICBkaXNhYmxlZD17aXNTZWFyY2hpbmd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBleHBvcnREaWFsb2dTdGF0ZS5oYW5kbGVDbGljaygpXG4gICAgICAgIH19XG4gICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICA+XG4gICAgICAgIEV4cG9ydFxuICAgICAgPC9CdXR0b24+XG4gICAgICB7ZXhwb3J0U3VjY2Vzc2Z1bCAmJiAoXG4gICAgICAgIDxEaWFsb2cgb3Blbj17ZXhwb3J0U3VjY2Vzc2Z1bH0+XG4gICAgICAgICAgPERpYWxvZ1RpdGxlPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZmxleC1ub3dyYXAgdy1mdWxsXCI+XG4gICAgICAgICAgICAgIEV4cG9ydCBTdWNjZXNzZnVsIVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9EaWFsb2dUaXRsZT5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwdC0yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBvcnRTdWNjZXNzZnVsKGZhbHNlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIENsb3NlXG4gICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAgICA8L0RpYWxvZz5cbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoUGFnaW5nKVxuIl19