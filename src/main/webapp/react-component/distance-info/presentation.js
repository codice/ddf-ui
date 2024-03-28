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
import DistanceUtils from '../../js/DistanceUtils';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  font-family: 'Inconsolata', 'Lucida Console', monospace;\n  background: ", ";\n  display: block;\n  width: auto;\n  height: auto;\n  font-size: ", ";\n  position: absolute;\n  text-align: left;\n  padding: ", ";\n  max-width: 50%;\n"], ["\n  font-family: 'Inconsolata', 'Lucida Console', monospace;\n  background: ", ";\n  display: block;\n  width: auto;\n  height: auto;\n  font-size: ", ";\n  position: absolute;\n  text-align: left;\n  padding: ", ";\n  max-width: 50%;\n"])), function (props) { return props.theme.backgroundModal; }, function (props) { return props.theme.mediumFontSize; }, function (props) { return props.theme.minimumSpacing; });
var DistanceInfoText = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"], ["\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"
    /*
     * Formats the current distance value to a string with the appropriate unit of measurement.
     */
])));
/*
 * Formats the current distance value to a string with the appropriate unit of measurement.
 */
var getDistanceText = function (distance) {
    // use meters when distance is under 1000m and convert to kilometers when ≥1000m
    var distanceText = distance < 1000
        ? "".concat(distance, " m")
        : "".concat(DistanceUtils.getDistanceFromMeters(distance, 'kilometers').toFixed(2), " km");
    return distanceText;
};
var render = function (props) {
    var distance = props.currentDistance ? props.currentDistance : 0;
    return (React.createElement(Root, __assign({}, props, { style: { left: props.left, top: props.top } }),
        React.createElement(DistanceInfoText, null, getDistanceText(distance))));
};
export default render;
var templateObject_1, templateObject_2;
//# sourceMappingURL=presentation.js.map