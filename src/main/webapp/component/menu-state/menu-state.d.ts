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
interface MenuStateContextType {
    handleClose: () => void;
    handleCascadeClose: () => void;
    parentMenuStateContext?: MenuStateContextType | null;
}
export declare function useMenuStateContext(): MenuStateContextType;
export declare function useMenuState({ maxHeight }?: Props): {
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    handleClick: () => void;
    handleClose: () => void;
    /**
     *  For menus that are nested within other menus, this will ripple up the menu tree and close parent menus
     */
    handleCascadeClose: () => void;
    MuiPopoverProps: Required<Pick<PopoverProps, "open" | "onClose" | "anchorEl" | "TransitionProps" | "anchorOrigin" | "transformOrigin" | "action" | "ref" | "slotProps">>;
    MuiButtonProps: Required<Pick<ButtonProps, "ref" | "onClick">>;
    buttonProps: {
        ref: React.RefObject<HTMLDivElement>;
        onClick: () => void;
    };
    MenuStateProviderInstance: ({ children }: {
        children: React.ReactNode;
    }) => import("react/jsx-runtime").JSX.Element;
};
export default useMenuState;
export declare const POPOVER_DEFAULTS: ({ maxHeight }?: Props) => Required<Pick<PopoverProps, "anchorOrigin" | "transformOrigin" | "TransitionProps">>;
