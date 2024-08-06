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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LWludGVyYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1pbnRlcmFjdGlvbnMvZXhwb3J0LWludGVyYWN0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFBO0FBRTdDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBQzdELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDckUsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBRWxFLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxVQUFDLEtBQStCO0lBQ3JELElBQUEsS0FBQSxPQUEwQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBQTlELGdCQUFnQixRQUFBLEVBQUUsbUJBQW1CLFFBQXlCLENBQUE7SUFDL0QsSUFBQSxLQUFBLE9BQXdCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBNUMsT0FBTyxRQUFBLEVBQUUsVUFBVSxRQUF5QixDQUFBO0lBQ25ELElBQU0saUJBQWlCLEdBQUcsY0FBYyxFQUFFLENBQUE7SUFFMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQzNDLE9BQU8sSUFBSSxDQUFBO0tBQ1o7SUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDMUIsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUNELE9BQU8sQ0FDTDtRQUNFLG9CQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLE1BQU0sZUFDdkMsaUJBQWlCLENBQUMsY0FBYyxJQUNwQyxvQkFBb0IsUUFDcEIsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFFLE1BQU07Z0JBQ3JCLElBQUksTUFBTSxLQUFLLGVBQWUsRUFBRTtvQkFDOUIsT0FBTTtpQkFDUDtnQkFDRCxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUN6RCxDQUFDO1lBRUQsb0JBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsV0FBVztnQkFDaEQsNkJBQUssU0FBUyxFQUFDLCtEQUErRCxhQUV4RSxDQUM0QztZQUNwRCxvQkFBQyxPQUFPLE9BQVc7WUFDbkIsb0JBQUMsYUFBYSxJQUNaLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQ3RDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUN2QyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFDeEMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQ2xDLFVBQVUsRUFBRSxVQUFVLEVBQ3RCLE9BQU8sRUFBRSxPQUFPLEVBQ2hCLE9BQU8sRUFBRTtvQkFDUCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtnQkFDakMsQ0FBQyxHQUNELENBQzJDO1FBRTlDLGdCQUFnQixJQUFJLENBQ25CLG9CQUFDLE1BQU0sSUFBQyxJQUFJLEVBQUUsZ0JBQWdCO1lBQzVCLG9CQUFDLFdBQVc7Z0JBQ1YsNkJBQUssU0FBUyxFQUFDLCtEQUErRCx5QkFFeEUsQ0FDTTtZQUNkLG9CQUFDLE9BQU8sT0FBRztZQUNYLG9CQUFDLGFBQWE7Z0JBQ1osNkJBQ0UsU0FBUyxFQUFDLE1BQU0sRUFDaEIsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFO29CQUV0RCxvQkFBQyxNQUFNLElBQ0wsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUUsY0FBTSxPQUFBLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUExQixDQUEwQixZQUdsQyxDQUNMLENBQ1EsQ0FDVCxDQUNWO1FBRUQsb0JBQUMsbUJBQW1CLElBQ2xCLE9BQU8sRUFBRTtnQkFDUCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQ2YsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUE7WUFDakMsQ0FBQyxFQUNELElBQUksRUFBQyxhQUFhLEVBQ2xCLElBQUksRUFBQyxXQUFXLEVBQ2hCLElBQUksRUFBQyxxREFBcUQsR0FDMUQsQ0FDRCxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVzdWx0c0V4cG9ydCBmcm9tICcuLi9yZXN1bHRzLWV4cG9ydCdcbmltcG9ydCB7IE1ldGFjYXJkSW50ZXJhY3Rpb25Qcm9wcyB9IGZyb20gJy4nXG5pbXBvcnQgeyBNZXRhY2FyZEludGVyYWN0aW9uIH0gZnJvbSAnLi9tZXRhY2FyZC1pbnRlcmFjdGlvbnMnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgZ2V0RXhwb3J0UmVzdWx0cyB9IGZyb20gJy4uL3V0aWxzL2V4cG9ydC9leHBvcnQnXG5pbXBvcnQgeyB1c2VEaWFsb2dTdGF0ZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9ob29rcy91c2VEaWFsb2dTdGF0ZSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgRGl2aWRlciBmcm9tICdAbXVpL21hdGVyaWFsL0RpdmlkZXInXG5pbXBvcnQgeyBEaWFsb2csIERpYWxvZ0FjdGlvbnMsIERpYWxvZ1RpdGxlIH0gZnJvbSAnQG11aS9tYXRlcmlhbCdcblxuZXhwb3J0IGNvbnN0IEV4cG9ydEFjdGlvbnMgPSAocHJvcHM6IE1ldGFjYXJkSW50ZXJhY3Rpb25Qcm9wcykgPT4ge1xuICBjb25zdCBbZXhwb3J0U3VjY2Vzc2Z1bCwgc2V0RXhwb3J0U3VjY2Vzc2Z1bF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGV4cG9ydERpYWxvZ1N0YXRlID0gdXNlRGlhbG9nU3RhdGUoKVxuXG4gIGlmICghcHJvcHMubW9kZWwgfHwgcHJvcHMubW9kZWwubGVuZ3RoIDw9IDApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGlmICghcHJvcHMubW9kZWxbMF0ucGFyZW50KSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZXhwb3J0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2dcbiAgICAgICAgey4uLmV4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ1Byb3BzfVxuICAgICAgICBkaXNhYmxlRXNjYXBlS2V5RG93blxuICAgICAgICBvbkNsb3NlPXsoZXZlbnQsIHJlYXNvbikgPT4ge1xuICAgICAgICAgIGlmIChyZWFzb24gPT09ICdiYWNrZHJvcENsaWNrJykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGV4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ1Byb3BzLm9uQ2xvc2UoZXZlbnQsIHJlYXNvbilcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPGV4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nVGl0bGU+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZmxleC1ub3dyYXAgdy1mdWxsXCI+XG4gICAgICAgICAgICBFeHBvcnRcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9leHBvcnREaWFsb2dTdGF0ZS5NdWlEaWFsb2dDb21wb25lbnRzLkRpYWxvZ1RpdGxlPlxuICAgICAgICA8RGl2aWRlcj48L0RpdmlkZXI+XG4gICAgICAgIDxSZXN1bHRzRXhwb3J0XG4gICAgICAgICAgcmVzdWx0cz17Z2V0RXhwb3J0UmVzdWx0cyhwcm9wcy5tb2RlbCl9XG4gICAgICAgICAgbGF6eVF1ZXJ5UmVzdWx0cz17cHJvcHMubW9kZWxbMF0ucGFyZW50fVxuICAgICAgICAgIHNldEV4cG9ydFN1Y2Nlc3NmdWw9e3NldEV4cG9ydFN1Y2Nlc3NmdWx9XG4gICAgICAgICAgZXhwb3J0U3VjY2Vzc2Z1bD17ZXhwb3J0U3VjY2Vzc2Z1bH1cbiAgICAgICAgICBzZXRMb2FkaW5nPXtzZXRMb2FkaW5nfVxuICAgICAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICAgICAgb25DbG9zZT17KCkgPT4ge1xuICAgICAgICAgICAgZXhwb3J0RGlhbG9nU3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L2V4cG9ydERpYWxvZ1N0YXRlLk11aURpYWxvZ0NvbXBvbmVudHMuRGlhbG9nPlxuXG4gICAgICB7ZXhwb3J0U3VjY2Vzc2Z1bCAmJiAoXG4gICAgICAgIDxEaWFsb2cgb3Blbj17ZXhwb3J0U3VjY2Vzc2Z1bH0+XG4gICAgICAgICAgPERpYWxvZ1RpdGxlPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZmxleC1ub3dyYXAgdy1mdWxsXCI+XG4gICAgICAgICAgICAgIEV4cG9ydCBTdWNjZXNzZnVsIVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9EaWFsb2dUaXRsZT5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwdC0yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBvcnRTdWNjZXNzZnVsKGZhbHNlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIENsb3NlXG4gICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAgICA8L0RpYWxvZz5cbiAgICAgICl9XG5cbiAgICAgIDxNZXRhY2FyZEludGVyYWN0aW9uXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBwcm9wcy5vbkNsb3NlKClcbiAgICAgICAgICBleHBvcnREaWFsb2dTdGF0ZS5oYW5kbGVDbGljaygpXG4gICAgICAgIH19XG4gICAgICAgIGljb249XCJmYSBmYS1zaGFyZVwiXG4gICAgICAgIHRleHQ9XCJFeHBvcnQgYXNcIlxuICAgICAgICBoZWxwPVwiU3RhcnRzIHRoZSBleHBvcnQgcHJvY2VzcyBmb3IgdGhlIHNlbGVjdGVkIHJlc3VsdHMuXCJcbiAgICAgIC8+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoRXhwb3J0QWN0aW9ucylcbiJdfQ==