/// <reference types="react" />
import { TextFieldProps } from '@mui/material/TextField';
import { Suggestion, GeoFeature } from './gazetteer';
type Props = {
    setState: any;
    fetch?: any;
    value?: string;
    onError?: (error: any) => void;
    suggester?: (input: string) => Promise<Suggestion[]>;
    geofeature?: (suggestion: Suggestion) => Promise<GeoFeature>;
    errorMessage?: string;
    polygon?: any[];
    polyType?: string;
    setBufferState?: any;
    polygonBufferWidth?: string;
    polygonBufferUnits?: string;
    loadingMessage?: string;
    minimumInputLength?: number;
    placeholder?: string;
    variant?: TextFieldProps['variant'];
};
declare const Keyword: (props: Props) => JSX.Element;
export default Keyword;
