import { __extends } from "tslib";
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
        var listItems = React.Children.map(this.props.children, function (child, index) { return (React.createElement("li", { className: "item" },
            React.createElement(Group, null,
                child,
                React.createElement(Button, { onClick: _this.handleRemove.bind(_this, index) }, "Remove")))); });
        return (React.createElement("div", null,
            React.createElement("ul", { className: "list flex flex-col flex-nowrap space-y-2" }, listItems),
            React.createElement(Button, { onClick: this.handleAdd.bind(this), className: "mt-2", fullWidth: true }, "Add")));
    };
    return ListEditor;
}(React.Component));
export default ListEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1lZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9pbnB1dHMvbGlzdC1lZGl0b3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRXpCLE9BQU8sS0FBSyxNQUFNLHNDQUFzQyxDQUFBO0FBQ3hELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDO0lBQXlCLDhCQUt2QjtJQUxGOztJQTZDQSxDQUFDO0lBdkNDLDhCQUFTLEdBQVQ7UUFDUSxJQUFBLEtBQWtDLElBQUksQ0FBQyxLQUFLLEVBQTFDLElBQUksVUFBQSxFQUFFLFdBQVcsaUJBQUEsRUFBRSxRQUFRLGNBQWUsQ0FBQTtRQUNsRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN6QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDbkIsQ0FBQztJQUVELGlDQUFZLEdBQVosVUFBYSxLQUFVO1FBQ2YsSUFBQSxLQUFxQixJQUFJLENBQUMsS0FBSyxFQUE3QixJQUFJLFVBQUEsRUFBRSxRQUFRLGNBQWUsQ0FBQTtRQUNyQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ25CLENBQUM7SUFFRCwyQkFBTSxHQUFOO1FBQUEsaUJBd0JDO1FBdkJDLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFDbkIsVUFBQyxLQUFLLEVBQUUsS0FBSyxJQUFLLE9BQUEsQ0FDaEIsNEJBQUksU0FBUyxFQUFDLE1BQU07WUFDbEIsb0JBQUMsS0FBSztnQkFDSCxLQUFLO2dCQUNOLG9CQUFDLE1BQU0sSUFBQyxPQUFPLEVBQUUsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSSxFQUFFLEtBQUssQ0FBQyxhQUUzQyxDQUNILENBQ0wsQ0FDTixFQVRpQixDQVNqQixDQUNGLENBQUE7UUFDRCxPQUFPLENBQ0w7WUFDRSw0QkFBSSxTQUFTLEVBQUMsMENBQTBDLElBQ3JELFNBQVMsQ0FDUDtZQUNMLG9CQUFDLE1BQU0sSUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFDLE1BQU0sRUFBQyxTQUFTLGdCQUU3RCxDQUNMLENBQ1AsQ0FBQTtJQUNILENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUE3Q0QsQ0FBeUIsS0FBSyxDQUFDLFNBQVMsR0E2Q3ZDO0FBRUQsZUFBZSxVQUFVLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IEdyb3VwIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9ncm91cC9pbmRleCdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5jbGFzcyBMaXN0RWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHtcbiAgbGlzdDogYW55XG4gIGRlZmF1bHRJdGVtOiBhbnlcbiAgb25DaGFuZ2U6IGFueVxuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlXG59PiB7XG4gIGhhbmRsZUFkZCgpIHtcbiAgICBjb25zdCB7IGxpc3QsIGRlZmF1bHRJdGVtLCBvbkNoYW5nZSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IG5ld0xpc3QgPSBsaXN0LnNsaWNlKClcbiAgICBuZXdMaXN0LnB1c2goZGVmYXVsdEl0ZW0pXG4gICAgb25DaGFuZ2UobmV3TGlzdClcbiAgfVxuXG4gIGhhbmRsZVJlbW92ZShpbmRleDogYW55KSB7XG4gICAgY29uc3QgeyBsaXN0LCBvbkNoYW5nZSB9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IG5ld0xpc3QgPSBsaXN0LnNsaWNlKClcbiAgICBuZXdMaXN0LnNwbGljZShpbmRleCwgMSlcbiAgICBvbkNoYW5nZShuZXdMaXN0KVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGxpc3RJdGVtcyA9IFJlYWN0LkNoaWxkcmVuLm1hcChcbiAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW4sXG4gICAgICAoY2hpbGQsIGluZGV4KSA9PiAoXG4gICAgICAgIDxsaSBjbGFzc05hbWU9XCJpdGVtXCI+XG4gICAgICAgICAgPEdyb3VwPlxuICAgICAgICAgICAge2NoaWxkfVxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXt0aGlzLmhhbmRsZVJlbW92ZS5iaW5kKHRoaXMsIGluZGV4KX0+XG4gICAgICAgICAgICAgIFJlbW92ZVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9Hcm91cD5cbiAgICAgICAgPC9saT5cbiAgICAgIClcbiAgICApXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0IGZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgc3BhY2UteS0yXCI+XG4gICAgICAgICAge2xpc3RJdGVtc31cbiAgICAgICAgPC91bD5cbiAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXt0aGlzLmhhbmRsZUFkZC5iaW5kKHRoaXMpfSBjbGFzc05hbWU9XCJtdC0yXCIgZnVsbFdpZHRoPlxuICAgICAgICAgIEFkZFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0RWRpdG9yXG4iXX0=