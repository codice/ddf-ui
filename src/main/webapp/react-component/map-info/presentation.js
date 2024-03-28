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
import { validCoordinates } from '.';
import { formatAttribute, formatCoordinates } from './formatting';
import DistanceUtils from '../../js/DistanceUtils';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  font-family: 'Inconsolata', 'Lucida Console', monospace;\n  background: ", ";\n  display: block;\n  width: auto;\n  height: auto;\n  font-size: ", ";\n  position: absolute;\n  left: 0px;\n  bottom: 0px;\n  text-align: left;\n  padding: ", ";\n  max-width: 50%;\n"], ["\n  font-family: 'Inconsolata', 'Lucida Console', monospace;\n  background: ", ";\n  display: block;\n  width: auto;\n  height: auto;\n  font-size: ", ";\n  position: absolute;\n  left: 0px;\n  bottom: 0px;\n  text-align: left;\n  padding: ", ";\n  max-width: 50%;\n"])), function (props) { return props.theme.backgroundModal; }, function (props) { return props.theme.minimumFontSize; }, function (props) { return props.theme.minimumSpacing; });
var CoordinateInfo = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  white-space: pre;\n  display: inline-block;\n"], ["\n  white-space: pre;\n  display: inline-block;\n"])));
var MetacardInfo = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"], ["\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"])));
var metacardInfo = function (_a) {
    var attributes = _a.attributes;
    return attributes.map(function (_a) {
        var name = _a.name, value = _a.value;
        if (name === 'thumbnail') {
            return (React.createElement("div", { key: name },
                React.createElement("img", { src: value, style: { maxWidth: '100px', maxHeight: '100px' } })));
        }
        else {
            return (React.createElement(MetacardInfo, { key: name }, formatAttribute({ name: name, value: value })));
        }
    });
};
/*
 * Formats the current distance value to a string with the appropriate unit of measurement.
 */
var getDistanceText = function (distance) {
    // use meters when distance is under 1000m and convert to kilometers when ≥1000m
    var distanceText = distance < 1000
        ? "".concat(distance.toFixed(2), " m")
        : "".concat(DistanceUtils.getDistanceFromMeters(distance, 'kilometers').toFixed(2), " km");
    return distanceText;
};
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
var distanceInfo = function (props) {
    if (props.measurementState !== 'NONE') {
        return (React.createElement(MetacardInfo, null,
            "distance: ",
            getDistanceText(props.currentDistance)));
    }
};
var render = function (props) {
    if (!validCoordinates(props.coordinates)) {
        return null;
    }
    var coordinates = formatCoordinates(props);
    return (React.createElement(Root, __assign({}, props),
        metacardInfo(props),
        distanceInfo(props),
        React.createElement(CoordinateInfo, null,
            React.createElement("span", { "data-id": "coordinates-label" }, coordinates))));
};
export default hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=presentation.js.map