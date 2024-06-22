import { __assign } from "tslib";
import * as React from 'react';
import TextField from '@mui/material/TextField';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
export var NumberField = function (_a) {
    var value = _a.value, onChange = _a.onChange, type = _a.type, TextFieldProps = _a.TextFieldProps;
    return (React.createElement(TextField, __assign({ fullWidth: true, size: "small", variant: "outlined", value: value, type: "number", onChange: function (e) {
            if (onChange) {
                if (type === 'integer') {
                    onChange(parseInt(e.target.value).toString());
                }
                else {
                    onChange(parseFloat(e.target.value).toString());
                }
            }
        } }, TextFieldProps, EnterKeySubmitProps)));
};
//# sourceMappingURL=number.js.map