/// <reference types="react" />
import { Suggestion } from '../location/gazetteer';
import { TextFieldProps } from '@mui/material/TextField';
type Props = {
    suggester: (input: string) => Promise<Suggestion[]>;
    onChange: (suggestion?: Suggestion) => Promise<void>;
    debounce?: number;
    minimumInputLength?: number;
    onError?: any;
    value: any;
    placeholder?: string;
    variant?: TextFieldProps['variant'];
};
declare const GazetteerAutoComplete: ({ suggester, debounce, minimumInputLength, onError, value, ...props }: Props) => JSX.Element;
export default GazetteerAutoComplete;
