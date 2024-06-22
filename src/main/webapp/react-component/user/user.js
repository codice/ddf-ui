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
//# sourceMappingURL=user.js.map