import { ValueTypes } from '../filter-builder/filter.structure';
type NumberRangeFieldProps = {
    value: Partial<ValueTypes['between']>;
    onChange: (val: ValueTypes['between']) => void;
    type: 'integer' | 'float';
};
export declare const NumberRangeField: ({ value, onChange, type, }: NumberRangeFieldProps) => import("react/jsx-runtime").JSX.Element;
export {};
