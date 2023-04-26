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
import { __assign, __read, __rest } from "tslib";
import Button from '@material-ui/core/Button';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { getIconClassName } from '../results-visual/result-item';
import LazyMetacardInteractions from '../results-visual/lazy-metacard-interactions';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useMenuState } from '../../menu-state/menu-state';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { Elevations } from '../../theme/theme';
import OverflowTooltip from '../../overflow-tooltip/overflow-tooltip';
import Tabs from '@material-ui/core/Tabs';
import MaterialTab from '@material-ui/core/Tab';
import MetacardTabs, { TabNames } from '../../tabs/metacard/tabs-metacard';
import { TypedProperties } from '../../singletons/TypedProperties';
import { TypedUserInstance } from '../../singletons/TypedUser';
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks';
var Tab = function (props) {
    var children = props.children, otherProps = __rest(props, ["children"]);
    return React.createElement(MaterialTab, __assign({ label: children }, otherProps));
};
var useSelectedResultsArrayFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState([]), 2), selectedResultsArray = _b[0], setSelectedResultsArray = _b[1];
    var selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: selectionInterface
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
                delete copyOfMetacardTabs[TabNames.Overwrite];
            }
            if (result.isDeleted()) {
                delete copyOfMetacardTabs[TabNames.History];
                delete copyOfMetacardTabs[TabNames.Actions];
                delete copyOfMetacardTabs[TabNames.Overwrite];
            }
            if (result.isRemote()) {
                delete copyOfMetacardTabs[TabNames.History];
                delete copyOfMetacardTabs[TabNames.Overwrite];
                delete copyOfMetacardTabs[TabNames.Quality];
            }
            if (!result.hasPreview()) {
                delete copyOfMetacardTabs[TabNames.Preview];
            }
            if (!TypedProperties.isMetacardPreviewEnabled()) {
                delete copyOfMetacardTabs[TabNames.Preview];
            }
            if (!TypedUserInstance.canWrite(result)) {
                delete copyOfMetacardTabs[TabNames.Overwrite];
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
    var result = _a.result;
    var possibleMetacardTabs = usePossibleMetacardTabs({ result: result });
    var _b = __read(React.useState(defaultActiveTab), 2), activeTab = _b[0], setActiveTab = _b[1];
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
        TabContent: possibleMetacardTabs[activeTab] || (function () { return null; })
    };
};
var Inspector = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var selectedResults = useSelectedResultsArrayFromSelectionInterface({
        selectionInterface: selectionInterface
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
                        }, className: "shrink-0 w-full", scrollButtons: "auto", variant: "scrollable" }, Object.keys(possibleMetacardTabs).map(function (tabName) {
                        return (React.createElement(Tab, { key: tabName, value: tabName }, tabName));
                    })),
                    React.createElement("div", { className: "h-full w-full shrink overflow-hidden" },
                        React.createElement(TabContent, { result: currentResult, selectionInterface: selectionInterface, key: currentResult.plain.id }))))) : (React.createElement("div", { className: "p-2 text-center" }, "Please select result(s) to display in the inspector.")))));
};
export default hot(module)(Inspector);
//# sourceMappingURL=inspector.js.map