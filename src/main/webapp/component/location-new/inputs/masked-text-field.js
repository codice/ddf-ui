import { __assign, __extends, __rest } from "tslib";
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
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
        // eslint-disable-next-line no-unused-vars
        var _a = this.props, label = _a.label, addon = _a.addon, onChange = _a.onChange, value = _a.value, args = __rest(_a, ["label", "addon", "onChange", "value"]);
        return (React.createElement("div", { className: "flex-1" },
            React.createElement(Group, null,
                label != null ? (React.createElement("div", { className: "p-2 shrink-0 grow-0", style: {
                        minWidth: '120px',
                    } },
                    label,
                    "\u00A0")) : null,
                React.createElement(MaskedInput, __assign({ className: "inline-block w-full whitespace-nowrap shrink", value: value, keepCharPositions: true, onChange: function (e) {
                        ;
                        _this.props.onChange(e.target.value);
                    }, pipe: function (value) { return _this.padEndWithZeros(value); }, render: function (setRef, _a) {
                        var defaultValue = _a.defaultValue, props = __rest(_a, ["defaultValue"]);
                        return (React.createElement(TextField, __assign({ size: "small", fullWidth: true, variant: "outlined", id: label, inputRef: function (ref) {
                                setRef(ref);
                                _this.ref = ref;
                            }, value: defaultValue || '' }, props)));
                    } }, args)),
                addon != null ? (React.createElement("label", { className: "p-2 shrink-0 grow-0" }, addon)) : null)));
    };
    return MaskedTextField;
}(React.Component));
export default MaskedTextField;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFza2VkLXRleHQtZmllbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9pbnB1dHMvbWFza2VkLXRleHQtZmllbGQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sS0FBSyxNQUFNLHNDQUFzQyxDQUFBO0FBQ3hELE9BQU8sV0FBaUMsTUFBTSxpQkFBaUIsQ0FBQTtBQUMvRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQztJQUE4QixtQ0FBaUM7SUFBL0Q7UUFBQSxxRUFrR0M7UUFoR0MsZUFBUyxHQUFHLFNBQVMsQ0FBQTs7SUFnR3ZCLENBQUM7SUEvRkMseUNBQWUsR0FBZixVQUFnQixLQUFVO1FBQ3hCLG9GQUFvRjtRQUNwRix1RUFBdUU7UUFDdkUsNERBQTREO1FBQzVELG9FQUFvRTtRQUNwRSxJQUFJLEtBQUssRUFBRTtZQUNULG1KQUFtSjtZQUNuSixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtTQUN2QjtRQUNELElBQ0UsS0FBSyxLQUFLLFNBQVM7WUFDbkIsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUM7Z0JBQ2pDLDJFQUEyRTtnQkFDM0UsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRCwyRUFBMkU7Z0JBQzNFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBTSxJQUFJLENBQUMsS0FBYSxDQUFDLEtBQUssQ0FBQyxFQUN6RDtZQUNBLE9BQU8sS0FBSyxD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QUksRUFDUjtnQkFDRCxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNmLCtCQUFPLFNBQVMsRUFBQyxxQkFBcUIsSUFBRSxLQUFLLENBQVMsQ0FDdkQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNGLENBQ0osQ0FDUCxDQUFBO0lBQ0gsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQWxHRCxDQUE4QixLQUFLLENBQUMsU0FBUyxHQWtHNUM7QUFDRCxlQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEdyb3VwIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9ncm91cC9pbmRleCdcbmltcG9ydCBNYXNrZWRJbnB1dCwgeyBNYXNrZWRJbnB1dFByb3BzIH0gZnJvbSAncmVhY3QtdGV4dC1tYXNrJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmNsYXNzIE1hc2tlZFRleHRGaWVsZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxNYXNrZWRJbnB1dFByb3BzPiB7XG4gIHJlZjogYW55XG4gIHByZXZFdmVudCA9IHVuZGVmaW5lZFxuICBwYWRFbmRXaXRoWmVyb3ModmFsdWU6IGFueSkge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGZvciBlYWNoIGZpZWxkIChlYXN0LCB3ZXN0LCBzb3V0aCwgbm9ydGgpIG11bHRpcGxlIHRpbWVzLlxuICAgIC8vIFNvbWV0aW1lcyB0aGUgZXZlbnQgdmFyaWFibGUgaXMgZGVmaW5lZCwgb3RoZXIgdGltZXMgaXQncyB1bmRlZmluZWQuXG4gICAgLy8gV2UgbXVzdCBjYXB0dXJlIHRoZSBldmVudCBpbiBhIHZhcmlhYmxlIHdoZW4gaXQncyBkZWZpbmVkXG4gICAgLy8gaW4gb3JkZXIgdG8gbGV2ZXJhZ2UgaXQgaW4gY2hlY2tzIGJlbG93IGV2ZW4gd2hlbiBpdCdzIHVuZGVmaW5lZC5cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAnRXZlbnQnIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHR5cGUgJ3VuZGVmaW5lZCcuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgdGhpcy5wcmV2RXZlbnQgPSBldmVudFxuICAgIH1cbiAgICBpZiAoXG4gICAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAhdmFsdWUuaW5jbHVkZXMoJy4nKSB8fFxuICAgICAgKCgoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ2lucHV0JykgfHxcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzIpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ3VuZGVmaW5lZCcuXG4gICAgICAgICh0aGlzLnByZXZFdmVudCAmJiB0aGlzLnByZXZFdmVudC50eXBlID09PSAnaW5wdXQnKSkgJiZcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzIpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ3VuZGVmaW5lZCcuXG4gICAgICAgIHRoaXMucHJldkV2ZW50LnRhcmdldC5pZCA9PT0gKHRoaXMucHJvcHMgYXMgYW55KS5sYWJlbClcbiAgICApIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICBjb25zdCBkbXNDb29yZGluYXRlUGFydHMgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KFwiJ1wiKVxuICAgIGlmIChkbXNDb29yZGluYXRlUGFydHMubGVuZ3RoIDwgMikge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIGNvbnN0IGRlY2ltYWxQYXJ0cyA9IGRtc0Nvb3JkaW5hdGVQYXJ0c1sxXS50b1N0cmluZygpLnNwbGl0KCcuJylcbiAgICBpZiAoZGVjaW1hbFBhcnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICBsZXQgZGVjaW1hbCA9IGRlY2ltYWxQYXJ0c1sxXS5yZXBsYWNlKCdcIicsICcnKVxuICAgIGlmICghZGVjaW1hbC5lbmRzV2l0aCgnXycpKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgY29uc3QgaW5kZXhPZlVuZGVyc2NvcmUgPSBkZWNpbWFsLmluZGV4T2YoJ18nKVxuICAgIGNvbnN0IGRlY2ltYWxMZW5ndGggPSBkZWNpbWFsLmxlbmd0aFxuICAgIGRlY2ltYWwgPSBkZWNpbWFsLnN1YnN0cmluZygwLCBpbmRleE9mVW5kZXJzY29yZSlcbiAgICByZXR1cm4gKFxuICAgICAgZG1zQ29vcmRpbmF0ZVBhcnRzWzBdICtcbiAgICAgIFwiJ1wiICtcbiAgICAgIGRlY2ltYWxQYXJ0c1swXSArXG4gICAgICAnLicgK1xuICAgICAgZGVjaW1hbC5wYWRFbmQoZGVjaW1hbExlbmd0aCwgJzAnKSArXG4gICAgICAnXCInXG4gICAgKVxuICB9XG4gIHJlbmRlcigpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMzOSkgRklYTUU6IFByb3BlcnR5ICdsYWJlbCcgZG9lcyBub3QgZXhpc3Qgb24gdHlwZSAnUmVhZG9ubHk8Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBjb25zdCB7IGxhYmVsLCBhZGRvbiwgb25DaGFuZ2UsIHZhbHVlLCAuLi5hcmdzIH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xXCI+XG4gICAgICAgIDxHcm91cD5cbiAgICAgICAgICB7bGFiZWwgIT0gbnVsbCA/IChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0yIHNocmluay0wIGdyb3ctMFwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMjBweCcsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8TWFza2VkSW5wdXRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayB3LWZ1bGwgd2hpdGVzcGFjZS1ub3dyYXAgc2hyaW5rXCJcbiAgICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICAgIGtlZXBDaGFyUG9zaXRpb25zXG4gICAgICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICA7KHRoaXMucHJvcHMgYXMgYW55KS5vbkNoYW5nZShlLnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBwaXBlPXsodmFsdWU6IGFueSkgPT4gdGhpcy5wYWRFbmRXaXRoWmVyb3ModmFsdWUpfVxuICAgICAgICAgICAgcmVuZGVyPXsoc2V0UmVmOiBhbnksIHsgZGVmYXVsdFZhbHVlLCAuLi5wcm9wcyB9OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICAgICAgaWQ9e2xhYmVsfVxuICAgICAgICAgICAgICAgICAgaW5wdXRSZWY9eyhyZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0UmVmKHJlZilcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWYgPSByZWZcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17ZGVmYXVsdFZhbHVlIHx8ICcnfVxuICAgICAgICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB7Li4uYXJnc31cbiAgICAgICAgICAvPlxuICAgICAgICAgIHthZGRvbiAhPSBudWxsID8gKFxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInAtMiBzaHJpbmstMCBncm93LTBcIj57YWRkb259PC9sYWJlbD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9Hcm91cD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgTWFza2VkVGV4dEZpZWxkXG4iXX0=