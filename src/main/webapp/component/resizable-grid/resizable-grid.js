var _a;
import { __assign, __makeTemplateObject, __read } from "tslib";
import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Resizable } from 're-resizable';
import styled from 'styled-components';
import { createCtx } from '../../typescript/context';
import wreqr from '../../js/wreqr';
export var DEFAULT_AUTO_COLLAPSE_LENGTH = 300;
export var DEFAULT_STARTING_LENGTH = 550;
export var DEFAULT_COLLAPSED_LENGTH = 75;
var ResizableGrid = Grid;
export var useResizableGridContext = (_a = __read(createCtx({
    closed: false,
}), 2), _a[0]), UseResizableGridContextProvider = _a[1];
export var useResizableGrid = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.startingLength, startingLength = _c === void 0 ? DEFAULT_STARTING_LENGTH : _c, _d = _b.collapsedLength, collapsedLength = _d === void 0 ? DEFAULT_COLLAPSED_LENGTH : _d, _e = _b.autoCollapseLength, autoCollapseLength = _e === void 0 ? DEFAULT_AUTO_COLLAPSE_LENGTH : _e;
    var _f = __read(React.useState(false), 2), closed = _f[0], setClosed = _f[1];
    var _g = __read(React.useState(startingLength), 2), length = _g[0], setLength = _g[1];
    var _h = __read(React.useState(startingLength), 2), lastLength = _h[0], setLastLength = _h[1];
    var _j = __read(React.useState(false), 2), dragging = _j[0], setDragging = _j[1];
    React.useEffect(function () {
        if (!dragging) {
            if (length < autoCollapseLength) {
                setClosed(true);
                setLength(collapsedLength);
            }
            else {
                setLastLength(length);
                setClosed(false);
            }
        }
        setTimeout(function () {
            ;
            wreqr.vent.trigger('gl-updateSize');
            wreqr.vent.trigger('resize');
        }, 500);
    }, [length, dragging]);
    React.useEffect(function () {
        if (closed && length !== collapsedLength) {
            setLastLength(length);
            setLength(collapsedLength);
        }
    }, [closed]);
    return {
        length: length,
        closed: closed,
        setClosed: setClosed,
        setLength: setLength,
        lastLength: lastLength,
        setLastLength: setLastLength,
        dragging: dragging,
        setDragging: setDragging,
    };
};
export var CustomResizableGrid = styled(ResizableGrid)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  .actions {\n    opacity: 0;\n    transform: translateX(-100%);\n    transition: opacity 0.2s ease-in-out 0.5s, transform 0.2s ease-in-out 0.5s;\n  }\n  > span > div:hover {\n    background: rgba(0, 0, 0, 0.1);\n  }\n\n  :focus-within .actions,\n  :hover .actions {\n    opacity: 1;\n    transform: translateX(-50%);\n    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;\n  }\n  .actions > div + div {\n    margin-top: 10px;\n  }\n"], ["\n  .actions {\n    opacity: 0;\n    transform: translateX(-100%);\n    transition: opacity 0.2s ease-in-out 0.5s, transform 0.2s ease-in-out 0.5s;\n  }\n  > span > div:hover {\n    background: rgba(0, 0, 0, 0.1);\n  }\n\n  :focus-within .actions,\n  :hover .actions {\n    opacity: 1;\n    transform: translateX(-50%);\n    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;\n  }\n  .actions > div + div {\n    margin-top: 10px;\n  }\n"])));
export var SplitPane = function (_a) {
    var secondStyle = _a.secondStyle, variant = _a.variant, children = _a.children, _b = _a.collapsedLength, collapsedLength = _b === void 0 ? DEFAULT_COLLAPSED_LENGTH : _b, _c = _a.autoCollapseLength, autoCollapseLength = _c === void 0 ? DEFAULT_AUTO_COLLAPSE_LENGTH : _c, _d = _a.startingLength, startingLength = _d === void 0 ? DEFAULT_STARTING_LENGTH : _d, controlled = _a.controlled;
    var _e = controlled ||
        useResizableGrid({
            startingLength: startingLength,
            collapsedLength: collapsedLength,
            autoCollapseLength: autoCollapseLength,
        }), length = _e.length, closed = _e.closed, setClosed = _e.setClosed, setLength = _e.setLength, lastLength = _e.lastLength, setLastLength = _e.setLastLength, dragging = _e.dragging, setDragging = _e.setDragging;
    var _f = __read(children, 2), First = _f[0], Second = _f[1];
    return (React.createElement(UseResizableGridContextProvider, { value: {
            length: length,
            closed: closed,
            setClosed: setClosed,
            setLength: setLength,
            lastLength: lastLength,
            setLastLength: setLastLength,
            dragging: dragging,
            setDragging: setDragging,
        } },
        React.createElement(Grid, { container: true, wrap: "nowrap", direction: (function () {
                switch (variant) {
                    case 'horizontal':
                        return 'row';
                    case 'vertical':
                        return 'column';
                }
            })(), className: "w-full h-full" },
            React.createElement(CustomResizableGrid, { component: Resizable, item: true, size: (function () {
                    switch (variant) {
                        case 'horizontal':
                            return {
                                width: length,
                                height: '100%',
                            };
                        case 'vertical':
                            return {
                                width: '100%',
                                height: length,
                            };
                    }
                })(), minWidth: collapsedLength, enable: (function () {
                    switch (variant) {
                        case 'horizontal':
                            return {
                                top: false,
                                right: true,
                                bottom: false,
                                left: false,
                                topRight: false,
                                bottomRight: false,
                                bottomLeft: false,
                                topLeft: false,
                            };
                        case 'vertical':
                            return {
                                top: false,
                                right: false,
                                bottom: true,
                                left: false,
                                topRight: false,
                                bottomRight: false,
                                bottomLeft: false,
                                topLeft: false,
                            };
                    }
                })(), style: {
                    flexShrink: 0,
                }, onResizeStop: function () {
                    setDragging(false);
                }, onResizeStart: function () {
                    setDragging(true);
                }, onResize: function (e) {
                    switch (variant) {
                        case 'horizontal':
                            setLength(e.clientX -
                                e.target.parentElement.getBoundingClientRect().x);
                            break;
                        case 'vertical':
                            setLength(e.clientY -
                                e.target.parentElement.getBoundingClientRect().y);
                            break;
                    }
                }, className: "z-10 pr-2" }, First),
            React.createElement(Grid, { item: true, style: (function () {
                    switch (variant) {
                        case 'horizontal':
                            return __assign({ height: '100%', width: "calc(100% - ".concat(length, "px)"), flexShrink: 1 }, secondStyle);
                        case 'vertical':
                            return __assign({ height: "calc(100% - ".concat(length, "px)"), width: '100%', flexShrink: 1 }, secondStyle);
                    }
                })() }, Second))));
};
var templateObject_1;
//# sourceMappingURL=resizable-grid.js.map