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
import { hot } from 'react-hot-loader';
import withListenTo from '../backbone-container';
import DistanceInfoPresentation from './presentation';
var LEFT_OFFSET = 390;
var TOP_OFFSET = 180;
var mapPropsToState = function (props) {
    var map = props.map;
    var distance = map.get('currentDistance');
    return {
        showDistance: map.get('measurementState') === 'START' && distance,
        currentDistance: distance,
        left: map.get('distanceInfo')['left'] - LEFT_OFFSET + 'px',
        top: map.get('distanceInfo')['top'] - TOP_OFFSET + 'px',
    };
};
var DistanceInfo = /** @class */ (function (_super) {
    __extends(DistanceInfo, _super);
    function DistanceInfo(props) {
        var _this = _super.call(this, props) || this;
        _this.listenToMap = function () {
            var _a = _this.props, listenTo = _a.listenTo, map = _a.map;
            listenTo(map, 'change:currentDistance', _this.handleDistanceChange);
            listenTo(map, 'change:measurementState', _this.handleMeasurementStateChange);
        };
        _this.handleDistanceChange = function () {
            _this.setState(mapPropsToState(_this.props));
        };
        _this.handleMeasurementStateChange = function () {
            _this.setState(mapPropsToState(_this.props));
        };
        _this.state = __assign(__assign({}, mapPropsToState(props)), { showDistance: false });
        return _this;
    }
    DistanceInfo.prototype.componentDidMount = function () {
        this.listenToMap();
    };
    DistanceInfo.prototype.componentWillUnmount = function () {
        var _a = this.props, stopListening = _a.stopListening, map = _a.map;
        stopListening(map, 'change:currentDistance', this.handleDistanceChange);
        stopListening(map, 'change:measurementState', this.handleMeasurementStateChange);
    };
    DistanceInfo.prototype.render = function () {
        return this.state.showDistance ? (
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ showDistance: Boolean; currentDistance: Nu... Remove this comment to see the full error message
        React.createElement(DistanceInfoPresentation, __assign({}, this.state))) : null;
    };
    return DistanceInfo;
}(React.Component));
export default hot(module)(withListenTo(DistanceInfo));
//# sourceMappingURL=distance-info.js.map