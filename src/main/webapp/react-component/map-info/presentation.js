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
var render = function (props) {
    if (!validCoordinates(props.coordinates)) {
        return null;
    }
    var coordinates = formatCoordinates(props);
    return (_jsxs(Root, __assign({}, props, { children: [metacardInfo(props), _jsx(CoordinateInfo, { children: _jsx("span", { "data-id": "coordinates-label", children: coordinates }) })] })));
};
export default render;
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tYXAtaW5mby9wcmVzZW50YXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBRXRDLE9BQU8sRUFBa0MsZ0JBQWdCLEVBQUUsTUFBTSxHQUFHLENBQUE7QUFDcEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQVFqRSxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRywrVUFBTyw4RUFFZCxFQUFzQyxzRUFJdkMsRUFBc0MsMEZBS3hDLEVBQXFDLHdCQUVqRCxLQVhlLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBSXZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBS3hDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBRWpELENBQUE7QUFDRCxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsR0FBRyxzSEFBQSxtREFHaEMsSUFBQSxDQUFBO0FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsZ0pBQUEsNkVBSTlCLElBQUEsQ0FBQTtBQUVELElBQU0sWUFBWSxHQUFHLFVBQUMsRUFBcUI7UUFBbkIsVUFBVSxnQkFBQTtJQUNoQyxPQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUEwQjtZQUF4QixJQUFJLFVBQUEsRUFBRSxLQUFLLFdBQUE7UUFDM0IsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDekIsT0FBTyxDQUNMLHdCQUNFLGNBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBSSxJQUQ3RCxJQUFJLENBRVIsQ0FDUCxDQUFBO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLENBQ0wsS0FBQyxZQUFZLGNBQ1YsZUFBZSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxJQURoQixJQUFJLENBRVIsQ0FDaEIsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDLENBQUM7QUFkRixDQWNFLENBQUE7QUFFSixJQUFNLE1BQU0sR0FBRyxVQUFDLEtBQVk7SUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELElBQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVDLE9BQU8sQ0FDTCxNQUFDLElBQUksZUFBSyxLQUFLLGVBQ1osWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUNwQixLQUFDLGNBQWMsY0FDYiwwQkFBYyxtQkFBbUIsWUFBRSxXQUFXLEdBQVEsR0FDdkMsS0FDWixDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLE1BQU0sQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENvb3JkaW5hdGVzLCBGb3JtYXQsIHZhbGlkQ29vcmRpbmF0ZXMgfSBmcm9tICcuJ1xuaW1wb3J0IHsgZm9ybWF0QXR0cmlidXRlLCBmb3JtYXRDb29yZGluYXRlcyB9IGZyb20gJy4vZm9ybWF0dGluZydcblxudHlwZSBQcm9wcyA9IHtcbiAgZm9ybWF0OiBGb3JtYXRcbiAgYXR0cmlidXRlczogQXR0cmlidXRlW11cbiAgY29vcmRpbmF0ZXM6IENvb3JkaW5hdGVzXG59XG5cbmNvbnN0IFJvb3QgPSBzdHlsZWQuZGl2PFByb3BzPmBcbiAgZm9udC1mYW1pbHk6ICdJbmNvbnNvbGF0YScsICdMdWNpZGEgQ29uc29sZScsIG1vbm9zcGFjZTtcbiAgYmFja2dyb3VuZDogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmJhY2tncm91bmRNb2RhbH07XG4gIGRpc3BsYXk6IGJsb2NrO1xuICB3aWR0aDogYXV0bztcbiAgaGVpZ2h0OiBhdXRvO1xuICBmb250LXNpemU6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtRm9udFNpemV9O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGxlZnQ6IDBweDtcbiAgYm90dG9tOiAwcHg7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIHBhZGRpbmc6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtU3BhY2luZ307XG4gIG1heC13aWR0aDogNTAlO1xuYFxuY29uc3QgQ29vcmRpbmF0ZUluZm8gPSBzdHlsZWQuZGl2YFxuICB3aGl0ZS1zcGFjZTogcHJlO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG5gXG5jb25zdCBNZXRhY2FyZEluZm8gPSBzdHlsZWQuZGl2YFxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbmBcblxuY29uc3QgbWV0YWNhcmRJbmZvID0gKHsgYXR0cmlidXRlcyB9OiBQcm9wcykgPT5cbiAgYXR0cmlidXRlcy5tYXAoKHsgbmFtZSwgdmFsdWUgfTogQXR0cmlidXRlKSA9PiB7XG4gICAgaWYgKG5hbWUgPT09ICd0aHVtYm5haWwnKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17bmFtZX0+XG4gICAgICAgICAgPGltZyBzcmM9e3ZhbHVlfSBzdHlsZT17eyBtYXhXaWR0aDogJzEwMHB4JywgbWF4SGVpZ2h0OiAnMTAwcHgnIH19IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8TWV0YWNhcmRJbmZvIGtleT17bmFtZX0+XG4gICAgICAgICAge2Zvcm1hdEF0dHJpYnV0ZSh7IG5hbWUsIHZhbHVlIH0pfVxuICAgICAgICA8L01ldGFjYXJkSW5mbz5cbiAgICAgIClcbiAgICB9XG4gIH0pXG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgaWYgKCF2YWxpZENvb3JkaW5hdGVzKHByb3BzLmNvb3JkaW5hdGVzKSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBjb29yZGluYXRlcyA9IGZvcm1hdENvb3JkaW5hdGVzKHByb3BzKVxuICByZXR1cm4gKFxuICAgIDxSb290IHsuLi5wcm9wc30+XG4gICAgICB7bWV0YWNhcmRJbmZvKHByb3BzKX1cbiAgICAgIDxDb29yZGluYXRlSW5mbz5cbiAgICAgICAgPHNwYW4gZGF0YS1pZD1cImNvb3JkaW5hdGVzLWxhYmVsXCI+e2Nvb3JkaW5hdGVzfTwvc3Bhbj5cbiAgICAgIDwvQ29vcmRpbmF0ZUluZm8+XG4gICAgPC9Sb290PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIl19