import { __assign, __extends } from "tslib";
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
import withListenTo from '../backbone-container';
import MapInfoPresentation from './presentation';
import { hot } from 'react-hot-loader';
import user from '../../component/singletons/user-instance';
import { StartupDataStore } from '../../js/model/Startup/startup';
var mapPropsToState = function (props) {
    var map = props.map;
    return {
        coordinates: {
            lat: map.get('mouseLat'),
            lon: map.get('mouseLon'),
        },
        format: getCoordinateFormat(),
        attributes: getAttributes(map),
        measurementState: map.get('measurementState'),
        currentDistance: map.get('currentDistance'),
    };
};
var getAttributes = function (map) {
    if (map.get('targetMetacard') === undefined) {
        return [];
    }
    return StartupDataStore.Configuration.getSummaryShow()
        .map(function (attribute) {
        var value = map.get('targetMetacard').plain.metacard.properties[attribute];
        return { name: attribute, value: value };
    })
        .filter(function (_a) {
        var value = _a.value;
        return value !== undefined;
    });
};
var getCoordinateFormat = function () {
    return user.get('user').get('preferences').get('coordinateFormat');
};
var MapInfo = /** @class */ (function (_super) {
    __extends(MapInfo, _super);
    function MapInfo(props) {
        var _this = _super.call(this, props) || this;
        _this.listenToMap = function () {
            var _a = _this.props, listenTo = _a.listenTo, map = _a.map;
            listenTo(map, 'change:mouseLat change:mouseLon change:targetMetacard change:currentDistance', _this.handleChange);
            listenTo(user.get('user').get('preferences'), 'change:coordinateFormat', _this.handleChange);
        };
        _this.handleChange = function () {
            _this.setState(mapPropsToState(_this.props));
        };
        _this.state = mapPropsToState(props);
        _this.listenToMap();
        return _this;
    }
    MapInfo.prototype.render = function () {
        return React.createElement(MapInfoPresentation, __assign({}, this.state));
    };
    return MapInfo;
}(React.Component));
export default hot(module)(withListenTo(MapInfo));
//# sourceMappingURL=container.js.map