import { __assign, __rest } from "tslib";
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
import Group from '../group';
import TextFieldMui from '@mui/material/TextField';
var TextField = function (props) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Props'.
    var label = props.label, addon = props.addon, value = props.value, _a = props.type, type = _a === void 0 ? 'text' : _a, onChange = props.onChange, rest = __rest(props, ["label", "addon", "value", "type", "onChange"]);
    return (React.createElement(Group, null,
        label !== undefined ? (React.createElement("span", { className: "p-2 shrink-0 grow-0", style: {
                minWidth: '120px',
            } },
            label,
            "\u00A0")) : null,
        React.createElement(TextFieldMui, __assign({ size: "small", variant: "outlined", fullWidth: true, className: "shrink overflow-hidden", value: value !== undefined ? value : '', type: type, onChange: function (e) {
                // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
                onChange(e.target.value);
            } }, rest)),
        addon !== undefined ? (React.createElement("label", { className: "p-2 shrink-0 grow-0" }, addon)) : null));
};
export default TextField;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1maWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdGV4dC1maWVsZC90ZXh0LWZpZWxkLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUV6QixPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxZQUFZLE1BQU0seUJBQXlCLENBQUE7QUFPbEQsSUFBTSxTQUFTLEdBQUcsVUFBQyxLQUFZO0lBQzdCLDRGQUE0RjtJQUNwRixJQUFBLEtBQUssR0FBcUQsS0FBSyxNQUExRCxFQUFFLEtBQUssR0FBOEMsS0FBSyxNQUFuRCxFQUFFLEtBQUssR0FBdUMsS0FBSyxNQUE1QyxFQUFFLEtBQXFDLEtBQUssS0FBN0IsRUFBYixJQUFJLG1CQUFHLE1BQU0sS0FBQSxFQUFFLFFBQVEsR0FBYyxLQUFLLFNBQW5CLEVBQUssSUFBSSxVQUFLLEtBQUssRUFBakUsK0NBQXlELENBQUYsQ0FBVTtJQUN2RSxPQUFPLENBQ0wsb0JBQUMsS0FBSztRQUNILEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQ3JCLDhCQUNFLFNBQVMsRUFBQyxxQkFBcUIsRUFDL0IsS0FBSyxFQUFFO2dCQUNMLFFBQVEsRUFBRSxPQUFPO2FBQ2xCO1lBRUEsS0FBSztxQkFFRCxDQUNSLENBQUMsQ0FBQyxDQUFDLElBQUk7UUFDUixvQkFBQyxZQUFZLGFBQ1gsSUFBSSxFQUFDLE9BQU8sRUFDWixPQUFPLEVBQUMsVUFBVSxFQUNsQixTQUFTLFFBQ1QsU0FBUyxFQUFDLHdCQUF3QixFQUNsQyxLQUFLLEVBQUUsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQ3ZDLElBQUksRUFBRSxJQUFJLEVBQ1YsUUFBUSxFQUFFLFVBQUMsQ0FBQztnQkFDVixtSkFBbUo7Z0JBQ25KLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzFCLENBQUMsSUFDRyxJQUFJLEVBQ1I7UUFDRCxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUNyQiwrQkFBTyxTQUFTLEVBQUMscUJBQXFCLElBQUUsS0FBSyxDQUFTLENBQ3ZELENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDRixDQUNULENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgR3JvdXAgZnJvbSAnLi4vZ3JvdXAnXG5pbXBvcnQgVGV4dEZpZWxkTXVpIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuXG50eXBlIFByb3BzID0ge1xuICB2YWx1ZT86IHN0cmluZ1xuICBvbkNoYW5nZT86ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55XG59XG5cbmNvbnN0IFRleHRGaWVsZCA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnbGFiZWwnIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ1Byb3BzJy5cbiAgY29uc3QgeyBsYWJlbCwgYWRkb24sIHZhbHVlLCB0eXBlID0gJ3RleHQnLCBvbkNoYW5nZSwgLi4ucmVzdCB9ID0gcHJvcHNcbiAgcmV0dXJuIChcbiAgICA8R3JvdXA+XG4gICAgICB7bGFiZWwgIT09IHVuZGVmaW5lZCA/IChcbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJwLTIgc2hyaW5rLTAgZ3Jvdy0wXCJcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgbWluV2lkdGg6ICcxMjBweCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICAmbmJzcDtcbiAgICAgICAgPC9zcGFuPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8VGV4dEZpZWxkTXVpXG4gICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICBjbGFzc05hbWU9XCJzaHJpbmsgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgdmFsdWU9e3ZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6ICcnfVxuICAgICAgICB0eXBlPXt0eXBlfVxuICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjcyMikgRklYTUU6IENhbm5vdCBpbnZva2UgYW4gb2JqZWN0IHdoaWNoIGlzIHBvc3NpYmx5ICd1bmRlZmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICBvbkNoYW5nZShlLnRhcmdldC52YWx1ZSlcbiAgICAgICAgfX1cbiAgICAgICAgey4uLnJlc3R9XG4gICAgICAvPlxuICAgICAge2FkZG9uICE9PSB1bmRlZmluZWQgPyAoXG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJwLTIgc2hyaW5rLTAgZ3Jvdy0wXCI+e2FkZG9ufTwvbGFiZWw+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0dyb3VwPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRGaWVsZFxuIl19