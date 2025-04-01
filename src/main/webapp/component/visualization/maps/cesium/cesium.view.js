import { __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { InteractionsProvider } from '../interactions.provider';
import { LayoutContext } from '../../../golden-layout/visual-settings.provider';
import User from '../../../../js/model/User';
import { useBackbone } from '../../../selection-checkbox/useBackbone.hook';
import { MAP_LAYERS } from '../../settings-helpers';
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
    var selectionInterface = _a.selectionInterface, outerSetMap = _a.setMap, componentState = _a.componentState;
    var supportsCesium = useSupportsCesium();
    var countdownFinished = useCountdown({
        start: !supportsCesium,
        length: 10000,
    });
    var _b = __read(React.useState(false), 2), swap = _b[0], setSwap = _b[1];
    var _c = __read(React.useState(null), 2), map = _c[0], setMap = _c[1];
    var _d = __read(React.useState(null), 2), mapLayers = _d[0], setMapLayers = _d[1];
    var listenTo = useBackbone().listenTo;
    var _e = React.useContext(LayoutContext), getValue = _e.getValue, setValue = _e.setValue;
    React.useEffect(function () {
        var layerSettings = getValue(MAP_LAYERS, componentState.mapLayers);
        var layerModels = layerSettings.map(function (layer) {
            return new User.MapLayer(layer, { parse: true });
        });
        var layerCollection = new User.MapLayers(layerModels);
        listenTo(layerCollection, 'add remove', function () {
            return setValue(MAP_LAYERS, layerCollection.toJSON());
        });
        layerCollection.validate();
        setMapLayers(layerCollection);
    }, []);
    React.useEffect(function () {
        var callback = function () {
            setValue(MAP_LAYERS, mapLayers.toJSON());
        };
        if (mapLayers) {
            listenTo(mapLayers, 'change', callback);
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
    if (supportsCesium) {
        return (_jsxs(InteractionsProvider, { children: [_jsx(Memo, { children: _jsx(MapViewReact, { loadMap: function () {
                            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                            var deferred = new $.Deferred();
                            import('./map.cesium').then(function (CesiumMap) {
                                deferred.resolve(CesiumMap.default);
                            });
                            return deferred;
                        }, setMap: setMap, selectionInterface: selectionInterface, mapLayers: mapLayers }) }), _jsx(CesiumDrawings, { map: map, selectionInterface: selectionInterface })] }));
    }
    if (countdownFinished || swap) {
        return (_jsx(OpenlayersMapViewReact, { setMap: setMap, selectionInterface: selectionInterface, componentState: componentState }));
    }
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "not-supported p-4 flex flex-col items-center space-y-4", children: [_jsx("h3", { className: " text-center", children: "The 3D Map is not supported by your browser." }), _jsx(Button, { variant: "contained", color: "primary", onClick: function () {
                        setSwap(true);
                    }, children: "2D Map" }), _jsx("h3", { className: " text-center", children: "2D Map will automatically load after 10 seconds." })] }) }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VzaXVtLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9jZXNpdW0vY2VzaXVtLnZpZXcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDMUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sK0JBQStCLENBQUE7QUFDdEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRXRELDRJQUE0STtBQUU1SSxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxnQkFBZ0IsTUFBTSx1Q0FBdUMsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saURBQWlELENBQUE7QUFDL0UsT0FBTyxJQUFJLE1BQU0sMkJBQTJCLENBQUE7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUduRCxJQUFNLGlCQUFpQixHQUFHO0lBQ2xCLElBQUEsS0FBQSxPQUFxQixLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFBLEVBQS9DLGNBQWMsUUFBaUMsQ0FBQTtJQUV4RCxXQUFXLENB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R0FBSSxJQUMvQyxDQUN4QixDQUFBO0lBQ0gsQ0FBQztJQUVELElBQUksaUJBQWlCLElBQUksSUFBSSxFQUFFLENBQUM7UUFDOUIsT0FBTyxDQUNMLEtBQUMsc0JBQXNCLElBQ3JCLE1BQU0sRUFBRSxNQUFNLEVBQ2Qsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQ3RDLGNBQWMsRUFBRSxjQUFjLEdBQzlCLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFFRCxPQUFPLENBQ0wsNEJBQ0UsZUFBSyxTQUFTLEVBQUMsd0RBQXdELGFBQ3JFLGFBQUksU0FBUyxFQUFDLGNBQWMsNkRBRXZCLEVBQ0wsS0FBQyxNQUFNLElBQ0wsT0FBTyxFQUFDLFdBQVcsRUFDbkIsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUU7d0JBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNmLENBQUMsdUJBR00sRUFDVCxhQUFJLFNBQVMsRUFBQyxjQUFjLGlFQUV2QixJQUNELEdBQ0wsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTWVtbyB9IGZyb20gJy4uLy4uLy4uL21lbW8vbWVtbydcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyBNYXBWaWV3UmVhY3QgfSBmcm9tICcuLi9tYXAudmlldydcbmltcG9ydCB7IE9wZW5sYXllcnNNYXBWaWV3UmVhY3QgfSBmcm9tICcuLi9vcGVubGF5ZXJzL29wZW5sYXllcnMudmlldydcbmltcG9ydCB7IENlc2l1bURyYXdpbmdzIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuXG4vL1lvdSB0eXBpY2FsbHkgZG9uJ3Qgd2FudCB0byB1c2UgdGhpcyB2aWV3IGRpcmVjdGx5LiAgSW5zdGVhZCwgdXNlIHRoZSBjb21iaW5lZC1tYXAgY29tcG9uZW50IHdoaWNoIHdpbGwgaGFuZGxlIGZhbGxpbmcgYmFjayB0byBvcGVubGF5ZXJzLlxuXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgZmVhdHVyZURldGVjdGlvbiBmcm9tICcuLi8uLi8uLi9zaW5nbGV0b25zL2ZlYXR1cmUtZGV0ZWN0aW9uJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zUHJvdmlkZXIgfSBmcm9tICcuLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5pbXBvcnQgeyBMYXlvdXRDb250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vZ29sZGVuLWxheW91dC92aXN1YWwtc2V0dGluZ3MucHJvdmlkZXInXG5pbXBvcnQgVXNlciBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9Vc2VyJ1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IE1BUF9MQVlFUlMgfSBmcm9tICcuLi8uLi9zZXR0aW5ncy1oZWxwZXJzJ1xuaW1wb3J0IHsgQ2VzaXVtU3RhdGVUeXBlIH0gZnJvbSAnLi4vLi4vLi4vZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0LnR5cGVzJ1xuXG5jb25zdCB1c2VTdXBwb3J0c0Nlc2l1bSA9ICgpID0+IHtcbiAgY29uc3QgWywgc2V0Rm9yY2VSZW5kZXJdID0gUmVhY3QudXNlU3RhdGUoTWF0aC5yYW5kb20oKSlcblxuICB1c2VMaXN0ZW5UbyhmZWF0dXJlRGV0ZWN0aW9uLCAnY2hhbmdlOmNlc2l1bScsICgpID0+IHtcbiAgICBzZXRGb3JjZVJlbmRlcihNYXRoLnJhbmRvbSgpKVxuICB9KVxuXG4gIHJldHVybiBmZWF0dXJlRGV0ZWN0aW9uLnN1cHBvcnRzRmVhdHVyZSgnY2VzaXVtJylcbn1cblxuY29uc3QgdXNlQ291bnRkb3duID0gKHtcbiAgc3RhcnQsXG4gIGxlbmd0aCxcbn06IHtcbiAgc3RhcnQ6IGJvb2xlYW5cbiAgbGVuZ3RoOiBudW1iZXJcbn0pID0+IHtcbiAgY29uc3QgW2ZpbmlzaGVkLCBzZXRGaW5pc2hlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzdGFydCAmJiBsZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0RmluaXNoZWQodHJ1ZSlcbiAgICAgIH0sIGxlbmd0aClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge31cbiAgfSwgW3N0YXJ0LCBsZW5ndGhdKVxuICByZXR1cm4gZmluaXNoZWRcbn1cblxuZXhwb3J0IGNvbnN0IENlc2l1bU1hcFZpZXdSZWFjdCA9ICh7XG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgc2V0TWFwOiBvdXRlclNldE1hcCxcbiAgY29tcG9uZW50U3RhdGUsXG59OiB7XG4gIHNldE1hcD86IChtYXA6IGFueSkgPT4gdm9pZCAvLyBzb21ldGltZXMgb3V0ZXIgY29tcG9uZW50cyB3YW50IHRvIGtub3cgd2hlbiB0aGUgbWFwIGlzIGxvYWRlZFxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBjb21wb25lbnRTdGF0ZTogQ2VzaXVtU3RhdGVUeXBlXG59KSA9PiB7XG4gIGNvbnN0IHN1cHBvcnRzQ2VzaXVtID0gdXNlU3VwcG9ydHNDZXNpdW0oKVxuICBjb25zdCBjb3VudGRvd25GaW5pc2hlZCA9IHVzZUNvdW50ZG93bih7XG4gICAgc3RhcnQ6ICFzdXBwb3J0c0Nlc2l1bSxcbiAgICBsZW5ndGg6IDEwMDAwLFxuICB9KVxuICBjb25zdCBbc3dhcCwgc2V0U3dhcF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW21hcCwgc2V0TWFwXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgY29uc3QgW21hcExheWVycywgc2V0TWFwTGF5ZXJzXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuXG4gIGNvbnN0IHsgZ2V0VmFsdWUsIHNldFZhbHVlIH0gPSBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBsYXllclNldHRpbmdzID0gZ2V0VmFsdWUoTUFQX0xBWUVSUywgY29tcG9uZW50U3RhdGUubWFwTGF5ZXJzKVxuXG4gICAgY29uc3QgbGF5ZXJNb2RlbHMgPSBsYXllclNldHRpbmdzLm1hcCgobGF5ZXI6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyAoVXNlciBhcyBhbnkpLk1hcExheWVyKGxheWVyLCB7IHBhcnNlOiB0cnVlIH0pXG4gICAgfSlcbiAgICBjb25zdCBsYXllckNvbGxlY3Rpb24gPSBuZXcgKFVzZXIgYXMgYW55KS5NYXBMYXllcnMobGF5ZXJNb2RlbHMpXG4gICAgbGlzdGVuVG8obGF5ZXJDb2xsZWN0aW9uLCAnYWRkIHJlbW92ZScsICgpID0+XG4gICAgICBzZXRWYWx1ZShNQVBfTEFZRVJTLCBsYXllckNvbGxlY3Rpb24udG9KU09OKCkpXG4gICAgKVxuICAgIGxheWVyQ29sbGVjdGlvbi52YWxpZGF0ZSgpXG4gICAgc2V0TWFwTGF5ZXJzKGxheWVyQ29sbGVjdGlvbilcbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHNldFZhbHVlKE1BUF9MQVlFUlMsIG1hcExheWVycy50b0pTT04oKSlcbiAgICB9XG4gICAgaWYgKG1hcExheWVycykge1xuICAgICAgbGlzdGVuVG8obWFwTGF5ZXJzLCAnY2hhbmdlJywgY2FsbGJhY2spXG4gICAgfVxuICB9LCBbbWFwTGF5ZXJzXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChvdXRlclNldE1hcCkge1xuICAgICAgb3V0ZXJTZXRNYXAobWFwKVxuICAgIH1cbiAgfSwgW21hcF0pXG5cbiAgaWYgKCFtYXBMYXllcnMpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKHN1cHBvcnRzQ2VzaXVtKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxJbnRlcmFjdGlvbnNQcm92aWRlcj5cbiAgICAgICAgPE1lbW8+XG4gICAgICAgICAgPE1hcFZpZXdSZWFjdFxuICAgICAgICAgICAgbG9hZE1hcD17KCkgPT4ge1xuICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAwOSkgRklYTUU6ICduZXcnIGV4cHJlc3Npb24sIHdob3NlIHRhcmdldCBsYWNrcyBhIGNvbnN0cnVjdCBzLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgICAgY29uc3QgZGVmZXJyZWQgPSBuZXcgJC5EZWZlcnJlZCgpXG4gICAgICAgICAgICAgIGltcG9ydCgnLi9tYXAuY2VzaXVtJykudGhlbigoQ2VzaXVtTWFwKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShDZXNpdW1NYXAuZGVmYXVsdClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgc2V0TWFwPXtzZXRNYXB9XG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgIG1hcExheWVycz17bWFwTGF5ZXJzfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvTWVtbz5cbiAgICAgICAgPENlc2l1bURyYXdpbmdzIG1hcD17bWFwfSBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX0gLz5cbiAgICAgIDwvSW50ZXJhY3Rpb25zUHJvdmlkZXI+XG4gICAgKVxuICB9XG5cbiAgaWYgKGNvdW50ZG93bkZpbmlzaGVkIHx8IHN3YXApIHtcbiAgICByZXR1cm4gKFxuICAgICAgPE9wZW5sYXllcnNNYXBWaWV3UmVhY3RcbiAgICAgICAgc2V0TWFwPXtzZXRNYXB9XG4gICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICBjb21wb25lbnRTdGF0ZT17Y29tcG9uZW50U3RhdGV9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibm90LXN1cHBvcnRlZCBwLTQgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICBUaGUgM0QgTWFwIGlzIG5vdCBzdXBwb3J0ZWQgYnkgeW91ciBicm93c2VyLlxuICAgICAgICA8L2gzPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBzZXRTd2FwKHRydWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDJEIE1hcFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPGgzIGNsYXNzTmFtZT1cIiB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgIDJEIE1hcCB3aWxsIGF1dG9tYXRpY2FsbHkgbG9hZCBhZnRlciAxMCBzZWNvbmRzLlxuICAgICAgICA8L2gzPlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cbiJdfQ==