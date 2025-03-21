import { __assign, __extends, __read, __rest, __spreadArray } from "tslib";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
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
import MaskedInput from 'react-text-mask';
import TextField from '@mui/material/TextField';
var MaskedTextField = /** @class */ (function (_super) {
    __extends(MaskedTextField, _super);
    function MaskedTextField() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.prevEvent = undefined;
        return _this;
    }
    MaskedTextField.prototype.padEndWithZeros = function (value) {
        // This function is called for each field (east, west, south, north) multiple times.
        // Sometimes the event variable is defined, other times it's undefined.
        // We must capture the event in a variable when it's defined
        // in order to leverage it in checks below even when it's undefined.
        if (event) {
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'Event' is not assignable to type 'undefined'... Remove this comment to see the full error message
            this.prevEvent = event;
        }
        if (value === undefined ||
            !value.includes('.') ||
            (((event && event.type === 'input') ||
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                (this.prevEvent && this.prevEvent.type === 'input')) &&
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                this.prevEvent.target.id === this.props.label)) {
            return value;
        }
        var dmsCoordinateParts = value.toString().split("'");
        if (dmsCoordinateParts.length < 2) {
            return value;
        }
        var decimalParts = dmsCoordinateParts[1].toString().split('.');
        if (decimalParts.length < 2) {
            return value;
        }
        var decimal = decimalParts[1].replace('"', '');
        if (!decimal.endsWith('_')) {
            return value;
        }
        var indexOfUnderscore = decimal.indexOf('_');
        var decimalLength = decimal.length;
        decimal = decimal.substring(0, indexOfUnderscore);
        return (dmsCoordinateParts[0] +
            "'" +
            decimalParts[0] +
            '.' +
            decimal.padEnd(decimalLength, '0') +
            '"');
    };
    MaskedTextField.prototype.render = function () {
        var _this = this;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
        var _a = this.props, label = _a.label, addon = _a.addon, onChange = _a.onChange, value = _a.value, args = __rest(_a, ["label", "addon", "onChange", "value"]);
        return (_jsx("div", { className: "flex-1", children: _jsxs(Group, { children: [label != null ? (_jsxs("div", { className: "p-2 shrink-0 grow-0", style: {
                            minWidth: '120px',
                        }, children: [label, "\u00A0"] })) : null, _jsx(MaskedInput, __assign({ className: "inline-block w-full whitespace-nowrap shrink", value: value, keepCharPositions: true, onChange: function (e) {
                            ;
                            _this.props.onChange(e.target.value);
                        }, pipe: function (value) { return _this.padEndWithZeros(value); }, render: function (setRef, _a) {
                            var defaultValue = _a.defaultValue, props = __rest(_a, ["defaultValue"]);
                            return (_jsx(TextField, __assign({ size: "small", fullWidth: true, variant: "outlined", id: label, inputRef: function (ref) {
                                    setRef(ref);
                                    _this.ref = ref;
                                }, value: defaultValue || '' }, props)));
                        } }, args)), addon != null ? (_jsx("label", { className: "p-2 shrink-0 grow-0", children: addon })) : null] }) }));
    };
    return MaskedTextField;
}(React.Component));
export default MaskedTextField;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFza2VkLXRleHQtZmllbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9pbnB1dHMvbWFza2VkLXRleHQtZmllbGQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEtBQUssTUFBTSxzQ0FBc0MsQ0FBQTtBQUN4RCxPQUFPLFdBQWlDLE1BQU0saUJBQWlCLENBQUE7QUFDL0QsT0FBTyxTQUFTLE1BQU0seUJBQXlCLENBQUE7QUFDL0M7SUFBOEIsbUNBQWlDO0lBQS9EOztRQUVFLGVBQVMsR0FBRyxTQUFTLENBQUE7O0lBK0Z2QixDQUFDO0lBOUZDLHlDQUFlLEdBQWYsVUFBZ0IsS0FBVTtRQUN4QixvRkFBb0Y7UUFDcEYsdUVBQXVFO1FBQ3ZFLDREQUE0RDtRQUM1RCxvRUFBb0U7UUFDcEUsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLG1KQUFtSjtZQUNuSixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtRQUN4QixDQUFDO1FBQ0QsSUFDRSxLQUFLLEtBQUssU0FBUztZQUNuQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQztnQkFDakMsMkVBQTJFO2dCQUMzRSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUM7Z0JBQ3BELDJFQUEyRTtnQkFDM0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFNLElBQUksQ0FBQyxLQUFhLENBQUMsS0FBSyxDQUFDLEVBQ3pELENBQUM7WUFDRCxPQUFPLEtB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QkFDSCxDQUFDLElBQ0csSUFBSSxFQUNSLEVBQ0QsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDZixnQkFBTyxTQUFTLEVBQUMscUJBQXFCLFlBQUUsS0FBSyxHQUFTLENBQ3ZELENBQUMsQ0FBQyxDQUFDLElBQUksSUFDRixHQUNKLENBQ1AsQ0FBQTtJQUNILENBQUM7SUFDSCxzQkFBQztBQUFELENBQUMsQUFqR0QsQ0FBOEIsS0FBSyxDQUFDLFNBQVMsR0FpRzVDO0FBQ0QsZUFBZSxlQUFlLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBHcm91cCBmcm9tICcuLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvZ3JvdXAvaW5kZXgnXG5pbXBvcnQgTWFza2VkSW5wdXQsIHsgTWFza2VkSW5wdXRQcm9wcyB9IGZyb20gJ3JlYWN0LXRleHQtbWFzaydcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5jbGFzcyBNYXNrZWRUZXh0RmllbGQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8TWFza2VkSW5wdXRQcm9wcz4ge1xuICByZWY6IGFueVxuICBwcmV2RXZlbnQgPSB1bmRlZmluZWRcbiAgcGFkRW5kV2l0aFplcm9zKHZhbHVlOiBhbnkpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBmb3IgZWFjaCBmaWVsZCAoZWFzdCwgd2VzdCwgc291dGgsIG5vcnRoKSBtdWx0aXBsZSB0aW1lcy5cbiAgICAvLyBTb21ldGltZXMgdGhlIGV2ZW50IHZhcmlhYmxlIGlzIGRlZmluZWQsIG90aGVyIHRpbWVzIGl0J3MgdW5kZWZpbmVkLlxuICAgIC8vIFdlIG11c3QgY2FwdHVyZSB0aGUgZXZlbnQgaW4gYSB2YXJpYWJsZSB3aGVuIGl0J3MgZGVmaW5lZFxuICAgIC8vIGluIG9yZGVyIHRvIGxldmVyYWdlIGl0IGluIGNoZWNrcyBiZWxvdyBldmVuIHdoZW4gaXQncyB1bmRlZmluZWQuXG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJ0V2ZW50JyBpcyBub3QgYXNzaWduYWJsZSB0byB0eXBlICd1bmRlZmluZWQnLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHRoaXMucHJldkV2ZW50ID0gZXZlbnRcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgIXZhbHVlLmluY2x1ZGVzKCcuJykgfHxcbiAgICAgICgoKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdpbnB1dCcpIHx8XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMyKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICd1bmRlZmluZWQnLlxuICAgICAgICAodGhpcy5wcmV2RXZlbnQgJiYgdGhpcy5wcmV2RXZlbnQudHlwZSA9PT0gJ2lucHV0JykpICYmXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMyKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICd1bmRlZmluZWQnLlxuICAgICAgICB0aGlzLnByZXZFdmVudC50YXJnZXQuaWQgPT09ICh0aGlzLnByb3BzIGFzIGFueSkubGFiZWwpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgY29uc3QgZG1zQ29vcmRpbmF0ZVBhcnRzID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdChcIidcIilcbiAgICBpZiAoZG1zQ29vcmRpbmF0ZVBhcnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICBjb25zdCBkZWNpbWFsUGFydHMgPSBkbXNDb29yZGluYXRlUGFydHNbMV0udG9TdHJpbmcoKS5zcGxpdCgnLicpXG4gICAgaWYgKGRlY2ltYWxQYXJ0cy5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgbGV0IGRlY2ltYWwgPSBkZWNpbWFsUGFydHNbMV0ucmVwbGFjZSgnXCInLCAnJylcbiAgICBpZiAoIWRlY2ltYWwuZW5kc1dpdGgoJ18nKSkge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIGNvbnN0IGluZGV4T2ZVbmRlcnNjb3JlID0gZGVjaW1hbC5pbmRleE9mKCdfJylcbiAgICBjb25zdCBkZWNpbWFsTGVuZ3RoID0gZGVjaW1hbC5sZW5ndGhcbiAgICBkZWNpbWFsID0gZGVjaW1hbC5zdWJzdHJpbmcoMCwgaW5kZXhPZlVuZGVyc2NvcmUpXG4gICAgcmV0dXJuIChcbiAgICAgIGRtc0Nvb3JkaW5hdGVQYXJ0c1swXSArXG4gICAgICBcIidcIiArXG4gICAgICBkZWNpbWFsUGFydHNbMF0gK1xuICAgICAgJy4nICtcbiAgICAgIGRlY2ltYWwucGFkRW5kKGRlY2ltYWxMZW5ndGgsICcwJykgK1xuICAgICAgJ1wiJ1xuICAgIClcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMzkpIEZJWE1FOiBQcm9wZXJ0eSAnbGFiZWwnIGRvZXMgbm90IGV4aXN0IG9uIHR5cGUgJ1JlYWRvbmx5PC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgY29uc3QgeyBsYWJlbCwgYWRkb24sIG9uQ2hhbmdlLCB2YWx1ZSwgLi4uYXJncyB9ID0gdGhpcy5wcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMVwiPlxuICAgICAgICA8R3JvdXA+XG4gICAgICAgICAge2xhYmVsICE9IG51bGwgPyAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInAtMiBzaHJpbmstMCBncm93LTBcIlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIG1pbldpZHRoOiAnMTIwcHgnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bGFiZWx9XG4gICAgICAgICAgICAgICZuYnNwO1xuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPE1hc2tlZElucHV0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgdy1mdWxsIHdoaXRlc3BhY2Utbm93cmFwIHNocmlua1wiXG4gICAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgICBrZWVwQ2hhclBvc2l0aW9uc1xuICAgICAgICAgICAgb25DaGFuZ2U9eyhlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgOyh0aGlzLnByb3BzIGFzIGFueSkub25DaGFuZ2UoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgcGlwZT17KHZhbHVlOiBhbnkpID0+IHRoaXMucGFkRW5kV2l0aFplcm9zKHZhbHVlKX1cbiAgICAgICAgICAgIHJlbmRlcj17KHNldFJlZjogYW55LCB7IGRlZmF1bHRWYWx1ZSwgLi4ucHJvcHMgfTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgICAgICAgIGlkPXtsYWJlbH1cbiAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXsocmVmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldFJlZihyZWYpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmID0gcmVmXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2RlZmF1bHRWYWx1ZSB8fCAnJ31cbiAgICAgICAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgey4uLmFyZ3N9XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7YWRkb24gIT0gbnVsbCA/IChcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJwLTIgc2hyaW5rLTAgZ3Jvdy0wXCI+e2FkZG9ufTwvbGFiZWw+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvR3JvdXA+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IE1hc2tlZFRleHRGaWVsZFxuIl19