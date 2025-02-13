import { __read } from "tslib";
/* Copyright (c) Connexta, LLC */
import * as React from 'react';
import { useState, useEffect } from 'react';
var ERROR_MESSAGES = {
    punctuation: (React.createElement("div", null,
        "Invalid Query:",
        React.createElement("div", null, "If using characters outside the alphabet (a-z), make sure to quote them like so (\"big.doc\" or \"bill's car\")."))),
    syntax: (React.createElement("div", null,
        "Invalid Query:",
        React.createElement("div", null, "Check that syntax of AND / OR / NOT is used correctly."))),
    both: (React.createElement("div", null,
        "Invalid Query:",
        React.createElement("div", null, "If using characters outside the alphabet (a-z), make sure to quote them like so (\"big.doc\" or \"bill's car\")."),
        React.createElement("div", null, "Check that syntax of AND / OR / NOT is used correctly."))),
    custom: function (message) { return React.createElement("div", null,
        "Invalid Query: ",
        message); },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlQm9vbGVhblNlYXJjaEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9ib29sZWFuLXNlYXJjaC1iYXIvdXNlQm9vbGVhblNlYXJjaEVycm9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUNBQWlDO0FBQ2pDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBRzNDLElBQU0sY0FBYyxHQUFHO0lBQ3JCLFdBQVcsRUFBRSxDQUNYOztRQUVFLG9KQUdNLENBQ0YsQ0FDUDtJQUNELE1BQU0sRUFBRSxDQUNOOztRQUVFLDBGQUFpRSxDQUM3RCxDQUNQO0lBQ0QsSUFBSSxFQUFFLENBQ0o7O1FBRUUsb0pBR007UUFDTiwwRkFBaUUsQ0FDN0QsQ0FDUDtJQUNELE1BQU0sRUFBRSxVQUFDLE9BQWUsSUFBSyxPQUFBOztRQUFxQixPQUFPLENBQU8sRUFBbkMsQ0FBbUM7Q0FDakUsQ0FBQTtBQUVELElBQU0scUJBQXFCLEdBQUcsVUFBQyxLQUFzQjtJQUM3QyxJQUFBLEtBQUEsT0FBa0MsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBQSxFQUE5RCxZQUFZLFFBQUEsRUFBRSxlQUFlLFFBQWlDLENBQUE7SUFFckUsU0FBUyxDQUFDO1FBQ1IsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ2YsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFO2dCQUN0QixlQUFlLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQTthQUMzRDtpQkFBTTtnQkFDTCxlQUFlLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQ3ZDO1NBQ0Y7SUFDSCxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRVgsT0FBTyxFQUFFLFlBQVksY0FBQSxFQUFFLENBQUE7QUFDekIsQ0FBQyxDQUFBO0FBRUQsZUFBZSxxQkFBcUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qIENvcHlyaWdodCAoYykgQ29ubmV4dGEsIExMQyAqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb29sZWFuVGV4dFR5cGUgfSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuXG5jb25zdCBFUlJPUl9NRVNTQUdFUyA9IHtcbiAgcHVuY3R1YXRpb246IChcbiAgICA8ZGl2PlxuICAgICAgSW52YWxpZCBRdWVyeTpcbiAgICAgIDxkaXY+XG4gICAgICAgIElmIHVzaW5nIGNoYXJhY3RlcnMgb3V0c2lkZSB0aGUgYWxwaGFiZXQgKGEteiksIG1ha2Ugc3VyZSB0byBxdW90ZSB0aGVtXG4gICAgICAgIGxpa2Ugc28gKFwiYmlnLmRvY1wiIG9yIFwiYmlsbCdzIGNhclwiKS5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApLFxuICBzeW50YXg6IChcbiAgICA8ZGl2PlxuICAgICAgSW52YWxpZCBRdWVyeTpcbiAgICAgIDxkaXY+Q2hlY2sgdGhhdCBzeW50YXggb2YgQU5EIC8gT1IgLyBOT1QgaXMgdXNlZCBjb3JyZWN0bHkuPC9kaXY+XG4gICAgPC9kaXY+XG4gICksXG4gIGJvdGg6IChcbiAgICA8ZGl2PlxuICAgICAgSW52YWxpZCBRdWVyeTpcbiAgICAgIDxkaXY+XG4gICAgICAgIElmIHVzaW5nIGNoYXJhY3RlcnMgb3V0c2lkZSB0aGUgYWxwaGFiZXQgKGEteiksIG1ha2Ugc3VyZSB0byBxdW90ZSB0aGVtXG4gICAgICAgIGxpa2Ugc28gKFwiYmlnLmRvY1wiIG9yIFwiYmlsbCdzIGNhclwiKS5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdj5DaGVjayB0aGF0IHN5bnRheCBvZiBBTkQgLyBPUiAvIE5PVCBpcyB1c2VkIGNvcnJlY3RseS48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKSxcbiAgY3VzdG9tOiAobWVzc2FnZTogc3RyaW5nKSA9PiA8ZGl2PkludmFsaWQgUXVlcnk6IHttZXNzYWdlfTwvZGl2Pixcbn1cblxuY29uc3QgdXNlQm9vbGVhblNlYXJjaEVycm9yID0gKHZhbHVlOiBCb29sZWFuVGV4dFR5cGUpID0+IHtcbiAgY29uc3QgW2Vycm9yTWVzc2FnZSwgc2V0RXJyb3JNZXNzYWdlXSA9IHVzZVN0YXRlKEVSUk9SX01FU1NBR0VTLmJvdGgpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAodmFsdWUuZXJyb3IpIHtcbiAgICAgIGlmICh2YWx1ZS5lcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgc2V0RXJyb3JNZXNzYWdlKEVSUk9SX01FU1NBR0VTLmN1c3RvbSh2YWx1ZS5lcnJvck1lc3NhZ2UpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RXJyb3JNZXNzYWdlKEVSUk9SX01FU1NBR0VTLnN5bnRheClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFt2YWx1ZV0pXG5cbiAgcmV0dXJuIHsgZXJyb3JNZXNzYWdlIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgdXNlQm9vbGVhblNlYXJjaEVycm9yXG4iXX0=