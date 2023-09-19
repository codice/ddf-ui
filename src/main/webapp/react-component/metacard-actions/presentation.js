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
import { readableColor } from 'polished';
import MapActions from '../map-actions';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: auto;\n  height: 100%;\n  padding: 0px ", ";\n"], ["\n  overflow: auto;\n  height: 100%;\n  padding: 0px ", ";\n"])), function (props) { return props.theme.largeSpacing; });
var Header = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  text-align: left;\n  font-size: ", ";\n  font-weight: bolder;\n  opacity: 0.8;\n"], ["\n  text-align: left;\n  font-size: ", ";\n  font-weight: bolder;\n  opacity: 0.8;\n"])), function (props) { return props.theme.largeFontSize; });
var MapActionsDiv = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  margin-top: ", ";\n"], ["\n  margin-top: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
var Divider = styled.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  height: ", ";\n  margin: ", " 0px;\n  background: ", ";\n  opacity: 0.1;\n"], ["\n  height: ", ";\n  margin: ", " 0px;\n  background: ", ";\n  opacity: 0.1;\n"])), function (props) { return props.theme.borderRadius; }, function (props) { return props.theme.minimumSpacing; }, function (props) { return readableColor(props.theme.backgroundContent); });
var Actions = styled.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  padding: 0px ", ";\n"], ["\n  padding: 0px ", ";\n"])), function (props) { return props.theme.largeSpacing; });
var ActionLink = styled.a(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  margin-top: ", ";\n  cursor: pointer;\n  display: block;\n"], ["\n  margin-top: ", ";\n  cursor: pointer;\n  display: block;\n"])), function (props) { return props.theme.minimumSpacing; });
var ExportActions = function (props) {
    var exportActions = props.exportActions;
    return (React.createElement(React.Fragment, null,
        React.createElement(Header, null, "Export as:"),
        React.createElement(Divider, null),
        React.createElement(Actions, { "data-id": "export-actions-container" }, exportActions.map(function (exportAction) {
            return (React.createElement(ActionLink, { href: exportAction.url, target: "_blank", key: exportAction.url }, exportAction.title));
        }))));
};
var OtherActions = function (props) {
    var otherActions = props.otherActions;
    if (otherActions.length === 0) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Header, null, "Various:"),
        React.createElement(Divider, null),
        React.createElement(Actions, { "data-id": "various-actions-container" }, otherActions.map(function (otherAction) {
            return (React.createElement(ActionLink, { href: otherAction.url, target: "_blank", key: otherAction.url }, otherAction.title));
        })),
        React.createElement(Divider, null)));
};
var render = function (props) {
    var exportActions = props.exportActions, otherActions = props.otherActions, model = props.model;
    return (React.createElement(Root, null,
        React.createElement(Divider, null),
        React.createElement(ExportActions, { exportActions: exportActions }),
        React.createElement(Divider, null),
        React.createElement(MapActionsDiv, null,
            React.createElement(MapActions, { model: model })),
        React.createElement(OtherActions, { otherActions: otherActions })));
};
export default hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=presentation.js.map