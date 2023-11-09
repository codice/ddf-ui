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
import MuiDivider from '@mui/material/Divider';
export var Divider = function () {
    return (React.createElement(MuiDivider, { variant: "fullWidth", orientation: "horizontal", className: "my-3" }));
};
var InteractionIcon = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  text-align: center;\n  width: ", ";\n  display: inline-block;\n  line-height: ", ";\n  height: ", ";\n"], ["\n  text-align: center;\n  width: ", ";\n  display: inline-block;\n  line-height: ", ";\n  height: ", ";\n"])), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; });
var InteractionText = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  line-height: ", ";\n  height: ", ";\n  display: inline-block;\n"], ["\n  line-height: ", ";\n  height: ", ";\n  display: inline-block;\n"])), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; });
var Interaction = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  line-height: ", ";\n  height: ", ";\n  white-space: nowrap;\n  padding: ", ";\n  cursor: pointer;\n  overflow: hidden;\n"], ["\n  line-height: ", ";\n  height: ", ";\n  white-space: nowrap;\n  padding: ", ";\n  cursor: pointer;\n  overflow: hidden;\n"])), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return "0px ".concat(props.theme.minimumSpacing); });
export var MetacardInteraction = function (props) {
    return (React.createElement(Interaction, { "data-id": "interaction-container", "data-help": props.help, onClick: function () { return props.onClick(props); } },
        React.createElement(InteractionIcon, { className: props.icon }),
        React.createElement(InteractionText, null, props.text),
        props.children));
};
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=metacard-interactions.js.map