import { __assign, __read, __values } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import debounce from 'lodash.debounce';
/**
 * Normal refs don't cause a rerender, but often times we want that behavior when grabbing dom nodes and otherwise
 * https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
 */
export function useRerenderingRef() {
    var _a = __read(React.useState(), 2), ref = _a[0], setRef = _a[1];
    var rerenderingRef = React.useCallback(setRef, []);
    return {
        current: ref,
        ref: rerenderingRef,
    };
}
/**
 * Firefox and Chrome differ slightly in implementation.  If only one entry, firefox returns that instead of an array!
 */
var getBorderBoxSizeFromEntry = function (entry) {
    var borderBoxSizeArray = [];
    return borderBoxSizeArray.concat(entry.borderBoxSize);
};
var useListenForChildUpdates = function (_a) {
    var popoverRef = _a.popoverRef, action = _a.action;
    React.useEffect(function () {
        var lastWidth = 0;
        var lastHeight = 0;
        /**
         * Width is less likely to change in popups, so we can react immediately
         */
        var widthCallback = function (entries) {
            var e_1, _a, e_2, _b;
            var _c;
            try {
                for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                    var entry = entries_1_1.value;
                    try {
                        for (var _d = (e_2 = void 0, __values(getBorderBoxSizeFromEntry(entry))), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var subentry = _e.value;
                            if (subentry.inlineSize !== lastWidth) {
                                lastWidth = subentry.inlineSize;
                                (_c = action.current) === null || _c === void 0 ? void 0 : _c.updatePosition();
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Height is very likely to change in popups, so we should react less immediately
         */
        var heightCallback = debounce(function (entries) {
            var e_3, _a, e_4, _b;
            var _c;
            try {
                for (var entries_2 = __values(entries), entries_2_1 = entries_2.next(); !entries_2_1.done; entries_2_1 = entries_2.next()) {
                    var entry = entries_2_1.value;
                    try {
                        for (var _d = (e_4 = void 0, __values(getBorderBoxSizeFromEntry(entry))), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var subentry = _e.value;
                            if (subentry.blockSize !== lastHeight) {
                                lastHeight = subentry.blockSize;
                                (_c = action.current) === null || _c === void 0 ? void 0 : _c.updatePosition();
                            }
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (entries_2_1 && !entries_2_1.done && (_a = entries_2.return)) _a.call(entries_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }, 300);
        var resizeObserver = new ResizeObserver(function (entries) {
            widthCallback(entries);
            heightCallback(entries);
        });
        if (popoverRef) {
            var paperElement = popoverRef.querySelector(':scope > .MuiPaper-root');
            if (paperElement) {
                resizeObserver.observe(paperElement);
            }
        }
        return function () {
            resizeObserver.disconnect();
        };
    }, [action.current, popoverRef]);
};
export var useMenuState = function (_a) {
    var _b = _a === void 0 ? {} : _a, maxHeight = _b.maxHeight;
    var anchorRef = React.useRef(null);
    var popoverRef = useRerenderingRef();
    var action = React.useRef();
    var _c = __read(React.useState(false), 2), open = _c[0], setOpen = _c[1];
    useListenForChildUpdates({ popoverRef: popoverRef.current, action: action });
    var handleClick = function () {
        setOpen(!open);
    };
    var handleClose = function () {
        setOpen(false);
    };
    return {
        anchorRef: anchorRef,
        open: open,
        handleClick: handleClick,
        handleClose: handleClose,
        /**
         * Handy prop bundles for passing to common components
         */
        dropdownProps: {
            open: open,
            handleClose: handleClose,
        },
        MuiPopoverProps: __assign({ open: open, onClose: handleClose, anchorEl: anchorRef.current, action: action, ref: popoverRef.ref }, POPOVER_DEFAULTS({ maxHeight: maxHeight })),
        MuiButtonProps: {
            ref: anchorRef,
            onClick: handleClick,
        },
        buttonProps: {
            ref: anchorRef,
            onClick: handleClick,
        },
    };
};
export var POPOVER_DEFAULTS = function (_a) {
    var _b = _a === void 0 ? {} : _a, maxHeight = _b.maxHeight;
    return {
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        transformOrigin: {
            vertical: 'top',
            horizontal: 'center',
        },
        TransitionProps: {
            onEntered: function (element) {
                element.style.maxHeight =
                    maxHeight || "calc(100% - ".concat(element.style.top, " - 10px)");
            },
        },
    };
};
export default hot(module)(useMenuState);
//# sourceMappingURL=menu-state.js.map