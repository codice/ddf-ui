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
import { IsButton, HighlightBehavior } from '.';
var Interactions = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  text-align: right;\n"], ["\n  text-align: right;\n"])));
var InteractionsButton = styled.button(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  ", ";\n  ", ";\n  width: ", ";\n  height: ", ";\n  vertical-align: top;\n"], ["\n  ", ";\n  ", ";\n  width: ", ";\n  height: ", ";\n  vertical-align: top;\n"])), function (props) { return IsButton(props.theme); }, function (props) {
    return HighlightBehavior({ initialOpacity: props.theme.minimumOpacity });
}, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; });
var Warning = styled(InteractionsButton)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  display: inline-block;\n  color: ", ";\n  cursor: default;\n"], ["\n  display: inline-block;\n  color: ", ";\n  cursor: default;\n"
    /* stylelint-disable block-no-empty */
])), function (props) { return props.theme.warningColor; });
/* stylelint-disable block-no-empty */
var Remove = styled(InteractionsButton)(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""])));
var Show = styled(InteractionsButton)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  position: relative;\n  display: inline-block !important;\n  vertical-align: middle;\n"], ["\n  position: relative;\n  display: inline-block !important;\n  vertical-align: middle;\n"])));
var ShowIcon = styled.span(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translateX(-50%) translateY(-50%);\n  display: inline;\n"], ["\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translateX(-50%) translateY(-50%);\n  display: inline;\n"])));
var ContentShow = function (_a) {
    var visibility = _a.visibility;
    var className = "fa ".concat(visibility.show ? 'fa-eye' : 'fa-eye-slash');
    return React.createElement(ShowIcon, { className: className });
};
var render = function (props) {
    var _a = props.layerInfo, isRemovable = _a.isRemovable, _b = _a.warning, warning = _b === void 0 ? '' : _b;
    var _c = props.actions, updateLayerShow = _c.updateLayerShow, onRemove = _c.onRemove;
    return (React.createElement(Interactions, null,
        warning !== '' && (React.createElement(Warning, { "data-id": "view-warnings-button", "data-help": "View map layer warnings.", title: warning },
            React.createElement("span", { className: " fa fa-warning" }))),
        isRemovable && (React.createElement(Remove, { "data-id": "remove-layer-button", "data-help": "Remove map layer from user preferences.", title: "Remove map layer from user preferences.", onClick: onRemove },
            React.createElement("span", { className: "fa fa-minus" }))),
        React.createElement(Show, { "data-id": "visibility-button", "data-help": "Toggle layer visibility.", title: "Toggle layer visibility.", onClick: updateLayerShow },
            React.createElement(ContentShow, __assign({}, props)))));
};
export var LayerInteractions = hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=interactions.js.map