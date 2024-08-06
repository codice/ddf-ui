/// <reference types="react" />
import { ValueTypes } from '../filter-builder/filter.structure';
type NumberRangeFieldProps = {
    value: ValueTypes['between'];
    onChange: (val: ValueTypes['between']) => void;
    type: 'integer' | 'float';
};
export declare const NumberRangeField: ({ value, onChange, type, }: NumberRangeFieldProps) => JSX.Element;
export {};
