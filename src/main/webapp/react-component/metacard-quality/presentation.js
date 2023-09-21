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
import { __makeTemplateObject } from "tslib";
import { hot } from 'react-hot-loader';
import * as React from 'react';
import styled from 'styled-components';
import LinearProgress from '@mui/material/LinearProgress';
var Header = styled.h4(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  text-align: left;\n  padding: ", ";\n"], ["\n  text-align: left;\n  padding: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
var Root = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  overflow: auto;\n\n  table {\n    width: 100%;\n    text-align: center;\n    margin-bottom: 40px;\n  }\n\n  th {\n    width: 33%;\n    text-align: center;\n  }\n\n  tr:nth-of-type(even) {\n    background: rgba(0, 0, 0, 0.1);\n  }\n\n  th,\n  td {\n    padding: 10px;\n  }\n\n  td + td {\n    border-left: 1px solid rgba(100, 100, 100, 0.3);\n  }\n\n  tbody {\n    border-top: 1px solid rgba(100, 100, 100, 0.3);\n  }\n"], ["\n  overflow: auto;\n\n  table {\n    width: 100%;\n    text-align: center;\n    margin-bottom: 40px;\n  }\n\n  th {\n    width: 33%;\n    text-align: center;\n  }\n\n  tr:nth-of-type(even) {\n    background: rgba(0, 0, 0, 0.1);\n  }\n\n  th,\n  td {\n    padding: 10px;\n  }\n\n  td + td {\n    border-left: 1px solid rgba(100, 100, 100, 0.3);\n  }\n\n  tbody {\n    border-top: 1px solid rgba(100, 100, 100, 0.3);\n  }\n"])));
var MetacardValidation = function (props) {
    var metacardValidation = props.metacardValidation;
    return (React.createElement(React.Fragment, null,
        React.createElement(Header, null, "Metacard Validation Issues"),
        React.createElement("table", null,
            React.createElement("thead", null,
                React.createElement("th", null, "Attribute"),
                React.createElement("th", null, "Severity"),
                React.createElement("th", null, "Message")),
            React.createElement("tbody", null, metacardValidation.map(function (validation, i) {
                return (React.createElement("tr", { "data-id": "metacard-validation-issue-container", key: i },
                    React.createElement("td", { "data-id": "attribute-value" }, validation.attributes.map(function (attribute, j) {
                        return React.createElement("div", { key: attribute + j }, attribute);
                    })),
                    React.createElement("td", { "data-id": "severity-value" }, validation.severity),
                    validation.duplicate ? (React.createElement("td", { "data-id": "message-value" },
                        validation.duplicate.message[0],
                        validation.duplicate.ids.map(function (id, index) {
                            return (React.createElement(React.Fragment, { key: id },
                                React.createElement("a", { href: "#metacards/".concat(id) }, id),
                                index !== validation.duplicate.ids.length - 1
                                    ? ', '
                                    : ''));
                        }),
                        validation.duplicate.message[1])) : (React.createElement("td", { "data-id": "message-value" }, validation.message))));
            })))));
};
var AttributeValidation = function (props) {
    var attributeValidation = props.attributeValidation;
    return (React.createElement(React.Fragment, null,
        React.createElement(Header, null, "Attribute Validation Issues"),
        React.createElement("table", null,
            React.createElement("thead", null,
                React.createElement("th", null, "Attribute"),
                React.createElement("th", null, "Warnings"),
                React.createElement("th", null, "Errors")),
            React.createElement("tbody", null, attributeValidation.map(function (validation, i) {
                return (React.createElement("tr", { "data-id": "attribute-validation-issue-container", key: i },
                    React.createElement("td", { "data-id": "attribute-value" }, validation.attribute),
                    React.createElement("td", { "data-id": "warnings-value" }, validation.warnings.map(function (warning, j) {
                        return React.createElement("div", { key: warning + j }, warning);
                    })),
                    React.createElement("td", { "data-id": "errors-value" }, validation.errors.map(function (error, j) {
                        return React.createElement("div", { key: error + j }, error);
                    }))));
            })))));
};
var render = function (props) {
    var metacardValidation = props.metacardValidation, attributeValidation = props.attributeValidation, loading = props.loading;
    return loading ? (React.createElement(React.Fragment, null,
        React.createElement(LinearProgress, { className: "w-full h-2" }))) : (React.createElement(React.Fragment, null,
        React.createElement(Root, null,
            metacardValidation.length > 0 ? (React.createElement(MetacardValidation, { metacardValidation: metacardValidation })) : (React.createElement(Header, null, "No Metacard Validation Issues to Report")),
            attributeValidation.length > 0 ? (React.createElement(AttributeValidation, { attributeValidation: attributeValidation })) : (React.createElement(Header, null, "No Attribute Validation Issues to Report")))));
};
export default hot(module)(render);
var templateObject_1, templateObject_2;
//# sourceMappingURL=presentation.js.map