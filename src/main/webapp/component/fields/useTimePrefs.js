import { __read } from "tslib";
import { useState, useEffect } from 'react';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import user from '../singletons/user-instance';
var useTimePrefs = function (action) {
    var _a = useBackbone(), listenTo = _a.listenTo, stopListening = _a.stopListening;
    var _b = __read(useState(Math.random()), 2), setForceRender = _b[1];
    useEffect(function () {
        var callback = function () {
            setForceRender(Math.random());
            action && action();
        };
        listenTo(user.getPreferences(), 'change:dateTimeFormat change:timeZone', callback);
        return function () {
            return stopListening(user.getPreferences(), 'change:dateTimeFormat change:timeZone', callback);
        };
    }, []);
};
export default useTimePrefs;
//# sourceMappingURL=useTimePrefs.js.map