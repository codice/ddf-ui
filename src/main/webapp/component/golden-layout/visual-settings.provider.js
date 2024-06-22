import { __assign } from "tslib";
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
import React from 'react';
export var LayoutContext = React.createContext({
    getValue: function () { },
    setValue: function () { },
    onStateChanged: function (callback) { return callback(); },
    visualTitle: '',
    hasLayoutContext: false,
});
export var VisualSettingsProvider = function (props) {
    var container = props.container, goldenLayout = props.goldenLayout, children = props.children;
    var getVisualSettingValue = function (key, defaultValue) {
        var _a;
        var settingsVal = (_a = container.getState()) === null || _a === void 0 ? void 0 : _a[key];
        if ((!settingsVal || settingsVal.length === 0) && defaultValue) {
            settingsVal = defaultValue;
        }
        return settingsVal;
    };
    var setVisualSettingValue = function (key, value) {
        var _a;
        container.setState(__assign(__assign({}, (container.getState() || {})), (_a = {}, _a[key] = value, _a)));
    };
    var onVisualSettingChangedListener = function (callback) {
        goldenLayout.on('stateChanged', function () { return callback(); });
    };
    return (React.createElement(LayoutContext.Provider, { value: {
            getValue: getVisualSettingValue,
            setValue: setVisualSettingValue,
            onStateChanged: onVisualSettingChangedListener,
            visualTitle: container.title,
            hasLayoutContext: true,
        } }, children));
};
//# sourceMappingURL=visual-settings.provider.js.map