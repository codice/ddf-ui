import { __assign } from "tslib";
import * as React from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Drawing } from '../singletons/drawing';
/**
 * Same as ClickAwayListener, but doesn't trigger onClickAway if the click was in a menu.  Also adds using escape to escape.
 * @param props
 */
export var BetterClickAwayListener = function (props) {
    React.useEffect(function () {
        var callback = function (e) {
            if (e.keyCode === 27) {
                props.onClickAway(e);
            }
        };
        document.addEventListener('keyup', callback);
        return function () {
            document.removeEventListener('keyup', callback);
        };
    }, []);
    return (React.createElement(ClickAwayListener, __assign({}, props, { onClickAway: function (e) {
            /**
             * Should we be doing a querySelectorAll and seeing if anything on the page contains the element?  I feel like this could fail in certain instances.
             */
            if (Drawing.isFuzzyDrawing()) {
                return;
            }
            var dialog = document.querySelector('.MuiDialog-root');
            var menu = document.querySelector('#menu-');
            var probablyDropdown = document.querySelector('div[style*="transform: translateX(calc((-50%"]') ||
                document.querySelector('div[style*="transform: translateX(calc(-50%"]');
            // needed for regular old selects
            if (document.activeElement &&
                document.activeElement.classList.contains('MuiListItem-root')) {
                return;
            }
            if (dialog && dialog.contains(e.target)) {
                return;
            }
            if (menu && menu.contains(e.target)) {
                return;
            }
            if (probablyDropdown &&
                probablyDropdown.contains(e.target)) {
                return;
            }
            if (props.onClickAway)
                props.onClickAway(e);
        } })));
};
//# sourceMappingURL=better-click-away-listener.js.map