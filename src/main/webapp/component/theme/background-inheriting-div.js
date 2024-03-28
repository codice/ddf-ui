import { __assign, __read, __rest } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
/**
 * CSS is a bit lacking when it comes to inheriting backgrounds, so this let's the dev do so a bit easier
 */
var BackgroundInheritingDiv = function (props) {
    var style = props.style, otherProps = __rest(props, ["style"]);
    var divRef = React.useRef(null);
    var _a = __read(React.useState(null), 2), background = _a[0], setBackground = _a[1];
    React.useEffect(function () {
        if (divRef.current) {
            var parentColor = divRef.current;
            while (typeof parentColor !== 'string' &&
                !parentColor.classList.contains('MuiPaper-root')) {
                if (parentColor.parentElement)
                    parentColor = parentColor.parentElement;
            }
            if (typeof parentColor !== 'string') {
                setBackground(getComputedStyle(parentColor).backgroundColor);
            }
        }
    }, []);
    return (React.createElement("div", __assign({}, otherProps, { ref: divRef, style: __assign(__assign({}, style), (background ? { background: background } : {})) })));
};
export default hot(module)(BackgroundInheritingDiv);
//# sourceMappingURL=background-inheriting-div.js.map