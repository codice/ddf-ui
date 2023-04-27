import * as React from 'react';
import { SnackbarProps } from '@material-ui/core/Snackbar';
import { SnackbarContentProps } from '@material-ui/core/SnackbarContent';
type ExtraProps = {
    variant?: 'error' | 'success';
};
export declare const WrappedSnackbar: React.ComponentType<SnackbarProps>;
export declare const WrappedSnackbarContent: React.ComponentType<SnackbarContentProps & ExtraProps>;
export {};
