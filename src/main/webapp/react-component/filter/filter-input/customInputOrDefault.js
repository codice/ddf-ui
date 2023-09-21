import { __assign, __read } from "tslib";
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
        return React.createElement(CustomInputOrDefaultPostValidation, __assign({}, props));
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
        return (React.createElement(TextField, __assign({ value: textValue, onChange: function (e) {
                onChange(e.target.value);
            } }, EnterKeySubmitProps, props)));
    }
};
export var CustomInputOrDefault = ShapeValidator;
//# sourceMappingURL=customInputOrDefault.js.map