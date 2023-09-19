/// <reference types="react" />
import { TextFieldProps } from '@mui/material/TextField';
type Props = {
    value?: string;
    onChange?: (val: string) => void;
    type: 'integer' | 'float';
    TextFieldProps?: TextFieldProps;
};
export declare const NumberField: ({ value, onChange, type, TextFieldProps, }: Props) => JSX.Element;
export {};
