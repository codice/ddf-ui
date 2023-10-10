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
import TextField from '@mui/material/TextField';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var defaultValue = 0;
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (typeof value !== 'number') {
        onChange(defaultValue);
    }
};
export var IntegerField = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    return (React.createElement(TextField, __assign({ fullWidth: true, variant: "outlined", size: "small", placeholder: "Use * for wildcard.", value: value, onChange: function (e) {
            onChange(parseInt(e.target.value));
        } }, EnterKeySubmitProps)));
};
//# sourceMappingURL=integer.js.map