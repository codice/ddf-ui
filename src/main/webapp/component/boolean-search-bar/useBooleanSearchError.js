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
        React.createElement("div", null, "Check that syntax of AND / OR / NOT is used correctly.")))
};
var useBooleanSearchError = function (value) {
    var _a = __read(useState(ERROR_MESSAGES.both), 2), errorMessage = _a[0], setErrorMessage = _a[1];
    useEffect(function () {
        if (value.error) {
            setErrorMessage(ERROR_MESSAGES.syntax);
        }
    }, [value]);
    return { errorMessage: errorMessage };
};
export default useBooleanSearchError;
//# sourceMappingURL=useBooleanSearchError.js.map