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
import MenuItem from '@mui/material/MenuItem';
var defaultValue = false;
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (typeof value !== 'boolean') {
        onChange(defaultValue);
    }
};
export var BooleanField = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    return (React.createElement(TextField, { fullWidth: true, select: true, variant: "outlined", value: value.toString() === 'true', onChange: function (e) {
            onChange(e.target.value === 'true');
        }, size: "small" },
        React.createElement(MenuItem, { value: 'false' }, "false"),
        React.createElement(MenuItem, { value: 'true' }, "true")));
};
//# sourceMappingURL=boolean.js.map