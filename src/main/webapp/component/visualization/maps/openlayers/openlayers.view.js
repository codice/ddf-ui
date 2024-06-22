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
import React from 'react';
import { Memo } from '../../../memo/memo';
import { MapViewReact } from '../map.view';
import { OpenlayersDrawings } from './drawing-and-display';
import $ from 'jquery';
import { InteractionsProvider } from '../interactions.provider';
import { LayoutContext } from '../../../golden-layout/visual-settings.provider';
import user from '../../../singletons/user-instance';
import User from '../../../../js/model/User';
import { useBackbone } from '../../../selection-checkbox/useBackbone.hook';
import { OPENLAYERS_MAP_LAYERS } from '../../settings-helpers';
var loadOpenLayersCode = function () {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    var deferred = new $.Deferred();
    import('./map.openlayers').then(function (OpenlayersMap) {
        deferred.resolve(OpenlayersMap.default);
    });
    return deferred;
};
export var OpenlayersMapViewReact = function (_a) {
    var selectionInterface = _a.selectionInterface, outerSetMap = _a.setMap;
    var _b = __read(React.useState(null), 2), map = _b[0], setMap = _b[1];
    var _c = __read(React.useState(null), 2), mapLayers = _c[0], setMapLayers = _c[1];
    var listenTo = useBackbone().listenTo;
    var _d = React.useContext(LayoutContext), getValue = _d.getValue, setValue = _d.setValue, hasLayoutContext = _d.hasLayoutContext;
    var saveLayers = function (layers) {
        if (hasLayoutContext) {
            setValue(OPENLAYERS_MAP_LAYERS, layers.toJSON());
        }
        else {
            user.get('user>preferences').savePreferences();
        }
    };
    React.useEffect(function () {
        var userDefaultLayers = user.get('user>preferences>mapLayers');
        var layerCollection = userDefaultLayers;
        if (hasLayoutContext) {
            var layerSettings = getValue(OPENLAYERS_MAP_LAYERS, userDefaultLayers.toJSON());
            var layerModels = layerSettings.map(function (layer) {
                return new User.MapLayer(layer, { parse: true });
            });
            layerCollection = new User.MapLayers(layerModels);
        }
        listenTo(layerCollection, 'add remove', function () { return saveLayers(layerCollection); });
        layerCollection.validate();
        setMapLayers(layerCollection);
    }, []);
    React.useEffect(function () {
        if (mapLayers) {
            listenTo(mapLayers, 'change', function () { return saveLayers(mapLayers); });
        }
    }, [mapLayers]);
    React.useEffect(function () {
        if (outerSetMap) {
            outerSetMap(map);
        }
    }, [map]);
    if (!mapLayers) {
        return null;
    }
    return (React.createElement(InteractionsProvider, null,
        React.createElement(Memo, null,
            React.createElement(MapViewReact, { selectionInterface: selectionInterface, mapLayers: mapLayers, loadMap: loadOpenLayersCode, setMap: setMap })),
        React.createElement(OpenlayersDrawings, { map: map, selectionInterface: selectionInterface })));
};
//# sourceMappingURL=openlayers.view.js.map