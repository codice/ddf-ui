import { __read } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Typography from '@material-ui/core/Typography';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import user from '../../component/singletons/user-instance';
var coordinateFormatOptions = [
    { label: 'Degrees, Minutes, Seconds (DMS) (Lat/Lon)', value: 'degrees' },
    { label: 'Decimal (Lat/Lon)', value: 'decimal' },
    { label: 'MGRS', value: 'mgrs' },
    { label: 'UTM/UPS (Lat/Lon)', value: 'utm' },
    { label: 'Well Known Text (Lon/Lat)', value: 'wkt' },
];
var CoordinateSettings = function () {
    var _a = __read(useState(TypedUserInstance.getCoordinateFormat()), 2), coordFormat = _a[0], setCoordFormat = _a[1];
    var updateCoordFormat = function (coordinateFormat) {
        var preferences = user.get('user').get('preferences');
        setCoordFormat(coordinateFormat);
        preferences.set({ coordinateFormat: coordinateFormat });
        preferences.savePreferences();
    };
    return (React.createElement(FormControl, null,
        React.createElement(Typography, { variant: "h6" }, "Coordinate System (CS)"),
        React.createElement(RadioGroup, { value: coordFormat, onChange: function (e) { return updateCoordFormat(e.target.value); } }, coordinateFormatOptions.map(function (format) { return (React.createElement(FormControlLabel, { value: format.value, control: React.createElement(Radio, { size: "small", color: "primary" }), label: React.createElement("div", { className: "text-sm" }, format.label) })); }))));
};
export default CoordinateSettings;
//# sourceMappingURL=coordinate-settings.js.map