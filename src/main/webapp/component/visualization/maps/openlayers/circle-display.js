import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
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
import { LineString, Circle } from 'ol/geom';
import { transform as projTransform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Stroke, Style } from 'ol/style';
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
    return projTransform([Number(coord[0]), Number(coord[1])], StartupDataStore.Configuration.getProjection(), 'EPSG:4326');
}
function translateToOpenlayersCoordinate(coord) {
    return projTransform([Number(coord[0]), Number(coord[1])], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
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
    var rectangle = new Circle(translateToOpenlayersCoordinate([model.get('lon'), model.get('lat')]), DistanceUtils.getDistanceInMeters(model.get('radius'), model.get('radiusUnits')) / map.getMap().getView().getProjection().getMetersPerUnit());
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
    var geometryRepresentation = new LineString(translateToOpenlayersCoordinates(turfCircle.geometry.coordinates[0]));
    var billboard = new Feature({
        geometry: geometryRepresentation,
    });
    billboard.setId(id);
    billboard.set('locationId', model.get('locationId'));
    var color = model.get('color');
    var iconStyle = new Style({
        stroke: new Stroke({
            color: isInteractive ? contrastingColor : color ? color : '#914500',
            width: isInteractive ? 6 : 4,
        }),
    });
    billboard.setStyle(iconStyle);
    var vectorSource = new VectorSource({
        features: [billboard],
    });
    var vectorLayer = new VectorLayer({
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
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2lyY2xlLWRpc3BsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Zpc3VhbGl6YXRpb24vbWFwcy9vcGVubGF5ZXJzL2NpcmNsZS1kaXNwbGF5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsU0FBUyxJQUFJLGFBQWEsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUNwRCxPQUFPLEVBQUUsTUFBTSxJQUFJLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsTUFBTSxJQUFJLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUNoRCxPQUFPLE9BQU8sTUFBTSxZQUFZLENBQUE7QUFDaEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFeEMsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUN4RCxPQUFPLGFBQWEsTUFBTSw4QkFBOEIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNqRSxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQTtBQUNsQyxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFFdkUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOERBQThELENBQUE7QUFDL0YsTUFBTSxVQUFV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QUE7SUFDNUMsV0FBVyxDQUFDLEtBQUssRUFBRSxxQ0FBcUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNuRSxRQUFRLEVBQUUsQ0FBQTtBQUNaLENBQUMsQ0FBQTtBQUNELE1BQU0sQ0FBQyxJQUFNLHVCQUF1QixHQUFHLFVBQUMsRUFVdkM7UUFUQyxHQUFHLFNBQUEsRUFDSCxLQUFLLFdBQUEsRUFDTCxhQUFhLG1CQUFBLEVBQ2IsV0FBVyxpQkFBQTtJQU9YLG9CQUFvQixDQUFDLEVBQUUsR0FBRyxLQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsYUFBYSxlQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsQ0FBQyxDQUFBO0lBQ2hFLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxPQUFPO1lBQ0wsSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLGdCQUFnQixDQUFDO29CQUNmLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFO29CQUNqQixFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDO2lCQUN4QyxDQUFDLENBQUE7WUFDSixDQUFDO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDaEIsT0FBTyxtQkFBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBMaW5lU3RyaW5nLCBDaXJjbGUgfSBmcm9tICdvbC9nZW9tJ1xuaW1wb3J0IHsgdHJhbnNmb3JtIGFzIHByb2pUcmFuc2Zvcm0gfSBmcm9tICdvbC9wcm9qJ1xuaW1wb3J0IHsgVmVjdG9yIGFzIFZlY3RvclNvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IFZlY3RvciBhcyBWZWN0b3JMYXllciB9IGZyb20gJ29sL2xheWVyJ1xuaW1wb3J0IEZlYXR1cmUgZnJvbSAnb2wvRmVhdHVyZSdcbmltcG9ydCB7IFN0cm9rZSwgU3R5bGUgfSBmcm9tICdvbC9zdHlsZSdcbmltcG9ydCBNYXAgZnJvbSAnb2wvTWFwJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyByZW1vdmVPbGREcmF3aW5nIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IERpc3RhbmNlVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vanMvRGlzdGFuY2VVdGlscydcbmltcG9ydCB7IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSB9IGZyb20gJy4uL2RyYXdpbmctYW5kLWRpc3BsYXknXG5pbXBvcnQgKiBhcyBUdXJmIGZyb20gJ0B0dXJmL3R1cmYnXG5pbXBvcnQgVHVyZkNpcmNsZSBmcm9tICdAdHVyZi9jaXJjbGUnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgVHJhbnNsYXRpb24gfSBmcm9tICcuLi9pbnRlcmFjdGlvbnMucHJvdmlkZXInXG5pbXBvcnQgeyBjb250cmFzdGluZ0NvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L2xvY2F0aW9uL2xvY2F0aW9uLWNvbG9yLXNlbGVjdG9yJ1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZUZyb21PcGVubGF5ZXJzQ29vcmRpbmF0ZShjb29yZDogYW55KSB7XG4gIHJldHVybiBwcm9qVHJhbnNmb3JtKFxuICAgIFtOdW1iZXIoY29vcmRbMF0pLCBOdW1iZXIoY29vcmRbMV0pXSxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpLFxuICAgICdFUFNHOjQzMjYnXG4gIClcbn1cbmZ1bmN0aW9uIHRyYW5zbGF0ZVRvT3BlbmxheWVyc0Nvb3JkaW5hdGUoY29vcmQ6IGFueSkge1xuICByZXR1cm4gcHJvalRyYW5zZm9ybShcbiAgICBbTnVtYmVyKGNvb3JkWzBdKSwgTnVtYmVyKGNvb3JkWzFdKV0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG59XG5mdW5jdGlvbiB0cmFuc2xhdGVUb09wZW5sYXllcnNDb29yZGluYXRlcyhjb29yZHM6IGFueSkge1xuICBjb25zdCBjb29yZGluYXRlcyA9IFtdIGFzIGFueVtdXG4gIGNvb3Jkcy5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICBjb29yZGluYXRlcy5wdXNoKHRyYW5zbGF0ZVRvT3BlbmxheWVyc0Nvb3JkaW5hdGUoaXRlbSkpXG4gIH0pXG4gIHJldHVybiBjb29yZGluYXRlc1xufVxuY29uc3QgbW9kZWxUb0NpcmNsZSA9ICh7IG1vZGVsLCBtYXAgfTogeyBtb2RlbDogYW55OyBtYXA6IGFueSB9KSA9PiB7XG4gIGlmIChtb2RlbC5nZXQoJ2xvbicpID09PSB1bmRlZmluZWQgfHwgbW9kZWwuZ2V0KCdsYXQnKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBDaXJjbGUoXG4gICAgdHJhbnNsYXRlVG9PcGVubGF5ZXJzQ29vcmRpbmF0ZShbbW9kZWwuZ2V0KCdsb24nKSwgbW9kZWwuZ2V0KCdsYXQnKV0pLFxuICAgIERpc3RhbmNlVXRpbHMuZ2V0RGlzdGFuY2VJbk1ldGVycyhcbiAgICAgIG1vZGVsLmdldCgncmFkaXVzJyksXG4gICAgICBtb2RlbC5nZXQoJ3JhZGl1c1VuaXRzJylcbiAgICApIC8gbWFwLmdldE1hcCgpLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCkuZ2V0TWV0ZXJzUGVyVW5pdCgpXG4gIClcbiAgcmV0dXJuIHJlY3RhbmdsZVxufVxuZXhwb3J0IGNvbnN0IGRyYXdDaXJjbGUgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICByZWN0YW5nbGUsXG4gIGlkLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICByZWN0YW5nbGU6IGFueVxuICBpZDogc3RyaW5nXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbn0pID0+IHtcbiAgaWYgKCFyZWN0YW5nbGUpIHtcbiAgICAvLyBoYW5kbGVzIGNhc2Ugd2hlcmUgbW9kZWwgY2hhbmdlcyB0byBlbXB0eSB2YXJzIGFuZCB3ZSBkb24ndCB3YW50IHRvIGRyYXcgYW55bW9yZVxuICAgIHJldHVyblxuICB9XG4gIGlmICh0cmFuc2xhdGlvbikge1xuICAgIHJlY3RhbmdsZS50cmFuc2xhdGUodHJhbnNsYXRpb24ubG9uZ2l0dWRlLCB0cmFuc2xhdGlvbi5sYXRpdHVkZSlcbiAgfVxuICBjb25zdCBwb2ludCA9IFR1cmYucG9pbnQoXG4gICAgdHJhbnNsYXRlRnJvbU9wZW5sYXllcnNDb29yZGluYXRlKHJlY3RhbmdsZS5nZXRDZW50ZXIoKSlcbiAgKVxuICBjb25zdCB0dXJmQ2lyY2xlID0gVHVyZkNpcmNsZShcbiAgICBwb2ludCxcbiAgICByZWN0YW5nbGUuZ2V0UmFkaXVzKCkgKlxuICAgICAgbWFwLmdldE1hcCgpLmdldFZpZXcoKS5nZXRQcm9qZWN0aW9uKCkuZ2V0TWV0ZXJzUGVyVW5pdCgpLFxuICAgIHsgc3RlcHM6IDY0LCB1bml0czogJ21ldGVycycgfVxuICApXG4gIGNvbnN0IGdlb21ldHJ5UmVwcmVzZW50YXRpb24gPSBuZXcgTGluZVN0cmluZyhcbiAgICB0cmFuc2xhdGVUb09wZW5sYXllcnNDb29yZGluYXRlcyh0dXJmQ2lyY2xlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKVxuICApXG4gIGNvbnN0IGJpbGxib2FyZCA9IG5ldyBGZWF0dXJlKHtcbiAgICBnZW9tZXRyeTogZ2VvbWV0cnlSZXByZXNlbnRhdGlvbixcbiAgfSlcbiAgYmlsbGJvYXJkLnNldElkKGlkKVxuICBiaWxsYm9hcmQuc2V0KCdsb2NhdGlvbklkJywgbW9kZWwuZ2V0KCdsb2NhdGlvbklkJykpXG4gIGNvbnN0IGNvbG9yID0gbW9kZWwuZ2V0KCdjb2xvcicpXG4gIGNvbnN0IGljb25TdHlsZSA9IG5ldyBTdHlsZSh7XG4gICAgc3Ryb2tlOiBuZXcgU3Ryb2tlKHtcbiAgICAgIGNvbG9yOiBpc0ludGVyYWN0aXZlID8gY29udHJhc3RpbmdDb2xvciA6IGNvbG9yID8gY29sb3IgOiAnIzkxNDUwMCcsXG4gICAgICB3aWR0aDogaXNJbnRlcmFjdGl2ZSA/IDYgOiA0LFxuICAgIH0pLFxuICB9KVxuICBiaWxsYm9hcmQuc2V0U3R5bGUoaWNvblN0eWxlKVxuICBjb25zdCB2ZWN0b3JTb3VyY2UgPSBuZXcgVmVjdG9yU291cmNlKHtcbiAgICBmZWF0dXJlczogW2JpbGxib2FyZF0sXG4gIH0pXG4gIGxldCB2ZWN0b3JMYXllciA9IG5ldyBWZWN0b3JMYXllcih7XG4gICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gIH0pXG4gIHZlY3RvckxheWVyLnNldCgnaWQnLCBpZClcbiAgY29uc3QgbWFwUmVmID0gbWFwLmdldE1hcCgpIGFzIE1hcFxuICByZW1vdmVPbGREcmF3aW5nKHsgbWFwOiBtYXBSZWYsIGlkIH0pXG4gIG1hcFJlZi5hZGRMYXllcih2ZWN0b3JMYXllcilcbn1cbmNvbnN0IHVwZGF0ZVByaW1pdGl2ZSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIGlkLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBpZDogc3RyaW5nXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbn0pID0+IHtcbiAgY29uc3QgY2lyY2xlID0gbW9kZWxUb0NpcmNsZSh7IG1vZGVsLCBtYXAgfSlcbiAgLy8gbWFrZSBzdXJlIHRoZSBjdXJyZW50IG1vZGVsIGhhcyB3aWR0aCBhbmQgaGVpZ2h0IGJlZm9yZSBkcmF3aW5nXG4gIGlmIChjaXJjbGUgJiYgIV8uaXNVbmRlZmluZWQoY2lyY2xlKSkge1xuICAgIGRyYXdDaXJjbGUoe1xuICAgICAgbW9kZWwsXG4gICAgICByZWN0YW5nbGU6IGNpcmNsZSxcbiAgICAgIG1hcCxcbiAgICAgIGlkLFxuICAgICAgaXNJbnRlcmFjdGl2ZSxcbiAgICAgIHRyYW5zbGF0aW9uLFxuICAgIH0pXG4gIH1cbn1cbmNvbnN0IHVzZUxpc3RlblRvQmJveE1vZGVsID0gKHtcbiAgbW9kZWwsXG4gIG1hcCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW5cbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxufSkgPT4ge1xuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kZWwgJiYgbWFwKSB7XG4gICAgICAgIHVwZGF0ZVByaW1pdGl2ZSh7XG4gICAgICAgICAgbWFwLFxuICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIGlzSW50ZXJhY3RpdmUsIHRyYW5zbGF0aW9uXSlcbiAgdXNlTGlzdGVuVG8obW9kZWwsICdjaGFuZ2U6bGF0IGNoYW5nZTpsb24gY2hhbmdlOnJhZGl1cycsIGNhbGxiYWNrKVxuICBjYWxsYmFjaygpXG59XG5leHBvcnQgY29uc3QgT3BlbmxheWVyc0NpcmNsZURpc3BsYXkgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhblxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG59KSA9PiB7XG4gIHVzZUxpc3RlblRvQmJveE1vZGVsKHsgbWFwLCBtb2RlbCwgaXNJbnRlcmFjdGl2ZSwgdHJhbnNsYXRpb24gfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG1hcCAmJiBtb2RlbCkge1xuICAgICAgICByZW1vdmVPbGREcmF3aW5nKHtcbiAgICAgICAgICBtYXA6IG1hcC5nZXRNYXAoKSxcbiAgICAgICAgICBpZDogZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5KHsgbW9kZWwgfSksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LCBbbWFwLCBtb2RlbF0pXG4gIHJldHVybiA8PjwvPlxufVxuIl19