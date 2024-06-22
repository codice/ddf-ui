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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  width: 100%;\n  white-space: nowrap;\n  padding: ", ";\n  position: relative;\n\n  &.example-label,\n  &.example-value {\n    width: 50%;\n    display: inline-block;\n    vertical-align: middle;\n    position: relative;\n  }\n\n  &.example-label {\n    text-align: right;\n  }\n"], ["\n  display: block;\n  width: 100%;\n  white-space: nowrap;\n  padding: ", ";\n  position: relative;\n\n  &.example-label,\n  &.example-value {\n    width: 50%;\n    display: inline-block;\n    vertical-align: middle;\n    position: relative;\n  }\n\n  &.example-label {\n    text-align: right;\n  }\n"])), function (props) { return props.theme.minimumSpacing; });
var Label = styled.label(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  .example-label & {\n    vertical-align: middle;\n    cursor: auto;\n    font-weight: bolder;\n    max-width: calc(100% - ", ");\n    margin: 0px;\n    line-height: 1.4;\n    padding: ", " 0px;\n    min-height: ", ";\n    overflow: hidden;\n    text-overflow: ellipsis;\n    word-wrap: normal;\n    white-space: normal;\n  }\n"], ["\n  .example-label & {\n    vertical-align: middle;\n    cursor: auto;\n    font-weight: bolder;\n    max-width: calc(100% - ", ");\n    margin: 0px;\n    line-height: 1.4;\n    padding: ", " 0px;\n    min-height: ", ";\n    overflow: hidden;\n    text-overflow: ellipsis;\n    word-wrap: normal;\n    white-space: normal;\n  }\n"])), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumSpacing; }, function (props) { return props.theme.minimumButtonSize; });
var exampleLat = '14.94', exampleLon = '-11.875';
var defaultExamples = {
    degrees: "".concat(mtgeo.toLat(exampleLat), " ").concat(mtgeo.toLon(exampleLon)),
    decimal: "".concat(exampleLat, " ").concat(exampleLon),
    mgrs: '4Q FL 23009 12331',
    utm: '14N 1925mE 1513mN',
    wkt: 'POINT (50 40)',
};
var render = function (props) {
    var selected = props.selected, _a = props.examples, examples = _a === void 0 ? defaultExamples : _a;
    var example = examples[selected];
    if (typeof example === 'undefined') {
        console.warn("Unrecognized coordinate format value [".concat(selected, "]"));
    }
    return (React.createElement(Root, null,
        React.createElement("div", { className: "example-label" },
            React.createElement(Label, null, "Example Coordinates")),
        React.createElement("div", { className: "example-value" },
            React.createElement("span", null, example))));
};
export default hot(module)(render);
export var testComponent = render;
var templateObject_1, templateObject_2;
//# sourceMappingURL=example-coordinates.js.map