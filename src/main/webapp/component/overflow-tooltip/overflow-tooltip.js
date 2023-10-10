import { __assign, __read, __rest } from "tslib";
import React, { useRef, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import { hot } from 'react-hot-loader';
import { Elevations } from '../theme/theme';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import wreqr from '../../js/wreqr';
function areDescendentsTruncated(element) {
    if (!element) {
        return false;
    }
    /**
     * Why 1 and not 0?  Well, in writing mode vertical, there is a discrepancy of 1.
     */
    if (Math.abs(element.scrollWidth - element.clientWidth) > 1) {
        return true;
    }
    if (element.children) {
        for (var i = 0; i < element.children.length; i++) {
            var hasTruncatedDescendent = areDescendentsTruncated(element.children[i]);
            if (hasTruncatedDescendent) {
                return hasTruncatedDescendent;
            }
        }
    }
    return false;
}
export function useIsTruncated(passedInRef) {
    if (passedInRef === void 0) { passedInRef = null; }
    var _a = __read(React.useState(false), 2), isTruncated = _a[0], setIsTruncated = _a[1];
    var ref = useRef(passedInRef);
    var compareSizeRef = useRef(function () { });
    var _b = useBackbone(), listenTo = _b.listenTo, stopListening = _b.stopListening;
    useEffect(function () {
        var compareSize = function () {
            if (ref.current) {
                setIsTruncated(areDescendentsTruncated(ref.current));
            }
        };
        compareSizeRef.current = compareSize;
        if (ref.current) {
            compareSize();
            listenTo(wreqr.vent, 'resize', compareSize);
            window.addEventListener('resize', compareSize);
            ref.current.addEventListener('mouseenter', compareSize);
        }
        else {
            console.warn('WARNING: No element found to compare.  You must take in and set a ref (refOfThingToMeasure) on one of your elements so this knows when to display a tooltip.');
        }
        return function () {
            var _a;
            stopListening(wreqr.vent, 'resize', compareSize);
            window.removeEventListener('resize', compareSize);
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('mouseenter', compareSize);
        };
    });
    return {
        isTruncated: isTruncated,
        ref: ref,
        compareSize: compareSizeRef,
    };
}
var OverflowTip = function (_a) {
    var children = _a.children, _b = _a.tooltipProps, tooltipProps = _b === void 0 ? {} : _b, refOfThingToMeasurePassedIn = _a.refOfThingToMeasure, className = _a.className;
    var title = tooltipProps.title, otherTooltipProps = __rest(tooltipProps, ["title"]);
    var _c = __read(React.useState(false), 2), open = _c[0], setOpen = _c[1];
    var isTruncatedState = useIsTruncated(refOfThingToMeasurePassedIn);
    React.useEffect(function () {
        // expose this ugly thing when no other way will work (autocompletes unfortunately)
        ;
        isTruncatedState.ref.current.overflowTooltip = {
            setOpen: function (open) {
                if (isTruncatedState.isTruncated)
                    setOpen(open);
            },
        };
    }, [isTruncatedState.ref.current]);
    return (React.createElement(Tooltip, __assign({ title: React.createElement(Paper, { className: "p-1 overflow-auto max-w-screen-sm", elevation: Elevations.overlays }, title ? title : children), open: open, onOpen: function () {
            if (isTruncatedState.isTruncated) {
                setOpen(true);
            }
        }, onClose: function () {
            setOpen(false);
        }, PopperProps: {
            className: '',
        } }, otherTooltipProps),
        React.createElement("div", { ref: isTruncatedState.ref, className: className }, children)));
};
export default hot(module)(OverflowTip);
//# sourceMappingURL=overflow-tooltip.js.map