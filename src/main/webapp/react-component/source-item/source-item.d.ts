/// <reference types="react" />
type RootProps = {
    available: boolean;
};
type SourceAction = {
    title: string;
    description: string;
    url: string;
    id: string;
};
type Props = {
    sourceActions?: SourceAction[];
    id: string;
} & RootProps;
declare const _default: ({ id, available }: Props) => JSX.Element;
export default _default;
