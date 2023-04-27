import { ButtonProps } from '@material-ui/core/Button';
import { PopoverProps } from '@material-ui/core/Popover';
import * as React from 'react';
type Props = {
    /**
     * Why maxheight?  Well, we just want to be able to constrain popovers.  It also doesn't preclude the inside components from having am min height if they so desire.
     */
    maxHeight?: CSSStyleDeclaration['maxHeight'];
};
/**
 * Normal refs don't cause a rerender, but often times we want that behavior when grabbing dom nodes and otherwise
 * https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
 */
export declare function useRerenderingRef<T>(): {
    current: T | undefined;
    ref: React.Dispatch<React.SetStateAction<T | undefined>>;
};
export declare const useMenuState: ({ maxHeight }?: Props) => {
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    handleClick: () => void;
    handleClose: () => void;
    /**
     * Handy prop bundles for passing to common components
     */
    dropdownProps: {
        open: boolean;
        handleClose: () => void;
    };
    MuiPopoverProps: Required<Pick<PopoverProps, "ref" | "action" | "open" | "transformOrigin" | "onClose" | "TransitionProps" | "anchorEl" | "anchorOrigin">>;
    MuiButtonProps: Required<Pick<ButtonProps<"button", {}>, "innerRef" | "onClick">>;
    buttonProps: {
        ref: React.RefObject<HTMLDivElement>;
        onClick: () => void;
    };
};
export declare const POPOVER_DEFAULTS: ({ maxHeight }?: Props) => Required<Pick<PopoverProps, "transformOrigin" | "TransitionProps" | "anchorOrigin">>;
declare const _default: ({ maxHeight }?: Props) => {
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    handleClick: () => void;
    handleClose: () => void;
    /**
     * Handy prop bundles for passing to common components
     */
    dropdownProps: {
        open: boolean;
        handleClose: () => void;
    };
    MuiPopoverProps: Required<Pick<PopoverProps, "ref" | "action" | "open" | "transformOrigin" | "onClose" | "TransitionProps" | "anchorEl" | "anchorOrigin">>;
    MuiButtonProps: Required<Pick<ButtonProps<"button", {}>, "innerRef" | "onClick">>;
    buttonProps: {
        ref: React.RefObject<HTMLDivElement>;
        onClick: () => void;
    };
};
export default _default;
