import * as React from 'react';
import { GridProps } from '@material-ui/core/Grid';
export declare const WrappedGrid: React.ComponentType<GridProps<"div", {}>>;
type CardGridProps = {
    gridProps?: GridProps;
    gridItemProps?: GridProps;
    children?: React.ReactNode;
};
export declare const WrappedCardGridItem: ({ children, gridItemProps, }: CardGridProps) => JSX.Element;
export declare const WrappedCardGrid: React.ComponentType<CardGridProps>;
export {};
