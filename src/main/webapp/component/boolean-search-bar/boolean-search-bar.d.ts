/// <reference types="react" />
import { FormControlProps } from '@mui/material/FormControl';
import { TextFieldProps } from '@mui/material/TextField';
import { AutocompleteProps } from '@mui/material/Autocomplete';
import { BooleanTextType } from '../filter-builder/filter.structure';
import { Option } from './boolean-search-utils';
import { InputProps } from '@mui/material/Input';
type Props = {
    value: BooleanTextType;
    onChange: (value: BooleanTextType) => void;
    property?: string;
    disableClearable?: boolean;
    placeholder?: TextFieldProps['placeholder'];
    FormControlProps?: FormControlProps;
    TextFieldProps?: Partial<TextFieldProps>;
    AutocompleteProps?: AutocompleteProps<Option, false, true, true>;
    InputProps?: InputProps;
};
declare const _default: (props: Props) => JSX.Element | null;
export default _default;
