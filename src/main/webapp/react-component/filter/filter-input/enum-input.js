import { __assign, __read } from "tslib";
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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { dispatchEnterKeySubmitEvent } from '../../../component/custom-events/enter-key-submit';
export var EnumInput = function (_a) {
    var options = _a.options, onChange = _a.onChange, value = _a.value;
    var _b = __read(React.useState(false), 2), isOpen = _b[0], setIsOpen = _b[1];
    return (React.createElement(Autocomplete, { onOpen: function () {
            setIsOpen(true);
        }, onClose: function () {
            setIsOpen(false);
        }, open: isOpen, fullWidth: true, size: "small", options: options, onChange: function (_e, newValue) {
            onChange(newValue);
        }, disableClearable: true, value: value, renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { variant: "outlined" })); }, 
        // in this case do press so since the dropdown will close before keyup fires
        onKeyPress: function (e) {
            if (e.key === 'Enter' && !isOpen) {
                dispatchEnterKeySubmitEvent(e);
            }
        } }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bS1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvZmlsdGVyL2ZpbHRlci1pbnB1dC9lbnVtLWlucHV0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUUvRixNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsVUFBQyxFQVF6QjtRQVBDLE9BQU8sYUFBQSxFQUNQLFFBQVEsY0FBQSxFQUNSLEtBQUssV0FBQTtJQU1DLElBQUEsS0FBQSxPQUFzQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBQTFDLE1BQU0sUUFBQSxFQUFFLFNBQVMsUUFBeUIsQ0FBQTtJQUVqRCxPQUFPLENBQ0wsb0JBQUMsWUFBWSxJQUNYLE1BQU0sRUFBRTtZQUNOLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNqQixDQUFDLEVBQ0QsT0FBTyxFQUFFO1lBQ1AsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xCLENBQUMsRUFDRCxJQUFJLEVBQUUsTUFBTSxFQUNaLFNBQVMsUUFDVCxJQUFJLEVBQUMsT0FBTyxFQUNaLE9BQU8sRUFBRSxPQUFPLEVBQ2hCLFFBQVEsRUFBRSxVQUFDLEVBQU8sRUFBRSxRQUFnQjtZQUNsQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEIsQ0FBQyxFQUNELGdCQUFnQixRQUNoQixLQUFLLEVBQUUsS0FBSyxFQUNaLFdBQVcsRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLG9CQUFDLFNBQVMsZUFBSyxNQUFNLElBQUUsT0FBTyxFQUFDLFVBQVUsSUFBRyxFQUE1QyxDQUE0QztRQUNyRSw0RUFBNEU7UUFDNUUsVUFBVSxFQUFFLFVBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQy9CO1FBQ0gsQ0FBQyxHQUNELENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgeyBkaXNwYXRjaEVudGVyS2V5U3VibWl0RXZlbnQgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuXG5leHBvcnQgY29uc3QgRW51bUlucHV0ID0gKHtcbiAgb3B0aW9ucyxcbiAgb25DaGFuZ2UsXG4gIHZhbHVlLFxufToge1xuICBvcHRpb25zOiBzdHJpbmdbXVxuICBvbkNoYW5nZTogKHZhbDogYW55KSA9PiB2b2lkXG4gIHZhbHVlOiBzdHJpbmdcbn0pID0+IHtcbiAgY29uc3QgW2lzT3Blbiwgc2V0SXNPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPEF1dG9jb21wbGV0ZVxuICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgIHNldElzT3Blbih0cnVlKVxuICAgICAgfX1cbiAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgc2V0SXNPcGVuKGZhbHNlKVxuICAgICAgfX1cbiAgICAgIG9wZW49e2lzT3Blbn1cbiAgICAgIGZ1bGxXaWR0aFxuICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgb25DaGFuZ2UobmV3VmFsdWUpXG4gICAgICB9fVxuICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IDxUZXh0RmllbGQgey4uLnBhcmFtc30gdmFyaWFudD1cIm91dGxpbmVkXCIgLz59XG4gICAgICAvLyBpbiB0aGlzIGNhc2UgZG8gcHJlc3Mgc28gc2luY2UgdGhlIGRyb3Bkb3duIHdpbGwgY2xvc2UgYmVmb3JlIGtleXVwIGZpcmVzXG4gICAgICBvbktleVByZXNzPXsoZSkgPT4ge1xuICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgIWlzT3Blbikge1xuICAgICAgICAgIGRpc3BhdGNoRW50ZXJLZXlTdWJtaXRFdmVudChlKVxuICAgICAgICB9XG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cbiJdfQ==