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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlLXNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9hdHRyaWJ1dGUtc2V0dGluZ3MvYXR0cmlidXRlLXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sSUFBSSxNQUFNLDBDQUEwQyxDQUFBO0FBQzNELE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUV0QyxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyw4R0FBQSxvQ0FFVixFQUFxQyxLQUNqRCxLQURZLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBQ2pELENBQUE7QUFPRCxJQUFNLE9BQU8sR0FBRztJQUNkO1FBQ0UsS0FBSyxFQUFFLFNBQVM7UUFDaEIsS0FBSyxFQUFFLFNBQVM7S0FDakI7SUFDRDtRQUNFLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRDtRQUNFLEtBQUssRUFBRSxNQUFNO1FBQ2IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsS0FBSyxFQUFFLE1BQU07UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsS0FBSztRQUNaLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRDtRQUNFLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsTUFBTTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRDtRQUNFLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLEVBQUU7S0FDVjtDQUNtQixDQUFBO0FBRXRCLElBQU0sbUJBQW1CLEdBQUc7SUFDMUIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQVcsQ0FBQTtBQUM5RSxDQUFDLENBQUE7QUFFRCxJQUFNLGlCQUFpQixHQUFHO0lBQ3hCLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQzVCLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssS0FBSyxtQkFBbUIsRUFBRSxFQUF0QyxDQUFzQyxDQUNuRCxDQUFBO0lBQ0ssSUFBQSxLQUFBLE9BQTBDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUEsRUFBbEUsZ0JBQWdCLFFBQUEsRUFBRSxtQkFBbUIsUUFBNkIsQ0FBQTtJQUV6RSxPQUFPLENBQ0wsb0JBQUMsSUFBSTtRQUNILG9CQUFDLFlBQVksSUFDWCxFQUFFLEVBQUMsMEJBQTBCLEVBQzdCLGdCQUFnQixFQUFFLElBQUksRUFDdEIsWUFBWSxFQUFFLElBQUksRUFDbEIsSUFBSSxFQUFFLE9BQU8sRUFDYixRQUFRLEVBQUUsVUFBQyxNQUFXLEVBQUUsWUFBNkI7Z0JBQ25ELG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFBO2dCQUNqQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO29CQUN4QixnQkFBZ0IsRUFBRSxZQUFZLENBQUMsS0FBSztpQkFDckMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxFQUNELG9CQUFvQixFQUFFLFVBQUMsTUFBTSxFQUFFLEtBQUs7Z0JBQ2xDLE9BQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSyxDQUFBO1lBQ3JDLENBQUMsRUFDRCxPQUFPLEVBQUUsT0FBTyxFQUNoQixjQUFjLEVBQUUsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsS0FBSyxFQUFaLENBQVksRUFDeEMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQzNDLFdBQVcsRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLENBQ3ZCLG9CQUFDLFNBQVMsZUFBSyxNQUFNLElBQUUsS0FBSyxFQUFDLG1CQUFtQixFQUFDLE9BQU8sRUFBQyxVQUFVLElBQUcsQ0FDdkUsRUFGd0IsQ0FFeEIsRUFDRCxLQUFLLEVBQUUsZ0JBQWdCLEdBQ3ZCLENBQ0csQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcblxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXZgXG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHBhZGRpbmc6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtU3BhY2luZ307XG5gXG5cbnR5cGUgUHJlY2lzaW9uT3B0aW9uID0ge1xuICBsYWJlbDogc3RyaW5nXG4gIHZhbHVlOiBudW1iZXJcbn1cblxuY29uc3QgT3B0aW9ucyA9IFtcbiAge1xuICAgIGxhYmVsOiAnRGVmYXVsdCcsXG4gICAgdmFsdWU6IHVuZGVmaW5lZCxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnT25lJyxcbiAgICB2YWx1ZTogMSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnVHdvJyxcbiAgICB2YWx1ZTogMixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnVGhyZWUnLFxuICAgIHZhbHVlOiAzLFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdGb3VyJyxcbiAgICB2YWx1ZTogNCxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnRml2ZScsXG4gICAgdmFsdWU6IDUsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJ1NpeCcsXG4gICAgdmFsdWU6IDYsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJ1NldmVuJyxcbiAgICB2YWx1ZTogNyxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnRWlnaHQnLFxuICAgIHZhbHVlOiA4LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdOaW5lJyxcbiAgICB2YWx1ZTogOSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnVGVuJyxcbiAgICB2YWx1ZTogMTAsXG4gIH0sXG5dIGFzIFByZWNpc2lvbk9wdGlvbltdXG5cbmNvbnN0IGdldERlY2ltYWxQcmVjaXNpb24gPSAoKSA9PiB7XG4gIHJldHVybiB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2RlY2ltYWxQcmVjaXNpb24nKSBhcyBudW1iZXJcbn1cblxuY29uc3QgQXR0cmlidXRlU2V0dGluZ3MgPSAoKSA9PiB7XG4gIGNvbnN0IGluaXRTdGF0ZSA9IE9wdGlvbnMuZmluZChcbiAgICAob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGdldERlY2ltYWxQcmVjaXNpb24oKVxuICApXG4gIGNvbnN0IFtkZWNpbWFsUHJlY2lzaW9uLCBzZXREZWNpbWFsUHJlY2lzaW9uXSA9IFJlYWN0LnVzZVN0YXRlKGluaXRTdGF0ZSlcblxuICByZXR1cm4gKFxuICAgIDxSb290PlxuICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICBpZD1cImRlY2ltYWwtcHJlY2lzaW9uLXBpY2tlclwiXG4gICAgICAgIGRpc2FibGVDbGVhcmFibGU9e3RydWV9XG4gICAgICAgIGF1dG9Db21wbGV0ZT17dHJ1ZX1cbiAgICAgICAgc2l6ZT17J3NtYWxsJ31cbiAgICAgICAgb25DaGFuZ2U9eyhfZXZlbnQ6IGFueSwgbmV3UHJlY2lzaW9uOiBQcmVjaXNpb25PcHRpb24pID0+IHtcbiAgICAgICAgICBzZXREZWNpbWFsUHJlY2lzaW9uKG5ld1ByZWNpc2lvbilcbiAgICAgICAgICB1c2VyLmdldFByZWZlcmVuY2VzKCkuc2V0KHtcbiAgICAgICAgICAgIGRlY2ltYWxQcmVjaXNpb246IG5ld1ByZWNpc2lvbi52YWx1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9fVxuICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbiwgdmFsdWUpID0+IHtcbiAgICAgICAgICByZXR1cm4gb3B0aW9uLnZhbHVlID09PSB2YWx1ZS52YWx1ZVxuICAgICAgICB9fVxuICAgICAgICBvcHRpb25zPXtPcHRpb25zfVxuICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4gb3B0aW9uLmxhYmVsfVxuICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nVG9wOiAnMmVtJyB9fVxuICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJEZWNpbWFsIFByZWNpc2lvblwiIHZhcmlhbnQ9XCJvdXRsaW5lZFwiIC8+XG4gICAgICAgICl9XG4gICAgICAgIHZhbHVlPXtkZWNpbWFsUHJlY2lzaW9ufVxuICAgICAgLz5cbiAgICA8L1Jvb3Q+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKEF0dHJpYnV0ZVNldHRpbmdzKVxuIl19