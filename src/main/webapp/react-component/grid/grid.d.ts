import * as React from 'react';
import { GridProps } from '@mui/material/Grid';
export declare const WrappedGrid: React.ComponentType<React.PropsWithChildren<GridProps>>;
type CardGridProps = {
    gridProps?: GridProps;
    gridItemProps?: GridProps;
    children?: React.ReactNode;
};
export declare const WrappedCardGridItem: ({ children, gridItemProps, }: CardGridProps) => JSX.Element;
export declare const WrappedCardGrid: React.ComponentType<React.PropsWithChildren<CardGridProps>>;
export {};
