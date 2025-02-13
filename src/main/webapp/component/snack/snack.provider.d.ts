import React from 'react';
import { SnackbarProps } from '@mui/material/Snackbar';
import { AlertProps } from '@mui/material/Alert';
export type AddSnack = (message: string, props?: SnackProps) => () => void;
export type SnackProps = {
    id?: string;
    status?: AlertProps['severity'];
    closeable?: boolean;
    clickawayCloseable?: boolean;
    timeout?: number;
    undo?: () => void;
    snackBarProps?: SnackbarProps;
    alertProps?: AlertProps;
};
export declare const SnackBarContext: React.Context<AddSnack>;
export declare function SnackProvider({ children }: any): JSX.Element;
