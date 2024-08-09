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
import ol from 'openlayers';
import _ from 'underscore';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { removeOldDrawing } from './drawing-and-display';
import DistanceUtils from '../../../../js/DistanceUtils';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import * as Turf from '@turf/turf';
import TurfCircle from '@turf/circle';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import { contrastingColor } from '../../../../react-component/location/location-color-selector';
export function translateFromOpenlayersCoordinate(coord) {
    return ol.proj.transform([Number(coord[0]), Number(coord[1])], StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
}
function translateToOpenlayersCoordinate(coord) {
    return ol.proj.transform([Number(coord[0]), Number(coord[1])], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
}
function translateToOpenlayersCoordinates(coords) {
    var coordinates = [];
    coords.forEach(function (item) {
        coordinates.push(translateToOpenlayersCoordinate(item));
    });
    return coordinates;
}
var modelToCircle = function (_a) {
    var model = _a.model, map = _a.map;
    if (model.get('lon') === undefined || model.get('lat') === undefined) {
        return undefined;
    }
    var rectangle = new ol.geom.Circle(translateToOpenlayersCoordinate([model.get('lon'), model.get('lat')]), DistanceUtils.getDistanceInMeters(model.get('radius'), model.get('radiusUnits')) / map.getMap().getView().getProjection().getMetersPerUnit());
    return rectangle;
};
export var drawCircle = function (_a) {
    var map = _a.map, model = _a.model, rectangle = _a.rectangle, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    if (!rectangle) {
        // handles case where model changes to empty vars and we don't want to draw anymore
        return;
    }
    if (translation) {
        rectangle.translate(translation.longitude, translation.latitude);
    }
    var point = Turf.point(translateFromOpenlayersCoordinate(rectangle.getCenter()));
    var turfCircle = TurfCircle(point, rectangle.getRadius() *
        map.getMap().getView().getProjection().getMetersPerUnit(), { steps: 64, units: 'meters' });
    var geometryRepresentation = new ol.geom.LineString(translateToOpenlayersCoordinates(turfCircle.geometry.coordinates[0]));
    var billboard = new ol.Feature({
        geometry: geometryRepresentation,
    });
    billboard.setId(id);
    billboard.set('locationId', model.get('locationId'));
    var color = model.get('color');
    var iconStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: isInteractive ? contrastingColor : color ? color : '#914500',
            width: isInteractive ? 6 : 4,
        }),
    });
    billboard.setStyle(iconStyle);
    var vectorSource = new ol.source.Vector({
        features: [billboard],
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });
    vectorLayer.set('id', id);
    var mapRef = map.getMap();
    removeOldDrawing({ map: mapRef, id: id });
    mapRef.addLayer(vectorLayer);
};
var updatePrimitive = function (_a) {
    var map = _a.map, model = _a.model, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    var circle = modelToCircle({ model: model, map: map });
    // make sure the current model has width and height before drawing
    if (circle && !_.isUndefined(circle)) {
        drawCircle({
            model: model,
            rectangle: circle,
            map: map,
            id: id,
            isInteractive: isInteractive,
            translation: translation,
        });
    }
};
var useListenToBboxModel = function (_a) {
    var model = _a.model, map = _a.map, isInteractive = _a.isInteractive, translation = _a.translation;
    var callback = React.useMemo(function () {
        return function () {
            if (model && map) {
                updatePrimitive({
                    map: map,
                    model: model,
                    id: getIdFromModelForDisplay({ model: model }),
                    isInteractive: isInteractive,
                    translation: translation,
                });
            }
        };
    }, [model, map, isInteractive, translation]);
    useListenTo(model, 'change:lat change:lon change:radius', callback);
    callback();
};
export var OpenlayersCircleDisplay = function (_a) {
    var map = _a.map, model = _a.model, isInteractive = _a.isInteractive, translation = _a.translation;
    useListenToBboxModel({ map: map, model: model, isInteractive: isInteractive, translation: translation });
    React.useEffect(function () {
        return function () {
            if (map && model) {
                removeOldDrawing({
                    map: map.getMap(),
                    id: getIdFromModelForDisplay({ model: model }),
                });
            }
        };
    }, [map, model]);
    return React.createElement(React.Fragment, null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2lyY2xlLWRpc3BsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL2NpcmNsZS1kaXNwbGF5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUMzQixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQ3hELE9BQU8sYUFBYSxNQUFNLDhCQUE4QixDQUFBO0FBQ3hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2pFLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBQ2xDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUV2RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw4REFBOEQsQ0FBQTtBQUMvRixNQUFNLFVBQVUsaUNBQWlDLENBQUMsS0FBVTtJQUMxRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUN0QixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDcEMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUM5QyxXQUFXLENBQ1osQ0FBQTtBQUNILENBQUM7QUFDRCxTQUFTLCtCQUErQixDQUFDLEtBQVU7SUFDakQsT0FBTyxFQUFF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VEMsR0FBRyxTQUFBLEVBQ0gsS0FBSyxXQUFBLEVBQ0wsYUFBYSxtQkFBQSxFQUNiLFdBQVcsaUJBQUE7SUFPWCxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsS0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLFdBQVcsYUFBQSxFQUFFLENBQUMsQ0FBQTtJQUNoRSxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsT0FBTztZQUNMLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtnQkFDaEIsZ0JBQWdCLENBQUM7b0JBQ2YsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUU7b0JBQ2pCLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUM7aUJBQ3hDLENBQUMsQ0FBQTthQUNIO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDaEIsT0FBTyx5Q0FBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgb2wgZnJvbSAnb3BlbmxheWVycydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uLy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgcmVtb3ZlT2xkRHJhd2luZyB9IGZyb20gJy4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCBEaXN0YW5jZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2pzL0Rpc3RhbmNlVXRpbHMnXG5pbXBvcnQgeyBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkgfSBmcm9tICcuLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0ICogYXMgVHVyZiBmcm9tICdAdHVyZi90dXJmJ1xuaW1wb3J0IFR1cmZDaXJjbGUgZnJvbSAnQHR1cmYvY2lyY2xlJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IFRyYW5zbGF0aW9uIH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zLnByb3ZpZGVyJ1xuaW1wb3J0IHsgY29udHJhc3RpbmdDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9sb2NhdGlvbi1jb2xvci1zZWxlY3RvcidcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGVGcm9tT3BlbmxheWVyc0Nvb3JkaW5hdGUoY29vcmQ6IGFueSkge1xuICByZXR1cm4gb2wucHJvai50cmFuc2Zvcm0oXG4gICAgW051bWJlcihjb29yZFswXSksIE51bWJlcihjb29yZFsxXSldLFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKCksXG4gICAgJ0VQU0c6NDMyNidcbiAgKVxufVxuZnVuY3Rpb24gdHJhbnNsYXRlVG9PcGVubGF5ZXJzQ29vcmRpbmF0ZShjb29yZDogYW55KSB7XG4gIHJldHVybiBvbC5wcm9qLnRyYW5zZm9ybShcbiAgICBbTnVtYmVyKGNvb3JkWzBdKSwgTnVtYmVyKGNvb3JkWzFdKV0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG59XG5mdW5jdGlvbiB0cmFuc2xhdGVUb09wZW5sYXllcnNDb29yZGluYXRlcyhjb29yZHM6IGFueSkge1xuICBjb25zdCBjb29yZGluYXRlcyA9IFtdIGFzIGFueVtdXG4gIGNvb3Jkcy5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICBjb29yZGluYXRlcy5wdXNoKHRyYW5zbGF0ZVRvT3BlbmxheWVyc0Nvb3JkaW5hdGUoaXRlbSkpXG4gIH0pXG4gIHJldHVybiBjb29yZGluYXRlc1xufVxuY29uc3QgbW9kZWxUb0NpcmNsZSA9ICh7IG1vZGVsLCBtYXAgfTogeyBtb2RlbDogYW55OyBtYXA6IGFueSB9KSA9PiB7XG4gIGlmIChtb2RlbC5nZXQoJ2xvbicpID09PSB1bmRlZmluZWQgfHwgbW9kZWwuZ2V0KCdsYXQnKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBvbC5nZW9tLkNpcmNsZShcbiAgICB0cmFuc2xhdGVUb09wZW5sYXllcnNDb29yZGluYXRlKFttb2RlbC5nZXQoJ2xvbicpLCBtb2RlbC5nZXQoJ2xhdCcpXSksXG4gICAgRGlzdGFuY2VVdGlscy5nZXREaXN0YW5jZUluTWV0ZXJzKFxuICAgICAgbW9kZWwuZ2V0KCdyYWRpdXMnKSxcbiAgICAgIG1vZGVsLmdldCgncmFkaXVzVW5pdHMnKVxuICAgICkgLyBtYXAuZ2V0TWFwKCkuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKS5nZXRNZXRlcnNQZXJVbml0KClcbiAgKVxuICByZXR1cm4gcmVjdGFuZ2xlXG59XG5leHBvcnQgY29uc3QgZHJhd0NpcmNsZSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIHJlY3RhbmdsZSxcbiAgaWQsXG4gIGlzSW50ZXJhY3RpdmUsXG4gIHRyYW5zbGF0aW9uLFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIHJlY3RhbmdsZTogYW55XG4gIGlkOiBzdHJpbmdcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW5cbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxufSkgPT4ge1xuICBpZiAoIXJlY3RhbmdsZSkge1xuICAgIC8vIGhhbmRsZXMgY2FzZSB3aGVyZSBtb2RlbCBjaGFuZ2VzIHRvIGVtcHR5IHZhcnMgYW5kIHdlIGRvbid0IHdhbnQgdG8gZHJhdyBhbnltb3JlXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgcmVjdGFuZ2xlLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5sb25naXR1ZGUsIHRyYW5zbGF0aW9uLmxhdGl0dWRlKVxuICB9XG4gIGNvbnN0IHBvaW50ID0gVHVyZi5wb2ludChcbiAgICB0cmFuc2xhdGVGcm9tT3BlbmxheWVyc0Nvb3JkaW5hdGUocmVjdGFuZ2xlLmdldENlbnRlcigpKVxuICApXG4gIGNvbnN0IHR1cmZDaXJjbGUgPSBUdXJmQ2lyY2xlKFxuICAgIHBvaW50LFxuICAgIHJlY3RhbmdsZS5nZXRSYWRpdXMoKSAqXG4gICAgICBtYXAuZ2V0TWFwKCkuZ2V0VmlldygpLmdldFByb2plY3Rpb24oKS5nZXRNZXRlcnNQZXJVbml0KCksXG4gICAgeyBzdGVwczogNjQsIHVuaXRzOiAnbWV0ZXJzJyB9XG4gIClcbiAgY29uc3QgZ2VvbWV0cnlSZXByZXNlbnRhdGlvbiA9IG5ldyBvbC5nZW9tLkxpbmVTdHJpbmcoXG4gICAgdHJhbnNsYXRlVG9PcGVubGF5ZXJzQ29vcmRpbmF0ZXModHVyZkNpcmNsZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSlcbiAgKVxuICBjb25zdCBiaWxsYm9hcmQgPSBuZXcgb2wuRmVhdHVyZSh7XG4gICAgZ2VvbWV0cnk6IGdlb21ldHJ5UmVwcmVzZW50YXRpb24sXG4gIH0pXG4gIGJpbGxib2FyZC5zZXRJZChpZClcbiAgYmlsbGJvYXJkLnNldCgnbG9jYXRpb25JZCcsIG1vZGVsLmdldCgnbG9jYXRpb25JZCcpKVxuICBjb25zdCBjb2xvciA9IG1vZGVsLmdldCgnY29sb3InKVxuICBjb25zdCBpY29uU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoe1xuICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlLlN0cm9rZSh7XG4gICAgICBjb2xvcjogaXNJbnRlcmFjdGl2ZSA/IGNvbnRyYXN0aW5nQ29sb3IgOiBjb2xvciA/IGNvbG9yIDogJyM5MTQ1MDAnLFxuICAgICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICB9KSxcbiAgfSlcbiAgYmlsbGJvYXJkLnNldFN0eWxlKGljb25TdHlsZSlcbiAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe1xuICAgIGZlYXR1cmVzOiBbYmlsbGJvYXJkXSxcbiAgfSlcbiAgbGV0IHZlY3RvckxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XG4gICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gIH0pXG4gIHZlY3RvckxheWVyLnNldCgnaWQnLCBpZClcbiAgY29uc3QgbWFwUmVmID0gbWFwLmdldE1hcCgpIGFzIG9sLk1hcFxuICByZW1vdmVPbGREcmF3aW5nKHsgbWFwOiBtYXBSZWYsIGlkIH0pXG4gIG1hcFJlZi5hZGRMYXllcih2ZWN0b3JMYXllcilcbn1cbmNvbnN0IHVwZGF0ZVByaW1pdGl2ZSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIGlkLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBpZDogc3RyaW5nXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbn0pID0+IHtcbiAgY29uc3QgY2lyY2xlID0gbW9kZWxUb0NpcmNsZSh7IG1vZGVsLCBtYXAgfSlcbiAgLy8gbWFrZSBzdXJlIHRoZSBjdXJyZW50IG1vZGVsIGhhcyB3aWR0aCBhbmQgaGVpZ2h0IGJlZm9yZSBkcmF3aW5nXG4gIGlmIChjaXJjbGUgJiYgIV8uaXNVbmRlZmluZWQoY2lyY2xlKSkge1xuICAgIGRyYXdDaXJjbGUoe1xuICAgICAgbW9kZWwsXG4gICAgICByZWN0YW5nbGU6IGNpcmNsZSxcbiAgICAgIG1hcCxcbiAgICAgIGlkLFxuICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgIHRyYW5zbGF0aW9uLFxuICAgIH0pXG4gIH1cbn1cbmNvbnN0IHVzZUxpc3RlblRvQmJveE1vZGVsID0gKHtcbiAgbW9kZWwsXG4gIG1hcCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW5cbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxufSkgPT4ge1xuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kZWwgJiYgbWFwKSB7XG4gICAgICAgIHVwZGF0ZVByaW1pdGl2ZSh7XG4gICAgICAgICAgbWFwLFxuICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIGlzSW50ZXJhY3RpdmUsIHRyYW5zbGF0aW9uXSlcbiAgdXNlTGlzdGVuVG8obW9kZWwsICdjaGFuZ2U6bGF0IGNoYW5nZTpsb24gY2hhbmdlOnJhZGl1cycsIGNhbGxiYWNrKVxuICBjYWxsYmFjaygpXG59XG5leHBvcnQgY29uc3QgT3BlbmxheWVyc0NpcmNsZURpc3BsYXkgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhblxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG59KSA9PiB7XG4gIHVzZUxpc3RlblRvQmJveE1vZGVsKHsgbWFwLCBtb2RlbCwgaXNJbnRlcmFjdGl2ZSwgdHJhbnNsYXRpb24gfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG1hcCAmJiBtb2RlbCkge1xuICAgICAgICByZW1vdmVPbGREcmF3aW5nKHtcbiAgICAgICAgICBtYXA6IG1hcC5nZXRNYXAoKSxcbiAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG4gIHJldHVybiA8PjwvPlxufVxuIl19