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
import Backbone from 'backbone';
import { hot } from 'react-hot-loader';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import { useMenuState } from '../menu-state/menu-state';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { Elevations } from '../theme/theme';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import ListIcon from '@material-ui/icons/List';
import FilterListIcon from '@material-ui/icons/FilterList';
//keep around the previously used (not a preference, so only per session)
export var StateModel = new Backbone.Model({
    display: 'list',
    filter: 'all'
});
var FilterMenu = function () {
    var menuState = useMenuState();
    var _a = __read(React.useState([
        {
            label: 'All associations',
            value: 'all'
        },
        {
            label: 'Outgoing associations',
            value: 'child'
        },
        {
            label: 'Incoming associations',
            value: 'parent'
        },
    ]), 1), choices = _a[0];
    var _b = __read(React.useState(StateModel.get('filter') || 'all'), 2), value = _b[0], setValue = _b[1];
    useListenTo(StateModel, "change:filter", function () {
        setValue(StateModel.get('filter') || 'all');
    });
    var currentChoice = choices.find(function (choice) { return choice.value === value; }) || choices[0];
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({}, menuState.MuiButtonProps, { color: "primary" }),
            React.createElement(FilterListIcon, { className: "Mui-text-text-primary" }),
            currentChoice.label),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays },
                React.createElement(MenuList, { key: currentChoice.value }, choices.map(function (choice) {
                    return (React.createElement(MenuItem, { onClick: function () {
                            StateModel.set('filter', choice.value);
                            menuState.handleClose();
                        }, autoFocus: choice === currentChoice }, choice.label));
                }))))));
};
var DisplayMenu = function () {
    var menuState = useMenuState();
    var _a = __read(React.useState([
        {
            label: 'List',
            value: 'list'
        },
        {
            label: 'Graph',
            value: 'graph'
        },
    ]), 1), choices = _a[0];
    var _b = __read(React.useState(StateModel.get('display') || 'list'), 2), value = _b[0], setValue = _b[1];
    useListenTo(StateModel, "change:display", function () {
        setValue(StateModel.get('display') || 'list');
    });
    var currentChoice = choices.find(function (choice) { return choice.value === value; }) || choices[0];
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({}, menuState.MuiButtonProps, { color: "primary" }),
            currentChoice.value === 'list' ? (React.createElement(ListIcon, { className: "Mui-text-text-primary" })) : (React.createElement(BubbleChartIcon, { className: "Mui-text-text-primary" })),
            currentChoice.label),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays },
                React.createElement(MenuList, { key: currentChoice.value }, choices.map(function (choice) {
                    return (React.createElement(MenuItem, { onClick: function () {
                            StateModel.set('display', choice.value);
                            menuState.handleClose();
                        }, autoFocus: choice === currentChoice }, choice.label));
                }))))));
};
var AssociationsMenu = function () {
    return (React.createElement("div", { className: "flex flex-row flex-nowrap items-center justify-center w-full" },
        React.createElement("div", { className: "p-2 " },
            React.createElement(FilterMenu, null)),
        React.createElement("div", { className: "p-2 " },
            React.createElement(DisplayMenu, null))));
};
export default hot(module)(AssociationsMenu);
//# sourceMappingURL=associations-menu.view.js.map