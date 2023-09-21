/// <reference types="react" />
import { FilterClass } from './filter.structure';
import { ValidationResult } from '../../react-component/location/validators';
type Props = {
    filter: FilterClass;
    setFilter: (filter: FilterClass) => void;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
declare const _default: ({ filter, setFilter, errorListener }: Props) => JSX.Element;
export default _default;
