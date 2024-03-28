import * as React from 'react';
import { ResizableProps } from 're-resizable';
export declare const DEFAULT_AUTO_COLLAPSE_LENGTH = 300;
export declare const DEFAULT_STARTING_LENGTH = 550;
export declare const DEFAULT_COLLAPSED_LENGTH = 75;
type ResizableGridType = React.ComponentType<React.PropsWithChildren<ResizableProps & {
    component: any;
    item: any;
}>>;
export declare const useResizableGridContext: () => useResizableGridType, UseResizableGridContextProvider: React.Provider<useResizableGridType | undefined>;
type useResizableGridType = {
    length: number;
    closed: boolean;
    setClosed: React.Dispatch<boolean>;
    setLength: React.Dispatch<React.SetStateAction<number>>;
    lastLength: number;
    setLastLength: React.Dispatch<React.SetStateAction<number>>;
    dragging: boolean;
    setDragging: React.Dispatch<React.SetStateAction<boolean>>;
};
export declare const useResizableGrid: ({ startingLength, collapsedLength, autoCollapseLength, }: {
    startingLength: number;
    collapsedLength: number;
    autoCollapseLength: number;
}) => useResizableGridType;
export declare const CustomResizableGrid: import("styled-components").StyledComponent<ResizableGridType, import("styled-components").DefaultTheme, {}, never>;
type SplitPaneProps = {
    firstStyle?: React.CSSProperties | undefined;
    secondStyle?: React.CSSProperties | undefined;
    variant: 'horizontal' | 'vertical';
    children: [React.ReactNode, React.ReactNode];
    collapsedLength?: number;
    autoCollapseLength?: number;
    startingLength?: number;
};
export declare const SplitPane: ({ secondStyle, variant, children, collapsedLength, autoCollapseLength, startingLength, }: SplitPaneProps) => JSX.Element;
export {};
