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
import { isDirectionalSort } from './sort-selection-helpers';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Swath from '../../component/swath/swath';
var SortItem = function (_a) {
    var sortItem = _a.sortItem, attributeOptions = _a.attributeOptions, directionOptions = _a.directionOptions, updateAttribute = _a.updateAttribute, updateDirection = _a.updateDirection, onRemove = _a.onRemove, showRemove = _a.showRemove;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement(Grid, { container: true, direction: "row", wrap: "nowrap", alignItems: "center" },
                React.createElement(Grid, { item: true, className: "w-full" },
                    React.createElement(Autocomplete, { "data-id": "sort-type-autocomplete", size: "small", fullWidth: true, options: attributeOptions, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) {
                            return option.value === value.value;
                        }, onChange: function (_e, newValue) {
                            var newProperty = newValue.value;
                            updateAttribute(newProperty);
                        }, disableClearable: true, value: sortItem.attribute, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined" }))); } })),
                showRemove ? (React.createElement(Grid, { item: true, className: "pl-2" },
                    React.createElement(Button, { "data-id": "remove-sort-button", onClick: onRemove, variant: "text", color: "primary" }, "Remove"))) : null),
            isDirectionalSort(sortItem.attribute.value) ? (React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pt-2" },
                React.createElement(Grid, { item: true },
                    React.createElement(Swath, { className: "w-1 h-full" })),
                React.createElement(Grid, { item: true, className: "w-full pl-2" },
                    React.createElement(Autocomplete, { "data-id": "sort-order-autocomplete", size: "small", fullWidth: true, options: directionOptions, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) {
                            return option.value === value.value;
                        }, onChange: function (_e, newValue) {
                            var newProperty = newValue.value;
                            updateDirection(newProperty);
                        }, disableClearable: true, value: directionOptions.find(function (option) { return option.value === sortItem.direction; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined" }))); } })))) : null)));
};
export default SortItem;
//# sourceMappingURL=sort-item.js.map