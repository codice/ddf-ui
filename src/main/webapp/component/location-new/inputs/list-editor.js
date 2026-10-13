import { __extends } from "tslib";
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
import React from 'react';
import Group from '../../../react-component/group/index';
import Button from '@mui/material/Button';
var ListEditor = /** @class */ (function (_super) {
    __extends(ListEditor, _super);
    function ListEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListEditor.prototype.handleAdd = function () {
        var _a = this.props, list = _a.list, defaultItem = _a.defaultItem, onChange = _a.onChange;
        var newList = list.slice();
        newList.push(defaultItem);
        onChange(newList);
    };
    ListEditor.prototype.handleRemove = function (index) {
        var _a = this.props, list = _a.list, onChange = _a.onChange;
        var newList = list.slice();
        newList.splice(index, 1);
        onChange(newList);
    };
    ListEditor.prototype.render = function () {
        var _this = this;
        var listItems = React.Children.map(this.props.children, function (child, index) { return (_jsx("li", { className: "item", children: _jsxs(Group, { children: [child, _jsx(Button, { onClick: _this.handleRemove.bind(_this, index), children: "Remove" })] }) })); });
        return (_jsxs("div", { children: [_jsx("ul", { className: "list flex flex-col flex-nowrap space-y-2", children: listItems }), _jsx(Button, { onClick: this.handleAdd.bind(this), className: "mt-2", fullWidth: true, children: "Add" })] }));
    };
    return ListEditor;
}(React.Component));
export default ListEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1lZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9pbnB1dHMvbGlzdC1lZGl0b3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUV6QixPQUFPLEtBQUssTUFBTSxzQ0FBc0MsQ0FBQTtBQUN4RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QztJQUF5Qiw4QkFLdkI7SUFMRjs7SUE2Q0EsQ0FBQztJQXZDQyw4QkFBUyxHQUFUO1FBQ1EsSUFBQSxLQUFrQyxJQUFJLENBQUMsS0FBSyxFQUExQyxJQUFJLFVBQUEsRUFBRSxXQUFXLGlCQUFBLEVBQUUsUUFBUSxjQUFlLENBQUE7UUFDbEQsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDekIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ25CLENBQUM7SUFFRCxpQ0FBWSxHQUFaLFVBQWEsS0FBVTtRQUNmLElBQUEsS0FBcUIsSUFBSSxDQUFDLEtBQUssRUFBN0IsSUFBSSxVQUFBLEVBQUUsUUFBUSxjQUFlLENBQUE7UUFDckMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNuQixDQUFDO0lBRUQsMkJBQU0sR0FBTjtRQUFBLGlCQXdCQztRQXZCQyxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQ25CLFVBQUMsS0FBSyxFQUFFLEtBQUssSUFBSyxPQUFBLENBQ2hCLGFBQUksU0FBUyxFQUFDLE1BQU0sWUFDbEIsTUFBQyxLQUFLLGVBQ0gsS0FBSyxFQUNOLEtBQUMsTUFBTSxJQUFDLE9BQU8sRUFBRSxLQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFJLEVBQUUsS0FBSyxDQUFDLHVCQUUzQyxJQUNILEdBQ0wsQ0FDTixFQVRpQixDQVNqQixDQUNGLENBQUE7UUFDRCxPQUFPLENBQ0wsMEJBQ0UsYUFBSSxTQUFTLEVBQUMsMENBQTBDLFlBQ3JELFNBQVMsR0FDUCxFQUNMLEtBQUMsTUFBTSxJQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUMsTUFBTSxFQUFDLFNBQVMsMEJBRTdELElBQ0wsQ0FDUCxDQUFBO0lBQ0gsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQTdDRCxDQUF5QixLQUFLLENBQUMsU0FBUyxHQTZDdkM7QUFFRCxlQUFlLFVBQVUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgR3JvdXAgZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L2dyb3VwL2luZGV4J1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmNsYXNzIExpc3RFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8e1xuICBsaXN0OiBhbnlcbiAgZGVmYXVsdEl0ZW06IGFueVxuICBvbkNoYW5nZTogYW55XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGVcbn0+IHtcbiAgaGFuZGxlQWRkKCkge1xuICAgIGNvbnN0IHsgbGlzdCwgZGVmYXVsdEl0ZW0sIG9uQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgbmV3TGlzdCA9IGxpc3Quc2xpY2UoKVxuICAgIG5ld0xpc3QucHVzaChkZWZhdWx0SXRlbSlcbiAgICBvbkNoYW5nZShuZXdMaXN0KVxuICB9XG5cbiAgaGFuZGxlUmVtb3ZlKGluZGV4OiBhbnkpIHtcbiAgICBjb25zdCB7IGxpc3QsIG9uQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgbmV3TGlzdCA9IGxpc3Quc2xpY2UoKVxuICAgIG5ld0xpc3Quc3BsaWNlKGluZGV4LCAxKVxuICAgIG9uQ2hhbmdlKG5ld0xpc3QpXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgbGlzdEl0ZW1zID0gUmVhY3QuQ2hpbGRyZW4ubWFwKFxuICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbixcbiAgICAgIChjaGlsZCwgaW5kZXgpID0+IChcbiAgICAgICAgPGxpIGNsYXNzTmFtZT1cIml0ZW1cIj5cbiAgICAgICAgICA8R3JvdXA+XG4gICAgICAgICAgICB7Y2hpbGR9XG4gICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUmVtb3ZlLmJpbmQodGhpcywgaW5kZXgpfT5cbiAgICAgICAgICAgICAgUmVtb3ZlXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyb3VwPlxuICAgICAgICA8L2xpPlxuICAgICAgKVxuICAgIClcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QgZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBzcGFjZS15LTJcIj5cbiAgICAgICAgICB7bGlzdEl0ZW1zfVxuICAgICAgICA8L3VsPlxuICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQWRkLmJpbmQodGhpcyl9IGNsYXNzTmFtZT1cIm10LTJcIiBmdWxsV2lkdGg+XG4gICAgICAgICAgQWRkXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RFZGl0b3JcbiJdfQ==