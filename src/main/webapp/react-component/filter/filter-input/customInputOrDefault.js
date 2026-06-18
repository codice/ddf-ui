import { __assign, __read } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
import extension from '../../../extension-points';
import TextField from '@mui/material/TextField';
import { EnterKeySubmitProps } from '../../../component/custom-events/enter-key-submit';
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (typeof value !== 'string') {
        var booleanText = value === null || value === void 0 ? void 0 : value.text;
        if (booleanText) {
            onChange(booleanText);
        }
        else {
            onChange('');
        }
    }
};
var ShapeValidator = function (props) {
    var value = props.value;
    var _a = __read(React.useState(false), 2), isValid = _a[0], setIsValid = _a[1];
    React.useEffect(function () {
        if (typeof value !== 'string') {
            setIsValid(false);
            validateShape(props);
        }
        else {
            setIsValid(true);
        }
    }, [value]);
    if (isValid) {
        return _jsx(CustomInputOrDefaultPostValidation, __assign({}, props));
    }
    return null;
};
export var CustomInputOrDefaultPostValidation = function (_a) {
    var value = _a.value, onChange = _a.onChange, props = _a.props;
    var textValue = value;
    //Clear out value when switching between structured string inputs (e.g. NEAR)
    if (typeof textValue !== 'string') {
        textValue = (value === null || value === void 0 ? void 0 : value.text) || '';
    }
    // call out to extension, if extension handles it, great, if not fallback to this
    var componentToReturn = extension.customFilterInput({
        value: textValue,
        onChange: onChange,
    });
    if (componentToReturn) {
        return componentToReturn;
    }
    else {
        return (_jsx(TextField, __assign({ defaultValue: textValue, onChange: function (e) {
                onChange(e.target.value);
            } }, EnterKeySubmitProps, props)));
    }
};
export var CustomInputOrDefault = ShapeValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tSW5wdXRPckRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L2ZpbHRlci9maWx0ZXItaW5wdXQvY3VzdG9tSW5wdXRPckRlZmF1bHQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sU0FBUyxNQUFNLDJCQUEyQixDQUFBO0FBQ2pELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBRS9DLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFBO0FBU3ZGLElBQU0sYUFBYSxHQUFHLFVBQUMsRUFBNkM7UUFBM0MsS0FBSyxXQUFBLEVBQUUsUUFBUSxjQUFBO0lBQ3RDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDOUIsSUFBTSxXQUFXLEdBQUksS0FBeUIsYUFBekIsS0FBSyx1QkFBTCxLQUFLLENBQXNCLElBQUksQ0FBQTtRQUNwRCxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN2QixDQUFDO2FBQU0sQ0FBQztZQUNOLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNkLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxjQUFjLEdBQUcsVUFBQyxLQUErQjtJQUM3QyxJQUFBLEtBQUssR0FBSyxLQUFLLE1BQVYsQ0FBVTtJQUNqQixJQUFBLEtBQUEsT0FBd0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUE1QyxPQUFPLFFBQUEsRUFBRSxVQUFVLFFBQXlCLENBQUE7SUFDbkQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDOUIsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2pCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN0QixDQUFDO2FBQU0sQ0FBQztZQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsQixDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNYLElBQUksT0FBTyxFQUFFLENBQUM7UUFDWixPQUFPLEtBQUMsa0NBQWtDLGVBQUssS0FBSyxFQUFJLENBQUE7SUFDMUQsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sa0NBQWtDLEdBQUcsVUFBQyxFQUl4QjtRQUh6QixLQUFLLFdBQUEsRUFDTCxRQUFRLGNBQUEsRUFDUixLQUFLLFdBQUE7SUFFTCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7SUFDckIsNkVBQTZFO0lBQzdFLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbEMsU0FBUyxHQUFHLENBQUMsS0FBYSxhQUFiLEtBQUssdUJBQUwsS0FBSyxDQUFVLElBQUksS0FBSSxFQUFFLENBQUE7SUFDeEMsQ0FBQztJQUNELGlGQUFpRjtJQUNqRixJQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztRQUNwRCxLQUFLLEVBQUUsU0FBUztRQUNoQixRQUFRLEVBQUUsUUFBUTtLQUNuQixDQUFDLENBQUE7SUFDRixJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDdEIsT0FBTyxpQkFBb0MsQ0FBQTtJQUM3QyxDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sQ0FDTCxLQUFDLFNBQVMsYUFDUixZQUFZLEVBQUUsU0FBUyxFQUN2QixRQUFRLEVBQUUsVUFBQyxDQUFzQztnQkFDL0MsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDMUIsQ0FBQyxJQUNHLG1CQUFtQixFQUNuQixLQUFLLEVBQ1QsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLG9CQUFvQixHQUFHLGNBQWMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgZXh0ZW5zaW9uIGZyb20gJy4uLy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IHsgVGV4dEZpZWxkUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCB7IEVudGVyS2V5U3VibWl0UHJvcHMgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuaW1wb3J0IHsgQm9vbGVhblRleHRUeXBlIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5cbnR5cGUgQ3VzdG9tSW5wdXRPckRlZmF1bHRUeXBlID0ge1xuICB2YWx1ZTogc3RyaW5nXG4gIG9uQ2hhbmdlOiAoZTogc3RyaW5nKSA9PiB2b2lkXG4gIHByb3BzPzogUGFydGlhbDxUZXh0RmllbGRQcm9wcz5cbn1cblxuY29uc3QgdmFsaWRhdGVTaGFwZSA9ICh7IHZhbHVlLCBvbkNoYW5nZSB9OiBDdXN0b21JbnB1dE9yRGVmYXVsdFR5cGUpID0+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBib29sZWFuVGV4dCA9ICh2YWx1ZSBhcyBCb29sZWFuVGV4dFR5cGUpPy50ZXh0XG4gICAgaWYgKGJvb2xlYW5UZXh0KSB7XG4gICAgICBvbkNoYW5nZShib29sZWFuVGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgb25DaGFuZ2UoJycpXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IFNoYXBlVmFsaWRhdG9yID0gKHByb3BzOiBDdXN0b21JbnB1dE9yRGVmYXVsdFR5cGUpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gcHJvcHNcbiAgY29uc3QgW2lzVmFsaWQsIHNldElzVmFsaWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHNldElzVmFsaWQoZmFsc2UpXG4gICAgICB2YWxpZGF0ZVNoYXBlKHByb3BzKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRJc1ZhbGlkKHRydWUpXG4gICAgfVxuICB9LCBbdmFsdWVdKVxuICBpZiAoaXNWYWxpZCkge1xuICAgIHJldHVybiA8Q3VzdG9tSW5wdXRPckRlZmF1bHRQb3N0VmFsaWRhdGlvbiB7Li4ucHJvcHN9IC8+XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGNvbnN0IEN1c3RvbUlucHV0T3JEZWZhdWx0UG9zdFZhbGlkYXRpb24gPSAoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIHByb3BzLFxufTogQ3VzdG9tSW5wdXRPckRlZmF1bHRUeXBlKSA9PiB7XG4gIGxldCB0ZXh0VmFsdWUgPSB2YWx1ZVxuICAvL0NsZWFyIG91dCB2YWx1ZSB3aGVuIHN3aXRjaGluZyBiZXR3ZWVuIHN0cnVjdHVyZWQgc3RyaW5nIGlucHV0cyAoZS5nLiBORUFSKVxuICBpZiAodHlwZW9mIHRleHRWYWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0ZXh0VmFsdWUgPSAodmFsdWUgYXMgYW55KT8udGV4dCB8fCAnJ1xuICB9XG4gIC8vIGNhbGwgb3V0IHRvIGV4dGVuc2lvbiwgaWYgZXh0ZW5zaW9uIGhhbmRsZXMgaXQsIGdyZWF0LCBpZiBub3QgZmFsbGJhY2sgdG8gdGhpc1xuICBjb25zdCBjb21wb25lbnRUb1JldHVybiA9IGV4dGVuc2lvbi5jdXN0b21GaWx0ZXJJbnB1dCh7XG4gICAgdmFsdWU6IHRleHRWYWx1ZSxcbiAgICBvbkNoYW5nZTogb25DaGFuZ2UsXG4gIH0pXG4gIGlmIChjb21wb25lbnRUb1JldHVybikge1xuICAgIHJldHVybiBjb21wb25lbnRUb1JldHVybiBhcyBSZWFjdC5SZWFjdE5vZGVcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFRleHRGaWVsZFxuICAgICAgICBkZWZhdWx0VmFsdWU9e3RleHRWYWx1ZX1cbiAgICAgICAgb25DaGFuZ2U9eyhlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LnZhbHVlKVxuICAgICAgICB9fVxuICAgICAgICB7Li4uRW50ZXJLZXlTdWJtaXRQcm9wc31cbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgLz5cbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEN1c3RvbUlucHV0T3JEZWZhdWx0ID0gU2hhcGVWYWxpZGF0b3JcbiJdfQ==