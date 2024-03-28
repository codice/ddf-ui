import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
var TimeZoneSelector = function (props) {
    var getDefaultTimeZone = function (timeZoneName) {
        return props.timeZones.find(function (zone) { return zone.zoneName === timeZoneName; });
    };
    var _a = __read(React.useState(getDefaultTimeZone(props.timeZone)), 2), currentTimeZone = _a[0], setCurrentTimeZone = _a[1];
    return (React.createElement("div", null,
        React.createElement(Autocomplete, { id: "time-zone-picker", disableClearable: true, autoComplete: true, size: 'small', onChange: function (_event, newTimeZone) {
                props.handleTimeZoneUpdate(newTimeZone);
                setCurrentTimeZone(newTimeZone);
            }, isOptionEqualToValue: function (oldZone, newZone) {
                return oldZone.zoneName === newZone.zoneName;
            }, options: props.timeZones, getOptionLabel: function (zone) {
                return "".concat(zone.zoneName, ", ").concat(zone.abbr, ", ").concat(zone.offsetAsString);
            }, style: { width: '100%' }, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Time Zone", variant: "outlined" }))); }, value: currentTimeZone })));
};
export default hot(module)(TimeZoneSelector);
//# sourceMappingURL=time-zone-picker.js.map