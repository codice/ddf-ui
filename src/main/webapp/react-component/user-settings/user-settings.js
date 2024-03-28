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
import { createGlobalStyle } from 'styled-components';
import ThemeSettings from '../theme-settings';
import AlertSettings from '../alert-settings';
import AttributeSettings from '../attribute-settings';
import SearchSettings from '../search-settings';
import TimeSettings from '../time-settings';
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Link } from '../../component/link/link';
import { MapUserSettings } from '../map-user-settings/map-user-settings';
var ThemeGlobalStyle = createGlobalStyle(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n.MuiBackdrop-root {\n  opacity: 0 !important;\n}\n.MuiDrawer-root > .MuiPaper-root {\n  transform: scale(.8) translateY(40%) translateX(-10%) !important;\n}\n"], ["\n.MuiBackdrop-root {\n  opacity: 0 !important;\n}\n.MuiDrawer-root > .MuiPaper-root {\n  transform: scale(.8) translateY(40%) translateX(-10%) !important;\n}\n"])));
export var BaseSettings = {
    Settings: {
        component: function (_a) {
            var SettingsComponents = _a.SettingsComponents;
            return React.createElement(SettingsScreen, { SettingsComponents: SettingsComponents });
        },
    },
    Theme: {
        component: function () {
            return (React.createElement(React.Fragment, null,
                React.createElement(ThemeGlobalStyle, null),
                React.createElement(ThemeSettings, null)));
        },
    },
    Notifications: {
        component: function () {
            return React.createElement(AlertSettings, null);
        },
    },
    Map: {
        component: function () {
            return React.createElement(MapUserSettings, null);
        },
    },
    'Search Options': {
        component: function () {
            return React.createElement(SearchSettings, null);
        },
    },
    'Attribute Options': {
        component: function () {
            return React.createElement(AttributeSettings, null);
        },
    },
    Time: {
        component: function () {
            return React.createElement(TimeSettings, null);
        },
    },
};
var SettingsScreen = function (_a) {
    var SettingsComponents = _a.SettingsComponents;
    var location = useLocation();
    var queryParams = queryString.parse(location.search);
    return (React.createElement(Grid, { container: true, direction: "column", className: "w-full h-full" }, Object.keys(SettingsComponents)
        .filter(function (name) { return name !== 'Settings'; })
        .map(function (name) {
        return (React.createElement(Grid, { key: name, item: true, className: "w-full" },
            React.createElement(Button, { component: Link, to: "".concat(location.pathname, "?").concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-settings': name }))), fullWidth: true },
                React.createElement("div", { className: "text-left w-full" }, name))));
    })));
};
var getName = function (_a) {
    var CurrentSetting = _a.CurrentSetting, SettingsComponents = _a.SettingsComponents;
    var matchedSetting = Object.entries(SettingsComponents).find(function (entry) {
        return entry[1].component === CurrentSetting;
    });
    if (matchedSetting) {
        return matchedSetting[0];
    }
    return '';
};
var getComponent = function (_a) {
    var name = _a.name, SettingsComponents = _a.SettingsComponents;
    var matchedSetting = Object.entries(SettingsComponents).find(function (entry) {
        return entry[0] === name;
    });
    if (matchedSetting) {
        return matchedSetting[1].component;
    }
    return SettingsComponents.Settings.component;
};
var UserSettings = function (_a) {
    var SettingsComponents = _a.SettingsComponents;
    var location = useLocation();
    var queryParams = queryString.parse(location.search);
    var CurrentSetting = getComponent({
        name: (queryParams['global-settings'] || ''),
        SettingsComponents: SettingsComponents,
    });
    var name = getName({ CurrentSetting: CurrentSetting, SettingsComponents: SettingsComponents });
    return (React.createElement(Grid, { container: true, direction: "column", className: "w-full h-full", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full p-3" },
            React.createElement(Grid, { container: true, direction: "row", alignItems: "center" },
                React.createElement(Grid, { item: true },
                    React.createElement(Button, { component: Link, to: "".concat(location.pathname, "?").concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-settings': 'Settings' }))) },
                        React.createElement(Typography, { variant: "h5" },
                            name !== 'Settings' ? 'Back to ' : null,
                            "Settings"))),
                name !== 'Settings' ? (React.createElement(React.Fragment, null,
                    React.createElement(Grid, { item: true },
                        React.createElement(ChevronRight, null)),
                    React.createElement(Grid, { item: true },
                        React.createElement(Typography, { variant: "h5" }, name)))) : null)),
        React.createElement(Grid, { item: true },
            React.createElement(Divider, null)),
        React.createElement(Grid, { item: true, className: "w-full h-full p-3" },
            React.createElement(CurrentSetting, { SettingsComponents: SettingsComponents }))));
};
export default hot(module)(UserSettings);
var templateObject_1;
//# sourceMappingURL=user-settings.js.map