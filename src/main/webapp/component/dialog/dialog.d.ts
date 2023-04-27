import * as React from 'react';
import { DialogProps } from '@material-ui/core/Dialog';
import { Omit } from 'utility-types';
import { setType } from '../../typescript/hooks';
type DialogProviderProps = {
    children?: React.ReactNode;
    initialDialogProps?: DialogProps;
};
export declare const useDialog: () => {
    setProps: setType<Partial<DialogProps>>;
};
export declare const DialogProvider: (props: DialogProviderProps) => JSX.Element;
type ControlledDialogProps = {
    children: ({ setProps, props, }: {
        setProps: setType<Partial<DialogProps>>;
        props: DialogProps;
    }) => DialogProps['children'];
    content: ({ setProps, props, }: {
        setProps: setType<Partial<DialogProps>>;
        props: DialogProps;
    }) => DialogProps['children'];
} & Omit<Partial<DialogProps>, 'children'>;
export declare const ControlledDialog: ({ content, children, ...initialDialogProps }: ControlledDialogProps) => JSX.Element;
export {};
