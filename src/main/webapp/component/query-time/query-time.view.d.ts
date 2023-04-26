import { FilterClass } from '../filter-builder/filter.structure';
import { Omit } from '../../typescript';
export interface BasicFilterClass extends Omit<FilterClass, 'property'> {
    property: string[];
}
type QueryTimeProps = {
    value: undefined | BasicFilterClass;
    onChange: (e: any) => void;
};
declare const _default: ({ value, onChange }: QueryTimeProps) => JSX.Element | null;
export default _default;
