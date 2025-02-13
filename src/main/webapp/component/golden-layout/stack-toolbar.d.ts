/// <reference types="react" />
import GoldenLayout from 'golden-layout';
import { TooltipProps } from '@mui/material/Tooltip';
export declare const HeaderHeight = 32;
export declare const MinimizedHeight: number;
/**
 *  There's a bit of funkiness with normal tooltip behavior when we click the minimize buttons, as the tooltip sticks behind and flickers.
 *  This ensures that when the user clicks the button, the tooltip will be hidden.
 */
export declare function CloseOnClickTooltip(props: TooltipProps): JSX.Element;
/**
 *  This can change, so do not store it in a variable, instead keep around the Root from getRoot and refind the base item as necessary.
 * @param stack
 * @returns
 */
export declare function getRootColumnContent(stack: GoldenLayout.ContentItem | GoldenLayout.Tab): GoldenLayout.ContentItem | undefined;
export declare function rootIsNotAColumn(goldenLayoutRoot: GoldenLayout.ContentItem): boolean | undefined;
export declare function rootIsEmpty(goldenLayoutRoot: GoldenLayout.ContentItem): boolean;
export declare function getBottomItem(stack: GoldenLayout.Tab & GoldenLayout.ContentItem): GoldenLayout.ContentItem | undefined;
export declare function useStackSize(stack: GoldenLayout.Tab & GoldenLayout.ContentItem): {
    height: number | undefined;
    width: number | undefined;
};
export declare function useIsMaximized({ stack, }: {
    stack: GoldenLayout.Tab & GoldenLayout.ContentItem;
}): boolean;
export declare function useRoot(stack: GoldenLayout.Tab & GoldenLayout.ContentItem): GoldenLayout.ContentItem | undefined;
export declare function layoutAlreadyHasMinimizedStack({ stack, }: {
    stack: GoldenLayout.Tab & GoldenLayout.ContentItem;
}): boolean | undefined;
export declare function adjustStackInMinimizedPlaceIfNecessary({ goldenLayoutRoot, }: {
    goldenLayoutRoot: GoldenLayout.ContentItem;
}): void;
export declare const StackToolbar: ({ stack, }: {
    stack: GoldenLayout.Tab & GoldenLayout.ContentItem;
}) => JSX.Element;
