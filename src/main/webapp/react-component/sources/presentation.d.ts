type Source = {
    id: string;
    sourceActions: any[];
    available: boolean;
};
type Props = {
    sources: Source[];
    amountDown: number;
    refreshSources: () => void;
};
declare const _default: ({ sources, amountDown, refreshSources }: Props) => JSX.Element;
export default _default;
