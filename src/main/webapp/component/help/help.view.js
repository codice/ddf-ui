import { __assign, __read } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react';
import { hot } from 'react-hot-loader';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import { useMenuState, useRerenderingRef } from '../menu-state/menu-state';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import _ from 'underscore';
import $ from 'jquery';
var zeroScale = 'matrix(0, 0, 0, 0, 0, 0)';
var zeroOpacity = '0';
// zeroScale to specifically to account for IE Edge Bug, see http://codepen.io/andrewkfiedler/pen/apBbxq
// zeroOpacity to account for how browsers work
function isEffectivelyHidden(element) {
    if (element === document) {
        return false;
    }
    else {
        var computedStyle = window.getComputedStyle(element);
        if (computedStyle.transform === zeroScale ||
            computedStyle.opacity === zeroOpacity) {
            return true;
        }
        else {
            return isEffectivelyHidden(element.parentNode);
        }
    }
}
// it'd be nice if we can use offsetParent directly, but that would require devs to be aware of how help.view works
function isOffsetParent(element) {
    return window.getComputedStyle(element).overflow !== 'visible';
}
function traverseAncestors(element, compareValue, extractValue) {
    var value = extractValue(element);
    element = element.parentNode;
    while (element !== null && element !== document) {
        if (isOffsetParent(element)) {
            value = compareValue(value, extractValue(element));
        }
        element = element.parentNode;
    }
    return value;
}
function findHighestAncestorTop(element) {
    return traverseAncestors(element, function (currentTop, proposedTop) { return Math.max(currentTop, proposedTop); }, function (element) { return element.getBoundingClientRect().top; });
}
function findHighestAncestorLeft(element) {
    return traverseAncestors(element, function (currentLeft, proposedLeft) {
        return Math.max(currentLeft, proposedLeft);
    }, function (element) { return element.getBoundingClientRect().left; });
}
function findLowestAncestorBottom(element) {
    return traverseAncestors(element, function (currentBottom, proposedBottom) {
        return Math.min(currentBottom, proposedBottom);
    }, function (element) { return element.getBoundingClientRect().bottom; });
}
function findLowestAncestorRight(element) {
    return traverseAncestors(element, function (currentRight, proposedRight) {
        return Math.min(currentRight, proposedRight);
    }, function (element) { return element.getBoundingClientRect().right; });
}
function findBlockers() {
    var blockingElements = $('.is-blocker');
    return _.map(blockingElements, function (blockingElement) { return ({
        boundingRect: blockingElement.getBoundingClientRect(),
        element: blockingElement,
    }); });
}
function isBlocked(element, boundingRect) {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(blocker: any) => true | undefin... Remove this comment to see the full error message
    return _.some(findBlockers(), function (blocker) {
        if (blocker.element !== element &&
            $(blocker.element).find(element).length === 0) {
            var top_1 = Math.max(blocker.boundingRect.top, boundingRect.top);
            var bottom = Math.min(blocker.boundingRect.bottom, boundingRect.bottom);
            var left = Math.max(blocker.boundingRect.left, boundingRect.left);
            var right = Math.min(blocker.boundingRect.right, boundingRect.right);
            var height = bottom - top_1;
            var width = right - left;
            if (height > 0 && width > 0) {
                return true;
            }
        }
    });
}
var animationFrameId = -1;
var paintHint = function (element) {
    if (isEffectivelyHidden(element)) {
        return undefined;
    }
    var boundingRect = element.getBoundingClientRect();
    var top = Math.max(findHighestAncestorTop(element), boundingRect.top);
    var bottom = Math.min(findLowestAncestorBottom(element), boundingRect.bottom);
    var left = Math.max(findHighestAncestorLeft(element), boundingRect.left);
    var right = Math.min(findLowestAncestorRight(element), boundingRect.right);
    var height = bottom - top;
    var width = right - left;
    if (boundingRect.width > 0 &&
        height > 0 &&
        width > 0 &&
        !isBlocked(element, {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
        })) {
        return {
            height: height,
            width: width,
            top: top,
            left: left,
            text: element.getAttribute('data-help') || '',
            id: Math.random().toString(),
        };
    }
    return undefined;
};
var startPaintingHints = function ($elementsWithHints, attachElement, setPaintedHints) {
    window.cancelAnimationFrame(animationFrameId);
    paintHints($elementsWithHints, attachElement, [], setPaintedHints);
};
var paintHints = function ($elementsWithHints, attachElement, paintedHints, setPaintedHints) {
    animationFrameId = window.requestAnimationFrame(function () {
        var elements = $elementsWithHints.splice(0, 4);
        if (elements.length > 0) {
            var newHints = elements
                .map(function (element) {
                return paintHint(element);
            })
                .filter(function (hint) { return hint !== undefined; });
            var combinedValue = paintedHints.concat(newHints);
            setPaintedHints(combinedValue);
            paintHints($elementsWithHints, attachElement, combinedValue, setPaintedHints);
        }
    });
};
var useCloseOnTyping = function (_a) {
    var showHints = _a.showHints, setShowHints = _a.setShowHints;
    React.useEffect(function () {
        var id = Math.random();
        $(window).on("keydown.".concat(id), function (event) {
            var code = event.keyCode;
            if (event.charCode && code == 0)
                code = event.charCode;
            switch (code) {
                case 27:
                    // Escape
                    setShowHints(false);
                    break;
                default:
                    break;
            }
        });
        return function () {
            $(window).off("keydown.".concat(id));
        };
    }, [showHints]);
};
var useRerenderOnResize = function () {
    var _a = __read(React.useState(Math.random()), 2), resizeRerender = _a[0], setResizeRerender = _a[1];
    React.useEffect(function () {
        var id = Math.random();
        $(window).on("resize.".concat(id), _.debounce(function () {
            setResizeRerender(Math.random());
        }, 1000));
        return function () {
            $(window).off("resize.".concat(id));
        };
    }, []);
    return resizeRerender;
};
var usePaintHints = function (_a) {
    var showHints = _a.showHints, attachElement = _a.attachElement, setPaintedHints = _a.setPaintedHints;
    var resizeRerender = useRerenderOnResize();
    React.useEffect(function () {
        if (showHints && attachElement) {
            var $elementsWithHints = $('[data-help]').not('.is-hidden [data-help]');
            // @ts-expect-error ts-migrate(2740) FIXME: Type 'HTMLElement[]' is missing the following prop... Remove this comment to see the full error message
            $elementsWithHints = _.shuffle($elementsWithHints);
            startPaintingHints($elementsWithHints, attachElement, setPaintedHints);
        }
    }, [showHints, attachElement, resizeRerender]);
};
var HintsComponent = function () {
    var location = useLocation();
    var history = useHistory();
    var _a = __read(React.useState(false), 2), showHints = _a[0], setShowHints = _a[1];
    var _b = __read(React.useState([]), 2), paintedHints = _b[0], setPaintedHints = _b[1];
    var attachRef = useRerenderingRef();
    var queryParams = queryString.parse(location.search);
    React.useEffect(function () {
        var openHelp = Boolean(queryParams['global-help']);
        if (openHelp) {
            setShowHints(true);
        }
        else {
            setShowHints(false);
        }
    });
    React.useEffect(function () {
        if (!showHints) {
            window.cancelAnimationFrame(animationFrameId);
            delete queryParams['global-help'];
            history.push({
                pathname: location.pathname,
                search: "".concat(queryString.stringify(__assign({}, queryParams))),
            });
        }
    }, [showHints]);
    usePaintHints({
        showHints: showHints,
        attachElement: attachRef.current,
        setPaintedHints: setPaintedHints,
    });
    useCloseOnTyping({ showHints: showHints, setShowHints: setShowHints });
    if (!showHints) {
        return null;
    }
    return (React.createElement("div", { className: "help-component is-shown fixed left-0 top-0 h-full w-full bg-black opacity-50 z-50", onClick: function () {
            setShowHints(false);
        } },
        React.createElement("div", { className: "help-hints", ref: attachRef.ref }, paintedHints.map(function (paintedHint) {
            return React.createElement(PaintedHint, __assign({ key: paintedHint.id }, paintedHint));
        })),
        React.createElement(UntoggleElement, { setShowHints: setShowHints })));
};
var UntoggleElement = function (_a) {
    var setShowHints = _a.setShowHints;
    var _b = __read(React.useState(), 2), state = _b[0], setState = _b[1];
    var resizeRerender = useRerenderOnResize();
    React.useEffect(function () {
        var untoggleElement = document.querySelector('[data-id=sidebar-help-button]');
        if (untoggleElement) {
            setState(untoggleElement.getBoundingClientRect());
        }
    }, [resizeRerender]);
    if (state === undefined) {
        return null;
    }
    var width = state.width, height = state.height, top = state.top, left = state.left;
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                setShowHints(false);
            }, className: "absolute ", style: {
                width: width,
                height: height,
                top: top,
                left: left,
                opacity: '.5',
            } })));
};
var PaintedHint = function (_a) {
    var width = _a.width, height = _a.height, top = _a.top, left = _a.left, text = _a.text;
    var menuState = useMenuState();
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({ className: "absolute painted-hint", style: {
                width: width,
                height: height,
                top: top,
                left: left,
                opacity: '0.5',
            }, variant: "contained", color: "primary" }, menuState.MuiButtonProps, { onClick: function (e) {
                e.stopPropagation();
                menuState.handleClick();
            } })),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps, { onClick: function (e) {
                e.stopPropagation();
                menuState.handleClose();
            } }),
            React.createElement(Paper, { elevation: Elevations.overlays, onClick: function (e) {
                    e.stopPropagation();
                }, className: "p-2" }, text))));
};
export default hot(module)(HintsComponent);
//# sourceMappingURL=help.view.js.map