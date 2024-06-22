import { ButtonProps } from '@mui/material/Button';
import { DialogProps } from '@mui/material/Dialog';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
export declare function useDialogState(): {
    open: boolean;
    handleClick: () => void;
    handleClose: () => void;
    /**
     * Handy prop bundles for passing to common components
     */
    dropdownProps: {
        open: boolean;
        handleClose: () => void;
    };
    MuiButtonComponents: {
        Button: import("@mui/material").ExtendButtonBase<import("@mui/material/Button").ButtonTypeMap<{}, "button">>;
    };
    MuiDialogComponents: {
        Dialog: typeof Dialog;
        DialogContent: typeof DialogContent;
        DialogTitle: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material/DialogTitle").DialogTitleTypeMap<{}, "span">>;
        DialogActions: typeof DialogActions;
        DialogContentText: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material/DialogContentText").DialogContentTextTypeMap<{}, "span">>;
    };
    MuiDialogProps: Required<Pick<DialogProps, "onClose" | "open">>;
    MuiButtonProps: Required<Pick<ButtonProps, "onClick">>;
    buttonProps: {
        onClick: () => void;
    };
};
