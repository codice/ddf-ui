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
import { MAP_LAYERS } from '../../settings-helpers';
var loadOpenLayersCode = function () {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    var deferred = new $.Deferred();
    import('./map.openlayers').then(function (OpenlayersMap) {
        deferred.resolve(OpenlayersMap.default);
    });
    return deferred;
};
export var OpenlayersMapViewReact = function (_a) {
    var selectionInterface = _a.selectionInterface, outerSetMap = _a.setMap, componentState = _a.componentState;
    var _b = __read(React.useState(null), 2), map = _b[0], setMap = _b[1];
    var _c = __read(React.useState(null), 2), mapLayers = _c[0], setMapLayers = _c[1];
    var listenTo = useBackbone().listenTo;
    var _d = React.useContext(LayoutContext), getValue = _d.getValue, setValue = _d.setValue, hasLayoutContext = _d.hasLayoutContext;
    var saveLayers = function (layers) {
        if (hasLayoutContext) {
            setValue(MAP_LAYERS, layers.toJSON());
        }
        else {
            user.get('user>preferences').savePreferences();
        }
    };
    React.useEffect(function () {
        var userDefaultLayers = user.get('user>preferences>mapLayers');
        var layerCollection = userDefaultLayers;
        if (hasLayoutContext) {
            var layerSettings = getValue(MAP_LAYERS, componentState.mapLayers);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmxheWVycy52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvb3BlbmxheWVycy9vcGVubGF5ZXJzLnZpZXcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzFELE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saURBQWlELENBQUE7QUFDL0UsT0FBTyxJQUFJLE1BQU0sbUNBQW1DLENBQUE7QUFDcEQsT0FBTyxJQUFJLE1BQU0sMkJBQTJCLENBQUE7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUduRCxJQUFNLGtCQUFrQixHQUFHO0lBQ3pCLG1KQUFtSjtJQUNuSixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNqQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxhQUFhO1FBQzVDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3pDLENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxRQUFRLENBQUE7QUFDakIsQ0FBQyxDQUFBO0FBRUQs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Q0FDeEIsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTWVtbyB9IGZyb20gJy4uLy4uLy4uL21lbW8vbWVtbydcbmltcG9ydCB7IE1hcFZpZXdSZWFjdCB9IGZyb20gJy4uL21hcC52aWV3J1xuaW1wb3J0IHsgT3BlbmxheWVyc0RyYXdpbmdzIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zUHJvdmlkZXIgfSBmcm9tICcuLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5pbXBvcnQgeyBMYXlvdXRDb250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vZ29sZGVuLWxheW91dC92aXN1YWwtc2V0dGluZ3MucHJvdmlkZXInXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi8uLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgVXNlciBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9Vc2VyJ1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IE1BUF9MQVlFUlMgfSBmcm9tICcuLi8uLi9zZXR0aW5ncy1oZWxwZXJzJ1xuaW1wb3J0IHsgT3BlbmxheWVyc1N0YXRlVHlwZSB9IGZyb20gJy4uLy4uLy4uL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC50eXBlcydcblxuY29uc3QgbG9hZE9wZW5MYXllcnNDb2RlID0gKCkgPT4ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgY29uc3QgZGVmZXJyZWQgPSBuZXcgJC5EZWZlcnJlZCgpXG4gIGltcG9ydCgnLi9tYXAub3BlbmxheWVycycpLnRoZW4oKE9wZW5sYXllcnNNYXApID0+IHtcbiAgICBkZWZlcnJlZC5yZXNvbHZlKE9wZW5sYXllcnNNYXAuZGVmYXVsdClcbiAgfSlcbiAgcmV0dXJuIGRlZmVycmVkXG59XG5cbmV4cG9ydCBjb25zdCBPcGVubGF5ZXJzTWFwVmlld1JlYWN0ID0gKHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBzZXRNYXA6IG91dGVyU2V0TWFwLFxuICBjb21wb25lbnRTdGF0ZSxcbn06IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgc2V0TWFwPzogKG1hcDogYW55KSA9PiB2b2lkXG4gIGNvbXBvbmVudFN0YXRlOiBPcGVubGF5ZXJzU3RhdGVUeXBlXG59KSA9PiB7XG4gIGNvbnN0IFttYXAsIHNldE1hcF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIGNvbnN0IFttYXBMYXllcnMsIHNldE1hcExheWVyc10gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIGNvbnN0IHsgbGlzdGVuVG8gfSA9IHVzZUJhY2tib25lKClcblxuICBjb25zdCB7IGdldFZhbHVlLCBzZXRWYWx1ZSwgaGFzTGF5b3V0Q29udGV4dCB9ID1cbiAgICBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpXG5cbiAgY29uc3Qgc2F2ZUxheWVycyA9IChsYXllcnM6IGFueSkgPT4ge1xuICAgIGlmIChoYXNMYXlvdXRDb250ZXh0KSB7XG4gICAgICBzZXRWYWx1ZShNQVBfTEFZRVJTLCBsYXllcnMudG9KU09OKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzJykuc2F2ZVByZWZlcmVuY2VzKClcbiAgICB9XG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHVzZXJEZWZhdWx0TGF5ZXJzID0gdXNlci5nZXQoJ3VzZXI+cHJlZmVyZW5jZXM+bWFwTGF5ZXJzJylcblxuICAgIGxldCBsYXllckNvbGxlY3Rpb24gPSB1c2VyRGVmYXVsdExheWVyc1xuICAgIGlmIChoYXNMYXlvdXRDb250ZXh0KSB7XG4gICAgICBjb25zdCBsYXllclNldHRpbmdzID0gZ2V0VmFsdWUoTUFQX0xBWUVSUywgY29tcG9uZW50U3RhdGUubWFwTGF5ZXJzKVxuICAgICAgY29uc3QgbGF5ZXJNb2RlbHMgPSBsYXllclNldHRpbmdzLm1hcCgobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IChVc2VyIGFzIGFueSkuTWFwTGF5ZXIobGF5ZXIsIHsgcGFyc2U6IHRydWUgfSlcbiAgICAgIH0pXG4gICAgICBsYXllckNvbGxlY3Rpb24gPSBuZXcgKFVzZXIgYXMgYW55KS5NYXBMYXllcnMobGF5ZXJNb2RlbHMpXG4gICAgfVxuXG4gICAgbGlzdGVuVG8obGF5ZXJDb2xsZWN0aW9uLCAnYWRkIHJlbW92ZScsICgpID0+IHNhdmVMYXllcnMobGF5ZXJDb2xsZWN0aW9uKSlcbiAgICBsYXllckNvbGxlY3Rpb24udmFsaWRhdGUoKVxuICAgIHNldE1hcExheWVycyhsYXllckNvbGxlY3Rpb24pXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1hcExheWVycykge1xuICAgICAgbGlzdGVuVG8obWFwTGF5ZXJzLCAnY2hhbmdlJywgKCkgPT4gc2F2ZUxheWVycyhtYXBMYXllcnMpKVxuICAgIH1cbiAgfSwgW21hcExheWVyc10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAob3V0ZXJTZXRNYXApIHtcbiAgICAgIG91dGVyU2V0TWFwKG1hcClcbiAgICB9XG4gIH0sIFttYXBdKVxuXG4gIGlmICghbWFwTGF5ZXJzKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEludGVyYWN0aW9uc1Byb3ZpZGVyPlxuICAgICAgPE1lbW8+XG4gICAgICAgIDxNYXBWaWV3UmVhY3RcbiAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICBtYXBMYXllcnM9e21hcExheWVyc31cbiAgICAgICAgICBsb2FkTWFwPXtsb2FkT3BlbkxheWVyc0NvZGV9XG4gICAgICAgICAgc2V0TWFwPXtzZXRNYXB9XG4gICAgICAgIC8+XG4gICAgICA8L01lbW8+XG4gICAgICA8T3BlbmxheWVyc0RyYXdpbmdzIG1hcD17bWFwfSBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX0gLz5cbiAgICA8L0ludGVyYWN0aW9uc1Byb3ZpZGVyPlxuICApXG59XG4iXX0=