import { __read } from "tslib";
import React from 'react';
/**
 *  Force your component to render
 */
export var useRender = function () {
    var _a = __read(React.useState(Math.random()), 2), setRender = _a[1];
    return function () {
        setRender(Math.random());
    };
};
//# sourceMappingURL=useRender.js.map