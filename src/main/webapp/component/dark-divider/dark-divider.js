import { __assign, __rest } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { dark, light } from '../theme/theme';
export var DarkDivider = function (props) {
    var theme = useTheme();
    var style = props.style, otherProps = __rest(props, ["style"]);
    return (React.createElement(Divider, __assign({}, otherProps, { style: __assign({ borderColor: theme.palette.mode === 'dark' ? dark.background : light.background }, style) })));
};
export default hot(module)(DarkDivider);
//# sourceMappingURL=dark-divider.js.map