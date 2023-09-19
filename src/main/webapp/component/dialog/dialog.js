import { __assign, __read } from "tslib";
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { createCtx } from './../../typescript/context';
var _a = __read(createCtx(), 2), useDialogContext = _a[0], DialogContextProvider = _a[1];
export var useDialog = useDialogContext;
export var DialogProvider = function (props) {
    var _a = __read(React.useState(__assign({ children: React.createElement(React.Fragment, null), open: false, onClose: function () {
            setDialogProps(__assign(__assign({}, dialogProps), { open: false }));
        } }, props.initialDialogProps)), 2), dialogProps = _a[0], setDialogProps = _a[1];
    var setProps = function (newProps) {
        setDialogProps(__assign(__assign({}, dialogProps), newProps));
    };
    return (React.createElement(DialogContextProvider, { value: {
            setProps: setProps,
        } },
        props.children,
        React.createElement(Dialog, __assign({}, dialogProps))));
};
//# sourceMappingURL=dialog.js.map