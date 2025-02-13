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
var ThemeGlobalStyle = createGlobalStyle(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n.MuiBackdrop-root {\n  opacity: 0 !important;\n}\n.MuiDrawer-root > .MuiPaper-root {\n  transform: scale(.8) translateY(10%) translateX(-10%) !important;\n}\n"], ["\n.MuiBackdrop-root {\n  opacity: 0 !important;\n}\n.MuiDrawer-root > .MuiPaper-root {\n  transform: scale(.8) translateY(10%) translateX(-10%) !important;\n}\n"])));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXR0aW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdXNlci1zZXR0aW5ncy91c2VyLXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ3JELE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFBO0FBQzdDLE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFBO0FBQzdDLE9BQU8saUJBQWlCLE1BQU0sdUJBQXVCLENBQUE7QUFDckQsT0FBTyxjQUFjLE1BQU0sb0JBQW9CLENBQUE7QUFDL0MsT0FBTyxZQUFZLE1BQU0sa0JBQWtCLENBQUE7QUFDM0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sWUFBWSxNQUFNLGtDQUFrQyxDQUFBO0FBQzNELE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUM5QyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQ2hELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUV4RSxJQUFNLGdCQUFnQixHQUFHLGlCQUFpQixxT0FBQSxrS0FPekMsSUFBQSxDQUFBO0FBY0QsTUFBTSxDQUFDLElBQU0sWUFBWSxHQUFHO0lBQzFC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QUFXLEtBQ2QsaUJBQWlCLEVBQUUsVUFBVSxJQUM3QixDQUFFO3dCQUVKLG9CQUFDLFVBQVUsSUFBQyxPQUFPLEVBQUMsSUFBSTs0QkFDckIsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJO3VDQUU3QixDQUNOLENBQ0o7Z0JBQ04sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FDckI7b0JBQ0Usb0JBQUMsSUFBSSxJQUFDLElBQUk7d0JBQ1Isb0JBQUMsWUFBWSxPQUFHLENBQ1g7b0JBQ1Asb0JBQUMsSUFBSSxJQUFDLElBQUk7d0JBQ1Isb0JBQUMsVUFBVSxJQUFDLE9BQU8sRUFBQyxJQUFJLElBQUUsSUFBSSxDQUFjLENBQ3ZDLENBQ04sQ0FDSixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ0gsQ0FDRjtRQUNQLG9CQUFDLElBQUksSUFBQyxJQUFJO1lBQ1Isb0JBQUMsT0FBTyxPQUFHLENBQ047UUFDUCxvQkFBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxtQkFBbUI7WUFDdEMsb0JBQUMsY0FBYyxJQUFDLGtCQUFrQixFQUFFLGtCQUFrQixHQUFJLENBQ3JELENBQ0YsQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgY3JlYXRlR2xvYmFsU3R5bGUgfSBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCBUaGVtZVNldHRpbmdzIGZyb20gJy4uL3RoZW1lLXNldHRpbmdzJ1xuaW1wb3J0IEFsZXJ0U2V0dGluZ3MgZnJvbSAnLi4vYWxlcnQtc2V0dGluZ3MnXG5pbXBvcnQgQXR0cmlidXRlU2V0dGluZ3MgZnJvbSAnLi4vYXR0cmlidXRlLXNldHRpbmdzJ1xuaW1wb3J0IFNlYXJjaFNldHRpbmdzIGZyb20gJy4uL3NlYXJjaC1zZXR0aW5ncydcbmltcG9ydCBUaW1lU2V0dGluZ3MgZnJvbSAnLi4vdGltZS1zZXR0aW5ncydcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IENoZXZyb25SaWdodCBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZXZyb25SaWdodCdcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBEaXZpZGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGl2aWRlcidcbmltcG9ydCB7IHVzZUxvY2F0aW9uIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnXG5pbXBvcnQgeyBMaW5rIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2xpbmsvbGluaydcbmltcG9ydCB7IE1hcFVzZXJTZXR0aW5ncyB9IGZyb20gJy4uL21hcC11c2VyLXNldHRpbmdzL21hcC11c2VyLXNldHRpbmdzJ1xuXG5jb25zdCBUaGVtZUdsb2JhbFN0eWxlID0gY3JlYXRlR2xvYmFsU3R5bGVgXG4uTXVpQmFja2Ryb3Atcm9vdCB7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDtcbn1cbi5NdWlEcmF3ZXItcm9vdCA+IC5NdWlQYXBlci1yb290IHtcbiAgdHJhbnNmb3JtOiBzY2FsZSguOCkgdHJhbnNsYXRlWSgxMCUpIHRyYW5zbGF0ZVgoLTEwJSkgIWltcG9ydGFudDtcbn1cbmBcblxudHlwZSBJbmRpdmlkdWFsU2V0dGluZ3NDb21wb25lbnRUeXBlID0gKHtcbiAgU2V0dGluZ3NDb21wb25lbnRzLFxufToge1xuICBTZXR0aW5nc0NvbXBvbmVudHM6IFNldHRpbmdzQ29tcG9uZW50VHlwZVxufSkgPT4gSlNYLkVsZW1lbnRcblxuZXhwb3J0IHR5cGUgU2V0dGluZ3NDb21wb25lbnRUeXBlID0ge1xuICBba2V5OiBzdHJpbmddOiB7XG4gICAgY29tcG9uZW50OiBJbmRpdmlkdWFsU2V0dGluZ3NDb21wb25lbnRUeXBlXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEJhc2VTZXR0aW5ncyA9IHtcbiAgU2V0dGluZ3M6IHtcbiAgICBjb21wb25lbnQ6ICh7IFNldHRpbmdzQ29tcG9uZW50cyB9KSA9PiB7XG4gICAgICByZXR1cm4gPFNldHRpbmdzU2NyZWVuIFNldHRpbmdzQ29tcG9uZW50cz17U2V0dGluZ3NDb21wb25lbnRzfSAvPlxuICAgIH0sXG4gIH0sXG4gIFRoZW1lOiB7XG4gICAgY29tcG9uZW50OiAoKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxUaGVtZUdsb2JhbFN0eWxlIC8+XG4gICAgICAgICAgPFRoZW1lU2V0dGluZ3MgLz5cbiAgICAgICAgPC8+XG4gICAgICApXG4gICAgfSxcbiAgfSxcbiAgTm90aWZpY2F0aW9uczoge1xuICAgIGNvbXBvbmVudDogKCkgPT4ge1xuICAgICAgcmV0dXJuIDxBbGVydFNldHRpbmdzIC8+XG4gICAgfSxcbiAgfSxcbiAgTWFwOiB7XG4gICAgY29tcG9uZW50OiAoKSA9PiB7XG4gICAgICByZXR1cm4gPE1hcFVzZXJTZXR0aW5ncyAvPlxuICAgIH0sXG4gIH0sXG4gICdTZWFyY2ggT3B0aW9ucyc6IHtcbiAgICBjb21wb25lbnQ6ICgpID0+IHtcbiAgICAgIHJldHVybiA8U2VhcmNoU2V0dGluZ3MgLz5cbiAgICB9LFxuICB9LFxuICAnQXR0cmlidXRlIE9wdGlvbnMnOiB7XG4gICAgY29tcG9uZW50OiAoKSA9PiB7XG4gICAgICByZXR1cm4gPEF0dHJpYnV0ZVNldHRpbmdzIC8+XG4gICAgfSxcbiAgfSxcbiAgVGltZToge1xuICAgIGNvbXBvbmVudDogKCkgPT4ge1xuICAgICAgcmV0dXJuIDxUaW1lU2V0dGluZ3MgLz5cbiAgICB9LFxuICB9LFxufSBhcyBTZXR0aW5nc0NvbXBvbmVudFR5cGVcblxuY29uc3QgU2V0dGluZ3NTY3JlZW4gPSAoe1xuICBTZXR0aW5nc0NvbXBvbmVudHMsXG59OiB7XG4gIFNldHRpbmdzQ29tcG9uZW50czogU2V0dGluZ3NDb21wb25lbnRUeXBlXG59KSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBxdWVyeVBhcmFtcyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaClcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwiY29sdW1uXCIgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAge09iamVjdC5rZXlzKFNldHRpbmdzQ29tcG9uZW50cylcbiAgICAgICAgLmZpbHRlcigobmFtZSkgPT4gbmFtZSAhPT0gJ1NldHRpbmdzJylcbiAgICAgICAgLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8R3JpZCBrZXk9e25hbWV9IGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICBjb21wb25lbnQ9e0xpbmt9XG4gICAgICAgICAgICAgICAgdG89e2Ake2xvY2F0aW9uLnBhdGhuYW1lfT8ke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICdnbG9iYWwtc2V0dGluZ3MnOiBuYW1lLFxuICAgICAgICAgICAgICAgIH0pfWB9XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtbGVmdCB3LWZ1bGxcIj57bmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICA8L0dyaWQ+XG4gIClcbn1cblxuY29uc3QgZ2V0TmFtZSA9ICh7XG4gIEN1cnJlbnRTZXR0aW5nLFxuICBTZXR0aW5nc0NvbXBvbmVudHMsXG59OiB7XG4gIEN1cnJlbnRTZXR0aW5nOiBJbmRpdmlkdWFsU2V0dGluZ3NDb21wb25lbnRUeXBlXG4gIFNldHRpbmdzQ29tcG9uZW50czogU2V0dGluZ3NDb21wb25lbnRUeXBlXG59KSA9PiB7XG4gIGNvbnN0IG1hdGNoZWRTZXR0aW5nID0gT2JqZWN0LmVudHJpZXMoU2V0dGluZ3NDb21wb25lbnRzKS5maW5kKChlbnRyeSkgPT4ge1xuICAgIHJldHVybiBlbnRyeVsxXS5jb21wb25lbnQgPT09IEN1cnJlbnRTZXR0aW5nXG4gIH0pXG4gIGlmIChtYXRjaGVkU2V0dGluZykge1xuICAgIHJldHVybiBtYXRjaGVkU2V0dGluZ1swXVxuICB9XG4gIHJldHVybiAnJ1xufVxuXG5jb25zdCBnZXRDb21wb25lbnQgPSAoe1xuICBuYW1lLFxuICBTZXR0aW5nc0NvbXBvbmVudHMsXG59OiB7XG4gIG5hbWU6IHN0cmluZ1xuICBTZXR0aW5nc0NvbXBvbmVudHM6IFNldHRpbmdzQ29tcG9uZW50VHlwZVxufSkgPT4ge1xuICBjb25zdCBtYXRjaGVkU2V0dGluZyA9IE9iamVjdC5lbnRyaWVzKFNldHRpbmdzQ29tcG9uZW50cykuZmluZCgoZW50cnkpID0+IHtcbiAgICByZXR1cm4gZW50cnlbMF0gPT09IG5hbWVcbiAgfSlcbiAgaWYgKG1hdGNoZWRTZXR0aW5nKSB7XG4gICAgcmV0dXJuIG1hdGNoZWRTZXR0aW5nWzFdLmNvbXBvbmVudFxuICB9XG4gIHJldHVybiBTZXR0aW5nc0NvbXBvbmVudHMuU2V0dGluZ3MuY29tcG9uZW50XG59XG5cbnR5cGUgVXNlclNldHRpbmdzUHJvcHMgPSB7XG4gIFNldHRpbmdzQ29tcG9uZW50czogU2V0dGluZ3NDb21wb25lbnRUeXBlXG59XG5cbmNvbnN0IFVzZXJTZXR0aW5ncyA9ICh7IFNldHRpbmdzQ29tcG9uZW50cyB9OiBVc2VyU2V0dGluZ3NQcm9wcykgPT4ge1xuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpXG5cbiAgY29uc3QgQ3VycmVudFNldHRpbmcgPSBnZXRDb21wb25lbnQoe1xuICAgIG5hbWU6IChxdWVyeVBhcmFtc1snZ2xvYmFsLXNldHRpbmdzJ10gfHwgJycpIGFzIHN0cmluZyxcbiAgICBTZXR0aW5nc0NvbXBvbmVudHMsXG4gIH0pXG4gIGNvbnN0IG5hbWUgPSBnZXROYW1lKHsgQ3VycmVudFNldHRpbmcsIFNldHRpbmdzQ29tcG9uZW50cyB9KVxuICByZXR1cm4gKFxuICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJjb2x1bW5cIiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCIgd3JhcD1cIm5vd3JhcFwiPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0zXCI+XG4gICAgICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJyb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgY29tcG9uZW50PXtMaW5rfVxuICAgICAgICAgICAgICB0bz17YCR7bG9jYXRpb24ucGF0aG5hbWV9PyR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICAnZ2xvYmFsLXNldHRpbmdzJzogJ1NldHRpbmdzJyxcbiAgICAgICAgICAgICAgfSl9YH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFR5cG9ncmFwaHkgdmFyaWFudD1cImg1XCI+XG4gICAgICAgICAgICAgICAge25hbWUgIT09ICdTZXR0aW5ncycgPyAnQmFjayB0byAnIDogbnVsbH1cbiAgICAgICAgICAgICAgICBTZXR0aW5nc1xuICAgICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAge25hbWUgIT09ICdTZXR0aW5ncycgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgICAgIDxDaGV2cm9uUmlnaHQgLz5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5IHZhcmlhbnQ9XCJoNVwiPntuYW1lfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICA8L0dyaWQ+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcC0zXCI+XG4gICAgICAgIDxDdXJyZW50U2V0dGluZyBTZXR0aW5nc0NvbXBvbmVudHM9e1NldHRpbmdzQ29tcG9uZW50c30gLz5cbiAgICAgIDwvR3JpZD5cbiAgICA8L0dyaWQ+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoVXNlclNldHRpbmdzKVxuIl19