import { __assign, __makeTemplateObject, __rest } from "tslib";
import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import styled from 'styled-components';
import { useTheme } from '@mui/material/styles';
export var WrappedSnackbar = styled(React.forwardRef(function (props, ref) {
    return React.createElement(Snackbar, __assign({}, props, { ref: ref }));
}))(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])));
export var WrappedSnackbarContent = styled(React.forwardRef(function (props, ref) {
    var theme = useTheme();
    var _a = props.variant, variant = _a === void 0 ? 'error' : _a, baseProps = __rest(props, ["variant"]);
    var style = {};
    if (variant === 'error') {
        style = {
            background: theme.palette.error.dark,
            color: theme.palette.error.contrastText,
        };
    }
    else if (variant === 'success') {
        style = {
            background: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
        };
    }
    return React.createElement(SnackbarContent, __assign({}, baseProps, { ref: ref, style: style }));
}))(templateObject_2 || (templateObject_2 = __makeTemplateObject([""], [""])));
var templateObject_1, templateObject_2;
//# sourceMappingURL=snackbar.js.map