import * as React from 'react';
import { ClickAwayListenerProps } from '@mui/material/ClickAwayListener';
type BetterClickAwayListenerProps = ClickAwayListenerProps & {
    onClickAway: (event: React.MouseEvent<Document> | KeyboardEvent) => void;
};
/**
 * Same as ClickAwayListener, but doesn't trigger onClickAway if the click was in a menu.  Also adds using escape to escape.
 * @param props
 */
export declare const BetterClickAwayListener: (props: BetterClickAwayListenerProps) => JSX.Element;
export {};
