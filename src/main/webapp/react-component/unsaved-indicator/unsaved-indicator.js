import { __assign, __makeTemplateObject, __rest } from "tslib";
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
var Root = styled.span(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: inline-block;\n  line-height: inherit;\n  vertical-align: top;\n  color: ", ";\n\n  transition: ", ";\n\n  transform: ", ";\n  opacity: ", ";\n"], ["\n  display: inline-block;\n  line-height: inherit;\n  vertical-align: top;\n  color: ", ";\n\n  transition: ", ";\n\n  transform: ", ";\n  opacity: ", ";\n"])), function (props) {
    return props.theme.warningColor;
}, function (_a) {
    var theme = _a.theme;
    return "transform ".concat(theme.coreTransitionTime, " ease-out, opacity ").concat(theme.coreTransitionTime, " ease-out;");
}, function (props) { return "scale(".concat(props.shown ? 1 : 2, ");"); }, function (props) { return (props.shown ? 1 : 0); });
export default function UnsavedIndicator(props) {
    var className = props.className, style = props.style, otherProps = __rest(props, ["className", "style"]);
    return (React.createElement(Root, __assign({ className: className, style: style }, otherProps), "*"));
}
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5zYXZlZC1pbmRpY2F0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3Vuc2F2ZWQtaW5kaWNhdG9yL3Vuc2F2ZWQtaW5kaWNhdG9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBUXRDLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLGlPQUFPLHdGQUlwQixFQUVSLHFCQUVhLEVBRWIsb0JBRVksRUFBMkMsZ0JBQzdDLEVBQWdDLEtBQzVDLEtBVlUsVUFBQyxLQUFLO0lBQ2IsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQTtBQUNqQyxDQUFDLEVBRWEsVUFBQyxFQUFTO1FBQVAsS0FBSyxXQUFBO0lBQ3BCLE9BQU8sb0JBQWEsS0FBSyxDQUFDLGtCQUFrQixnQ0FBc0IsS0FBSyxDQUFDLGtCQUFrQixlQUFZLENBQUE7QUFDeEcsQ0FBQyxFQUVZLFVBQUMsS0FBSyxJQUFLLE9BQUEsZ0JBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQUksRUFBaEMsQ0FBZ0MsRUFDN0MsVUFBQyxLQUFLLElBQUssT0FBQSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQXJCLENBQXFCLENBQzVDLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLGdCQUFnQixDQUFDLEtBQVk7SUFDM0MsSUFBQSxTQUFTLEdBQTJCLEtBQUssVUFBaEMsRUFBRSxLQUFLLEdBQW9CLEtBQUssTUFBekIsRUFBSyxVQUFVLFVBQUssS0FBSyxFQUEzQyxzQkFBbUMsQ0FBRixDQUFVO0lBQ2pELE9BQU8sQ0FDTCxvQkFBQyxJQUFJLGFBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBWSxJQUFNLFVBQVUsT0FFeEQsQ0FDUixDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICBzaG93bjogYm9vbGVhblxuICBjbGFzc05hbWU/OiBzdHJpbmdcbiAgc3R5bGU/OiBSZWFjdC5DU1NQcm9wZXJ0aWVzXG59XG5cbmNvbnN0IFJvb3QgPSBzdHlsZWQuc3BhbjxQcm9wcz5gXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gIHZlcnRpY2FsLWFsaWduOiB0b3A7XG4gIGNvbG9yOiAkeyhwcm9wcykgPT4ge1xuICAgIHJldHVybiBwcm9wcy50aGVtZS53YXJuaW5nQ29sb3JcbiAgfX07XG5cbiAgdHJhbnNpdGlvbjogJHsoeyB0aGVtZSB9KSA9PiB7XG4gICAgcmV0dXJuIGB0cmFuc2Zvcm0gJHt0aGVtZS5jb3JlVHJhbnNpdGlvblRpbWV9IGVhc2Utb3V0LCBvcGFjaXR5ICR7dGhlbWUuY29yZVRyYW5zaXRpb25UaW1lfSBlYXNlLW91dDtgXG4gIH19O1xuXG4gIHRyYW5zZm9ybTogJHsocHJvcHMpID0+IGBzY2FsZSgke3Byb3BzLnNob3duID8gMSA6IDJ9KTtgfTtcbiAgb3BhY2l0eTogJHsocHJvcHMpID0+IChwcm9wcy5zaG93biA/IDEgOiAwKX07XG5gXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVuc2F2ZWRJbmRpY2F0b3IocHJvcHM6IFByb3BzKSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lLCBzdHlsZSwgLi4ub3RoZXJQcm9wcyB9ID0gcHJvcHNcbiAgcmV0dXJuIChcbiAgICA8Um9vdCBjbGFzc05hbWU9e2NsYXNzTmFtZX0gc3R5bGU9e3N0eWxlIGFzIGFueX0gey4uLm90aGVyUHJvcHN9PlxuICAgICAgKlxuICAgIDwvUm9vdD5cbiAgKVxufVxuIl19