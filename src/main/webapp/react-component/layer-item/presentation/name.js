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
import { DisabledBehavior } from '.';
var Name = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  line-height: ", ";\n  overflow: hidden;\n  text-overflow: ellipsis;\n"], ["\n  line-height: ", ";\n  overflow: hidden;\n  text-overflow: ellipsis;\n"])), function (props) { return props.theme.minimumButtonSize; });
var NameDisabled = styled(Name)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  ", ";\n  cursor: text !important;\n"], ["\n  ", ";\n  cursor: text !important;\n"])), function (props) { return DisabledBehavior(props.theme); });
var NameEnabled = styled(Name)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  opacity: 1;\n"], ["\n  opacity: 1;\n"])));
var render = function (props) {
    var _a = props.layerInfo.name, name = _a === void 0 ? 'Untitled' : _a;
    var show = props.visibility.show;
    return show ? (React.createElement(NameEnabled, { title: name }, name)) : (React.createElement(NameDisabled, { title: name }, name));
};
export var LayerName = hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=name.js.map