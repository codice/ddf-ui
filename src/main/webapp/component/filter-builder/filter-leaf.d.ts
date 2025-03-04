import * as React from 'react';
import { FilterClass } from './filter.structure';
import { ValidationResult } from '../../react-component/location/validators';
type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
export declare const FilterNegationControls: ({ filter, setFilter, children, }: Props & {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
declare const FilterLeaf: ({ filter, setFilter, errorListener }: Props) => import("react/jsx-runtime").JSX.Element;
export default FilterLeaf;
