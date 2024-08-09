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
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { DarkDivider } from '../../component/dark-divider/dark-divider';
import { TypedUserInstance, useActingRole, } from '../../component/singletons/TypedUser';
import PersonIcon from '@mui/icons-material/Person';
import user from '../../component/singletons/user-instance';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ExtensionPoints from '../../extension-points/extension-points';
import { postSimpleAuditLog } from '../../react-component/utils/audit/audit-endpoint';
export var EnhancedRolesContext = React.createContext({
    enhancedRoles: [],
});
var useEnhancedRoles = function () {
    var enhancedRoles = React.useContext(EnhancedRolesContext).enhancedRoles;
    return enhancedRoles;
};
export var RoleDisplay = function () {
    var actingRole = useActingRole();
    var enhancedRoles = useEnhancedRoles();
    if (actingRole === 'enhanced' && enhancedRoles.length > 0) {
        return React.createElement(React.Fragment, null, "Advanced");
    }
    return null;
};
var RolesToggle = function () {
    var actingRole = useActingRole();
    var enhancedRoles = useEnhancedRoles();
    if (!enhancedRoles || enhancedRoles.length === 0) {
        return null;
    }
    return (React.createElement("div", { className: "ml-1 pt-4" },
        React.createElement("div", { className: "font-normal text-lg" }, "Role"),
        React.createElement(FormControlLabel, { className: "pb-4", label: React.createElement(Typography, { variant: "body2" }, "Advanced"), control: React.createElement(Switch, { color: "primary", checked: actingRole === 'enhanced', onChange: function (e) {
                    TypedUserInstance.setActingRole(e.target.checked ? 'enhanced' : 'user');
                    postSimpleAuditLog({
                        action: 'ROLE_CHANGE',
                        component: e.target.checked
                            ? 'user enabled advanced_mode, roles: [' + enhancedRoles + ']'
                            : 'user disabled advanced_mode',
                    });
                } }) }),
        React.createElement("div", { className: "".concat(actingRole === 'user' ? 'opacity-50' : '') },
            React.createElement("div", { className: "pb-1 font-normal italic" }, "My Advanced Roles"),
            enhancedRoles.map(function (role) {
                return React.createElement("div", { className: "text-sm" }, role);
            }))));
};
var UserComponent = function () {
    var username = user.getUserName();
    var email = user.getEmail();
    var signOut = function () {
        window.location.href =
            '../../logout?service=' + encodeURIComponent(window.location.href);
    };
    return (React.createElement("div", { className: "w-full h-full flex flex-col" },
        React.createElement("div", { className: "shrink-1 overflow-auto p-2" },
            React.createElement("div", { className: "flex flex-row items-center flex-nowrap" },
                React.createElement("div", { className: "pr-2" },
                    React.createElement(PersonIcon, null)),
                React.createElement("div", null,
                    React.createElement("div", { "data-id": "profile-username", className: "info-username is-large-font is-bold" }, username),
                    React.createElement("div", { "data-id": "profile-email", className: "info-email is-medium-font" }, email))),
            React.createElement(RolesToggle, null),
            React.createElement(ExtensionPoints.userInformation, null)),
        React.createElement(DarkDivider, { className: "my-2 shrink-0" }),
        React.createElement("div", { className: "text-right p-2 shrink-0" },
            React.createElement(Button, { "data-id": "profile-signout-button", color: "primary", variant: "contained", onClick: signOut }, "Sign Out"))));
};
export default hot(module)(UserComponent);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdXNlci91c2VyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUN2RSxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLGFBQWEsR0FDZCxNQUFNLHNDQUFzQyxDQUFBO0FBQzdDLE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFBO0FBQ25ELE9BQU8sSUFBSSxNQUFNLDBDQUEwQyxDQUFBO0FBQzNELE9BQU8sZ0JBQWdCLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0QsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxlQUFlLE1BQU0seUNBQXlDLENBQUE7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0RBQWtELENBQUE7QUFFckYsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FFcEQ7SUFDRCxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDLENBQUE7QUFFRixJQUFNLGdCQUFnQixHQUFHO0lBQ2YsSUFBQSxhQUFhLEdBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxjQUEzQyxDQUEyQztJQUNoRSxPQUFPLGFBQWEsQ0FBQTtBQUN0QixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUc7SUFDekIsSUFBTSxVQUFVLEdBQUcsYUFBYSxFQUFFLENB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UyxFQUFDLHlCQUF5QjtZQUN0QyxvQkFBQyxNQUFNLGVBQ0csd0JBQXdCLEVBQ2hDLEtBQUssRUFBQyxTQUFTLEVBQ2YsT0FBTyxFQUFDLFdBQVcsRUFDbkIsT0FBTyxFQUFFLE9BQU8sZUFHVCxDQUNMLENBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBEYXJrRGl2aWRlciB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9kYXJrLWRpdmlkZXIvZGFyay1kaXZpZGVyJ1xuaW1wb3J0IHtcbiAgVHlwZWRVc2VySW5zdGFuY2UsXG4gIHVzZUFjdGluZ1JvbGUsXG59IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCBQZXJzb25JY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvUGVyc29uJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBGb3JtQ29udHJvbExhYmVsIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRm9ybUNvbnRyb2xMYWJlbCdcbmltcG9ydCBTd2l0Y2ggZnJvbSAnQG11aS9tYXRlcmlhbC9Td2l0Y2gnXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgRXh0ZW5zaW9uUG9pbnRzIGZyb20gJy4uLy4uL2V4dGVuc2lvbi1wb2ludHMvZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IHBvc3RTaW1wbGVBdWRpdExvZyB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9hdWRpdC9hdWRpdC1lbmRwb2ludCdcblxuZXhwb3J0IGNvbnN0IEVuaGFuY2VkUm9sZXNDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDx7XG4gIGVuaGFuY2VkUm9sZXM6IHN0cmluZ1tdXG59Pih7XG4gIGVuaGFuY2VkUm9sZXM6IFtdLFxufSlcblxuY29uc3QgdXNlRW5oYW5jZWRSb2xlcyA9ICgpID0+IHtcbiAgY29uc3QgeyBlbmhhbmNlZFJvbGVzIH0gPSBSZWFjdC51c2VDb250ZXh0KEVuaGFuY2VkUm9sZXNDb250ZXh0KVxuICByZXR1cm4gZW5oYW5jZWRSb2xlc1xufVxuXG5leHBvcnQgY29uc3QgUm9sZURpc3BsYXkgPSAoKSA9PiB7XG4gIGNvbnN0IGFjdGluZ1JvbGUgPSB1c2VBY3RpbmdSb2xlKClcbiAgY29uc3QgZW5oYW5jZWRSb2xlcyA9IHVzZUVuaGFuY2VkUm9sZXMoKVxuXG4gIGlmIChhY3RpbmdSb2xlID09PSAnZW5oYW5jZWQnICYmIGVuaGFuY2VkUm9sZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiA8PkFkdmFuY2VkPC8+XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgUm9sZXNUb2dnbGUgPSAoKSA9PiB7XG4gIGNvbnN0IGFjdGluZ1JvbGUgPSB1c2VBY3RpbmdSb2xlKClcbiAgY29uc3QgZW5oYW5jZWRSb2xlcyA9IHVzZUVuaGFuY2VkUm9sZXMoKVxuXG4gIGlmICghZW5oYW5jZWRSb2xlcyB8fCBlbmhhbmNlZFJvbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWwtMSBwdC00XCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvbnQtbm9ybWFsIHRleHQtbGdcIj5Sb2xlPC9kaXY+XG4gICAgICA8Rm9ybUNvbnRyb2xMYWJlbFxuICAgICAgICBjbGFzc05hbWU9XCJwYi00XCJcbiAgICAgICAgbGFiZWw9ezxUeXBvZ3JhcGh5IHZhcmlhbnQ9XCJib2R5MlwiPkFkdmFuY2VkPC9UeXBvZ3JhcGh5Pn1cbiAgICAgICAgY29udHJvbD17XG4gICAgICAgICAgPFN3aXRjaFxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e2FjdGluZ1JvbGUgPT09ICdlbmhhbmNlZCd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgVHlwZWRVc2VySW5zdGFuY2Uuc2V0QWN0aW5nUm9sZShcbiAgICAgICAgICAgICAgICBlLnRhcmdldC5jaGVja2VkID8gJ2VuaGFuY2VkJyA6ICd1c2VyJ1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHBvc3RTaW1wbGVBdWRpdExvZyh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnUk9MRV9DSEFOR0UnLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogZS50YXJnZXQuY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgPyAndXNlciBlbmFibGVkIGFkdmFuY2VkX21vZGUsIHJvbGVzOiBbJyArIGVuaGFuY2VkUm9sZXMgKyAnXSdcbiAgICAgICAgICAgICAgICAgIDogJ3VzZXIgZGlzYWJsZWQgYWR2YW5jZWRfbW9kZScsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIH1cbiAgICAgIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YWN0aW5nUm9sZSA9PT0gJ3VzZXInID8gJ29wYWNpdHktNTAnIDogJyd9YH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGItMSBmb250LW5vcm1hbCBpdGFsaWNcIj5NeSBBZHZhbmNlZCBSb2xlczwvZGl2PlxuICAgICAgICB7ZW5oYW5jZWRSb2xlcy5tYXAoKHJvbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXNtXCI+e3JvbGV9PC9kaXY+XG4gICAgICAgIH0pfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgVXNlckNvbXBvbmVudCA9ICgpID0+IHtcbiAgY29uc3QgdXNlcm5hbWUgPSB1c2VyLmdldFVzZXJOYW1lKClcbiAgY29uc3QgZW1haWwgPSB1c2VyLmdldEVtYWlsKClcbiAgY29uc3Qgc2lnbk91dCA9ICgpID0+IHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9XG4gICAgICAnLi4vLi4vbG9nb3V0P3NlcnZpY2U9JyArIGVuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaHJlZilcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBmbGV4IGZsZXgtY29sXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNocmluay0xIG92ZXJmbG93LWF1dG8gcC0yXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIgZmxleC1ub3dyYXBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByLTJcIj5cbiAgICAgICAgICAgIDxQZXJzb25JY29uIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgZGF0YS1pZD1cInByb2ZpbGUtdXNlcm5hbWVcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmZvLXVzZXJuYW1lIGlzLWxhcmdlLWZvbnQgaXMtYm9sZFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt1c2VybmFtZX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBkYXRhLWlkPVwicHJvZmlsZS1lbWFpbFwiIGNsYXNzTmFtZT1cImluZm8tZW1haWwgaXMtbWVkaXVtLWZvbnRcIj5cbiAgICAgICAgICAgICAge2VtYWlsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8Um9sZXNUb2dnbGUgLz5cbiAgICAgICAgPEV4dGVuc2lvblBvaW50cy51c2VySW5mb3JtYXRpb24gLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPERhcmtEaXZpZGVyIGNsYXNzTmFtZT1cIm15LTIgc2hyaW5rLTBcIiAvPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXJpZ2h0IHAtMiBzaHJpbmstMFwiPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgZGF0YS1pZD1cInByb2ZpbGUtc2lnbm91dC1idXR0b25cIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgb25DbGljaz17c2lnbk91dH1cbiAgICAgICAgPlxuICAgICAgICAgIFNpZ24gT3V0XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoVXNlckNvbXBvbmVudClcbiJdfQ==