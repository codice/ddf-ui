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
declare const SortSelections: ({ value, onChange }: Props) => import("react/jsx-runtime").JSX.Element;
export default SortSelections;
