/// <reference types="react" />
export type SortsType = {
    attribute: string;
    direction: string;
}[];
type Props = {
    value: SortsType;
    onChange: (newVal: SortsType) => void;
};
export type Option = {
    label: string;
    value: string;
};
export type SortItemType = {
    attribute: Option;
    direction: string;
};
declare const _default: ({ value, onChange }: Props) => JSX.Element;
export default _default;
