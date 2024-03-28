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
import Popover from '@mui/material/Popover';
import { useMenuState } from '../menu-state/menu-state';
import LayersView from './layers.view';
import LayersIcon from '@mui/icons-material/Layers';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
export var LayersDropdown = function () {
    var menuState = useMenuState();
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({ size: "small", "data-id": "layers-button" }, menuState.MuiButtonProps),
            React.createElement("div", { className: "flex flex-row items-center" },
                React.createElement(LayersIcon, null))),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays, className: "px-2" },
                React.createElement(LayersView, null)))));
};
//# sourceMappingURL=layers-dropdown.js.map