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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mby9wcmVzZW50YXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBa0MsZ0JBQWdCLEVBQUUsTUFBTSxHQUFHLENBQUE7QUFDcEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNqRSxPQUFPLGFBQWEsTUFBTSx3QkFBd0IsQ0FBQTtBQVVsRCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRywrVUFBTyw4RUFFZCxFQUFzQyxzRUFJdkMsRUFBc0MsMEZBS3hDLEVBQXFDLHdCQUVqRCxLQVhlLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBSXZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBS3hDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBRWpELENBQUE7QUFDRCxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsR0FBRyxzSEFBQSxtREFHaEMsSUFBQSxDQUFBO0FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsZ0pBQUEsNkVBSTlCLElBQUEsQ0FBQTtBQUVELElBQU0sWUFBWSxHQUFHLFVBQUMsRUFBcUI7UUFBbkIsVUFBVSxnQkFBQTtJQUNoQyxPQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUEwQjtZQUF4QixJQUFJLFVBQUEsRUFBRSxLQUFLLFdBQUE7UUFDM0IsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ3hCLE9BQU8sQ0FDTCw2QkFBSyxHQUFHLEVBQUUsSUFBSTtnQkFDWiw2QkFBSyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFJLENBQ2pFLENBQ1AsQ0FBQTtTQUNGO2FBQU07WUFDTCxPQUFPLENBQ0wsb0JBQUMsWUFBWSxJQUFDLEdBQUcsRUFBRSxJQUFJLElBQ3BCLGVBQWUsQ0FBQyxFQUFFLElBQUksTUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsQ0FDcEIsQ0FDaEIsQ0FBQTtTQUNGO0lBQ0gsQ0FBQyxDQUFDO0FBZEYsQ0FjRSxDQUFBO0FBRUo7O0dBRUc7QUFDSCxJQUFNLGVBQWUsR0FBRyxVQUFDLFFBQWdCO0lBQ3ZDLGdGQUFnRjtJQUNoRixJQUFNLFlBQVksR0FDaEIsUUFBUSxHQUFHLElBQUk7UUFDYixDQUFDLENBQUMsVUFBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFJO1FBQzVCLENBQUMsQ0FBQyxVQUFHLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUNwRSxDQUFDLENBQ0YsUUFBSyxDQUFBO0lBRVosT0FBTyxZQUFZLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsOEVBQThFO0FBQzlFLElBQU0sWUFBWSxHQUFHLFVBQUMsS0FBWTtJQUNoQyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxNQUFNLEVBQUU7UUFDckMsT0FBTyxDQUNMLG9CQUFDLFlBQVk7O1lBQ0EsZUFBZSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FDcEMsQ0FDaEIsQ0FBQTtLQUNGO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxNQUFNLEdBQUcsVUFBQyxLQUFZO0lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDeEMsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELElBQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVDLE9BQU8sQ0FDTCxvQkFBQyxJQUFJLGVBQUssS0FBSztRQUNaLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFDbkIsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUNwQixvQkFBQyxjQUFjO1lBQ2IseUNBQWMsbUJBQW1CLElBQUUsV0FBVyxDQUFRLENBQ3ZDLENBQ1osQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENvb3JkaW5hdGVzLCBGb3JtYXQsIHZhbGlkQ29vcmRpbmF0ZXMgfSBmcm9tICcuJ1xuaW1wb3J0IHsgZm9ybWF0QXR0cmlidXRlLCBmb3JtYXRDb29yZGluYXRlcyB9IGZyb20gJy4vZm9ybWF0dGluZydcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGZvcm1hdDogRm9ybWF0XG4gIGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZVtdXG4gIGNvb3JkaW5hdGVzOiBDb29yZGluYXRlc1xuICBtZWFzdXJlbWVudFN0YXRlOiBTdHJpbmdcbiAgY3VycmVudERpc3RhbmNlOiBudW1iZXJcbn1cblxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXY8UHJvcHM+YFxuICBmb250LWZhbWlseTogJ0luY29uc29sYXRhJywgJ0x1Y2lkYSBDb25zb2xlJywgbW9ub3NwYWNlO1xuICBiYWNrZ3JvdW5kOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUuYmFja2dyb3VuZE1vZGFsfTtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiBhdXRvO1xuICBoZWlnaHQ6IGF1dG87XG4gIGZvbnQtc2l6ZTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1Gb250U2l6ZX07XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgbGVmdDogMHB4O1xuICBib3R0b206IDBweDtcbiAgdGV4dC1hbGlnbjogbGVmdDtcbiAgcGFkZGluZzogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1TcGFjaW5nfTtcbiAgbWF4LXdpZHRoOiA1MCU7XG5gXG5jb25zdCBDb29yZGluYXRlSW5mbyA9IHN0eWxlZC5kaXZgXG4gIHdoaXRlLXNwYWNlOiBwcmU7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbmBcbmNvbnN0IE1ldGFjYXJkSW5mbyA9IHN0eWxlZC5kaXZgXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuYFxuXG5jb25zdCBtZXRhY2FyZEluZm8gPSAoeyBhdHRyaWJ1dGVzIH06IFByb3BzKSA9PlxuICBhdHRyaWJ1dGVzLm1hcCgoeyBuYW1lLCB2YWx1ZSB9OiBBdHRyaWJ1dGUpID0+IHtcbiAgICBpZiAobmFtZSA9PT0gJ3RodW1ibmFpbCcpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PXtuYW1lfT5cbiAgICAgICAgICA8aW1nIHNyYz17dmFsdWV9IHN0eWxlPXt7IG1heFdpZHRoOiAnMTAwcHgnLCBtYXhIZWlnaHQ6ICcxMDBweCcgfX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxNZXRhY2FyZEluZm8ga2V5PXtuYW1lfT5cbiAgICAgICAgICB7Zm9ybWF0QXR0cmlidXRlKHsgbmFtZSwgdmFsdWUgfSl9XG4gICAgICAgIDwvTWV0YWNhcmRJbmZvPlxuICAgICAgKVxuICAgIH1cbiAgfSlcblxuLypcbiAqIEZvcm1hdHMgdGhlIGN1cnJlbnQgZGlzdGFuY2UgdmFsdWUgdG8gYSBzdHJpbmcgd2l0aCB0aGUgYXBwcm9wcmlhdGUgdW5pdCBvZiBtZWFzdXJlbWVudC5cbiAqL1xuY29uc3QgZ2V0RGlzdGFuY2VUZXh0ID0gKGRpc3RhbmNlOiBudW1iZXIpID0+IHtcbiAgLy8gdXNlIG1ldGVycyB3aGVuIGRpc3RhbmNlIGlzIHVuZGVyIDEwMDBtIGFuZCBjb252ZXJ0IHRvIGtpbG9tZXRlcnMgd2hlbiDiiaUxMDAwbVxuICBjb25zdCBkaXN0YW5jZVRleHQgPVxuICAgIGRpc3RhbmNlIDwgMTAwMFxuICAgICAgPyBgJHtkaXN0YW5jZS50b0ZpeGVkKDIpfSBtYFxuICAgICAgOiBgJHtEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlRnJvbU1ldGVycyhkaXN0YW5jZSwgJ2tpbG9tZXRlcnMnKS50b0ZpeGVkKFxuICAgICAgICAgIDJcbiAgICAgICAgKX0ga21gXG5cbiAgcmV0dXJuIGRpc3RhbmNlVGV4dFxufVxuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbmNvbnN0IGRpc3RhbmNlSW5mbyA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgaWYgKHByb3BzLm1lYXN1cmVtZW50U3RhdGUgIT09ICdOT05FJykge1xuICAgIHJldHVybiAoXG4gICAgICA8TWV0YWNhcmRJbmZvPlxuICAgICAgICBkaXN0YW5jZToge2dldERpc3RhbmNlVGV4dChwcm9wcy5jdXJyZW50RGlzdGFuY2UpfVxuICAgICAgPC9NZXRhY2FyZEluZm8+XG4gICAgKVxuICB9XG59XG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgaWYgKCF2YWxpZENvb3JkaW5hdGVzKHByb3BzLmNvb3JkaW5hdGVzKSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBjb29yZGluYXRlcyA9IGZvcm1hdENvb3JkaW5hdGVzKHByb3BzKVxuICByZXR1cm4gKFxuICAgIDxSb290IHsuLi5wcm9wc30+XG4gICAgICB7bWV0YWNhcmRJbmZvKHByb3BzKX1cbiAgICAgIHtkaXN0YW5jZUluZm8ocHJvcHMpfVxuICAgICAgPENvb3JkaW5hdGVJbmZvPlxuICAgICAgICA8c3BhbiBkYXRhLWlkPVwiY29vcmRpbmF0ZXMtbGFiZWxcIj57Y29vcmRpbmF0ZXN9PC9zcGFuPlxuICAgICAgPC9Db29yZGluYXRlSW5mbz5cbiAgICA8L1Jvb3Q+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkocmVuZGVyKVxuIl19