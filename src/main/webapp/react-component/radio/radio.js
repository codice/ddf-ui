import { __makeTemplateObject } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react';
import styled from 'styled-components';
import { readableColor, rgba } from 'polished';
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
var foreground = function (props) {
    if (props.theme.backgroundDropdown !== undefined) {
        return readableColor(props.theme.backgroundDropdown);
    }
};
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
var background = function (props, alpha) {
    if (alpha === void 0) { alpha = 0.4; }
    if (props.theme.backgroundDropdown !== undefined) {
        return rgba(readableColor(props.theme.backgroundDropdown), alpha);
    }
};
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  border-radius: ", ";\n  white-space: nowrap;\n  background-color: inherit;\n  border: 1px solid ", ";\n  display: inline-block;\n"], ["\n  border-radius: ", ";\n  white-space: nowrap;\n  background-color: inherit;\n  border: 1px solid ", ";\n  display: inline-block;\n"])), function (props) { return props.theme.borderRadius; }, background);
var Button = styled.button(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  vertical-align: top;\n  opacity: ", ";\n  min-width: ", ";\n  min-height: ", ";\n  border: none;\n  border-left: ", ";\n  background-color: inherit;\n  padding: 0px 10px;\n  cursor: pointer;\n  font-size: ", ";\n  color: ", ";\n  ", ";\n"], ["\n  vertical-align: top;\n  opacity: ", ";\n  min-width: ", ";\n  min-height: ", ";\n  border: none;\n  border-left: ", ";\n  background-color: inherit;\n  padding: 0px 10px;\n  cursor: pointer;\n  font-size: ", ";\n  color: ", ";\n  ", ";\n"])), function (props) { return props.theme.minimumOpacity; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; }, function (props) {
    return !props.first ? '1px solid ' + background(props) : 'none';
}, function (props) { return props.theme.minimumFontSize; }, foreground, function (props) {
    return props.selected
        ? "\n    opacity: 1;\n    font-weight: bolder;\n    background: ".concat(background(props, 0.1), ";\n  ")
        : '';
});
var Radio = function (props) {
    var value = props.value, children = props.children, onChange = props.onChange;
    var childrenWithProps = React.Children.map(children, function (child, i) {
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        return React.cloneElement(child, {
            first: i === 0,
            selected: value === child.props.value,
            // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
            onClick: function () { return onChange(child.props.value); },
        });
    });
    return React.createElement(Root, null, childrenWithProps);
};
var RadioItem = function (props) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'first' does not exist on type 'RadioItem... Remove this comment to see the full error message
    var value = props.value, first = props.first, children = props.children, selected = props.selected, onClick = props.onClick;
    return (React.createElement(Button, { first: first, selected: selected, onClick: function () { return onClick(value); } }, children || value));
};
export { Radio, RadioItem };
var templateObject_1, templateObject_2;
//# sourceMappingURL=radio.js.map