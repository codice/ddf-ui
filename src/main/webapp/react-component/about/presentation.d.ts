/// <reference types="react" />
interface Props {
    branding: string;
    product: string;
    version: string;
    commitHash: string;
    commitDate: string;
    isDirty: boolean;
    date: string;
}
declare const _default: (props: Props) => JSX.Element;
export default _default;
