/// <reference types="react" />
type Props = {
    selected: string;
    examples?: {
        [index: string]: string;
    };
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
export declare const testComponent: (props: Props) => JSX.Element;
