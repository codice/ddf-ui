import { __assign, __makeTemplateObject } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
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
    return (_jsx(Root, __assign({}, props, { style: { left: props.left, top: props.top }, children: _jsx(DistanceInfoText, { children: getDistanceText(distance) }) })));
};
export default render;
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9kaXN0YW5jZS1pbmZvL3ByZXNlbnRhdGlvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUosT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxhQUFhLE1BQU0sd0JBQXdCLENBQUE7QUFRbEQsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsaVRBQU8sOEVBRWQsRUFBc0Msc0VBSXZDLEVBQXFDLDREQUd2QyxFQUFxQyx3QkFFakQsS0FUZSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUEzQixDQUEyQixFQUl2QyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixFQUd2QyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixDQUVqRCxDQUFBO0FBRUQsSUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsR0FBRyxnSkFBQSw2RUFJbEM7SUFFRDs7T0FFRztJQUpGLENBQUE7QUFFRDs7R0FFRztBQUNILElBQU0sZUFBZSxHQUFHLFVBQUMsUUFBZ0I7SUFDdkMsZ0ZBQWdGO0lBQ2hGLElBQU0sWUFBWSxHQUNoQixRQUFRLEdBQUcsSUFBSTtRQUNiLENBQUMsQ0FBQyxVQUFHLFFBQVEsT0FBSTtRQUNqQixDQUFDLENBQUMsVUFBRyxhQUFhLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FDcEUsQ0FBQyxDQUNGLFFBQUssQ0FBQTtJQUVaLE9BQU8sWUFBWSxDQUFBO0FBQ3JCLENBQUMsQ0FBQTtBQUVELElBQU0sTUFBTSxHQUFHLFVBQUMsS0FBWTtJQUMxQixJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFbEUsT0FBTyxDQUNMLEtBQUMsSUFBSSxlQUFLLEtBQUssSUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxZQUMxRCxLQUFDLGdCQUFnQixjQUFFLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBb0IsSUFDM0QsQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGN1cnJlbnREaXN0YW5jZTogbnVtYmVyXG4gIGxlZnQ6IG51bWJlclxuICB0b3A6IG51bWJlclxufVxuXG5jb25zdCBSb290ID0gc3R5bGVkLmRpdjxQcm9wcz5gXG4gIGZvbnQtZmFtaWx5OiAnSW5jb25zb2xhdGEnLCAnTHVjaWRhIENvbnNvbGUnLCBtb25vc3BhY2U7XG4gIGJhY2tncm91bmQ6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5iYWNrZ3JvdW5kTW9kYWx9O1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6IGF1dG87XG4gIGhlaWdodDogYXV0bztcbiAgZm9udC1zaXplOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWVkaXVtRm9udFNpemV9O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIHBhZGRpbmc6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtU3BhY2luZ307XG4gIG1heC13aWR0aDogNTAlO1xuYFxuXG5jb25zdCBEaXN0YW5jZUluZm9UZXh0ID0gc3R5bGVkLmRpdmBcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG5gXG5cbi8qXG4gKiBGb3JtYXRzIHRoZSBjdXJyZW50IGRpc3RhbmNlIHZhbHVlIHRvIGEgc3RyaW5nIHdpdGggdGhlIGFwcHJvcHJpYXRlIHVuaXQgb2YgbWVhc3VyZW1lbnQuXG4gKi9cbmNvbnN0IGdldERpc3RhbmNlVGV4dCA9IChkaXN0YW5jZTogbnVtYmVyKSA9PiB7XG4gIC8vIHVzZSBtZXRlcnMgd2hlbiBkaXN0YW5jZSBpcyB1bmRlciAxMDAwbSBhbmQgY29udmVydCB0byBraWxvbWV0ZXJzIHdoZW4g4omlMTAwMG1cbiAgY29uc3QgZGlzdGFuY2VUZXh0ID1cbiAgICBkaXN0YW5jZSA8IDEwMDBcbiAgICAgID8gYCR7ZGlzdGFuY2V9IG1gXG4gICAgICA6IGAke0Rpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VGcm9tTWV0ZXJzKGRpc3RhbmNlLCAna2lsb21ldGVycycpLnRvRml4ZWQoXG4gICAgICAgICAgMlxuICAgICAgICApfSBrbWBcblxuICByZXR1cm4gZGlzdGFuY2VUZXh0XG59XG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgZGlzdGFuY2UgPSBwcm9wcy5jdXJyZW50RGlzdGFuY2UgPyBwcm9wcy5jdXJyZW50RGlzdGFuY2UgOiAwXG5cbiAgcmV0dXJuIChcbiAgICA8Um9vdCB7Li4ucHJvcHN9IHN0eWxlPXt7IGxlZnQ6IHByb3BzLmxlZnQsIHRvcDogcHJvcHMudG9wIH19PlxuICAgICAgPERpc3RhbmNlSW5mb1RleHQ+e2dldERpc3RhbmNlVGV4dChkaXN0YW5jZSl9PC9EaXN0YW5jZUluZm9UZXh0PlxuICAgIDwvUm9vdD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiJdfQ==