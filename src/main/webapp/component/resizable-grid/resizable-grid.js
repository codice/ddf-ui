var _a;
import { __assign, __makeTemplateObject, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(UseResizableGridContextProvider, { value: {
            length: length,
            closed: closed,
            setClosed: setClosed,
            setLength: setLength,
            lastLength: lastLength,
            setLastLength: setLastLength,
            dragging: dragging,
            setDragging: setDragging,
        }, children: _jsxs(Grid, { container: true, wrap: "nowrap", direction: (function () {
                switch (variant) {
                    case 'horizontal':
                        return 'row';
                    case 'vertical':
                        return 'column';
                }
            })(), className: "w-full h-full", children: [_jsx(CustomResizableGrid, { component: Resizable, item: true, size: (function () {
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
                    }, className: "z-10 pr-2", children: First }), _jsx(Grid, { item: true, style: (function () {
                        switch (variant) {
                            case 'horizontal':
                                return __assign({ height: '100%', width: "calc(100% - ".concat(length, "px)"), flexShrink: 1 }, secondStyle);
                            case 'vertical':
                                return __assign({ height: "calc(100% - ".concat(length, "px)"), width: '100%', flexShrink: 1 }, secondStyle);
                        }
                    })(), children: Second })] }) }));
};
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLWdyaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Jlc2l6YWJsZS1ncmlkL3Jlc2l6YWJsZS1ncmlkLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsU0FBUyxFQUFrQixNQUFNLGNBQWMsQ0FBQTtBQUN4RCxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDcEQsT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEMsTUFBTSxDQUFDLElBQU0sNEJBQTRCLEdBQUcsR0FBRyxDQUFBO0FBQy9DLE1BQU0sQ0FBQyxJQUFNLHVCQUF1QixHQUFHLEdBQUcsQ0FBQTtBQUMxQyxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRyxFQUFFLENBQUE7QUFTMUMsSUFBTSxhQUFhLEdBQUcsSUFBeUIsQ0FBQTtBQUMvQyxNQUFNLENBQVEsSUFBQSx1QkFBdUIsSUFBeEIsS0FBQSxPQUNYLFNBQVMsQ0FBdUI7SUFDOUIsTUFBTSxFQUFFLEtBQUs7Q0FDZCxDQUFDLElBQUEsUUFIaUMsRUFBRSwrQkFBK0IsUUFBQSxDQUdsRTtBQVdKLE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLFVBQUMsRUFRM0I7UUFSMkIscUJBUTdCLEVBQUUsS0FBQSxFQVBKLHNCQUF3QyxFQUF4QyxjQUFjLG1CQUFHLHVCQUF1QixLQUFBLEVBQ3hDLHVCQUEwQyxFQUExQyxlQUFlLG1CQUFHLHdCQUF3QixLQUFBLEVBQzFDLDBCQUFpRCxFQUFqRCxrQkFBa0IsbUJBQUcsNEJBQTRCLEtBQUE7SUFNM0MsSUFBQSxLQUFBLE9BQXNCLEtBQUssQ0FBQyxR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ZSxNQUFNLFFBQUssRUFDakMsVUFBVSxFQUFFLENBQUMsSUFDVixXQUFXLEVBQ2Y7NEJBQ0gsS0FBSyxVQUFVO2dDQUNiLGtCQUNFLE1BQU0sRUFBRSxzQkFBZSxNQUFNLFFBQUssRUFDbEMsS0FBSyxFQUFFLE1BQU0sRUFDYixVQUFVLEVBQUUsQ0FBQyxJQUNWLFdBQVcsRUFDZjt3QkFDTCxDQUFDO29CQUNILENBQUMsQ0FBQyxFQUFFLFlBRUgsTUFBTSxHQUNGLElBQ0YsR0FDeUIsQ0FDbkMsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IHsgUmVzaXphYmxlLCBSZXNpemFibGVQcm9wcyB9IGZyb20gJ3JlLXJlc2l6YWJsZSdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBjcmVhdGVDdHggfSBmcm9tICcuLi8uLi90eXBlc2NyaXB0L2NvbnRleHQnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vanMvd3JlcXInXG5leHBvcnQgY29uc3QgREVGQVVMVF9BVVRPX0NPTExBUFNFX0xFTkdUSCA9IDMwMFxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU1RBUlRJTkdfTEVOR1RIID0gNTUwXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT0xMQVBTRURfTEVOR1RIID0gNzVcbnR5cGUgUmVzaXphYmxlR3JpZFR5cGUgPSBSZWFjdC5Db21wb25lbnRUeXBlPFxuICBSZWFjdC5Qcm9wc1dpdGhDaGlsZHJlbjxcbiAgICBSZXNpemFibGVQcm9wcyAmIHtcbiAgICAgIGNvbXBvbmVudDogYW55XG4gICAgICBpdGVtOiBhbnlcbiAgICB9XG4gID5cbj5cbmNvbnN0IFJlc2l6YWJsZUdyaWQgPSBHcmlkIGFzIFJlc2l6YWJsZUdyaWRUeXBlXG5leHBvcnQgY29uc3QgW3VzZVJlc2l6YWJsZUdyaWRDb250ZXh0LCBVc2VSZXNpemFibGVHcmlkQ29udGV4dFByb3ZpZGVyXSA9XG4gIGNyZWF0ZUN0eDx1c2VSZXNpemFibGVHcmlkVHlwZT4oe1xuICAgIGNsb3NlZDogZmFsc2UsXG4gIH0pXG50eXBlIHVzZVJlc2l6YWJsZUdyaWRUeXBlID0ge1xuICBsZW5ndGg6IG51bWJlclxuICBjbG9zZWQ6IGJvb2xlYW5cbiAgc2V0Q2xvc2VkOiBSZWFjdC5EaXNwYXRjaDxib29sZWFuPlxuICBzZXRMZW5ndGg6IFJlYWN0LkRpc3BhdGNoPFJlYWN0LlNldFN0YXRlQWN0aW9uPG51bWJlcj4+XG4gIGxhc3RMZW5ndGg6IG51bWJlclxuICBzZXRMYXN0TGVuZ3RoOiBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxudW1iZXI+PlxuICBkcmFnZ2luZzogYm9vbGVhblxuICBzZXREcmFnZ2luZzogUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248Ym9vbGVhbj4+XG59XG5leHBvcnQgY29uc3QgdXNlUmVzaXphYmxlR3JpZCA9ICh7XG4gIHN0YXJ0aW5nTGVuZ3RoID0gREVGQVVMVF9TVEFSVElOR19MRU5HVEgsXG4gIGNvbGxhcHNlZExlbmd0aCA9IERFRkFVTFRfQ09MTEFQU0VEX0xFTkdUSCxcbiAgYXV0b0NvbGxhcHNlTGVuZ3RoID0gREVGQVVMVF9BVVRPX0NPTExBUFNFX0xFTkdUSCxcbn06IHtcbiAgc3RhcnRpbmdMZW5ndGg/OiBudW1iZXJcbiAgY29sbGFwc2VkTGVuZ3RoPzogbnVtYmVyXG4gIGF1dG9Db2xsYXBzZUxlbmd0aD86IG51bWJlclxufSA9IHt9KTogdXNlUmVzaXphYmxlR3JpZFR5cGUgPT4ge1xuICBjb25zdCBbY2xvc2VkLCBzZXRDbG9zZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtsZW5ndGgsIHNldExlbmd0aF0gPSBSZWFjdC51c2VTdGF0ZShzdGFydGluZ0xlbmd0aClcbiAgY29uc3QgW2xhc3RMZW5ndGgsIHNldExhc3RMZW5ndGhdID0gUmVhY3QudXNlU3RhdGUoc3RhcnRpbmdMZW5ndGgpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFkcmFnZ2luZykge1xuICAgICAgaWYgKGxlbmd0aCA8IGF1dG9Db2xsYXBzZUxlbmd0aCkge1xuICAgICAgICBzZXRDbG9zZWQodHJ1ZSlcbiAgICAgICAgc2V0TGVuZ3RoKGNvbGxhcHNlZExlbmd0aClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldExhc3RMZW5ndGgobGVuZ3RoKVxuICAgICAgICBzZXRDbG9zZWQoZmFsc2UpXG4gICAgICB9XG4gICAgfVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignZ2wtdXBkYXRlU2l6ZScpXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdyZXNpemUnKVxuICAgIH0sIDUwMClcbiAgfSwgW2xlbmd0aCwgZHJhZ2dpbmddKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjbG9zZWQgJiYgbGVuZ3RoICE9PSBjb2xsYXBzZWRMZW5ndGgpIHtcbiAgICAgIHNldExhc3RMZW5ndGgobGVuZ3RoKVxuICAgICAgc2V0TGVuZ3RoKGNvbGxhcHNlZExlbmd0aClcbiAgICB9XG4gIH0sIFtjbG9zZWRdKVxuICByZXR1cm4ge1xuICAgIGxlbmd0aCxcbiAgICBjbG9zZWQsXG4gICAgc2V0Q2xvc2VkLFxuICAgIHNldExlbmd0aCxcbiAgICBsYXN0TGVuZ3RoLFxuICAgIHNldExhc3RMZW5ndGgsXG4gICAgZHJhZ2dpbmcsXG4gICAgc2V0RHJhZ2dpbmcsXG4gIH1cbn1cbmV4cG9ydCBjb25zdCBDdXN0b21SZXNpemFibGVHcmlkID0gc3R5bGVkKFJlc2l6YWJsZUdyaWQpYFxuICAuYWN0aW9ucyB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTEwMCUpO1xuICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycyBlYXNlLWluLW91dCAwLjVzLCB0cmFuc2Zvcm0gMC4ycyBlYXNlLWluLW91dCAwLjVzO1xuICB9XG4gID4gc3BhbiA+IGRpdjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjEpO1xuICB9XG5cbiAgOmZvY3VzLXdpdGhpbiAuYWN0aW9ucyxcbiAgOmhvdmVyIC5hY3Rpb25zIHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZS1pbi1vdXQsIHRyYW5zZm9ybSAwLjJzIGVhc2UtaW4tb3V0O1xuICB9XG4gIC5hY3Rpb25zID4gZGl2ICsgZGl2IHtcbiAgICBtYXJnaW4tdG9wOiAxMHB4O1xuICB9XG5gXG50eXBlIFNwbGl0UGFuZVByb3BzID0ge1xuICBmaXJzdFN0eWxlPzogUmVhY3QuQ1NTUHJvcGVydGllcyB8IHVuZGVmaW5lZFxuICBzZWNvbmRTdHlsZT86IFJlYWN0LkNTU1Byb3BlcnRpZXMgfCB1bmRlZmluZWRcbiAgdmFyaWFudDogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJ1xuICBjaGlsZHJlbjogW1JlYWN0LlJlYWN0Tm9kZSwgUmVhY3QuUmVhY3ROb2RlXVxuICBjb2xsYXBzZWRMZW5ndGg/OiBudW1iZXJcbiAgYXV0b0NvbGxhcHNlTGVuZ3RoPzogbnVtYmVyXG4gIHN0YXJ0aW5nTGVuZ3RoPzogbnVtYmVyXG4gIGNvbnRyb2xsZWQ/OiB1c2VSZXNpemFibGVHcmlkVHlwZSAvLyB1c2VmdWwgdG8gaGF2ZSBpbW1lZGlhdGUgYWNjZXNzIHRvIGNsb3NlZCB3aXRob3V0IG5lZWRpbmcgdG8gc3BsaXQgb3V0IGNvbXBvbmVudHNcbn1cblxuZXhwb3J0IGNvbnN0IFNwbGl0UGFuZSA9ICh7XG4gIHNlY29uZFN0eWxlLFxuICB2YXJpYW50LFxuICBjaGlsZHJlbixcbiAgY29sbGFwc2VkTGVuZ3RoID0gREVGQVVMVF9DT0xMQVBTRURfTEVOR1RILFxuICBhdXRvQ29sbGFwc2VMZW5ndGggPSBERUZBVUxUX0FVVE9fQ09MTEFQU0VfTEVOR1RILFxuICBzdGFydGluZ0xlbmd0aCA9IERFRkFVTFRfU1RBUlRJTkdfTEVOR1RILFxuICBjb250cm9sbGVkLFxufTogU3BsaXRQYW5lUHJvcHMpID0+IHtcbiAgY29uc3Qge1xuICAgIGxlbmd0aCxcbiAgICBjbG9zZWQsXG4gICAgc2V0Q2xvc2VkLFxuICAgIHNldExlbmd0aCxcbiAgICBsYXN0TGVuZ3RoLFxuICAgIHNldExhc3RMZW5ndGgsXG4gICAgZHJhZ2dpbmcsXG4gICAgc2V0RHJhZ2dpbmcsXG4gIH0gPVxuICAgIGNvbnRyb2xsZWQgfHxcbiAgICB1c2VSZXNpemFibGVHcmlkKHtcbiAgICAgIHN0YXJ0aW5nTGVuZ3RoLFxuICAgICAgY29sbGFwc2VkTGVuZ3RoLFxuICAgICAgYXV0b0NvbGxhcHNlTGVuZ3RoLFxuICAgIH0pXG4gIGNvbnN0IFtGaXJzdCwgU2Vjb25kXSA9IGNoaWxkcmVuXG4gIHJldHVybiAoXG4gICAgPFVzZVJlc2l6YWJsZUdyaWRDb250ZXh0UHJvdmlkZXJcbiAgICAgIHZhbHVlPXt7XG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgY2xvc2VkLFxuICAgICAgICBzZXRDbG9zZWQsXG4gICAgICAgIHNldExlbmd0aCxcbiAgICAgICAgbGFzdExlbmd0aCxcbiAgICAgICAgc2V0TGFzdExlbmd0aCxcbiAgICAgICAgZHJhZ2dpbmcsXG4gICAgICAgIHNldERyYWdnaW5nLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8R3JpZFxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgIGRpcmVjdGlvbj17KCgpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKHZhcmlhbnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgICByZXR1cm4gJ3JvdydcbiAgICAgICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgICAgICAgcmV0dXJuICdjb2x1bW4nXG4gICAgICAgICAgfVxuICAgICAgICB9KSgpfVxuICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCJcbiAgICAgID5cbiAgICAgICAgPEN1c3RvbVJlc2l6YWJsZUdyaWRcbiAgICAgICAgICBjb21wb25lbnQ9e1Jlc2l6YWJsZX1cbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgc2l6ZT17KCgpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAodmFyaWFudCkge1xuICAgICAgICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgd2lkdGg6IGxlbmd0aCxcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBsZW5ndGgsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgbWluV2lkdGg9e2NvbGxhcHNlZExlbmd0aH1cbiAgICAgICAgICBlbmFibGU9eygoKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKHZhcmlhbnQpIHtcbiAgICAgICAgICAgICAgY2FzZSAnaG9yaXpvbnRhbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIHRvcDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICByaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGJvdHRvbTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIHRvcFJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGJvdHRvbVJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGJvdHRvbUxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgdG9wTGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIHRvcDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBib3R0b206IHRydWUsXG4gICAgICAgICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIHRvcFJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGJvdHRvbVJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGJvdHRvbUxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgdG9wTGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBvblJlc2l6ZVN0b3A9eygpID0+IHtcbiAgICAgICAgICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICAgICAgICAgIH19XG4gICAgICAgICAgb25SZXNpemVTdGFydD17KCkgPT4ge1xuICAgICAgICAgICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIG9uUmVzaXplPXsoZSkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh2YXJpYW50KSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgICAgIHNldExlbmd0aChcbiAgICAgICAgICAgICAgICAgIChlIGFzIGFueSkuY2xpZW50WCAtXG4gICAgICAgICAgICAgICAgICAgIChlLnRhcmdldCBhcyBhbnkpLnBhcmVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkueFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICAgICAgc2V0TGVuZ3RoKFxuICAgICAgICAgICAgICAgICAgKGUgYXMgYW55KS5jbGllbnRZIC1cbiAgICAgICAgICAgICAgICAgICAgKGUudGFyZ2V0IGFzIGFueSkucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS55XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ6LTEwIHByLTJcIlxuICAgICAgICA+XG4gICAgICAgICAge0ZpcnN0fVxuICAgICAgICA8L0N1c3RvbVJlc2l6YWJsZUdyaWQ+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgaXRlbVxuICAgICAgICAgIHN0eWxlPXsoKCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh2YXJpYW50KSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiBgY2FsYygxMDAlIC0gJHtsZW5ndGh9cHgpYCxcbiAgICAgICAgICAgICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgICAgICAgICAgICAuLi5zZWNvbmRTdHlsZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBgY2FsYygxMDAlIC0gJHtsZW5ndGh9cHgpYCxcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgICAgICAgICAgICAgLi4uc2Vjb25kU3R5bGUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKCl9XG4gICAgICAgID5cbiAgICAgICAgICB7U2Vjb25kfVxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgPC9Vc2VSZXNpemFibGVHcmlkQ29udGV4dFByb3ZpZGVyPlxuICApXG59XG4iXX0=