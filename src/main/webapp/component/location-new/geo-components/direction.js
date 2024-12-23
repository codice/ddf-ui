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
import TextField from '@mui/material/TextField';
var Direction = /** @class */ (function (_super) {
    __extends(Direction, _super);
    function Direction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Direction.prototype.getToggledOption = function () {
        return this.props.value === this.props.options[0]
            ? this.props.options[1]
            : this.props.options[0];
    };
    Direction.prototype.handleMouseDown = function (e) {
        e.preventDefault();
        this.props.onChange(this.getToggledOption());
    };
    Direction.prototype.handleKeyPress = function (e) {
        var toggledOption = this.getToggledOption();
        if (String.fromCharCode(e.which).toUpperCase() === toggledOption.toUpperCase()) {
            ;
            this.props.onChange(toggledOption);
        }
    };
    Direction.prototype.render = function () {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
        var value = this.props.value;
        return (React.createElement("div", { className: "shrink-0 grow-0" },
            React.createElement(TextField, { size: "small", variant: "outlined", value: value, className: "flex-1 w-12 cursor-pointer", onMouseDown: this.handleMouseDown.bind(this), onKeyPress: this.handleKeyPress.bind(this), onChange: function (e) { return e.stopPropagation(); } })));
    };
    return Direction;
}(React.Component));
export default Direction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvZ2VvLWNvbXBvbmVudHMvZGlyZWN0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQztJQUF3Qiw2QkFBZTtJQUF2Qzs7SUFtQ0EsQ0FBQztJQWxDQyxvQ0FBZ0IsR0FBaEI7UUFDRSxPQUFRLElBQUksQ0FBQyxLQUFhLENBQUMsS0FBSyxLQUFNLElBQUksQ0FBQyxLQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUUsSUFBSSxDQUFDLEtBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBRSxJQUFJLENBQUMsS0FBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBQ0QsbUNBQWUsR0FBZixVQUFnQixDQUFNO1FBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDakI7UUFBQyxJQUFJLENBQUMsS0FBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFBO0lBQ3hELENBQUM7SUFDRCxrQ0FBYyxHQUFkLFVBQWUsQ0FBTTtRQUNuQixJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtRQUM3QyxJQUNFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFDMUU7WUFDQSxDQUFDO1lBQUMsSUFBSSxDQUFDLEtBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUE7U0FDN0M7SUFDSCxDQUFDO0lBQ0QsMEJBQU0sR0FBTjtRQUNFLG1KQUFtSjtRQUMzSSxJQUFBLEtBQUssR0FBSyxJQUFJLENBQUMsS0FBSyxNQUFmLENBQWU7UUFDNUIsT0FBTyxDQUNMLDZCQUFLLFNBQVMsRUFBQyxpQkFBaUI7WUFDOUIsb0JBQUMsU0FBUyxJQUNSLElBQUksRUFBQyxPQUFPLEVBQ1osT0FBTyxFQUFDLFVBQVUsRUFDbEIsS0FBSyxFQUFFLEtBQUssRUFDWixTQUFTLEVBQUMsNEJBQTRCLEVBQ3RDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDNUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUMxQyxRQUFRLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQW5CLENBQW1CLEdBQ3BDLENBQ0UsQ0FDUCxDQUFBO0lBQ0gsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQW5DRCxDQUF3QixLQUFLLENBQUMsU0FBUyxHQW1DdEM7QUFDRCxlQUFlLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmNsYXNzIERpcmVjdGlvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGdldFRvZ2dsZWRPcHRpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLnByb3BzIGFzIGFueSkudmFsdWUgPT09ICh0aGlzLnByb3BzIGFzIGFueSkub3B0aW9uc1swXVxuICAgICAgPyAodGhpcy5wcm9wcyBhcyBhbnkpLm9wdGlvbnNbMV1cbiAgICAgIDogKHRoaXMucHJvcHMgYXMgYW55KS5vcHRpb25zWzBdXG4gIH1cbiAgaGFuZGxlTW91c2VEb3duKGU6IGFueSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIDsodGhpcy5wcm9wcyBhcyBhbnkpLm9uQ2hhbmdlKHRoaXMuZ2V0VG9nZ2xlZE9wdGlvbigpKVxuICB9XG4gIGhhbmRsZUtleVByZXNzKGU6IGFueSkge1xuICAgIGNvbnN0IHRvZ2dsZWRPcHRpb24gPSB0aGlzLmdldFRvZ2dsZWRPcHRpb24oKVxuICAgIGlmIChcbiAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkudG9VcHBlckNhc2UoKSA9PT0gdG9nZ2xlZE9wdGlvbi50b1VwcGVyQ2FzZSgpXG4gICAgKSB7XG4gICAgICA7KHRoaXMucHJvcHMgYXMgYW55KS5vbkNoYW5nZSh0b2dnbGVkT3B0aW9uKVxuICAgIH1cbiAgfVxuICByZW5kZXIoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAndmFsdWUnIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ1JlYWRvbmx5PC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gdGhpcy5wcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNocmluay0wIGdyb3ctMFwiPlxuICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4LTEgdy0xMiBjdXJzb3ItcG9pbnRlclwiXG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duLmJpbmQodGhpcyl9XG4gICAgICAgICAgb25LZXlQcmVzcz17dGhpcy5oYW5kbGVLZXlQcmVzcy5iaW5kKHRoaXMpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gZS5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgRGlyZWN0aW9uXG4iXX0=