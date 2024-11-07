/// <reference types="react" />
import { TextFieldProps } from '@mui/material/TextField';
type Props = {
    value?: string;
    onChange?: (val: number) => void;
    type: 'integer' | 'float';
    TextFieldProps?: TextFieldProps;
    validation?: (val: number) => boolean;
    validationText?: string;
};
export declare const NumberField: ({ value, onChange, type, validation, validationText, TextFieldProps, }: Props) => JSX.Element;
export {};
