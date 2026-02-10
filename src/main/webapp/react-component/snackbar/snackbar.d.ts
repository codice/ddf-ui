import * as React from 'react';
import { SnackbarProps } from '@mui/material/Snackbar';
import { SnackbarContentProps } from '@mui/material/SnackbarContent';
type ExtraProps = {
    variant?: 'error' | 'success';
};
export declare const WrappedSnackbar: React.ComponentType<React.PropsWithChildren<SnackbarProps>>;
export declare const WrappedSnackbarContent: React.ComponentType<React.PropsWithChildren<SnackbarContentProps & ExtraProps>>;
export {};
