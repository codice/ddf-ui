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
export function useMenuState(_a) {
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
}
export default useMenuState;
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
var MenuStateContext = React.createContext({});
export var MenuStateProvider = MenuStateContext.Provider;
export function useMenuStateContext() {
    return React.useContext(MenuStateContext);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvbWVudS1zdGF0ZS9tZW51LXN0YXRlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUE7QUFTdEM7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQjtJQUN6QixJQUFBLEtBQUEsT0FBZ0IsS0FBSyxDQUFDLFFBQVEsRUFBSyxJQUFBLEVBQWxDLEdBQUcsUUFBQSxFQUFFLE1BQU0sUUFBdUIsQ0FBQTtJQUN6QyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNwRCxPQUFPO1FBQ0wsT0FBTyxFQUFFLEdBQUc7UUFDWixHQUFHLEVBQUUsY0FBYztLQUNwQixDQUFBO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsSUFBTSx5QkFBeUIsR0FBRyxVQUFDLEtBQTBCO0lBQzNELElBQU0sa0JBQWtCLEdBQXlCLEVBQUUsQ0FBQTtJQUNuRCxPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkQsQ0FBQyxDQUFBO0FBRUQsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLEVBTWpDO1FBTEMsVUFBVSxnQkFBQSxFQUNWLE1BQU0sWUFBQTtJQUtOLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFDakIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCOztXQUVHO1FBQ0gsSUFBTSxhQUFhLEdBQUcsVUFBQyxPQUE4Qjs7OztnQkFDbkQsS0FBa0IsSUFBQSxZQUFBLFNBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFLENBQUM7b0JBQXZCLElBQUks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TSxVQUFVLG1CQUFtQjtJQUNqQyxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUMzQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnV0dG9uUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB7IFBvcG92ZXJBY3Rpb25zLCBQb3BvdmVyUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL1BvcG92ZXInXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC5kZWJvdW5jZSdcblxudHlwZSBQcm9wcyA9IHtcbiAgLyoqXG4gICAqIFdoeSBtYXhoZWlnaHQ/ICBXZWxsLCB3ZSBqdXN0IHdhbnQgdG8gYmUgYWJsZSB0byBjb25zdHJhaW4gcG9wb3ZlcnMuICBJdCBhbHNvIGRvZXNuJ3QgcHJlY2x1ZGUgdGhlIGluc2lkZSBjb21wb25lbnRzIGZyb20gaGF2aW5nIGFtIG1pbiBoZWlnaHQgaWYgdGhleSBzbyBkZXNpcmUuXG4gICAqL1xuICBtYXhIZWlnaHQ/OiBDU1NTdHlsZURlY2xhcmF0aW9uWydtYXhIZWlnaHQnXVxufVxuXG4vKipcbiAqIE5vcm1hbCByZWZzIGRvbid0IGNhdXNlIGEgcmVyZW5kZXIsIGJ1dCBvZnRlbiB0aW1lcyB3ZSB3YW50IHRoYXQgYmVoYXZpb3Igd2hlbiBncmFiYmluZyBkb20gbm9kZXMgYW5kIG90aGVyd2lzZVxuICogaHR0cHM6Ly9yZWFjdGpzLm9yZy9kb2NzL2hvb2tzLWZhcS5odG1sI2hvdy1jYW4taS1tZWFzdXJlLWEtZG9tLW5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVJlcmVuZGVyaW5nUmVmPFQ+KCkge1xuICBjb25zdCBbcmVmLCBzZXRSZWZdID0gUmVhY3QudXNlU3RhdGU8VD4oKVxuICBjb25zdCByZXJlbmRlcmluZ1JlZiA9IFJlYWN0LnVzZUNhbGxiYWNrKHNldFJlZiwgW10pXG4gIHJldHVybiB7XG4gICAgY3VycmVudDogcmVmLFxuICAgIHJlZjogcmVyZW5kZXJpbmdSZWYsXG4gIH1cbn1cblxuLyoqXG4gKiBGaXJlZm94IGFuZCBDaHJvbWUgZGlmZmVyIHNsaWdodGx5IGluIGltcGxlbWVudGF0aW9uLiAgSWYgb25seSBvbmUgZW50cnksIGZpcmVmb3ggcmV0dXJucyB0aGF0IGluc3RlYWQgb2YgYW4gYXJyYXkhXG4gKi9cbmNvbnN0IGdldEJvcmRlckJveFNpemVGcm9tRW50cnkgPSAoZW50cnk6IFJlc2l6ZU9ic2VydmVyRW50cnkpID0+IHtcbiAgY29uc3QgYm9yZGVyQm94U2l6ZUFycmF5OiBSZXNpemVPYnNlcnZlclNpemVbXSA9IFtdXG4gIHJldHVybiBib3JkZXJCb3hTaXplQXJyYXkuY29uY2F0KGVudHJ5LmJvcmRlckJveFNpemUpXG59XG5cbmNvbnN0IHVzZUxpc3RlbkZvckNoaWxkVXBkYXRlcyA9ICh7XG4gIHBvcG92ZXJSZWYsXG4gIGFjdGlvbixcbn06IHtcbiAgcG9wb3ZlclJlZjogSFRNTERpdkVsZW1lbnQgfCB1bmRlZmluZWRcbiAgYWN0aW9uOiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PFBvcG92ZXJBY3Rpb25zIHwgbnVsbD5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgbGFzdFdpZHRoID0gMFxuICAgIGxldCBsYXN0SGVpZ2h0ID0gMFxuICAgIC8qKlxuICAgICAqIFdpZHRoIGlzIGxlc3MgbGlrZWx5IHRvIGNoYW5nZSBpbiBwb3B1cHMsIHNvIHdlIGNhbiByZWFjdCBpbW1lZGlhdGVseVxuICAgICAqL1xuICAgIGNvbnN0IHdpZHRoQ2FsbGJhY2sgPSAoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGZvciAobGV0IHN1YmVudHJ5IG9mIGdldEJvcmRlckJveFNpemVGcm9tRW50cnkoZW50cnkpKSB7XG4gICAgICAgICAgaWYgKHN1YmVudHJ5LmlubGluZVNpemUgIT09IGxhc3RXaWR0aCkge1xuICAgICAgICAgICAgbGFzdFdpZHRoID0gc3ViZW50cnkuaW5saW5lU2l6ZVxuICAgICAgICAgICAgYWN0aW9uLmN1cnJlbnQ/LnVwZGF0ZVBvc2l0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGVpZ2h0IGlzIHZlcnkgbGlrZWx5IHRvIGNoYW5nZSBpbiBwb3B1cHMsIHNvIHdlIHNob3VsZCByZWFjdCBsZXNzIGltbWVkaWF0ZWx5XG4gICAgICovXG4gICAgY29uc3QgaGVpZ2h0Q2FsbGJhY2sgPSBkZWJvdW5jZSgoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGZvciAobGV0IHN1YmVudHJ5IG9mIGdldEJvcmRlckJveFNpemVGcm9tRW50cnkoZW50cnkpKSB7XG4gICAgICAgICAgaWYgKHN1YmVudHJ5LmJsb2NrU2l6ZSAhPT0gbGFzdEhlaWdodCkge1xuICAgICAgICAgICAgbGFzdEhlaWdodCA9IHN1YmVudHJ5LmJsb2NrU2l6ZVxuICAgICAgICAgICAgYWN0aW9uLmN1cnJlbnQ/LnVwZGF0ZVBvc2l0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAzMDApXG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICB3aWR0aENhbGxiYWNrKGVudHJpZXMpXG4gICAgICBoZWlnaHRDYWxsYmFjayhlbnRyaWVzKVxuICAgIH0pXG4gICAgaWYgKHBvcG92ZXJSZWYpIHtcbiAgICAgIGNvbnN0IHBhcGVyRWxlbWVudCA9IHBvcG92ZXJSZWYucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLk11aVBhcGVyLXJvb3QnKVxuICAgICAgaWYgKHBhcGVyRWxlbWVudCkge1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHBhcGVyRWxlbWVudClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgIH1cbiAgfSwgW2FjdGlvbi5jdXJyZW50LCBwb3BvdmVyUmVmXSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZU1lbnVTdGF0ZSh7IG1heEhlaWdodCB9OiBQcm9wcyA9IHt9KSB7XG4gIGNvbnN0IGFuY2hvclJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgcG9wb3ZlclJlZiA9IHVzZVJlcmVuZGVyaW5nUmVmPEhUTUxEaXZFbGVtZW50PigpXG4gIGNvbnN0IGFjdGlvbiA9IFJlYWN0LnVzZVJlZjxQb3BvdmVyQWN0aW9ucyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICB1c2VMaXN0ZW5Gb3JDaGlsZFVwZGF0ZXMoeyBwb3BvdmVyUmVmOiBwb3BvdmVyUmVmLmN1cnJlbnQsIGFjdGlvbiB9KVxuICBjb25zdCBoYW5kbGVDbGljayA9ICgpID0+IHtcbiAgICBzZXRPcGVuKCFvcGVuKVxuICB9XG5cbiAgY29uc3QgaGFuZGxlQ2xvc2UgPSAoKSA9PiB7XG4gICAgc2V0T3BlbihmYWxzZSlcbiAgfVxuICByZXR1cm4ge1xuICAgIGFuY2hvclJlZixcbiAgICBvcGVuLFxuICAgIGhhbmRsZUNsaWNrLFxuICAgIGhhbmRsZUNsb3NlLFxuICAgIC8qKlxuICAgICAqIEhhbmR5IHByb3AgYnVuZGxlcyBmb3IgcGFzc2luZyB0byBjb21tb24gY29tcG9uZW50c1xuICAgICAqL1xuICAgIGRyb3Bkb3duUHJvcHM6IHtcbiAgICAgIG9wZW4sXG4gICAgICBoYW5kbGVDbG9zZSxcbiAgICB9LFxuICAgIE11aVBvcG92ZXJQcm9wczoge1xuICAgICAgb3BlbixcbiAgICAgIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLFxuICAgICAgYW5jaG9yRWw6IGFuY2hvclJlZi5jdXJyZW50LFxuICAgICAgYWN0aW9uLFxuICAgICAgcmVmOiBwb3BvdmVyUmVmLnJlZixcbiAgICAgIC4uLlBPUE9WRVJfREVGQVVMVFMoeyBtYXhIZWlnaHQgfSksXG4gICAgfSBhcyBSZXF1aXJlZDxcbiAgICAgIFBpY2s8XG4gICAgICAgIFBvcG92ZXJQcm9wcyxcbiAgICAgICAgfCAnb3BlbidcbiAgICAgICAgfCAnb25DbG9zZSdcbiAgICAgICAgfCAnYW5jaG9yRWwnXG4gICAgICAgIHwgJ1RyYW5zaXRpb25Qcm9wcydcbiAgICAgICAgfCAnYW5jaG9yT3JpZ2luJ1xuICAgICAgICB8ICd0cmFuc2Zvcm1PcmlnaW4nXG4gICAgICAgIHwgJ2FjdGlvbidcbiAgICAgICAgfCAncmVmJ1xuICAgICAgPlxuICAgID4sXG4gICAgTXVpQnV0dG9uUHJvcHM6IHtcbiAgICAgIHJlZjogYW5jaG9yUmVmIGFzIHVua25vd24gYXMgQnV0dG9uUHJvcHNbJ3JlZiddLFxuICAgICAgb25DbGljazogaGFuZGxlQ2xpY2ssXG4gICAgfSBhcyBSZXF1aXJlZDxQaWNrPEJ1dHRvblByb3BzLCAncmVmJyB8ICdvbkNsaWNrJz4+LFxuICAgIGJ1dHRvblByb3BzOiB7XG4gICAgICByZWY6IGFuY2hvclJlZixcbiAgICAgIG9uQ2xpY2s6IGhhbmRsZUNsaWNrLFxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlTWVudVN0YXRlXG5cbmV4cG9ydCBjb25zdCBQT1BPVkVSX0RFRkFVTFRTID0gKHsgbWF4SGVpZ2h0IH06IFByb3BzID0ge30pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBhbmNob3JPcmlnaW46IHtcbiAgICAgIHZlcnRpY2FsOiAnYm90dG9tJyxcbiAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgIH0sXG4gICAgdHJhbnNmb3JtT3JpZ2luOiB7XG4gICAgICB2ZXJ0aWNhbDogJ3RvcCcsXG4gICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICB9LFxuICAgIFRyYW5zaXRpb25Qcm9wczoge1xuICAgICAgb25FbnRlcmVkOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBlbGVtZW50LnN0eWxlLm1heEhlaWdodCA9XG4gICAgICAgICAgbWF4SGVpZ2h0IHx8IGBjYWxjKDEwMCUgLSAke2VsZW1lbnQuc3R5bGUudG9wfSAtIDEwcHgpYFxuICAgICAgfSxcbiAgICB9LFxuICB9IGFzIFJlcXVpcmVkPFxuICAgIFBpY2s8UG9wb3ZlclByb3BzLCAnYW5jaG9yT3JpZ2luJyB8ICd0cmFuc2Zvcm1PcmlnaW4nIHwgJ1RyYW5zaXRpb25Qcm9wcyc+XG4gID5cbn1cblxuY29uc3QgTWVudVN0YXRlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQ8UmV0dXJuVHlwZTx0eXBlb2YgdXNlTWVudVN0YXRlPj4oXG4gIHt9IGFzIFJldHVyblR5cGU8dHlwZW9mIHVzZU1lbnVTdGF0ZT5cbilcblxuZXhwb3J0IGNvbnN0IE1lbnVTdGF0ZVByb3ZpZGVyID0gTWVudVN0YXRlQ29udGV4dC5Qcm92aWRlclxuXG5leHBvcnQgZnVuY3Rpb24gdXNlTWVudVN0YXRlQ29udGV4dCgpIHtcbiAgcmV0dXJuIFJlYWN0LnVzZUNvbnRleHQoTWVudVN0YXRlQ29udGV4dClcbn1cbiJdfQ==