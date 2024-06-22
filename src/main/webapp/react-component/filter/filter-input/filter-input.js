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
import React from 'react';
import { getAttributeType } from '../filterHelper';
import LocationInput from './filter-location-input';
import { DateField } from '../../../component/fields/date';
import { NearField } from '../../../component/fields/near';
import { NumberRangeField } from '../../../component/fields/number-range';
import { DateRangeField } from '../../../component/fields/date-range';
import { DateRelativeField } from '../../../component/fields/date-relative';
import { FilterClass, } from '../../../component/filter-builder/filter.structure';
import { IntegerField } from '../../../component/fields/integer';
import { FloatField } from '../../../component/fields/float';
import { BooleanField } from '../../../component/fields/boolean';
import { DateAroundField } from '../../../component/fields/date-around';
import { CustomInputOrDefault } from './customInputOrDefault';
import BooleanSearchBar from '../../../component/boolean-search-bar/boolean-search-bar';
import { EnterKeySubmitProps } from '../../../component/custom-events/enter-key-submit';
import { EnumInput } from './enum-input';
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks';
import { ReservedBasicDatatype } from '../../../component/reserved-basic-datatype/reserved.basic-datatype';
import { BasicDataTypePropertyName } from '../../../component/filter-builder/reserved.properties';
var FilterInput = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter, errorListener = _a.errorListener;
    var type = getAttributeType(filter.property);
    var MetacardDefinitions = useMetacardDefinitions();
    var value = filter.value;
    var onChange = function (val) {
        setFilter(new FilterClass(__assign(__assign({}, filter), { value: val })));
    };
    if (filter.property === BasicDataTypePropertyName) {
        return (React.createElement(ReservedBasicDatatype, { onChange: onChange, value: value }));
    }
    switch (filter.type) {
        case 'IS NULL':
            return null;
        case 'BOOLEAN_TEXT_SEARCH':
            return (React.createElement(BooleanSearchBar, { value: value, onChange: onChange, property: filter.property }));
        case 'FILTER FUNCTION proximity':
            return (React.createElement(NearField, { value: value, onChange: onChange }));
        case 'DURING':
            return (React.createElement(DateRangeField, { value: value, onChange: onChange }));
        case 'RELATIVE':
            return (React.createElement(DateRelativeField, { value: value, onChange: onChange }));
        case 'AROUND':
            return (React.createElement(DateAroundField, { value: value, onChange: onChange }));
        case 'BETWEEN':
            return (React.createElement(NumberRangeField, { value: value, type: type === 'INTEGER' ? 'integer' : 'float', onChange: onChange }));
    }
    switch (type) {
        case 'BOOLEAN':
            return (React.createElement(BooleanField, { value: value, onChange: onChange }));
        case 'DATE':
            return React.createElement(DateField, { onChange: onChange, value: value });
        case 'LOCATION':
            return (React.createElement(LocationInput, { value: value, onChange: onChange, errorListener: errorListener }));
        case 'FLOAT':
            return (React.createElement(FloatField, { value: value, onChange: onChange }));
        case 'INTEGER':
            return (React.createElement(IntegerField, { value: value, onChange: onChange }));
    }
    var textValue = value;
    var enumForAttr = MetacardDefinitions.getEnum(filter.property);
    if (enumForAttr.length > 0) {
        var allEnumForAttr = [];
        if (enumForAttr) {
            allEnumForAttr = allEnumForAttr.concat(enumForAttr);
        }
        return (React.createElement(EnumInput, __assign({ options: allEnumForAttr, onChange: onChange, value: textValue }, EnterKeySubmitProps)));
    }
    return (React.createElement(CustomInputOrDefault, { value: textValue, onChange: onChange, props: {
            fullWidth: true,
            variant: 'outlined',
            type: 'text',
            size: 'small',
        } }));
};
export default FilterInput;
//# sourceMappingURL=filter-input.js.map