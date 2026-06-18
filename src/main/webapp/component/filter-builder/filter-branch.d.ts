import { FilterBuilderClass } from './filter.structure';
import { ValidationResult } from '../../react-component/location/validators';
type Props = {
    filter: FilterBuilderClass;
    setFilter: (filter: FilterBuilderClass) => void;
    root?: boolean;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
declare const FilterBranch: ({ filter, setFilter, root, errorListener, }: Props) => import("react/jsx-runtime").JSX.Element;
export default FilterBranch;
