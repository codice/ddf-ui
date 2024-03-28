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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
var Options = [
    {
        label: 'Milliseconds',
        value: 'millisecond',
    },
    {
        label: 'Seconds',
        value: 'second',
    },
    {
        label: 'Minutes',
        value: 'minute',
    },
];
var TimePrecisionSelector = function (props) {
    var initState = Options.find(function (option) { return option.value === props.timePrecision; });
    var _a = __read(React.useState(initState), 2), timePrecision = _a[0], setTimePrecision = _a[1];
    return (React.createElement("div", null,
        React.createElement(Autocomplete, { id: "time-precision-picker", disableClearable: true, autoComplete: true, size: 'small', onChange: function (_event, newPrecision) {
                props.handleTimePrecisionUpdate(newPrecision.value);
                setTimePrecision(newPrecision);
            }, isOptionEqualToValue: function (option, value) {
                return option.value === value.value;
            }, options: Options, getOptionLabel: function (option) { return option.label; }, style: { width: '100%', paddingTop: '2em' }, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Time Precision", variant: "outlined" }))); }, value: timePrecision })));
};
export default hot(module)(TimePrecisionSelector);
//# sourceMappingURL=time-precision-picker.js.map