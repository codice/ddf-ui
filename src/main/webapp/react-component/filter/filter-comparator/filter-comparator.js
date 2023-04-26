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
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { FilterClass } from '../../../component/filter-builder/filter.structure';
var FilterComparator = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter;
    useEffect(function () {
        var comparators = getComparators(filter.property);
        if (!comparators.map(function (comparator) { return comparator.value; }).includes(filter.type)) {
            setFilter(new FilterClass(__assign(__assign({}, filter), { type: comparators[0].value })));
        }
    }, [filter, setFilter]);
    var comparators = getComparators(filter.property);
    return (React.createElement(TextField, { "data-id": "filter-comparator-select", fullWidth: true, variant: "outlined", select: true, value: filter.type, onChange: function (e) {
            var newType = e.target.value;
            setFilter(new FilterClass(__assign(__assign({}, filter), { type: newType })));
        }, size: "small" }, comparators.map(function (comparator) { return (React.createElement(MenuItem, { value: comparator.value, key: comparator.label }, comparator.label)); })));
};
export default FilterComparator;
//# sourceMappingURL=filter-comparator.js.map