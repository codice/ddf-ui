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
import React, { useEffect } from 'react';
import { getComparators } from './comparatorUtils';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FilterClass, isBasicDatatypeClass, } from '../../../component/filter-builder/filter.structure';
var FilterComparator = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter, textFieldProps = _a.textFieldProps;
    useEffect(function () {
        var _a;
        var comparators = getComparators(filter.property);
        if (!comparators.map(function (comparator) { return comparator.value; }).includes(filter.type)) {
            setFilter(new FilterClass(__assign(__assign({}, filter), { type: (_a = comparators[0]) === null || _a === void 0 ? void 0 : _a.value })));
        }
    }, [filter, setFilter]);
    if (isBasicDatatypeClass(filter)) {
        return null;
    }
    var comparators = getComparators(filter.property);
    return (React.createElement(TextField, __assign({ "data-id": "filter-comparator-select", fullWidth: true, variant: "outlined", select: true, value: filter.type, onChange: function (e) {
            var newType = e.target.value;
            setFilter(new FilterClass(__assign(__assign({}, filter), { type: newType })));
        }, size: "small" }, textFieldProps), comparators.map(function (comparator) { return (React.createElement(MenuItem, { value: comparator.value, key: comparator.label }, comparator.label)); })));
};
export default FilterComparator;
//# sourceMappingURL=filter-comparator.js.map