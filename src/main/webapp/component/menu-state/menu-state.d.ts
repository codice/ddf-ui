import { ButtonProps } from '@mui/material/Button';
import { PopoverProps } from '@mui/material/Popover';
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
    MuiPopoverProps: Required<Pick<PopoverProps, "ref" | "transformOrigin" | "onClose" | "open" | "action" | "anchorOrigin" | "TransitionProps" | "anchorEl">>;
    MuiButtonProps: Required<Pick<ButtonProps, "ref" | "onClick">>;
    buttonProps: {
        ref: React.RefObject<HTMLDivElement>;
        onClick: () => void;
    };
};
export declare const POPOVER_DEFAULTS: ({ maxHeight }?: Props) => Required<Pick<PopoverProps, "transformOrigin" | "anchorOrigin" | "TransitionProps">>;
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
    MuiPopoverProps: Required<Pick<PopoverProps, "ref" | "transformOrigin" | "onClose" | "open" | "action" | "anchorOrigin" | "TransitionProps" | "anchorEl">>;
    MuiButtonProps: Required<Pick<ButtonProps, "ref" | "onClick">>;
    buttonProps: {
        ref: React.RefObject<HTMLDivElement>;
        onClick: () => void;
    };
};
export default _default;
