import { ButtonProps } from '@material-ui/core/Button';
import { DialogProps } from '@material-ui/core/Dialog';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
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
        Button: import("@material-ui/core").ExtendButtonBase<import("@material-ui/core/Button").ButtonTypeMap<{}, "button">>;
    };
    MuiDialogComponents: {
        Dialog: typeof Dialog;
        DialogContent: typeof DialogContent;
        DialogTitle: typeof DialogTitle;
        DialogActions: typeof DialogActions;
        DialogContentText: import("@material-ui/core/OverridableComponent").OverridableComponent<import("@material-ui/core/DialogContentText").DialogContentTextTypeMap<{}, "span">>;
    };
    MuiDialogProps: Required<Pick<DialogProps, "open" | "onClose">>;
    MuiButtonProps: Required<Pick<ButtonProps<"button", {}>, "onClick">>;
    buttonProps: {
        onClick: () => void;
    };
};
