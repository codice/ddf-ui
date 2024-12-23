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
import PersonIcon from '@mui/icons-material/Person';
import user from '../../component/singletons/user-instance';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ExtensionPoints from '../../extension-points/extension-points';
import { postSimpleAuditLog } from '../../react-component/utils/audit/audit-endpoint';
import { useDialog } from '../../component/dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContent from '@mui/material/DialogContent';
import { getIsUsingElevatedRights, setIsUsingElevatedRights, } from '../../component/elevated-rights/elevated-rights';
export var EnhancedRolesContext = React.createContext({
    enhancedRoles: [],
});
var useEnhancedRoles = function () {
    var enhancedRoles = React.useContext(EnhancedRolesContext).enhancedRoles;
    return enhancedRoles;
};
export var RoleDisplay = function () {
    var isUsingElevatedRights = getIsUsingElevatedRights();
    var enhancedRoles = useEnhancedRoles();
    if (isUsingElevatedRights && enhancedRoles.length > 0) {
        return React.createElement(React.Fragment, null, "Advanced");
    }
    return null;
};
var RolesToggle = function () {
    var isUsingElevatedRights = getIsUsingElevatedRights();
    var enhancedRoles = useEnhancedRoles();
    var dialogContext = useDialog();
    if (!enhancedRoles || enhancedRoles.length === 0) {
        return null;
    }
    return (React.createElement("div", { className: "ml-1 pt-4" },
        React.createElement("div", { className: "font-normal text-lg" }, "Role"),
        React.createElement(FormControlLabel, { className: "pb-4", label: React.createElement(Typography, { variant: "body2" }, "Advanced"), control: React.createElement(Switch, { color: "primary", checked: isUsingElevatedRights, onChange: function (e) {
                    setIsUsingElevatedRights(e.target.checked);
                    postSimpleAuditLog({
                        action: 'ROLE_CHANGE',
                        component: e.target.checked
                            ? 'user enabled advanced_mode, roles: [' + enhancedRoles + ']'
                            : 'user disabled advanced_mode',
                    });
                    dialogContext.setProps({
                        open: true,
                        onClose: function () { },
                        children: (React.createElement(React.Fragment, null,
                            React.createElement(DialogTitle, null,
                                React.createElement(Typography, { variant: "h5" }, "Switching Role")),
                            React.createElement(DialogContent, { className: "overflow-hidden" },
                                React.createElement(DialogContentText, { variant: "subtitle1" }, "The page will refresh to complete the role change."),
                                React.createElement("div", { className: "flex justify-center py-5" },
                                    React.createElement(CircularProgress, { size: 80 }))))),
                    });
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                } }) }),
        React.createElement("div", { className: "".concat(isUsingElevatedRights ? '' : 'opacity-50') },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdXNlci91c2VyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQTtBQUN2RSxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLGdCQUFnQixNQUFNLGdDQUFnQyxDQUFBO0FBQzdELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sZUFBZSxNQUFNLHlDQUF5QyxDQUFBO0FBQ3JFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFBO0FBQ3JGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNsRCxPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQTtBQUNuRCxPQUFPLGlCQUFpQixNQUFNLGlDQUFpQyxDQUFBO0FBQy9ELE9BQU8sZ0JBQWdCLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0QsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxFQUNMLHdCQUF3QixFQUN4Qix3QkFBd0IsR0FDekIsTUFBTSxpREFBaUQsQ0FBQTtBQUV4RCxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUVwRDtJQUNELGFBQWEsRUFBRSxFQUFFO0NBQ2xCLENBQUMsQ0FBQTtBQUVG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QUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ25DLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUM3QixJQUFNLE9BQU8sR0FBRztRQUNkLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUNsQix1QkFBdUIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RFLENBQUMsQ0FBQTtJQUNELE9BQU8sQ0FDTCw2QkFBSyxTQUFTLEVBQUMsNkJBQTZCO1FBQzFDLDZCQUFLLFNBQVMsRUFBQyw0QkFBNEI7WUFDekMsNkJBQUssU0FBUyxFQUFDLHdDQUF3QztnQkFDckQsNkJBQUssU0FBUyxFQUFDLE1BQU07b0JBQ25CLG9CQUFDLFVBQVUsT0FBRyxDQUNWO2dCQUNOO29CQUNFLHdDQUNVLGtCQUFrQixFQUMxQixTQUFTLEVBQUMscUNBQXFDLElBRTlDLFFBQVEsQ0FDTDtvQkFDTix3Q0FBYSxlQUFlLEVBQUMsU0FBUyxFQUFDLDJCQUEyQixJQUMvRCxLQUFLLENBQ0YsQ0FDRixDQUNGO1lBQ04sb0JBQUMsV0FBVyxPQUFHO1lBQ2Ysb0JBQUMsZUFBZSxDQUFDLGVBQWUsT0FBRyxDQUMvQjtRQUNOLG9CQUFDLFdBQVcsSUFBQyxTQUFTLEVBQUMsZUFBZSxHQUFHO1FBQ3pDLDZCQUFLLFNBQVMsRUFBQyx5QkFBeUI7WUFDdEMsb0JBQUMsTUFBTSxlQUNHLHdCQUF3QixFQUNoQyxLQUFLLEVBQUMsU0FBUyxFQUNmLE9BQU8sRUFBQyxXQUFXLEVBQ25CLE9BQU8sRUFBRSxPQUFPLGVBR1QsQ0FDTCxDQUNGLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IHsgRGFya0RpdmlkZXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvZGFyay1kaXZpZGVyL2RhcmstZGl2aWRlcidcbmltcG9ydCBQZXJzb25JY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvUGVyc29uJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBGb3JtQ29udHJvbExhYmVsIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRm9ybUNvbnRyb2xMYWJlbCdcbmltcG9ydCBTd2l0Y2ggZnJvbSAnQG11aS9tYXRlcmlhbC9Td2l0Y2gnXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgRXh0ZW5zaW9uUG9pbnRzIGZyb20gJy4uLy4uL2V4dGVuc2lvbi1wb2ludHMvZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IHBvc3RTaW1wbGVBdWRpdExvZyB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9hdWRpdC9hdWRpdC1lbmRwb2ludCdcbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9kaWFsb2cnXG5pbXBvcnQgRGlhbG9nVGl0bGUgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dUaXRsZSdcbmltcG9ydCBEaWFsb2dDb250ZW50VGV4dCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnRUZXh0J1xuaW1wb3J0IENpcmN1bGFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9DaXJjdWxhclByb2dyZXNzJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50J1xuaW1wb3J0IHtcbiAgZ2V0SXNVc2luZ0VsZXZhdGVkUmlnaHRzLFxuICBzZXRJc1VzaW5nRWxldmF0ZWRSaWdodHMsXG59IGZyb20gJy4uLy4uL2NvbXBvbmVudC9lbGV2YXRlZC1yaWdodHMvZWxldmF0ZWQtcmlnaHRzJ1xuXG5leHBvcnQgY29uc3QgRW5oYW5jZWRSb2xlc0NvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0PHtcbiAgZW5oYW5jZWRSb2xlczogc3RyaW5nW11cbn0+KHtcbiAgZW5oYW5jZWRSb2xlczogW10sXG59KVxuXG5jb25zdCB1c2VFbmhhbmNlZFJvbGVzID0gKCkgPT4ge1xuICBjb25zdCB7IGVuaGFuY2VkUm9sZXMgfSA9IFJlYWN0LnVzZUNvbnRleHQoRW5oYW5jZWRSb2xlc0NvbnRleHQpXG4gIHJldHVybiBlbmhhbmNlZFJvbGVzXG59XG5cbmV4cG9ydCBjb25zdCBSb2xlRGlzcGxheSA9ICgpID0+IHtcbiAgY29uc3QgaXNVc2luZ0VsZXZhdGVkUmlnaHRzID0gZ2V0SXNVc2luZ0VsZXZhdGVkUmlnaHRzKClcbiAgY29uc3QgZW5oYW5jZWRSb2xlcyA9IHVzZUVuaGFuY2VkUm9sZXMoKVxuXG4gIGlmIChpc1VzaW5nRWxldmF0ZWRSaWdodHMgJiYgZW5oYW5jZWRSb2xlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIDw+QWR2YW5jZWQ8Lz5cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBSb2xlc1RvZ2dsZSA9ICgpID0+IHtcbiAgY29uc3QgaXNVc2luZ0VsZXZhdGVkUmlnaHRzID0gZ2V0SXNVc2luZ0VsZXZhdGVkUmlnaHRzKClcbiAgY29uc3QgZW5oYW5jZWRSb2xlcyA9IHVzZUVuaGFuY2VkUm9sZXMoKVxuICBjb25zdCBkaWFsb2dDb250ZXh0ID0gdXNlRGlhbG9nKClcblxuICBpZiAoIWVuaGFuY2VkUm9sZXMgfHwgZW5oYW5jZWRSb2xlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1sLTEgcHQtNFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb250LW5vcm1hbCB0ZXh0LWxnXCI+Um9sZTwvZGl2PlxuICAgICAgPEZvcm1Db250cm9sTGFiZWxcbiAgICAgICAgY2xhc3NOYW1lPVwicGItNFwiXG4gICAgICAgIGxhYmVsPXs8VHlwb2dyYXBoeSB2YXJpYW50PVwiYm9keTJcIj5BZHZhbmNlZDwvVHlwb2dyYXBoeT59XG4gICAgICAgIGNvbnRyb2w9e1xuICAgICAgICAgIDxTd2l0Y2hcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBjaGVja2VkPXtpc1VzaW5nRWxldmF0ZWRSaWdodHN9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgc2V0SXNVc2luZ0VsZXZhdGVkUmlnaHRzKGUudGFyZ2V0LmNoZWNrZWQpXG4gICAgICAgICAgICAgIHBvc3RTaW1wbGVBdWRpdExvZyh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnUk9MRV9DSEFOR0UnLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogZS50YXJnZXQuY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgPyAndXNlciBlbmFibGVkIGFkdmFuY2VkX21vZGUsIHJvbGVzOiBbJyArIGVuaGFuY2VkUm9sZXMgKyAnXSdcbiAgICAgICAgICAgICAgICAgIDogJ3VzZXIgZGlzYWJsZWQgYWR2YW5jZWRfbW9kZScsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgICAgICAgb25DbG9zZTogKCkgPT4ge30sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxEaWFsb2dUaXRsZT5cbiAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeSB2YXJpYW50PVwiaDVcIj5Td2l0Y2hpbmcgUm9sZTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgPC9EaWFsb2dUaXRsZT5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0NvbnRlbnQgY2xhc3NOYW1lPVwib3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0NvbnRlbnRUZXh0IHZhcmlhbnQ9XCJzdWJ0aXRsZTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBwYWdlIHdpbGwgcmVmcmVzaCB0byBjb21wbGV0ZSB0aGUgcm9sZSBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgICAgICAgPC9EaWFsb2dDb250ZW50VGV4dD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1jZW50ZXIgcHktNVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPENpcmN1bGFyUHJvZ3Jlc3Mgc2l6ZT17ODB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICB9XG4gICAgICAvPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2lzVXNpbmdFbGV2YXRlZFJpZ2h0cyA/ICcnIDogJ29wYWNpdHktNTAnfWB9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBiLTEgZm9udC1ub3JtYWwgaXRhbGljXCI+TXkgQWR2YW5jZWQgUm9sZXM8L2Rpdj5cbiAgICAgICAge2VuaGFuY2VkUm9sZXMubWFwKChyb2xlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbVwiPntyb2xlfTwvZGl2PlxuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IFVzZXJDb21wb25lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IHVzZXJuYW1lID0gdXNlci5nZXRVc2VyTmFtZSgpXG4gIGNvbnN0IGVtYWlsID0gdXNlci5nZXRFbWFpbCgpXG4gIGNvbnN0IHNpZ25PdXQgPSAoKSA9PiB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPVxuICAgICAgJy4uLy4uL2xvZ291dD9zZXJ2aWNlPScgKyBlbmNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhyZWYpXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LWNvbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzaHJpbmstMSBvdmVyZmxvdy1hdXRvIHAtMlwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1yb3cgaXRlbXMtY2VudGVyIGZsZXgtbm93cmFwXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwci0yXCI+XG4gICAgICAgICAgICA8UGVyc29uSWNvbiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGRhdGEtaWQ9XCJwcm9maWxlLXVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5mby11c2VybmFtZSBpcy1sYXJnZS1mb250IGlzLWJvbGRcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dXNlcm5hbWV9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgZGF0YS1pZD1cInByb2ZpbGUtZW1haWxcIiBjbGFzc05hbWU9XCJpbmZvLWVtYWlsIGlzLW1lZGl1bS1mb250XCI+XG4gICAgICAgICAgICAgIHtlbWFpbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFJvbGVzVG9nZ2xlIC8+XG4gICAgICAgIDxFeHRlbnNpb25Qb2ludHMudXNlckluZm9ybWF0aW9uIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJteS0yIHNocmluay0wXCIgLz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1yaWdodCBwLTIgc2hyaW5rLTBcIj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGRhdGEtaWQ9XCJwcm9maWxlLXNpZ25vdXQtYnV0dG9uXCJcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIG9uQ2xpY2s9e3NpZ25PdXR9XG4gICAgICAgID5cbiAgICAgICAgICBTaWduIE91dFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFVzZXJDb21wb25lbnQpXG4iXX0=