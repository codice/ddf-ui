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
export declare function defaultValue(): {
    start: string;
    end: string;
};
/**
 *  By updating invalid starting values before we go into the above component, we can make sure we always have a valid value to fall back to.
 */
export declare const DateRangeField: ({ value, onChange, BPDateRangeProps, }: Props) => JSX.Element;
export {};
