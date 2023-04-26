import * as React from 'react';
import { ResizableProps } from 're-resizable';
export declare const DEFAULT_AUTO_COLLAPSE_LENGTH = 300;
export declare const DEFAULT_STARTING_LENGTH = 550;
export declare const DEFAULT_COLLAPSED_LENGTH = 75;
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
export declare const CustomResizableGrid: import("styled-components").StyledComponentClass<ResizableProps & {
    component: any;
    item: any;
}, import("styled-components").DefaultTheme, {
    component: any;
    children?: React.ReactNode;
    style?: React.CSSProperties | undefined;
    minWidth?: string | number | undefined;
    className?: string | undefined;
    size?: import("re-resizable").Size | undefined;
    grid?: [number, number] | undefined;
    item: any;
    scale?: number | undefined;
    maxHeight?: string | number | undefined;
    maxWidth?: string | number | undefined;
    minHeight?: string | number | undefined;
    snap?: {
        x?: number[] | undefined;
        y?: number[] | undefined;
    } | undefined;
    snapGap?: number | undefined;
    bounds?: HTMLElement | "parent" | "window" | undefined;
    lockAspectRatio?: number | boolean | undefined;
    lockAspectRatioExtraWidth?: number | undefined;
    lockAspectRatioExtraHeight?: number | undefined;
    enable?: import("re-resizable").Enable | undefined;
    handleStyles?: import("re-resizable").HandleStyles | undefined;
    handleClasses?: import("re-resizable").HandleClassName | undefined;
    handleWrapperStyle?: React.CSSProperties | undefined;
    handleWrapperClass?: string | undefined;
    handleComponent?: import("re-resizable").HandleComponent | undefined;
    onResizeStart?: import("re-resizable").ResizeStartCallback | undefined;
    onResize?: import("re-resizable").ResizeCallback | undefined;
    onResizeStop?: import("re-resizable").ResizeCallback | undefined;
    defaultSize?: import("re-resizable").Size | undefined;
    resizeRatio?: number | undefined;
} & {
    theme?: import("styled-components").DefaultTheme | undefined;
}>;
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
