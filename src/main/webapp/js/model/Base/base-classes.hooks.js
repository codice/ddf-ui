import { __read } from "tslib";
// hooks to deal with the base classes
import React from 'react';
export function useSubscribable(subscribable, thing, callback) {
    React.useEffect(function () {
        return subscribable.subscribeTo({ subscribableThing: thing, callback: callback });
    }, [subscribable, thing, callback]);
}
/**
 * Notice that we are passing a function to useState. This is because useState will call functions
 * that are passed to it to compute the initial state. Since overridable.get() could return a function,
 * we need to encapsulate the call to it within another function to ensure that useState handles it correctly.
 * Similar with setValue, when passed a function it assumes you're trying to access the previous state, so we
 * need to encapsulate that call as well.
 */
export function useOverridable(overridable) {
    var _a = __read(React.useState(function () { return overridable.get(); }), 2), value = _a[0], setValue = _a[1];
    useSubscribable(overridable, 'override', function () {
        setValue(function () { return overridable.get(); });
    });
    return value;
}
//# sourceMappingURL=base-classes.hooks.js.map