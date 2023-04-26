import { __assign, __read, __rest } from "tslib";
import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
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
            setProps: setProps
        } },
        props.children,
        React.createElement(Dialog, __assign({}, dialogProps))));
};
var _b = __read(createCtx(), 2), ControlledDialogContextProvider = _b[1];
export var ControlledDialog = function (_a) {
    var content = _a.content, children = _a.children, initialDialogProps = __rest(_a, ["content", "children"]);
    var _b = __read(React.useState(__assign({ open: false, onClose: function () {
            setDialogProps(__assign(__assign({}, dialogProps), { open: false }));
        } }, initialDialogProps)), 2), dialogProps = _b[0], setDialogProps = _b[1];
    var setProps = function (props) {
        setDialogProps(__assign(__assign({}, dialogProps), props));
    };
    return (React.createElement(ControlledDialogContextProvider, { value: {
            setProps: setProps,
            props: dialogProps
        } },
        children({ setProps: setProps, props: dialogProps }),
        React.createElement(Dialog, __assign({}, dialogProps), content({ setProps: setProps, props: dialogProps }))));
};
//# sourceMappingURL=dialog.js.map