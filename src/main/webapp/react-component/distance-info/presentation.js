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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9kaXN0YW5jZS1pbmZvL3ByZXNlbnRhdGlvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLGFBQWEsTUFBTSx3QkFBd0IsQ0FBQTtBQVFsRCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxpVEFBTyw4RUFFZCxFQUFzQyxzRUFJdkMsRUFBcUMsNERBR3ZDLEVBQXFDLHdCQUVqRCxLQVRlLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBSXZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLEVBR3ZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBRWpELENBQUE7QUFFRCxJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxHQUFHLGdKQUFBLDZFQUlsQztJQUVEOztPQUVHO0lBSkYsQ0FBQTtBQUVEOztHQUVHO0FBQ0gsSUFBTSxlQUFlLEdBQUcsVUFBQyxRQUFnQjtJQUN2QyxnRkFBZ0Y7SUFDaEYsSUFBTSxZQUFZLEdBQ2hCLFFBQVEsR0FBRyxJQUFJO1FBQ2IsQ0FBQyxDQUFDLFVBQUcsUUFBUSxPQUFJO1FBQ2pCLENBQUMsQ0FBQyxVQUFHLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUNwRSxDQUFDLENBQ0YsUUFBSyxDQUFBO0lBRVosT0FBTyxZQUFZLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsSUFBTSxNQUFNLEdBQUcsVUFBQyxLQUFZO0lBQzFCLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVsRSxPQUFPLENBQ0wsb0JBQUMsSUFBSSxlQUFLLEtBQUssSUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRTtRQUMxRCxvQkFBQyxnQkFBZ0IsUUFBRSxlQUFlLENBQUMsUUFBUSxDQUFDLENBQW9CLENBQzNELENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsTUFBTSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgRGlzdGFuY2VVdGlscyBmcm9tICcuLi8uLi9qcy9EaXN0YW5jZVV0aWxzJ1xuXG50eXBlIFByb3BzID0ge1xuICBjdXJyZW50RGlzdGFuY2U6IG51bWJlclxuICBsZWZ0OiBudW1iZXJcbiAgdG9wOiBudW1iZXJcbn1cblxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXY8UHJvcHM+YFxuICBmb250LWZhbWlseTogJ0luY29uc29sYXRhJywgJ0x1Y2lkYSBDb25zb2xlJywgbW9ub3NwYWNlO1xuICBiYWNrZ3JvdW5kOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUuYmFja2dyb3VuZE1vZGFsfTtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiBhdXRvO1xuICBoZWlnaHQ6IGF1dG87XG4gIGZvbnQtc2l6ZTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1lZGl1bUZvbnRTaXplfTtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBwYWRkaW5nOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bVNwYWNpbmd9O1xuICBtYXgtd2lkdGg6IDUwJTtcbmBcblxuY29uc3QgRGlzdGFuY2VJbmZvVGV4dCA9IHN0eWxlZC5kaXZgXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuYFxuXG4vKlxuICogRm9ybWF0cyB0aGUgY3VycmVudCBkaXN0YW5jZSB2YWx1ZSB0byBhIHN0cmluZyB3aXRoIHRoZSBhcHByb3ByaWF0ZSB1bml0IG9mIG1lYXN1cmVtZW50LlxuICovXG5jb25zdCBnZXREaXN0YW5jZVRleHQgPSAoZGlzdGFuY2U6IG51bWJlcikgPT4ge1xuICAvLyB1c2UgbWV0ZXJzIHdoZW4gZGlzdGFuY2UgaXMgdW5kZXIgMTAwMG0gYW5kIGNvbnZlcnQgdG8ga2lsb21ldGVycyB3aGVuIOKJpTEwMDBtXG4gIGNvbnN0IGRpc3RhbmNlVGV4dCA9XG4gICAgZGlzdGFuY2UgPCAxMDAwXG4gICAgICA/IGAke2Rpc3RhbmNlfSBtYFxuICAgICAgOiBgJHtEaXN0YW5jZVV0aWxzLmdldERpc3RhbmNlRnJvbU1ldGVycyhkaXN0YW5jZSwgJ2tpbG9tZXRlcnMnKS50b0ZpeGVkKFxuICAgICAgICAgIDJcbiAgICAgICAgKX0ga21gXG5cbiAgcmV0dXJuIGRpc3RhbmNlVGV4dFxufVxuXG5jb25zdCByZW5kZXIgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IGRpc3RhbmNlID0gcHJvcHMuY3VycmVudERpc3RhbmNlID8gcHJvcHMuY3VycmVudERpc3RhbmNlIDogMFxuXG4gIHJldHVybiAoXG4gICAgPFJvb3Qgey4uLnByb3BzfSBzdHlsZT17eyBsZWZ0OiBwcm9wcy5sZWZ0LCB0b3A6IHByb3BzLnRvcCB9fT5cbiAgICAgIDxEaXN0YW5jZUluZm9UZXh0PntnZXREaXN0YW5jZVRleHQoZGlzdGFuY2UpfTwvRGlzdGFuY2VJbmZvVGV4dD5cbiAgICA8L1Jvb3Q+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyXG4iXX0=