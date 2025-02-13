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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9oZWxwL2hlbHAudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQzFFLE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMzQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBRXRCLElBQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFBO0FBQzVDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQTtBQUV2Qix3R0FBd0c7QUFDeEcsK0NBQStDO0FBQy9DLFNBQVMsbUJBQW1CLENBQUMsT0FBWTtJQUN2QyxJQUFJLE9BQU8sS0FBSyxRQUFRLEVBQUU7UUFDeEIsT0FBTyxLQUFLLENBQUE7S0FDYjtTQUFNO1FBQ0wsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RELElBQ0UsYUFBYSxDQUFDLFNBQVMsS0FBSyxTQUFTO1lBQ3JDLGFBQWEsQ0FBQyxPQUFPLEtBQUssV0FBVyxF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SyxJQUVkLElBQUksQ0FDQyxDQUNBLENBQ1QsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnXG5pbXBvcnQgeyB1c2VIaXN0b3J5LCB1c2VMb2NhdGlvbiB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgeyB1c2VNZW51U3RhdGUsIHVzZVJlcmVuZGVyaW5nUmVmIH0gZnJvbSAnLi4vbWVudS1zdGF0ZS9tZW51LXN0YXRlJ1xuaW1wb3J0IFBvcG92ZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcblxuY29uc3QgemVyb1NjYWxlID0gJ21hdHJpeCgwLCAwLCAwLCAwLCAwLCAwKSdcbmNvbnN0IHplcm9PcGFjaXR5ID0gJzAnXG5cbi8vIHplcm9TY2FsZSB0byBzcGVjaWZpY2FsbHkgdG8gYWNjb3VudCBmb3IgSUUgRWRnZSBCdWcsIHNlZSBodHRwOi8vY29kZXBlbi5pby9hbmRyZXdrZmllZGxlci9wZW4vYXBCYnhxXG4vLyB6ZXJvT3BhY2l0eSB0byBhY2NvdW50IGZvciBob3cgYnJvd3NlcnMgd29ya1xuZnVuY3Rpb24gaXNFZmZlY3RpdmVseUhpZGRlbihlbGVtZW50OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpXG4gICAgaWYgKFxuICAgICAgY29tcHV0ZWRTdHlsZS50cmFuc2Zvcm0gPT09IHplcm9TY2FsZSB8fFxuICAgICAgY29tcHV0ZWRTdHlsZS5vcGFjaXR5ID09PSB6ZXJvT3BhY2l0eVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlzRWZmZWN0aXZlbHlIaWRkZW4oZWxlbWVudC5wYXJlbnROb2RlKVxuICAgIH1cbiAgfVxufVxuXG4vLyBpdCdkIGJlIG5pY2UgaWYgd2UgY2FuIHVzZSBvZmZzZXRQYXJlbnQgZGlyZWN0bHksIGJ1dCB0aGF0IHdvdWxkIHJlcXVpcmUgZGV2cyB0byBiZSBhd2FyZSBvZiBob3cgaGVscC52aWV3IHdvcmtzXG5mdW5jdGlvbiBpc09mZnNldFBhcmVudChlbGVtZW50OiBhbnkpIHtcbiAgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLm92ZXJmbG93ICE9PSAndmlzaWJsZSdcbn1cblxuZnVuY3Rpb24gdHJhdmVyc2VBbmNlc3RvcnMoZWxlbWVudDogYW55LCBjb21wYXJlVmFsdWU6IGFueSwgZXh0cmFjdFZhbHVlOiBhbnkpIHtcbiAgbGV0IHZhbHVlID0gZXh0cmFjdFZhbHVlKGVsZW1lbnQpXG4gIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgd2hpbGUgKGVsZW1lbnQgIT09IG51bGwgJiYgZWxlbWVudCAhPT0gZG9jdW1lbnQpIHtcbiAgICBpZiAoaXNPZmZzZXRQYXJlbnQoZWxlbWVudCkpIHtcbiAgICAgIHZhbHVlID0gY29tcGFyZVZhbHVlKHZhbHVlLCBleHRyYWN0VmFsdWUoZWxlbWVudCkpXG4gICAgfVxuICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuZnVuY3Rpb24gZmluZEhpZ2hlc3RBbmNlc3RvclRvcChlbGVtZW50OiBhbnkpIHtcbiAgcmV0dXJuIHRyYXZlcnNlQW5jZXN0b3JzKFxuICAgIGVsZW1lbnQsXG4gICAgKGN1cnJlbnRUb3A6IGFueSwgcHJvcG9zZWRUb3A6IGFueSkgPT4gTWF0aC5tYXgoY3VycmVudFRvcCwgcHJvcG9zZWRUb3ApLFxuICAgIChlbGVtZW50OiBhbnkpID0+IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gIClcbn1cblxuZnVuY3Rpb24gZmluZEhpZ2hlc3RBbmNlc3RvckxlZnQoZWxlbWVudDogYW55KSB7XG4gIHJldHVybiB0cmF2ZXJzZUFuY2VzdG9ycyhcbiAgICBlbGVtZW50LFxuICAgIChjdXJyZW50TGVmdDogYW55LCBwcm9wb3NlZExlZnQ6IGFueSkgPT5cbiAgICAgIE1hdGgubWF4KGN1cnJlbnRMZWZ0LCBwcm9wb3NlZExlZnQpLFxuICAgIChlbGVtZW50OiBhbnkpID0+IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdFxuICApXG59XG5cbmZ1bmN0aW9uIGZpbmRMb3dlc3RBbmNlc3RvckJvdHRvbShlbGVtZW50OiBhbnkpIHtcbiAgcmV0dXJuIHRyYXZlcnNlQW5jZXN0b3JzKFxuICAgIGVsZW1lbnQsXG4gICAgKGN1cnJlbnRCb3R0b206IGFueSwgcHJvcG9zZWRCb3R0b206IGFueSkgPT5cbiAgICAgIE1hdGgubWluKGN1cnJlbnRCb3R0b20sIHByb3Bvc2VkQm90dG9tKSxcbiAgICAoZWxlbWVudDogYW55KSA9PiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbVxuICApXG59XG5cbmZ1bmN0aW9uIGZpbmRMb3dlc3RBbmNlc3RvclJpZ2h0KGVsZW1lbnQ6IGFueSkge1xuICByZXR1cm4gdHJhdmVyc2VBbmNlc3RvcnMoXG4gICAgZWxlbWVudCxcbiAgICAoY3VycmVudFJpZ2h0OiBhbnksIHByb3Bvc2VkUmlnaHQ6IGFueSkgPT5cbiAgICAgIE1hdGgubWluKGN1cnJlbnRSaWdodCwgcHJvcG9zZWRSaWdodCksXG4gICAgKGVsZW1lbnQ6IGFueSkgPT4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodFxuICApXG59XG5cbmZ1bmN0aW9uIGZpbmRCbG9ja2VycygpIHtcbiAgY29uc3QgYmxvY2tpbmdFbGVtZW50cyA9ICQoJy5pcy1ibG9ja2VyJylcbiAgcmV0dXJuIF8ubWFwKGJsb2NraW5nRWxlbWVudHMsIChibG9ja2luZ0VsZW1lbnQ6IGFueSkgPT4gKHtcbiAgICBib3VuZGluZ1JlY3Q6IGJsb2NraW5nRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICBlbGVtZW50OiBibG9ja2luZ0VsZW1lbnQsXG4gIH0pKVxufVxuXG5mdW5jdGlvbiBpc0Jsb2NrZWQoZWxlbWVudDogYW55LCBib3VuZGluZ1JlY3Q6IGFueSkge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJyhibG9ja2VyOiBhbnkpID0+IHRydWUgfCB1bmRlZmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgcmV0dXJuIF8uc29tZShmaW5kQmxvY2tlcnMoKSwgKGJsb2NrZXI6IGFueSkgPT4ge1xuICAgIGlmIChcbiAgICAgIGJsb2NrZXIuZWxlbWVudCAhPT0gZWxlbWVudCAmJlxuICAgICAgJChibG9ja2VyLmVsZW1lbnQpLmZpbmQoZWxlbWVudCkubGVuZ3RoID09PSAwXG4gICAgKSB7XG4gICAgICBjb25zdCB0b3AgPSBNYXRoLm1heChibG9ja2VyLmJvdW5kaW5nUmVjdC50b3AsIGJvdW5kaW5nUmVjdC50b3ApXG4gICAgICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihibG9ja2VyLmJvdW5kaW5nUmVjdC5ib3R0b20sIGJvdW5kaW5nUmVjdC5ib3R0b20pXG4gICAgICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgoYmxvY2tlci5ib3VuZGluZ1JlY3QubGVmdCwgYm91bmRpbmdSZWN0LmxlZnQpXG4gICAgICBjb25zdCByaWdodCA9IE1hdGgubWluKGJsb2NrZXIuYm91bmRpbmdSZWN0LnJpZ2h0LCBib3VuZGluZ1JlY3QucmlnaHQpXG4gICAgICBjb25zdCBoZWlnaHQgPSBib3R0b20gLSB0b3BcbiAgICAgIGNvbnN0IHdpZHRoID0gcmlnaHQgLSBsZWZ0XG4gICAgICBpZiAoaGVpZ2h0ID4gMCAmJiB3aWR0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmxldCBhbmltYXRpb25GcmFtZUlkID0gLTFcblxuY29uc3QgcGFpbnRIaW50ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogUGFpbnRlZEhpbnRUeXBlIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKGlzRWZmZWN0aXZlbHlIaWRkZW4oZWxlbWVudCkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbiAgY29uc3QgYm91bmRpbmdSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChmaW5kSGlnaGVzdEFuY2VzdG9yVG9wKGVsZW1lbnQpLCBib3VuZGluZ1JlY3QudG9wKVxuICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihcbiAgICBmaW5kTG93ZXN0QW5jZXN0b3JCb3R0b20oZWxlbWVudCksXG4gICAgYm91bmRpbmdSZWN0LmJvdHRvbVxuICApXG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChmaW5kSGlnaGVzdEFuY2VzdG9yTGVmdChlbGVtZW50KSwgYm91bmRpbmdSZWN0LmxlZnQpXG4gIGNvbnN0IHJpZ2h0ID0gTWF0aC5taW4oZmluZExvd2VzdEFuY2VzdG9yUmlnaHQoZWxlbWVudCksIGJvdW5kaW5nUmVjdC5yaWdodClcbiAgY29uc3QgaGVpZ2h0ID0gYm90dG9tIC0gdG9wXG4gIGNvbnN0IHdpZHRoID0gcmlnaHQgLSBsZWZ0XG4gIGlmIChcbiAgICBib3VuZGluZ1JlY3Qud2lkdGggPiAwICYmXG4gICAgaGVpZ2h0ID4gMCAmJlxuICAgIHdpZHRoID4gMCAmJlxuICAgICFpc0Jsb2NrZWQoZWxlbWVudCwge1xuICAgICAgdG9wLFxuICAgICAgYm90dG9tLFxuICAgICAgbGVmdCxcbiAgICAgIHJpZ2h0LFxuICAgIH0pXG4gICkge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQsXG4gICAgICB3aWR0aCxcbiAgICAgIHRvcCxcbiAgICAgIGxlZnQsXG4gICAgICB0ZXh0OiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1oZWxwJykgfHwgJycsXG4gICAgICBpZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygpLFxuICAgIH1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmNvbnN0IHN0YXJ0UGFpbnRpbmdIaW50cyA9IChcbiAgJGVsZW1lbnRzV2l0aEhpbnRzOiBhbnksXG4gIGF0dGFjaEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50LFxuICBzZXRQYWludGVkSGludHM6IChoaW50czogUGFpbnRlZEhpbnRUeXBlW10pID0+IHZvaWRcbikgPT4ge1xuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWVJZClcbiAgcGFpbnRIaW50cygkZWxlbWVudHNXaXRoSGludHMsIGF0dGFjaEVsZW1lbnQsIFtdLCBzZXRQYWludGVkSGludHMpXG59XG5cbmNvbnN0IHBhaW50SGludHMgPSAoXG4gICRlbGVtZW50c1dpdGhIaW50czogYW55LFxuICBhdHRhY2hFbGVtZW50OiBIVE1MRGl2RWxlbWVudCxcbiAgcGFpbnRlZEhpbnRzOiBQYWludGVkSGludFR5cGVbXSxcbiAgc2V0UGFpbnRlZEhpbnRzOiAocGFpbnRlZEhpbnRzOiBQYWludGVkSGludFR5cGVbXSkgPT4gdm9pZFxuKSA9PiB7XG4gIGFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBlbGVtZW50cyA9ICRlbGVtZW50c1dpdGhIaW50cy5zcGxpY2UoMCwgNCkgYXMgdW5rbm93biBhcyBIVE1MRWxlbWVudFtdXG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld0hpbnRzID0gZWxlbWVudHNcbiAgICAgICAgLm1hcCgoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICByZXR1cm4gcGFpbnRIaW50KGVsZW1lbnQpXG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoKGhpbnQpID0+IGhpbnQgIT09IHVuZGVmaW5lZCkgYXMgUGFpbnRlZEhpbnRUeXBlW11cbiAgICAgIGNvbnN0IGNvbWJpbmVkVmFsdWUgPSBwYWludGVkSGludHMuY29uY2F0KG5ld0hpbnRzKVxuICAgICAgc2V0UGFpbnRlZEhpbnRzKGNvbWJpbmVkVmFsdWUpXG4gICAgICBwYWludEhpbnRzKFxuICAgICAgICAkZWxlbWVudHNXaXRoSGludHMsXG4gICAgICAgIGF0dGFjaEVsZW1lbnQsXG4gICAgICAgIGNvbWJpbmVkVmFsdWUsXG4gICAgICAgIHNldFBhaW50ZWRIaW50c1xuICAgICAgKVxuICAgIH1cbiAgfSlcbn1cblxuY29uc3QgdXNlQ2xvc2VPblR5cGluZyA9ICh7XG4gIHNob3dIaW50cyxcbiAgc2V0U2hvd0hpbnRzLFxufToge1xuICBzaG93SGludHM6IGJvb2xlYW5cbiAgc2V0U2hvd0hpbnRzOiAodmFsdWU6IGJvb2xlYW4pID0+IHZvaWRcbn0pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpZCA9IE1hdGgucmFuZG9tKClcbiAgICAkKHdpbmRvdykub24oYGtleWRvd24uJHtpZH1gLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgbGV0IGNvZGUgPSBldmVudC5rZXlDb2RlXG4gICAgICBpZiAoZXZlbnQuY2hhckNvZGUgJiYgY29kZSA9PSAwKSBjb2RlID0gZXZlbnQuY2hhckNvZGVcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgIC8vIEVzY2FwZVxuICAgICAgICAgIHNldFNob3dIaW50cyhmYWxzZSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgJCh3aW5kb3cpLm9mZihga2V5ZG93bi4ke2lkfWApXG4gICAgfVxuICB9LCBbc2hvd0hpbnRzXSlcbn1cblxuY29uc3QgdXNlUmVyZW5kZXJPblJlc2l6ZSA9ICgpID0+IHtcbiAgY29uc3QgW3Jlc2l6ZVJlcmVuZGVyLCBzZXRSZXNpemVSZXJlbmRlcl0gPSBSZWFjdC51c2VTdGF0ZShNYXRoLnJhbmRvbSgpKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGlkID0gTWF0aC5yYW5kb20oKVxuICAgICQod2luZG93KS5vbihcbiAgICAgIGByZXNpemUuJHtpZH1gLFxuICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgIHNldFJlc2l6ZVJlcmVuZGVyKE1hdGgucmFuZG9tKCkpXG4gICAgICB9LCAxMDAwKVxuICAgIClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgJCh3aW5kb3cpLm9mZihgcmVzaXplLiR7aWR9YClcbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm4gcmVzaXplUmVyZW5kZXJcbn1cblxuY29uc3QgdXNlUGFpbnRIaW50cyA9ICh7XG4gIHNob3dIaW50cyxcbiAgYXR0YWNoRWxlbWVudCxcbiAgc2V0UGFpbnRlZEhpbnRzLFxufToge1xuICBzaG93SGludHM6IGJvb2xlYW5cbiAgYXR0YWNoRWxlbWVudD86IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICBzZXRQYWludGVkSGludHM6IChoaW50czogUGFpbnRlZEhpbnRUeXBlW10pID0+IHZvaWRcbn0pID0+IHtcbiAgY29uc3QgcmVzaXplUmVyZW5kZXIgPSB1c2VSZXJlbmRlck9uUmVzaXplKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2hvd0hpbnRzICYmIGF0dGFjaEVsZW1lbnQpIHtcbiAgICAgIGxldCAkZWxlbWVudHNXaXRoSGludHMgPSAkKCdbZGF0YS1oZWxwXScpLm5vdCgnLmlzLWhpZGRlbiBbZGF0YS1oZWxwXScpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc0MCkgRklYTUU6IFR5cGUgJ0hUTUxFbGVtZW50W10nIGlzIG1pc3NpbmcgdGhlIGZvbGxvd2luZyBwcm9wLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICRlbGVtZW50c1dpdGhIaW50cyA9IF8uc2h1ZmZsZSgkZWxlbWVudHNXaXRoSGludHMpXG4gICAgICBzdGFydFBhaW50aW5nSGludHMoJGVsZW1lbnRzV2l0aEhpbnRzLCBhdHRhY2hFbGVtZW50LCBzZXRQYWludGVkSGludHMpXG4gICAgfVxuICB9LCBbc2hvd0hpbnRzLCBhdHRhY2hFbGVtZW50LCByZXNpemVSZXJlbmRlcl0pXG59XG5cbnR5cGUgUGFpbnRlZEhpbnRUeXBlID0ge1xuICB3aWR0aDogbnVtYmVyXG4gIGhlaWdodDogbnVtYmVyXG4gIHRvcDogbnVtYmVyXG4gIGxlZnQ6IG51bWJlclxuICB0ZXh0OiBzdHJpbmdcbiAgaWQ6IHN0cmluZ1xufVxuXG5jb25zdCBIaW50c0NvbXBvbmVudCA9ICgpID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgY29uc3QgW3Nob3dIaW50cywgc2V0U2hvd0hpbnRzXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcGFpbnRlZEhpbnRzLCBzZXRQYWludGVkSGludHNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgW10gYXMgUGFpbnRlZEhpbnRUeXBlW11cbiAgKVxuXG4gIGNvbnN0IGF0dGFjaFJlZiA9IHVzZVJlcmVuZGVyaW5nUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4oKVxuXG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb3BlbkhlbHAgPSBCb29sZWFuKHF1ZXJ5UGFyYW1zWydnbG9iYWwtaGVscCddKVxuICAgIGlmIChvcGVuSGVscCkge1xuICAgICAgc2V0U2hvd0hpbnRzKHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFNob3dIaW50cyhmYWxzZSlcbiAgICB9XG4gIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzaG93SGludHMpIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25GcmFtZUlkKVxuICAgICAgZGVsZXRlIHF1ZXJ5UGFyYW1zWydnbG9iYWwtaGVscCddXG4gICAgICBoaXN0b3J5LnB1c2goe1xuICAgICAgICBwYXRobmFtZTogbG9jYXRpb24ucGF0aG5hbWUsXG4gICAgICAgIHNlYXJjaDogYCR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgfSl9YCxcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbc2hvd0hpbnRzXSlcblxuICB1c2VQYWludEhpbnRzKHtcbiAgICBzaG93SGludHMsXG4gICAgYXR0YWNoRWxlbWVudDogYXR0YWNoUmVmLmN1cnJlbnQsXG4gICAgc2V0UGFpbnRlZEhpbnRzLFxuICB9KVxuXG4gIHVzZUNsb3NlT25UeXBpbmcoeyBzaG93SGludHMsIHNldFNob3dIaW50cyB9KVxuXG4gIGlmICghc2hvd0hpbnRzKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwiaGVscC1jb21wb25lbnQgaXMtc2hvd24gZml4ZWQgbGVmdC0wIHRvcC0wIGgtZnVsbCB3LWZ1bGwgYmctYmxhY2sgb3BhY2l0eS01MCB6LTUwXCJcbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgc2V0U2hvd0hpbnRzKGZhbHNlKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlbHAtaGludHNcIiByZWY9e2F0dGFjaFJlZi5yZWZ9PlxuICAgICAgICB7cGFpbnRlZEhpbnRzLm1hcCgocGFpbnRlZEhpbnQpID0+IHtcbiAgICAgICAgICByZXR1cm4gPFBhaW50ZWRIaW50IGtleT17cGFpbnRlZEhpbnQuaWR9IHsuLi5wYWludGVkSGludH0gLz5cbiAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxVbnRvZ2dsZUVsZW1lbnQgc2V0U2hvd0hpbnRzPXtzZXRTaG93SGludHN9IC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgVW50b2dnbGVFbGVtZW50ID0gKHtcbiAgc2V0U2hvd0hpbnRzLFxufToge1xuICBzZXRTaG93SGludHM6ICh2YWw6IGJvb2xlYW4pID0+IHZvaWRcbn0pID0+IHtcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZTxET01SZWN0IHwgdW5kZWZpbmVkPigpXG4gIGNvbnN0IHJlc2l6ZVJlcmVuZGVyID0gdXNlUmVyZW5kZXJPblJlc2l6ZSgpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnRvZ2dsZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJ1tkYXRhLWlkPXNpZGViYXItaGVscC1idXR0b25dJ1xuICAgIClcbiAgICBpZiAodW50b2dnbGVFbGVtZW50KSB7XG4gICAgICBzZXRTdGF0ZSh1bnRvZ2dsZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG4gICAgfVxuICB9LCBbcmVzaXplUmVyZW5kZXJdKVxuICBpZiAoc3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0LCB0b3AsIGxlZnQgfSA9IHN0YXRlXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZXRTaG93SGludHMoZmFsc2UpXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIFwiXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgIHRvcCxcbiAgICAgICAgICBsZWZ0LFxuICAgICAgICAgIG9wYWNpdHk6ICcuNScsXG4gICAgICAgIH19XG4gICAgICA+PC9CdXR0b24+XG4gICAgPC8+XG4gIClcbn1cblxuY29uc3QgUGFpbnRlZEhpbnQgPSAoeyB3aWR0aCwgaGVpZ2h0LCB0b3AsIGxlZnQsIHRleHQgfTogUGFpbnRlZEhpbnRUeXBlKSA9PiB7XG4gIGNvbnN0IG1lbnVTdGF0ZSA9IHVzZU1lbnVTdGF0ZSgpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcGFpbnRlZC1oaW50XCJcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgdG9wLFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgb3BhY2l0eTogJzAuNScsXG4gICAgICAgIH19XG4gICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICB7Li4ubWVudVN0YXRlLk11aUJ1dHRvblByb3BzfVxuICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xpY2soKVxuICAgICAgICB9fVxuICAgICAgPjwvQnV0dG9uPlxuICAgICAgPFBvcG92ZXJcbiAgICAgICAgey4uLm1lbnVTdGF0ZS5NdWlQb3BvdmVyUHJvcHN9XG4gICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIG1lbnVTdGF0ZS5oYW5kbGVDbG9zZSgpXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxQYXBlclxuICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c31cbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwicC0yXCJcbiAgICAgICAgPlxuICAgICAgICAgIHt0ZXh0fVxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9Qb3BvdmVyPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKEhpbnRzQ29tcG9uZW50KVxuIl19