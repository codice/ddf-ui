import { FormControlProps } from '@material-ui/core/FormControl';
import { TextFieldProps } from '@material-ui/core/TextField';
import { AutocompleteProps } from '@material-ui/lab/Autocomplete';
import { BooleanTextType } from '../filter-builder/filter.structure';
import { Option } from './boolean-search-utils';
import { InputProps } from '@material-ui/core/Input';
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
