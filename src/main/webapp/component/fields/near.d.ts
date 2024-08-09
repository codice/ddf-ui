/// <reference types="react" />
import { ValueTypes } from '../filter-builder/filter.structure';
type NearFieldProps = {
    value: ValueTypes['proximity'];
    onChange: (val: ValueTypes['proximity']) => void;
};
export declare const NearField: ({ value, onChange }: NearFieldProps) => JSX.Element;
export {};
