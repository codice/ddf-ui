import { FilterBuilderClass } from './filter.structure';
type Props = {
    filter: FilterBuilderClass;
    setFilter: (filter: FilterBuilderClass) => void;
    root?: boolean;
};
declare const _default: ({ filter, setFilter, root }: Props) => JSX.Element;
export default _default;
