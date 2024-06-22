import { __assign, __read } from "tslib";
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
import { StartupDataStore } from '../../js/model/Startup/startup';
import { LayoutContext } from '../../component/golden-layout/visual-settings.provider';
import { getUserCoordinateFormat } from '../../component/visualization/settings-helpers';
import user from '../../component/singletons/user-instance';
var mapPropsToState = function (props) {
    var map = props.map;
    return {
        coordinates: {
            lat: map.get('mouseLat'),
            lon: map.get('mouseLon'),
        },
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
var MapInfo = function (props) {
    var _a = React.useContext(LayoutContext), getValue = _a.getValue, onStateChanged = _a.onStateChanged, visualTitle = _a.visualTitle, hasLayoutContext = _a.hasLayoutContext;
    var _b = __read(React.useState(mapPropsToState(props)), 2), stateProps = _b[0], setStateProps = _b[1];
    var _c = __read(React.useState('degrees'), 2), coordFormat = _c[0], setCoordFormat = _c[1];
    var listenTo = props.listenTo, map = props.map;
    var coordFormatKey = "".concat(visualTitle, "-coordFormat");
    var onChange = function () { return setStateProps(mapPropsToState(props)); };
    React.useEffect(function () {
        var userDefaultFormat = getUserCoordinateFormat();
        if (hasLayoutContext) {
            setCoordFormat(getValue(coordFormat, userDefaultFormat));
            onStateChanged(function () {
                var coordFormat = getValue(coordFormatKey, getUserCoordinateFormat());
                setCoordFormat(coordFormat);
            });
        }
        else {
            setCoordFormat(userDefaultFormat);
            props.listenTo(user.get('user').get('preferences'), 'change:coordinateFormat', function () { return setCoordFormat(getUserCoordinateFormat()); });
        }
        listenTo(map, 'change:mouseLat change:mouseLon change:targetMetacard change:currentDistance', onChange);
    }, []);
    return React.createElement(MapInfoPresentation, __assign({}, stateProps, { format: coordFormat }));
};
export default hot(module)(withListenTo(MapInfo));
//# sourceMappingURL=container.js.map