/// <reference types="react" />
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
declare const _default: ({ filter, setFilter, root, errorListener, }: Props) => JSX.Element;
export default _default;
