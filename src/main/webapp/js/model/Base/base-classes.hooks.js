import { __read } from "tslib";
// hooks to deal with the base classes
import React from 'react';
export function useSubscribable(subscribable, thing, callback) {
    React.useEffect(function () {
        return subscribable.subscribeTo({ subscribableThing: thing, callback: callback });
    }, [subscribable, thing, callback]);
}
export function useOverridable(overridable) {
    var _a = __read(React.useState(overridable.get()), 2), value = _a[0], setValue = _a[1];
    useSubscribable(overridable, 'override', setValue);
    return value;
}
//# sourceMappingURL=base-classes.hooks.js.map