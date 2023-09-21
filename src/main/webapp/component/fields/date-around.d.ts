/// <reference types="react" />
import { ValueTypes } from '../filter-builder/filter.structure';
type DateAroundProps = {
    value: ValueTypes['around'];
    onChange: (val: ValueTypes['around']) => void;
};
export declare const DateAroundField: ({ value, onChange }: DateAroundProps) => JSX.Element;
export {};
