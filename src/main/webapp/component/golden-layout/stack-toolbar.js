import { __assign, __read } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import PopoutIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import ExtensionPoints from '../../extension-points/extension-points';
export var HeaderHeight = 32;
export var MinimizedHeight = HeaderHeight + 5;
/**
 *  There's a bit of funkiness with normal tooltip behavior when we click the minimize buttons, as the tooltip sticks behind and flickers.
 *  This ensures that when the user clicks the button, the tooltip will be hidden.
 */
export function CloseOnClickTooltip(props) {
    var _a = __read(React.useState(false), 2), show = _a[0], setShow = _a[1];
    return (_jsx(MuiTooltip, __assign({ open: show, disableHoverListener: true, onMouseEnter: function () { return setShow(true); }, onMouseLeave: function () { return setShow(false); }, onMouseDown: function () { return setShow(false); } }, props)));
}
/**
 *  This can change, so do not store it in a variable, instead keep around the Root from getRoot and refind the base item as necessary.
 * @param stack
 * @returns
 */
export function getRootColumnContent(stack) {
    var root = getRoot(stack);
    if (root) {
        return root.contentItems[0];
    }
    return undefined;
}
function getStackInMinimizedLocation(_a) {
    var goldenLayoutRoot = _a.goldenLayoutRoot;
    var rootColumnContent = getRootColumnContent(goldenLayoutRoot);
    if (rootColumnContent) {
        return rootColumnContent.contentItems[rootColumnContent.contentItems.length - 1].getActiveContentItem().container;
    }
    return undefined;
}
export function rootIsNotAColumn(goldenLayoutRoot) {
    var _a;
    return (getRootColumnContent(goldenLayoutRoot) &&
        !((_a = getRootColumnContent(goldenLayoutRoot)) === null || _a === void 0 ? void 0 : _a.isColumn));
}
export function rootIsEmpty(goldenLayoutRoot) {
    return !getRootColumnContent(goldenLayoutRoot);
}
// to avoid fixing types everywhere, let's make a function
function getStackHeight(_a) {
    var stack = _a.stack;
    return stack.element.height();
}
export function getBottomItem(stack) {
    var rootColumnContent = getRootColumnContent(stack);
    if (rootColumnContent) {
        return rootColumnContent.contentItems[rootColumnContent.contentItems.length - 1];
    }
    return undefined;
}
export function useStackSize(stack) {
    if (stack.titleElement) {
        stack = stack.contentItem.parent; // this is a tab, so find the stack related to the tab
    }
    var _a = __read(React.useState(stack.header.element.width()), 2), width = _a[0], setWidth = _a[1];
    var _b = __read(React.useState(getStackHeight({ stack: stack })), 2), height = _b[0], setHeight = _b[1];
    React.useEffect(function () {
        if (stack) {
            var resizeCallback_1 = function () {
                setWidth(stack.header.element.width());
                setHeight(getStackHeight({ stack: stack }));
            };
            stack.on('resize', resizeCallback_1);
            return function () {
                stack.off('resize', resizeCallback_1);
            };
        }
        return function () { };
    }, [stack]);
    return { height: height, width: width };
}
export function useIsMaximized(_a) {
    var stack = _a.stack;
    var _b = __read(React.useState(false), 2), isMaximized = _b[0], setIsMaximized = _b[1];
    React.useEffect(function () {
        var maximizedCallback = function () {
            setIsMaximized(true);
        };
        stack.on('maximised', maximizedCallback);
        var minimizedCallback = function () {
            setIsMaximized(false);
        };
        stack.on('minimised', minimizedCallback);
        return function () {
            stack.off('maximised', maximizedCallback);
            stack.off('minimised', minimizedCallback);
        };
    }, [stack]);
    React.useEffect(function () {
        setIsMaximized(stack.isMaximised);
    }, [stack]);
    return isMaximized;
}
/**
 *  Will return a safe, unchanging reference, feel free to keep in a variable
 * @param stack
 * @returns
 */
function getRoot(stack) {
    if (!stack) {
        return undefined;
    }
    var stackAsContentItem = stack;
    if (stackAsContentItem === null || stackAsContentItem === void 0 ? void 0 : stackAsContentItem.isRoot) {
        return stackAsContentItem;
    }
    var parent = stackAsContentItem.parent;
    if ((parent === null || parent === void 0 ? void 0 : parent.type) === 'root') {
        return parent;
    }
    else {
        return getRoot(parent);
    }
}
export function useRoot(stack) {
    var _a = __read(React.useState(getRoot(stack)), 2), root = _a[0], setRoot = _a[1];
    React.useEffect(function () {
        setRoot(getRoot(stack));
    }, [stack]);
    return root;
}
// by ready, we mean the stack to be minimized is already on the bottom of a column layout => aka we can just resize it
function layoutIsAlreadyReady(_a) {
    var _b, _c, _d;
    var stack = _a.stack;
    var bottomItem = getBottomItem(stack);
    var isBottomItem = stack === bottomItem;
    return ((isBottomItem && ((_b = getRootColumnContent(stack)) === null || _b === void 0 ? void 0 : _b.isColumn)) ||
        (!((_c = getRootColumnContent(stack)) === null || _c === void 0 ? void 0 : _c.isColumn) &&
            !((_d = getRootColumnContent(stack)) === null || _d === void 0 ? void 0 : _d.isRow)));
}
// check if a minimized stack already exists
export function layoutAlreadyHasMinimizedStack(_a) {
    var _b;
    var stack = _a.stack;
    var bottomItem = getBottomItem(stack);
    return (((_b = getRootColumnContent(stack)) === null || _b === void 0 ? void 0 : _b.isColumn) &&
        bottomItem.pixelHeight <= MinimizedHeight);
}
// add the stack to the existing minimized stack
function addStackToExistingMinimizedStack(_a) {
    var stack = _a.stack;
    var bottomItem = getBottomItem(stack);
    if (bottomItem) {
        stack.contentItems.slice().forEach(function (thing) {
            stack.removeChild(thing, true); // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
            bottomItem.addChild(thing, undefined);
        });
    }
}
// we have to move each item individually because golden layout doesn't support moving an entire stack, and addChild does not work as documentation says (it doesn't remove the existing automatically)
function createNewStackFromExistingStack(_a) {
    var stack = _a.stack;
    var existingItems = stack.contentItems.slice();
    var newStackItem = stack.layoutManager._$normalizeContentItem({
        type: 'stack',
    });
    existingItems.forEach(function (thing) {
        stack.removeChild(thing, true); // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
        newStackItem.addChild(thing, undefined);
    });
    return newStackItem;
}
// create a new minimized stack and add the stack to it
function createAndAddNewMinimizedStack(_a) {
    var _b;
    var stack = _a.stack, goldenLayoutRoot = _a.goldenLayoutRoot;
    var newStackItem = createNewStackFromExistingStack({ stack: stack });
    if (rootIsNotAColumn(goldenLayoutRoot)) {
        var existingRootContent = getRootColumnContent(goldenLayoutRoot);
        goldenLayoutRoot.removeChild(existingRootContent, true); // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
        // we need a column for minimize to work, so make a new column and add the existing root to it
        var newColumnItem = stack.layoutManager._$normalizeContentItem({
            type: 'column',
        });
        newColumnItem.addChild(existingRootContent);
        newColumnItem.addChild(newStackItem);
        goldenLayoutRoot.addChild(newColumnItem);
    }
    else if (rootIsEmpty(goldenLayoutRoot)) {
        var newColumnItem = stack.layoutManager._$normalizeContentItem({
            type: 'column',
        });
        newColumnItem.addChild(newStackItem);
        goldenLayoutRoot.addChild(newColumnItem);
    }
    else {
        (_b = getRootColumnContent(goldenLayoutRoot)) === null || _b === void 0 ? void 0 : _b.addChild(newStackItem);
    }
}
// the true height of the stack - the golden layout implementation at the moment only tracks the height of the visual within the stack, not the stack itself
function getTrueHeight(_a) {
    var _b;
    var goldenLayoutRoot = _a.goldenLayoutRoot;
    return ((_b = getStackInMinimizedLocation({ goldenLayoutRoot: goldenLayoutRoot })) === null || _b === void 0 ? void 0 : _b.parent.parent.element).height();
}
export function adjustStackInMinimizedPlaceIfNecessary(_a) {
    var _b;
    var goldenLayoutRoot = _a.goldenLayoutRoot;
    if ((_b = getRootColumnContent(goldenLayoutRoot)) === null || _b === void 0 ? void 0 : _b.isColumn) {
        var trueHeight = getTrueHeight({ goldenLayoutRoot: goldenLayoutRoot });
        var minimizedStack = getStackInMinimizedLocation({ goldenLayoutRoot: goldenLayoutRoot });
        if (minimizedStack) {
            minimizedStack.height = trueHeight || minimizedStack.height; // otherwise setSize will not work correctly! - this allows us to consistently and always set the height to what we want!
            minimizedStack.setSize(10, HeaderHeight);
        }
    }
}
// keep track of pixel height on each stack, which allows us to detect when a stack is "minimized" later on
function usePixelHeightTracking(stack, height) {
    React.useEffect(function () {
        if (stack) {
            ;
            stack.pixelHeight = height;
        }
    }, [height, stack]);
    var goldenLayoutRoot = useRoot(stack);
    var minimizeCallback = React.useCallback(function () {
        if (!goldenLayoutRoot) {
            return;
        }
        if (layoutIsAlreadyReady({ stack: stack })) {
            // do nothing? just resize to be minimized
        }
        else if (layoutAlreadyHasMinimizedStack({ stack: stack })) {
            // minimized area exists, add this to it
            addStackToExistingMinimizedStack({ stack: stack });
        }
        else {
            // rearrange layout if necessary and move the stack
            createAndAddNewMinimizedStack({ stack: stack, goldenLayoutRoot: goldenLayoutRoot });
        }
        adjustStackInMinimizedPlaceIfNecessary({ goldenLayoutRoot: goldenLayoutRoot });
    }, [stack, goldenLayoutRoot]);
    return { minimizeCallback: minimizeCallback };
}
function useCanBeMinimized(_a) {
    var stack = _a.stack, height = _a.height, width = _a.width;
    var _b = __read(React.useState(true), 2), canBeMinimized = _b[0], setCanBeMinimized = _b[1];
    React.useEffect(function () {
        var rootContent = getRootColumnContent(stack);
        if (rootContent === null || rootContent === void 0 ? void 0 : rootContent.isStack) {
            setCanBeMinimized(false);
        }
        else {
            setCanBeMinimized(true);
        }
    }, [stack, height, width]);
    return canBeMinimized;
}
export var StackToolbar = function (_a) {
    var stack = _a.stack;
    var isMaximized = useIsMaximized({ stack: stack });
    var _b = useStackSize(stack), height = _b.height, width = _b.width;
    var minimizeCallback = usePixelHeightTracking(stack, height).minimizeCallback;
    var canBeMinimized = useCanBeMinimized({ stack: stack, width: width, height: height });
    var isMinimized = height && height <= MinimizedHeight;
    return (_jsx(ExtensionPoints.providers, { children: _jsx("div", { className: "flex flex-row flex-nowrap items-center", children: _jsxs(_Fragment, { children: [isMaximized || isMinimized || !canBeMinimized ? (_jsx(_Fragment, {})) : (_jsx("div", { children: _jsx(CloseOnClickTooltip, { title: _jsx(Paper, { elevation: Elevations.overlays, className: "p-1", children: "Minimize stack of visuals to bottom of layout" }), children: _jsx(Button, { "data-id": "minimise-layout-button", onClick: minimizeCallback, children: _jsx(MinimizeIcon, { fontSize: "small" }) }) }) })), isMaximized ? (_jsx("div", { children: _jsx(CloseOnClickTooltip, { title: _jsx(Paper, { elevation: Elevations.overlays, className: "p-1", children: "Restore stack of visuals to original size" }), children: _jsx(Button, { "data-id": "unmaximise-layout-button", onClick: function () {
                                    stack.toggleMaximise();
                                }, children: _jsx(FullscreenExitIcon, { fontSize: "small" }) }) }) })) : (_jsx("div", { children: _jsx(CloseOnClickTooltip, { title: _jsx(Paper, { elevation: Elevations.overlays, className: "p-1", children: "Maximize stack of visuals" }), children: _jsx(Button, { "data-id": "maximise-layout-button", onClick: function () {
                                    stack.toggleMaximise();
                                }, children: _jsx(FullscreenIcon, { fontSize: "small" }) }) }) })), stack.layoutManager.isSubWindow ? null : (_jsx("div", { children: _jsx(CloseOnClickTooltip, { title: _jsx(Paper, { elevation: Elevations.overlays, className: "p-1", children: "Open stack of visuals in new window" }), children: _jsx(Button, { "data-id": "popout-layout-button", onClick: function () {
                                    stack.popout();
                                }, children: _jsx(PopoutIcon, { fontSize: "small" }) }) }) })), _jsx("div", { children: stack.header._isClosable() ? (_jsx(CloseOnClickTooltip, { title: _jsx(Paper, { elevation: Elevations.overlays, className: "p-1", children: "Close stack of visuals" }), children: _jsx(Button, { "data-id": "close-layout-button", onClick: function () {
                                    if (stack.isMaximised) {
                                        stack.toggleMaximise();
                                    }
                                    stack.remove();
                                }, children: _jsx(CloseIcon, { fontSize: "small" }) }) })) : null })] }) }) }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2stdG9vbGJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZ29sZGVuLWxheW91dC9zdGFjay10b29sYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLFVBQTRCLE1BQU0sdUJBQXVCLENBQUE7QUFDaEUsT0FBTyxrQkFBa0IsTUFBTSxvQ0FBb0MsQ0FBQTtBQUNuRSxPQUFPLGNBQWMsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUMzRCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLFNBQVMsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLFVBQVUsTUFBTSwrQkFBK0IsQ0FBQTtBQUV0RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDM0MsT0FBTyxlQUFlLE1BQU0seUNBQXlDLENBQUE7QUFFckUsTUFBTSxDQUFDLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQTtBQUM5QixNQUFNLENBQUMsSUFBTSxlQUFlLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQTtBQUUvQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsS0FBbUI7SUFDL0MsSUFBQSxLQUFBLE9BQWtCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBdEMsSUFBSSxRQUFBLEVBQUUsT0FBTyxRQUF5QixDQUFBO0lBRTdDLE9BQU8sQ0FDTCxLQUFDLFVBQVUsYUFDVCxJQUFJLEVBQUUsSUFBSSxFQUNWLG9CQUFvQixRQUNwQixZQUFZLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBYixDQUFhLEVBQ2pDLFlBQVks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LElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDeEMsd0JBQ0UsS0FBQyxtQkFBbUIsSUFDbEIsS0FBSyxFQUNILEtBQUMsS0FBSyxJQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBQyxLQUFLLG9EQUU5QyxZQUdWLEtBQUMsTUFBTSxlQUNHLHNCQUFzQixFQUM5QixPQUFPLEVBQUU7b0NBQ1AsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO2dDQUNoQixDQUFDLFlBRUQsS0FBQyxVQUFVLElBQUMsUUFBUSxFQUFDLE9BQU8sR0FBRyxHQUN4QixHQUNXLEdBQ2xCLENBQ1AsRUFFRCx3QkFDSSxLQUFLLENBQUMsTUFBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNyQyxLQUFDLG1CQUFtQixJQUNsQixLQUFLLEVBQ0gsS0FBQyxLQUFLLElBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFDLEtBQUssdUNBRTlDLFlBR1YsS0FBQyxNQUFNLGVBQ0cscUJBQXFCLEVBQzdCLE9BQU8sRUFBRTtvQ0FDUCxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3Q0FDdEIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFBO29DQUN4QixDQUFDO29DQUNELEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtnQ0FDaEIsQ0FBQyxZQUVELEtBQUMsU0FBUyxJQUFDLFFBQVEsRUFBQyxPQUFPLEdBQUcsR0FDdkIsR0FDVyxDQUN2QixDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQ0osSUFDTCxHQUNDLEdBQ29CLENBQzdCLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR29sZGVuTGF5b3V0IGZyb20gJ2dvbGRlbi1sYXlvdXQnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgTXVpVG9vbHRpcCwgeyBUb29sdGlwUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL1Rvb2x0aXAnXG5pbXBvcnQgRnVsbHNjcmVlbkV4aXRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvRnVsbHNjcmVlbkV4aXQnXG5pbXBvcnQgRnVsbHNjcmVlbkljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9GdWxsc2NyZWVuJ1xuaW1wb3J0IE1pbmltaXplSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL01pbmltaXplJ1xuaW1wb3J0IENsb3NlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Nsb3NlJ1xuaW1wb3J0IFBvcG91dEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9PcGVuSW5OZXcnXG5cbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cy9leHRlbnNpb24tcG9pbnRzJ1xuXG5leHBvcnQgY29uc3QgSGVhZGVySGVpZ2h0ID0gMzJcbmV4cG9ydCBjb25zdCBNaW5pbWl6ZWRIZWlnaHQgPSBIZWFkZXJIZWlnaHQgKyA1XG5cbi8qKlxuICogIFRoZXJlJ3MgYSBiaXQgb2YgZnVua2luZXNzIHdpdGggbm9ybWFsIHRvb2x0aXAgYmVoYXZpb3Igd2hlbiB3ZSBjbGljayB0aGUgbWluaW1pemUgYnV0dG9ucywgYXMgdGhlIHRvb2x0aXAgc3RpY2tzIGJlaGluZCBhbmQgZmxpY2tlcnMuXG4gKiAgVGhpcyBlbnN1cmVzIHRoYXQgd2hlbiB0aGUgdXNlciBjbGlja3MgdGhlIGJ1dHRvbiwgdGhlIHRvb2x0aXAgd2lsbCBiZSBoaWRkZW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDbG9zZU9uQ2xpY2tUb29sdGlwKHByb3BzOiBUb29sdGlwUHJvcHMpIHtcbiAgY29uc3QgW3Nob3csIHNldFNob3ddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8TXVpVG9vbHRpcFxuICAgICAgb3Blbj17c2hvd31cbiAgICAgIGRpc2FibGVIb3Zlckxpc3RlbmVyXG4gICAgICBvbk1vdXNlRW50ZXI9eygpID0+IHNldFNob3codHJ1ZSl9XG4gICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHNldFNob3coZmFsc2UpfVxuICAgICAgb25Nb3VzZURvd249eygpID0+IHNldFNob3coZmFsc2UpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuLyoqXG4gKiAgVGhpcyBjYW4gY2hhbmdlLCBzbyBkbyBub3Qgc3RvcmUgaXQgaW4gYSB2YXJpYWJsZSwgaW5zdGVhZCBrZWVwIGFyb3VuZCB0aGUgUm9vdCBmcm9tIGdldFJvb3QgYW5kIHJlZmluZCB0aGUgYmFzZSBpdGVtIGFzIG5lY2Vzc2FyeS5cbiAqIEBwYXJhbSBzdGFja1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3RDb2x1bW5Db250ZW50KFxuICBzdGFjazogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIHwgR29sZGVuTGF5b3V0LlRhYlxuKTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgcm9vdCA9IGdldFJvb3Qoc3RhY2spXG4gIGlmIChyb290KSB7XG4gICAgcmV0dXJuIHJvb3QuY29udGVudEl0ZW1zWzBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBnZXRTdGFja0luTWluaW1pemVkTG9jYXRpb24oe1xuICBnb2xkZW5MYXlvdXRSb290LFxufToge1xuICBnb2xkZW5MYXlvdXRSb290OiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbn0pOiBHb2xkZW5MYXlvdXQuQ29udGFpbmVyIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgcm9vdENvbHVtbkNvbnRlbnQgPSBnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KVxuICBpZiAocm9vdENvbHVtbkNvbnRlbnQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcm9vdENvbHVtbkNvbnRlbnQuY29udGVudEl0ZW1zW1xuICAgICAgICByb290Q29sdW1uQ29udGVudC5jb250ZW50SXRlbXMubGVuZ3RoIC0gMVxuICAgICAgXS5nZXRBY3RpdmVDb250ZW50SXRlbSgpIGFzIGFueVxuICAgICkuY29udGFpbmVyIGFzIEdvbGRlbkxheW91dC5Db250YWluZXJcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290SXNOb3RBQ29sdW1uKGdvbGRlbkxheW91dFJvb3Q6IEdvbGRlbkxheW91dC5Db250ZW50SXRlbSkge1xuICByZXR1cm4gKFxuICAgIGdldFJvb3RDb2x1bW5Db250ZW50KGdvbGRlbkxheW91dFJvb3QpICYmXG4gICAgIWdldFJvb3RDb2x1bW5Db250ZW50KGdvbGRlbkxheW91dFJvb3QpPy5pc0NvbHVtblxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290SXNFbXB0eShnb2xkZW5MYXlvdXRSb290OiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0pIHtcbiAgcmV0dXJuICFnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KVxufVxuXG4vLyB0byBhdm9pZCBmaXhpbmcgdHlwZXMgZXZlcnl3aGVyZSwgbGV0J3MgbWFrZSBhIGZ1bmN0aW9uXG5mdW5jdGlvbiBnZXRTdGFja0hlaWdodCh7XG4gIHN0YWNrLFxufToge1xuICBzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxufSkge1xuICByZXR1cm4gKHN0YWNrLmVsZW1lbnQgYXMgdW5rbm93biBhcyBHb2xkZW5MYXlvdXQuSGVhZGVyWydlbGVtZW50J10pLmhlaWdodCgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb3R0b21JdGVtKFxuICBzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxuKTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgcm9vdENvbHVtbkNvbnRlbnQgPSBnZXRSb290Q29sdW1uQ29udGVudChzdGFjaylcbiAgaWYgKHJvb3RDb2x1bW5Db250ZW50KSB7XG4gICAgcmV0dXJuIHJvb3RDb2x1bW5Db250ZW50LmNvbnRlbnRJdGVtc1tcbiAgICAgIHJvb3RDb2x1bW5Db250ZW50LmNvbnRlbnRJdGVtcy5sZW5ndGggLSAxXG4gICAgXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVN0YWNrU2l6ZShcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbikge1xuICBpZiAoc3RhY2sudGl0bGVFbGVtZW50KSB7XG4gICAgc3RhY2sgPSBzdGFjay5jb250ZW50SXRlbS5wYXJlbnQgYXMgYW55IC8vIHRoaXMgaXMgYSB0YWIsIHNvIGZpbmQgdGhlIHN0YWNrIHJlbGF0ZWQgdG8gdGhlIHRhYlxuICB9XG4gIGNvbnN0IFt3aWR0aCwgc2V0V2lkdGhdID0gUmVhY3QudXNlU3RhdGU8bnVtYmVyIHwgdW5kZWZpbmVkPihcbiAgICBzdGFjay5oZWFkZXIuZWxlbWVudC53aWR0aCgpXG4gIClcbiAgY29uc3QgW2hlaWdodCwgc2V0SGVpZ2h0XSA9IFJlYWN0LnVzZVN0YXRlPG51bWJlciB8IHVuZGVmaW5lZD4oXG4gICAgZ2V0U3RhY2tIZWlnaHQoeyBzdGFjayB9KVxuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3RhY2spIHtcbiAgICAgIGNvbnN0IHJlc2l6ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICBzZXRXaWR0aChzdGFjay5oZWFkZXIuZWxlbWVudC53aWR0aCgpKVxuICAgICAgICBzZXRIZWlnaHQoZ2V0U3RhY2tIZWlnaHQoeyBzdGFjayB9KSlcbiAgICAgIH1cbiAgICAgIHN0YWNrLm9uKCdyZXNpemUnLCByZXNpemVDYWxsYmFjaylcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHN0YWNrLm9mZigncmVzaXplJywgcmVzaXplQ2FsbGJhY2spXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbc3RhY2tdKVxuICByZXR1cm4geyBoZWlnaHQsIHdpZHRoIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUlzTWF4aW1pemVkKHtcbiAgc3RhY2ssXG59OiB7XG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuVGFiICYgR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IFtpc01heGltaXplZCwgc2V0SXNNYXhpbWl6ZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbWF4aW1pemVkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBzZXRJc01heGltaXplZCh0cnVlKVxuICAgIH1cbiAgICBzdGFjay5vbignbWF4aW1pc2VkJywgbWF4aW1pemVkQ2FsbGJhY2spXG4gICAgY29uc3QgbWluaW1pemVkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBzZXRJc01heGltaXplZChmYWxzZSlcbiAgICB9XG4gICAgc3RhY2sub24oJ21pbmltaXNlZCcsIG1pbmltaXplZENhbGxiYWNrKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdGFjay5vZmYoJ21heGltaXNlZCcsIG1heGltaXplZENhbGxiYWNrKVxuICAgICAgc3RhY2sub2ZmKCdtaW5pbWlzZWQnLCBtaW5pbWl6ZWRDYWxsYmFjaylcbiAgICB9XG4gIH0sIFtzdGFja10pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SXNNYXhpbWl6ZWQoc3RhY2suaXNNYXhpbWlzZWQpXG4gIH0sIFtzdGFja10pXG4gIHJldHVybiBpc01heGltaXplZFxufVxuXG4vKipcbiAqICBXaWxsIHJldHVybiBhIHNhZmUsIHVuY2hhbmdpbmcgcmVmZXJlbmNlLCBmZWVsIGZyZWUgdG8ga2VlcCBpbiBhIHZhcmlhYmxlXG4gKiBAcGFyYW0gc3RhY2tcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGdldFJvb3QoXG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0gfCBHb2xkZW5MYXlvdXQuVGFiXG4pOiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0gfCB1bmRlZmluZWQge1xuICBpZiAoIXN0YWNrKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIGNvbnN0IHN0YWNrQXNDb250ZW50SXRlbSA9IHN0YWNrIGFzIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxuICBpZiAoc3RhY2tBc0NvbnRlbnRJdGVtPy5pc1Jvb3QpIHtcbiAgICByZXR1cm4gc3RhY2tBc0NvbnRlbnRJdGVtXG4gIH1cbiAgbGV0IHBhcmVudCA9IHN0YWNrQXNDb250ZW50SXRlbS5wYXJlbnRcbiAgaWYgKHBhcmVudD8udHlwZSA9PT0gJ3Jvb3QnKSB7XG4gICAgcmV0dXJuIHBhcmVudFxuICB9IGVsc2Uge1xuICAgIHJldHVybiBnZXRSb290KHBhcmVudClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlUm9vdChzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbSkge1xuICBjb25zdCBbcm9vdCwgc2V0Um9vdF0gPSBSZWFjdC51c2VTdGF0ZShnZXRSb290KHN0YWNrKSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRSb290KGdldFJvb3Qoc3RhY2spKVxuICB9LCBbc3RhY2tdKVxuICByZXR1cm4gcm9vdFxufVxuXG4vLyBieSByZWFkeSwgd2UgbWVhbiB0aGUgc3RhY2sgdG8gYmUgbWluaW1pemVkIGlzIGFscmVhZHkgb24gdGhlIGJvdHRvbSBvZiBhIGNvbHVtbiBsYXlvdXQgPT4gYWthIHdlIGNhbiBqdXN0IHJlc2l6ZSBpdFxuZnVuY3Rpb24gbGF5b3V0SXNBbHJlYWR5UmVhZHkoe1xuICBzdGFjayxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbn0pIHtcbiAgY29uc3QgYm90dG9tSXRlbSA9IGdldEJvdHRvbUl0ZW0oc3RhY2spXG4gIGNvbnN0IGlzQm90dG9tSXRlbSA9IHN0YWNrID09PSBib3R0b21JdGVtXG4gIHJldHVybiAoXG4gICAgKGlzQm90dG9tSXRlbSAmJiBnZXRSb290Q29sdW1uQ29udGVudChzdGFjayk/LmlzQ29sdW1uKSB8fFxuICAgICghZ2V0Um9vdENvbHVtbkNvbnRlbnQoc3RhY2spPy5pc0NvbHVtbiAmJlxuICAgICAgIWdldFJvb3RDb2x1bW5Db250ZW50KHN0YWNrKT8uaXNSb3cpXG4gIClcbn1cblxuLy8gY2hlY2sgaWYgYSBtaW5pbWl6ZWQgc3RhY2sgYWxyZWFkeSBleGlzdHNcbmV4cG9ydCBmdW5jdGlvbiBsYXlvdXRBbHJlYWR5SGFzTWluaW1pemVkU3RhY2soe1xuICBzdGFjayxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbn0pIHtcbiAgY29uc3QgYm90dG9tSXRlbSA9IGdldEJvdHRvbUl0ZW0oc3RhY2spXG5cbiAgcmV0dXJuIChcbiAgICBnZXRSb290Q29sdW1uQ29udGVudChzdGFjayk/LmlzQ29sdW1uICYmXG4gICAgKGJvdHRvbUl0ZW0gYXMgYW55KS5waXhlbEhlaWdodCA8PSBNaW5pbWl6ZWRIZWlnaHRcbiAgKVxufVxuXG4vLyBhZGQgdGhlIHN0YWNrIHRvIHRoZSBleGlzdGluZyBtaW5pbWl6ZWQgc3RhY2tcbmZ1bmN0aW9uIGFkZFN0YWNrVG9FeGlzdGluZ01pbmltaXplZFN0YWNrKHtcbiAgc3RhY2ssXG59OiB7XG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuVGFiICYgR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IGJvdHRvbUl0ZW0gPSBnZXRCb3R0b21JdGVtKHN0YWNrKVxuICBpZiAoYm90dG9tSXRlbSkge1xuICAgIHN0YWNrLmNvbnRlbnRJdGVtcy5zbGljZSgpLmZvckVhY2goKHRoaW5nKSA9PiB7XG4gICAgICBzdGFjay5yZW1vdmVDaGlsZCh0aGluZyBhcyBhbnksIHRydWUpIC8vIGZvciBzb21lIHJlYXNvbiByZW1vdmVDaGlsZCBpcyBvdmVybHkgcmVzdHJpY3RpdmUgb24gdHlwZSBvZiBcInRoaW5nXCIgc28gd2UgaGF2ZSB0byBjYXN0XG4gICAgICBib3R0b21JdGVtLmFkZENoaWxkKHRoaW5nLCB1bmRlZmluZWQpXG4gICAgfSlcbiAgfVxufVxuXG4vLyB3ZSBoYXZlIHRvIG1vdmUgZWFjaCBpdGVtIGluZGl2aWR1YWxseSBiZWNhdXNlIGdvbGRlbiBsYXlvdXQgZG9lc24ndCBzdXBwb3J0IG1vdmluZyBhbiBlbnRpcmUgc3RhY2ssIGFuZCBhZGRDaGlsZCBkb2VzIG5vdCB3b3JrIGFzIGRvY3VtZW50YXRpb24gc2F5cyAoaXQgZG9lc24ndCByZW1vdmUgdGhlIGV4aXN0aW5nIGF1dG9tYXRpY2FsbHkpXG5mdW5jdGlvbiBjcmVhdGVOZXdTdGFja0Zyb21FeGlzdGluZ1N0YWNrKHtcbiAgc3RhY2ssXG59OiB7XG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuVGFiICYgR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IGV4aXN0aW5nSXRlbXMgPSBzdGFjay5jb250ZW50SXRlbXMuc2xpY2UoKVxuICBjb25zdCBuZXdTdGFja0l0ZW0gPSBzdGFjay5sYXlvdXRNYW5hZ2VyLl8kbm9ybWFsaXplQ29udGVudEl0ZW0oe1xuICAgIHR5cGU6ICdzdGFjaycsXG4gIH0pXG4gIGV4aXN0aW5nSXRlbXMuZm9yRWFjaCgodGhpbmcpID0+IHtcbiAgICBzdGFjay5yZW1vdmVDaGlsZCh0aGluZyBhcyBhbnksIHRydWUpIC8vIGZvciBzb21lIHJlYXNvbiByZW1vdmVDaGlsZCBpcyBvdmVybHkgcmVzdHJpY3RpdmUgb24gdHlwZSBvZiBcInRoaW5nXCIgc28gd2UgaGF2ZSB0byBjYXN0XG4gICAgbmV3U3RhY2tJdGVtLmFkZENoaWxkKHRoaW5nLCB1bmRlZmluZWQpXG4gIH0pXG4gIHJldHVybiBuZXdTdGFja0l0ZW1cbn1cblxuLy8gY3JlYXRlIGEgbmV3IG1pbmltaXplZCBzdGFjayBhbmQgYWRkIHRoZSBzdGFjayB0byBpdFxuZnVuY3Rpb24gY3JlYXRlQW5kQWRkTmV3TWluaW1pemVkU3RhY2soe1xuICBzdGFjayxcbiAgZ29sZGVuTGF5b3V0Um9vdCxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbiAgZ29sZGVuTGF5b3V0Um9vdDogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IG5ld1N0YWNrSXRlbSA9IGNyZWF0ZU5ld1N0YWNrRnJvbUV4aXN0aW5nU3RhY2soeyBzdGFjayB9KVxuICBpZiAocm9vdElzTm90QUNvbHVtbihnb2xkZW5MYXlvdXRSb290KSkge1xuICAgIGNvbnN0IGV4aXN0aW5nUm9vdENvbnRlbnQgPSBnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KVxuICAgIGdvbGRlbkxheW91dFJvb3QucmVtb3ZlQ2hpbGQoZXhpc3RpbmdSb290Q29udGVudCBhcyBhbnksIHRydWUpIC8vIGZvciBzb21lIHJlYXNvbiByZW1vdmVDaGlsZCBpcyBvdmVybHkgcmVzdHJpY3RpdmUgb24gdHlwZSBvZiBcInRoaW5nXCIgc28gd2UgaGF2ZSB0byBjYXN0XG5cbiAgICAvLyB3ZSBuZWVkIGEgY29sdW1uIGZvciBtaW5pbWl6ZSB0byB3b3JrLCBzbyBtYWtlIGEgbmV3IGNvbHVtbiBhbmQgYWRkIHRoZSBleGlzdGluZyByb290IHRvIGl0XG4gICAgY29uc3QgbmV3Q29sdW1uSXRlbSA9IHN0YWNrLmxheW91dE1hbmFnZXIuXyRub3JtYWxpemVDb250ZW50SXRlbSh7XG4gICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICB9KVxuICAgIG5ld0NvbHVtbkl0ZW0uYWRkQ2hpbGQoZXhpc3RpbmdSb290Q29udGVudClcbiAgICBuZXdDb2x1bW5JdGVtLmFkZENoaWxkKG5ld1N0YWNrSXRlbSlcblxuICAgIGdvbGRlbkxheW91dFJvb3QuYWRkQ2hpbGQobmV3Q29sdW1uSXRlbSlcbiAgfSBlbHNlIGlmIChyb290SXNFbXB0eShnb2xkZW5MYXlvdXRSb290KSkge1xuICAgIGNvbnN0IG5ld0NvbHVtbkl0ZW0gPSBzdGFjay5sYXlvdXRNYW5hZ2VyLl8kbm9ybWFsaXplQ29udGVudEl0ZW0oe1xuICAgICAgdHlwZTogJ2NvbHVtbicsXG4gICAgfSlcbiAgICBuZXdDb2x1bW5JdGVtLmFkZENoaWxkKG5ld1N0YWNrSXRlbSlcblxuICAgIGdvbGRlbkxheW91dFJvb3QuYWRkQ2hpbGQobmV3Q29sdW1uSXRlbSlcbiAgfSBlbHNlIHtcbiAgICBnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KT8uYWRkQ2hpbGQobmV3U3RhY2tJdGVtKVxuICB9XG59XG5cbi8vIHRoZSB0cnVlIGhlaWdodCBvZiB0aGUgc3RhY2sgLSB0aGUgZ29sZGVuIGxheW91dCBpbXBsZW1lbnRhdGlvbiBhdCB0aGUgbW9tZW50IG9ubHkgdHJhY2tzIHRoZSBoZWlnaHQgb2YgdGhlIHZpc3VhbCB3aXRoaW4gdGhlIHN0YWNrLCBub3QgdGhlIHN0YWNrIGl0c2VsZlxuZnVuY3Rpb24gZ2V0VHJ1ZUhlaWdodCh7XG4gIGdvbGRlbkxheW91dFJvb3QsXG59OiB7XG4gIGdvbGRlbkxheW91dFJvb3Q6IEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxufSkge1xuICByZXR1cm4gKFxuICAgIGdldFN0YWNrSW5NaW5pbWl6ZWRMb2NhdGlvbih7IGdvbGRlbkxheW91dFJvb3QgfSk/LnBhcmVudC5wYXJlbnRcbiAgICAgIC5lbGVtZW50IGFzIHVua25vd24gYXMgR29sZGVuTGF5b3V0LkhlYWRlclsnZWxlbWVudCddXG4gICkuaGVpZ2h0KClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkanVzdFN0YWNrSW5NaW5pbWl6ZWRQbGFjZUlmTmVjZXNzYXJ5KHtcbiAgZ29sZGVuTGF5b3V0Um9vdCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0Um9vdDogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGlmIChnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KT8uaXNDb2x1bW4pIHtcbiAgICBjb25zdCB0cnVlSGVpZ2h0ID0gZ2V0VHJ1ZUhlaWdodCh7IGdvbGRlbkxheW91dFJvb3QgfSlcbiAgICBjb25zdCBtaW5pbWl6ZWRTdGFjayA9IGdldFN0YWNrSW5NaW5pbWl6ZWRMb2NhdGlvbih7IGdvbGRlbkxheW91dFJvb3QgfSlcbiAgICBpZiAobWluaW1pemVkU3RhY2spIHtcbiAgICAgIG1pbmltaXplZFN0YWNrLmhlaWdodCA9IHRydWVIZWlnaHQgfHwgbWluaW1pemVkU3RhY2suaGVpZ2h0IC8vIG90aGVyd2lzZSBzZXRTaXplIHdpbGwgbm90IHdvcmsgY29ycmVjdGx5ISAtIHRoaXMgYWxsb3dzIHVzIHRvIGNvbnNpc3RlbnRseSBhbmQgYWx3YXlzIHNldCB0aGUgaGVpZ2h0IHRvIHdoYXQgd2Ugd2FudCFcbiAgICAgIG1pbmltaXplZFN0YWNrLnNldFNpemUoMTAsIEhlYWRlckhlaWdodClcbiAgICB9XG4gIH1cbn1cblxuLy8ga2VlcCB0cmFjayBvZiBwaXhlbCBoZWlnaHQgb24gZWFjaCBzdGFjaywgd2hpY2ggYWxsb3dzIHVzIHRvIGRldGVjdCB3aGVuIGEgc3RhY2sgaXMgXCJtaW5pbWl6ZWRcIiBsYXRlciBvblxuZnVuY3Rpb24gdXNlUGl4ZWxIZWlnaHRUcmFja2luZyhcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0sXG4gIGhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkXG4pIHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3RhY2spIHtcbiAgICAgIDsoc3RhY2sgYXMgYW55KS5waXhlbEhlaWdodCA9IGhlaWdodFxuICAgIH1cbiAgfSwgW2hlaWdodCwgc3RhY2tdKVxuICBjb25zdCBnb2xkZW5MYXlvdXRSb290ID0gdXNlUm9vdChzdGFjaylcblxuICBjb25zdCBtaW5pbWl6ZUNhbGxiYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICghZ29sZGVuTGF5b3V0Um9vdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChsYXlvdXRJc0FscmVhZHlSZWFkeSh7IHN0YWNrIH0pKSB7XG4gICAgICAvLyBkbyBub3RoaW5nPyBqdXN0IHJlc2l6ZSB0byBiZSBtaW5pbWl6ZWRcbiAgICB9IGVsc2UgaWYgKGxheW91dEFscmVhZHlIYXNNaW5pbWl6ZWRTdGFjayh7IHN0YWNrIH0pKSB7XG4gICAgICAvLyBtaW5pbWl6ZWQgYXJlYSBleGlzdHMsIGFkZCB0aGlzIHRvIGl0XG4gICAgICBhZGRTdGFja1RvRXhpc3RpbmdNaW5pbWl6ZWRTdGFjayh7IHN0YWNrIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlYXJyYW5nZSBsYXlvdXQgaWYgbmVjZXNzYXJ5IGFuZCBtb3ZlIHRoZSBzdGFja1xuICAgICAgY3JlYXRlQW5kQWRkTmV3TWluaW1pemVkU3RhY2soeyBzdGFjaywgZ29sZGVuTGF5b3V0Um9vdCB9KVxuICAgIH1cbiAgICBhZGp1c3RTdGFja0luTWluaW1pemVkUGxhY2VJZk5lY2Vzc2FyeSh7IGdvbGRlbkxheW91dFJvb3QgfSlcbiAgfSwgW3N0YWNrLCBnb2xkZW5MYXlvdXRSb290XSlcblxuICByZXR1cm4geyBtaW5pbWl6ZUNhbGxiYWNrIH1cbn1cblxuZnVuY3Rpb24gdXNlQ2FuQmVNaW5pbWl6ZWQoe1xuICBzdGFjayxcbiAgaGVpZ2h0LFxuICB3aWR0aCxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbiAgaGVpZ2h0PzogbnVtYmVyXG4gIHdpZHRoPzogbnVtYmVyXG59KSB7XG4gIGNvbnN0IFtjYW5CZU1pbmltaXplZCwgc2V0Q2FuQmVNaW5pbWl6ZWRdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb290Q29udGVudCA9IGdldFJvb3RDb2x1bW5Db250ZW50KHN0YWNrKVxuICAgIGlmIChyb290Q29udGVudD8uaXNTdGFjaykge1xuICAgICAgc2V0Q2FuQmVNaW5pbWl6ZWQoZmFsc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldENhbkJlTWluaW1pemVkKHRydWUpXG4gICAgfVxuICB9LCBbc3RhY2ssIGhlaWdodCwgd2lkdGhdKVxuICByZXR1cm4gY2FuQmVNaW5pbWl6ZWRcbn1cblxuZXhwb3J0IGNvbnN0IFN0YWNrVG9vbGJhciA9ICh7XG4gIHN0YWNrLFxufToge1xuICBzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxufSkgPT4ge1xuICBjb25zdCBpc01heGltaXplZCA9IHVzZUlzTWF4aW1pemVkKHsgc3RhY2sgfSlcbiAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSB1c2VTdGFja1NpemUoc3RhY2spXG4gIGNvbnN0IHsgbWluaW1pemVDYWxsYmFjayB9ID0gdXNlUGl4ZWxIZWlnaHRUcmFja2luZyhzdGFjaywgaGVpZ2h0KVxuICBjb25zdCBjYW5CZU1pbmltaXplZCA9IHVzZUNhbkJlTWluaW1pemVkKHsgc3RhY2ssIHdpZHRoLCBoZWlnaHQgfSlcbiAgY29uc3QgaXNNaW5pbWl6ZWQgPSBoZWlnaHQgJiYgaGVpZ2h0IDw9IE1pbmltaXplZEhlaWdodFxuICByZXR1cm4gKFxuICAgIDxFeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGZsZXgtbm93cmFwIGl0ZW1zLWNlbnRlclwiPlxuICAgICAgICA8PlxuICAgICAgICAgIHtpc01heGltaXplZCB8fCBpc01pbmltaXplZCB8fCAhY2FuQmVNaW5pbWl6ZWQgPyAoXG4gICAgICAgICAgICA8PjwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8Q2xvc2VPbkNsaWNrVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMVwiPlxuICAgICAgICAgICAgICAgICAgICBNaW5pbWl6ZSBzdGFjayBvZiB2aXN1YWxzIHRvIGJvdHRvbSBvZiBsYXlvdXRcbiAgICAgICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cIm1pbmltaXNlLWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17bWluaW1pemVDYWxsYmFja31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8TWluaW1pemVJY29uIGZvbnRTaXplPVwic21hbGxcIiAvPlxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L0Nsb3NlT25DbGlja1Rvb2x0aXA+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtpc01heGltaXplZCA/IChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxDbG9zZU9uQ2xpY2tUb29sdGlwXG4gICAgICAgICAgICAgICAgdGl0bGU9e1xuICAgICAgICAgICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30gY2xhc3NOYW1lPVwicC0xXCI+XG4gICAgICAgICAgICAgICAgICAgIFJlc3RvcmUgc3RhY2sgb2YgdmlzdWFscyB0byBvcmlnaW5hbCBzaXplXG4gICAgICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCJ1bm1heGltaXNlLWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay50b2dnbGVNYXhpbWlzZSgpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxGdWxsc2NyZWVuRXhpdEljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvQ2xvc2VPbkNsaWNrVG9vbHRpcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8Q2xvc2VPbkNsaWNrVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMVwiPlxuICAgICAgICAgICAgICAgICAgICBNYXhpbWl6ZSBzdGFjayBvZiB2aXN1YWxzXG4gICAgICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCJtYXhpbWlzZS1sYXlvdXQtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sudG9nZ2xlTWF4aW1pc2UoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8RnVsbHNjcmVlbkljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvQ2xvc2VPbkNsaWNrVG9vbHRpcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7c3RhY2subGF5b3V0TWFuYWdlci5pc1N1YldpbmRvdyA/IG51bGwgOiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8Q2xvc2VPbkNsaWNrVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMVwiPlxuICAgICAgICAgICAgICAgICAgICBPcGVuIHN0YWNrIG9mIHZpc3VhbHMgaW4gbmV3IHdpbmRvd1xuICAgICAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICBkYXRhLWlkPVwicG9wb3V0LWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wb3BvdXQoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8UG9wb3V0SWNvbiBmb250U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9DbG9zZU9uQ2xpY2tUb29sdGlwPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICB7KHN0YWNrLmhlYWRlciBhcyBhbnkpLl9pc0Nsb3NhYmxlKCkgPyAoXG4gICAgICAgICAgICAgIDxDbG9zZU9uQ2xpY2tUb29sdGlwXG4gICAgICAgICAgICAgICAgdGl0bGU9e1xuICAgICAgICAgICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30gY2xhc3NOYW1lPVwicC0xXCI+XG4gICAgICAgICAgICAgICAgICAgIENsb3NlIHN0YWNrIG9mIHZpc3VhbHNcbiAgICAgICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cImNsb3NlLWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhY2suaXNNYXhpbWlzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdGFjay50b2dnbGVNYXhpbWlzZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPENsb3NlSWNvbiBmb250U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9DbG9zZU9uQ2xpY2tUb29sdGlwPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvPlxuICAgICAgPC9kaXY+XG4gICAgPC9FeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICApXG59XG4iXX0=