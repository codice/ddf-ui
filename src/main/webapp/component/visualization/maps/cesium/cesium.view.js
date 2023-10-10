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
import Button from '@mui/material/Button';
import React from 'react';
import { Memo } from '../../../memo/memo';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { MapViewReact } from '../map.view';
import { OpenlayersMapViewReact } from '../openlayers/openlayers.view';
import { CesiumDrawings } from './drawing-and-display';
//You typically don't want to use this view directly.  Instead, use the combined-map component which will handle falling back to openlayers.
import $ from 'jquery';
import featureDetection from '../../../singletons/feature-detection';
var useSupportsCesium = function () {
    var _a = __read(React.useState(Math.random()), 2), setForceRender = _a[1];
    useListenTo(featureDetection, 'change:cesium', function () {
        setForceRender(Math.random());
    });
    return featureDetection.supportsFeature('cesium');
};
var useCountdown = function (_a) {
    var start = _a.start, length = _a.length;
    var _b = __read(React.useState(false), 2), finished = _b[0], setFinished = _b[1];
    React.useEffect(function () {
        if (start && length) {
            var timeoutId_1 = window.setTimeout(function () {
                setFinished(true);
            }, length);
            return function () {
                window.clearTimeout(timeoutId_1);
            };
        }
        return function () { };
    }, [start, length]);
    return finished;
};
export var CesiumMapViewReact = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var supportsCesium = useSupportsCesium();
    var countdownFinished = useCountdown({
        start: !supportsCesium,
        length: 10000,
    });
    var _b = __read(React.useState(false), 2), swap = _b[0], setSwap = _b[1];
    var _c = __read(React.useState(null), 2), map = _c[0], setMap = _c[1];
    if (supportsCesium) {
        return (React.createElement(React.Fragment, null,
            React.createElement(Memo, null,
                React.createElement(MapViewReact, { loadMap: function () {
                        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                        var deferred = new $.Deferred();
                        import('./map.cesium').then(function (CesiumMap) {
                            deferred.resolve(CesiumMap.default);
                        });
                        return deferred;
                    }, setMap: setMap, selectionInterface: selectionInterface })),
            React.createElement(CesiumDrawings, { map: map, selectionInterface: selectionInterface })));
    }
    if (countdownFinished || swap) {
        return React.createElement(OpenlayersMapViewReact, { selectionInterface: selectionInterface });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "not-supported p-4 flex flex-col items-center space-y-4" },
            React.createElement("h3", { className: " text-center" }, "The 3D Map is not supported by your browser."),
            React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                    setSwap(true);
                } }, "2D Map"),
            React.createElement("h3", { className: " text-center" }, "2D Map will automatically load after 10 seconds."))));
};
//# sourceMappingURL=cesium.view.js.map