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
import { __assign } from "tslib";
import * as React from 'react';
import FilterComparator from './filter-comparator';
import FilterInput from './filter-input';
import { getGroupedFilteredAttributes } from './filterHelper';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import { hot } from 'react-hot-loader';
import TextField from '@mui/material/TextField';
import { FilterClass } from '../../component/filter-builder/filter.structure';
import { getComparators } from './filter-comparator/comparatorUtils';
export var FilterContext = React.createContext({
    limitedAttributeList: undefined,
});
var Filter = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter, errorListener = _a.errorListener;
    var limitedAttributeList = React.useContext(FilterContext).limitedAttributeList;
    var attributeList = limitedAttributeList;
    var groups = 1;
    if (!attributeList) {
        var groupedFilteredAttributes = getGroupedFilteredAttributes();
        attributeList = groupedFilteredAttributes.attributes;
        groups = groupedFilteredAttributes.groups.length;
    }
    var property = filter.property;
    var currentSelectedAttribute = attributeList.find(function (attrInfo) { return attrInfo.value === property; });
    var groupBy = groups > 1 ? function (option) { return option.group; } : undefined;
    return (React.createElement(Grid, { container: true, direction: "column", alignItems: "center", className: "w-full" },
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(Autocomplete, { "data-id": "filter-type-autocomplete", fullWidth: true, size: "small", options: attributeList, groupBy: groupBy, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) { return option.value === value.value; }, onChange: function (_e, newValue) {
                    /**
                     * should update both the property and the type, since type is restricted based on property
                     */
                    var newProperty = newValue.value;
                    var comparators = getComparators(newProperty);
                    var updates = {
                        property: newProperty,
                        type: !comparators
                            .map(function (comparator) { return comparator.value; })
                            .includes(filter.type)
                            ? comparators[0].value
                            : filter.type,
                    };
                    setFilter(new FilterClass(__assign(__assign({}, filter), updates)));
                }, disableClearable: true, value: currentSelectedAttribute, renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { variant: "outlined" })); } })),
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(FilterComparator, { filter: filter, setFilter: setFilter })),
        React.createElement(Grid, { "data-id": "filter-input", item: true, className: "w-full" },
            React.createElement(FilterInput, { filter: filter, setFilter: setFilter, errorListener: errorListener }))));
};
export default hot(module)(Filter);
//# sourceMappingURL=filter.js.map