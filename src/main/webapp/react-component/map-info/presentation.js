import { __assign, __makeTemplateObject } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            return (_jsx("div", { children: _jsx("img", { src: value, style: { maxWidth: '100px', maxHeight: '100px' } }) }, name));
        }
        else {
            return (_jsx(MetacardInfo, { children: formatAttribute({ name: name, value: value }) }, name));
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
        return (_jsxs(MetacardInfo, { children: ["distance: ", getDistanceText(props.currentDistance)] }));
    }
};
var render = function (props) {
    if (!validCoordinates(props.coordinates)) {
        return null;
    }
    var coordinates = formatCoordinates(props);
    return (_jsxs(Root, __assign({}, props, { children: [metacardInfo(props), distanceInfo(props), _jsx(CoordinateInfo, { children: _jsx("span", { "data-id": "coordinates-label", children: coordinates }) })] })));
};
export default render;
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mby9wcmVzZW50YXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBRXRDLE9BQU8sRUFBa0MsZ0JBQWdCLEVBQUUsTUFBTSxHQUFHLENBQUE7QUFDcEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNqRSxPQUFPLGFBQWEsTUFBTSx3QkFBd0IsQ0FBQTtBQVVsRCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRywrVUFBTyw4RUFFZCxFQUFzQyxzRUFJdkMsRUFBc0MsMEZBS3hDLEVBQXFDLHdCQUVqRCxLQVhlLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBSXZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBS3hDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBRWpELENBQUE7QUFDRCxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsR0FBRyxzSEFBQSxtREFHaEMsSUFBQSxDQUFBO0FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsZ0pBQUEsNkVBSTlCLElBQUEsQ0FBQTtBQUVELElBQU0sWUFBWSxHQUFHLFVBQUMsRUFBcUI7UUFBbkIsVUFBVSxnQkFBQTtJQUNoQyxPQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUEwQjtZQUF4QixJQUFJLFVBQUEsRUFBRSxLQUFLLFdBQUE7UUFDM0IsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDekIsT0FBTyxDQUNMLHdCQUNFLGNBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBSSxJQUQ3RCxJQUFJLENBRVIsQ0FDUCxDQUFBO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLENBQ0wsS0FBQyxZQUFZLGNBQ1YsZUFBZSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxJQURoQixJQUFJLENBRVIsQ0FDaEIsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDLENBQUM7QUFkRixDQWNFLENBQUE7QUFFSjs7R0FFRztBQUNILElBQU0sZUFBZSxHQUFHLFVBQUMsUUFBZ0I7SUFDdkMsZ0ZBQWdGO0lBQ2hGLElBQU0sWUFBWSxHQUNoQixRQUFRLEdBQUcsSUFBSTtRQUNiLENBQUMsQ0FBQyxVQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQUk7UUFDNUIsQ0FBQyxDQUFDLFVBQUcsYUFBYSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQ3BFLENBQUMsQ0FDRixRQUFLLENBQUE7SUFFWixPQUFPLFlBQVksQ0FBQTtBQUNyQixDQUFDLENBQUE7QUFFRCw4RUFBOEU7QUFDOUUsSUFBTSxZQUFZLEdBQUcsVUFBQyxLQUFZO0lBQ2hDLElBQUksS0FBSyxDQUFDLGdCQUFnQixLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQ3RDLE9BQU8sQ0FDTCxNQUFDLFlBQVksNkJBQ0EsZUFBZSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFDcEMsQ0FDaEIsQ0FBQTtJQUNILENBQUM7QUFDSCxDQUFDLENBQUE7QUFFRCxJQUFNLE1BQU0sR0FBRyxVQUFDLEtBQVk7SUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELElBQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVDLE9BQU8sQ0FDTCxNQUFDLElBQUksZUFBSyxLQUFLLGVBQ1osWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUNuQixZQUFZLENBQUMsS0FBSyxDQUFDLEVBQ3BCLEtBQUMsY0FBYyxjQUNiLDBCQUFjLG1CQUFtQixZQUFFLFdBQVcsR0FBUSxHQUN2QyxLQUNaLENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsTUFBTSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5cbmltcG9ydCB7IEF0dHJpYnV0ZSwgQ29vcmRpbmF0ZXMsIEZvcm1hdCwgdmFsaWRDb29yZGluYXRlcyB9IGZyb20gJy4nXG5pbXBvcnQgeyBmb3JtYXRBdHRyaWJ1dGUsIGZvcm1hdENvb3JkaW5hdGVzIH0gZnJvbSAnLi9mb3JtYXR0aW5nJ1xuaW1wb3J0IERpc3RhbmNlVXRpbHMgZnJvbSAnLi4vLi4vanMvRGlzdGFuY2VVdGlscydcblxudHlwZSBQcm9wcyA9IHtcbiAgZm9ybWF0OiBGb3JtYXRcbiAgYXR0cmlidXRlczogQXR0cmlidXRlW11cbiAgY29vcmRpbmF0ZXM6IENvb3JkaW5hdGVzXG4gIG1lYXN1cmVtZW50U3RhdGU6IFN0cmluZ1xuICBjdXJyZW50RGlzdGFuY2U6IG51bWJlclxufVxuXG5jb25zdCBSb290ID0gc3R5bGVkLmRpdjxQcm9wcz5gXG4gIGZvbnQtZmFtaWx5OiAnSW5jb25zb2xhdGEnLCAnTHVjaWRhIENvbnNvbGUnLCBtb25vc3BhY2U7XG4gIGJhY2tncm91bmQ6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5iYWNrZ3JvdW5kTW9kYWx9O1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6IGF1dG87XG4gIGhlaWdodDogYXV0bztcbiAgZm9udC1zaXplOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bUZvbnRTaXplfTtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBsZWZ0OiAwcHg7XG4gIGJvdHRvbTogMHB4O1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBwYWRkaW5nOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bVNwYWNpbmd9O1xuICBtYXgtd2lkdGg6IDUwJTtcbmBcbmNvbnN0IENvb3JkaW5hdGVJbmZvID0gc3R5bGVkLmRpdmBcbiAgd2hpdGUtc3BhY2U6IHByZTtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuYFxuY29uc3QgTWV0YWNhcmRJbmZvID0gc3R5bGVkLmRpdmBcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG5gXG5cbmNvbnN0IG1ldGFjYXJkSW5mbyA9ICh7IGF0dHJpYnV0ZXMgfTogUHJvcHMpID0+XG4gIGF0dHJpYnV0ZXMubWFwKCh7IG5hbWUsIHZhbHVlIH06IEF0dHJpYnV0ZSkgPT4ge1xuICAgIGlmIChuYW1lID09PSAndGh1bWJuYWlsJykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e25hbWV9PlxuICAgICAgICAgIDxpbWcgc3JjPXt2YWx1ZX0gc3R5bGU9e3sgbWF4V2lkdGg6ICcxMDBweCcsIG1heEhlaWdodDogJzEwMHB4JyB9fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPE1ldGFjYXJkSW5mbyBrZXk9e25hbWV9PlxuICAgICAgICAgIHtmb3JtYXRBdHRyaWJ1dGUoeyBuYW1lLCB2YWx1ZSB9KX1cbiAgICAgICAgPC9NZXRhY2FyZEluZm8+XG4gICAgICApXG4gICAgfVxuICB9KVxuXG4vKlxuICogRm9ybWF0cyB0aGUgY3VycmVudCBkaXN0YW5jZSB2YWx1ZSB0byBhIHN0cmluZyB3aXRoIHRoZSBhcHByb3ByaWF0ZSB1bml0IG9mIG1lYXN1cmVtZW50LlxuICovXG5jb25zdCBnZXREaXN0YW5jZVRleHQgPSAoZGlzdGFuY2U6IG51bWJlcikgPT4ge1xuICAvLyB1c2UgbWV0ZXJzIHdoZW4gZGlzdGFuY2UgaXMgdW5kZXIgMTAwMG0gYW5kIGNvbnZlcnQgdG8ga2lsb21ldGVycyB3aGVuIOKJpTEwMDBtXG4gIGNvbnN0IGRpc3RhbmNlVGV4dCA9XG4gICAgZGlzdGFuY2UgPCAxMDAwXG4gICAgICA/IGAke2Rpc3RhbmNlLnRvRml4ZWQoMil9IG1gXG4gICAgICA6IGAke0Rpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VGcm9tTWV0ZXJzKGRpc3RhbmNlLCAna2lsb21ldGVycycpLnRvRml4ZWQoXG4gICAgICAgICAgMlxuICAgICAgICApfSBrbWBcblxuICByZXR1cm4gZGlzdGFuY2VUZXh0XG59XG5cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDMwKSBGSVhNRTogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuY29uc3QgZGlzdGFuY2VJbmZvID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBpZiAocHJvcHMubWVhc3VyZW1lbnRTdGF0ZSAhPT0gJ05PTkUnKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxNZXRhY2FyZEluZm8+XG4gICAgICAgIGRpc3RhbmNlOiB7Z2V0RGlzdGFuY2VUZXh0KHByb3BzLmN1cnJlbnREaXN0YW5jZSl9XG4gICAgICA8L01ldGFjYXJkSW5mbz5cbiAgICApXG4gIH1cbn1cblxuY29uc3QgcmVuZGVyID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBpZiAoIXZhbGlkQ29vcmRpbmF0ZXMocHJvcHMuY29vcmRpbmF0ZXMpKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvb3JkaW5hdGVzID0gZm9ybWF0Q29vcmRpbmF0ZXMocHJvcHMpXG4gIHJldHVybiAoXG4gICAgPFJvb3Qgey4uLnByb3BzfT5cbiAgICAgIHttZXRhY2FyZEluZm8ocHJvcHMpfVxuICAgICAge2Rpc3RhbmNlSW5mbyhwcm9wcyl9XG4gICAgICA8Q29vcmRpbmF0ZUluZm8+XG4gICAgICAgIDxzcGFuIGRhdGEtaWQ9XCJjb29yZGluYXRlcy1sYWJlbFwiPntjb29yZGluYXRlc308L3NwYW4+XG4gICAgICA8L0Nvb3JkaW5hdGVJbmZvPlxuICAgIDwvUm9vdD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCByZW5kZXJcbiJdfQ==