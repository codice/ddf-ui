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
import * as React from 'react';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  width: 100%;\n  height: auto;\n  white-space: nowrap;\n  padding: ", ";\n  overflow: hidden;\n\n  .source-name,\n  .source-available {\n    white-space: normal;\n    display: inline-block;\n    vertical-align: top;\n    font-size: ", ";\n    line-height: ", ";\n  }\n\n  .source-name {\n    padding: 0px ", ";\n    max-width: calc(100% - ", ");\n    word-break: break-all;\n  }\n\n  .source-actions {\n    display: block;\n    padding-left: calc(2 * ", ");\n  }\n\n  .source-action > button {\n    width: 100%;\n    text-align: left;\n    padding: 0px ", ";\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .source-app {\n    display: none;\n  }\n\n  .source-available {\n    width: ", ";\n    text-align: center;\n  }\n\n  .is-available,\n  .is-not-available {\n    display: none;\n  }\n\n  .is-available {\n    display: ", ";\n    color: ", ";\n  }\n\n  .is-not-available {\n    display: ", ";\n    color: ", ";\n  }\n"], ["\n  width: 100%;\n  height: auto;\n  white-space: nowrap;\n  padding: ", ";\n  overflow: hidden;\n\n  .source-name,\n  .source-available {\n    white-space: normal;\n    display: inline-block;\n    vertical-align: top;\n    font-size: ", ";\n    line-height: ", ";\n  }\n\n  .source-name {\n    padding: 0px ", ";\n    max-width: calc(100% - ", ");\n    word-break: break-all;\n  }\n\n  .source-actions {\n    display: block;\n    padding-left: calc(2 * ", ");\n  }\n\n  .source-action > button {\n    width: 100%;\n    text-align: left;\n    padding: 0px ", ";\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .source-app {\n    display: none;\n  }\n\n  .source-available {\n    width: ", ";\n    text-align: center;\n  }\n\n  .is-available,\n  .is-not-available {\n    display: none;\n  }\n\n  .is-available {\n    display: ", ";\n    color: ", ";\n  }\n\n  .is-not-available {\n    display: ", ";\n    color: ", ";\n  }\n"])), function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.largeFontSize; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumSpacing; }, function (_a) {
    var theme = _a.theme;
    return theme.minimumButtonSize;
}, function (props) { return (props.available ? 'inline' : 'none'); }, function (props) { return props.theme.positiveColor; }, function (props) { return (props.available ? 'none' : 'inline'); }, function (props) { return props.theme.warningColor; });
export default hot(module)(function (_a) {
    var id = _a.id, available = _a.available;
    return (React.createElement(Root, { available: available },
        React.createElement("div", { className: "source-available" },
            React.createElement("span", { className: "is-available fa fa-check" }),
            React.createElement("span", { className: "is-not-available fa fa-bolt" })),
        React.createElement("div", { className: "source-name", title: id }, id)));
});
var templateObject_1;
//# sourceMappingURL=source-item.js.map