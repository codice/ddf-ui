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
import { CustomInputOrDefault } from '../../react-component/filter/filter-input/customInputOrDefault';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
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
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    return (React.createElement(Grid, { container: true, className: "w-full", direction: "column", alignItems: "flex-start", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(CustomInputOrDefault, { value: value.second, onChange: function (val) {
                    onChange(__assign(__assign({}, value), { second: val }));
                }, props: {
                    fullWidth: true,
                    variant: 'outlined',
                    type: 'text',
                    size: 'small',
                } })),
        React.createElement(Grid, { item: true, className: "w-full pb-2 pl-2" }, "within"),
        React.createElement(Grid, { item: true, className: "w-full pb-2" },
            React.createElement(TextField, __assign({ fullWidth: true, type: "number", variant: "outlined", value: value.distance, onChange: function (e) {
                    onChange(__assign(__assign({}, value), { distance: Math.max(1, parseInt(e.target.value) || 0) }));
                }, size: "small" }, EnterKeySubmitProps))),
        React.createElement(Grid, { item: true, className: "w-full pb-2 pl-2" }, "of"),
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(CustomInputOrDefault, { value: value.first, onChange: function (val) {
                    onChange(__assign(__assign({}, value), { first: val }));
                }, props: {
                    fullWidth: true,
                    variant: 'outlined',
                    type: 'text',
                    size: 'small',
                } }))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmllbGRzL25lYXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxTQUFTLE1BQU0seUJBQXlCLENBQUE7QUFDL0MsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFFckMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0VBQWdFLENBQUE7QUFDckcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFPdkUsSUFBTSxZQUFZLEdBQUc7SUFDbkIsS0FBSyxFQUFFLEVBQUU7SUFDVCxNQUFNLEVBQUUsRUFBRTtJQUNWLFFBQVEsRUFBRSxDQUFDO0NBQ2UsQ0FBQTtBQUU1QixJQUFNLGFBQWEsR0FBRyxVQUFDLEVBQW1DO1FBQWpDLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQTtJQUN0QyxJQUNFLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUztRQUM1QixLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVM7UUFDekIsS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQzFCO1FBQ0EsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3ZCO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sU0FBUyxHQUFHLFVBQUMsRUFBbUM7UUFBakMsS0FBSyxXQUFBLEVBQUUsUUFBUSxjQUFBO0lBQ3pDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUE7SUFDcEMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUNMLG9CQUFDLElBQUksSUFDSCxTQUFTLFFBQ1QsU0FBUyxFQUFDLFFBQVEsRUFDbEIsU0FBUyxFQUFDLFFBQVEsRUFDbEIsVUFBVSxFQUFDLFlBQVksRUFDdkIsSUFBSSxFQUFDLFFBQVE7UUFFYixvQkFBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxhQUFhO1lBQ2hDLG9CQUFDLG9CQUFvQixJQUNuQixLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFDbkIsUUFBUSxFQUFFLFVBQUMsR0FBUTtvQkFDakIsUUFBUSx1QkFDSCxLQUFLLEtBQ1IsTUFBTSxFQUFFLEdBQUcsSUFDWCxDQUFBO2dCQUNKLENBQUMsRUFDRCxLQUFLLEVBQUU7b0JBQ0wsU0FBUyxFQUFFLElBQUk7b0JBQ2YsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLElBQUksRUFBRSxNQUFNO29CQUNaLElBQUksRUFBRSxPQUFPO2lCQUNkLEdBQ0QsQ0FDRztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGtCQUFrQixhQUVoQztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGFBQWE7WUFDaEMsb0JBQUMsU0FBUyxhQUNSLFNBQVMsUUFDVCxJQUFJLEVBQUMsUUFBUSxFQUNiLE9BQU8sRUFBQyxVQUFVLEVBQ2xCLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxFQUNyQixRQUFRLEVBQUUsVUFBQyxDQUFDO29CQUNWLFFBQVEsdUJBQ0gsS0FBSyxLQUNSLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFDcEQsQ0FBQTtnQkFDSixDQUFDLEVBQ0QsSUFBSSxFQUFDLE9BQU8sSUFDUixtQkFBbUIsRUFDdkIsQ0FDRztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGtCQUFrQixTQUVoQztRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLFFBQVE7WUFDM0Isb0JBQUMsb0JBQW9CLElBQ25CLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUNsQixRQUFRLEVBQUUsVUFBQyxHQUFRO29CQUNqQixRQUFRLHVCQUNILEtBQUssS0FDUixLQUFLLEVBQUUsR0FBRyxJQUNWLENBQUE7Z0JBQ0osQ0FBQyxFQUNELEtBQUssRUFBRTtvQkFDTCxTQUFTLEVBQUUsSUFBSTtvQkFDZixPQUFPLEVBQUUsVUFBVTtvQkFDbkIsSUFBSSxFQUFFLE1BQU07b0JBQ1osSUFBSSxFQUFFLE9BQU87aUJBQ2QsR0FDRCxDQUNHLENBQ0YsQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCB7IFZhbHVlVHlwZXMgfSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgQ3VzdG9tSW5wdXRPckRlZmF1bHQgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvZmlsdGVyL2ZpbHRlci1pbnB1dC9jdXN0b21JbnB1dE9yRGVmYXVsdCdcbmltcG9ydCB7IEVudGVyS2V5U3VibWl0UHJvcHMgfSBmcm9tICcuLi9jdXN0b20tZXZlbnRzL2VudGVyLWtleS1zdWJtaXQnXG5cbnR5cGUgTmVhckZpZWxkUHJvcHMgPSB7XG4gIHZhbHVlOiBWYWx1ZVR5cGVzWydwcm94aW1pdHknXVxuICBvbkNoYW5nZTogKHZhbDogVmFsdWVUeXBlc1sncHJveGltaXR5J10pID0+IHZvaWRcbn1cblxuY29uc3QgZGVmYXVsdFZhbHVlID0ge1xuICBmaXJzdDogJycsXG4gIHNlY29uZDogJycsXG4gIGRpc3RhbmNlOiAyLFxufSBhcyBWYWx1ZVR5cGVzWydwcm94aW1pdHknXVxuXG5jb25zdCB2YWxpZGF0ZVNoYXBlID0gKHsgdmFsdWUsIG9uQ2hhbmdlIH06IE5lYXJGaWVsZFByb3BzKSA9PiB7XG4gIGlmIChcbiAgICB2YWx1ZS5kaXN0YW5jZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUuZmlyc3QgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbHVlLnNlY29uZCA9PT0gdW5kZWZpbmVkXG4gICkge1xuICAgIG9uQ2hhbmdlKGRlZmF1bHRWYWx1ZSlcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTmVhckZpZWxkID0gKHsgdmFsdWUsIG9uQ2hhbmdlIH06IE5lYXJGaWVsZFByb3BzKSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdmFsaWRhdGVTaGFwZSh7IHZhbHVlLCBvbkNoYW5nZSB9KVxuICB9LCBbXSlcbiAgcmV0dXJuIChcbiAgICA8R3JpZFxuICAgICAgY29udGFpbmVyXG4gICAgICBjbGFzc05hbWU9XCJ3LWZ1bGxcIlxuICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgIGFsaWduSXRlbXM9XCJmbGV4LXN0YXJ0XCJcbiAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgID5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBiLTJcIj5cbiAgICAgICAgPEN1c3RvbUlucHV0T3JEZWZhdWx0XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlLnNlY29uZH1cbiAgICAgICAgICBvbkNoYW5nZT17KHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgICAgICBzZWNvbmQ6IHZhbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICBwcm9wcz17e1xuICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgdmFyaWFudDogJ291dGxpbmVkJyxcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBiLTIgcGwtMlwiPlxuICAgICAgICB3aXRoaW5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBiLTJcIj5cbiAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgdmFsdWU9e3ZhbHVlLmRpc3RhbmNlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgICAgICAgZGlzdGFuY2U6IE1hdGgubWF4KDEsIHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSB8fCAwKSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgIHsuLi5FbnRlcktleVN1Ym1pdFByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGItMiBwbC0yXCI+XG4gICAgICAgIG9mXG4gICAgICA8L0dyaWQ+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAgICA8Q3VzdG9tSW5wdXRPckRlZmF1bHRcbiAgICAgICAgICB2YWx1ZT17dmFsdWUuZmlyc3R9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgICAgICAgZmlyc3Q6IHZhbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICBwcm9wcz17e1xuICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgdmFyaWFudDogJ291dGxpbmVkJyxcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICA8L0dyaWQ+XG4gIClcbn1cbiJdfQ==