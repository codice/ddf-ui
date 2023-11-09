/// <reference types="react" />
import { FilterClass } from '../../../component/filter-builder/filter.structure';
import { ValidationResult } from '../../location/validators';
export type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
declare const FilterInput: ({ filter, setFilter, errorListener }: Props) => JSX.Element | null;
export default FilterInput;
