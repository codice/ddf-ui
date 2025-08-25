import { __assign, __makeTemplateObject } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import { createGlobalStyle } from 'styled-components';
import Button from '@mui/material/Button';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { SuspenseWrapper } from '../../component/app/suspense';
import { lazy } from 'react';
var ThemeSettings = lazy(function () { return import('../theme-settings'); });
var AlertSettings = lazy(function () { return import('../alert-settings'); });
var AttributeSettings = lazy(function () { return import('../attribute-settings'); });
var SearchSettings = lazy(function () { return import('../search-settings'); });
var TimeSettings = lazy(function () { return import('../time-settings'); });
var MapUserSettings = lazy(function () { return import('../map-user-settings/map-user-settings'); });
var ThemeGlobalStyle = createGlobalStyle(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n.MuiBackdrop-root {\n  opacity: 0 !important;\n}\n.MuiDrawer-root > .MuiPaper-root {\n  transform: scale(.8) translateY(10%) translateX(-10%) !important;\n}\n"], ["\n.MuiBackdrop-root {\n  opacity: 0 !important;\n}\n.MuiDrawer-root > .MuiPaper-root {\n  transform: scale(.8) translateY(10%) translateX(-10%) !important;\n}\n"])));
export var BaseSettings = {
    Settings: {
        component: function (_a) {
            var SettingsComponents = _a.SettingsComponents;
            return _jsx(SettingsScreen, { SettingsComponents: SettingsComponents });
        },
    },
    Theme: {
        component: function () {
            return (_jsxs(_Fragment, { children: [_jsx(ThemeGlobalStyle, {}), _jsx(ThemeSettings, {})] }));
        },
    },
    Notifications: {
        component: function () {
            return _jsx(AlertSettings, {});
        },
    },
    Map: {
        component: function () {
            return _jsx(MapUserSettings, {});
        },
    },
    'Search Options': {
        component: function () {
            return _jsx(SearchSettings, {});
        },
    },
    'Attribute Options': {
        component: function () {
            return _jsx(AttributeSettings, {});
        },
    },
    Time: {
        component: function () {
            return _jsx(TimeSettings, {});
        },
    },
};
var SettingsScreen = function (_a) {
    var SettingsComponents = _a.SettingsComponents;
    var location = useLocation();
    var queryParams = queryString.parse(location.search);
    return (_jsx(Grid, { container: true, direction: "column", className: "w-full h-full", children: Object.keys(SettingsComponents)
            .filter(function (name) { return name !== 'Settings'; })
            .map(function (name) {
            return (_jsx(Grid, { item: true, className: "w-full", children: _jsx(Button, { component: Link, to: "".concat(location.pathname, "?").concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-settings': name }))), fullWidth: true, children: _jsx("div", { className: "text-left w-full", children: name }) }) }, name));
        }) }));
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
    return (_jsxs(Grid, { container: true, direction: "column", className: "w-full h-full", wrap: "nowrap", children: [_jsx(Grid, { item: true, className: "w-full p-3", children: _jsxs(Grid, { container: true, direction: "row", alignItems: "center", children: [_jsx(Grid, { item: true, children: _jsx(Button, { component: Link, to: "".concat(location.pathname, "?").concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-settings': 'Settings' }))), children: _jsxs(Typography, { variant: "h5", children: [name !== 'Settings' ? 'Back to ' : null, "Settings"] }) }) }), name !== 'Settings' ? (_jsxs(_Fragment, { children: [_jsx(Grid, { item: true, children: _jsx(ChevronRight, {}) }), _jsx(Grid, { item: true, children: _jsx(Typography, { variant: "h5", children: name }) })] })) : null] }) }), _jsx(Grid, { item: true, children: _jsx(Divider, {}) }), _jsx(Grid, { item: true, className: "w-full h-full p-3", children: _jsx(SuspenseWrapper, { children: _jsx(CurrentSetting, { SettingsComponents: SettingsComponents }) }) })] }));
};
export default UserSettings;
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXR0aW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvdXNlci1zZXR0aW5ncy91c2VyLXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUVyRCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFlBQVksTUFBTSxrQ0FBa0MsQ0FBQTtBQUMzRCxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLFVBQVUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNqRCxPQUFPLE9BQU8sTUFBTSx1QkFBdUIsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDOUMsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFBO0FBQ3RDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFDOUQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUU1QixJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBTSxPQUFBLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxFQUEzQixDQUEyQixDQUFDLENBQUE7QUFDN0QsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQU0sT0FBQSxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFBO0FBQzdELElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGNBQU0sT0FBQSxNQUFNLENBQUMsdUJBQXVCLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFBO0FBQ3JFLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFN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bnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCB7IGNyZWF0ZUdsb2JhbFN0eWxlIH0gZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5cbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgQ2hldnJvblJpZ2h0IGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hldnJvblJpZ2h0J1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IFR5cG9ncmFwaHkgZnJvbSAnQG11aS9tYXRlcmlhbC9UeXBvZ3JhcGh5J1xuaW1wb3J0IERpdmlkZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9EaXZpZGVyJ1xuaW1wb3J0IHsgdXNlTG9jYXRpb24gfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZydcbmltcG9ydCB7IExpbmsgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IHsgU3VzcGVuc2VXcmFwcGVyIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2FwcC9zdXNwZW5zZSdcbmltcG9ydCB7IGxhenkgfSBmcm9tICdyZWFjdCdcblxuY29uc3QgVGhlbWVTZXR0aW5ncyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi90aGVtZS1zZXR0aW5ncycpKVxuY29uc3QgQWxlcnRTZXR0aW5ncyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9hbGVydC1zZXR0aW5ncycpKVxuY29uc3QgQXR0cmlidXRlU2V0dGluZ3MgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vYXR0cmlidXRlLXNldHRpbmdzJykpXG5jb25zdCBTZWFyY2hTZXR0aW5ncyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9zZWFyY2gtc2V0dGluZ3MnKSlcbmNvbnN0IFRpbWVTZXR0aW5ncyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi90aW1lLXNldHRpbmdzJykpXG5jb25zdCBNYXBVc2VyU2V0dGluZ3MgPSBsYXp5KFxuICAoKSA9PiBpbXBvcnQoJy4uL21hcC11c2VyLXNldHRpbmdzL21hcC11c2VyLXNldHRpbmdzJylcbilcblxuY29uc3QgVGhlbWVHbG9iYWxTdHlsZSA9IGNyZWF0ZUdsb2JhbFN0eWxlYFxuLk11aUJhY2tkcm9wLXJvb3Qge1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG59XG4uTXVpRHJhd2VyLXJvb3QgPiAuTXVpUGFwZXItcm9vdCB7XG4gIHRyYW5zZm9ybTogc2NhbGUoLjgpIHRyYW5zbGF0ZVkoMTAlKSB0cmFuc2xhdGVYKC0xMCUpICFpbXBvcnRhbnQ7XG59XG5gXG5cbnR5cGUgSW5kaXZpZHVhbFNldHRpbmdzQ29tcG9uZW50VHlwZSA9ICh7XG4gIFNldHRpbmdzQ29tcG9uZW50cyxcbn06IHtcbiAgU2V0dGluZ3NDb21wb25lbnRzOiBTZXR0aW5nc0NvbXBvbmVudFR5cGVcbn0pID0+IFJlYWN0LlJlYWN0Tm9kZVxuXG5leHBvcnQgdHlwZSBTZXR0aW5nc0NvbXBvbmVudFR5cGUgPSB7XG4gIFtrZXk6IHN0cmluZ106IHtcbiAgICBjb21wb25lbnQ6IEluZGl2aWR1YWxTZXR0aW5nc0NvbXBvbmVudFR5cGVcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQmFzZVNldHRpbmdzID0ge1xuICBTZXR0aW5nczoge1xuICAgIGNvbXBvbmVudDogKHsgU2V0dGluZ3NDb21wb25lbnRzIH0pID0+IHtcbiAgICAgIHJldHVybiA8U2V0dGluZ3NTY3JlZW4gU2V0dGluZ3NDb21wb25lbnRzPXtTZXR0aW5nc0NvbXBvbmVudHN9IC8+XG4gICAgfSxcbiAgfSxcbiAgVGhlbWU6IHtcbiAgICBjb21wb25lbnQ6ICgpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPFRoZW1lR2xvYmFsU3R5bGUgLz5cbiAgICAgICAgICA8VGhlbWVTZXR0aW5ncyAvPlxuICAgICAgICA8Lz5cbiAgICAgIClcbiAgICB9LFxuICB9LFxuICBOb3RpZmljYXRpb25zOiB7XG4gICAgY29tcG9uZW50OiAoKSA9PiB7XG4gICAgICByZXR1cm4gPEFsZXJ0U2V0dGluZ3MgLz5cbiAgICB9LFxuICB9LFxuICBNYXA6IHtcbiAgICBjb21wb25lbnQ6ICgpID0+IHtcbiAgICAgIHJldHVybiA8TWFwVXNlclNldHRpbmdzIC8+XG4gICAgfSxcbiAgfSxcbiAgJ1NlYXJjaCBPcHRpb25zJzoge1xuICAgIGNvbXBvbmVudDogKCkgPT4ge1xuICAgICAgcmV0dXJuIDxTZWFyY2hTZXR0aW5ncyAvPlxuICAgIH0sXG4gIH0sXG4gICdBdHRyaWJ1dGUgT3B0aW9ucyc6IHtcbiAgICBjb21wb25lbnQ6ICgpID0+IHtcbiAgICAgIHJldHVybiA8QXR0cmlidXRlU2V0dGluZ3MgLz5cbiAgICB9LFxuICB9LFxuICBUaW1lOiB7XG4gICAgY29tcG9uZW50OiAoKSA9PiB7XG4gICAgICByZXR1cm4gPFRpbWVTZXR0aW5ncyAvPlxuICAgIH0sXG4gIH0sXG59IGFzIFNldHRpbmdzQ29tcG9uZW50VHlwZVxuXG5jb25zdCBTZXR0aW5nc1NjcmVlbiA9ICh7XG4gIFNldHRpbmdzQ29tcG9uZW50cyxcbn06IHtcbiAgU2V0dGluZ3NDb21wb25lbnRzOiBTZXR0aW5nc0NvbXBvbmVudFR5cGVcbn0pID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKVxuICByZXR1cm4gKFxuICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJjb2x1bW5cIiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICB7T2JqZWN0LmtleXMoU2V0dGluZ3NDb21wb25lbnRzKVxuICAgICAgICAuZmlsdGVyKChuYW1lKSA9PiBuYW1lICE9PSAnU2V0dGluZ3MnKVxuICAgICAgICAubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxHcmlkIGtleT17bmFtZX0gaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGxcIj5cbiAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgIGNvbXBvbmVudD17TGluayBhcyBhbnl9XG4gICAgICAgICAgICAgICAgdG89e2Ake2xvY2F0aW9uLnBhdGhuYW1lfT8ke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICdnbG9iYWwtc2V0dGluZ3MnOiBuYW1lLFxuICAgICAgICAgICAgICAgIH0pfWB9XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtbGVmdCB3LWZ1bGxcIj57bmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICA8L0dyaWQ+XG4gIClcbn1cblxuY29uc3QgZ2V0TmFtZSA9ICh7XG4gIEN1cnJlbnRTZXR0aW5nLFxuICBTZXR0aW5nc0NvbXBvbmVudHMsXG59OiB7XG4gIEN1cnJlbnRTZXR0aW5nOiBJbmRpdmlkdWFsU2V0dGluZ3NDb21wb25lbnRUeXBlXG4gIFNldHRpbmdzQ29tcG9uZW50czogU2V0dGluZ3NDb21wb25lbnRUeXBlXG59KSA9PiB7XG4gIGNvbnN0IG1hdGNoZWRTZXR0aW5nID0gT2JqZWN0LmVudHJpZXMoU2V0dGluZ3NDb21wb25lbnRzKS5maW5kKChlbnRyeSkgPT4ge1xuICAgIHJldHVybiBlbnRyeVsxXS5jb21wb25lbnQgPT09IEN1cnJlbnRTZXR0aW5nXG4gIH0pXG4gIGlmIChtYXRjaGVkU2V0dGluZykge1xuICAgIHJldHVybiBtYXRjaGVkU2V0dGluZ1swXVxuICB9XG4gIHJldHVybiAnJ1xufVxuXG5jb25zdCBnZXRDb21wb25lbnQgPSAoe1xuICBuYW1lLFxuICBTZXR0aW5nc0NvbXBvbmVudHMsXG59OiB7XG4gIG5hbWU6IHN0cmluZ1xuICBTZXR0aW5nc0NvbXBvbmVudHM6IFNldHRpbmdzQ29tcG9uZW50VHlwZVxufSkgPT4ge1xuICBjb25zdCBtYXRjaGVkU2V0dGluZyA9IE9iamVjdC5lbnRyaWVzKFNldHRpbmdzQ29tcG9uZW50cykuZmluZCgoZW50cnkpID0+IHtcbiAgICByZXR1cm4gZW50cnlbMF0gPT09IG5hbWVcbiAgfSlcbiAgaWYgKG1hdGNoZWRTZXR0aW5nKSB7XG4gICAgcmV0dXJuIG1hdGNoZWRTZXR0aW5nWzFdLmNvbXBvbmVudFxuICB9XG4gIHJldHVybiBTZXR0aW5nc0NvbXBvbmVudHMuU2V0dGluZ3MuY29tcG9uZW50XG59XG5cbnR5cGUgVXNlclNldHRpbmdzUHJvcHMgPSB7XG4gIFNldHRpbmdzQ29tcG9uZW50czogU2V0dGluZ3NDb21wb25lbnRUeXBlXG59XG5cbmNvbnN0IFVzZXJTZXR0aW5ncyA9ICh7IFNldHRpbmdzQ29tcG9uZW50cyB9OiBVc2VyU2V0dGluZ3NQcm9wcykgPT4ge1xuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpXG5cbiAgY29uc3QgQ3VycmVudFNldHRpbmcgPSBnZXRDb21wb25lbnQoe1xuICAgIG5hbWU6IChxdWVyeVBhcmFtc1snZ2xvYmFsLXNldHRpbmdzJ10gfHwgJycpIGFzIHN0cmluZyxcbiAgICBTZXR0aW5nc0NvbXBvbmVudHMsXG4gIH0pXG4gIGNvbnN0IG5hbWUgPSBnZXROYW1lKHsgQ3VycmVudFNldHRpbmcsIFNldHRpbmdzQ29tcG9uZW50cyB9KVxuICByZXR1cm4gKFxuICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJjb2x1bW5cIiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCIgd3JhcD1cIm5vd3JhcFwiPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0zXCI+XG4gICAgICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJyb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgY29tcG9uZW50PXtMaW5rIGFzIGFueX1cbiAgICAgICAgICAgICAgdG89e2Ake2xvY2F0aW9uLnBhdGhuYW1lfT8ke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgLi4ucXVlcnlQYXJhbXMsXG4gICAgICAgICAgICAgICAgJ2dsb2JhbC1zZXR0aW5ncyc6ICdTZXR0aW5ncycsXG4gICAgICAgICAgICAgIH0pfWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxUeXBvZ3JhcGh5IHZhcmlhbnQ9XCJoNVwiPlxuICAgICAgICAgICAgICAgIHtuYW1lICE9PSAnU2V0dGluZ3MnID8gJ0JhY2sgdG8gJyA6IG51bGx9XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NcbiAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIHtuYW1lICE9PSAnU2V0dGluZ3MnID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgICAgICA8Q2hldnJvblJpZ2h0IC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeSB2YXJpYW50PVwiaDVcIj57bmFtZX08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgICA8R3JpZCBpdGVtPlxuICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHAtM1wiPlxuICAgICAgICA8U3VzcGVuc2VXcmFwcGVyPlxuICAgICAgICAgIDxDdXJyZW50U2V0dGluZyBTZXR0aW5nc0NvbXBvbmVudHM9e1NldHRpbmdzQ29tcG9uZW50c30gLz5cbiAgICAgICAgPC9TdXNwZW5zZVdyYXBwZXI+XG4gICAgICA8L0dyaWQ+XG4gICAgPC9HcmlkPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFVzZXJTZXR0aW5nc1xuIl19