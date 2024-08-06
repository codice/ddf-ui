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
import { LayerRearrange, LayerAlpha, LayerInteractions, LayerName } from '.';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  white-space: nowrap;\n  width: 100%;\n  overflow: hidden;\n  position: relative;\n  border: 2px solid rgba(255, 255, 255, 0.1);\n  border-top: ", ";\n"], ["\n  display: block;\n  white-space: nowrap;\n  width: 100%;\n  overflow: hidden;\n  position: relative;\n  border: 2px solid rgba(255, 255, 255, 0.1);\n  border-top: ", ";\n"])), function (props) {
    if (!props.order.isTop) {
        return 'none';
    }
    return;
});
var LayerPropertiesRoot = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: inline-block;\n  vertical-align: middle;\n  padding: 0 ", ";\n  margin-left: ", ";\n  width: calc(100% - ", ");\n  border-left: 2px solid rgba(255, 255, 255, 0.1);\n"], ["\n  display: inline-block;\n  vertical-align: middle;\n  padding: 0 ", ";\n  margin-left: ", ";\n  width: calc(100% - ", ");\n  border-left: 2px solid rgba(255, 255, 255, 0.1);\n"])), function (props) { return props.theme.mediumSpacing; }, function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumButtonSize; });
var render = function (props) {
    return (React.createElement(Root, __assign({}, props),
        React.createElement(LayerRearrange, __assign({}, props)),
        React.createElement(LayerPropertiesRoot, null,
            React.createElement(LayerName, __assign({}, props)),
            React.createElement(LayerAlpha, __assign({}, props)),
            React.createElement(LayerInteractions, __assign({}, props)))));
};
export default hot(module)(render);
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXItaXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbGF5ZXItaXRlbS9wcmVzZW50YXRpb24vbGF5ZXItaXRlbS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFHdEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sR0FBRyxDQUFBO0FBRTVFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLGtQQUFtQix3S0FPMUIsRUFLYixLQUNGLEtBTmUsVUFBQyxLQUFLO0lBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtRQUN0QixPQUFPLE1BQU0sQ0FBQTtLQUNkO0lBQ0QsT0FBTTtBQUNSLENBQUMsQ0FDRixDQUFBO0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsR0FBRyx1UEFBQSxzRUFHdkIsRUFBb0Msb0JBQ2xDLEVBQXdDLDBCQUNsQyxFQUF3QywwREFFOUQsS0FKYyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUF6QixDQUF5QixFQUNsQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQTdCLENBQTZCLEVBQ2xDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBN0IsQ0FBNkIsQ0FFOUQsQ0FBQTtBQUVELElBQU0sTUFBTSxHQUFHLFVBQUMsS0FBd0I7SUFDdEMsT0FBTyxDQUNMLG9CQUFDLElBQUksZUFBSyxLQUFLO1FBQ2Isb0JBQUMsY0FBYyxlQUFLLEtBQUssRUFBSTtRQUM3QixvQkFBQyxtQkFBbUI7WUFDbEIsb0JBQUMsU0FBUyxlQUFLLEtBQUssRUFBSTtZQUN4QixvQkFBQyxVQUFVLGVBQUssS0FBSyxFQUFJO1lBQ3pCLG9CQUFDLGlCQUFpQixlQUFLLEtBQUssRUFBSSxDQUNaLENBQ2pCLENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgUHJlc2VudGF0aW9uUHJvcHMgfSBmcm9tICcuJ1xuXG5pbXBvcnQgeyBMYXllclJlYXJyYW5nZSwgTGF5ZXJBbHBoYSwgTGF5ZXJJbnRlcmFjdGlvbnMsIExheWVyTmFtZSB9IGZyb20gJy4nXG5cbmNvbnN0IFJvb3QgPSBzdHlsZWQuZGl2PFByZXNlbnRhdGlvblByb3BzPmBcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIHdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgYm9yZGVyLXRvcDogJHsocHJvcHMpID0+IHtcbiAgICBpZiAoIXByb3BzLm9yZGVyLmlzVG9wKSB7XG4gICAgICByZXR1cm4gJ25vbmUnXG4gICAgfVxuICAgIHJldHVyblxuICB9fTtcbmBcblxuY29uc3QgTGF5ZXJQcm9wZXJ0aWVzUm9vdCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgcGFkZGluZzogMCAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWVkaXVtU3BhY2luZ307XG4gIG1hcmdpbi1sZWZ0OiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bUJ1dHRvblNpemV9O1xuICB3aWR0aDogY2FsYygxMDAlIC0gJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1CdXR0b25TaXplfSk7XG4gIGJvcmRlci1sZWZ0OiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xuYFxuXG5jb25zdCByZW5kZXIgPSAocHJvcHM6IFByZXNlbnRhdGlvblByb3BzKSA9PiB7XG4gIHJldHVybiAoXG4gICAgPFJvb3Qgey4uLnByb3BzfT5cbiAgICAgIDxMYXllclJlYXJyYW5nZSB7Li4ucHJvcHN9IC8+XG4gICAgICA8TGF5ZXJQcm9wZXJ0aWVzUm9vdD5cbiAgICAgICAgPExheWVyTmFtZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgIDxMYXllckFscGhhIHsuLi5wcm9wc30gLz5cbiAgICAgICAgPExheWVySW50ZXJhY3Rpb25zIHsuLi5wcm9wc30gLz5cbiAgICAgIDwvTGF5ZXJQcm9wZXJ0aWVzUm9vdD5cbiAgICA8L1Jvb3Q+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkocmVuZGVyKVxuIl19