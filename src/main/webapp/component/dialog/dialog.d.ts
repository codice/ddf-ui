import * as React from 'react';
import { DialogProps } from '@mui/material/Dialog';
import { setType } from '../../typescript/hooks';
type DialogProviderProps = {
    children?: React.ReactNode;
    initialDialogProps?: DialogProps;
};
export declare const useDialog: () => {
    setProps: setType<Partial<DialogProps>>;
};
export declare const DialogProvider: (props: DialogProviderProps) => JSX.Element;
export {};
