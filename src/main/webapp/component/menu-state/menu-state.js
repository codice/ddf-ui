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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvbWVudS1zdGF0ZS9tZW51LXN0YXRlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFBO0FBU3RDOzs7R0FHRztBQUNILE1BQU0sVUFBVSxpQkFBaUI7SUFDekIsSUFBQSxLQUFBLE9BQWdCLEtBQUssQ0FBQyxRQUFRLEVBQUssSUFBQSxFQUFsQyxHQUFHLFFBQUEsRUFBRSxNQUFNLFFBQXVCLENBQUE7SUFDekMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDcEQsT0FBTztRQUNMLE9BQU8sRUFBRSxHQUFHO1FBQ1osR0FBRyxFQUFFLGNBQWM7S0FDcEIsQ0FBQTtBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILElBQU0seUJBQXlCLEdBQUcsVUFBQyxLQUEwQjtJQUMzRCxJQUFNLGtCQUFrQixHQUF5QixFQUFFLENBQUE7SUFDbkQsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZELENBQUMsQ0FBQTtBQUVELElBQU0sd0JBQXdCLEdBQUcsVUFBQyxFQU1qQztRQUxDLFVBQVUsZ0JBQUEsRUFDVixNQUFNLFlBQUE7SUFLTixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQTtRQUNsQjs7V0FFRztRQUNILElBQU0sYUFBYSxHQUFHLFVBQUMsT0FBOEI7Ozs7Z0JBQ25ELEtBQWtCLElBQUEsWUFBQSxT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LGFBQUE7U0FDWjtRQUNELGVBQWUsRUFBRSxXQUNmLElBQUksTUFBQSxFQUNKLE9BQU8sRUFBRSxXQUFXLEVBQ3BCLFFBQVEsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUMzQixNQUFNLFFBQUEsRUFDTixHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFDaEIsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDLENBYW5DO1FBQ0QsY0FBYyxFQUFFO1lBQ2QsR0FBRyxFQUFFLFNBQTBDO1lBQy9DLE9BQU8sRUFBRSxXQUFXO1NBQzZCO1FBQ25ELFdBQVcsRUFBRTtZQUNYLEdBQUcsRUFBRSxTQUFTO1lBQ2QsT0FBTyxFQUFFLFdBQVc7U0FDckI7S0FDRixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxFQUF5QjtRQUF6QixxQkFBdUIsRUFBRSxLQUFBLEVBQXZCLFNBQVMsZUFBQTtJQUMxQyxPQUFPO1FBQ0wsWUFBWSxFQUFFO1lBQ1osUUFBUSxFQUFFLFFBQVE7WUFDbEIsVUFBVSxFQUFFLFFBQVE7U0FDckI7UUFDRCxlQUFlLEVBQUU7WUFDZixRQUFRLEVBQUUsS0FBSztZQUNmLFVBQVUsRUFBRSxRQUFRO1NBQ3JCO1FBQ0QsZUFBZSxFQUFFO1lBQ2YsU0FBUyxFQUFFLFVBQUMsT0FBTztnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTO29CQUNyQixTQUFTLElBQUksc0JBQWUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQVUsQ0FBQTtZQUMzRCxDQUFDO1NBQ0Y7S0FHRixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdXR0b25Qcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IHsgUG9wb3ZlckFjdGlvbnMsIFBvcG92ZXJQcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvUG9wb3ZlcidcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIC8qKlxuICAgKiBXaHkgbWF4aGVpZ2h0PyAgV2VsbCwgd2UganVzdCB3YW50IHRvIGJlIGFibGUgdG8gY29uc3RyYWluIHBvcG92ZXJzLiAgSXQgYWxzbyBkb2Vzbid0IHByZWNsdWRlIHRoZSBpbnNpZGUgY29tcG9uZW50cyBmcm9tIGhhdmluZyBhbSBtaW4gaGVpZ2h0IGlmIHRoZXkgc28gZGVzaXJlLlxuICAgKi9cbiAgbWF4SGVpZ2h0PzogQ1NTU3R5bGVEZWNsYXJhdGlvblsnbWF4SGVpZ2h0J11cbn1cblxuLyoqXG4gKiBOb3JtYWwgcmVmcyBkb24ndCBjYXVzZSBhIHJlcmVuZGVyLCBidXQgb2Z0ZW4gdGltZXMgd2Ugd2FudCB0aGF0IGJlaGF2aW9yIHdoZW4gZ3JhYmJpbmcgZG9tIG5vZGVzIGFuZCBvdGhlcndpc2VcbiAqIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9ob29rcy1mYXEuaHRtbCNob3ctY2FuLWktbWVhc3VyZS1hLWRvbS1ub2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VSZXJlbmRlcmluZ1JlZjxUPigpIHtcbiAgY29uc3QgW3JlZiwgc2V0UmVmXSA9IFJlYWN0LnVzZVN0YXRlPFQ+KClcbiAgY29uc3QgcmVyZW5kZXJpbmdSZWYgPSBSZWFjdC51c2VDYWxsYmFjayhzZXRSZWYsIFtdKVxuICByZXR1cm4ge1xuICAgIGN1cnJlbnQ6IHJlZixcbiAgICByZWY6IHJlcmVuZGVyaW5nUmVmLFxuICB9XG59XG5cbi8qKlxuICogRmlyZWZveCBhbmQgQ2hyb21lIGRpZmZlciBzbGlnaHRseSBpbiBpbXBsZW1lbnRhdGlvbi4gIElmIG9ubHkgb25lIGVudHJ5LCBmaXJlZm94IHJldHVybnMgdGhhdCBpbnN0ZWFkIG9mIGFuIGFycmF5IVxuICovXG5jb25zdCBnZXRCb3JkZXJCb3hTaXplRnJvbUVudHJ5ID0gKGVudHJ5OiBSZXNpemVPYnNlcnZlckVudHJ5KSA9PiB7XG4gIGNvbnN0IGJvcmRlckJveFNpemVBcnJheTogUmVzaXplT2JzZXJ2ZXJTaXplW10gPSBbXVxuICByZXR1cm4gYm9yZGVyQm94U2l6ZUFycmF5LmNvbmNhdChlbnRyeS5ib3JkZXJCb3hTaXplKVxufVxuXG5jb25zdCB1c2VMaXN0ZW5Gb3JDaGlsZFVwZGF0ZXMgPSAoe1xuICBwb3BvdmVyUmVmLFxuICBhY3Rpb24sXG59OiB7XG4gIHBvcG92ZXJSZWY6IEhUTUxEaXZFbGVtZW50IHwgdW5kZWZpbmVkXG4gIGFjdGlvbjogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxQb3BvdmVyQWN0aW9ucyB8IHVuZGVmaW5lZD5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgbGFzdFdpZHRoID0gMFxuICAgIGxldCBsYXN0SGVpZ2h0ID0gMFxuICAgIC8qKlxuICAgICAqIFdpZHRoIGlzIGxlc3MgbGlrZWx5IHRvIGNoYW5nZSBpbiBwb3B1cHMsIHNvIHdlIGNhbiByZWFjdCBpbW1lZGlhdGVseVxuICAgICAqL1xuICAgIGNvbnN0IHdpZHRoQ2FsbGJhY2sgPSAoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGZvciAobGV0IHN1YmVudHJ5IG9mIGdldEJvcmRlckJveFNpemVGcm9tRW50cnkoZW50cnkpKSB7XG4gICAgICAgICAgaWYgKHN1YmVudHJ5LmlubGluZVNpemUgIT09IGxhc3RXaWR0aCkge1xuICAgICAgICAgICAgbGFzdFdpZHRoID0gc3ViZW50cnkuaW5saW5lU2l6ZVxuICAgICAgICAgICAgYWN0aW9uLmN1cnJlbnQ/LnVwZGF0ZVBvc2l0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGVpZ2h0IGlzIHZlcnkgbGlrZWx5IHRvIGNoYW5nZSBpbiBwb3B1cHMsIHNvIHdlIHNob3VsZCByZWFjdCBsZXNzIGltbWVkaWF0ZWx5XG4gICAgICovXG4gICAgY29uc3QgaGVpZ2h0Q2FsbGJhY2sgPSBkZWJvdW5jZSgoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGZvciAobGV0IHN1YmVudHJ5IG9mIGdldEJvcmRlckJveFNpemVGcm9tRW50cnkoZW50cnkpKSB7XG4gICAgICAgICAgaWYgKHN1YmVudHJ5LmJsb2NrU2l6ZSAhPT0gbGFzdEhlaWdodCkge1xuICAgICAgICAgICAgbGFzdEhlaWdodCA9IHN1YmVudHJ5LmJsb2NrU2l6ZVxuICAgICAgICAgICAgYWN0aW9uLmN1cnJlbnQ/LnVwZGF0ZVBvc2l0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAzMDApXG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICB3aWR0aENhbGxiYWNrKGVudHJpZXMpXG4gICAgICBoZWlnaHRDYWxsYmFjayhlbnRyaWVzKVxuICAgIH0pXG4gICAgaWYgKHBvcG92ZXJSZWYpIHtcbiAgICAgIGNvbnN0IHBhcGVyRWxlbWVudCA9IHBvcG92ZXJSZWYucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLk11aVBhcGVyLXJvb3QnKVxuICAgICAgaWYgKHBhcGVyRWxlbWVudCkge1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHBhcGVyRWxlbWVudClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgIH1cbiAgfSwgW2FjdGlvbi5jdXJyZW50LCBwb3BvdmVyUmVmXSlcbn1cblxuZXhwb3J0IGNvbnN0IHVzZU1lbnVTdGF0ZSA9ICh7IG1heEhlaWdodCB9OiBQcm9wcyA9IHt9KSA9PiB7XG4gIGNvbnN0IGFuY2hvclJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgcG9wb3ZlclJlZiA9IHVzZVJlcmVuZGVyaW5nUmVmPEhUTUxEaXZFbGVtZW50PigpXG4gIGNvbnN0IGFjdGlvbiA9IFJlYWN0LnVzZVJlZjxQb3BvdmVyQWN0aW9ucz4oKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlTGlzdGVuRm9yQ2hpbGRVcGRhdGVzKHsgcG9wb3ZlclJlZjogcG9wb3ZlclJlZi5jdXJyZW50LCBhY3Rpb24gfSlcbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSAoKSA9PiB7XG4gICAgc2V0T3Blbighb3BlbilcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgIHNldE9wZW4oZmFsc2UpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhbmNob3JSZWYsXG4gICAgb3BlbixcbiAgICBoYW5kbGVDbGljayxcbiAgICBoYW5kbGVDbG9zZSxcbiAgICAvKipcbiAgICAgKiBIYW5keSBwcm9wIGJ1bmRsZXMgZm9yIHBhc3NpbmcgdG8gY29tbW9uIGNvbXBvbmVudHNcbiAgICAgKi9cbiAgICBkcm9wZG93blByb3BzOiB7XG4gICAgICBvcGVuLFxuICAgICAgaGFuZGxlQ2xvc2UsXG4gICAgfSxcbiAgICBNdWlQb3BvdmVyUHJvcHM6IHtcbiAgICAgIG9wZW4sXG4gICAgICBvbkNsb3NlOiBoYW5kbGVDbG9zZSxcbiAgICAgIGFuY2hvckVsOiBhbmNob3JSZWYuY3VycmVudCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlZjogcG9wb3ZlclJlZi5yZWYsXG4gICAgICAuLi5QT1BPVkVSX0RFRkFVTFRTKHsgbWF4SGVpZ2h0IH0pLFxuICAgIH0gYXMgUmVxdWlyZWQ8XG4gICAgICBQaWNrPFxuICAgICAgICBQb3BvdmVyUHJvcHMsXG4gICAgICAgIHwgJ29wZW4nXG4gICAgICAgIHwgJ29uQ2xvc2UnXG4gICAgICAgIHwgJ2FuY2hvckVsJ1xuICAgICAgICB8ICdUcmFuc2l0aW9uUHJvcHMnXG4gICAgICAgIHwgJ2FuY2hvck9yaWdpbidcbiAgICAgICAgfCAndHJhbnNmb3JtT3JpZ2luJ1xuICAgICAgICB8ICdhY3Rpb24nXG4gICAgICAgIHwgJ3JlZidcbiAgICAgID5cbiAgICA+LFxuICAgIE11aUJ1dHRvblByb3BzOiB7XG4gICAgICByZWY6IGFuY2hvclJlZiBhcyB1bmtub3duIGFzIEJ1dHRvblByb3BzWydyZWYnXSxcbiAgICAgIG9uQ2xpY2s6IGhhbmRsZUNsaWNrLFxuICAgIH0gYXMgUmVxdWlyZWQ8UGljazxCdXR0b25Qcm9wcywgJ3JlZicgfCAnb25DbGljayc+PixcbiAgICBidXR0b25Qcm9wczoge1xuICAgICAgcmVmOiBhbmNob3JSZWYsXG4gICAgICBvbkNsaWNrOiBoYW5kbGVDbGljayxcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBQT1BPVkVSX0RFRkFVTFRTID0gKHsgbWF4SGVpZ2h0IH06IFByb3BzID0ge30pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBhbmNob3JPcmlnaW46IHtcbiAgICAgIHZlcnRpY2FsOiAnYm90dG9tJyxcbiAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgIH0sXG4gICAgdHJhbnNmb3JtT3JpZ2luOiB7XG4gICAgICB2ZXJ0aWNhbDogJ3RvcCcsXG4gICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICB9LFxuICAgIFRyYW5zaXRpb25Qcm9wczoge1xuICAgICAgb25FbnRlcmVkOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBlbGVtZW50LnN0eWxlLm1heEhlaWdodCA9XG4gICAgICAgICAgbWF4SGVpZ2h0IHx8IGBjYWxjKDEwMCUgLSAke2VsZW1lbnQuc3R5bGUudG9wfSAtIDEwcHgpYFxuICAgICAgfSxcbiAgICB9LFxuICB9IGFzIFJlcXVpcmVkPFxuICAgIFBpY2s8UG9wb3ZlclByb3BzLCAnYW5jaG9yT3JpZ2luJyB8ICd0cmFuc2Zvcm1PcmlnaW4nIHwgJ1RyYW5zaXRpb25Qcm9wcyc+XG4gID5cbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkodXNlTWVudVN0YXRlKVxuIl19