import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
var timeFormats = [
    {
        label: 'ISO 8601',
        value: 'ISO',
    },
    {
        label: '24 Hour Standard',
        value: '24',
    },
    {
        label: '12 Hour Standard',
        value: '12',
    },
];
var TimeFormatSelector = function (props) {
    var initState = timeFormats.find(function (tf) { return tf.value === props.timeFormat; });
    var _a = __read(React.useState(initState), 2), currentTimeFormat = _a[0], setCurrentTimeFormat = _a[1];
    return (React.createElement("div", null,
        React.createElement(Autocomplete, { id: "time-format-picker", disableClearable: true, autoComplete: true, size: 'small', onChange: function (_event, newTimeFormat) {
                props.handleTimeFormatUpdate(newTimeFormat);
                setCurrentTimeFormat(newTimeFormat);
            }, isOptionEqualToValue: function (option, value) {
                return option.value === value.value;
            }, options: timeFormats, getOptionLabel: function (format) { return format.label; }, style: { width: '100%', paddingTop: '2em' }, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Time Format", variant: "outlined" }))); }, value: currentTimeFormat })));
};
export default hot(module)(TimeFormatSelector);
//# sourceMappingURL=time-format-picker.js.map