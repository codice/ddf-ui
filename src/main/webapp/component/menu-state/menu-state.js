import { __assign, __read, __values } from "tslib";
import * as React from 'react';
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
    var action = React.useRef(null);
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
export default useMenuState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvbWVudS1zdGF0ZS9tZW51LXN0YXRlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUE7QUFTdEM7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQjtJQUN6QixJQUFBLEtBQUEsT0FBZ0IsS0FBSyxDQUFDLFFBQVEsRUFBSyxJQUFBLEVBQWxDLEdBQUcsUUFBQSxFQUFFLE1BQU0sUUFBdUIsQ0FBQTtJQUN6QyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNwRCxPQUFPO1FBQ0wsT0FBTyxFQUFFLEdBQUc7UUFDWixHQUFHLEVBQUUsY0FBYztLQUNwQixDQUFBO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsSUFBTSx5QkFBeUIsR0FBRyxVQUFDLEtBQTBCO0lBQzNELElBQU0sa0JBQWtCLEdBQXlCLEVBQUUsQ0FBQTtJQUNuRCxPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkQsQ0FBQyxDQUFBO0FBRUQsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBTWpDO1FBTEMsVUFBVSxnQkFBQSxFQUNWLE1BQU0sWUFBQTtJQUtOLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDakIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCOztXQUVHO1FBQ0gsSUFBTSxhQUFhLEdBQUcsVUFBQyxPQUE4Qjs7OztnQkFDbkQsS0FBa0IsSUFBQSxZQUFBLFNBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFLENBQUM7b0JBQXZCLElBQUks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WDs7V0FFRztRQUNILGFBQWEsRUFBRTtZQUNiLElBQUksTUFBQTtZQUNKLFdBQVcsYUFBQTtTQUNaO1FBQ0QsZUFBZSxFQUFFLFdBQ2YsSUFBSSxNQUFBLEVBQ0osT0FBTyxFQUFFLFdBQVcsRUFDcEIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQzNCLE1BQU0sUUFBQSxFQUNOLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUNoQixnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsV0FBQSxFQUFFLENBQUMsQ0FhbkM7UUFDRCxjQUFjLEVBQUU7WUFDZCxHQUFHLEVBQUUsU0FBMEM7WUFDL0MsT0FBTyxFQUFFLFdBQVc7U0FDNkI7UUFDbkQsV0FBVyxFQUFFO1lBQ1gsR0FBRyxFQUFFLFNBQVM7WUFDZCxPQUFPLEVBQUUsV0FBVztTQUNyQjtLQUNGLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLEVBQXlCO1FBQXpCLHFCQUF1QixFQUFFLEtBQUEsRUFBdkIsU0FBUyxlQUFBO0lBQzFDLE9BQU87UUFDTCxZQUFZLEVBQUU7WUFDWixRQUFRLEVBQUUsUUFBUTtZQUNsQixVQUFVLEVBQUUsUUFBUTtTQUNyQjtRQUNELGVBQWUsRUFBRTtZQUNmLFFBQVEsRUFBRSxLQUFLO1lBQ2YsVUFBVSxFQUFFLFFBQVE7U0FDckI7UUFDRCxlQUFlLEVBQUU7WUFDZixTQUFTLEVBQUUsVUFBQyxPQUFPO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVM7b0JBQ3JCLFNBQVMsSUFBSSxzQkFBZSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsYUFBVSxDQUFBO1lBQzNELENBQUM7U0FDRjtLQUdGLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFlBQVksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1dHRvblByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBQb3BvdmVyQWN0aW9ucywgUG9wb3ZlclByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIC8qKlxuICAgKiBXaHkgbWF4aGVpZ2h0PyAgV2VsbCwgd2UganVzdCB3YW50IHRvIGJlIGFibGUgdG8gY29uc3RyYWluIHBvcG92ZXJzLiAgSXQgYWxzbyBkb2Vzbid0IHByZWNsdWRlIHRoZSBpbnNpZGUgY29tcG9uZW50cyBmcm9tIGhhdmluZyBhbSBtaW4gaGVpZ2h0IGlmIHRoZXkgc28gZGVzaXJlLlxuICAgKi9cbiAgbWF4SGVpZ2h0PzogQ1NTU3R5bGVEZWNsYXJhdGlvblsnbWF4SGVpZ2h0J11cbn1cblxuLyoqXG4gKiBOb3JtYWwgcmVmcyBkb24ndCBjYXVzZSBhIHJlcmVuZGVyLCBidXQgb2Z0ZW4gdGltZXMgd2Ugd2FudCB0aGF0IGJlaGF2aW9yIHdoZW4gZ3JhYmJpbmcgZG9tIG5vZGVzIGFuZCBvdGhlcndpc2VcbiAqIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9ob29rcy1mYXEuaHRtbCNob3ctY2FuLWktbWVhc3VyZS1hLWRvbS1ub2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VSZXJlbmRlcmluZ1JlZjxUPigpIHtcbiAgY29uc3QgW3JlZiwgc2V0UmVmXSA9IFJlYWN0LnVzZVN0YXRlPFQ+KClcbiAgY29uc3QgcmVyZW5kZXJpbmdSZWYgPSBSZWFjdC51c2VDYWxsYmFjayhzZXRSZWYsIFtdKVxuICByZXR1cm4ge1xuICAgIGN1cnJlbnQ6IHJlZixcbiAgICByZWY6IHJlcmVuZGVyaW5nUmVmLFxuICB9XG59XG5cbi8qKlxuICogRmlyZWZveCBhbmQgQ2hyb21lIGRpZmZlciBzbGlnaHRseSBpbiBpbXBsZW1lbnRhdGlvbi4gIElmIG9ubHkgb25lIGVudHJ5LCBmaXJlZm94IHJldHVybnMgdGhhdCBpbnN0ZWFkIG9mIGFuIGFycmF5IVxuICovXG5jb25zdCBnZXRCb3JkZXJCb3hTaXplRnJvbUVudHJ5ID0gKGVudHJ5OiBSZXNpemVPYnNlcnZlckVudHJ5KSA9PiB7XG4gIGNvbnN0IGJvcmRlckJveFNpemVBcnJheTogUmVzaXplT2JzZXJ2ZXJTaXplW10gPSBbXVxuICByZXR1cm4gYm9yZGVyQm94U2l6ZUFycmF5LmNvbmNhdChlbnRyeS5ib3JkZXJCb3hTaXplKVxufVxuXG5jb25zdCB1c2VMaXN0ZW5Gb3JDaGlsZFVwZGF0ZXMgPSAoe1xuICBwb3BvdmVyUmVmLFxuICBhY3Rpb24sXG59OiB7XG4gIHBvcG92ZXJSZWY6IEhUTUxEaXZFbGVtZW50IHwgdW5kZWZpbmVkXG4gIGFjdGlvbjogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxQb3BvdmVyQWN0aW9ucyB8IG51bGw+XG59KSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGxhc3RXaWR0aCA9IDBcbiAgICBsZXQgbGFzdEhlaWdodCA9IDBcbiAgICAvKipcbiAgICAgKiBXaWR0aCBpcyBsZXNzIGxpa2VseSB0byBjaGFuZ2UgaW4gcG9wdXBzLCBzbyB3ZSBjYW4gcmVhY3QgaW1tZWRpYXRlbHlcbiAgICAgKi9cbiAgICBjb25zdCB3aWR0aENhbGxiYWNrID0gKGVudHJpZXM6IFJlc2l6ZU9ic2VydmVyRW50cnlbXSkgPT4ge1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBmb3IgKGxldCBzdWJlbnRyeSBvZiBnZXRCb3JkZXJCb3hTaXplRnJvbUVudHJ5KGVudHJ5KSkge1xuICAgICAgICAgIGlmIChzdWJlbnRyeS5pbmxpbmVTaXplICE9PSBsYXN0V2lkdGgpIHtcbiAgICAgICAgICAgIGxhc3RXaWR0aCA9IHN1YmVudHJ5LmlubGluZVNpemVcbiAgICAgICAgICAgIGFjdGlvbi5jdXJyZW50Py51cGRhdGVQb3NpdGlvbigpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhlaWdodCBpcyB2ZXJ5IGxpa2VseSB0byBjaGFuZ2UgaW4gcG9wdXBzLCBzbyB3ZSBzaG91bGQgcmVhY3QgbGVzcyBpbW1lZGlhdGVseVxuICAgICAqL1xuICAgIGNvbnN0IGhlaWdodENhbGxiYWNrID0gZGVib3VuY2UoKGVudHJpZXM6IFJlc2l6ZU9ic2VydmVyRW50cnlbXSkgPT4ge1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBmb3IgKGxldCBzdWJlbnRyeSBvZiBnZXRCb3JkZXJCb3hTaXplRnJvbUVudHJ5KGVudHJ5KSkge1xuICAgICAgICAgIGlmIChzdWJlbnRyeS5ibG9ja1NpemUgIT09IGxhc3RIZWlnaHQpIHtcbiAgICAgICAgICAgIGxhc3RIZWlnaHQgPSBzdWJlbnRyeS5ibG9ja1NpemVcbiAgICAgICAgICAgIGFjdGlvbi5jdXJyZW50Py51cGRhdGVQb3NpdGlvbigpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgMzAwKVxuICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoZW50cmllcykgPT4ge1xuICAgICAgd2lkdGhDYWxsYmFjayhlbnRyaWVzKVxuICAgICAgaGVpZ2h0Q2FsbGJhY2soZW50cmllcylcbiAgICB9KVxuICAgIGlmIChwb3BvdmVyUmVmKSB7XG4gICAgICBjb25zdCBwYXBlckVsZW1lbnQgPSBwb3BvdmVyUmVmLnF1ZXJ5U2VsZWN0b3IoJzpzY29wZSA+IC5NdWlQYXBlci1yb290JylcbiAgICAgIGlmIChwYXBlckVsZW1lbnQpIHtcbiAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShwYXBlckVsZW1lbnQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICB9XG4gIH0sIFthY3Rpb24uY3VycmVudCwgcG9wb3ZlclJlZl0pXG59XG5cbmV4cG9ydCBjb25zdCB1c2VNZW51U3RhdGUgPSAoeyBtYXhIZWlnaHQgfTogUHJvcHMgPSB7fSkgPT4ge1xuICBjb25zdCBhbmNob3JSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IHBvcG92ZXJSZWYgPSB1c2VSZXJlbmRlcmluZ1JlZjxIVE1MRGl2RWxlbWVudD4oKVxuICBjb25zdCBhY3Rpb24gPSBSZWFjdC51c2VSZWY8UG9wb3ZlckFjdGlvbnMgfCBudWxsPihudWxsKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlTGlzdGVuRm9yQ2hpbGRVcGRhdGVzKHsgcG9wb3ZlclJlZjogcG9wb3ZlclJlZi5jdXJyZW50LCBhY3Rpb24gfSlcbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSAoKSA9PiB7XG4gICAgc2V0T3Blbighb3BlbilcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgIHNldE9wZW4oZmFsc2UpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhbmNob3JSZWYsXG4gICAgb3BlbixcbiAgICBoYW5kbGVDbGljayxcbiAgICBoYW5kbGVDbG9zZSxcbiAgICAvKipcbiAgICAgKiBIYW5keSBwcm9wIGJ1bmRsZXMgZm9yIHBhc3NpbmcgdG8gY29tbW9uIGNvbXBvbmVudHNcbiAgICAgKi9cbiAgICBkcm9wZG93blByb3BzOiB7XG4gICAgICBvcGVuLFxuICAgICAgaGFuZGxlQ2xvc2UsXG4gICAgfSxcbiAgICBNdWlQb3BvdmVyUHJvcHM6IHtcbiAgICAgIG9wZW4sXG4gICAgICBvbkNsb3NlOiBoYW5kbGVDbG9zZSxcbiAgICAgIGFuY2hvckVsOiBhbmNob3JSZWYuY3VycmVudCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlZjogcG9wb3ZlclJlZi5yZWYsXG4gICAgICAuLi5QT1BPVkVSX0RFRkFVTFRTKHsgbWF4SGVpZ2h0IH0pLFxuICAgIH0gYXMgUmVxdWlyZWQ8XG4gICAgICBQaWNrPFxuICAgICAgICBQb3BvdmVyUHJvcHMsXG4gICAgICAgIHwgJ29wZW4nXG4gICAgICAgIHwgJ29uQ2xvc2UnXG4gICAgICAgIHwgJ2FuY2hvckVsJ1xuICAgICAgICB8ICdUcmFuc2l0aW9uUHJvcHMnXG4gICAgICAgIHwgJ2FuY2hvck9yaWdpbidcbiAgICAgICAgfCAndHJhbnNmb3JtT3JpZ2luJ1xuICAgICAgICB8ICdhY3Rpb24nXG4gICAgICAgIHwgJ3JlZidcbiAgICAgID5cbiAgICA+LFxuICAgIE11aUJ1dHRvblByb3BzOiB7XG4gICAgICByZWY6IGFuY2hvclJlZiBhcyB1bmtub3duIGFzIEJ1dHRvblByb3BzWydyZWYnXSxcbiAgICAgIG9uQ2xpY2s6IGhhbmRsZUNsaWNrLFxuICAgIH0gYXMgUmVxdWlyZWQ8UGljazxCdXR0b25Qcm9wcywgJ3JlZicgfCAnb25DbGljayc+PixcbiAgICBidXR0b25Qcm9wczoge1xuICAgICAgcmVmOiBhbmNob3JSZWYsXG4gICAgICBvbkNsaWNrOiBoYW5kbGVDbGljayxcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBQT1BPVkVSX0RFRkFVTFRTID0gKHsgbWF4SGVpZ2h0IH06IFByb3BzID0ge30pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBhbmNob3JPcmlnaW46IHtcbiAgICAgIHZlcnRpY2FsOiAnYm90dG9tJyxcbiAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgIH0sXG4gICAgdHJhbnNmb3JtT3JpZ2luOiB7XG4gICAgICB2ZXJ0aWNhbDogJ3RvcCcsXG4gICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICB9LFxuICAgIFRyYW5zaXRpb25Qcm9wczoge1xuICAgICAgb25FbnRlcmVkOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBlbGVtZW50LnN0eWxlLm1heEhlaWdodCA9XG4gICAgICAgICAgbWF4SGVpZ2h0IHx8IGBjYWxjKDEwMCUgLSAke2VsZW1lbnQuc3R5bGUudG9wfSAtIDEwcHgpYFxuICAgICAgfSxcbiAgICB9LFxuICB9IGFzIFJlcXVpcmVkPFxuICAgIFBpY2s8UG9wb3ZlclByb3BzLCAnYW5jaG9yT3JpZ2luJyB8ICd0cmFuc2Zvcm1PcmlnaW4nIHwgJ1RyYW5zaXRpb25Qcm9wcyc+XG4gID5cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlTWVudVN0YXRlXG4iXX0=