import { TextFieldProps } from '@mui/material/TextField';
import { FilterClass } from '../../../component/filter-builder/filter.structure';
type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
    textFieldProps?: TextFieldProps;
};
declare const FilterComparator: ({ filter, setFilter, textFieldProps }: Props) => import("react/jsx-runtime").JSX.Element | null;
export default FilterComparator;
