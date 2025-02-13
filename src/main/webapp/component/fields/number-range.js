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
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
import { NumberField } from './number';
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
    var validValue = __assign(__assign({}, defaultValue), value);
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange, type: type });
    }, []);
    return (React.createElement(Grid, { container: true, direction: "column" },
        React.createElement(Grid, { item: true, className: "w-full py-1" },
            React.createElement("div", null, "from")),
        React.createElement(Grid, { item: true },
            React.createElement(NumberField, __assign({ value: validValue.start.toString(), TextFieldProps: {
                    placeholder: 'lower bound',
                }, type: type, onChange: function (val) {
                    onChange(__assign(__assign({}, validValue), { start: val }));
                } }, EnterKeySubmitProps))),
        React.createElement(Grid, { item: true, className: "w-full py-1" },
            React.createElement("div", null, "to")),
        React.createElement(Grid, { item: true },
            React.createElement(NumberField, __assign({ TextFieldProps: {
                    placeholder: 'upper bound',
                }, value: validValue.end.toString(), type: type, onChange: function (val) {
                    onChange(__assign(__assign({}, validValue), { end: val }));
                } }, EnterKeySubmitProps)))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLXJhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvbnVtYmVyLXJhbmdlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBRXJDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFRdEMsSUFBTSxZQUFZLEdBQUc7SUFDbkIsS0FBSyxFQUFFLENBQUM7SUFDUixHQUFHLEVBQUUsQ0FBQztDQUNrQixDQUFBO0FBRTFCLElBQU0sYUFBYSxHQUFHLFVBQUMsRUFBMEM7UUFBeEMsS0FBSyxXQUFBLEVBQUUsUUFBUSxjQUFBO0lBQ3RDLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7UUFDeEQsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3ZCO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxFQUlUO1FBSHRCLEtBQUssV0FBQSxFQUNMLFFBQVEsY0FBQSxFQUNSLElBQUksVUFBQTtJQUVKLElBQU0sVUFBVSx5QkFDWCxZQUFZLEdBQ1osS0FBSyxDQUNULENBQUE7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFBO0lBQzFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNOLE9BQU8sQ0FDTCxvQkFBQyxJQUFJLElBQUMsU0FBUyxRQUFDLFNBQVMsRUFBQyxRQUFRO1FBQ2hDLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGFBQWE7WUFDaEMsd0NBQWUsQ0FDVjtRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJO1lBQ1Isb0JBQUMsV0FBVyxhQUNWLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUNsQyxjQUFjLEVBQUU7b0JBQ2QsV0FBVyxFQUFFLGFBQWE7aUJBQzNCLEVBQ0QsSUFBSSxFQUFFLElBQUksRUFDVixRQUFRLEVBQUUsVUFBQyxHQUFHO29CQUNaLFFBQVEsdUJBQ0gsVUFBVSxLQUNiLEtBQUssRUFBRSxHQUFHLElBQ1YsQ0FBQTtnQkFDSixDQUFDLElBQ0csbUJBQW1CLEVBQ3ZCLENBQ0c7UUFDUCxvQkFBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxhQUFhO1lBQ2hDLHNDQUFhLENBQ1I7UUFDUCxvQkFBQyxJQUFJLElBQUMsSUFBSTtZQUNSLG9CQUFDLFdBQVcsYUFDVixjQUFjLEVBQUU7b0JBQ2QsV0FBVyxFQUFFLGFBQWE7aUJBQzNCLEVBQ0QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQ2hDLElBQUksRUFBRSxJQUFJLEVBQ1YsUUFBUSxFQUFFLFVBQUMsR0FBRztvQkFDWixRQUFRLHVCQUNILFVBQVUsS0FDYixHQUFHLEVBQUUsR0FBRyxJQUNSLENBQUE7Z0JBQ0osQ0FBQyxJQUNHLG1CQUFtQixFQUN2QixDQUNHLENBQ0YsQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IHsgVmFsdWVUeXBlcyB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgeyBFbnRlcktleVN1Ym1pdFByb3BzIH0gZnJvbSAnLi4vY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuaW1wb3J0IHsgTnVtYmVyRmllbGQgfSBmcm9tICcuL251bWJlcidcblxudHlwZSBOdW1iZXJSYW5nZUZpZWxkUHJvcHMgPSB7XG4gIHZhbHVlOiBQYXJ0aWFsPFZhbHVlVHlwZXNbJ2JldHdlZW4nXT5cbiAgb25DaGFuZ2U6ICh2YWw6IFZhbHVlVHlwZXNbJ2JldHdlZW4nXSkgPT4gdm9pZFxuICB0eXBlOiAnaW50ZWdlcicgfCAnZmxvYXQnXG59XG5cbmNvbnN0IGRlZmF1bHRWYWx1ZSA9IHtcbiAgc3RhcnQ6IDAsXG4gIGVuZDogMSxcbn0gYXMgVmFsdWVUeXBlc1snYmV0d2VlbiddXG5cbmNvbnN0IHZhbGlkYXRlU2hhcGUgPSAoeyB2YWx1ZSwgb25DaGFuZ2UgfTogTnVtYmVyUmFuZ2VGaWVsZFByb3BzKSA9PiB7XG4gIGlmICh2YWx1ZS5zdGFydCA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlLmVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgb25DaGFuZ2UoZGVmYXVsdFZhbHVlKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJSYW5nZUZpZWxkID0gKHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxuICB0eXBlLFxufTogTnVtYmVyUmFuZ2VGaWVsZFByb3BzKSA9PiB7XG4gIGNvbnN0IHZhbGlkVmFsdWUgPSB7XG4gICAgLi4uZGVmYXVsdFZhbHVlLFxuICAgIC4uLnZhbHVlLFxuICB9XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdmFsaWRhdGVTaGFwZSh7IHZhbHVlLCBvbkNoYW5nZSwgdHlwZSB9KVxuICB9LCBbXSlcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBweS0xXCI+XG4gICAgICAgIDxkaXY+ZnJvbTwvZGl2PlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgPE51bWJlckZpZWxkXG4gICAgICAgICAgdmFsdWU9e3ZhbGlkVmFsdWUuc3RhcnQudG9TdHJpbmcoKX1cbiAgICAgICAgICBUZXh0RmllbGRQcm9wcz17e1xuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdsb3dlciBib3VuZCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgICB0eXBlPXt0eXBlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodmFsKSA9PiB7XG4gICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgIC4uLnZhbGlkVmFsdWUsXG4gICAgICAgICAgICAgIHN0YXJ0OiB2YWwsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19XG4gICAgICAgICAgey4uLkVudGVyS2V5U3VibWl0UHJvcHN9XG4gICAgICAgIC8+XG4gICAgICA8L0dyaWQ+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBweS0xXCI+XG4gICAgICAgIDxkaXY+dG88L2Rpdj5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgIDxOdW1iZXJGaWVsZFxuICAgICAgICAgIFRleHRGaWVsZFByb3BzPXt7XG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJ3VwcGVyIGJvdW5kJyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIHZhbHVlPXt2YWxpZFZhbHVlLmVuZC50b1N0cmluZygpfVxuICAgICAgICAgIHR5cGU9e3R5cGV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWwpID0+IHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgLi4udmFsaWRWYWx1ZSxcbiAgICAgICAgICAgICAgZW5kOiB2YWwsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19XG4gICAgICAgICAgey4uLkVudGVyS2V5U3VibWl0UHJvcHN9XG4gICAgICAgIC8+XG4gICAgICA8L0dyaWQ+XG4gICAgPC9HcmlkPlxuICApXG59XG4iXX0=