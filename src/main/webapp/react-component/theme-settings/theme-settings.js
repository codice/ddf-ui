import { __read } from "tslib";
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
/*global require*/
import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import user from '../../component/singletons/user-instance';
import { hot } from 'react-hot-loader';
import Grid from '@mui/material/Grid';
import ColorTool from './color-tool';
window.user = user;
var getPreferences = function () {
    return user.get('user').get('preferences');
};
var getAnimationMode = function () {
    return Boolean(getPreferences().get('animation'));
};
var getCurrentTheme = function () {
    return getPreferences().get('theme').toJSON();
};
var AnimationSetting = function () {
    var _a = __read(React.useState(getAnimationMode()), 2), animationMode = _a[0], setAnimationMode = _a[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:animation', function () {
            setAnimationMode(getAnimationMode());
        });
    }, []);
    return (React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: animationMode, onChange: function (e) {
                getPreferences().set('animation', e.target.checked);
                getPreferences().savePreferences();
            } }), label: "Animation" }));
};
var ThemeMode = function () {
    var _a = __read(React.useState(getCurrentTheme().theme === 'dark'), 2), darkMode = _a[0], setDarkMode = _a[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:theme', function () {
            setDarkMode(getCurrentTheme().theme === 'dark');
        });
    }, []);
    return (React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: darkMode, onChange: function (e) {
                getPreferences()
                    .get('theme')
                    .set('theme', e.target.checked ? 'dark' : 'light');
                getPreferences().savePreferences();
            } }), label: "Dark Mode" }));
};
var ThemePalette = function () {
    var _a = __read(React.useState(getCurrentTheme().palette === 'custom'), 2), palette = _a[0], setPalette = _a[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:theme', function () {
            setPalette(getCurrentTheme().palette === 'custom');
        });
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true },
            React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: palette, onChange: function (e) {
                        getPreferences()
                            .get('theme')
                            .set('palette', e.target.checked ? 'custom' : 'default');
                        getPreferences().savePreferences();
                    } }), label: "Custom Palette" })),
        React.createElement(Grid, { item: true, className: "w-full ".concat(palette ? '' : 'hidden') },
            React.createElement(ColorTool, null))));
};
var ThemeSettings = function () {
    return (React.createElement(Grid, { container: true, direction: "column", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(AnimationSetting, null)),
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(ThemeMode, null)),
        React.createElement(ThemePalette, null)));
};
export default hot(module)(ThemeSettings);
//# sourceMappingURL=theme-settings.js.map