import { __assign, __rest } from "tslib";
import * as React from 'react';
import FakeIcon from '@mui/icons-material/AcUnit';
import Button from '@mui/material/Button';
import { hot } from 'react-hot-loader';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { useIsTruncated } from '../overflow-tooltip/overflow-tooltip';
var ExpandingButton = function (_a) {
    var expanded = _a.expanded, Icon = _a.Icon, expandedLabel = _a.expandedLabel, unexpandedLabel = _a.unexpandedLabel, _b = _a.dataId, dataId = _b === void 0 ? (expandedLabel === null || expandedLabel === void 0 ? void 0 : expandedLabel.toString()) || 'default' : _b, _c = _a.orientation, orientation = _c === void 0 ? 'horizontal' : _c, buttonProps = __rest(_a, ["expanded", "Icon", "expandedLabel", "unexpandedLabel", "dataId", "orientation"]);
    var className = buttonProps.className, otherButtonProps = __rest(buttonProps, ["className"]);
    var isTruncatedState = useIsTruncated();
    var disableTooltip = (function () {
        if ((orientation === 'vertical' && !expanded) ||
            (!unexpandedLabel && !expanded)) {
            return false;
        }
        else {
            return !isTruncatedState.isTruncated;
        }
    })();
    return (React.createElement(Tooltip, { title: disableTooltip ? ('') : (React.createElement(Paper, { elevation: Elevations.overlays },
            React.createElement("div", { className: "p-2" }, expandedLabel))), onOpen: function () {
            isTruncatedState.compareSize.current();
        }, placement: "right" },
        React.createElement(Button, __assign({ "data-id": dataId, fullWidth: true, className: "".concat(className, " transition-all duration-200 ease-in-out whitespace-nowrap max-w-full overflow-hidden relative outline-none ").concat(expanded ? '' : 'p-0') }, otherButtonProps),
            React.createElement("div", { className: "flex flex-row flex-nowrap items-center w-full h-full", ref: isTruncatedState.ref },
                React.createElement("div", { className: " ".concat(expanded ? 'hidden' : '', " w-full flex flex-col shrink-0 items-center justify-start flex-nowrap py-2") },
                    Icon ? React.createElement(Icon, { className: "py-1" }) : null,
                    React.createElement("div", { className: "".concat(orientation === 'horizontal'
                            ? 'w-full'
                            : 'writing-mode-vertical-lr', " truncate text-center") }, unexpandedLabel)),
                React.createElement("div", { className: "".concat(expanded ? '' : 'hidden', " pl-4 shrink-1 w-full truncate") },
                    React.createElement("div", { className: "flex flex-row items-center flex-nowrap w-full" },
                        Icon ? (React.createElement(Icon, { className: "transition duration-200 ease-in-out mr-2 shrink-0" })) : (React.createElement(FakeIcon, { className: "transition duration-200 ease-in-out mr-2 opacity-0 shrink-0" })),
                        React.createElement("div", { className: "flex flex-col items-start flex-nowrap text-lg w-full shrink-1 truncate" }, expandedLabel)))))));
};
export default hot(module)(ExpandingButton);
//# sourceMappingURL=expanding-button.js.map