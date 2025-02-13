import React from 'react';
import { TooltipProps } from '@mui/material/Tooltip';
type OverflowTipType = {
    children: React.ReactNode;
    tooltipProps?: Partial<TooltipProps>;
    refOfThingToMeasure?: HTMLDivElement | null;
    className?: string;
};
export type OverflowTooltipHTMLElement = HTMLDivElement & {
    overflowTooltip: {
        setOpen: (open: boolean) => void;
    };
};
export declare function useIsTruncated<T extends HTMLElement>(passedInRef?: T | null): {
    isTruncated: boolean;
    ref: React.MutableRefObject<T | null>;
    compareSize: React.MutableRefObject<() => void>;
};
declare const _default: ({ children, tooltipProps, refOfThingToMeasure: refOfThingToMeasurePassedIn, className, }: OverflowTipType) => JSX.Element;
export default _default;
