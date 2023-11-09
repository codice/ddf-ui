import { __assign, __rest } from "tslib";
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
import TextField from '../../../react-component/text-field/index';
import MaskedTextField from '../inputs/masked-text-field';
import { latitudeDMSMask, longitudeDMSMask } from './masks';
import { buildDmsString, parseDmsCoordinate } from '../utils/dms-utils';
var Coordinate = function (props) {
    var placeholder = props.placeholder, value = props.value, onChange = props.onChange, children = props.children, otherProps = __rest(props, ["placeholder", "value", "onChange", "children"]);
    return (React.createElement("div", { className: "flex flex-row items-center w-full flex-nowrap" },
        React.createElement(TextField, __assign({ placeholder: placeholder, value: value, onChange: onChange }, otherProps)),
        children));
};
var MaskedCoordinate = function (props) {
    var placeholder = props.placeholder, mask = props.mask, value = props.value, onChange = props.onChange, children = props.children, otherProps = __rest(props, ["placeholder", "mask", "value", "onChange", "children"]);
    return (React.createElement("div", { className: "flex flex-row items-center w-full flex-nowrap" },
        React.createElement(MaskedTextField, __assign({ placeholder: placeholder, mask: mask, value: value, onChange: onChange }, otherProps)),
        children));
};
var DmsLatitude = function (props) {
    return (React.createElement(MaskedCoordinate, __assign({ placeholder: "dd\u00B0mm'ss.sss\"", mask: latitudeDMSMask, placeholderChar: "_" }, props, { onBlur: function (event) {
            props.onChange(buildDmsString(parseDmsCoordinate(props.value)), event.type);
        } })));
};
var DmsLongitude = function (props) {
    return (React.createElement(MaskedCoordinate, __assign({ placeholder: "ddd\u00B0mm'ss.sss\"", mask: longitudeDMSMask, placeholderChar: "_" }, props, { onBlur: function (event) {
            props.onChange(buildDmsString(parseDmsCoordinate(props.value)), event.type);
        } })));
};
var DdLatitude = function (props) {
    return (React.createElement(Coordinate, __assign({ placeholder: "latitude", type: "number", step: "any", min: -90, max: 90, addon: "\u00B0" }, props)));
};
var DdLongitude = function (props) {
    return (React.createElement(Coordinate, __assign({ placeholder: "longitude", type: "number", step: "any", min: -180, max: 180, addon: "\u00B0" }, props)));
};
var UsngCoordinate = function (props) {
    return (React.createElement("div", { className: "coordinate" },
        React.createElement(TextField, __assign({ label: "Grid" }, props))));
};
export { DmsLatitude, DmsLongitude, DdLatitude, DdLongitude, UsngCoordinate };
//# sourceMappingURL=coordinates.js.map