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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxwaGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L2xheWVyLWl0ZW0vcHJlc2VudGF0aW9uL2FscGhhLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLEVBQXFCLGdCQUFnQixFQUFFLE1BQU0sR0FBRyxDQUFBO0FBRXZELElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQy9CLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxPQUFPO0NBQ2QsQ0FBQyx1SUFBQSxvRUFHRCxJQUFBLENBQUE7QUFFRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGdGQUFBLE1BQy9CLEVBQXdDLEtBQzNDLEtBREcsVUFBQyxLQUFLLElBQUssT0FBQSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQTdCLENBQTZCLENBQzNDLENBQUE7QUFFRCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLHFIQUFBLGtEQUdqQyxJQUFBLENBQUE7QUFFRCxJQUFNLE1BQU0sR0FBRyxVQUFDLEtBQXdCO0lBQ2hDLElBQUEsS0FBa0IsS0FBSyxDQUFDLFVBQVUsRUFBaEMsSUFBSSxVQUFBLEVBQUUsS0FBSyxXQUFxQixDQUFBO0lBQ2hDLElBQUEsZ0JBQWdCLEdBQUssS0FBSyxDQUFDLE9BQU8saUJBQWxCLENBQWtCO0lBQzFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLG9CQUFDLFlBQVksZUFDSCxjQUFjLEVBQ3RCLFFBQVEsRUFBRSxnQkFBZ0IsRUFDMUIsS0FBSyxFQUFFLEtBQUssR0FDWixDQUNILENBQUMsQ0FBQyxDQUFDLENBQ0Ysb0JBQUMsYUFBYSxlQUNKLGNBQWMsRUFDdEIsUUFBUSxFQUFFLGdCQUFnQixFQUMxQixLQUFLLEVBQUUsS0FBSyxFQUNaLFFBQVEsU0FDUixDQUNILENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgUHJlc2VudGF0aW9uUHJvcHMsIERpc2FibGVkQmVoYXZpb3IgfSBmcm9tICcuJ1xuXG5jb25zdCBBbHBoYSA9IHN0eWxlZC5pbnB1dC5hdHRycyh7XG4gIG1pbjogJzAnLFxuICBtYXg6ICcxJyxcbiAgc3RlcDogJzAuMDEnLFxuICB0eXBlOiAncmFuZ2UnLFxufSlgXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZSAhaW1wb3J0YW50O1xuYFxuXG5jb25zdCBBbHBoYURpc2FibGVkID0gc3R5bGVkKEFscGhhKWBcbiAgJHsocHJvcHMpID0+IERpc2FibGVkQmVoYXZpb3IocHJvcHMudGhlbWUpfTtcbmBcblxuY29uc3QgQWxwaGFFbmFibGVkID0gc3R5bGVkKEFscGhhKWBcbiAgb3BhY2l0eTogMTtcbiAgY3Vyc29yOiBkZWZhdWx0ICFpbXBvcnRhbnQ7XG5gXG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJlc2VudGF0aW9uUHJvcHMpID0+IHtcbiAgY29uc3QgeyBzaG93LCBhbHBoYSB9ID0gcHJvcHMudmlzaWJpbGl0eVxuICBjb25zdCB7IHVwZGF0ZUxheWVyQWxwaGEgfSA9IHByb3BzLmFjdGlvbnNcbiAgcmV0dXJuIHNob3cgPyAoXG4gICAgPEFscGhhRW5hYmxlZFxuICAgICAgZGF0YS1pZD1cImFscGhhLXNsaWRlclwiXG4gICAgICBvbkNoYW5nZT17dXBkYXRlTGF5ZXJBbHBoYX1cbiAgICAgIHZhbHVlPXthbHBoYX1cbiAgICAvPlxuICApIDogKFxuICAgIDxBbHBoYURpc2FibGVkXG4gICAgICBkYXRhLWlkPVwiYWxwaGEtc2xpZGVyXCJcbiAgICAgIG9uQ2hhbmdlPXt1cGRhdGVMYXllckFscGhhfVxuICAgICAgdmFsdWU9e2FscGhhfVxuICAgICAgZGlzYWJsZWRcbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBjb25zdCBMYXllckFscGhhID0gaG90KG1vZHVsZSkocmVuZGVyKVxuIl19