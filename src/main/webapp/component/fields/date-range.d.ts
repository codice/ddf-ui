/// <reference types="react" />
import { IDateRangeInputProps } from '@blueprintjs/datetime';
import { ValueTypes } from '../filter-builder/filter.structure';
type Props = {
    value: ValueTypes['during'];
    onChange: (value: ValueTypes['during']) => void;
    /**
     * Override if you absolutely must
     */
    BPDateRangeProps?: Partial<IDateRangeInputProps>;
};
export declare const DateRangeField: ({ value, onChange, BPDateRangeProps, }: Props) => JSX.Element;
export {};
