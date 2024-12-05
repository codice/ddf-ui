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
import { __assign, __read } from "tslib";
import Button from '@mui/material/Button';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getIconClassName } from '../results-visual/result-item';
import LazyMetacardInteractions from '../results-visual/lazy-metacard-interactions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMenuState } from '../../menu-state/menu-state';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../theme/theme';
import OverflowTooltip from '../../overflow-tooltip/overflow-tooltip';
import Tabs from '@mui/material/Tabs';
import MaterialTab from '@mui/material/Tab';
import MetacardTabs, { TabNames } from '../../tabs/metacard/tabs-metacard';
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks';
import Extensions from '../../../extension-points';
var useSelectedResultsArrayFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState([]), 2), selectedResultsArray = _b[0], setSelectedResultsArray = _b[1];
    var selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    React.useEffect(function () {
        setSelectedResultsArray(Object.values(selectedResults));
    }, [selectedResults]);
    return selectedResultsArray;
};
export var TitleView = function (_a) {
    var lazyResult = _a.lazyResult;
    var menuState = useMenuState();
    useRerenderOnBackboneSync({ lazyResult: lazyResult });
    return (React.createElement("div", { className: "flex flex-row items-center justify-center flex-nowrap p-2" },
        React.createElement("span", { className: "".concat(getIconClassName({ lazyResult: lazyResult }), " font-awesome-span") }),
        React.createElement(Extensions.resultTitleIconAddOn, { lazyResult: lazyResult }),
        React.createElement(OverflowTooltip, { className: 'truncate' }, lazyResult.plain.metacard.properties.title),
        React.createElement(Button, __assign({}, menuState.MuiButtonProps),
            React.createElement(MoreVertIcon, null)),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps, { keepMounted: true }),
            React.createElement(Paper, { elevation: Elevations.overlays },
                React.createElement(LazyMetacardInteractions, { lazyResults: [lazyResult], onClose: menuState.handleClose })))));
};
var defaultActiveTab = 'Details';
var useLastAsDefaultActiveTab = function (tabIndex) {
    React.useEffect(function () {
        defaultActiveTab = tabIndex;
    }, [tabIndex]);
};
var useIndexForSelectedResults = function (selectedResults) {
    var _a = __read(React.useState(0), 2), index = _a[0], setIndex = _a[1];
    React.useEffect(function () {
        setIndex(0);
    }, [selectedResults]);
    return [index, setIndex];
};
var usePossibleMetacardTabs = function (_a) {
    var result = _a.result;
    var _b = __read(React.useState(MetacardTabs), 2), possibleMetacardTabs = _b[0], setPossibleMetacardTabs = _b[1];
    React.useEffect(function () {
        if (result) {
            var copyOfMetacardTabs = __assign({}, MetacardTabs);
            if (result.isRevision()) {
                delete copyOfMetacardTabs[TabNames.History];
                delete copyOfMetacardTabs[TabNames.Actions];
            }
            if (result.isDeleted()) {
                delete copyOfMetacardTabs[TabNames.History];
                delete copyOfMetacardTabs[TabNames.Actions];
            }
            if (result.isRemote()) {
                delete copyOfMetacardTabs[TabNames.History];
                delete copyOfMetacardTabs[TabNames.Quality];
            }
            if (!result.hasPreview()) {
                delete copyOfMetacardTabs[TabNames.Preview];
            }
            setPossibleMetacardTabs(copyOfMetacardTabs);
        }
        else {
            setPossibleMetacardTabs({});
        }
    }, [result]);
    return possibleMetacardTabs;
};
var useMetacardTabs = function (_a) {
    var _b;
    var result = _a.result;
    var possibleMetacardTabs = usePossibleMetacardTabs({ result: result });
    var _c = __read(React.useState(defaultActiveTab), 2), activeTab = _c[0], setActiveTab = _c[1];
    useLastAsDefaultActiveTab(activeTab);
    React.useEffect(function () {
        if (Object.keys(possibleMetacardTabs).length > 0 &&
            !possibleMetacardTabs[activeTab]) {
            setActiveTab(TabNames.Details);
        }
    }, [possibleMetacardTabs]);
    return {
        possibleMetacardTabs: possibleMetacardTabs,
        activeTab: activeTab,
        setActiveTab: setActiveTab,
        TabContent: ((_b = possibleMetacardTabs[activeTab]) === null || _b === void 0 ? void 0 : _b.content) || (function () { return null; }),
    };
};
var Inspector = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var selectedResults = useSelectedResultsArrayFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var _b = __read(useIndexForSelectedResults(selectedResults), 2), index = _b[0], setIndex = _b[1];
    var amountSelected = selectedResults.length;
    var currentResult = selectedResults[index];
    var _c = useMetacardTabs({ result: currentResult }), possibleMetacardTabs = _c.possibleMetacardTabs, activeTab = _c.activeTab, setActiveTab = _c.setActiveTab, TabContent = _c.TabContent;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex flex-col flex-nowrap h-full overflow-hidden" },
            amountSelected > 1 ? (React.createElement("div", { className: "flex flex-row items-center justify-center flex-nowrap shrink-0 grow-0" },
                React.createElement(Button, { onClick: function () {
                        setIndex(index - 1);
                    }, disabled: index === 0 },
                    React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "Mui-text-text-primary Mui-icon-size-small" }),
                    React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "-ml-3 Mui-text-text-primary Mui-icon-size-small" })),
                "Item ",
                index + 1,
                " / ",
                amountSelected,
                React.createElement(Button, { onClick: function () {
                        setIndex(index + 1);
                    }, disabled: index === amountSelected - 1 },
                    React.createElement(KeyboardArrowRightIcon, { color: "inherit", className: "Mui-text-text-primary" }),
                    React.createElement(KeyboardArrowRightIcon, { color: "inherit", className: "-ml-5 Mui-text-text-primary" })))) : null,
            currentResult ? (React.createElement(React.Fragment, null,
                React.createElement(TitleView, { lazyResult: currentResult }),
                React.createElement("div", { className: "flex flex-col flex-nowrap shrink overflow-hidden h-full" },
                    React.createElement(Tabs, { value: activeTab, onChange: function (_e, newValue) {
                            setActiveTab(newValue);
                        }, className: "shrink-0 w-full", scrollButtons: "auto", variant: "scrollable" }, Object.entries(possibleMetacardTabs).map(function (_a) {
                        var _b;
                        var _c = __read(_a, 2), tabName = _c[0], tabDefinition = _c[1];
                        return (React.createElement(MaterialTab, { key: tabName, value: tabName, label: ((_b = tabDefinition.header) === null || _b === void 0 ? void 0 : _b.call(tabDefinition, { result: currentResult })) ||
                                tabName }));
                    })),
                    React.createElement("div", { className: "h-full w-full shrink overflow-hidden" },
                        React.createElement(TabContent, { result: currentResult, selectionInterface: selectionInterface, key: currentResult.plain.id }))))) : (React.createElement("div", { className: "p-2 text-center" }, "Please select result(s) to display in the inspector.")))));
};
export default hot(module)(Inspector);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL2luc3BlY3Rvci9pbnNwZWN0b3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7O0FBRUosT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRXRDLE9BQU8sRUFBRSxtREFBbUQsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3JHLE9BQU8scUJBQXFCLE1BQU0sdUNBQXVDLENBQUE7QUFDekUsT0FBTyxzQkFBc0IsTUFBTSx3Q0FBd0MsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUNoRSxPQUFPLHdCQUF3QixNQUFNLDhDQUE4QyxDQUFBO0FBQ25GLE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFBO0FBQ3ZELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUMxRCxPQUFPLE9BQU8sTUFBTSx1QkFBdUIsQ0FBQTtBQUMzQyxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxlQUFlLE1BQU0seUNBQXlDLENBQUE7QUFDckUsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxXQUFXLE1BQU0sbUJBQW1CLENBQUE7QUFDM0MsT0FBTyxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUMxRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNuRixPQUFPLFVBQVUs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SUFFbkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FDdkMsVUFBQyxFQUF3Qjs7NEJBQXhCLEtBQUEsYUFBd0IsRUFBdkIsT0FBTyxRQUFBLEVBQUUsYUFBYSxRQUFBO3dCQUN0QixPQUFPLENBQ0wsb0JBQUMsV0FBVyxJQUNWLEdBQUcsRUFBRSxPQUFPLEVBQ1osS0FBSyxFQUFFLE9BQU8sRUFDZCxLQUFLLEVBQ0gsQ0FBQSxNQUFBLGFBQWEsQ0FBQyxNQUFNLDhEQUFHLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDO2dDQUNqRCxPQUFPLEdBRVQsQ0FDSCxDQUFBO29CQUNILENBQUMsQ0FDRixDQUNJO29CQUVQLDZCQUFLLFNBQVMsRUFBQyxzQ0FBc0M7d0JBQ25ELG9CQUFDLFVBQVUsSUFDVCxNQUFNLEVBQUUsYUFBYSxFQUNyQixrQkFBa0IsRUFBRSxrQkFBa0IsRUFDdEMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUMzQixDQUNFLENBQ0YsQ0FDTCxDQUNKLENBQUMsQ0FBQyxDQUFDLENBQ0YsNkJBQUssU0FBUyxFQUFDLGlCQUFpQiwyREFFMUIsQ0FDUCxDQUNHLENBQ0wsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyB1c2VMYXp5UmVzdWx0c1NlbGVjdGVkUmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24taW50ZXJmYWNlL2hvb2tzJ1xuaW1wb3J0IEtleWJvYXJkQXJyb3dMZWZ0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0tleWJvYXJkQXJyb3dMZWZ0J1xuaW1wb3J0IEtleWJvYXJkQXJyb3dSaWdodEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9LZXlib2FyZEFycm93UmlnaHQnXG5pbXBvcnQgeyBnZXRJY29uQ2xhc3NOYW1lIH0gZnJvbSAnLi4vcmVzdWx0cy12aXN1YWwvcmVzdWx0LWl0ZW0nXG5pbXBvcnQgTGF6eU1ldGFjYXJkSW50ZXJhY3Rpb25zIGZyb20gJy4uL3Jlc3VsdHMtdmlzdWFsL2xhenktbWV0YWNhcmQtaW50ZXJhY3Rpb25zJ1xuaW1wb3J0IE1vcmVWZXJ0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL01vcmVWZXJ0J1xuaW1wb3J0IHsgdXNlTWVudVN0YXRlIH0gZnJvbSAnLi4vLi4vbWVudS1zdGF0ZS9tZW51LXN0YXRlJ1xuaW1wb3J0IFBvcG92ZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQgT3ZlcmZsb3dUb29sdGlwIGZyb20gJy4uLy4uL292ZXJmbG93LXRvb2x0aXAvb3ZlcmZsb3ctdG9vbHRpcCdcbmltcG9ydCBUYWJzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGFicydcbmltcG9ydCBNYXRlcmlhbFRhYiBmcm9tICdAbXVpL21hdGVyaWFsL1RhYidcbmltcG9ydCBNZXRhY2FyZFRhYnMsIHsgVGFiTmFtZXMgfSBmcm9tICcuLi8uLi90YWJzL21ldGFjYXJkL3RhYnMtbWV0YWNhcmQnXG5pbXBvcnQgeyB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IEV4dGVuc2lvbnMgZnJvbSAnLi4vLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcblxudHlwZSBJbnNwZWN0b3JUeXBlID0ge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufVxuXG5jb25zdCB1c2VTZWxlY3RlZFJlc3VsdHNBcnJheUZyb21TZWxlY3Rpb25JbnRlcmZhY2UgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiBJbnNwZWN0b3JUeXBlKSA9PiB7XG4gIGNvbnN0IFtzZWxlY3RlZFJlc3VsdHNBcnJheSwgc2V0U2VsZWN0ZWRSZXN1bHRzQXJyYXldID0gUmVhY3QudXNlU3RhdGUoXG4gICAgW10gYXMgTGF6eVF1ZXJ5UmVzdWx0W11cbiAgKVxuICBjb25zdCBzZWxlY3RlZFJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c1NlbGVjdGVkUmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRTZWxlY3RlZFJlc3VsdHNBcnJheShPYmplY3QudmFsdWVzKHNlbGVjdGVkUmVzdWx0cykpXG4gIH0sIFtzZWxlY3RlZFJlc3VsdHNdKVxuICByZXR1cm4gc2VsZWN0ZWRSZXN1bHRzQXJyYXlcbn1cblxudHlwZSBUaXRsZVZpZXdUeXBlID0ge1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IFRpdGxlVmlldyA9ICh7IGxhenlSZXN1bHQgfTogVGl0bGVWaWV3VHlwZSkgPT4ge1xuICBjb25zdCBtZW51U3RhdGUgPSB1c2VNZW51U3RhdGUoKVxuICB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jKHsgbGF6eVJlc3VsdCB9KVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZmxleC1ub3dyYXAgcC0yXCI+XG4gICAgICA8c3BhblxuICAgICAgICBjbGFzc05hbWU9e2Ake2dldEljb25DbGFzc05hbWUoeyBsYXp5UmVzdWx0IH0pfSBmb250LWF3ZXNvbWUtc3BhbmB9XG4gICAgICA+PC9zcGFuPlxuICAgICAgPEV4dGVuc2lvbnMucmVzdWx0VGl0bGVJY29uQWRkT24gbGF6eVJlc3VsdD17bGF6eVJlc3VsdH0gLz5cbiAgICAgIDxPdmVyZmxvd1Rvb2x0aXAgY2xhc3NOYW1lPXsndHJ1bmNhdGUnfT5cbiAgICAgICAge2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX1cbiAgICAgIDwvT3ZlcmZsb3dUb29sdGlwPlxuICAgICAgPEJ1dHRvbiB7Li4ubWVudVN0YXRlLk11aUJ1dHRvblByb3BzfT5cbiAgICAgICAgPE1vcmVWZXJ0SWNvbiAvPlxuICAgICAgPC9CdXR0b24+XG4gICAgICA8UG9wb3ZlciB7Li4ubWVudVN0YXRlLk11aVBvcG92ZXJQcm9wc30ga2VlcE1vdW50ZWQ9e3RydWV9PlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfT5cbiAgICAgICAgICA8TGF6eU1ldGFjYXJkSW50ZXJhY3Rpb25zXG4gICAgICAgICAgICBsYXp5UmVzdWx0cz17W2xhenlSZXN1bHRdfVxuICAgICAgICAgICAgb25DbG9zZT17bWVudVN0YXRlLmhhbmRsZUNsb3NlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvUGFwZXI+XG4gICAgICA8L1BvcG92ZXI+XG4gICAgPC9kaXY+XG4gIClcbn1cblxubGV0IGRlZmF1bHRBY3RpdmVUYWIgPSAnRGV0YWlscydcblxuY29uc3QgdXNlTGFzdEFzRGVmYXVsdEFjdGl2ZVRhYiA9ICh0YWJJbmRleDogc3RyaW5nKSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZGVmYXVsdEFjdGl2ZVRhYiA9IHRhYkluZGV4XG4gIH0sIFt0YWJJbmRleF0pXG59XG5cbmNvbnN0IHVzZUluZGV4Rm9yU2VsZWN0ZWRSZXN1bHRzID0gKFxuICBzZWxlY3RlZFJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdXG4pOiBbbnVtYmVyLCAoaW5kZXg6IG51bWJlcikgPT4gdm9pZF0gPT4ge1xuICBjb25zdCBbaW5kZXgsIHNldEluZGV4XSA9IFJlYWN0LnVzZVN0YXRlKDApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJbmRleCgwKVxuICB9LCBbc2VsZWN0ZWRSZXN1bHRzXSlcbiAgcmV0dXJuIFtpbmRleCwgc2V0SW5kZXhdXG59XG5cbmNvbnN0IHVzZVBvc3NpYmxlTWV0YWNhcmRUYWJzID0gKHsgcmVzdWx0IH06IHsgcmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQgfSkgPT4ge1xuICBjb25zdCBbcG9zc2libGVNZXRhY2FyZFRhYnMsIHNldFBvc3NpYmxlTWV0YWNhcmRUYWJzXSA9XG4gICAgUmVhY3QudXNlU3RhdGUoTWV0YWNhcmRUYWJzKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgbGV0IGNvcHlPZk1ldGFjYXJkVGFicyA9IHsgLi4uTWV0YWNhcmRUYWJzIH1cbiAgICAgIGlmIChyZXN1bHQuaXNSZXZpc2lvbigpKSB7XG4gICAgICAgIGRlbGV0ZSBjb3B5T2ZNZXRhY2FyZFRhYnNbVGFiTmFtZXMuSGlzdG9yeV1cbiAgICAgICAgZGVsZXRlIGNvcHlPZk1ldGFjYXJkVGFic1tUYWJOYW1lcy5BY3Rpb25zXVxuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC5pc0RlbGV0ZWQoKSkge1xuICAgICAgICBkZWxldGUgY29weU9mTWV0YWNhcmRUYWJzW1RhYk5hbWVzLkhpc3RvcnldXG4gICAgICAgIGRlbGV0ZSBjb3B5T2ZNZXRhY2FyZFRhYnNbVGFiTmFtZXMuQWN0aW9uc11cbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQuaXNSZW1vdGUoKSkge1xuICAgICAgICBkZWxldGUgY29weU9mTWV0YWNhcmRUYWJzW1RhYk5hbWVzLkhpc3RvcnldXG4gICAgICAgIGRlbGV0ZSBjb3B5T2ZNZXRhY2FyZFRhYnNbVGFiTmFtZXMuUXVhbGl0eV1cbiAgICAgIH1cbiAgICAgIGlmICghcmVzdWx0Lmhhc1ByZXZpZXcoKSkge1xuICAgICAgICBkZWxldGUgY29weU9mTWV0YWNhcmRUYWJzW1RhYk5hbWVzLlByZXZpZXddXG4gICAgICB9XG4gICAgICBzZXRQb3NzaWJsZU1ldGFjYXJkVGFicyhjb3B5T2ZNZXRhY2FyZFRhYnMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFBvc3NpYmxlTWV0YWNhcmRUYWJzKHt9KVxuICAgIH1cbiAgfSwgW3Jlc3VsdF0pXG5cbiAgcmV0dXJuIHBvc3NpYmxlTWV0YWNhcmRUYWJzXG59XG5cbmNvbnN0IHVzZU1ldGFjYXJkVGFicyA9ICh7IHJlc3VsdCB9OiB7IHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0IH0pID0+IHtcbiAgY29uc3QgcG9zc2libGVNZXRhY2FyZFRhYnMgPSB1c2VQb3NzaWJsZU1ldGFjYXJkVGFicyh7IHJlc3VsdCB9KVxuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gUmVhY3QudXNlU3RhdGUoZGVmYXVsdEFjdGl2ZVRhYilcbiAgdXNlTGFzdEFzRGVmYXVsdEFjdGl2ZVRhYihhY3RpdmVUYWIpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoXG4gICAgICBPYmplY3Qua2V5cyhwb3NzaWJsZU1ldGFjYXJkVGFicykubGVuZ3RoID4gMCAmJlxuICAgICAgIXBvc3NpYmxlTWV0YWNhcmRUYWJzW2FjdGl2ZVRhYl1cbiAgICApIHtcbiAgICAgIHNldEFjdGl2ZVRhYihUYWJOYW1lcy5EZXRhaWxzKVxuICAgIH1cbiAgfSwgW3Bvc3NpYmxlTWV0YWNhcmRUYWJzXSlcbiAgcmV0dXJuIHtcbiAgICBwb3NzaWJsZU1ldGFjYXJkVGFicyxcbiAgICBhY3RpdmVUYWIsXG4gICAgc2V0QWN0aXZlVGFiLFxuICAgIFRhYkNvbnRlbnQ6IHBvc3NpYmxlTWV0YWNhcmRUYWJzW2FjdGl2ZVRhYl0/LmNvbnRlbnQgfHwgKCgpID0+IG51bGwpLFxuICB9XG59XG5cbmNvbnN0IEluc3BlY3RvciA9ICh7IHNlbGVjdGlvbkludGVyZmFjZSB9OiBJbnNwZWN0b3JUeXBlKSA9PiB7XG4gIGNvbnN0IHNlbGVjdGVkUmVzdWx0cyA9IHVzZVNlbGVjdGVkUmVzdWx0c0FycmF5RnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCBbaW5kZXgsIHNldEluZGV4XSA9IHVzZUluZGV4Rm9yU2VsZWN0ZWRSZXN1bHRzKHNlbGVjdGVkUmVzdWx0cylcblxuICBjb25zdCBhbW91bnRTZWxlY3RlZCA9IHNlbGVjdGVkUmVzdWx0cy5sZW5ndGhcblxuICBjb25zdCBjdXJyZW50UmVzdWx0ID0gc2VsZWN0ZWRSZXN1bHRzW2luZGV4XVxuICBjb25zdCB7IHBvc3NpYmxlTWV0YWNhcmRUYWJzLCBhY3RpdmVUYWIsIHNldEFjdGl2ZVRhYiwgVGFiQ29udGVudCB9ID1cbiAgICB1c2VNZXRhY2FyZFRhYnMoeyByZXN1bHQ6IGN1cnJlbnRSZXN1bHQgfSlcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgaC1mdWxsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICB7YW1vdW50U2VsZWN0ZWQgPiAxID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZmxleC1ub3dyYXAgc2hyaW5rLTAgZ3Jvdy0wXCI+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRJbmRleChpbmRleCAtIDEpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtpbmRleCA9PT0gMH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEtleWJvYXJkQXJyb3dMZWZ0SWNvblxuICAgICAgICAgICAgICAgIGNvbG9yPVwiaW5oZXJpdFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiTXVpLXRleHQtdGV4dC1wcmltYXJ5IE11aS1pY29uLXNpemUtc21hbGxcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8S2V5Ym9hcmRBcnJvd0xlZnRJY29uXG4gICAgICAgICAgICAgICAgY29sb3I9XCJpbmhlcml0XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCItbWwtMyBNdWktdGV4dC10ZXh0LXByaW1hcnkgTXVpLWljb24tc2l6ZS1zbWFsbFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIEl0ZW0ge2luZGV4ICsgMX0gLyB7YW1vdW50U2VsZWN0ZWR9XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRJbmRleChpbmRleCArIDEpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtpbmRleCA9PT0gYW1vdW50U2VsZWN0ZWQgLSAxfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8S2V5Ym9hcmRBcnJvd1JpZ2h0SWNvblxuICAgICAgICAgICAgICAgIGNvbG9yPVwiaW5oZXJpdFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiTXVpLXRleHQtdGV4dC1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEtleWJvYXJkQXJyb3dSaWdodEljb25cbiAgICAgICAgICAgICAgICBjb2xvcj1cImluaGVyaXRcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIi1tbC01IE11aS10ZXh0LXRleHQtcHJpbWFyeVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHtjdXJyZW50UmVzdWx0ID8gKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8VGl0bGVWaWV3IGxhenlSZXN1bHQ9e2N1cnJlbnRSZXN1bHR9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgc2hyaW5rIG92ZXJmbG93LWhpZGRlbiBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgPFRhYnNcbiAgICAgICAgICAgICAgICB2YWx1ZT17YWN0aXZlVGFifVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2UsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRBY3RpdmVUYWIobmV3VmFsdWUpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzaHJpbmstMCB3LWZ1bGxcIlxuICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM9XCJhdXRvXCJcbiAgICAgICAgICAgICAgICB2YXJpYW50PVwic2Nyb2xsYWJsZVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7T2JqZWN0LmVudHJpZXMocG9zc2libGVNZXRhY2FyZFRhYnMpLm1hcChcbiAgICAgICAgICAgICAgICAgIChbdGFiTmFtZSwgdGFiRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8TWF0ZXJpYWxUYWJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17dGFiTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0YWJOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJEZWZpbml0aW9uLmhlYWRlcj8uKHsgcmVzdWx0OiBjdXJyZW50UmVzdWx0IH0pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhYk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9UYWJzPlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC1mdWxsIHctZnVsbCBzaHJpbmsgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgPFRhYkNvbnRlbnRcbiAgICAgICAgICAgICAgICAgIHJlc3VsdD17Y3VycmVudFJlc3VsdH1cbiAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgICAgICAgICAga2V5PXtjdXJyZW50UmVzdWx0LnBsYWluLmlkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIFBsZWFzZSBzZWxlY3QgcmVzdWx0KHMpIHRvIGRpc3BsYXkgaW4gdGhlIGluc3BlY3Rvci5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKEluc3BlY3RvcilcbiJdfQ==