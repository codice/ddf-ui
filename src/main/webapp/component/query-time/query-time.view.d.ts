/// <reference types="react" />
import { BasicFilterClass } from '../filter-builder/filter.structure';
type QueryTimeProps = {
    value: undefined | BasicFilterClass;
    onChange: (e: any) => void;
};
declare const _default: ({ value, onChange }: QueryTimeProps) => JSX.Element | null;
export default _default;
