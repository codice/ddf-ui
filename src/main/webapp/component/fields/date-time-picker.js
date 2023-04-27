import { __assign } from "tslib";
import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { DateField } from './date';
import CalendarIcon from '@material-ui/icons/Event';
import { hot } from 'react-hot-loader';
import InputAdornment from '@material-ui/core/InputAdornment';
export var MuiInputClasses = 'MuiOutlinedInput-root MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline';
export var MuiOutlinedInputClasses = 'MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline';
/**
 * DateTimePicker that combines Mui TextField with BlueprintJs DatePicker
 *
 * For now it's meant to work with an outlined text field, but we can add support for other styles if we want.
 *
 * By changing the inputComponent, we avoid weird focusing issues, while still allowing use of all the other niceties (helperText) of TextField
 */
var DateTimePicker = function (_a) {
    var value = _a.value, onChange = _a.onChange, TextFieldProps = _a.TextFieldProps, BPDateProps = _a.BPDateProps;
    var inputRef = React.useRef();
    /**
     * We want to avoid causing the TextField below to percieve a change to inputComponent when possible, because that mucks with focus.
     *
     * We stringify the BPDateProps to make life easier for devs, since they will likely pass a plain object.  If they do and their component rerenders,
     * this memo would trigger even though they think they didn't change BPDateProps (the object is different though!).  So we stringify to make sure we
     * only pick up real changes.
     */
    var inputComponent = React.useMemo(function () {
        var classes = MuiInputClasses;
        if ((TextFieldProps === null || TextFieldProps === void 0 ? void 0 : TextFieldProps.variant) === 'outlined') {
            classes = MuiOutlinedInputClasses;
        }
        return function (props) {
            return (React.createElement(DateField, __assign({}, props, { BPDateProps: __assign(__assign({}, BPDateProps), { className: classes, inputProps: {
                        inputRef: props.inputRef
                    } }) })));
        };
    }, [JSON.stringify(BPDateProps)]);
    return (React.createElement(TextField, __assign({ fullWidth: true, variant: TextFieldProps === null || TextFieldProps === void 0 ? void 0 : TextFieldProps.variant, label: "Date", InputLabelProps: { shrink: true }, value: value, onChange: onChange, inputRef: inputRef, InputProps: {
            inputComponent: inputComponent,
            endAdornment: (React.createElement(InputAdornment, { className: "cursor-pointer", position: "end", onClick: function () {
                    if (inputRef.current) {
                        inputRef.current.focus();
                    }
                } },
                React.createElement(CalendarIcon, { className: (TextFieldProps === null || TextFieldProps === void 0 ? void 0 : TextFieldProps.variant) === 'outlined' ? 'mr-1' : 'mr-4' })))
        } }, TextFieldProps)));
};
export default hot(module)(DateTimePicker);
//# sourceMappingURL=date-time-picker.js.map