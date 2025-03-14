import React from 'react';
/**
 * Component that syncs the current React Router context to our shared variables.  While we could alternatively use prop drilling by
 * accessing context and passing it to the new root, this is much simpler.
 *
 * This should be rendered within the Router component of the primary React root
 */
export declare const SyncReactRouterContextToVariables: () => null;
/**
 * Provider component that provides the shared Router context to its children
 * This should be used in secondary React roots to receive the shared context
 */
export declare const PatchReactRouterContext: ({ children, }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
/**
 * Provider component that patches the React Router context for golden layout subwindows (popouts), and also handles normal React roots when applicable.
 */
export declare const PatchReactRouterContextForGoldenLayoutSubwindows: ({ children, goldenLayout, }: {
    children: React.ReactNode;
    goldenLayout: any;
}) => import("react/jsx-runtime").JSX.Element;
