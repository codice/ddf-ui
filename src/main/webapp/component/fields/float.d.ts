/// <reference types="react" />
import { ValueTypes } from '../filter-builder/filter.structure';
type FloatFieldProps = {
    value: ValueTypes['float'];
    onChange: (val: ValueTypes['float']) => void;
};
export declare const FloatField: ({ value, onChange }: FloatFieldProps) => JSX.Element;
export {};
