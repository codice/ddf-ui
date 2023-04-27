import { __read } from "tslib";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import React from 'react';
export function useDialogState() {
    var _a = __read(React.useState(false), 2), open = _a[0], setOpen = _a[1];
    var handleClick = function () {
        setOpen(!open);
    };
    var handleClose = function () {
        setOpen(false);
    };
    return {
        open: open,
        handleClick: handleClick,
        handleClose: handleClose,
        /**
         * Handy prop bundles for passing to common components
         */
        dropdownProps: {
            open: open,
            handleClose: handleClose
        },
        MuiButtonComponents: {
            Button: Button
        },
        MuiDialogComponents: {
            Dialog: Dialog,
            DialogContent: DialogContent,
            DialogTitle: DialogTitle,
            DialogActions: DialogActions,
            DialogContentText: DialogContentText
        },
        MuiDialogProps: {
            open: open,
            onClose: handleClose
        },
        MuiButtonProps: {
            onClick: handleClick
        },
        buttonProps: {
            onClick: handleClick
        }
    };
}
//# sourceMappingURL=useDialogState.js.map