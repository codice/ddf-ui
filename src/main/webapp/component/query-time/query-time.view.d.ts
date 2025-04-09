import { BasicFilterClass } from '../filter-builder/filter.structure';
type QueryTimeProps = {
    value: undefined | BasicFilterClass;
    onChange: (e: any) => void;
};
declare const QueryTime: ({ value, onChange }: QueryTimeProps) => import("react/jsx-runtime").JSX.Element | null;
export default QueryTime;
