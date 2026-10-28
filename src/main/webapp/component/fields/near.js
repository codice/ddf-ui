import { __assign } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Grid, { container: true, className: "w-full", direction: "column", alignItems: "flex-start", wrap: "nowrap", children: [_jsx(Grid, { item: true, className: "w-full pb-2", children: _jsx(CustomInputOrDefault, { value: validValue.second, onChange: function (val) {
                        onChange(__assign(__assign({}, validValue), { second: val }));
                    }, props: {
                        fullWidth: true,
                        variant: 'outlined',
                        type: 'text',
                        size: 'small',
                    } }) }), _jsx(Grid, { item: true, className: "w-full pb-2 pl-2", children: "within" }), _jsx(Grid, { item: true, className: "w-full pb-2", children: _jsx(NumberField, { type: "integer", value: validValue.distance.toString(), onChange: function (val) {
                        onChange(__assign(__assign({}, validValue), { distance: val }));
                    }, validation: function (val) { return val > 0; }, validationText: "Must be greater than 0, using previous value of " }) }), _jsx(Grid, { item: true, className: "w-full pb-2 pl-2", children: "of" }), _jsx(Grid, { item: true, className: "w-full", children: _jsx(CustomInputOrDefault, { value: validValue.first, onChange: function (val) {
                        onChange(__assign(__assign({}, validValue), { first: val }));
                    }, props: {
                        fullWidth: true,
                        variant: 'outlined',
                        type: 'text',
                        size: 'small',
                    } }) })] }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmllbGRzL25lYXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBRXJDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdFQUFnRSxDQUFBO0FBQ3JHLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFPdEMsSUFBTSxZQUFZLEdBQUc7SUFDbkIsS0FBSyxFQUFFLEVBQUU7SUFDVCxNQUFNLEVBQUUsRUFBRTtJQUNWLFFBQVEsRUFBRSxDQUFDO0NBQ2UsQ0FBQTtBQUU1QixJQUFNLGFBQWEsR0FBRyxVQUFDLEVBQW1DO1FBQWpDLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQTtJQUN0QyxJQUNFLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUztRQUM1QixLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVM7UUFDekIsS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQzFCLENBQUM7UUFDRCxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDeEIsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLFNBQVMsR0FBRyxVQUFDLEVBQW1DO1FBQWpDLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQTtJQUN6QyxJQUFNLFVBQVUseUJBQ1gsWUFBWSxHQUNaLEtBQUssQ0FDVCxDQUFBO0lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLENBQUMsQ0FBQTtJQUNwQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDTixPQUFPLENBQ0wsTUFBQyxJQUFJLElBQ0gsU0FBUyxRQUNULFNBQVMsRUFBQyxRQUFRLEVBQ2xCLFNBQVMsRUFBQyxRQUFRLEVBQ2xCLFVBQVUsRUFBQyxZQUFZLEVBQ3ZCLElBQUksRUFBQyxRQUFRLGFBRWIsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxhQUFhLFlBQ2hDLEtBQUMsb0JBQW9CLElBQ25CLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxFQUN4QixRQUFRLEVBQUUsVUFBQyxHQUFRO3dCQUNqQixRQUFRLHVCQUNILFVBQVUsS0FDYixNQUFNLEVBQUUsR0FBRyxJQUNYLENBQUE7b0JBQ0osQ0FBQyxFQUNELEtBQUssRUFBRTt3QkFDTCxTQUFTLEVBQUUsSUFBSTt3QkFDZixPQUFPLEVBQUUsVUFBVTt3QkFDbkIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLE9BQU87cUJBQ2QsR0FDRCxHQUNHLEVBQ1AsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxrQkFBa0IsdUJBRWhDLEVBQ1AsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxhQUFhLFlBQ2hDLEtBQUMsV0FBVyxJQUNWLElBQUksRUFBQyxTQUFTLEVBQ2QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQ3JDLFFBQVEsRUFBRSxVQUFDLEdBQUc7d0JBQ1osUUFBUSx1QkFDSCxVQUFVLEtBQ2IsUUFBUSxFQUFFLEdBQUcsSUFDYixDQUFBO29CQUNKLENBQUMsRUFDRCxVQUFVLEVBQUUsVUFBQyxHQUFHLElBQUssT0FBQSxHQUFHLEdBQUcsQ0FBQyxFQUFQLENBQU8sRUFDNUIsY0FBYyxFQUFDLGtEQUFrRCxHQUNqRSxHQUNHLEVBQ1AsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxrQkFBa0IsbUJBRWhDLEVBQ1AsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxRQUFRLFlBQzNCLEtBQUMsb0JBQW9CLElBQ25CLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxFQUN2QixRQUFRLEVBQUUsVUFBQyxHQUFRO3dCQUNqQixRQUFRLHVCQUNILFVBQVUsS0FDYixLQUFLLEVBQUUsR0FBRyxJQUNWLENBQUE7b0JBQ0osQ0FBQyxFQUNELEtBQUssRUFBRTt3QkFDTCxTQUFTLEVBQUUsSUFBSTt3QkFDZixPQUFPLEVBQUUsVUFBVTt3QkFDbkIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLE9BQU87cUJBQ2QsR0FDRCxHQUNHLElBQ0YsQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IHsgVmFsdWVUeXBlcyB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgeyBDdXN0b21JbnB1dE9yRGVmYXVsdCB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9maWx0ZXIvZmlsdGVyLWlucHV0L2N1c3RvbUlucHV0T3JEZWZhdWx0J1xuaW1wb3J0IHsgTnVtYmVyRmllbGQgfSBmcm9tICcuL251bWJlcidcblxudHlwZSBOZWFyRmllbGRQcm9wcyA9IHtcbiAgdmFsdWU6IFBhcnRpYWw8VmFsdWVUeXBlc1sncHJveGltaXR5J10+XG4gIG9uQ2hhbmdlOiAodmFsOiBWYWx1ZVR5cGVzWydwcm94aW1pdHknXSkgPT4gdm9pZFxufVxuXG5jb25zdCBkZWZhdWx0VmFsdWUgPSB7XG4gIGZpcnN0OiAnJyxcbiAgc2Vjb25kOiAnJyxcbiAgZGlzdGFuY2U6IDIsXG59IGFzIFZhbHVlVHlwZXNbJ3Byb3hpbWl0eSddXG5cbmNvbnN0IHZhbGlkYXRlU2hhcGUgPSAoeyB2YWx1ZSwgb25DaGFuZ2UgfTogTmVhckZpZWxkUHJvcHMpID0+IHtcbiAgaWYgKFxuICAgIHZhbHVlLmRpc3RhbmNlID09PSB1bmRlZmluZWQgfHxcbiAgICB2YWx1ZS5maXJzdCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUuc2Vjb25kID09PSB1bmRlZmluZWRcbiAgKSB7XG4gICAgb25DaGFuZ2UoZGVmYXVsdFZhbHVlKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBOZWFyRmllbGQgPSAoeyB2YWx1ZSwgb25DaGFuZ2UgfTogTmVhckZpZWxkUHJvcHMpID0+IHtcbiAgY29uc3QgdmFsaWRWYWx1ZSA9IHtcbiAgICAuLi5kZWZhdWx0VmFsdWUsXG4gICAgLi4udmFsdWUsXG4gIH1cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB2YWxpZGF0ZVNoYXBlKHsgdmFsdWUsIG9uQ2hhbmdlIH0pXG4gIH0sIFtdKVxuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBjb250YWluZXJcbiAgICAgIGNsYXNzTmFtZT1cInctZnVsbFwiXG4gICAgICBkaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgYWxpZ25JdGVtcz1cImZsZXgtc3RhcnRcIlxuICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcGItMlwiPlxuICAgICAgICA8Q3VzdG9tSW5wdXRPckRlZmF1bHRcbiAgICAgICAgICB2YWx1ZT17dmFsaWRWYWx1ZS5zZWNvbmR9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAuLi52YWxpZFZhbHVlLFxuICAgICAgICAgICAgICBzZWNvbmQ6IHZhbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICBwcm9wcz17e1xuICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgdmFyaWFudDogJ291dGxpbmVkJyxcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBiLTIgcGwtMlwiPlxuICAgICAgICB3aXRoaW5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBiLTJcIj5cbiAgICAgICAgPE51bWJlckZpZWxkXG4gICAgICAgICAgdHlwZT1cImludGVnZXJcIlxuICAgICAgICAgIHZhbHVlPXt2YWxpZFZhbHVlLmRpc3RhbmNlLnRvU3RyaW5nKCl9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWwpID0+IHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgLi4udmFsaWRWYWx1ZSxcbiAgICAgICAgICAgICAgZGlzdGFuY2U6IHZhbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX1cbiAgICAgICAgICB2YWxpZGF0aW9uPXsodmFsKSA9PiB2YWwgPiAwfVxuICAgICAgICAgIHZhbGlkYXRpb25UZXh0PVwiTXVzdCBiZSBncmVhdGVyIHRoYW4gMCwgdXNpbmcgcHJldmlvdXMgdmFsdWUgb2YgXCJcbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIHBiLTIgcGwtMlwiPlxuICAgICAgICBvZlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGxcIj5cbiAgICAgICAgPEN1c3RvbUlucHV0T3JEZWZhdWx0XG4gICAgICAgICAgdmFsdWU9e3ZhbGlkVmFsdWUuZmlyc3R9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2YWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAuLi52YWxpZFZhbHVlLFxuICAgICAgICAgICAgICBmaXJzdDogdmFsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIHByb3BzPXt7XG4gICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICB2YXJpYW50OiAnb3V0bGluZWQnLFxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJyxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuIl19