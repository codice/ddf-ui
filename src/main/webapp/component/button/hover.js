import { __assign, __read, __rest } from "tslib";
import * as React from 'react';
import Button from '@mui/material/Button';
/**
 * Allows a button that displays different components when hovering.
 * Otherwise everything else is the same.
 */
export var HoverButton = function (props) {
    var _a = __read(React.useState(false), 2), hover = _a[0], setHover = _a[1];
    var Children = props.children, buttonProps = __rest(props, ["children"]);
    return (React.createElement(Button, __assign({ "data-id": "hover-button", onMouseEnter: function () {
            setHover(true);
        }, onMouseOver: function () {
            setHover(true);
        }, onMouseOut: function () {
            setHover(false);
        }, onMouseLeave: function () {
            setHover(false);
        } }, buttonProps),
        React.createElement(Children, { hover: hover })));
};
//# sourceMappingURL=hover.js.map