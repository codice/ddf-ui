import { __assign, __awaiter, __generator } from "tslib";
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
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { useMenuState } from '../../component/menu-state/menu-state';
import Popover from '@mui/material/Popover';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useSnack from '../../component/hooks/useSnack';
var generateClipboardHandler = function (_a) {
    var text = _a.text, closeParent = _a.closeParent, addSnack = _a.addSnack;
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _a.sent();
                    addSnack("Copied to clipboard: ".concat(text), {
                        alertProps: {
                            severity: 'success',
                        },
                    });
                    return [3 /*break*/, 4];
                case 2:
                    e_1 = _a.sent();
                    addSnack("Unable to copy ".concat(text, " to clipboard."), {
                        alertProps: {
                            severity: 'error',
                        },
                        // Longer timeout to give the user a chance to copy the coordinates from the snack.
                        timeout: 10000,
                    });
                    return [3 /*break*/, 4];
                case 3:
                    closeParent();
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
};
var render = function (props) {
    var _a = props.coordinateValues, dms = _a.dms, lat = _a.lat, lon = _a.lon, mgrs = _a.mgrs, utmUps = _a.utmUps;
    var closeParent = props.closeParent;
    var menuState = useMenuState();
    var addSnack = useSnack();
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({ className: "metacard-interaction interaction-copy-coordinates" }, menuState.MuiButtonProps),
            "Copy Coordinates as",
            React.createElement(ExpandMoreIcon, null)),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement("div", { className: "flex flex-col" },
                React.createElement(Button, { "data-help": "Copies the coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: "".concat(lat, " ").concat(lon),
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "Decimal Degrees (DD)"),
                        lat + ' ' + lon)),
                React.createElement(Button, { "data-help": "Copies the DMS coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: dms,
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "Degrees Minutes Seconds (DMS)"),
                        dms)),
                mgrs ? (React.createElement(Button, { "data-help": "Copies the MGRS coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: mgrs,
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "MGRS"),
                        mgrs))) : null,
                React.createElement(Button, { "data-help": "Copies the UTM/UPS coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: utmUps,
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "UTM/UPS"),
                        utmUps)),
                React.createElement(Button, { "data-help": "Copies the WKT of the coordinates to your clipboard.", onClick: generateClipboardHandler({
                        text: "POINT (".concat(lon, " ").concat(lat, ")"),
                        closeParent: closeParent,
                        addSnack: addSnack,
                    }) },
                    React.createElement("div", null,
                        React.createElement("div", { className: "opacity-75" }, "Well Known (WKT)"),
                        "POINT (",
                        lon,
                        " ",
                        lat,
                        ")"))))));
};
export default hot(module)(render);
//# sourceMappingURL=copy-coordinates.js.map