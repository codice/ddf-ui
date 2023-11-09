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
//# sourceMappingURL=stack-toolbar.js.map