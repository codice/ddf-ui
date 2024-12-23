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
var Name = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  line-height: ", ";\n  overflow: hidden;\n  text-overflow: ellipsis;\n"], ["\n  line-height: ", ";\n  overflow: hidden;\n  text-overflow: ellipsis;\n"])), function (props) { return props.theme.minimumButtonSize; });
var NameDisabled = styled(Name)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  ", ";\n  cursor: text !important;\n"], ["\n  ", ";\n  cursor: text !important;\n"])), function (props) { return DisabledBehavior(props.theme); });
var NameEnabled = styled(Name)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  opacity: 1;\n"], ["\n  opacity: 1;\n"])));
var render = function (props) {
    var _a = props.layerInfo.name, name = _a === void 0 ? 'Untitled' : _a;
    var show = props.visibility.show;
    return show ? (React.createElement(NameEnabled, { title: name }, name)) : (React.createElement(NameDisabled, { title: name }, name));
};
export var LayerName = hot(module)(render);
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbGF5ZXItaXRlbS9wcmVzZW50YXRpb24vbmFtZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFxQixnQkFBZ0IsRUFBRSxNQUFNLEdBQUcsQ0FBQTtBQUV2RCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyw4SUFBQSxtQkFDTixFQUF3QyxzREFHeEQsS0FIZ0IsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUE3QixDQUE2QixDQUd4RCxDQUFBO0FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyw0R0FBQSxNQUM3QixFQUF3QyxpQ0FFM0MsS0FGRyxVQUFDLEtBQUssSUFBSyxPQUFBLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBN0IsQ0FBNkIsQ0FFM0MsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0ZBQUEsbUJBRS9CLElBQUEsQ0FBQTtBQUVELElBQU0sTUFBTSxHQUFHLFVBQUMsS0FBd0I7SUFDOUIsSUFBQSxLQUFzQixLQUFLLENBQUMsU0FBUyxLQUFwQixFQUFqQixJQUFJLG1CQUFHLFVBQVUsS0FBQSxDQUFvQjtJQUNyQyxJQUFBLElBQUksR0FBSyxLQUFLLENBQUMsVUFBVSxLQUFyQixDQUFxQjtJQUNqQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixvQkFBQyxXQUFXLElBQUMsS0FBSyxFQUFFLElBQUksSUFBRyxJQUFJLENBQWUsQ0FDL0MsQ0FBQyxDQUFDLENBQUMsQ0FDRixvQkFBQyxZQUFZLElBQUMsS0FBSyxFQUFFLElBQUksSUFBRyxJQUFJLENBQWdCLENBQ2pELENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgUHJlc2VudGF0aW9uUHJvcHMsIERpc2FibGVkQmVoYXZpb3IgfSBmcm9tICcuJ1xuXG5jb25zdCBOYW1lID0gc3R5bGVkLmRpdmBcbiAgbGluZS1oZWlnaHQ6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtQnV0dG9uU2l6ZX07XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuYFxuY29uc3QgTmFtZURpc2FibGVkID0gc3R5bGVkKE5hbWUpYFxuICAkeyhwcm9wcykgPT4gRGlzYWJsZWRCZWhhdmlvcihwcm9wcy50aGVtZSl9O1xuICBjdXJzb3I6IHRleHQgIWltcG9ydGFudDtcbmBcblxuY29uc3QgTmFtZUVuYWJsZWQgPSBzdHlsZWQoTmFtZSlgXG4gIG9wYWNpdHk6IDE7XG5gXG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJlc2VudGF0aW9uUHJvcHMpID0+IHtcbiAgY29uc3QgeyBuYW1lID0gJ1VudGl0bGVkJyB9ID0gcHJvcHMubGF5ZXJJbmZvXG4gIGNvbnN0IHsgc2hvdyB9ID0gcHJvcHMudmlzaWJpbGl0eVxuICByZXR1cm4gc2hvdyA/IChcbiAgICA8TmFtZUVuYWJsZWQgdGl0bGU9e25hbWV9PntuYW1lfTwvTmFtZUVuYWJsZWQ+XG4gICkgOiAoXG4gICAgPE5hbWVEaXNhYmxlZCB0aXRsZT17bmFtZX0+e25hbWV9PC9OYW1lRGlzYWJsZWQ+XG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IExheWVyTmFtZSA9IGhvdChtb2R1bGUpKHJlbmRlcilcbiJdfQ==