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
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var defaultValue = {
    start: 0,
    end: 1,
};
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (value.start === undefined || value.end === undefined) {
        onChange(defaultValue);
    }
};
export var NumberRangeField = function (_a) {
    var value = _a.value, onChange = _a.onChange, type = _a.type;
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange, type: type });
    }, []);
    return (React.createElement(Grid, { container: true, direction: "column" },
        React.createElement(Grid, { item: true, className: "w-full py-1" },
            React.createElement("div", null, "from")),
        React.createElement(Grid, { item: true },
            React.createElement(TextField, __assign({ fullWidth: true, variant: "outlined", value: value.start, placeholder: "lower bound", type: "number", onChange: function (e) {
                    var newVal = type === 'integer'
                        ? parseInt(e.target.value)
                        : parseFloat(e.target.value);
                    onChange(__assign(__assign({}, value), { start: newVal }));
                }, size: "small" }, EnterKeySubmitProps))),
        React.createElement(Grid, { item: true, className: "w-full py-1" },
            React.createElement("div", null, "to")),
        React.createElement(Grid, { item: true },
            React.createElement(TextField, __assign({ fullWidth: true, variant: "outlined", placeholder: "upper bound", value: value.end, type: "number", onChange: function (e) {
                    var newVal = type === 'integer'
                        ? parseInt(e.target.value)
                        : parseFloat(e.target.value);
                    onChange(__assign(__assign({}, value), { end: newVal }));
                }, size: "small" }, EnterKeySubmitProps)))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLXJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvbnVtYmVyLXJhbmdlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBRXJDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFBO0FBUXZFLElBQU0sWUFBWSxHQUFHO0lBQ25CLEtBQUssRUFBRSxDQUFDO0lBQ1IsR0FBRyxFQUFFLENBQUM7Q0FDa0IsQ0FBQTtBQUUxQixJQUFNLGFBQWEsR0FBRyxVQUFDLEVBQTBDO1FBQXhDLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQTtJQUN0QyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO1FBQ3hELFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUN2QjtBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLFVBQUMsRUFJVDtRQUh0QixLQUFLLFdBQUEsRUFDTCxRQUFRLGNBQUEsRUFDUixJQUFJLFVBQUE7SUFFSixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFBO0lBQzFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNOLE9BQU8sQ0FDTCxvQkFBQyxJQUFJLElBQUMsU0FBUyxRQUFDLFNBQVMsRUFBQyxRQUFRO1FBQ2hDLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGFBQWE7WUFDaEMsd0NBQWUsQ0FDVjtRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJO1lBQ1Isb0JBQUMsU0FBUyxhQUNSLFNBQVMsUUFDVCxPQUFPLEVBQUMsVUFBVSxFQUNsQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFDbEIsV0FBVyxFQUFDLGFBQWEsRUFDekIsSUFBSSxFQUFDLFFBQVEsRUFDYixRQUFRLEVBQUUsVUFBQyxDQUFDO29CQUNWLElBQU0sTUFBTSxHQUNWLElBQUksS0FBSyxTQUFTO3dCQUNoQixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO3dCQUMxQixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ2hDLFFBQVEsdUJBQ0gsS0FBSyxLQUNSLEtBQUssRUFBRSxNQUFNLElBQ2IsQ0FBQTtnQkFDSixDQUFDLEVBQ0QsSUFBSSxFQUFDLE9BQU8sSUFDUixtQkFBbUIsRUFDdkIsQ0FDRztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGFBQWE7WUFDaEMsc0NBQWEsQ0FDUjtRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJO1lBQ1Isb0JBQUMsU0FBUyxhQUNSLFNBQVMsUUFDVCxPQUFPLEVBQUMsVUFBVSxFQUNsQixXQUFXLEVBQUMsYUFBYSxFQUN6QixLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFDaEIsSUFBSSxFQUFDLFFBQVEsRUFDYixRQUFRLEVBQUUsVUFBQyxDQUFDO29CQUNWLElBQU0sTUFBTSxHQUNWLElBQUksS0FBSyxTQUFTO3dCQUNoQixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO3dCQUMxQixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ2hDLFFBQVEsdUJBQ0gsS0FBSyxLQUNSLEdBQUcsRUFBRSxNQUFNLElBQ1gsQ0FBQTtnQkFDSixDQUFDLEVBQ0QsSUFBSSxFQUFDLE9BQU8sSUFDUixtQkFBbUIsRUFDdkIsQ0FDRyxDQUNGLENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgeyBWYWx1ZVR5cGVzIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IEVudGVyS2V5U3VibWl0UHJvcHMgfSBmcm9tICcuLi9jdXN0b20tZXZlbnRzL2VudGVyLWtleS1zdWJtaXQnXG5cbnR5cGUgTnVtYmVyUmFuZ2VGaWVsZFByb3BzID0ge1xuICB2YWx1ZTogVmFsdWVUeXBlc1snYmV0d2VlbiddXG4gIG9uQ2hhbmdlOiAodmFsOiBWYWx1ZVR5cGVzWydiZXR3ZWVuJ10pID0+IHZvaWRcbiAgdHlwZTogJ2ludGVnZXInIHwgJ2Zsb2F0J1xufVxuXG5jb25zdCBkZWZhdWx0VmFsdWUgPSB7XG4gIHN0YXJ0OiAwLFxuICBlbmQ6IDEsXG59IGFzIFZhbHVlVHlwZXNbJ2JldHdlZW4nXVxuXG5jb25zdCB2YWxpZGF0ZVNoYXBlID0gKHsgdmFsdWUsIG9uQ2hhbmdlIH06IE51bWJlclJhbmdlRmllbGRQcm9wcykgPT4ge1xuICBpZiAodmFsdWUuc3RhcnQgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZS5lbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIG9uQ2hhbmdlKGRlZmF1bHRWYWx1ZSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTnVtYmVyUmFuZ2VGaWVsZCA9ICh7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbiAgdHlwZSxcbn06IE51bWJlclJhbmdlRmllbGRQcm9wcykgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZhbGlkYXRlU2hhcGUoeyB2YWx1ZSwgb25DaGFuZ2UsIHR5cGUgfSlcbiAgfSwgW10pXG4gIHJldHVybiAoXG4gICAgPEdyaWQgY29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMVwiPlxuICAgICAgICA8ZGl2PmZyb208L2Rpdj5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgIHZhbHVlPXt2YWx1ZS5zdGFydH1cbiAgICAgICAgICBwbGFjZWhvbGRlcj1cImxvd2VyIGJvdW5kXCJcbiAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbCA9XG4gICAgICAgICAgICAgIHR5cGUgPT09ICdpbnRlZ2VyJ1xuICAgICAgICAgICAgICAgID8gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgICAgOiBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgICAgICAgc3RhcnQ6IG5ld1ZhbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgIHsuLi5FbnRlcktleVN1Ym1pdFByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMVwiPlxuICAgICAgICA8ZGl2PnRvPC9kaXY+XG4gICAgICA8L0dyaWQ+XG4gICAgICA8R3JpZCBpdGVtPlxuICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cInVwcGVyIGJvdW5kXCJcbiAgICAgICAgICB2YWx1ZT17dmFsdWUuZW5kfVxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsID1cbiAgICAgICAgICAgICAgdHlwZSA9PT0gJ2ludGVnZXInXG4gICAgICAgICAgICAgICAgPyBwYXJzZUludChlLnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgICA6IHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgICAgICBlbmQ6IG5ld1ZhbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgIHsuLi5FbnRlcktleVN1Ym1pdFByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuIl19