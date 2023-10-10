import * as React from 'react';
export var Memo = function (_a) {
    var _b = _a.dependencies, dependencies = _b === void 0 ? [] : _b, children = _a.children;
    return React.useMemo(function () {
        return React.createElement(React.Fragment, null, children);
    }, dependencies);
};
//# sourceMappingURL=memo.js.map