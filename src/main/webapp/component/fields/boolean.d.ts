/// <reference types="react" />
import { ValueTypes } from '../filter-builder/filter.structure';
type Props = {
    value: ValueTypes['boolean'];
    onChange: (val: ValueTypes['boolean']) => void;
};
export declare const BooleanField: ({ value, onChange }: Props) => JSX.Element;
export {};
