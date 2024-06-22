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
var Header = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  text-align: left;\n  font-size: ", ";\n  font-weight: bolder;\n  opacity: 0.8;\n"], ["\n  text-align: left;\n  font-size: ", ";\n  font-weight: bolder;\n  opacity: 0.8;\n"])), function (props) { return props.theme.largeFontSize; });
var Divider = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  height: ", ";\n  margin: ", " 0px;\n  background: ", ";\n  opacity: 0.1;\n"], ["\n  height: ", ";\n  margin: ", " 0px;\n  background: ", ";\n  opacity: 0.1;\n"])), function (props) { return props.theme.borderRadius; }, function (props) { return props.theme.minimumSpacing; }, function (props) { return readableColor(props.theme.backgroundContent); });
var Actions = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding: 0px ", ";\n"], ["\n  padding: 0px ", ";\n"])), function (props) { return props.theme.largeSpacing; });
var OverlayActionLink = styled.a(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  margin-top: ", ";\n  cursor: pointer;\n  display: block;\n"], ["\n  margin-top: ", ";\n  cursor: pointer;\n  display: block;\n"])), function (props) { return props.theme.minimumSpacing; });
var render = function (props) {
    var hasMapActions = props.hasMapActions, overlayActions = props.overlayActions, overlayImage = props.overlayImage, currentOverlayUrl = props.currentOverlayUrl;
    if (!hasMapActions) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Header, null, "Map:"),
        React.createElement(Divider, null),
        React.createElement(Actions, null, overlayActions.map(function (overlayAction) {
            return (React.createElement(OverlayActionLink, { "data-url": overlayAction.url, title: overlayAction.description, onClick: overlayImage, key: overlayAction.url },
                overlayAction.overlayText,
                overlayAction.url === currentOverlayUrl ? ' (remove)' : ''));
        })),
        React.createElement(Divider, null)));
};
export default hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=presentation.js.map