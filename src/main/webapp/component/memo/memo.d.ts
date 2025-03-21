import * as React from 'react';
type MemoProps = {
    children: React.ReactNode | React.ReactNode[];
    dependencies?: any[];
};
export declare const Memo: ({ dependencies, children }: MemoProps) => import("react/jsx-runtime").JSX.Element;
export {};
