import { __assign, __makeTemplateObject, __rest } from "tslib";
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
import * as React from 'react';
import styled from 'styled-components';
var Root = styled.span(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: inline-block;\n  line-height: inherit;\n  vertical-align: top;\n  color: ", ";\n\n  transition: ", ";\n\n  transform: ", ";\n  opacity: ", ";\n"], ["\n  display: inline-block;\n  line-height: inherit;\n  vertical-align: top;\n  color: ", ";\n\n  transition: ", ";\n\n  transform: ", ";\n  opacity: ", ";\n"])), function (props) {
    return props.theme.warningColor;
}, function (_a) {
    var theme = _a.theme;
    return "transform ".concat(theme.coreTransitionTime, " ease-out, opacity ").concat(theme.coreTransitionTime, " ease-out;");
}, function (props) { return "scale(".concat(props.shown ? 1 : 2, ");"); }, function (props) { return (props.shown ? 1 : 0); });
export default function UnsavedIndicator(props) {
    var className = props.className, style = props.style, otherProps = __rest(props, ["className", "style"]);
    return (React.createElement(Root, __assign({ className: className, style: style }, otherProps), "*"));
}
var templateObject_1;
//# sourceMappingURL=unsaved-indicator.js.map