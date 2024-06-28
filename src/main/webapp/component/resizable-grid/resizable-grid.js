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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLWdyaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Jlc2l6YWJsZS1ncmlkL3Jlc2l6YWJsZS1ncmlkLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sRUFBRSxTQUFTLEVBQWtCLE1BQU0sY0FBYyxDQUFBO0FBQ3hELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsQyxNQUFNLENBQUMsSUFBTSw0QkFBNEIsR0FBRyxHQUFHLENBQUE7QUFDL0MsTUFBTSxDQUFDLElBQU0sdUJBQXVCLEdBQUcsR0FBRyxDQUFBO0FBQzFDLE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFHLEVBQUUsQ0FBQTtBQVMxQyxJQUFNLGFBQWEsR0FBRyxJQUF5QixDQUFBO0FBQy9DLE1BQU0sQ0FBUSxJQUFBLHVCQUF1QixJQUF4QixLQUFBLE9BQ1gsU0FBUyxDQUF1QjtJQUM5QixNQUFNLEVBQUUsS0FBSztDQUNkLENBQUMsSUFBQSxRQUhpQyxFQUFFLCtCQUErQixRQUFBLENBR2xFO0FBV0osTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxFQVEzQjtRQVIyQixxQkFRN0IsRUFBRSxLQUFBLEVBUEosc0JBQXdDLEVBQXhDLGNBQWMsbUJBQUcsdUJBQXVCLEtBQUEsRUFDeEMsdUJBQTBDLEVBQTFDLGVBQWUsbUJBQUcsd0JBQXdCLEtBQUEsRUFDMUMsMEJBQWlELEVBQWpELGtCQUFrQixtQkFBRyw0QkFBNEIsS0FBQTtJQU0zQyxJQUFBLEtBQUEsT0FBc0IsS0FBSyxDQUFDLFFB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QkFBZSxNQUFNLFFBQUssRUFDbEMsS0FBSyxFQUFFLE1BQU0sRUFDYixVQUFVLEVBQUUsQ0FBQyxJQUNWLFdBQVcsRUFDZjtxQkFDSjtnQkFDSCxDQUFDLENBQUMsRUFBRSxJQUVILE1BQU0sQ0FDRixDQUNGLENBQ3lCLENBQ25DLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCB7IFJlc2l6YWJsZSwgUmVzaXphYmxlUHJvcHMgfSBmcm9tICdyZS1yZXNpemFibGUnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgY3JlYXRlQ3R4IH0gZnJvbSAnLi4vLi4vdHlwZXNjcmlwdC9jb250ZXh0J1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uL2pzL3dyZXFyJ1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVVUT19DT0xMQVBTRV9MRU5HVEggPSAzMDBcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUQVJUSU5HX0xFTkdUSCA9IDU1MFxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MTEFQU0VEX0xFTkdUSCA9IDc1XG50eXBlIFJlc2l6YWJsZUdyaWRUeXBlID0gUmVhY3QuQ29tcG9uZW50VHlwZTxcbiAgUmVhY3QuUHJvcHNXaXRoQ2hpbGRyZW48XG4gICAgUmVzaXphYmxlUHJvcHMgJiB7XG4gICAgICBjb21wb25lbnQ6IGFueVxuICAgICAgaXRlbTogYW55XG4gICAgfVxuICA+XG4+XG5jb25zdCBSZXNpemFibGVHcmlkID0gR3JpZCBhcyBSZXNpemFibGVHcmlkVHlwZVxuZXhwb3J0IGNvbnN0IFt1c2VSZXNpemFibGVHcmlkQ29udGV4dCwgVXNlUmVzaXphYmxlR3JpZENvbnRleHRQcm92aWRlcl0gPVxuICBjcmVhdGVDdHg8dXNlUmVzaXphYmxlR3JpZFR5cGU+KHtcbiAgICBjbG9zZWQ6IGZhbHNlLFxuICB9KVxudHlwZSB1c2VSZXNpemFibGVHcmlkVHlwZSA9IHtcbiAgbGVuZ3RoOiBudW1iZXJcbiAgY2xvc2VkOiBib29sZWFuXG4gIHNldENsb3NlZDogUmVhY3QuRGlzcGF0Y2g8Ym9vbGVhbj5cbiAgc2V0TGVuZ3RoOiBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxudW1iZXI+PlxuICBsYXN0TGVuZ3RoOiBudW1iZXJcbiAgc2V0TGFzdExlbmd0aDogUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248bnVtYmVyPj5cbiAgZHJhZ2dpbmc6IGJvb2xlYW5cbiAgc2V0RHJhZ2dpbmc6IFJlYWN0LkRpc3BhdGNoPFJlYWN0LlNldFN0YXRlQWN0aW9uPGJvb2xlYW4+PlxufVxuZXhwb3J0IGNvbnN0IHVzZVJlc2l6YWJsZUdyaWQgPSAoe1xuICBzdGFydGluZ0xlbmd0aCA9IERFRkFVTFRfU1RBUlRJTkdfTEVOR1RILFxuICBjb2xsYXBzZWRMZW5ndGggPSBERUZBVUxUX0NPTExBUFNFRF9MRU5HVEgsXG4gIGF1dG9Db2xsYXBzZUxlbmd0aCA9IERFRkFVTFRfQVVUT19DT0xMQVBTRV9MRU5HVEgsXG59OiB7XG4gIHN0YXJ0aW5nTGVuZ3RoPzogbnVtYmVyXG4gIGNvbGxhcHNlZExlbmd0aD86IG51bWJlclxuICBhdXRvQ29sbGFwc2VMZW5ndGg/OiBudW1iZXJcbn0gPSB7fSk6IHVzZVJlc2l6YWJsZUdyaWRUeXBlID0+IHtcbiAgY29uc3QgW2Nsb3NlZCwgc2V0Q2xvc2VkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbGVuZ3RoLCBzZXRMZW5ndGhdID0gUmVhY3QudXNlU3RhdGUoc3RhcnRpbmdMZW5ndGgpXG4gIGNvbnN0IFtsYXN0TGVuZ3RoLCBzZXRMYXN0TGVuZ3RoXSA9IFJlYWN0LnVzZVN0YXRlKHN0YXJ0aW5nTGVuZ3RoKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghZHJhZ2dpbmcpIHtcbiAgICAgIGlmIChsZW5ndGggPCBhdXRvQ29sbGFwc2VMZW5ndGgpIHtcbiAgICAgICAgc2V0Q2xvc2VkKHRydWUpXG4gICAgICAgIHNldExlbmd0aChjb2xsYXBzZWRMZW5ndGgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRMYXN0TGVuZ3RoKGxlbmd0aClcbiAgICAgICAgc2V0Q2xvc2VkKGZhbHNlKVxuICAgICAgfVxuICAgIH1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ2dsLXVwZGF0ZVNpemUnKVxuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcigncmVzaXplJylcbiAgICB9LCA1MDApXG4gIH0sIFtsZW5ndGgsIGRyYWdnaW5nXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY2xvc2VkICYmIGxlbmd0aCAhPT0gY29sbGFwc2VkTGVuZ3RoKSB7XG4gICAgICBzZXRMYXN0TGVuZ3RoKGxlbmd0aClcbiAgICAgIHNldExlbmd0aChjb2xsYXBzZWRMZW5ndGgpXG4gICAgfVxuICB9LCBbY2xvc2VkXSlcbiAgcmV0dXJuIHtcbiAgICBsZW5ndGgsXG4gICAgY2xvc2VkLFxuICAgIHNldENsb3NlZCxcbiAgICBzZXRMZW5ndGgsXG4gICAgbGFzdExlbmd0aCxcbiAgICBzZXRMYXN0TGVuZ3RoLFxuICAgIGRyYWdnaW5nLFxuICAgIHNldERyYWdnaW5nLFxuICB9XG59XG5leHBvcnQgY29uc3QgQ3VzdG9tUmVzaXphYmxlR3JpZCA9IHN0eWxlZChSZXNpemFibGVHcmlkKWBcbiAgLmFjdGlvbnMge1xuICAgIG9wYWNpdHk6IDA7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0xMDAlKTtcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZS1pbi1vdXQgMC41cywgdHJhbnNmb3JtIDAuMnMgZWFzZS1pbi1vdXQgMC41cztcbiAgfVxuICA+IHNwYW4gPiBkaXY6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgfVxuXG4gIDpmb2N1cy13aXRoaW4gLmFjdGlvbnMsXG4gIDpob3ZlciAuYWN0aW9ucyB7XG4gICAgb3BhY2l0eTogMTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGVhc2UtaW4tb3V0LCB0cmFuc2Zvcm0gMC4ycyBlYXNlLWluLW91dDtcbiAgfVxuICAuYWN0aW9ucyA+IGRpdiArIGRpdiB7XG4gICAgbWFyZ2luLXRvcDogMTBweDtcbiAgfVxuYFxudHlwZSBTcGxpdFBhbmVQcm9wcyA9IHtcbiAgZmlyc3RTdHlsZT86IFJlYWN0LkNTU1Byb3BlcnRpZXMgfCB1bmRlZmluZWRcbiAgc2Vjb25kU3R5bGU/OiBSZWFjdC5DU1NQcm9wZXJ0aWVzIHwgdW5kZWZpbmVkXG4gIHZhcmlhbnQ6ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCdcbiAgY2hpbGRyZW46IFtSZWFjdC5SZWFjdE5vZGUsIFJlYWN0LlJlYWN0Tm9kZV1cbiAgY29sbGFwc2VkTGVuZ3RoPzogbnVtYmVyXG4gIGF1dG9Db2xsYXBzZUxlbmd0aD86IG51bWJlclxuICBzdGFydGluZ0xlbmd0aD86IG51bWJlclxuICBjb250cm9sbGVkPzogdXNlUmVzaXphYmxlR3JpZFR5cGUgLy8gdXNlZnVsIHRvIGhhdmUgaW1tZWRpYXRlIGFjY2VzcyB0byBjbG9zZWQgd2l0aG91dCBuZWVkaW5nIHRvIHNwbGl0IG91dCBjb21wb25lbnRzXG59XG5cbmV4cG9ydCBjb25zdCBTcGxpdFBhbmUgPSAoe1xuICBzZWNvbmRTdHlsZSxcbiAgdmFyaWFudCxcbiAgY2hpbGRyZW4sXG4gIGNvbGxhcHNlZExlbmd0aCA9IERFRkFVTFRfQ09MTEFQU0VEX0xFTkdUSCxcbiAgYXV0b0NvbGxhcHNlTGVuZ3RoID0gREVGQVVMVF9BVVRPX0NPTExBUFNFX0xFTkdUSCxcbiAgc3RhcnRpbmdMZW5ndGggPSBERUZBVUxUX1NUQVJUSU5HX0xFTkdUSCxcbiAgY29udHJvbGxlZCxcbn06IFNwbGl0UGFuZVByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBsZW5ndGgsXG4gICAgY2xvc2VkLFxuICAgIHNldENsb3NlZCxcbiAgICBzZXRMZW5ndGgsXG4gICAgbGFzdExlbmd0aCxcbiAgICBzZXRMYXN0TGVuZ3RoLFxuICAgIGRyYWdnaW5nLFxuICAgIHNldERyYWdnaW5nLFxuICB9ID1cbiAgICBjb250cm9sbGVkIHx8XG4gICAgdXNlUmVzaXphYmxlR3JpZCh7XG4gICAgICBzdGFydGluZ0xlbmd0aCxcbiAgICAgIGNvbGxhcHNlZExlbmd0aCxcbiAgICAgIGF1dG9Db2xsYXBzZUxlbmd0aCxcbiAgICB9KVxuICBjb25zdCBbRmlyc3QsIFNlY29uZF0gPSBjaGlsZHJlblxuICByZXR1cm4gKFxuICAgIDxVc2VSZXNpemFibGVHcmlkQ29udGV4dFByb3ZpZGVyXG4gICAgICB2YWx1ZT17e1xuICAgICAgICBsZW5ndGgsXG4gICAgICAgIGNsb3NlZCxcbiAgICAgICAgc2V0Q2xvc2VkLFxuICAgICAgICBzZXRMZW5ndGgsXG4gICAgICAgIGxhc3RMZW5ndGgsXG4gICAgICAgIHNldExhc3RMZW5ndGgsXG4gICAgICAgIGRyYWdnaW5nLFxuICAgICAgICBzZXREcmFnZ2luZyxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPEdyaWRcbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICBkaXJlY3Rpb249eygoKSA9PiB7XG4gICAgICAgICAgc3dpdGNoICh2YXJpYW50KSB7XG4gICAgICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgICAgcmV0dXJuICdyb3cnXG4gICAgICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICAgIHJldHVybiAnY29sdW1uJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSkoKX1cbiAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiXG4gICAgICA+XG4gICAgICAgIDxDdXN0b21SZXNpemFibGVHcmlkXG4gICAgICAgICAgY29tcG9uZW50PXtSZXNpemFibGV9XG4gICAgICAgICAgaXRlbVxuICAgICAgICAgIHNpemU9eygoKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKHZhcmlhbnQpIHtcbiAgICAgICAgICAgICAgY2FzZSAnaG9yaXpvbnRhbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiBsZW5ndGgsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogbGVuZ3RoLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpfVxuICAgICAgICAgIG1pbldpZHRoPXtjb2xsYXBzZWRMZW5ndGh9XG4gICAgICAgICAgZW5hYmxlPXsoKCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh2YXJpYW50KSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICB0b3A6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgcmlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICBib3R0b206IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICB0b3BSaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBib3R0b21SaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBib3R0b21MZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIHRvcExlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICB0b3A6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgYm90dG9tOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICB0b3BSaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBib3R0b21SaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBib3R0b21MZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIHRvcExlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgIH19XG4gICAgICAgICAgb25SZXNpemVTdG9wPXsoKSA9PiB7XG4gICAgICAgICAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIG9uUmVzaXplU3RhcnQ9eygpID0+IHtcbiAgICAgICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgICBvblJlc2l6ZT17KGUpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAodmFyaWFudCkge1xuICAgICAgICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgICAgICBzZXRMZW5ndGgoXG4gICAgICAgICAgICAgICAgICAoZSBhcyBhbnkpLmNsaWVudFggLVxuICAgICAgICAgICAgICAgICAgICAoZS50YXJnZXQgYXMgYW55KS5wYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgICAgIHNldExlbmd0aChcbiAgICAgICAgICAgICAgICAgIChlIGFzIGFueSkuY2xpZW50WSAtXG4gICAgICAgICAgICAgICAgICAgIChlLnRhcmdldCBhcyBhbnkpLnBhcmVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkueVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwiei0xMCBwci0yXCJcbiAgICAgICAgPlxuICAgICAgICAgIHtGaXJzdH1cbiAgICAgICAgPC9DdXN0b21SZXNpemFibGVHcmlkPlxuICAgICAgICA8R3JpZFxuICAgICAgICAgIGl0ZW1cbiAgICAgICAgICBzdHlsZT17KCgpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAodmFyaWFudCkge1xuICAgICAgICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICB3aWR0aDogYGNhbGMoMTAwJSAtICR7bGVuZ3RofXB4KWAsXG4gICAgICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgICAgICAgICAgICAgLi4uc2Vjb25kU3R5bGUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogYGNhbGMoMTAwJSAtICR7bGVuZ3RofXB4KWAsXG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgZmxleFNocmluazogMSxcbiAgICAgICAgICAgICAgICAgIC4uLnNlY29uZFN0eWxlLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpfVxuICAgICAgICA+XG4gICAgICAgICAge1NlY29uZH1cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9HcmlkPlxuICAgIDwvVXNlUmVzaXphYmxlR3JpZENvbnRleHRQcm92aWRlcj5cbiAgKVxufVxuIl19