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
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { dispatchEnterKeySubmitEvent } from '../../../component/custom-events/enter-key-submit';
export var EnumInput = function (_a) {
    var options = _a.options, onChange = _a.onChange, value = _a.value;
    var _b = __read(React.useState(false), 2), isOpen = _b[0], setIsOpen = _b[1];
    return (React.createElement(Autocomplete, { onOpen: function () {
            setIsOpen(true);
        }, onClose: function () {
            setIsOpen(false);
        }, open: isOpen, fullWidth: true, size: "small", options: options, onChange: function (_e, newValue) {
            onChange(newValue);
        }, disableClearable: true, value: value, renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { variant: "outlined" })); }, 
        // in this case do press so since the dropdown will close before keyup fires
        onKeyPress: function (e) {
            if (e.key === 'Enter' && !isOpen) {
                dispatchEnterKeySubmitEvent(e);
            }
        } }));
};
//# sourceMappingURL=enum-input.js.map