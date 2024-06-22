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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useMenuState } from '../menu-state/menu-state';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import CopyCoordinates from '../../react-component/copy-coordinates';
var MapContextDropdown = function (_a) {
    var mapModel = _a.mapModel;
    var _b = __read(React.useState(mapModel.toJSON().coordinateValues), 2), coordinates = _b[0], setCoordinates = _b[1];
    var menuState = useMenuState();
    var _c = mapModel.toJSON(), mouseX = _c.mouseX, mouseY = _c.mouseY, mouseLat = _c.mouseLat;
    useListenTo(mapModel, 'change:open', function () {
        if (mapModel.get('open')) {
            menuState.handleClick();
        }
        else {
            menuState.handleClose();
        }
    });
    useListenTo(mapModel, 'change:coordinateValues', function () {
        setCoordinates(mapModel.toJSON().coordinateValues);
    });
    React.useEffect(function () {
        if (menuState.open && mouseLat === undefined) {
            menuState.handleClose();
        }
        if (!menuState.open) {
            mapModel.set('open', false);
        }
    }, [menuState.open]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "absolute", ref: menuState.anchorRef, style: {
                left: mouseX,
                top: mouseY,
            } }),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays },
                React.createElement(CopyCoordinates, { key: JSON.stringify(coordinates), coordinateValues: coordinates, closeParent: function () {
                        menuState.handleClose();
                    } })))));
};
export default hot(module)(MapContextDropdown);
//# sourceMappingURL=map-context-menu.view.js.map