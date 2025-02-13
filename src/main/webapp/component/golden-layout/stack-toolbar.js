import { __assign, __read } from "tslib";
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
    return (React.createElement(MuiTooltip, __assign({ open: show, disableHoverListener: true, onMouseEnter: function () { return setShow(true); }, onMouseLeave: function () { return setShow(false); }, onMouseDown: function () { return setShow(false); } }, props)));
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
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement("div", { className: "flex flex-row flex-nowrap items-center" },
            React.createElement(React.Fragment, null,
                isMaximized || isMinimized || !canBeMinimized ? (React.createElement(React.Fragment, null)) : (React.createElement("div", null,
                    React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Minimize stack of visuals to bottom of layout") },
                        React.createElement(Button, { "data-id": "minimise-layout-button", onClick: minimizeCallback },
                            React.createElement(MinimizeIcon, { fontSize: "small" }))))),
                isMaximized ? (React.createElement("div", null,
                    React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Restore stack of visuals to original size") },
                        React.createElement(Button, { "data-id": "unmaximise-layout-button", onClick: function () {
                                stack.toggleMaximise();
                            } },
                            React.createElement(FullscreenExitIcon, { fontSize: "small" }))))) : (React.createElement("div", null,
                    React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Maximize stack of visuals") },
                        React.createElement(Button, { "data-id": "maximise-layout-button", onClick: function () {
                                stack.toggleMaximise();
                            } },
                            React.createElement(FullscreenIcon, { fontSize: "small" }))))),
                stack.layoutManager.isSubWindow ? null : (React.createElement("div", null,
                    React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Open stack of visuals in new window") },
                        React.createElement(Button, { "data-id": "popout-layout-button", onClick: function () {
                                stack.popout();
                            } },
                            React.createElement(PopoutIcon, { fontSize: "small" }))))),
                React.createElement("div", null, stack.header._isClosable() ? (React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Close stack of visuals") },
                    React.createElement(Button, { "data-id": "close-layout-button", onClick: function () {
                            if (stack.isMaximised) {
                                stack.toggleMaximise();
                            }
                            stack.remove();
                        } },
                        React.createElement(CloseIcon, { fontSize: "small" })))) : null)))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2stdG9vbGJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZ29sZGVuLWxheW91dC9zdGFjay10b29sYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sVUFBNEIsTUFBTSx1QkFBdUIsQ0FBQTtBQUNoRSxPQUFPLGtCQUFrQixNQUFNLG9DQUFvQyxDQUFBO0FBQ25FLE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFBO0FBQzNELE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFBO0FBQ3ZELE9BQU8sU0FBUyxNQUFNLDJCQUEyQixDQUFBO0FBQ2pELE9BQU8sVUFBVSxNQUFNLCtCQUErQixDQUFBO0FBRXRELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMzQyxPQUFPLGVBQWUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUVyRSxNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFBO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFBO0FBRS9DOzs7R0FHRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFtQjtJQUMvQyxJQUFBLEtBQUEsT0FBa0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUF0QyxJQUFJLFFBQUEsRUFBRSxPQUFPLFFBQXlCLENBQUE7SUFFN0MsT0FBTyxDQUNMLG9CQUFDLFVBQVUsYUFDVCxJQUFJLEVBQUUsSUFBSSxFQUNWLG9CQUFvQixRQUNwQixZQUFZLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBYixDQUFhLEVBQ2pDLFlBQVks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QUUsQ0FBQTs0QkFDaEIsQ0FBQzs0QkFFRCxvQkFBQyxVQUFVLElBQUMsUUFBUSxFQUFDLE9BQU8sR0FBRyxDQUN4QixDQUNXLENBQ2xCLENBQ1A7Z0JBRUQsaUNBQ0ksS0FBSyxDQUFDLE1BQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDckMsb0JBQUMsbUJBQW1CLElBQ2xCLEtBQUssRUFDSCxvQkFBQyxLQUFLLElBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFDLEtBQUssNkJBRTlDO29CQUdWLG9CQUFDLE1BQU0sZUFDRyxxQkFBcUIsRUFDN0IsT0FBTyxFQUFFOzRCQUNQLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtnQ0FDckIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFBOzZCQUN2Qjs0QkFDRCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7d0JBQ2hCLENBQUM7d0JBRUQsb0JBQUMsU0FBUyxJQUFDLFFBQVEsRUFBQyxPQUFPLEdBQUcsQ0FDdkIsQ0FDVyxDQUN2QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ0osQ0FDTCxDQUNDLENBQ29CLENBQzdCLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR29sZGVuTGF5b3V0IGZyb20gJ2dvbGRlbi1sYXlvdXQnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgTXVpVG9vbHRpcCwgeyBUb29sdGlwUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL1Rvb2x0aXAnXG5pbXBvcnQgRnVsbHNjcmVlbkV4aXRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvRnVsbHNjcmVlbkV4aXQnXG5pbXBvcnQgRnVsbHNjcmVlbkljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9GdWxsc2NyZWVuJ1xuaW1wb3J0IE1pbmltaXplSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL01pbmltaXplJ1xuaW1wb3J0IENsb3NlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Nsb3NlJ1xuaW1wb3J0IFBvcG91dEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9PcGVuSW5OZXcnXG5cbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cy9leHRlbnNpb24tcG9pbnRzJ1xuXG5leHBvcnQgY29uc3QgSGVhZGVySGVpZ2h0ID0gMzJcbmV4cG9ydCBjb25zdCBNaW5pbWl6ZWRIZWlnaHQgPSBIZWFkZXJIZWlnaHQgKyA1XG5cbi8qKlxuICogIFRoZXJlJ3MgYSBiaXQgb2YgZnVua2luZXNzIHdpdGggbm9ybWFsIHRvb2x0aXAgYmVoYXZpb3Igd2hlbiB3ZSBjbGljayB0aGUgbWluaW1pemUgYnV0dG9ucywgYXMgdGhlIHRvb2x0aXAgc3RpY2tzIGJlaGluZCBhbmQgZmxpY2tlcnMuXG4gKiAgVGhpcyBlbnN1cmVzIHRoYXQgd2hlbiB0aGUgdXNlciBjbGlja3MgdGhlIGJ1dHRvbiwgdGhlIHRvb2x0aXAgd2lsbCBiZSBoaWRkZW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDbG9zZU9uQ2xpY2tUb29sdGlwKHByb3BzOiBUb29sdGlwUHJvcHMpIHtcbiAgY29uc3QgW3Nob3csIHNldFNob3ddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8TXVpVG9vbHRpcFxuICAgICAgb3Blbj17c2hvd31cbiAgICAgIGRpc2FibGVIb3Zlckxpc3RlbmVyXG4gICAgICBvbk1vdXNlRW50ZXI9eygpID0+IHNldFNob3codHJ1ZSl9XG4gICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHNldFNob3coZmFsc2UpfVxuICAgICAgb25Nb3VzZURvd249eygpID0+IHNldFNob3coZmFsc2UpfVxuICAgICAgey4uLnByb3BzfVxuICAgIC8+XG4gIClcbn1cblxuLyoqXG4gKiAgVGhpcyBjYW4gY2hhbmdlLCBzbyBkbyBub3Qgc3RvcmUgaXQgaW4gYSB2YXJpYWJsZSwgaW5zdGVhZCBrZWVwIGFyb3VuZCB0aGUgUm9vdCBmcm9tIGdldFJvb3QgYW5kIHJlZmluZCB0aGUgYmFzZSBpdGVtIGFzIG5lY2Vzc2FyeS5cbiAqIEBwYXJhbSBzdGFja1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3RDb2x1bW5Db250ZW50KFxuICBzdGFjazogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIHwgR29sZGVuTGF5b3V0LlRhYlxuKTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgcm9vdCA9IGdldFJvb3Qoc3RhY2spXG4gIGlmIChyb290KSB7XG4gICAgcmV0dXJuIHJvb3QuY29udGVudEl0ZW1zWzBdXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBnZXRTdGFja0luTWluaW1pemVkTG9jYXRpb24oe1xuICBnb2xkZW5MYXlvdXRSb290LFxufToge1xuICBnb2xkZW5MYXlvdXRSb290OiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbn0pOiBHb2xkZW5MYXlvdXQuQ29udGFpbmVyIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgcm9vdENvbHVtbkNvbnRlbnQgPSBnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KVxuICBpZiAocm9vdENvbHVtbkNvbnRlbnQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcm9vdENvbHVtbkNvbnRlbnQuY29udGVudEl0ZW1zW1xuICAgICAgICByb290Q29sdW1uQ29udGVudC5jb250ZW50SXRlbXMubGVuZ3RoIC0gMVxuICAgICAgXS5nZXRBY3RpdmVDb250ZW50SXRlbSgpIGFzIGFueVxuICAgICkuY29udGFpbmVyIGFzIEdvbGRlbkxheW91dC5Db250YWluZXJcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290SXNOb3RBQ29sdW1uKGdvbGRlbkxheW91dFJvb3Q6IEdvbGRlbkxheW91dC5Db250ZW50SXRlbSkge1xuICByZXR1cm4gKFxuICAgIGdldFJvb3RDb2x1bW5Db250ZW50KGdvbGRlbkxheW91dFJvb3QpICYmXG4gICAgIWdldFJvb3RDb2x1bW5Db250ZW50KGdvbGRlbkxheW91dFJvb3QpPy5pc0NvbHVtblxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290SXNFbXB0eShnb2xkZW5MYXlvdXRSb290OiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0pIHtcbiAgcmV0dXJuICFnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KVxufVxuXG4vLyB0byBhdm9pZCBmaXhpbmcgdHlwZXMgZXZlcnl3aGVyZSwgbGV0J3MgbWFrZSBhIGZ1bmN0aW9uXG5mdW5jdGlvbiBnZXRTdGFja0hlaWdodCh7XG4gIHN0YWNrLFxufToge1xuICBzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxufSkge1xuICByZXR1cm4gKHN0YWNrLmVsZW1lbnQgYXMgdW5rbm93biBhcyBHb2xkZW5MYXlvdXQuSGVhZGVyWydlbGVtZW50J10pLmhlaWdodCgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb3R0b21JdGVtKFxuICBzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxuKTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgcm9vdENvbHVtbkNvbnRlbnQgPSBnZXRSb290Q29sdW1uQ29udGVudChzdGFjaylcbiAgaWYgKHJvb3RDb2x1bW5Db250ZW50KSB7XG4gICAgcmV0dXJuIHJvb3RDb2x1bW5Db250ZW50LmNvbnRlbnRJdGVtc1tcbiAgICAgIHJvb3RDb2x1bW5Db250ZW50LmNvbnRlbnRJdGVtcy5sZW5ndGggLSAxXG4gICAgXVxuICB9XG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVN0YWNrU2l6ZShcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbikge1xuICBpZiAoc3RhY2sudGl0bGVFbGVtZW50KSB7XG4gICAgc3RhY2sgPSBzdGFjay5jb250ZW50SXRlbS5wYXJlbnQgYXMgYW55IC8vIHRoaXMgaXMgYSB0YWIsIHNvIGZpbmQgdGhlIHN0YWNrIHJlbGF0ZWQgdG8gdGhlIHRhYlxuICB9XG4gIGNvbnN0IFt3aWR0aCwgc2V0V2lkdGhdID0gUmVhY3QudXNlU3RhdGU8bnVtYmVyIHwgdW5kZWZpbmVkPihcbiAgICBzdGFjay5oZWFkZXIuZWxlbWVudC53aWR0aCgpXG4gIClcbiAgY29uc3QgW2hlaWdodCwgc2V0SGVpZ2h0XSA9IFJlYWN0LnVzZVN0YXRlPG51bWJlciB8IHVuZGVmaW5lZD4oXG4gICAgZ2V0U3RhY2tIZWlnaHQoeyBzdGFjayB9KVxuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3RhY2spIHtcbiAgICAgIGNvbnN0IHJlc2l6ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICBzZXRXaWR0aChzdGFjay5oZWFkZXIuZWxlbWVudC53aWR0aCgpKVxuICAgICAgICBzZXRIZWlnaHQoZ2V0U3RhY2tIZWlnaHQoeyBzdGFjayB9KSlcbiAgICAgIH1cbiAgICAgIHN0YWNrLm9uKCdyZXNpemUnLCByZXNpemVDYWxsYmFjaylcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHN0YWNrLm9mZigncmVzaXplJywgcmVzaXplQ2FsbGJhY2spXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fVxuICB9LCBbc3RhY2tdKVxuICByZXR1cm4geyBoZWlnaHQsIHdpZHRoIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUlzTWF4aW1pemVkKHtcbiAgc3RhY2ssXG59OiB7XG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuVGFiICYgR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IFtpc01heGltaXplZCwgc2V0SXNNYXhpbWl6ZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbWF4aW1pemVkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBzZXRJc01heGltaXplZCh0cnVlKVxuICAgIH1cbiAgICBzdGFjay5vbignbWF4aW1pc2VkJywgbWF4aW1pemVkQ2FsbGJhY2spXG4gICAgY29uc3QgbWluaW1pemVkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBzZXRJc01heGltaXplZChmYWxzZSlcbiAgICB9XG4gICAgc3RhY2sub24oJ21pbmltaXNlZCcsIG1pbmltaXplZENhbGxiYWNrKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdGFjay5vZmYoJ21heGltaXNlZCcsIG1heGltaXplZENhbGxiYWNrKVxuICAgICAgc3RhY2sub2ZmKCdtaW5pbWlzZWQnLCBtaW5pbWl6ZWRDYWxsYmFjaylcbiAgICB9XG4gIH0sIFtzdGFja10pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SXNNYXhpbWl6ZWQoc3RhY2suaXNNYXhpbWlzZWQpXG4gIH0sIFtzdGFja10pXG4gIHJldHVybiBpc01heGltaXplZFxufVxuXG4vKipcbiAqICBXaWxsIHJldHVybiBhIHNhZmUsIHVuY2hhbmdpbmcgcmVmZXJlbmNlLCBmZWVsIGZyZWUgdG8ga2VlcCBpbiBhIHZhcmlhYmxlXG4gKiBAcGFyYW0gc3RhY2tcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGdldFJvb3QoXG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0gfCBHb2xkZW5MYXlvdXQuVGFiXG4pOiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0gfCB1bmRlZmluZWQge1xuICBpZiAoIXN0YWNrKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIGNvbnN0IHN0YWNrQXNDb250ZW50SXRlbSA9IHN0YWNrIGFzIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxuICBpZiAoc3RhY2tBc0NvbnRlbnRJdGVtPy5pc1Jvb3QpIHtcbiAgICByZXR1cm4gc3RhY2tBc0NvbnRlbnRJdGVtXG4gIH1cbiAgbGV0IHBhcmVudCA9IHN0YWNrQXNDb250ZW50SXRlbS5wYXJlbnRcbiAgaWYgKHBhcmVudD8udHlwZSA9PT0gJ3Jvb3QnKSB7XG4gICAgcmV0dXJuIHBhcmVudFxuICB9IGVsc2Uge1xuICAgIHJldHVybiBnZXRSb290KHBhcmVudClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlUm9vdChzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbSkge1xuICBjb25zdCBbcm9vdCwgc2V0Um9vdF0gPSBSZWFjdC51c2VTdGF0ZShnZXRSb290KHN0YWNrKSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRSb290KGdldFJvb3Qoc3RhY2spKVxuICB9LCBbc3RhY2tdKVxuICByZXR1cm4gcm9vdFxufVxuXG4vLyBieSByZWFkeSwgd2UgbWVhbiB0aGUgc3RhY2sgdG8gYmUgbWluaW1pemVkIGlzIGFscmVhZHkgb24gdGhlIGJvdHRvbSBvZiBhIGNvbHVtbiBsYXlvdXQgPT4gYWthIHdlIGNhbiBqdXN0IHJlc2l6ZSBpdFxuZnVuY3Rpb24gbGF5b3V0SXNBbHJlYWR5UmVhZHkoe1xuICBzdGFjayxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbn0pIHtcbiAgY29uc3QgYm90dG9tSXRlbSA9IGdldEJvdHRvbUl0ZW0oc3RhY2spXG4gIGNvbnN0IGlzQm90dG9tSXRlbSA9IHN0YWNrID09PSBib3R0b21JdGVtXG4gIHJldHVybiAoXG4gICAgKGlzQm90dG9tSXRlbSAmJiBnZXRSb290Q29sdW1uQ29udGVudChzdGFjayk/LmlzQ29sdW1uKSB8fFxuICAgICghZ2V0Um9vdENvbHVtbkNvbnRlbnQoc3RhY2spPy5pc0NvbHVtbiAmJlxuICAgICAgIWdldFJvb3RDb2x1bW5Db250ZW50KHN0YWNrKT8uaXNSb3cpXG4gIClcbn1cblxuLy8gY2hlY2sgaWYgYSBtaW5pbWl6ZWQgc3RhY2sgYWxyZWFkeSBleGlzdHNcbmV4cG9ydCBmdW5jdGlvbiBsYXlvdXRBbHJlYWR5SGFzTWluaW1pemVkU3RhY2soe1xuICBzdGFjayxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbn0pIHtcbiAgY29uc3QgYm90dG9tSXRlbSA9IGdldEJvdHRvbUl0ZW0oc3RhY2spXG5cbiAgcmV0dXJuIChcbiAgICBnZXRSb290Q29sdW1uQ29udGVudChzdGFjayk/LmlzQ29sdW1uICYmXG4gICAgKGJvdHRvbUl0ZW0gYXMgYW55KS5waXhlbEhlaWdodCA8PSBNaW5pbWl6ZWRIZWlnaHRcbiAgKVxufVxuXG4vLyBhZGQgdGhlIHN0YWNrIHRvIHRoZSBleGlzdGluZyBtaW5pbWl6ZWQgc3RhY2tcbmZ1bmN0aW9uIGFkZFN0YWNrVG9FeGlzdGluZ01pbmltaXplZFN0YWNrKHtcbiAgc3RhY2ssXG59OiB7XG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuVGFiICYgR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IGJvdHRvbUl0ZW0gPSBnZXRCb3R0b21JdGVtKHN0YWNrKVxuICBpZiAoYm90dG9tSXRlbSkge1xuICAgIHN0YWNrLmNvbnRlbnRJdGVtcy5zbGljZSgpLmZvckVhY2goKHRoaW5nKSA9PiB7XG4gICAgICBzdGFjay5yZW1vdmVDaGlsZCh0aGluZyBhcyBhbnksIHRydWUpIC8vIGZvciBzb21lIHJlYXNvbiByZW1vdmVDaGlsZCBpcyBvdmVybHkgcmVzdHJpY3RpdmUgb24gdHlwZSBvZiBcInRoaW5nXCIgc28gd2UgaGF2ZSB0byBjYXN0XG4gICAgICBib3R0b21JdGVtLmFkZENoaWxkKHRoaW5nLCB1bmRlZmluZWQpXG4gICAgfSlcbiAgfVxufVxuXG4vLyB3ZSBoYXZlIHRvIG1vdmUgZWFjaCBpdGVtIGluZGl2aWR1YWxseSBiZWNhdXNlIGdvbGRlbiBsYXlvdXQgZG9lc24ndCBzdXBwb3J0IG1vdmluZyBhbiBlbnRpcmUgc3RhY2ssIGFuZCBhZGRDaGlsZCBkb2VzIG5vdCB3b3JrIGFzIGRvY3VtZW50YXRpb24gc2F5cyAoaXQgZG9lc24ndCByZW1vdmUgdGhlIGV4aXN0aW5nIGF1dG9tYXRpY2FsbHkpXG5mdW5jdGlvbiBjcmVhdGVOZXdTdGFja0Zyb21FeGlzdGluZ1N0YWNrKHtcbiAgc3RhY2ssXG59OiB7XG4gIHN0YWNrOiBHb2xkZW5MYXlvdXQuVGFiICYgR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IGV4aXN0aW5nSXRlbXMgPSBzdGFjay5jb250ZW50SXRlbXMuc2xpY2UoKVxuICBjb25zdCBuZXdTdGFja0l0ZW0gPSBzdGFjay5sYXlvdXRNYW5hZ2VyLl8kbm9ybWFsaXplQ29udGVudEl0ZW0oe1xuICAgIHR5cGU6ICdzdGFjaycsXG4gIH0pXG4gIGV4aXN0aW5nSXRlbXMuZm9yRWFjaCgodGhpbmcpID0+IHtcbiAgICBzdGFjay5yZW1vdmVDaGlsZCh0aGluZyBhcyBhbnksIHRydWUpIC8vIGZvciBzb21lIHJlYXNvbiByZW1vdmVDaGlsZCBpcyBvdmVybHkgcmVzdHJpY3RpdmUgb24gdHlwZSBvZiBcInRoaW5nXCIgc28gd2UgaGF2ZSB0byBjYXN0XG4gICAgbmV3U3RhY2tJdGVtLmFkZENoaWxkKHRoaW5nLCB1bmRlZmluZWQpXG4gIH0pXG4gIHJldHVybiBuZXdTdGFja0l0ZW1cbn1cblxuLy8gY3JlYXRlIGEgbmV3IG1pbmltaXplZCBzdGFjayBhbmQgYWRkIHRoZSBzdGFjayB0byBpdFxuZnVuY3Rpb24gY3JlYXRlQW5kQWRkTmV3TWluaW1pemVkU3RhY2soe1xuICBzdGFjayxcbiAgZ29sZGVuTGF5b3V0Um9vdCxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbiAgZ29sZGVuTGF5b3V0Um9vdDogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGNvbnN0IG5ld1N0YWNrSXRlbSA9IGNyZWF0ZU5ld1N0YWNrRnJvbUV4aXN0aW5nU3RhY2soeyBzdGFjayB9KVxuICBpZiAocm9vdElzTm90QUNvbHVtbihnb2xkZW5MYXlvdXRSb290KSkge1xuICAgIGNvbnN0IGV4aXN0aW5nUm9vdENvbnRlbnQgPSBnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KVxuICAgIGdvbGRlbkxheW91dFJvb3QucmVtb3ZlQ2hpbGQoZXhpc3RpbmdSb290Q29udGVudCBhcyBhbnksIHRydWUpIC8vIGZvciBzb21lIHJlYXNvbiByZW1vdmVDaGlsZCBpcyBvdmVybHkgcmVzdHJpY3RpdmUgb24gdHlwZSBvZiBcInRoaW5nXCIgc28gd2UgaGF2ZSB0byBjYXN0XG5cbiAgICAvLyB3ZSBuZWVkIGEgY29sdW1uIGZvciBtaW5pbWl6ZSB0byB3b3JrLCBzbyBtYWtlIGEgbmV3IGNvbHVtbiBhbmQgYWRkIHRoZSBleGlzdGluZyByb290IHRvIGl0XG4gICAgY29uc3QgbmV3Q29sdW1uSXRlbSA9IHN0YWNrLmxheW91dE1hbmFnZXIuXyRub3JtYWxpemVDb250ZW50SXRlbSh7XG4gICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICB9KVxuICAgIG5ld0NvbHVtbkl0ZW0uYWRkQ2hpbGQoZXhpc3RpbmdSb290Q29udGVudClcbiAgICBuZXdDb2x1bW5JdGVtLmFkZENoaWxkKG5ld1N0YWNrSXRlbSlcblxuICAgIGdvbGRlbkxheW91dFJvb3QuYWRkQ2hpbGQobmV3Q29sdW1uSXRlbSlcbiAgfSBlbHNlIGlmIChyb290SXNFbXB0eShnb2xkZW5MYXlvdXRSb290KSkge1xuICAgIGNvbnN0IG5ld0NvbHVtbkl0ZW0gPSBzdGFjay5sYXlvdXRNYW5hZ2VyLl8kbm9ybWFsaXplQ29udGVudEl0ZW0oe1xuICAgICAgdHlwZTogJ2NvbHVtbicsXG4gICAgfSlcbiAgICBuZXdDb2x1bW5JdGVtLmFkZENoaWxkKG5ld1N0YWNrSXRlbSlcblxuICAgIGdvbGRlbkxheW91dFJvb3QuYWRkQ2hpbGQobmV3Q29sdW1uSXRlbSlcbiAgfSBlbHNlIHtcbiAgICBnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KT8uYWRkQ2hpbGQobmV3U3RhY2tJdGVtKVxuICB9XG59XG5cbi8vIHRoZSB0cnVlIGhlaWdodCBvZiB0aGUgc3RhY2sgLSB0aGUgZ29sZGVuIGxheW91dCBpbXBsZW1lbnRhdGlvbiBhdCB0aGUgbW9tZW50IG9ubHkgdHJhY2tzIHRoZSBoZWlnaHQgb2YgdGhlIHZpc3VhbCB3aXRoaW4gdGhlIHN0YWNrLCBub3QgdGhlIHN0YWNrIGl0c2VsZlxuZnVuY3Rpb24gZ2V0VHJ1ZUhlaWdodCh7XG4gIGdvbGRlbkxheW91dFJvb3QsXG59OiB7XG4gIGdvbGRlbkxheW91dFJvb3Q6IEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxufSkge1xuICByZXR1cm4gKFxuICAgIGdldFN0YWNrSW5NaW5pbWl6ZWRMb2NhdGlvbih7IGdvbGRlbkxheW91dFJvb3QgfSk/LnBhcmVudC5wYXJlbnRcbiAgICAgIC5lbGVtZW50IGFzIHVua25vd24gYXMgR29sZGVuTGF5b3V0LkhlYWRlclsnZWxlbWVudCddXG4gICkuaGVpZ2h0KClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkanVzdFN0YWNrSW5NaW5pbWl6ZWRQbGFjZUlmTmVjZXNzYXJ5KHtcbiAgZ29sZGVuTGF5b3V0Um9vdCxcbn06IHtcbiAgZ29sZGVuTGF5b3V0Um9vdDogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtXG59KSB7XG4gIGlmIChnZXRSb290Q29sdW1uQ29udGVudChnb2xkZW5MYXlvdXRSb290KT8uaXNDb2x1bW4pIHtcbiAgICBjb25zdCB0cnVlSGVpZ2h0ID0gZ2V0VHJ1ZUhlaWdodCh7IGdvbGRlbkxheW91dFJvb3QgfSlcbiAgICBjb25zdCBtaW5pbWl6ZWRTdGFjayA9IGdldFN0YWNrSW5NaW5pbWl6ZWRMb2NhdGlvbih7IGdvbGRlbkxheW91dFJvb3QgfSlcbiAgICBpZiAobWluaW1pemVkU3RhY2spIHtcbiAgICAgIG1pbmltaXplZFN0YWNrLmhlaWdodCA9IHRydWVIZWlnaHQgfHwgbWluaW1pemVkU3RhY2suaGVpZ2h0IC8vIG90aGVyd2lzZSBzZXRTaXplIHdpbGwgbm90IHdvcmsgY29ycmVjdGx5ISAtIHRoaXMgYWxsb3dzIHVzIHRvIGNvbnNpc3RlbnRseSBhbmQgYWx3YXlzIHNldCB0aGUgaGVpZ2h0IHRvIHdoYXQgd2Ugd2FudCFcbiAgICAgIG1pbmltaXplZFN0YWNrLnNldFNpemUoMTAsIEhlYWRlckhlaWdodClcbiAgICB9XG4gIH1cbn1cblxuLy8ga2VlcCB0cmFjayBvZiBwaXhlbCBoZWlnaHQgb24gZWFjaCBzdGFjaywgd2hpY2ggYWxsb3dzIHVzIHRvIGRldGVjdCB3aGVuIGEgc3RhY2sgaXMgXCJtaW5pbWl6ZWRcIiBsYXRlciBvblxuZnVuY3Rpb24gdXNlUGl4ZWxIZWlnaHRUcmFja2luZyhcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0sXG4gIGhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkXG4pIHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3RhY2spIHtcbiAgICAgIDsoc3RhY2sgYXMgYW55KS5waXhlbEhlaWdodCA9IGhlaWdodFxuICAgIH1cbiAgfSwgW2hlaWdodCwgc3RhY2tdKVxuICBjb25zdCBnb2xkZW5MYXlvdXRSb290ID0gdXNlUm9vdChzdGFjaylcblxuICBjb25zdCBtaW5pbWl6ZUNhbGxiYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICghZ29sZGVuTGF5b3V0Um9vdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChsYXlvdXRJc0FscmVhZHlSZWFkeSh7IHN0YWNrIH0pKSB7XG4gICAgICAvLyBkbyBub3RoaW5nPyBqdXN0IHJlc2l6ZSB0byBiZSBtaW5pbWl6ZWRcbiAgICB9IGVsc2UgaWYgKGxheW91dEFscmVhZHlIYXNNaW5pbWl6ZWRTdGFjayh7IHN0YWNrIH0pKSB7XG4gICAgICAvLyBtaW5pbWl6ZWQgYXJlYSBleGlzdHMsIGFkZCB0aGlzIHRvIGl0XG4gICAgICBhZGRTdGFja1RvRXhpc3RpbmdNaW5pbWl6ZWRTdGFjayh7IHN0YWNrIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlYXJyYW5nZSBsYXlvdXQgaWYgbmVjZXNzYXJ5IGFuZCBtb3ZlIHRoZSBzdGFja1xuICAgICAgY3JlYXRlQW5kQWRkTmV3TWluaW1pemVkU3RhY2soeyBzdGFjaywgZ29sZGVuTGF5b3V0Um9vdCB9KVxuICAgIH1cbiAgICBhZGp1c3RTdGFja0luTWluaW1pemVkUGxhY2VJZk5lY2Vzc2FyeSh7IGdvbGRlbkxheW91dFJvb3QgfSlcbiAgfSwgW3N0YWNrLCBnb2xkZW5MYXlvdXRSb290XSlcblxuICByZXR1cm4geyBtaW5pbWl6ZUNhbGxiYWNrIH1cbn1cblxuZnVuY3Rpb24gdXNlQ2FuQmVNaW5pbWl6ZWQoe1xuICBzdGFjayxcbiAgaGVpZ2h0LFxuICB3aWR0aCxcbn06IHtcbiAgc3RhY2s6IEdvbGRlbkxheW91dC5UYWIgJiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1cbiAgaGVpZ2h0PzogbnVtYmVyXG4gIHdpZHRoPzogbnVtYmVyXG59KSB7XG4gIGNvbnN0IFtjYW5CZU1pbmltaXplZCwgc2V0Q2FuQmVNaW5pbWl6ZWRdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb290Q29udGVudCA9IGdldFJvb3RDb2x1bW5Db250ZW50KHN0YWNrKVxuICAgIGlmIChyb290Q29udGVudD8uaXNTdGFjaykge1xuICAgICAgc2V0Q2FuQmVNaW5pbWl6ZWQoZmFsc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldENhbkJlTWluaW1pemVkKHRydWUpXG4gICAgfVxuICB9LCBbc3RhY2ssIGhlaWdodCwgd2lkdGhdKVxuICByZXR1cm4gY2FuQmVNaW5pbWl6ZWRcbn1cblxuZXhwb3J0IGNvbnN0IFN0YWNrVG9vbGJhciA9ICh7XG4gIHN0YWNrLFxufToge1xuICBzdGFjazogR29sZGVuTGF5b3V0LlRhYiAmIEdvbGRlbkxheW91dC5Db250ZW50SXRlbVxufSkgPT4ge1xuICBjb25zdCBpc01heGltaXplZCA9IHVzZUlzTWF4aW1pemVkKHsgc3RhY2sgfSlcbiAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSB1c2VTdGFja1NpemUoc3RhY2spXG4gIGNvbnN0IHsgbWluaW1pemVDYWxsYmFjayB9ID0gdXNlUGl4ZWxIZWlnaHRUcmFja2luZyhzdGFjaywgaGVpZ2h0KVxuICBjb25zdCBjYW5CZU1pbmltaXplZCA9IHVzZUNhbkJlTWluaW1pemVkKHsgc3RhY2ssIHdpZHRoLCBoZWlnaHQgfSlcbiAgY29uc3QgaXNNaW5pbWl6ZWQgPSBoZWlnaHQgJiYgaGVpZ2h0IDw9IE1pbmltaXplZEhlaWdodFxuICByZXR1cm4gKFxuICAgIDxFeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGZsZXgtbm93cmFwIGl0ZW1zLWNlbnRlclwiPlxuICAgICAgICA8PlxuICAgICAgICAgIHtpc01heGltaXplZCB8fCBpc01pbmltaXplZCB8fCAhY2FuQmVNaW5pbWl6ZWQgPyAoXG4gICAgICAgICAgICA8PjwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8Q2xvc2VPbkNsaWNrVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMVwiPlxuICAgICAgICAgICAgICAgICAgICBNaW5pbWl6ZSBzdGFjayBvZiB2aXN1YWxzIHRvIGJvdHRvbSBvZiBsYXlvdXRcbiAgICAgICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cIm1pbmltaXNlLWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17bWluaW1pemVDYWxsYmFja31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8TWluaW1pemVJY29uIGZvbnRTaXplPVwic21hbGxcIiAvPlxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L0Nsb3NlT25DbGlja1Rvb2x0aXA+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtpc01heGltaXplZCA/IChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxDbG9zZU9uQ2xpY2tUb29sdGlwXG4gICAgICAgICAgICAgICAgdGl0bGU9e1xuICAgICAgICAgICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30gY2xhc3NOYW1lPVwicC0xXCI+XG4gICAgICAgICAgICAgICAgICAgIFJlc3RvcmUgc3RhY2sgb2YgdmlzdWFscyB0byBvcmlnaW5hbCBzaXplXG4gICAgICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCJ1bm1heGltaXNlLWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay50b2dnbGVNYXhpbWlzZSgpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxGdWxsc2NyZWVuRXhpdEljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvQ2xvc2VPbkNsaWNrVG9vbHRpcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8Q2xvc2VPbkNsaWNrVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMVwiPlxuICAgICAgICAgICAgICAgICAgICBNYXhpbWl6ZSBzdGFjayBvZiB2aXN1YWxzXG4gICAgICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCJtYXhpbWlzZS1sYXlvdXQtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sudG9nZ2xlTWF4aW1pc2UoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8RnVsbHNjcmVlbkljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvQ2xvc2VPbkNsaWNrVG9vbHRpcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7c3RhY2subGF5b3V0TWFuYWdlci5pc1N1YldpbmRvdyA/IG51bGwgOiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8Q2xvc2VPbkNsaWNrVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMVwiPlxuICAgICAgICAgICAgICAgICAgICBPcGVuIHN0YWNrIG9mIHZpc3VhbHMgaW4gbmV3IHdpbmRvd1xuICAgICAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICBkYXRhLWlkPVwicG9wb3V0LWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wb3BvdXQoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8UG9wb3V0SWNvbiBmb250U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9DbG9zZU9uQ2xpY2tUb29sdGlwPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICB7KHN0YWNrLmhlYWRlciBhcyBhbnkpLl9pc0Nsb3NhYmxlKCkgPyAoXG4gICAgICAgICAgICAgIDxDbG9zZU9uQ2xpY2tUb29sdGlwXG4gICAgICAgICAgICAgICAgdGl0bGU9e1xuICAgICAgICAgICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30gY2xhc3NOYW1lPVwicC0xXCI+XG4gICAgICAgICAgICAgICAgICAgIENsb3NlIHN0YWNrIG9mIHZpc3VhbHNcbiAgICAgICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cImNsb3NlLWxheW91dC1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhY2suaXNNYXhpbWlzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdGFjay50b2dnbGVNYXhpbWlzZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPENsb3NlSWNvbiBmb250U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9DbG9zZU9uQ2xpY2tUb29sdGlwPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvPlxuICAgICAgPC9kaXY+XG4gICAgPC9FeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICApXG59XG4iXX0=