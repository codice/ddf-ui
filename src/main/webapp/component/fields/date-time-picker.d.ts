import { IDateInputProps } from '@blueprintjs/datetime';
import { TextFieldProps } from '@material-ui/core/TextField';
type DateFieldProps = {
    value: string;
    onChange: (value: string) => void;
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
export declare const MuiInputClasses = "MuiOutlinedInput-root MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline";
export declare const MuiOutlinedInputClasses = "MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline";
declare const _default: ({ value, onChange, TextFieldProps, BPDateProps, }: DateFieldProps) => JSX.Element;
export default _default;
