/// <reference types="react" />
import { ValidationResult } from '../../react-component/location/validators';
type Props = {
    model: any;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
/**
 * We use the filterTree of the model as the single source of truth, so it's always up to date.
 * As a result, we have to listen to updates to it.
 */
export declare const FilterBuilderRoot: ({ model, errorListener }: Props) => JSX.Element;
export {};
