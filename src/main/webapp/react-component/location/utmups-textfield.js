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
import React from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '../text-field';
import { Zone, Hemisphere } from './common';
var UtmupsTextfield = function (_a) {
    var point = _a.point, setPoint = _a.setPoint, deletePoint = _a.deletePoint;
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex flex-row items-center flex-nowrap" },
            React.createElement("div", { className: "flex flex-col space-y-2 flex-nowrap shrink w-full" },
                React.createElement(TextField, { label: "Easting", 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
                    value: point.easting, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { easting: value }));
                    }, addon: "m" }),
                React.createElement(TextField, { label: "Northing", 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
                    value: point.northing, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { northing: value }));
                    }, addon: "m" }),
                React.createElement(Zone, { value: point.zoneNumber, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { zoneNumber: value }));
                    } }),
                React.createElement(Hemisphere, { value: point.hemisphere, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { hemisphere: value }));
                    } })),
            React.createElement("div", { className: "shrink-0 grow-0" },
                React.createElement(IconButton, { onClick: deletePoint, size: "large" },
                    React.createElement(CloseIcon, null))))));
};
export default UtmupsTextfield;
//# sourceMappingURL=utmups-textfield.js.map