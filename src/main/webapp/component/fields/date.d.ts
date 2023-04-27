import { IDateInputProps } from '@blueprintjs/datetime';
type DateFieldProps = {
    value: string;
    onChange: (value: string) => void;
    /**
     * Override if you absolutely must
     */
    BPDateProps?: Partial<IDateInputProps>;
};
export declare const DateField: ({ value, onChange, BPDateProps }: DateFieldProps) => JSX.Element;
export {};
