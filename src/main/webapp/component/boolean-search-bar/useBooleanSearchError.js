import { __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) Connexta, LLC */
import { useState, useEffect } from 'react';
var ERROR_MESSAGES = {
    punctuation: (_jsxs("div", { children: ["Invalid Query:", _jsx("div", { children: "If using characters outside the alphabet (a-z), make sure to quote them like so (\"big.doc\" or \"bill's car\")." })] })),
    syntax: (_jsxs("div", { children: ["Invalid Query:", _jsx("div", { children: "Check that syntax of AND / OR / NOT is used correctly." })] })),
    both: (_jsxs("div", { children: ["Invalid Query:", _jsx("div", { children: "If using characters outside the alphabet (a-z), make sure to quote them like so (\"big.doc\" or \"bill's car\")." }), _jsx("div", { children: "Check that syntax of AND / OR / NOT is used correctly." })] })),
    custom: function (message) { return _jsxs("div", { children: ["Invalid Query: ", message] }); },
};
var useBooleanSearchError = function (value) {
    var _a = __read(useState(ERROR_MESSAGES.both), 2), errorMessage = _a[0], setErrorMessage = _a[1];
    useEffect(function () {
        if (value.error) {
            if (value.errorMessage) {
                setErrorMessage(ERROR_MESSAGES.custom(value.errorMessage));
            }
            else {
                setErrorMessage(ERROR_MESSAGES.syntax);
            }
        }
    }, [value]);
    return { errorMessage: errorMessage };
};
export default useBooleanSearchError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlQm9vbGVhblNlYXJjaEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9ib29sZWFuLXNlYXJjaC1iYXIvdXNlQm9vbGVhblNlYXJjaEVycm9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUVqQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUczQyxJQUFNLGNBQWMsR0FBRztJQUNyQixXQUFXLEVBQUUsQ0FDWCw0Q0FFRSw2SUFHTSxJQUNGLENBQ1A7SUFDRCxNQUFNLEVBQUUsQ0FDTiw0Q0FFRSxtRkFBaUUsSUFDN0QsQ0FDUDtJQUNELElBQUksRUFBRSxDQUNKLDRDQUVFLDZJQUdNLEVBQ04sbUZBQWlFLElBQzdELENBQ1A7SUFDRCxNQUFNLEVBQUUsVUFBQyxPQUFlLElBQUssT0FBQSw2Q0FBcUIsT0FBTyxJQUFPLEVBQW5DLENBQW1DO0NBQ2pFLENBQUE7QUFFRCxJQUFNLHFCQUFxQixHQUFHLFVBQUMsS0FBc0I7SUFDN0MsSUFBQSxLQUFBLE9BQWtDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUEsRUFBOUQsWUFBWSxRQUFBLEVBQUUsZUFBZSxRQUFpQyxDQUFBO0lBRXJFLFNBQVMsQ0FBQztRQUNSLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hCLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN2QixlQUFlLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQTtZQUM1RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sZUFBZSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN4QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFFWCxPQUFPLEVBQUUsWUFBWSxjQUFBLEVBQUUsQ0FBQTtBQUN6QixDQUFDLENBQUE7QUFFRCxlQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyogQ29weXJpZ2h0IChjKSBDb25uZXh0YSwgTExDICovXG5cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJvb2xlYW5UZXh0VHlwZSB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5cbmNvbnN0IEVSUk9SX01FU1NBR0VTID0ge1xuICBwdW5jdHVhdGlvbjogKFxuICAgIDxkaXY+XG4gICAgICBJbnZhbGlkIFF1ZXJ5OlxuICAgICAgPGRpdj5cbiAgICAgICAgSWYgdXNpbmcgY2hhcmFjdGVycyBvdXRzaWRlIHRoZSBhbHBoYWJldCAoYS16KSwgbWFrZSBzdXJlIHRvIHF1b3RlIHRoZW1cbiAgICAgICAgbGlrZSBzbyAoXCJiaWcuZG9jXCIgb3IgXCJiaWxsJ3MgY2FyXCIpLlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICksXG4gIHN5bnRheDogKFxuICAgIDxkaXY+XG4gICAgICBJbnZhbGlkIFF1ZXJ5OlxuICAgICAgPGRpdj5DaGVjayB0aGF0IHN5bnRheCBvZiBBTkQgLyBPUiAvIE5PVCBpcyB1c2VkIGNvcnJlY3RseS48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKSxcbiAgYm90aDogKFxuICAgIDxkaXY+XG4gICAgICBJbnZhbGlkIFF1ZXJ5OlxuICAgICAgPGRpdj5cbiAgICAgICAgSWYgdXNpbmcgY2hhcmFjdGVycyBvdXRzaWRlIHRoZSBhbHBoYWJldCAoYS16KSwgbWFrZSBzdXJlIHRvIHF1b3RlIHRoZW1cbiAgICAgICAgbGlrZSBzbyAoXCJiaWcuZG9jXCIgb3IgXCJiaWxsJ3MgY2FyXCIpLlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2PkNoZWNrIHRoYXQgc3ludGF4IG9mIEFORCAvIE9SIC8gTk9UIGlzIHVzZWQgY29ycmVjdGx5LjwvZGl2PlxuICAgIDwvZGl2PlxuICApLFxuICBjdXN0b206IChtZXNzYWdlOiBzdHJpbmcpID0+IDxkaXY+SW52YWxpZCBRdWVyeToge21lc3NhZ2V9PC9kaXY+LFxufVxuXG5jb25zdCB1c2VCb29sZWFuU2VhcmNoRXJyb3IgPSAodmFsdWU6IEJvb2xlYW5UZXh0VHlwZSkgPT4ge1xuICBjb25zdCBbZXJyb3JNZXNzYWdlLCBzZXRFcnJvck1lc3NhZ2VdID0gdXNlU3RhdGUoRVJST1JfTUVTU0FHRVMuYm90aClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh2YWx1ZS5lcnJvcikge1xuICAgICAgaWYgKHZhbHVlLmVycm9yTWVzc2FnZSkge1xuICAgICAgICBzZXRFcnJvck1lc3NhZ2UoRVJST1JfTUVTU0FHRVMuY3VzdG9tKHZhbHVlLmVycm9yTWVzc2FnZSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRFcnJvck1lc3NhZ2UoRVJST1JfTUVTU0FHRVMuc3ludGF4KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW3ZhbHVlXSlcblxuICByZXR1cm4geyBlcnJvck1lc3NhZ2UgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB1c2VCb29sZWFuU2VhcmNoRXJyb3JcbiJdfQ==