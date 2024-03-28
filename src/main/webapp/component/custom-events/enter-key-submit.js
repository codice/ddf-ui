import { __read } from "tslib";
import React from 'react';
export var enterKeySubmitEventName = 'enter key submit';
export var EnterKeySubmitEventHandler = function (e) {
    if (e.key === 'Enter') {
        dispatchEnterKeySubmitEvent(e);
    }
};
export var EnterKeySubmitProps = {
    onKeyUp: EnterKeySubmitEventHandler,
};
export var dispatchEnterKeySubmitEvent = function (e) {
    var customEvent = new CustomEvent(enterKeySubmitEventName, {
        detail: e,
        bubbles: true,
    });
    e.target.dispatchEvent(customEvent);
};
export var useListenToEnterKeySubmitEvent = function (_a) {
    var callback = _a.callback;
    var _b = __read(React.useState(null), 2), element = _b[0], setElement = _b[1];
    React.useEffect(function () {
        if (element) {
            element.addEventListener(enterKeySubmitEventName, callback);
            return function () {
                element.removeEventListener(enterKeySubmitEventName, callback);
            };
        }
        return function () { };
    }, [element, callback]);
    return {
        setElement: setElement,
    };
};
//# sourceMappingURL=enter-key-submit.js.map