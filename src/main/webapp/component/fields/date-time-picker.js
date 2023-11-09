import { __assign } from "tslib";
import * as React from 'react';
import TextField from '@mui/material/TextField';
import { DateField } from './date';
import CalendarIcon from '@mui/icons-material/Event';
import ClearIcon from '@mui/icons-material/Clear';
import { hot } from 'react-hot-loader';
import InputAdornment from '@mui/material/InputAdornment';
/**
 * DateTimePicker that combines Mui TextField with BlueprintJs DatePicker
 *
 * For now it's meant to work with an outlined text field, but we can add support for other styles if we want.
 *
 * By changing the inputComponent, we avoid weird focusing issues, while still allowing use of all the other niceties (helperText) of TextField
 */
var DateTimePicker = function (_a) {
    var value = _a.value, onChange = _a.onChange, isNullable = _a.isNullable, TextFieldProps = _a.TextFieldProps, BPDateProps = _a.BPDateProps;
    var inputRef = React.useRef(null);
    /**
     * We want to avoid causing the TextField below to percieve a change to inputComponent when possible, because that mucks with focus.
     *
     * We stringify the BPDateProps to make life easier for devs, since they will likely pass a plain object.  If they do and their component rerenders,
     * this memo would trigger even though they think they didn't change BPDateProps (the object is different though!).  So we stringify to make sure we
     * only pick up real changes.
     */
    var inputComponent = React.useMemo(function () {
        var classes = 'px-[14px] py-[8.5px]';
        return React.forwardRef(function (props, ref) {
            return (React.createElement(DateField, __assign({}, props, { isNullable: true, BPDateProps: __assign(__assign({}, BPDateProps), { className: classes, inputProps: {
                        inputRef: ref,
                    } }) })));
        });
    }, [JSON.stringify(BPDateProps)]);
    return (React.createElement(TextField, __assign({ fullWidth: true, variant: TextFieldProps === null || TextFieldProps === void 0 ? void 0 : TextFieldProps.variant, label: "Date", InputLabelProps: { shrink: true }, value: value, onChange: onChange, ref: inputRef, InputProps: {
            inputComponent: inputComponent,
            endAdornment: (React.createElement(InputAdornment, { component: "button", type: "button", className: "cursor-pointer", position: "end", onClick: function () {
                    var _a;
                    if (inputRef.current) {
                        (_a = inputRef.current.querySelector('input')) === null || _a === void 0 ? void 0 : _a.focus();
                    }
                } },
                isNullable && (React.createElement(ClearIcon, { className: "".concat(value ? '' : 'hidden'), onClick: function (e) {
                        onChange(null);
                        e.stopPropagation();
                    } })),
                React.createElement(CalendarIcon, null))),
        } }, TextFieldProps)));
};
export default hot(module)(DateTimePicker);
//# sourceMappingURL=date-time-picker.js.map