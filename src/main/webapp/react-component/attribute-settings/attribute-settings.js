import { __assign, __makeTemplateObject, __read } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
    return (_jsx(Root, { children: _jsx(Autocomplete, { id: "decimal-precision-picker", disableClearable: true, autoComplete: true, size: 'small', onChange: function (_event, newPrecision) {
                setDecimalPrecision(newPrecision);
                user.getPreferences().set({
                    decimalPrecision: newPrecision.value,
                });
            }, isOptionEqualToValue: function (option, value) {
                return option.value === value.value;
            }, options: Options, getOptionLabel: function (option) { return option.label; }, style: { width: '100%', paddingTop: '2em' }, renderInput: function (params) { return (_jsx(TextField, __assign({}, params, { label: "Decimal Precision", variant: "outlined" }))); }, value: decimalPrecision }) }));
};
export default AttributeSettings;
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlLXNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9hdHRyaWJ1dGUtc2V0dGluZ3MvYXR0cmlidXRlLXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUV0QyxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyw4R0FBQSxvQ0FFVixFQUFxQyxLQUNqRCxLQURZLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBQ2pELENBQUE7QUFPRCxJQUFNLE9BQU8sR0FBRztJQUNkO1FBQ0UsS0FBSyxFQUFFLFNBQVM7UUFDaEIsS0FBSyxFQUFFLFNBQVM7S0FDakI7SUFDRDtRQUNFLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRDtRQUNFLEtBQUssRUFBRSxNQUFNO1FBQ2IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsS0FBSyxFQUFFLE1BQU07UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsS0FBSztRQUNaLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRDtRQUNFLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsTUFBTTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRDtRQUNFLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLEVBQUU7S0FDVjtDQUNtQixDQUFBO0FBRXRCLElBQU0sbUJBQW1CLEdBQUc7SUFDMUIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQVcsQ0FBQTtBQUM5RSxDQUFDLENBQUE7QUFFRCxJQUFNLGlCQUFpQixHQUFHO0lBQ3hCLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQzVCLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssS0FBSyxtQkFBbUIsRUFBRSxFQUF0QyxDQUFzQyxDQUNuRCxDQUFBO0lBQ0ssSUFBQSxLQUFBLE9BQTBDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUEsRUFBbEUsZ0JBQWdCLFFBQUEsRUFBRSxtQkFBbUIsUUFBNkIsQ0FBQTtJQUV6RSxPQUFPLENBQ0wsS0FBQyxJQUFJLGNBQ0gsS0FBQyxZQUFZLElBQ1gsRUFBRSxFQUFDLDBCQUEwQixFQUM3QixnQkFBZ0IsRUFBRSxJQUFJLEVBQ3RCLFlBQVksRUFBRSxJQUFJLEVBQ2xCLElBQUksRUFBRSxPQUFPLEVBQ2IsUUFBUSxFQUFFLFVBQUMsTUFBVyxFQUFFLFlBQTZCO2dCQUNuRCxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQTtnQkFDakMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztvQkFDeEIsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLEtBQUs7aUJBQ3JDLENBQUMsQ0FBQTtZQUNKLENBQUMsRUFDRCxvQkFBb0IsRUFBRSxVQUFDLE1BQU0sRUFBRSxLQUFLO2dCQUNsQyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQTtZQUNyQyxDQUFDLEVBQ0QsT0FBTyxFQUFFLE9BQU8sRUFDaEIsY0FBYyxFQUFFLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssRUFBWixDQUFZLEVBQ3hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUMzQyxXQUFXLEVBQUUsVUFBQyxNQUFNLElBQUssT0FBQSxDQUN2QixLQUFDLFNBQVMsZUFBSyxNQUFNLElBQUUsS0FBSyxFQUFDLG1CQUFtQixFQUFDLE9BQU8sRUFBQyxVQUFVLElBQUcsQ0FDdkUsRUFGd0IsQ0FFeEIsRUFDRCxLQUFLLEVBQUUsZ0JBQWdCLEdBQ3ZCLEdBQ0csQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxpQkFBaUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuXG5jb25zdCBSb290ID0gc3R5bGVkLmRpdmBcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgcGFkZGluZzogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1TcGFjaW5nfTtcbmBcblxudHlwZSBQcmVjaXNpb25PcHRpb24gPSB7XG4gIGxhYmVsOiBzdHJpbmdcbiAgdmFsdWU6IG51bWJlclxufVxuXG5jb25zdCBPcHRpb25zID0gW1xuICB7XG4gICAgbGFiZWw6ICdEZWZhdWx0JyxcbiAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdPbmUnLFxuICAgIHZhbHVlOiAxLFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdUd28nLFxuICAgIHZhbHVlOiAyLFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdUaHJlZScsXG4gICAgdmFsdWU6IDMsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJ0ZvdXInLFxuICAgIHZhbHVlOiA0LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdGaXZlJyxcbiAgICB2YWx1ZTogNSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnU2l4JyxcbiAgICB2YWx1ZTogNixcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnU2V2ZW4nLFxuICAgIHZhbHVlOiA3LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdFaWdodCcsXG4gICAgdmFsdWU6IDgsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJ05pbmUnLFxuICAgIHZhbHVlOiA5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICdUZW4nLFxuICAgIHZhbHVlOiAxMCxcbiAgfSxcbl0gYXMgUHJlY2lzaW9uT3B0aW9uW11cblxuY29uc3QgZ2V0RGVjaW1hbFByZWNpc2lvbiA9ICgpID0+IHtcbiAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnZGVjaW1hbFByZWNpc2lvbicpIGFzIG51bWJlclxufVxuXG5jb25zdCBBdHRyaWJ1dGVTZXR0aW5ncyA9ICgpID0+IHtcbiAgY29uc3QgaW5pdFN0YXRlID0gT3B0aW9ucy5maW5kKFxuICAgIChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gZ2V0RGVjaW1hbFByZWNpc2lvbigpXG4gIClcbiAgY29uc3QgW2RlY2ltYWxQcmVjaXNpb24sIHNldERlY2ltYWxQcmVjaXNpb25dID0gUmVhY3QudXNlU3RhdGUoaW5pdFN0YXRlKVxuXG4gIHJldHVybiAoXG4gICAgPFJvb3Q+XG4gICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgIGlkPVwiZGVjaW1hbC1wcmVjaXNpb24tcGlja2VyXCJcbiAgICAgICAgZGlzYWJsZUNsZWFyYWJsZT17dHJ1ZX1cbiAgICAgICAgYXV0b0NvbXBsZXRlPXt0cnVlfVxuICAgICAgICBzaXplPXsnc21hbGwnfVxuICAgICAgICBvbkNoYW5nZT17KF9ldmVudDogYW55LCBuZXdQcmVjaXNpb246IFByZWNpc2lvbk9wdGlvbikgPT4ge1xuICAgICAgICAgIHNldERlY2ltYWxQcmVjaXNpb24obmV3UHJlY2lzaW9uKVxuICAgICAgICAgIHVzZXIuZ2V0UHJlZmVyZW5jZXMoKS5zZXQoe1xuICAgICAgICAgICAgZGVjaW1hbFByZWNpc2lvbjogbmV3UHJlY2lzaW9uLnZhbHVlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH19XG4gICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBvcHRpb24udmFsdWUgPT09IHZhbHVlLnZhbHVlXG4gICAgICAgIH19XG4gICAgICAgIG9wdGlvbnM9e09wdGlvbnN9XG4gICAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiBvcHRpb24ubGFiZWx9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmdUb3A6ICcyZW0nIH19XG4gICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cIkRlY2ltYWwgUHJlY2lzaW9uXCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgKX1cbiAgICAgICAgdmFsdWU9e2RlY2ltYWxQcmVjaXNpb259XG4gICAgICAvPlxuICAgIDwvUm9vdD5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgQXR0cmlidXRlU2V0dGluZ3NcbiJdfQ==