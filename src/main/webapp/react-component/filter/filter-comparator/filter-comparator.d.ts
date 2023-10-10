/// <reference types="react" />
import { FilterClass } from '../../../component/filter-builder/filter.structure';
type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
};
declare const FilterComparator: ({ filter, setFilter }: Props) => JSX.Element;
export default FilterComparator;
