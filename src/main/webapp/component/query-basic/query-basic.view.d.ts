/// <reference types="react" />
import { FilterBuilderClass } from '../filter-builder/filter.structure';
import { ValidationResult } from '../../react-component/location/validators';
export declare function downgradeFilterTreeToBasic(filter: FilterBuilderClass): FilterBuilderClass;
type QueryBasicProps = {
    model: any;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
};
declare const _default: ({ model, errorListener }: QueryBasicProps) => JSX.Element;
export default _default;
