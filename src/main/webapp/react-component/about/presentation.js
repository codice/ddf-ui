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
import { CustomElement } from '../styles/mixins';
import { hot } from 'react-hot-loader';
import Divider from '@mui/material/Divider';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  ", " overflow: auto;\n  padding: ", " 0px;\n\n  .about-content {\n    margin: auto;\n    max-width: ", ";\n    padding: 0px\n      ", ";\n  }\n\n  .content-version,\n  .version-message {\n    padding: ", ";\n  }\n"], ["\n  ", " overflow: auto;\n  padding: ", " 0px;\n\n  .about-content {\n    margin: auto;\n    max-width: ", ";\n    padding: 0px\n      ", ";\n  }\n\n  .content-version,\n  .version-message {\n    padding: ", ";\n  }\n"])), CustomElement, function (props) { return props.theme.minimumSpacing; }, function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize)
        ? '100%'
        : '1200px';
}, function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize)
        ? '20px'
        : '100px';
}, function (props) { return props.theme.minimumSpacing; });
export default hot(module)(function (props) {
    return (React.createElement(Root, null,
        React.createElement("div", { className: "about-content is-large-font" },
            React.createElement("div", null,
                React.createElement("span", { "data-id": "branding-label", className: "is-bold" }, props.branding),
                React.createElement("span", { "data-id": "product-label" },
                    " ",
                    props.product)),
            React.createElement(Divider, { orientation: "horizontal", variant: "fullWidth", className: "my-3" }),
            React.createElement("div", { className: "content-version" },
                React.createElement("div", null,
                    React.createElement("div", { className: "version-title" }, "Version"),
                    React.createElement("div", { "data-id": "version-label", className: "version-message is-medium-font" }, props.version)),
                React.createElement(Divider, { orientation: "horizontal", variant: "fullWidth", className: "my-3" }),
                React.createElement("div", null,
                    React.createElement("div", { className: "version-title" }, "Unique Identifier"),
                    React.createElement("div", { "data-id": "unique-identifier-label", className: "version-message is-medium-font" }, "".concat(props.commitHash, " ").concat(props.isDirty ? 'with Changes' : ''))),
                React.createElement(Divider, { orientation: "horizontal", variant: "fullWidth", className: "my-3" }),
                React.createElement("div", null,
                    React.createElement("div", { className: "version-title" }, "Release Date"),
                    React.createElement("div", { "data-id": "release-date-label", className: "version-message is-medium-font" }, props.date))))));
});
var templateObject_1;
//# sourceMappingURL=presentation.js.map