import { __read } from "tslib";
import moment from 'moment-timezone';
import { useState } from 'react';
var withinTimeScale = function (newValues, timescale) {
    var domain = timescale.domain().map(function (value) { return moment(value); });
    if (newValues.length === 0) {
        return true;
    }
    else if (newValues.length === 1) {
        return domain[0] < newValues[0] && newValues[0] < domain[1];
    }
    else if (newValues.length === 2) {
        return domain[0] < newValues[0] && newValues[1] < domain[1];
    }
    else {
        console.debug('selectionRange can have a maximum of two elements.');
        return false;
    }
};
export var useSelectionRange = function (defaultValues, timescale) {
    var _a = __read(useState(defaultValues), 2), values = _a[0], setValues = _a[1];
    var setSelectionRange = function (newValues) {
        if (withinTimeScale(newValues, timescale)) {
            setValues(newValues);
        }
    };
    return [values, setSelectionRange];
};
//# sourceMappingURL=hooks.js.map