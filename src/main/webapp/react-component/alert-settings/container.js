import { __extends } from "tslib";
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
import user from '../../component/singletons/user-instance';
import AlertSettingsComponent from './presentation';
import withListenTo from '../backbone-container';
import { hot } from 'react-hot-loader';
var save = function (value) {
    var preferences = user.get('user').get('preferences');
    preferences.set(value);
    preferences.savePreferences();
};
var onExpirationChange = function (value) {
    save({
        alertExpiration: value,
    });
};
var onPersistenceChange = function (value) {
    save({
        alertPersistence: value,
    });
};
var mapBackboneToState = function () {
    return {
        persistence: user.get('user').get('preferences').get('alertPersistence'),
        expiration: user.get('user').get('preferences').get('alertExpiration'),
    };
};
var AlertSettings = /** @class */ (function (_super) {
    __extends(AlertSettings, _super);
    function AlertSettings(props) {
        var _this = _super.call(this, props) || this;
        _this.updateState = function () {
            _this.setState(mapBackboneToState());
        };
        _this.state = mapBackboneToState();
        _this.props.listenTo(user.get('user').get('preferences'), 'change', _this.updateState);
        return _this;
    }
    AlertSettings.prototype.render = function () {
        var _a = this.state, persistence = _a.persistence, expiration = _a.expiration;
        return (React.createElement(AlertSettingsComponent, { persistence: persistence, expiration: expiration, onPersistenceChange: onPersistenceChange, onExpirationChange: onExpirationChange }));
    };
    return AlertSettings;
}(React.Component));
export default hot(module)(withListenTo(AlertSettings));
//# sourceMappingURL=container.js.map