import { __assign } from "tslib";
import * as React from 'react';
import { getGroupedFilteredAttributes } from './filterHelper';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { FilterClass } from '../../component/filter-builder/filter.structure';
import { getComparators } from './filter-comparator/comparatorUtils';
import { FilterContext } from './filter';
export var FilterProperty = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter;
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
    return (React.createElement(Autocomplete, { "data-id": "filter-type-autocomplete", fullWidth: true, size: "small", options: attributeList, groupBy: groupBy, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) { return option.value === value.value; }, onChange: function (_e, newValue) {
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
        }, disableClearable: true, value: currentSelectedAttribute, renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { variant: "outlined" })); } }));
};
//# sourceMappingURL=filter-property.js.map