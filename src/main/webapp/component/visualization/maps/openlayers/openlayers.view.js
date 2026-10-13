import { __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(InteractionsProvider, { children: [_jsx(Memo, { children: _jsx(MapViewReact, { selectionInterface: selectionInterface, mapLayers: mapLayers, loadMap: loadOpenLayersCode, setMap: setMap }) }), _jsx(OpenlayersDrawings, { map: map, selectionInterface: selectionInterface })] }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmxheWVycy52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvb3BlbmxheWVycy9vcGVubGF5ZXJzLnZpZXcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUMxQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUMxRCxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlEQUFpRCxDQUFBO0FBQy9FLE9BQU8sSUFBSSxNQUFNLG1DQUFtQyxDQUFBO0FBQ3BELE9BQU8sSUFBSSxNQUFNLDJCQUEyQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFHbkQsSUFBTSxrQkFBa0IsR0FBRztJQUN6QixtSkFBbUo7SUFDbkosSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDakMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsYUFBYTtRQUM1QyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN6QyxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sUUFBUSxDQUFBO0FBQ2pCLENBQUMsQ0FBQTtBQUVE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a0IsSUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixHQUFJLElBQ25ELENBQ3hCLENBQUE7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IE1lbW8gfSBmcm9tICcuLi8uLi8uLi9tZW1vL21lbW8nXG5pbXBvcnQgeyBNYXBWaWV3UmVhY3QgfSBmcm9tICcuLi9tYXAudmlldydcbmltcG9ydCB7IE9wZW5sYXllcnNEcmF3aW5ncyB9IGZyb20gJy4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCB7IEludGVyYWN0aW9uc1Byb3ZpZGVyIH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuaW1wb3J0IHsgTGF5b3V0Q29udGV4dCB9IGZyb20gJy4uLy4uLy4uL2dvbGRlbi1sYXlvdXQvdmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IFVzZXIgZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvVXNlcidcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyBNQVBfTEFZRVJTIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3MtaGVscGVycydcbmltcG9ydCB7IE9wZW5sYXllcnNTdGF0ZVR5cGUgfSBmcm9tICcuLi8uLi8uLi9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQudHlwZXMnXG5cbmNvbnN0IGxvYWRPcGVuTGF5ZXJzQ29kZSA9ICgpID0+IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMDkpIEZJWE1FOiAnbmV3JyBleHByZXNzaW9uLCB3aG9zZSB0YXJnZXQgbGFja3MgYSBjb25zdHJ1Y3Qgcy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGNvbnN0IGRlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKVxuICBpbXBvcnQoJy4vbWFwLm9wZW5sYXllcnMnKS50aGVuKChPcGVubGF5ZXJzTWFwKSA9PiB7XG4gICAgZGVmZXJyZWQucmVzb2x2ZShPcGVubGF5ZXJzTWFwLmRlZmF1bHQpXG4gIH0pXG4gIHJldHVybiBkZWZlcnJlZFxufVxuXG5leHBvcnQgY29uc3QgT3BlbmxheWVyc01hcFZpZXdSZWFjdCA9ICh7XG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgc2V0TWFwOiBvdXRlclNldE1hcCxcbiAgY29tcG9uZW50U3RhdGUsXG59OiB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIHNldE1hcD86IChtYXA6IGFueSkgPT4gdm9pZFxuICBjb21wb25lbnRTdGF0ZTogT3BlbmxheWVyc1N0YXRlVHlwZVxufSkgPT4ge1xuICBjb25zdCBbbWFwLCBzZXRNYXBdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBjb25zdCBbbWFwTGF5ZXJzLCBzZXRNYXBMYXllcnNdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG5cbiAgY29uc3QgeyBnZXRWYWx1ZSwgc2V0VmFsdWUsIGhhc0xheW91dENvbnRleHQgfSA9XG4gICAgUmVhY3QudXNlQ29udGV4dChMYXlvdXRDb250ZXh0KVxuXG4gIGNvbnN0IHNhdmVMYXllcnMgPSAobGF5ZXJzOiBhbnkpID0+IHtcbiAgICBpZiAoaGFzTGF5b3V0Q29udGV4dCkge1xuICAgICAgc2V0VmFsdWUoTUFQX0xBWUVSUywgbGF5ZXJzLnRvSlNPTigpKVxuICAgIH0gZWxzZSB7XG4gICAgICB1c2VyLmdldCgndXNlcj5wcmVmZXJlbmNlcycpLnNhdmVQcmVmZXJlbmNlcygpXG4gICAgfVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1c2VyRGVmYXVsdExheWVycyA9IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG5cbiAgICBsZXQgbGF5ZXJDb2xsZWN0aW9uID0gdXNlckRlZmF1bHRMYXllcnNcbiAgICBpZiAoaGFzTGF5b3V0Q29udGV4dCkge1xuICAgICAgY29uc3QgbGF5ZXJTZXR0aW5ncyA9IGdldFZhbHVlKE1BUF9MQVlFUlMsIGNvbXBvbmVudFN0YXRlLm1hcExheWVycylcbiAgICAgIGNvbnN0IGxheWVyTW9kZWxzID0gbGF5ZXJTZXR0aW5ncy5tYXAoKGxheWVyOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyAoVXNlciBhcyBhbnkpLk1hcExheWVyKGxheWVyLCB7IHBhcnNlOiB0cnVlIH0pXG4gICAgICB9KVxuICAgICAgbGF5ZXJDb2xsZWN0aW9uID0gbmV3IChVc2VyIGFzIGFueSkuTWFwTGF5ZXJzKGxheWVyTW9kZWxzKVxuICAgIH1cblxuICAgIGxpc3RlblRvKGxheWVyQ29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCAoKSA9PiBzYXZlTGF5ZXJzKGxheWVyQ29sbGVjdGlvbikpXG4gICAgbGF5ZXJDb2xsZWN0aW9uLnZhbGlkYXRlKClcbiAgICBzZXRNYXBMYXllcnMobGF5ZXJDb2xsZWN0aW9uKVxuICB9LCBbXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtYXBMYXllcnMpIHtcbiAgICAgIGxpc3RlblRvKG1hcExheWVycywgJ2NoYW5nZScsICgpID0+IHNhdmVMYXllcnMobWFwTGF5ZXJzKSlcbiAgICB9XG4gIH0sIFttYXBMYXllcnNdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG91dGVyU2V0TWFwKSB7XG4gICAgICBvdXRlclNldE1hcChtYXApXG4gICAgfVxuICB9LCBbbWFwXSlcblxuICBpZiAoIW1hcExheWVycykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxJbnRlcmFjdGlvbnNQcm92aWRlcj5cbiAgICAgIDxNZW1vPlxuICAgICAgICA8TWFwVmlld1JlYWN0XG4gICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtzZWxlY3Rpb25JbnRlcmZhY2V9XG4gICAgICAgICAgbWFwTGF5ZXJzPXttYXBMYXllcnN9XG4gICAgICAgICAgbG9hZE1hcD17bG9hZE9wZW5MYXllcnNDb2RlfVxuICAgICAgICAgIHNldE1hcD17c2V0TWFwfVxuICAgICAgICAvPlxuICAgICAgPC9NZW1vPlxuICAgICAgPE9wZW5sYXllcnNEcmF3aW5ncyBtYXA9e21hcH0gc2VsZWN0aW9uSW50ZXJmYWNlPXtzZWxlY3Rpb25JbnRlcmZhY2V9IC8+XG4gICAgPC9JbnRlcmFjdGlvbnNQcm92aWRlcj5cbiAgKVxufVxuIl19