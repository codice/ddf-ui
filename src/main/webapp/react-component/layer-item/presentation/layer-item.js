import { __assign, __makeTemplateObject } from "tslib";
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
import { LayerRearrange, LayerAlpha, LayerInteractions, LayerName } from '.';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  white-space: nowrap;\n  width: 100%;\n  overflow: hidden;\n  position: relative;\n  border: 2px solid rgba(255, 255, 255, 0.1);\n  border-top: ", ";\n"], ["\n  display: block;\n  white-space: nowrap;\n  width: 100%;\n  overflow: hidden;\n  position: relative;\n  border: 2px solid rgba(255, 255, 255, 0.1);\n  border-top: ", ";\n"])), function (props) {
    if (!props.order.isTop) {
        return 'none';
    }
    return;
});
var LayerPropertiesRoot = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: inline-block;\n  vertical-align: middle;\n  padding: 0 ", ";\n  margin-left: ", ";\n  width: calc(100% - ", ");\n  border-left: 2px solid rgba(255, 255, 255, 0.1);\n"], ["\n  display: inline-block;\n  vertical-align: middle;\n  padding: 0 ", ";\n  margin-left: ", ";\n  width: calc(100% - ", ");\n  border-left: 2px solid rgba(255, 255, 255, 0.1);\n"])), function (props) { return props.theme.mediumSpacing; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; });
var render = function (props) {
    return (React.createElement(Root, __assign({}, props),
        React.createElement(LayerRearrange, __assign({}, props)),
        React.createElement(LayerPropertiesRoot, null,
            React.createElement(LayerName, __assign({}, props)),
            React.createElement(LayerAlpha, __assign({}, props)),
            React.createElement(LayerInteractions, __assign({}, props)))));
};
export default hot(module)(render);
var templateObject_1, templateObject_2;
//# sourceMappingURL=layer-item.js.map