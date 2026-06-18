import { __assign, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import queryString from 'query-string';
import { useNavigate, useLocation } from 'react-router-dom';
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
    var navigate = useNavigate();
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
            navigate({
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
    return (_jsxs("div", { className: "help-component is-shown fixed left-0 top-0 h-full w-full bg-black opacity-50 z-50", onClick: function () {
            setShowHints(false);
        }, children: [_jsx("div", { className: "help-hints", ref: attachRef.ref, children: paintedHints.map(function (paintedHint) {
                    return _jsx(PaintedHint, __assign({}, paintedHint), paintedHint.id);
                }) }), _jsx(UntoggleElement, { setShowHints: setShowHints })] }));
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
    return (_jsx(_Fragment, { children: _jsx(Button, { variant: "contained", color: "primary", onClick: function () {
                setShowHints(false);
            }, className: "absolute ", style: {
                width: width,
                height: height,
                top: top,
                left: left,
                opacity: '.5',
            } }) }));
};
var PaintedHint = function (_a) {
    var width = _a.width, height = _a.height, top = _a.top, left = _a.left, text = _a.text;
    var menuState = useMenuState();
    return (_jsxs(_Fragment, { children: [_jsx(Button, __assign({ className: "absolute painted-hint", style: {
                    width: width,
                    height: height,
                    top: top,
                    left: left,
                    opacity: '0.5',
                }, variant: "contained", color: "primary" }, menuState.MuiButtonProps, { onClick: function (e) {
                    e.stopPropagation();
                    menuState.handleClick();
                } })), _jsx(Popover, __assign({}, menuState.MuiPopoverProps, { onClick: function (e) {
                    e.stopPropagation();
                    menuState.handleClose();
                }, children: _jsx(Paper, { elevation: Elevations.overlays, onClick: function (e) {
                        e.stopPropagation();
                    }, className: "p-2", children: text }) }))] }));
};
export default HintsComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9oZWxwL2hlbHAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDM0QsT0FBTyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQzFFLE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMzQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBRXRCLElBQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFBO0FBQzVDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQTtBQUV2Qix3R0FBd0c7QUFDeEcsK0NBQStDO0FBQy9DLFNBQVMsbUJBQW1CLENBQUMsT0FBWTtJQUN2QyxJQUFJLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN6QixPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RELElBQ0UsYUFBYSxDQUFDLFNBQVMsS0FBSyxTQUFTO1lBQ3JDLGFBQWEsQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUNyQyxDQUFDO1lBQ0QsT0FBTyxJQUFJLENB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RUQsS0FBQyxLQUFLLElBQ0osU0FBUyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQzlCLE9BQU8sRUFBRSxVQUFDLENBQUM7d0JBQ1QsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFBO29CQUNyQixDQUFDLEVBQ0QsU0FBUyxFQUFDLEtBQUssWUFFZCxJQUFJLEdBQ0MsSUFDQSxJQUNULENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsY0FBYyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZydcbmltcG9ydCB7IHVzZU5hdmlnYXRlLCB1c2VMb2NhdGlvbiB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgeyB1c2VNZW51U3RhdGUsIHVzZVJlcmVuZGVyaW5nUmVmIH0gZnJvbSAnLi4vbWVudS1zdGF0ZS9tZW51LXN0YXRlJ1xuaW1wb3J0IFBvcG92ZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcblxuY29uc3QgemVyb1NjYWxlID0gJ21hdHJpeCgwLCAwLCAwLCAwLCAwLCAwKSdcbmNvbnN0IHplcm9PcGFjaXR5ID0gJzAnXG5cbi8vIHplcm9TY2FsZSB0byBzcGVjaWZpY2FsbHkgdG8gYWNjb3VudCBmb3IgSUUgRWRnZSBCdWcsIHNlZSBodHRwOi8vY29kZXBlbi5pby9hbmRyZXdrZmllZGxlci9wZW4vYXBCYnhxXG4vLyB6ZXJvT3BhY2l0eSB0byBhY2NvdW50IGZvciBob3cgYnJvd3NlcnMgd29ya1xuZnVuY3Rpb24gaXNFZmZlY3RpdmVseUhpZGRlbihlbGVtZW50OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpXG4gICAgaWYgKFxuICAgICAgY29tcHV0ZWRTdHlsZS50cmFuc2Zvcm0gPT09IHplcm9TY2FsZSB8fFxuICAgICAgY29tcHV0ZWRTdHlsZS5vcGFjaXR5ID09PSB6ZXJvT3BhY2l0eVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlzRWZmZWN0aXZlbHlIaWRkZW4oZWxlbWVudC5wYXJlbnROb2RlKVxuICAgIH1cbiAgfVxufVxuXG4vLyBpdCdkIGJlIG5pY2UgaWYgd2UgY2FuIHVzZSBvZmZzZXRQYXJlbnQgZGlyZWN0bHksIGJ1dCB0aGF0IHdvdWxkIHJlcXVpcmUgZGV2cyB0byBiZSBhd2FyZSBvZiBob3cgaGVscC52aWV3IHdvcmtzXG5mdW5jdGlvbiBpc09mZnNldFBhcmVudChlbGVtZW50OiBhbnkpIHtcbiAgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLm92ZXJmbG93ICE9PSAndmlzaWJsZSdcbn1cblxuZnVuY3Rpb24gdHJhdmVyc2VBbmNlc3RvcnMoZWxlbWVudDogYW55LCBjb21wYXJlVmFsdWU6IGFueSwgZXh0cmFjdFZhbHVlOiBhbnkpIHtcbiAgbGV0IHZhbHVlID0gZXh0cmFjdFZhbHVlKGVsZW1lbnQpXG4gIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgd2hpbGUgKGVsZW1lbnQgIT09IG51bGwgJiYgZWxlbWVudCAhPT0gZG9jdW1lbnQpIHtcbiAgICBpZiAoaXNPZmZzZXRQYXJlbnQoZWxlbWVudCkpIHtcbiAgICAgIHZhbHVlID0gY29tcGFyZVZhbHVlKHZhbHVlLCBleHRyYWN0VmFsdWUoZWxlbWVudCkpXG4gICAgfVxuICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuZnVuY3Rpb24gZmluZEhpZ2hlc3RBbmNlc3RvclRvcChlbGVtZW50OiBhbnkpIHtcbiAgcmV0dXJuIHRyYXZlcnNlQW5jZXN0b3JzKFxuICAgIGVsZW1lbnQsXG4gICAgKGN1cnJlbnRUb3A6IGFueSwgcHJvcG9zZWRUb3A6IGFueSkgPT4gTWF0aC5tYXgoY3VycmVudFRvcCwgcHJvcG9zZWRUb3ApLFxuICAgIChlbGVtZW50OiBhbnkpID0+IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gIClcbn1cblxuZnVuY3Rpb24gZmluZEhpZ2hlc3RBbmNlc3RvckxlZnQoZWxlbWVudDogYW55KSB7XG4gIHJldHVybiB0cmF2ZXJzZUFuY2VzdG9ycyhcbiAgICBlbGVtZW50LFxuICAgIChjdXJyZW50TGVmdDogYW55LCBwcm9wb3NlZExlZnQ6IGFueSkgPT5cbiAgICAgIE1hdGgubWF4KGN1cnJlbnRMZWZ0LCBwcm9wb3NlZExlZnQpLFxuICAgIChlbGVtZW50OiBhbnkpID0+IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdFxuICApXG59XG5cbmZ1bmN0aW9uIGZpbmRMb3dlc3RBbmNlc3RvckJvdHRvbShlbGVtZW50OiBhbnkpIHtcbiAgcmV0dXJuIHRyYXZlcnNlQW5jZXN0b3JzKFxuICAgIGVsZW1lbnQsXG4gICAgKGN1cnJlbnRCb3R0b206IGFueSwgcHJvcG9zZWRCb3R0b206IGFueSkgPT5cbiAgICAgIE1hdGgubWluKGN1cnJlbnRCb3R0b20sIHByb3Bvc2VkQm90dG9tKSxcbiAgICAoZWxlbWVudDogYW55KSA9PiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbVxuICApXG59XG5cbmZ1bmN0aW9uIGZpbmRMb3dlc3RBbmNlc3RvclJpZ2h0KGVsZW1lbnQ6IGFueSkge1xuICByZXR1cm4gdHJhdmVyc2VBbmNlc3RvcnMoXG4gICAgZWxlbWVudCxcbiAgICAoY3VycmVudFJpZ2h0OiBhbnksIHByb3Bvc2VkUmlnaHQ6IGFueSkgPT5cbiAgICAgIE1hdGgubWluKGN1cnJlbnRSaWdodCwgcHJvcG9zZWRSaWdodCksXG4gICAgKGVsZW1lbnQ6IGFueSkgPT4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodFxuICApXG59XG5cbmZ1bmN0aW9uIGZpbmRCbG9ja2VycygpIHtcbiAgY29uc3QgYmxvY2tpbmdFbGVtZW50cyA9ICQoJy5pcy1ibG9ja2VyJylcbiAgcmV0dXJuIF8ubWFwKGJsb2NraW5nRWxlbWVudHMsIChibG9ja2luZ0VsZW1lbnQ6IGFueSkgPT4gKHtcbiAgICBib3VuZGluZ1JlY3Q6IGJsb2NraW5nRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICBlbGVtZW50OiBibG9ja2luZ0VsZW1lbnQsXG4gIH0pKVxufVxuXG5mdW5jdGlvbiBpc0Jsb2NrZWQoZWxlbWVudDogYW55LCBib3VuZGluZ1JlY3Q6IGFueSkge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJyhibG9ja2VyOiBhbnkpID0+IHRydWUgfCB1bmRlZmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgcmV0dXJuIF8uc29tZShmaW5kQmxvY2tlcnMoKSwgKGJsb2NrZXI6IGFueSkgPT4ge1xuICAgIGlmIChcbiAgICAgIGJsb2NrZXIuZWxlbWVudCAhPT0gZWxlbWVudCAmJlxuICAgICAgJChibG9ja2VyLmVsZW1lbnQpLmZpbmQoZWxlbWVudCkubGVuZ3RoID09PSAwXG4gICAgKSB7XG4gICAgICBjb25zdCB0b3AgPSBNYXRoLm1heChibG9ja2VyLmJvdW5kaW5nUmVjdC50b3AsIGJvdW5kaW5nUmVjdC50b3ApXG4gICAgICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihibG9ja2VyLmJvdW5kaW5nUmVjdC5ib3R0b20sIGJvdW5kaW5nUmVjdC5ib3R0b20pXG4gICAgICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgoYmxvY2tlci5ib3VuZGluZ1JlY3QubGVmdCwgYm91bmRpbmdSZWN0LmxlZnQpXG4gICAgICBjb25zdCByaWdodCA9IE1hdGgubWluKGJsb2NrZXIuYm91bmRpbmdSZWN0LnJpZ2h0LCBib3VuZGluZ1JlY3QucmlnaHQpXG4gICAgICBjb25zdCBoZWlnaHQgPSBib3R0b20gLSB0b3BcbiAgICAgIGNvbnN0IHdpZHRoID0gcmlnaHQgLSBsZWZ0XG4gICAgICBpZiAoaGVpZ2h0ID4gMCAmJiB3aWR0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmxldCBhbmltYXRpb25GcmFtZUlkID0gLTFcblxuY29uc3QgcGFpbnRIaW50ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogUGFpbnRlZEhpbnRUeXBlIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKGlzRWZmZWN0aXZlbHlIaWRkZW4oZWxlbWVudCkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbiAgY29uc3QgYm91bmRpbmdSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChmaW5kSGlnaGVzdEFuY2VzdG9yVG9wKGVsZW1lbnQpLCBib3VuZGluZ1JlY3QudG9wKVxuICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihcbiAgICBmaW5kTG93ZXN0QW5jZXN0b3JCb3R0b20oZWxlbWVudCksXG4gICAgYm91bmRpbmdSZWN0LmJvdHRvbVxuICApXG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChmaW5kSGlnaGVzdEFuY2VzdG9yTGVmdChlbGVtZW50KSwgYm91bmRpbmdSZWN0LmxlZnQpXG4gIGNvbnN0IHJpZ2h0ID0gTWF0aC5taW4oZmluZExvd2VzdEFuY2VzdG9yUmlnaHQoZWxlbWVudCksIGJvdW5kaW5nUmVjdC5yaWdodClcbiAgY29uc3QgaGVpZ2h0ID0gYm90dG9tIC0gdG9wXG4gIGNvbnN0IHdpZHRoID0gcmlnaHQgLSBsZWZ0XG4gIGlmIChcbiAgICBib3VuZGluZ1JlY3Qud2lkdGggPiAwICYmXG4gICAgaGVpZ2h0ID4gMCAmJlxuICAgIHdpZHRoID4gMCAmJlxuICAgICFpc0Jsb2NrZWQoZWxlbWVudCwge1xuICAgICAgdG9wLFxuICAgICAgYm90dG9tLFxuICAgICAgbGVmdCxcbiAgICAgIHJpZ2h0LFxuICAgIH0pXG4gICkge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQsXG4gICAgICB3aWR0aCxcbiAgICAgIHRvcCxcbiAgICAgIGxlZnQsXG4gICAgICB0ZXh0OiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1oZWxwJykgfHwgJycsXG4gICAgICBpZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygpLFxuICAgIH1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmNvbnN0IHN0YXJ0UGFpbnRpbmdIaW50cyA9IChcbiAgJGVsZW1lbnRzV2l0aEhpbnRzOiBhbnksXG4gIGF0dGFjaEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50LFxuICBzZXRQYWludGVkSGludHM6IChoaW50czogUGFpbnRlZEhpbnRUeXBlW10pID0+IHZvaWRcbikgPT4ge1xuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWVJZClcbiAgcGFpbnRIaW50cygkZWxlbWVudHNXaXRoSGludHMsIGF0dGFjaEVsZW1lbnQsIFtdLCBzZXRQYWludGVkSGludHMpXG59XG5cbmNvbnN0IHBhaW50SGludHMgPSAoXG4gICRlbGVtZW50c1dpdGhIaW50czogYW55LFxuICBhdHRhY2hFbGVtZW50OiBIVE1MRGl2RWxlbWVudCxcbiAgcGFpbnRlZEhpbnRzOiBQYWludGVkSGludFR5cGVbXSxcbiAgc2V0UGFpbnRlZEhpbnRzOiAocGFpbnRlZEhpbnRzOiBQYWludGVkSGludFR5cGVbXSkgPT4gdm9pZFxuKSA9PiB7XG4gIGFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBlbGVtZW50cyA9ICRlbGVtZW50c1dpdGhIaW50cy5zcGxpY2UoMCwgNCkgYXMgdW5rbm93biBhcyBIVE1MRWxlbWVudFtdXG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld0hpbnRzID0gZWxlbWVudHNcbiAgICAgICAgLm1hcCgoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcGFpbnRIaW50KGVsZW1lbnQpXG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoKGhpbnQpID0+IGhpbnQgIT09IHVuZGVmaW5lZCkgYXMgUGFpbnRlZEhpbnRUeXBlW11cbiAgICAgIGNvbnN0IGNvbWJpbmVkVmFsdWUgPSBwYWludGVkSGludHMuY29uY2F0KG5ld0hpbnRzKVxuICAgICAgc2V0UGFpbnRlZEhpbnRzKGNvbWJpbmVkVmFsdWUpXG4gICAgICBwYWludEhpbnRzKFxuICAgICAgICAkZWxlbWVudHNXaXRoSGludHMsXG4gICAgICAgIGF0dGFjaEVsZW1lbnQsXG4gICAgICAgIGNvbWJpbmVkVmFsdWUsXG4gICAgICAgIHNldFBhaW50ZWRIaW50c1xuICAgICAgKVxuICAgIH1cbiAgfSlcbn1cblxuY29uc3QgdXNlQ2xvc2VPblR5cGluZyA9ICh7XG4gIHNob3dIaW50cyxcbiAgc2V0U2hvd0hpbnRzLFxufToge1xuICBzaG93SGludHM6IGJvb2xlYW5cbiAgc2V0U2hvd0hpbnRzOiAodmFsdWU6IGJvb2xlYW4pID0+IHZvaWRcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpZCA9IE1hdGgucmFuZG9tKClcbiAgICAkKHdpbmRvdykub24oYGtleWRvd24uJHtpZH1gLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgbGV0IGNvZGUgPSBldmVudC5rZXlDb2RlXG4gICAgICBpZiAoZXZlbnQuY2hhckNvZGUgJiYgY29kZSA9PSAwKSBjb2RlID0gZXZlbnQuY2hhckNvZGVcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgIC8vIEVzY2FwZVxuICAgICAgICAgIHNldFNob3dIaW50cyhmYWxzZSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgJCh3aW5kb3cpLm9mZihga2V5ZG93bi4ke2lkfWApXG4gICAgfVxuICB9LCBbc2hvd0hpbnRzXSlcbn1cblxuY29uc3QgdXNlUmVyZW5kZXJPblJlc2l6ZSA9ICgpID0+IHtcbiAgY29uc3QgW3Jlc2l6ZVJlcmVuZGVyLCBzZXRSZXNpemVSZXJlbmRlcl0gPSBSZWFjdC51c2VTdGF0ZShNYXRoLnJhbmRvbSgpKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGlkID0gTWF0aC5yYW5kb20oKVxuICAgICQod2luZG93KS5vbihcbiAgICAgIGByZXNpemUuJHtpZH1gLFxuICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgIHNldFJlc2l6ZVJlcmVuZGVyKE1hdGgucmFuZG9tKCkpXG4gICAgICB9LCAxMDAwKVxuICAgIClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgJCh3aW5kb3cpLm9mZihgcmVzaXplLiR7aWR9YClcbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm4gcmVzaXplUmVyZW5kZXJcbn1cblxuY29uc3QgdXNlUGFpbnRIaW50cyA9ICh7XG4gIHNob3dIaW50cyxcbiAgYXR0YWNoRWxlbWVudCxcbiAgc2V0UGFpbnRlZEhpbnRzLFxufToge1xuICBzaG93SGludHM6IGJvb2xlYW5cbiAgYXR0YWNoRWxlbWVudD86IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICBzZXRQYWludGVkSGludHM6IChoaW50czogUGFpbnRlZEhpbnRUeXBlW10pID0+IHZvaWRcbn0pID0+IHtcbiAgY29uc3QgcmVzaXplUmVyZW5kZXIgPSB1c2VSZXJlbmRlck9uUmVzaXplKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2hvd0hpbnRzICYmIGF0dGFjaEVsZW1lbnQpIHtcbiAgICAgIGxldCAkZWxlbWVudHNXaXRoSGludHMgPSAkKCdbZGF0YS1oZWxwXScpLm5vdCgnLmlzLWhpZGRlbiBbZGF0YS1oZWxwXScpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc0MCkgRklYTUU6IFR5cGUgJ0hUTUxFbGVtZW50W10nIGlzIG1pc3NpbmcgdGhlIGZvbGxvd2luZyBwcm9wLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICRlbGVtZW50c1dpdGhIaW50cyA9IF8uc2h1ZmZsZSgkZWxlbWVudHNXaXRoSGludHMpXG4gICAgICBzdGFydFBhaW50aW5nSGludHMoJGVsZW1lbnRzV2l0aEhpbnRzLCBhdHRhY2hFbGVtZW50LCBzZXRQYWludGVkSGludHMpXG4gICAgfVxuICB9LCBbc2hvd0hpbnRzLCBhdHRhY2hFbGVtZW50LCByZXNpemVSZXJlbmRlcl0pXG59XG5cbnR5cGUgUGFpbnRlZEhpbnRUeXBlID0ge1xuICB3aWR0aDogbnVtYmVyXG4gIGhlaWdodDogbnVtYmVyXG4gIHRvcDogbnVtYmVyXG4gIGxlZnQ6IG51bWJlclxuICB0ZXh0OiBzdHJpbmdcbiAgaWQ6IHN0cmluZ1xufVxuXG5jb25zdCBIaW50c0NvbXBvbmVudCA9ICgpID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKVxuICBjb25zdCBbc2hvd0hpbnRzLCBzZXRTaG93SGludHNdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtwYWludGVkSGludHMsIHNldFBhaW50ZWRIaW50c10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBbXSBhcyBQYWludGVkSGludFR5cGVbXVxuICApXG5cbiAgY29uc3QgYXR0YWNoUmVmID0gdXNlUmVyZW5kZXJpbmdSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPigpXG5cbiAgY29uc3QgcXVlcnlQYXJhbXMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvcGVuSGVscCA9IEJvb2xlYW4ocXVlcnlQYXJhbXNbJ2dsb2JhbC1oZWxwJ10pXG4gICAgaWYgKG9wZW5IZWxwKSB7XG4gICAgICBzZXRTaG93SGludHModHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U2hvd0hpbnRzKGZhbHNlKVxuICAgIH1cbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXNob3dIaW50cykge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lSWQpXG4gICAgICBkZWxldGUgcXVlcnlQYXJhbXNbJ2dsb2JhbC1oZWxwJ11cbiAgICAgIG5hdmlnYXRlKHtcbiAgICAgICAgcGF0aG5hbWU6IGxvY2F0aW9uLnBhdGhuYW1lLFxuICAgICAgICBzZWFyY2g6IGAke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgLi4ucXVlcnlQYXJhbXMsXG4gICAgICAgIH0pfWAsXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW3Nob3dIaW50c10pXG5cbiAgdXNlUGFpbnRIaW50cyh7XG4gICAgc2hvd0hpbnRzLFxuICAgIGF0dGFjaEVsZW1lbnQ6IGF0dGFjaFJlZi5jdXJyZW50LFxuICAgIHNldFBhaW50ZWRIaW50cyxcbiAgfSlcblxuICB1c2VDbG9zZU9uVHlwaW5nKHsgc2hvd0hpbnRzLCBzZXRTaG93SGludHMgfSlcblxuICBpZiAoIXNob3dIaW50cykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cImhlbHAtY29tcG9uZW50IGlzLXNob3duIGZpeGVkIGxlZnQtMCB0b3AtMCBoLWZ1bGwgdy1mdWxsIGJnLWJsYWNrIG9wYWNpdHktNTAgei01MFwiXG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIHNldFNob3dIaW50cyhmYWxzZSlcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJoZWxwLWhpbnRzXCIgcmVmPXthdHRhY2hSZWYucmVmfT5cbiAgICAgICAge3BhaW50ZWRIaW50cy5tYXAoKHBhaW50ZWRIaW50KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIDxQYWludGVkSGludCBrZXk9e3BhaW50ZWRIaW50LmlkfSB7Li4ucGFpbnRlZEhpbnR9IC8+XG4gICAgICAgIH0pfVxuICAgICAgPC9kaXY+XG4gICAgICA8VW50b2dnbGVFbGVtZW50IHNldFNob3dIaW50cz17c2V0U2hvd0hpbnRzfSAvPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFVudG9nZ2xlRWxlbWVudCA9ICh7XG4gIHNldFNob3dIaW50cyxcbn06IHtcbiAgc2V0U2hvd0hpbnRzOiAodmFsOiBib29sZWFuKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGU8RE9NUmVjdCB8IHVuZGVmaW5lZD4oKVxuICBjb25zdCByZXNpemVSZXJlbmRlciA9IHVzZVJlcmVuZGVyT25SZXNpemUoKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW50b2dnbGVFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICdbZGF0YS1pZD1zaWRlYmFyLWhlbHAtYnV0dG9uXSdcbiAgICApXG4gICAgaWYgKHVudG9nZ2xlRWxlbWVudCkge1xuICAgICAgc2V0U3RhdGUodW50b2dnbGVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuICAgIH1cbiAgfSwgW3Jlc2l6ZVJlcmVuZGVyXSlcbiAgaWYgKHN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCwgdG9wLCBsZWZ0IH0gPSBzdGF0ZVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8QnV0dG9uXG4gICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgc2V0U2hvd0hpbnRzKGZhbHNlKVxuICAgICAgICB9fVxuICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSBcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICB0b3AsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICBvcGFjaXR5OiAnLjUnLFxuICAgICAgICB9fVxuICAgICAgPjwvQnV0dG9uPlxuICAgIDwvPlxuICApXG59XG5cbmNvbnN0IFBhaW50ZWRIaW50ID0gKHsgd2lkdGgsIGhlaWdodCwgdG9wLCBsZWZ0LCB0ZXh0IH06IFBhaW50ZWRIaW50VHlwZSkgPT4ge1xuICBjb25zdCBtZW51U3RhdGUgPSB1c2VNZW51U3RhdGUoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8QnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHBhaW50ZWQtaGludFwiXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgIHRvcCxcbiAgICAgICAgICBsZWZ0LFxuICAgICAgICAgIG9wYWNpdHk6ICcwLjUnLFxuICAgICAgICB9fVxuICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgey4uLm1lbnVTdGF0ZS5NdWlCdXR0b25Qcm9wc31cbiAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgbWVudVN0YXRlLmhhbmRsZUNsaWNrKClcbiAgICAgICAgfX1cbiAgICAgID48L0J1dHRvbj5cbiAgICAgIDxQb3BvdmVyXG4gICAgICAgIHsuLi5tZW51U3RhdGUuTXVpUG9wb3ZlclByb3BzfVxuICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8UGFwZXJcbiAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9XG4gICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInAtMlwiXG4gICAgICAgID5cbiAgICAgICAgICB7dGV4dH1cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvUG9wb3Zlcj5cbiAgICA8Lz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBIaW50c0NvbXBvbmVudFxuIl19