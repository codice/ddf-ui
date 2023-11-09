import { __read } from "tslib";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
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
            handleClose: handleClose,
        },
        MuiButtonComponents: {
            Button: Button,
        },
        MuiDialogComponents: {
            Dialog: Dialog,
            DialogContent: DialogContent,
            DialogTitle: DialogTitle,
            DialogActions: DialogActions,
            DialogContentText: DialogContentText,
        },
        MuiDialogProps: {
            open: open,
            onClose: handleClose,
        },
        MuiButtonProps: {
            onClick: handleClick,
        },
        buttonProps: {
            onClick: handleClick,
        },
    };
}
//# sourceMappingURL=useDialogState.js.map