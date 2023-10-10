import React from 'react';
var removed = false;
/**
 * Attempts to find and remove a style, returning true if successful
 */
var removeStyle = function (_a) {
    var ruleIdentifyingFunction = _a.ruleIdentifyingFunction;
    return Boolean(Array.prototype.find.call(document.styleSheets, function (sheet) {
        return Boolean(Array.prototype.find.call(sheet.cssRules || sheet.rules, function (rule, index) {
            if (ruleIdentifyingFunction({ rule: rule })) {
                sheet.deleteRule(index);
                return true;
            }
            return false;
        }));
    }));
};
/**
 * The use of removed means this will only ever happen when it needs too.
 */
export var useRemoveFocusStyle = function () {
    React.useEffect(function () {
        if (!removed) {
            removed = removeStyle({
                ruleIdentifyingFunction: function (_a) {
                    var rule = _a.rule;
                    return (rule.style &&
                        rule.style.outline === 'rgba(19, 124, 189, 0.6) auto 2px');
                },
            });
        }
    }, []);
};
//# sourceMappingURL=blueprint.adjust.js.map