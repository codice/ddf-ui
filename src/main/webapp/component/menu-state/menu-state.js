import { __assign, __read, __values } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import Paper from '@mui/material/Paper';
import * as React from 'react';
import debounce from 'lodash.debounce';
import { Elevations } from '../theme/theme';
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
/**
 *  Notice we do not export this, as we want full control over parentMenuStateContext in order to make the dev experience smooth.
 *  Devs should be using the provider instance that gets returned with useMenuState.
 */
var MenuStateContext = React.createContext({
    handleClose: function () {
        console.warn("No menu state context found, check to make sure you're wrapping the component with the menu state provider.  This handleClose call will be a noop.");
    },
    handleCascadeClose: function () {
        console.warn("No menu state context found, check to make sure you're wrapping the component with the menu state provider.  This handleCascadeClose call will be a noop.");
    },
});
export function useMenuStateContext() {
    var menuState = React.useContext(MenuStateContext);
    return menuState;
}
export function useMenuState(_a) {
    var _b = _a === void 0 ? {} : _a, maxHeight = _b.maxHeight;
    var parentMenuStateContext = useMenuStateContext();
    var anchorRef = React.useRef(null);
    var popoverRef = useRerenderingRef();
    var action = React.useRef(null);
    var _c = __read(React.useState(false), 2), open = _c[0], setOpen = _c[1];
    useListenForChildUpdates({ popoverRef: popoverRef.current, action: action });
    var handleClick = React.useCallback(function () {
        setOpen(function (currentValue) {
            return !currentValue;
        });
    }, []);
    var handleClose = React.useCallback(function () {
        setOpen(false);
    }, []);
    var handleCascadeClose = React.useCallback(function () {
        handleClose();
        if (parentMenuStateContext.parentMenuStateContext) {
            parentMenuStateContext.handleCascadeClose();
        }
    }, []);
    // preconstruct this for convenience
    var MenuStateProviderInstance = React.useMemo(function () {
        return function (_a) {
            var children = _a.children;
            return (_jsx(MenuStateContext.Provider, { value: {
                    handleClose: handleClose,
                    handleCascadeClose: handleCascadeClose,
                    parentMenuStateContext: parentMenuStateContext,
                }, children: children }));
        };
    }, []);
    // if the MuiPopover props get used, then the children will automatically get access to the menustate
    var MuiPopoverMenuStateProviderInstance = React.useMemo(function () {
        return React.forwardRef(function (props, ref) {
            return (_jsx(MenuStateProviderInstance, { children: _jsx(Paper, __assign({}, props, { ref: ref, elevation: Elevations.overlays })) }));
        });
    }, []);
    var menuState = {
        anchorRef: anchorRef,
        open: open,
        handleClick: handleClick,
        handleClose: handleClose,
        /**
         *  For menus that are nested within other menus, this will ripple up the menu tree and close parent menus
         */
        handleCascadeClose: handleCascadeClose,
        // these can also be used directly with the MuiPopper if desired
        MuiPopoverProps: __assign(__assign({ open: open, onClose: handleClose, anchorEl: anchorRef.current, action: action, ref: popoverRef.ref }, POPOVER_DEFAULTS({ maxHeight: maxHeight })), { slotProps: {
                paper: {
                    component: MuiPopoverMenuStateProviderInstance,
                },
            } }),
        MuiButtonProps: {
            ref: anchorRef,
            onClick: handleClick,
        },
        buttonProps: {
            ref: anchorRef,
            onClick: handleClick,
        },
        MenuStateProviderInstance: MenuStateProviderInstance,
    };
    return menuState;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvbWVudS1zdGF0ZS9tZW51LXN0YXRlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQVMzQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCO0lBQ3pCLElBQUEsS0FBQSxPQUFnQixLQUFLLENBQUMsUUFBUSxFQUFLLElBQUEsRUFBbEMsR0FBRyxRQUFBLEVBQUUsTUFBTSxRQUF1QixDQUFBO0lBQ3pDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3BELE9BQU87UUFDTCxPQUFPLEVBQUUsR0FBRztRQUNaLEdBQUcsRUFBRSxjQUFjO0tBQ3BCLENBQUE7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxJQUFNLHlCQUF5QixHQUFHLFVBQUMsS0FBMEI7SUFDM0QsSUFBTSxrQkFBa0IsR0FBeUIsRUFBRSxDQUFBO0lBQ25ELE9BQU8sa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2RCxDQUFDLENBQUE7QUFFRCxJQUFNLHdCQUF3QixHQUFHLFVBQUMsRUFNakM7UUFMQyxVQUFVLGdCQUFBLEVBQ1YsTUFBTSxZQUFBO0lBS04sS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNqQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUE7UUFDbEI7O1dBRUc7UUFDSCxJQUFNLGFBQWEsR0FBRyxVQUFD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QUFnQixHQUFHLFVBQUMsRUFBeUI7UUFBekIscUJBQXVCLEVBQUUsS0FBQSxFQUF2QixTQUFTLGVBQUE7SUFDMUMsT0FBTztRQUNMLFlBQVksRUFBRTtZQUNaLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFVBQVUsRUFBRSxRQUFRO1NBQ3JCO1FBQ0QsZUFBZSxFQUFFO1lBQ2YsUUFBUSxFQUFFLEtBQUs7WUFDZixVQUFVLEVBQUUsUUFBUTtTQUNyQjtRQUNELGVBQWUsRUFBRTtZQUNmLFNBQVMsRUFBRSxVQUFDLE9BQU87Z0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUztvQkFDckIsU0FBUyxJQUFJLHNCQUFlLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFVLENBQUE7WUFDM0QsQ0FBQztTQUNGO0tBR0YsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1dHRvblByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBQb3BvdmVyQWN0aW9ucywgUG9wb3ZlclByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC5kZWJvdW5jZSdcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcblxudHlwZSBQcm9wcyA9IHtcbiAgLyoqXG4gICAqIFdoeSBtYXhoZWlnaHQ/ICBXZWxsLCB3ZSBqdXN0IHdhbnQgdG8gYmUgYWJsZSB0byBjb25zdHJhaW4gcG9wb3ZlcnMuICBJdCBhbHNvIGRvZXNuJ3QgcHJlY2x1ZGUgdGhlIGluc2lkZSBjb21wb25lbnRzIGZyb20gaGF2aW5nIGFtIG1pbiBoZWlnaHQgaWYgdGhleSBzbyBkZXNpcmUuXG4gICAqL1xuICBtYXhIZWlnaHQ/OiBDU1NTdHlsZURlY2xhcmF0aW9uWydtYXhIZWlnaHQnXVxufVxuXG4vKipcbiAqIE5vcm1hbCByZWZzIGRvbid0IGNhdXNlIGEgcmVyZW5kZXIsIGJ1dCBvZnRlbiB0aW1lcyB3ZSB3YW50IHRoYXQgYmVoYXZpb3Igd2hlbiBncmFiYmluZyBkb20gbm9kZXMgYW5kIG90aGVyd2lzZVxuICogaHR0cHM6Ly9yZWFjdGpzLm9yZy9kb2NzL2hvb2tzLWZhcS5odG1sI2hvdy1jYW4taS1tZWFzdXJlLWEtZG9tLW5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVJlcmVuZGVyaW5nUmVmPFQ+KCkge1xuICBjb25zdCBbcmVmLCBzZXRSZWZdID0gUmVhY3QudXNlU3RhdGU8VD4oKVxuICBjb25zdCByZXJlbmRlcmluZ1JlZiA9IFJlYWN0LnVzZUNhbGxiYWNrKHNldFJlZiwgW10pXG4gIHJldHVybiB7XG4gICAgY3VycmVudDogcmVmLFxuICAgIHJlZjogcmVyZW5kZXJpbmdSZWYsXG4gIH1cbn1cblxuLyoqXG4gKiBGaXJlZm94IGFuZCBDaHJvbWUgZGlmZmVyIHNsaWdodGx5IGluIGltcGxlbWVudGF0aW9uLiAgSWYgb25seSBvbmUgZW50cnksIGZpcmVmb3ggcmV0dXJucyB0aGF0IGluc3RlYWQgb2YgYW4gYXJyYXkhXG4gKi9cbmNvbnN0IGdldEJvcmRlckJveFNpemVGcm9tRW50cnkgPSAoZW50cnk6IFJlc2l6ZU9ic2VydmVyRW50cnkpID0+IHtcbiAgY29uc3QgYm9yZGVyQm94U2l6ZUFycmF5OiBSZXNpemVPYnNlcnZlclNpemVbXSA9IFtdXG4gIHJldHVybiBib3JkZXJCb3hTaXplQXJyYXkuY29uY2F0KGVudHJ5LmJvcmRlckJveFNpemUpXG59XG5cbmNvbnN0IHVzZUxpc3RlbkZvckNoaWxkVXBkYXRlcyA9ICh7XG4gIHBvcG92ZXJSZWYsXG4gIGFjdGlvbixcbn06IHtcbiAgcG9wb3ZlclJlZjogSFRNTERpdkVsZW1lbnQgfCB1bmRlZmluZWRcbiAgYWN0aW9uOiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PFBvcG92ZXJBY3Rpb25zIHwgbnVsbD5cbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgbGFzdFdpZHRoID0gMFxuICAgIGxldCBsYXN0SGVpZ2h0ID0gMFxuICAgIC8qKlxuICAgICAqIFdpZHRoIGlzIGxlc3MgbGlrZWx5IHRvIGNoYW5nZSBpbiBwb3B1cHMsIHNvIHdlIGNhbiByZWFjdCBpbW1lZGlhdGVseVxuICAgICAqL1xuICAgIGNvbnN0IHdpZHRoQ2FsbGJhY2sgPSAoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGZvciAobGV0IHN1YmVudHJ5IG9mIGdldEJvcmRlckJveFNpemVGcm9tRW50cnkoZW50cnkpKSB7XG4gICAgICAgICAgaWYgKHN1YmVudHJ5LmlubGluZVNpemUgIT09IGxhc3RXaWR0aCkge1xuICAgICAgICAgICAgbGFzdFdpZHRoID0gc3ViZW50cnkuaW5saW5lU2l6ZVxuICAgICAgICAgICAgYWN0aW9uLmN1cnJlbnQ/LnVwZGF0ZVBvc2l0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGVpZ2h0IGlzIHZlcnkgbGlrZWx5IHRvIGNoYW5nZSBpbiBwb3B1cHMsIHNvIHdlIHNob3VsZCByZWFjdCBsZXNzIGltbWVkaWF0ZWx5XG4gICAgICovXG4gICAgY29uc3QgaGVpZ2h0Q2FsbGJhY2sgPSBkZWJvdW5jZSgoZW50cmllczogUmVzaXplT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGZvciAobGV0IHN1YmVudHJ5IG9mIGdldEJvcmRlckJveFNpemVGcm9tRW50cnkoZW50cnkpKSB7XG4gICAgICAgICAgaWYgKHN1YmVudHJ5LmJsb2NrU2l6ZSAhPT0gbGFzdEhlaWdodCkge1xuICAgICAgICAgICAgbGFzdEhlaWdodCA9IHN1YmVudHJ5LmJsb2NrU2l6ZVxuICAgICAgICAgICAgYWN0aW9uLmN1cnJlbnQ/LnVwZGF0ZVBvc2l0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAzMDApXG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICB3aWR0aENhbGxiYWNrKGVudHJpZXMpXG4gICAgICBoZWlnaHRDYWxsYmFjayhlbnRyaWVzKVxuICAgIH0pXG4gICAgaWYgKHBvcG92ZXJSZWYpIHtcbiAgICAgIGNvbnN0IHBhcGVyRWxlbWVudCA9IHBvcG92ZXJSZWYucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLk11aVBhcGVyLXJvb3QnKVxuICAgICAgaWYgKHBhcGVyRWxlbWVudCkge1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHBhcGVyRWxlbWVudClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgIH1cbiAgfSwgW2FjdGlvbi5jdXJyZW50LCBwb3BvdmVyUmVmXSlcbn1cblxuaW50ZXJmYWNlIE1lbnVTdGF0ZUNvbnRleHRUeXBlIHtcbiAgaGFuZGxlQ2xvc2U6ICgpID0+IHZvaWRcbiAgaGFuZGxlQ2FzY2FkZUNsb3NlOiAoKSA9PiB2b2lkXG4gIHBhcmVudE1lbnVTdGF0ZUNvbnRleHQ/OiBNZW51U3RhdGVDb250ZXh0VHlwZSB8IG51bGxcbn1cblxuLyoqXG4gKiAgTm90aWNlIHdlIGRvIG5vdCBleHBvcnQgdGhpcywgYXMgd2Ugd2FudCBmdWxsIGNvbnRyb2wgb3ZlciBwYXJlbnRNZW51U3RhdGVDb250ZXh0IGluIG9yZGVyIHRvIG1ha2UgdGhlIGRldiBleHBlcmllbmNlIHNtb290aC5cbiAqICBEZXZzIHNob3VsZCBiZSB1c2luZyB0aGUgcHJvdmlkZXIgaW5zdGFuY2UgdGhhdCBnZXRzIHJldHVybmVkIHdpdGggdXNlTWVudVN0YXRlLlxuICovXG5jb25zdCBNZW51U3RhdGVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDxNZW51U3RhdGVDb250ZXh0VHlwZT4oe1xuICBoYW5kbGVDbG9zZTogKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGBObyBtZW51IHN0YXRlIGNvbnRleHQgZm91bmQsIGNoZWNrIHRvIG1ha2Ugc3VyZSB5b3UncmUgd3JhcHBpbmcgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSBtZW51IHN0YXRlIHByb3ZpZGVyLiAgVGhpcyBoYW5kbGVDbG9zZSBjYWxsIHdpbGwgYmUgYSBub29wLmBcbiAgICApXG4gIH0sXG4gIGhhbmRsZUNhc2NhZGVDbG9zZTogKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGBObyBtZW51IHN0YXRlIGNvbnRleHQgZm91bmQsIGNoZWNrIHRvIG1ha2Ugc3VyZSB5b3UncmUgd3JhcHBpbmcgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSBtZW51IHN0YXRlIHByb3ZpZGVyLiAgVGhpcyBoYW5kbGVDYXNjYWRlQ2xvc2UgY2FsbCB3aWxsIGJlIGEgbm9vcC5gXG4gICAgKVxuICB9LFxufSlcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZU1lbnVTdGF0ZUNvbnRleHQoKSB7XG4gIGNvbnN0IG1lbnVTdGF0ZSA9IFJlYWN0LnVzZUNvbnRleHQoTWVudVN0YXRlQ29udGV4dClcbiAgcmV0dXJuIG1lbnVTdGF0ZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlTWVudVN0YXRlKHsgbWF4SGVpZ2h0IH06IFByb3BzID0ge30pIHtcbiAgY29uc3QgcGFyZW50TWVudVN0YXRlQ29udGV4dCA9IHVzZU1lbnVTdGF0ZUNvbnRleHQoKVxuICBjb25zdCBhbmNob3JSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IHBvcG92ZXJSZWYgPSB1c2VSZXJlbmRlcmluZ1JlZjxIVE1MRGl2RWxlbWVudD4oKVxuICBjb25zdCBhY3Rpb24gPSBSZWFjdC51c2VSZWY8UG9wb3ZlckFjdGlvbnMgfCBudWxsPihudWxsKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlTGlzdGVuRm9yQ2hpbGRVcGRhdGVzKHsgcG9wb3ZlclJlZjogcG9wb3ZlclJlZi5jdXJyZW50LCBhY3Rpb24gfSlcbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0T3BlbigoY3VycmVudFZhbHVlKSA9PiB7XG4gICAgICByZXR1cm4gIWN1cnJlbnRWYWx1ZVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZUNsb3NlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldE9wZW4oZmFsc2UpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZUNhc2NhZGVDbG9zZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBoYW5kbGVDbG9zZSgpXG4gICAgaWYgKHBhcmVudE1lbnVTdGF0ZUNvbnRleHQucGFyZW50TWVudVN0YXRlQ29udGV4dCkge1xuICAgICAgcGFyZW50TWVudVN0YXRlQ29udGV4dC5oYW5kbGVDYXNjYWRlQ2xvc2UoKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgLy8gcHJlY29uc3RydWN0IHRoaXMgZm9yIGNvbnZlbmllbmNlXG4gIGNvbnN0IE1lbnVTdGF0ZVByb3ZpZGVySW5zdGFuY2UgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0pID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxNZW51U3RhdGVDb250ZXh0LlByb3ZpZGVyXG4gICAgICAgICAgdmFsdWU9e3tcbiAgICAgICAgICAgIGhhbmRsZUNsb3NlLFxuICAgICAgICAgICAgaGFuZGxlQ2FzY2FkZUNsb3NlLFxuICAgICAgICAgICAgcGFyZW50TWVudVN0YXRlQ29udGV4dCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICA8L01lbnVTdGF0ZUNvbnRleHQuUHJvdmlkZXI+XG4gICAgICApXG4gICAgfVxuICB9LCBbXSlcblxuICAvLyBpZiB0aGUgTXVpUG9wb3ZlciBwcm9wcyBnZXQgdXNlZCwgdGhlbiB0aGUgY2hpbGRyZW4gd2lsbCBhdXRvbWF0aWNhbGx5IGdldCBhY2Nlc3MgdG8gdGhlIG1lbnVzdGF0ZVxuICBjb25zdCBNdWlQb3BvdmVyTWVudVN0YXRlUHJvdmlkZXJJbnN0YW5jZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBSZWFjdC5mb3J3YXJkUmVmPEhUTUxEaXZFbGVtZW50PigocHJvcHMsIHJlZikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPE1lbnVTdGF0ZVByb3ZpZGVySW5zdGFuY2U+XG4gICAgICAgICAgPFBhcGVyIHsuLi5wcm9wc30gcmVmPXtyZWZ9IGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30+PC9QYXBlcj5cbiAgICAgICAgPC9NZW51U3RhdGVQcm92aWRlckluc3RhbmNlPlxuICAgICAgKVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IG1lbnVTdGF0ZSA9IHtcbiAgICBhbmNob3JSZWYsXG4gICAgb3BlbixcbiAgICBoYW5kbGVDbGljayxcbiAgICBoYW5kbGVDbG9zZSxcbiAgICAvKipcbiAgICAgKiAgRm9yIG1lbnVzIHRoYXQgYXJlIG5lc3RlZCB3aXRoaW4gb3RoZXIgbWVudXMsIHRoaXMgd2lsbCByaXBwbGUgdXAgdGhlIG1lbnUgdHJlZSBhbmQgY2xvc2UgcGFyZW50IG1lbnVzXG4gICAgICovXG4gICAgaGFuZGxlQ2FzY2FkZUNsb3NlLFxuICAgIC8vIHRoZXNlIGNhbiBhbHNvIGJlIHVzZWQgZGlyZWN0bHkgd2l0aCB0aGUgTXVpUG9wcGVyIGlmIGRlc2lyZWRcbiAgICBNdWlQb3BvdmVyUHJvcHM6IHtcbiAgICAgIG9wZW4sXG4gICAgICBvbkNsb3NlOiBoYW5kbGVDbG9zZSxcbiAgICAgIGFuY2hvckVsOiBhbmNob3JSZWYuY3VycmVudCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlZjogcG9wb3ZlclJlZi5yZWYsXG4gICAgICAuLi5QT1BPVkVSX0RFRkFVTFRTKHsgbWF4SGVpZ2h0IH0pLFxuICAgICAgc2xvdFByb3BzOiB7XG4gICAgICAgIHBhcGVyOiB7XG4gICAgICAgICAgY29tcG9uZW50OiBNdWlQb3BvdmVyTWVudVN0YXRlUHJvdmlkZXJJbnN0YW5jZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSBhcyBSZXF1aXJlZDxcbiAgICAgIFBpY2s8XG4gICAgICAgIFBvcG92ZXJQcm9wcyxcbiAgICAgICAgfCAnb3BlbidcbiAgICAgICAgfCAnb25DbG9zZSdcbiAgICAgICAgfCAnYW5jaG9yRWwnXG4gICAgICAgIHwgJ1RyYW5zaXRpb25Qcm9wcydcbiAgICAgICAgfCAnYW5jaG9yT3JpZ2luJ1xuICAgICAgICB8ICd0cmFuc2Zvcm1PcmlnaW4nXG4gICAgICAgIHwgJ2FjdGlvbidcbiAgICAgICAgfCAncmVmJ1xuICAgICAgICB8ICdzbG90UHJvcHMnXG4gICAgICA+XG4gICAgPixcbiAgICBNdWlCdXR0b25Qcm9wczoge1xuICAgICAgcmVmOiBhbmNob3JSZWYgYXMgdW5rbm93biBhcyBCdXR0b25Qcm9wc1sncmVmJ10sXG4gICAgICBvbkNsaWNrOiBoYW5kbGVDbGljayxcbiAgICB9IGFzIFJlcXVpcmVkPFBpY2s8QnV0dG9uUHJvcHMsICdyZWYnIHwgJ29uQ2xpY2snPj4sXG4gICAgYnV0dG9uUHJvcHM6IHtcbiAgICAgIHJlZjogYW5jaG9yUmVmLFxuICAgICAgb25DbGljazogaGFuZGxlQ2xpY2ssXG4gICAgfSxcbiAgICBNZW51U3RhdGVQcm92aWRlckluc3RhbmNlLFxuICB9XG5cbiAgcmV0dXJuIG1lbnVTdGF0ZVxufVxuXG5leHBvcnQgZGVmYXVsdCB1c2VNZW51U3RhdGVcblxuZXhwb3J0IGNvbnN0IFBPUE9WRVJfREVGQVVMVFMgPSAoeyBtYXhIZWlnaHQgfTogUHJvcHMgPSB7fSkgPT4ge1xuICByZXR1cm4ge1xuICAgIGFuY2hvck9yaWdpbjoge1xuICAgICAgdmVydGljYWw6ICdib3R0b20nLFxuICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgfSxcbiAgICB0cmFuc2Zvcm1PcmlnaW46IHtcbiAgICAgIHZlcnRpY2FsOiAndG9wJyxcbiAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgIH0sXG4gICAgVHJhbnNpdGlvblByb3BzOiB7XG4gICAgICBvbkVudGVyZWQ6IChlbGVtZW50KSA9PiB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID1cbiAgICAgICAgICBtYXhIZWlnaHQgfHwgYGNhbGMoMTAwJSAtICR7ZWxlbWVudC5zdHlsZS50b3B9IC0gMTBweClgXG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUmVxdWlyZWQ8XG4gICAgUGljazxQb3BvdmVyUHJvcHMsICdhbmNob3JPcmlnaW4nIHwgJ3RyYW5zZm9ybU9yaWdpbicgfCAnVHJhbnNpdGlvblByb3BzJz5cbiAgPlxufVxuIl19