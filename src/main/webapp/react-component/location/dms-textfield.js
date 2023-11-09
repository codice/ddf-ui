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
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { DmsLatitude, DmsLongitude, } from '../../component/location-new/geo-components/coordinates';
import DirectionInput from '../../component/location-new/geo-components/direction';
var DmsTextfield = function (_a) {
    var point = _a.point, setPoint = _a.setPoint, deletePoint = _a.deletePoint;
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex flex-row items-center flex-nowrap" },
            React.createElement("div", { className: "flex flex-col space-y-2 flex-nowrap shrink w-full" },
                React.createElement(DmsLatitude, { label: "Latitude", value: point.lat, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { lat: value }));
                    } },
                    React.createElement(DirectionInput
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    , { 
                        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                        options: ['N', 'S'], value: point.latDirection, onChange: function (value) {
                            setPoint(__assign(__assign({}, point), { latDirection: value }));
                        } })),
                React.createElement(DmsLongitude, { label: "Longitude", value: point.lon, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { lon: value }));
                    } },
                    React.createElement(DirectionInput
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    , { 
                        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                        options: ['E', 'W'], value: point.lonDirection, onChange: function (value) {
                            setPoint(__assign(__assign({}, point), { lonDirection: value }));
                        } }))),
            React.createElement("div", { className: "shrink-0 grow-0" },
                React.createElement(IconButton, { onClick: deletePoint, size: "large" },
                    React.createElement(CloseIcon, null))))));
};
export default DmsTextfield;
//# sourceMappingURL=dms-textfield.js.map