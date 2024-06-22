/// <reference types="react" />
import { ValueTypes } from '../filter-builder/filter.structure';
type Props = {
    value: ValueTypes['relative'];
    onChange: (val: ValueTypes['relative']) => void;
};
export declare const DateRelativeField: ({ value, onChange }: Props) => JSX.Element | null;
export {};
