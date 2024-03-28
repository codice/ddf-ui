import { __assign, __makeTemplateObject, __read } from "tslib";
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
import user from '../../component/singletons/user-instance';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: hidden;\n  padding: ", ";\n"], ["\n  overflow: hidden;\n  padding: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
var Options = [
    {
        label: 'Default',
        value: undefined,
    },
    {
        label: 'One',
        value: 1,
    },
    {
        label: 'Two',
        value: 2,
    },
    {
        label: 'Three',
        value: 3,
    },
    {
        label: 'Four',
        value: 4,
    },
    {
        label: 'Five',
        value: 5,
    },
    {
        label: 'Six',
        value: 6,
    },
    {
        label: 'Seven',
        value: 7,
    },
    {
        label: 'Eight',
        value: 8,
    },
    {
        label: 'Nine',
        value: 9,
    },
    {
        label: 'Ten',
        value: 10,
    },
];
var getDecimalPrecision = function () {
    return user.get('user').get('preferences').get('decimalPrecision');
};
var AttributeSettings = function () {
    var initState = Options.find(function (option) { return option.value === getDecimalPrecision(); });
    var _a = __read(React.useState(initState), 2), decimalPrecision = _a[0], setDecimalPrecision = _a[1];
    return (React.createElement(Root, null,
        React.createElement(Autocomplete, { id: "decimal-precision-picker", disableClearable: true, autoComplete: true, size: 'small', onChange: function (_event, newPrecision) {
                setDecimalPrecision(newPrecision);
                user.getPreferences().set({
                    decimalPrecision: newPrecision.value,
                });
            }, isOptionEqualToValue: function (option, value) {
                return option.value === value.value;
            }, options: Options, getOptionLabel: function (option) { return option.label; }, style: { width: '100%', paddingTop: '2em' }, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Decimal Precision", variant: "outlined" }))); }, value: decimalPrecision })));
};
export default hot(module)(AttributeSettings);
var templateObject_1;
//# sourceMappingURL=attribute-settings.js.map