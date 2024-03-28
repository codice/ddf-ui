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
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
var millisecondsInDay = 24 * 60 * 60 * 1000;
var expireOptions = [
    {
        label: '1 Day',
        value: millisecondsInDay,
    },
    {
        label: '2 Days',
        value: 2 * millisecondsInDay,
    },
    {
        label: '4 Days',
        value: 4 * millisecondsInDay,
    },
    {
        label: '1 Week',
        value: 7 * millisecondsInDay,
    },
    {
        label: '2 Weeks',
        value: 14 * millisecondsInDay,
    },
    {
        label: '1 Month',
        value: 30 * millisecondsInDay,
    },
    {
        label: '2 Months',
        value: 60 * millisecondsInDay,
    },
    {
        label: '4 Months',
        value: 120 * millisecondsInDay,
    },
    {
        label: '6 Months',
        value: 180 * millisecondsInDay,
    },
    {
        label: '1 Year',
        value: 365 * millisecondsInDay,
    },
];
var keepNotificationsOptions = [
    {
        label: 'Yes',
        value: true,
    },
    {
        label: 'No',
        value: false,
    },
];
var render = function (props) {
    var persistence = props.persistence, expiration = props.expiration, onExpirationChange = props.onExpirationChange, onPersistenceChange = props.onPersistenceChange;
    return (React.createElement("div", { className: "p-2 w-full h-full overflow-auto" },
        React.createElement("div", { className: "editor-properties" },
            React.createElement("div", null,
                React.createElement(Autocomplete, { size: "small", options: keepNotificationsOptions, onChange: function (_e, newValue) {
                        onPersistenceChange(newValue.value);
                    }, isOptionEqualToValue: function (option) { return option.value === persistence; }, getOptionLabel: function (option) {
                        return option.label;
                    }, disableClearable: true, value: keepNotificationsOptions.find(function (choice) { return choice.value === persistence; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Keep notifications after logging out", variant: "outlined" }))); } })),
            React.createElement("div", { className: "pt-2" }, persistence ? (React.createElement(Autocomplete, { size: "small", options: expireOptions, onChange: function (_e, newValue) {
                    onExpirationChange(newValue.value);
                }, isOptionEqualToValue: function (option) { return option.value === expiration; }, getOptionLabel: function (option) {
                    return option.label;
                }, disableClearable: true, value: expireOptions.find(function (choice) { return choice.value === expiration; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Expire after", variant: "outlined" }))); } })) : null))));
};
export default hot(module)(render);
//# sourceMappingURL=presentation.js.map