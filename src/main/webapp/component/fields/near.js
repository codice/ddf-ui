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
import Grid from '@mui/material/Grid';
import { CustomInputOrDefault } from '../../react-component/filter/filter-input/customInputOrDefault';
import { NumberField } from './number';
var defaultValue = {
    first: '',
    second: '',
    distance: 2,
};
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (value.distance === undefined ||
        value.first === undefined ||
        value.second === undefined) {
        onChange(defaultValue);
    }
};
export var NearField = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    var validValue = __assign(__assign({}, defaultValue), value);
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    return (React.createElement(Grid, { container: true, className: "w-full", direction: "column", alignItems: "flex-start", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(CustomInputOrDefault, { value: validValue.second, onChange: function (val) {
                    onChange(__assign(__assign({}, validValue), { second: val }));
                }, props: {
                    fullWidth: true,
                    variant: 'outlined',
                    type: 'text',
                    size: 'small',
                } })),
        React.createElement(Grid, { item: true, className: "w-full pb-2 pl-2" }, "within"),
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(NumberField, { type: "integer", value: validValue.distance.toString(), onChange: function (val) {
                    onChange(__assign(__assign({}, validValue), { distance: val }));
                }, validation: function (val) { return val > 0; }, validationText: "Must be greater than 0, using previous value of " })),
        React.createElement(Grid, { item: true, className: "w-full pb-2 pl-2" }, "of"),
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(CustomInputOrDefault, { value: validValue.first, onChange: function (val) {
                    onChange(__assign(__assign({}, validValue), { first: val }));
                }, props: {
                    fullWidth: true,
                    variant: 'outlined',
                    type: 'text',
                    size: 'small',
                } }))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmllbGRzL25lYXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFFckMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0VBQWdFLENBQUE7QUFDckcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQU90QyxJQUFNLFlBQVksR0FBRztJQUNuQixLQUFLLEVBQUUsRUFBRTtJQUNULE1BQU0sRUFBRSxFQUFFO0lBQ1YsUUFBUSxFQUFFLENBQUM7Q0FDZSxDQUFBO0FBRTVCLElBQU0sYUFBYSxHQUFHLFVBQUMsRUFBbUM7UUFBakMsS0FBSyxXQUFBLEVBQUUsUUFBUSxjQUFBO0lBQ3RDLElBQ0UsS0FBSyxDQUFDLFFBQVEsS0FBSyxTQUFTO1FBQzVCLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUztRQUN6QixLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFDMUI7UUFDQSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUE7S0FDdkI7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsVUFBQyxFQUFtQztRQUFqQyxLQUFLLFdBQUEsRUFBRSxRQUFRLGNBQUE7SUFDekMsSUFBTSxVQUFVLHlCQUNYLFlBQVksR0FDWixLQUFLLENBQ1QsQ0FBQTtJQUNELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUE7SUFDcEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUNMLG9CQUFDLElBQUksSUFDSCxTQUFTLFFBQ1QsU0FBUyxFQUFDLFFBQVEsRUFDbEIsU0FBUyxFQUFDLFFBQVEsRUFDbEIsVUFBVSxFQUFDLFlBQVksRUFDdkIsSUFBSSxFQUFDLFFBQVE7UUFFYixvQkFBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxhQUFhO1lBQ2hDLG9CQUFDLG9CQUFvQixJQUNuQixLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFDeEIsUUFBUSxFQUFFLFVBQUMsR0FBUTtvQkFDakIsUUFBUSx1QkFDSCxVQUFVLEtBQ2IsTUFBTSxFQUFFLEdBQUcsSUFDWCxDQUFBO2dCQUNKLENBQUMsRUFDRCxLQUFLLEVBQUU7b0JBQ0wsU0FBUyxFQUFFLElBQUk7b0JBQ2YsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLElBQUksRUFBRSxNQUFNO29CQUNaLElBQUksRUFBRSxPQUFPO2lCQUNkLEdBQ0QsQ0FDRztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGtCQUFrQixhQUVoQztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGFBQWE7WUFDaEMsb0JBQUMsV0FBVyxJQUNWLElBQUksRUFBQyxTQUFTLEVBQ2QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQ3JDLFFBQVEsRUFBRSxVQUFDLEdBQUc7b0JBQ1osUUFBUSx1QkFDSCxVQUFVLEtBQ2IsUUFBUSxFQUFFLEdBQUcsSUFDYixDQUFBO2dCQUNKLENBQUMsRUFDRCxVQUFVLEVBQUUsVUFBQyxHQUFHLElBQUssT0FBQSxHQUFHLEdBQUcsQ0FBQyxFQUFQLENBQU8sRUFDNUIsY0FBYyxFQUFDLGtEQUFrRCxHQUNqRSxDQUNHO1FBQ1Asb0JBQUMsSUFBSSxJQUFDLElBQUksUUFBQyxTQUFTLEVBQUMsa0JBQWtCLFNBRWhDO1FBQ1Asb0JBQUMsSUFBSSxJQUFDLElBQUksUUFBQyxTQUFTLEVBQUMsUUFBUTtZQUMzQixvQkFBQyxvQkFBb0IsSUFDbkIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQ3ZCLFFBQVEsRUFBRSxVQUFDLEdBQVE7b0JBQ2pCLFFBQVEsdUJBQ0gsVUFBVSxLQUNiLEtBQUssRUFBRSxHQUFHLElBQ1YsQ0FBQTtnQkFDSixDQUFDLEVBQ0QsS0FBSyxFQUFFO29CQUNMLFNBQVMsRUFBRSxJQUFJO29CQUNmLE9BQU8sRUFBRSxVQUFVO29CQUNuQixJQUFJLEVBQUUsTUFBTTtvQkFDWixJQUFJLEVBQUUsT0FBTztpQkFDZCxHQUNELENBQ0csQ0FDRixDQUNSLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgeyBWYWx1ZVR5cGVzIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IEN1c3RvbUlucHV0T3JEZWZhdWx0IH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L2ZpbHRlci9maWx0ZXItaW5wdXQvY3VzdG9tSW5wdXRPckRlZmF1bHQnXG5pbXBvcnQgeyBOdW1iZXJGaWVsZCB9IGZyb20gJy4vbnVtYmVyJ1xuXG50eXBlIE5lYXJGaWVsZFByb3BzID0ge1xuICB2YWx1ZTogUGFydGlhbDxWYWx1ZVR5cGVzWydwcm94aW1pdHknXT5cbiAgb25DaGFuZ2U6ICh2YWw6IFZhbHVlVHlwZXNbJ3Byb3hpbWl0eSddKSA9PiB2b2lkXG59XG5cbmNvbnN0IGRlZmF1bHRWYWx1ZSA9IHtcbiAgZmlyc3Q6ICcnLFxuICBzZWNvbmQ6ICcnLFxuICBkaXN0YW5jZTogMixcbn0gYXMgVmFsdWVUeXBlc1sncHJveGltaXR5J11cblxuY29uc3QgdmFsaWRhdGVTaGFwZSA9ICh7IHZhbHVlLCBvbkNoYW5nZSB9OiBOZWFyRmllbGRQcm9wcykgPT4ge1xuICBpZiAoXG4gICAgdmFsdWUuZGlzdGFuY2UgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbHVlLmZpcnN0ID09PSB1bmRlZmluZWQgfHxcbiAgICB2YWx1ZS5zZWNvbmQgPT09IHVuZGVmaW5lZFxuICApIHtcbiAgICBvbkNoYW5nZShkZWZhdWx0VmFsdWUpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IE5lYXJGaWVsZCA9ICh7IHZhbHVlLCBvbkNoYW5nZSB9OiBOZWFyRmllbGRQcm9wcykgPT4ge1xuICBjb25zdCB2YWxpZFZhbHVlID0ge1xuICAgIC4uLmRlZmF1bHRWYWx1ZSxcbiAgICAuLi52YWx1ZSxcbiAgfVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZhbGlkYXRlU2hhcGUoeyB2YWx1ZSwgb25DaGFuZ2UgfSlcbiAgfSwgW10pXG4gIHJldHVybiAoXG4gICAgPEdyaWRcbiAgICAgIGNvbnRhaW5lclxuICAgICAgY2xhc3NOYW1lPVwidy1mdWxsXCJcbiAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICBhbGlnbkl0ZW1zPVwiZmxleC1zdGFydFwiXG4gICAgICB3cmFwPVwibm93cmFwXCJcbiAgICA+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBwYi0yXCI+XG4gICAgICAgIDxDdXN0b21JbnB1dE9yRGVmYXVsdFxuICAgICAgICAgIHZhbHVlPXt2YWxpZFZhbHVlLnNlY29uZH1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgIC4uLnZhbGlkVmFsdWUsXG4gICAgICAgICAgICAgIHNlY29uZDogdmFsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIHByb3BzPXt7XG4gICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICB2YXJpYW50OiAnb3V0bGluZWQnLFxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJyxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGItMiBwbC0yXCI+XG4gICAgICAgIHdpdGhpblxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGItMlwiPlxuICAgICAgICA8TnVtYmVyRmllbGRcbiAgICAgICAgICB0eXBlPVwiaW50ZWdlclwiXG4gICAgICAgICAgdmFsdWU9e3ZhbGlkVmFsdWUuZGlzdGFuY2UudG9TdHJpbmcoKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbCkgPT4ge1xuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAuLi52YWxpZFZhbHVlLFxuICAgICAgICAgICAgICBkaXN0YW5jZTogdmFsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIHZhbGlkYXRpb249eyh2YWwpID0+IHZhbCA+IDB9XG4gICAgICAgICAgdmFsaWRhdGlvblRleHQ9XCJNdXN0IGJlIGdyZWF0ZXIgdGhhbiAwLCB1c2luZyBwcmV2aW91cyB2YWx1ZSBvZiBcIlxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGItMiBwbC0yXCI+XG4gICAgICAgIG9mXG4gICAgICA8L0dyaWQ+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAgICA8Q3VzdG9tSW5wdXRPckRlZmF1bHRcbiAgICAgICAgICB2YWx1ZT17dmFsaWRWYWx1ZS5maXJzdH1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgIC4uLnZhbGlkVmFsdWUsXG4gICAgICAgICAgICAgIGZpcnN0OiB2YWwsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19XG4gICAgICAgICAgcHJvcHM9e3tcbiAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdvdXRsaW5lZCcsXG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICBzaXplOiAnc21hbGwnLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L0dyaWQ+XG4gICAgPC9HcmlkPlxuICApXG59XG4iXX0=