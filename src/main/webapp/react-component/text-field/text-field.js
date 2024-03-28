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
import Group from '../group';
import TextFieldMui from '@mui/material/TextField';
var TextField = function (props) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Props'.
    var label = props.label, addon = props.addon, value = props.value, _a = props.type, type = _a === void 0 ? 'text' : _a, onChange = props.onChange, rest = __rest(props, ["label", "addon", "value", "type", "onChange"]);
    return (React.createElement(Group, null,
        label !== undefined ? (React.createElement("span", { className: "p-2 shrink-0 grow-0", style: {
                minWidth: '120px',
            } },
            label,
            "\u00A0")) : null,
        React.createElement(TextFieldMui, __assign({ size: "small", variant: "outlined", fullWidth: true, className: "shrink overflow-hidden", value: value !== undefined ? value : '', type: type, onChange: function (e) {
                // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
                onChange(e.target.value);
            } }, rest)),
        addon !== undefined ? (React.createElement("label", { className: "p-2 shrink-0 grow-0" }, addon)) : null));
};
export default TextField;
//# sourceMappingURL=text-field.js.map