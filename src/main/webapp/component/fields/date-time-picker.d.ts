/// <reference types="react" />
import { IDateInputProps } from '@blueprintjs/datetime';
import { TextFieldProps } from '@mui/material/TextField';
type DateFieldProps = {
    value: string | null;
    onChange: (value: string | null) => void;
    isNullable?: boolean;
    TextFieldProps?: Partial<TextFieldProps>;
    /**
     * Override if you absolutely must.
     * Take extra caution when overriding minDate and maxDate.
     * Overriding minDate and maxDate will work as a visual overlay which can only be used
     * to restrict which dates a user can input- but can't be used to give the users a lower/higher
     * min or max. The true min/max is set in dateHelpers. We should probably update this at some
     * point to be passed down by this component.
     */
    BPDateProps?: Partial<IDateInputProps>;
};
declare const _default: ({ value, onChange, isNullable, TextFieldProps, BPDateProps, }: DateFieldProps) => JSX.Element;
export default _default;
