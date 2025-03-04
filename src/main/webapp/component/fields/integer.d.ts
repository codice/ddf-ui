import { ValueTypes } from '../filter-builder/filter.structure';
type IntegerFieldProps = {
    value: ValueTypes['integer'];
    onChange: (val: ValueTypes['integer']) => void;
};
export declare const IntegerField: ({ value, onChange }: IntegerFieldProps) => import("react/jsx-runtime").JSX.Element;
export {};
