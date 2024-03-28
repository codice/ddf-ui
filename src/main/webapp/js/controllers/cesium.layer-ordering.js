import { __read, __spreadArray } from "tslib";
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
import { isEqual, intersection } from 'lodash';
export function addLayer(_a) {
    var initializedLayerOrder = _a.initialized, allLayerOrder = _a.all, layerId = _a.layer;
    var initializedLayers = new Set(initializedLayerOrder);
    var filtered = allLayerOrder.filter(function (id) { return initializedLayers.has(id); });
    if (filtered.length < initializedLayerOrder.length) {
        throw new Error("addLayer: the set of all layers must be a superset of initialized layers");
    }
    if (!isEqual(filtered, initializedLayerOrder)) {
        throw new Error("addLayer: the two layer orders cannot have different orders");
    }
    return allLayerOrder.filter(function (id) { return id === layerId || initializedLayers.has(id); });
}
export function shiftLayers(_a) {
    var previousLayerOrder = _a.prev, currentLayerOrder = _a.cur;
    var previousLayers = new Set(previousLayerOrder);
    return currentLayerOrder.filter(function (id) { return previousLayers.has(id); });
}
export function getShift(_a) {
    var previousLayerOrder = _a.prev, currentLayerOrder = _a.cur;
    if (intersection(previousLayerOrder, currentLayerOrder).length !==
        previousLayerOrder.length ||
        currentLayerOrder.length !== previousLayerOrder.length) {
        throw new Error("getShift: arrays must contain the same ids");
    }
    if (isEqual(previousLayerOrder, currentLayerOrder)) {
        return { layer: previousLayerOrder[0], method: 'lower', count: 0 };
    }
    var shiftLayerToIndex = function (_a) {
        var layerOrder = _a.layerOrder, layerId = _a.layer, index = _a.index;
        var layerIdRemoved = layerOrder.filter(function (id) { return id !== layerId; });
        return __spreadArray(__spreadArray(__spreadArray([], __read(layerIdRemoved.slice(0, index)), false), [
            layerId
        ], false), __read(layerIdRemoved.slice(index)), false);
    };
    var changedLayers = previousLayerOrder.filter(function (id, index) { return currentLayerOrder[index] !== id; });
    for (var i = 0; i < changedLayers.length; i++) {
        var layer = changedLayers[i];
        var previousOrder = previousLayerOrder.indexOf(layer);
        var currentOrder = currentLayerOrder.indexOf(layer);
        var shiftLayer = shiftLayerToIndex({
            layerOrder: previousLayerOrder,
            layer: layer,
            index: currentOrder,
        });
        if (isEqual(shiftLayer, currentLayerOrder)) {
            return {
                layer: layer,
                method: currentOrder > previousOrder ? 'raise' : 'lower',
                count: Math.abs(currentOrder - previousOrder),
            };
        }
    }
    throw new Error("getShift: unable to find shift");
}
//# sourceMappingURL=cesium.layer-ordering.js.map