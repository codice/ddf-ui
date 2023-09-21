/// <reference types="react" />
import { ButtonProps } from '@mui/material/Button';
/**
 * Allows a button that displays different components when hovering.
 * Otherwise everything else is the same.
 */
export declare const HoverButton: (props: Omit<ButtonProps, "children"> & {
    children: ({ hover }: {
        hover: boolean;
    }) => JSX.Element;
}) => JSX.Element;
