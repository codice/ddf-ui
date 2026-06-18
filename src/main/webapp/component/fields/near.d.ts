import { ValueTypes } from '../filter-builder/filter.structure';
type NearFieldProps = {
    value: Partial<ValueTypes['proximity']>;
    onChange: (val: ValueTypes['proximity']) => void;
};
export declare const NearField: ({ value, onChange }: NearFieldProps) => import("react/jsx-runtime").JSX.Element;
export {};
