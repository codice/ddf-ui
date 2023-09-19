/// <reference types="react" />
import { ValidationResult } from '../../react-component/location/validators';
type Props = {
    model: any;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
export declare const QueryAdvanced: ({ model, errorListener }: Props) => JSX.Element;
declare const _default: ({ model, errorListener }: Props) => JSX.Element;
export default _default;
