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
import Button from '@mui/material/Button';
import { hot } from 'react-hot-loader';
import { useMenuState } from '../../../component/menu-state/menu-state';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Popover from '@mui/material/Popover';
import RoomIcon from '@mui/icons-material/Room';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../../component/theme/theme';
var ZoomToHome = function (props) {
    var saveHome = props.saveHome, goHome = props.goHome;
    var menuState = useMenuState();
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex flex-row items-stretch" },
            React.createElement(Button, __assign({ size: "small", "data-id": "home-button" }, menuState.MuiButtonProps, { className: "border border-r-2 Mui-border-divider", onClick: goHome }),
                React.createElement("div", { className: "flex flex-row items-center" },
                    React.createElement(HomeIcon, null))),
            React.createElement("div", { className: "Mui-bg-default w-min my-2" }),
            React.createElement(Button, __assign({ size: "small", "data-id": "home-dropdown" }, menuState.MuiButtonProps),
                React.createElement(KeyboardArrowDownIcon, null))),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(Button, { size: "small", "data-id": "set-home-button", className: "p-2", onClick: function () {
                        saveHome();
                        menuState.handleClose();
                    }, title: "Save Current View as Home Location" },
                    React.createElement("span", null,
                        "Set Home",
                        React.createElement(RoomIcon, null)))))));
};
export default hot(module)(ZoomToHome);
//# sourceMappingURL=zoomToHome.js.map