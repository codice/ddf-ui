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
var Alpha = styled.input.attrs({
    min: '0',
    max: '1',
    step: '0.01',
    type: 'range',
})(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: inline-block;\n  vertical-align: middle !important;\n"], ["\n  display: inline-block;\n  vertical-align: middle !important;\n"])));
var AlphaDisabled = styled(Alpha)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  ", ";\n"], ["\n  ", ";\n"])), function (props) { return DisabledBehavior(props.theme); });
var AlphaEnabled = styled(Alpha)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  opacity: 1;\n  cursor: default !important;\n"], ["\n  opacity: 1;\n  cursor: default !important;\n"])));
var render = function (props) {
    var _a = props.visibility, show = _a.show, alpha = _a.alpha;
    var updateLayerAlpha = props.actions.updateLayerAlpha;
    return show ? (React.createElement(AlphaEnabled, { "data-id": "alpha-slider", onChange: updateLayerAlpha, value: alpha })) : (React.createElement(AlphaDisabled, { "data-id": "alpha-slider", onChange: updateLayerAlpha, value: alpha, disabled: true }));
};
export var LayerAlpha = hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=alpha.js.map