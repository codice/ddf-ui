/// <reference types="react" />
type MemoProps = {
    children: JSX.Element | JSX.Element[];
    dependencies?: any[];
};
export declare const Memo: ({ dependencies, children }: MemoProps) => JSX.Element;
export {};
