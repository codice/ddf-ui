/// <reference types="react" />
import { IDateInputProps } from '@blueprintjs/datetime';
type DateFieldProps = {
    value: string;
    onChange: (value: string) => void;
    /**
     * Override if you absolutely must
     */
    BPDateProps?: Partial<IDateInputProps>;
    isNullable?: boolean;
};
export declare const DateField: ({ value, onChange, BPDateProps, isNullable, }: DateFieldProps) => JSX.Element;
export {};
