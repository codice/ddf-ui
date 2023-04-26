import { FilterClass } from '../../../component/filter-builder/filter.structure';
export type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
};
declare const FilterInput: ({ filter, setFilter }: Props) => JSX.Element | null;
export default FilterInput;
