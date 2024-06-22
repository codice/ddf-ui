import { __assign, __read } from "tslib";
import React from 'react';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import PopoutIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import ExtensionPoints from '../../extension-points/extension-points';
import { CloseOnClickTooltip, MinimizedHeight, adjustStackInMinimizedPlaceIfNecessary, getBottomItem, getRootColumnContent, layoutAlreadyHasMinimizedStack, rootIsEmpty, rootIsNotAColumn, useIsMaximized, useRoot, useStackSize, } from './stack-toolbar';
import { Grid } from '@mui/material';
import _ from 'underscore';
function useStackRelatedToTab(tab) {
    var _a = __read(React.useState(tab.contentItem.parent), 2), stack = _a[0], setStack = _a[1];
    React.useEffect(function () {
        setStack(tab.contentItem.parent);
    }, [tab]);
    return stack;
}
// add the tab to the existing minimized stack
function addTabToExistingMinimizedStack(_a) {
    var tab = _a.tab, stack = _a.stack;
    var bottomItem = getBottomItem(stack);
    if (bottomItem) {
        stack.removeChild(tab.contentItem, true); // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
        bottomItem.addChild(tab.contentItem, undefined);
    }
}
// we have to move each item individually because golden layout doesn't support moving an entire stack, and addChild does not work as documentation says (it doesn't remove the existing automatically)
function createNewStackFromExistingTab(_a) {
    var tab = _a.tab, stack = _a.stack;
    var existingItem = tab.contentItem;
    var newStackItem = stack.layoutManager._$normalizeContentItem({
        type: 'stack',
    });
    stack.removeChild(existingItem, true); // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
    newStackItem.addChild(existingItem, undefined);
    return newStackItem;
}
function createAndAddNewMinimizedStackForTab(_a) {
    var _b;
    var tab = _a.tab, stack = _a.stack, goldenLayoutRoot = _a.goldenLayoutRoot;
    var newStackItem = createNewStackFromExistingTab({ stack: stack, tab: tab });
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
// keep track of pixel height on each stack, which allows us to detect when a stack is "minimized" later on
function usePixelHeightTrackingForTab(tab, stack, height) {
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
        if (layoutAlreadyHasMinimizedStack({ stack: stack })) {
            // minimized area exists, add this to it
            addTabToExistingMinimizedStack({ tab: tab, stack: stack });
        }
        else {
            // rearrange layout if necessary and move the stack
            createAndAddNewMinimizedStackForTab({ tab: tab, stack: stack, goldenLayoutRoot: goldenLayoutRoot });
        }
        adjustStackInMinimizedPlaceIfNecessary({ goldenLayoutRoot: goldenLayoutRoot });
    }, [stack, goldenLayoutRoot]);
    return { minimizeCallback: minimizeCallback };
}
function useCanBeMinimizedTab(_a) {
    var stack = _a.stack, height = _a.height, width = _a.width;
    var _b = __read(React.useState(stack.contentItems.length), 2), itemCount = _b[0], setItemCount = _b[1];
    var _c = __read(React.useState(true), 2), canBeMinimized = _c[0], setCanBeMinimized = _c[1];
    React.useEffect(function () {
        var rootContent = getRootColumnContent(stack);
        if ((rootContent === null || rootContent === void 0 ? void 0 : rootContent.isStack) && (rootContent === null || rootContent === void 0 ? void 0 : rootContent.contentItems.length) === 1) {
            setCanBeMinimized(false);
        }
        else {
            setCanBeMinimized(true);
        }
    }, [stack, height, width, itemCount]);
    React.useEffect(function () {
        if (stack) {
            var callback_1 = function () {
                setItemCount(stack.contentItems.length);
            };
            stack.on('itemCreated', callback_1);
            stack.on('itemDestroyed', callback_1);
            return function () {
                stack.off('itemCreated', callback_1);
                stack.off('itemDestroyed', callback_1);
            };
        }
        return function () { };
    }, [stack]);
    return canBeMinimized;
}
export var GoldenLayoutComponentHeader = function (_a) {
    var viz = _a.viz, tab = _a.tab, options = _a.options, componentState = _a.componentState, container = _a.container, name = _a.name;
    var relatedStack = useStackRelatedToTab(tab);
    var _b = useStackSize(relatedStack), height = _b.height, width = _b.width;
    var minimizeCallback = usePixelHeightTrackingForTab(tab, relatedStack, height).minimizeCallback;
    var canBeMinimized = useCanBeMinimizedTab({
        stack: relatedStack,
        width: width,
        height: height,
    });
    var isMaximized = useIsMaximized({ stack: relatedStack });
    var isMinimized = height && height <= MinimizedHeight;
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement("div", { "data-id": "".concat(name, "-tab"), className: "flex flex-row items-center flex-nowrap" },
            React.createElement(Grid, { item: true, className: "px-1 text-base" },
                React.createElement("div", null, tab.titleElement.text())),
            React.createElement(Grid, { item: true }, viz.header ? (React.createElement(viz.header, __assign({}, _.extend({}, options, componentState, {
                container: container,
            })))) : null),
            isMinimized || isMaximized || !canBeMinimized ? (React.createElement(React.Fragment, null)) : (React.createElement(Grid, { item: true },
                React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Minimize visual to bottom of layout") },
                    React.createElement(Button, { onClick: minimizeCallback },
                        React.createElement(MinimizeIcon, { fontSize: "small" }))))),
            React.createElement(Grid, { item: true }, !tab.contentItem.layoutManager.isSubWindow &&
                tab.closeElement[0].style.display !== 'none' ? (React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Open visual in new window") },
                React.createElement(Button, { "data-id": "popout-tab-button", onClick: function () {
                        tab.contentItem.popout();
                    } },
                    React.createElement(PopoutIcon, { fontSize: "small" })))) : null),
            React.createElement(Grid, { item: true }, tab.closeElement[0].style.display !== 'none' ? (React.createElement(CloseOnClickTooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-1" }, "Close visual") },
                React.createElement(Button, { "data-id": "close-tab-button", onClick: function (e) {
                        ;
                        tab._onCloseClickFn(e);
                    } },
                    React.createElement(CloseIcon, { fontSize: "small" })))) : null))));
};
//# sourceMappingURL=visual-toolbar.js.map