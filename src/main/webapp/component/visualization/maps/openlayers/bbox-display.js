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
import { LineString } from 'ol/geom';
import { transform as projTransform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Stroke, Style } from 'ol/style';
import _ from 'underscore';
import { validateGeo } from '../../../../react-component/utils/validation';
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook';
import { removeOldDrawing } from './drawing-and-display';
import { getIdFromModelForDisplay } from '../drawing-and-display';
import { StartupDataStore } from '../../../../js/model/Startup/startup';
import { contrastingColor } from '../../../../react-component/location/location-color-selector';
var modelToRectangle = function (model) {
    var _a;
    //ensure that the values are numeric
    //so that the openlayer projections
    //do not fail
    var north = parseFloat(model.get('mapNorth'));
    var south = parseFloat(model.get('mapSouth'));
    var east = parseFloat(model.get('mapEast'));
    var west = parseFloat(model.get('mapWest'));
    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
        // this.destroyPrimitive()
        return;
    }
    // If south is greater than north,
    // remove shape from map
    if (south > north) {
        // this.destroyPrimitive()
        return;
    }
    if ((_a = validateGeo('polygon', JSON.stringify([
        [west, north],
        [east, north],
        [west, south],
        [east, south],
        [west, north],
    ]))) === null || _a === void 0 ? void 0 : _a.error) {
        return;
    }
    // If we are crossing the date line, we must go outside [-180, 180]
    // for openlayers to draw correctly. This means we can't draw boxes
    // that encompass more than half the world. This actually matches
    // how the backend searches anyway.
    if (east - west < -180) {
        east += 360;
    }
    else if (east - west > 180) {
        west += 360;
    }
    var northWest = projTransform([west, north], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var northEast = projTransform([east, north], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var southWest = projTransform([west, south], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var southEast = projTransform([east, south], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var coords = [];
    coords.push(northWest);
    coords.push(northEast);
    coords.push(southEast);
    coords.push(southWest);
    coords.push(northWest);
    var rectangle = new LineString(coords);
    return rectangle;
};
export var drawBbox = function (_a) {
    var map = _a.map, model = _a.model, rectangle = _a.rectangle, id = _a.id, isInteractive = _a.isInteractive, translation = _a.translation;
    if (!rectangle) {
        // handles case where model changes to empty vars and we don't want to draw anymore
        return;
    }
    if (translation) {
        rectangle.translate(translation.longitude, translation.latitude);
    }
    var billboard = new Feature({
        geometry: rectangle,
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
    var rectangle = modelToRectangle(model);
    // make sure the current model has width and height before drawing
    if (rectangle &&
        !_.isUndefined(rectangle) &&
        model.get('north') !== model.get('south') &&
        model.get('east') !== model.get('west')) {
        drawBbox({ rectangle: rectangle, map: map, model: model, id: id, isInteractive: isInteractive, translation: translation });
        //only call this if the mouse button isn't pressed, if we try to draw the border while someone is dragging
        //the filled in shape won't show up
        // if (!this.buttonPressed) {
        //   drawBorderedRectangle(rectangle)
        // }
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
    useListenTo(model, 'change:mapNorth change:mapSouth change:mapEast change:mapWest', callback);
    callback();
};
export var OpenlayersBboxDisplay = function (_a) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmJveC1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvb3BlbmxheWVycy9iYm94LWRpc3BsYXkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDcEMsT0FBTyxFQUFFLFNBQVMsSUFBSSxhQUFhLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDcEQsT0FBTyxFQUFFLE1BQU0sSUFBSSxZQUFZLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDbEQsT0FBTyxFQUFFLE1BQU0sSUFBSSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFDaEQsT0FBTyxPQUFPLE1BQU0sWUFBWSxDQUFBO0FBQ2hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBR3hDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQ3hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBRXZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDhEQUE4RCxDQUFBO0FBQy9GLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxLQUFVOztJQUNsQyxvQ0FBb0M7SUFDcEMsbUNBQW1DO0lBQ25DLGFBQWE7SUFDYixJQUFNLEtBQUss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SCxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNoQixPQUFPLG1CQUFLLENBQUE7QUFDZCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IExpbmVTdHJpbmcgfSBmcm9tICdvbC9nZW9tJ1xuaW1wb3J0IHsgdHJhbnNmb3JtIGFzIHByb2pUcmFuc2Zvcm0gfSBmcm9tICdvbC9wcm9qJ1xuaW1wb3J0IHsgVmVjdG9yIGFzIFZlY3RvclNvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IFZlY3RvciBhcyBWZWN0b3JMYXllciB9IGZyb20gJ29sL2xheWVyJ1xuaW1wb3J0IEZlYXR1cmUgZnJvbSAnb2wvRmVhdHVyZSdcbmltcG9ydCB7IFN0cm9rZSwgU3R5bGUgfSBmcm9tICdvbC9zdHlsZSdcbmltcG9ydCBNYXAgZnJvbSAnb2wvTWFwJ1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyByZW1vdmVPbGREcmF3aW5nIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHsgZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5IH0gZnJvbSAnLi4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBUcmFuc2xhdGlvbiB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbmltcG9ydCB7IGNvbnRyYXN0aW5nQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vbG9jYXRpb24tY29sb3Itc2VsZWN0b3InXG5jb25zdCBtb2RlbFRvUmVjdGFuZ2xlID0gKG1vZGVsOiBhbnkpID0+IHtcbiAgLy9lbnN1cmUgdGhhdCB0aGUgdmFsdWVzIGFyZSBudW1lcmljXG4gIC8vc28gdGhhdCB0aGUgb3BlbmxheWVyIHByb2plY3Rpb25zXG4gIC8vZG8gbm90IGZhaWxcbiAgY29uc3Qgbm9ydGggPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbWFwTm9ydGgnKSlcbiAgY29uc3Qgc291dGggPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbWFwU291dGgnKSlcbiAgbGV0IGVhc3QgPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbWFwRWFzdCcpKVxuICBsZXQgd2VzdCA9IHBhcnNlRmxvYXQobW9kZWwuZ2V0KCdtYXBXZXN0JykpXG4gIGlmIChpc05hTihub3J0aCkgfHwgaXNOYU4oc291dGgpIHx8IGlzTmFOKGVhc3QpIHx8IGlzTmFOKHdlc3QpKSB7XG4gICAgLy8gdGhpcy5kZXN0cm95UHJpbWl0aXZlKClcbiAgICByZXR1cm5cbiAgfVxuICAvLyBJZiBzb3V0aCBpcyBncmVhdGVyIHRoYW4gbm9ydGgsXG4gIC8vIHJlbW92ZSBzaGFwZSBmcm9tIG1hcFxuICBpZiAoc291dGggPiBub3J0aCkge1xuICAgIC8vIHRoaXMuZGVzdHJveVByaW1pdGl2ZSgpXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKFxuICAgIHZhbGlkYXRlR2VvKFxuICAgICAgJ3BvbHlnb24nLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgICBbd2VzdCwgbm9ydGhdLFxuICAgICAgICBbZWFzdCwgbm9ydGhdLFxuICAgICAgICBbd2VzdCwgc291dGhdLFxuICAgICAgICBbZWFzdCwgc291dGhdLFxuICAgICAgICBbd2VzdCwgbm9ydGhdLFxuICAgICAgXSlcbiAgICApPy5lcnJvclxuICApIHtcbiAgICByZXR1cm5cbiAgfVxuICAvLyBJZiB3ZSBhcmUgY3Jvc3NpbmcgdGhlIGRhdGUgbGluZSwgd2UgbXVzdCBnbyBvdXRzaWRlIFstMTgwLCAxODBdXG4gIC8vIGZvciBvcGVubGF5ZXJzIHRvIGRyYXcgY29ycmVjdGx5LiBUaGlzIG1lYW5zIHdlIGNhbid0IGRyYXcgYm94ZXNcbiAgLy8gdGhhdCBlbmNvbXBhc3MgbW9yZSB0aGFuIGhhbGYgdGhlIHdvcmxkLiBUaGlzIGFjdHVhbGx5IG1hdGNoZXNcbiAgLy8gaG93IHRoZSBiYWNrZW5kIHNlYXJjaGVzIGFueXdheS5cbiAgaWYgKGVhc3QgLSB3ZXN0IDwgLTE4MCkge1xuICAgIGVhc3QgKz0gMzYwXG4gIH0gZWxzZSBpZiAoZWFzdCAtIHdlc3QgPiAxODApIHtcbiAgICB3ZXN0ICs9IDM2MFxuICB9XG4gIGNvbnN0IG5vcnRoV2VzdCA9IHByb2pUcmFuc2Zvcm0oXG4gICAgW3dlc3QsIG5vcnRoXSxcbiAgICAnRVBTRzo0MzI2JyxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gIClcbiAgY29uc3Qgbm9ydGhFYXN0ID0gcHJvalRyYW5zZm9ybShcbiAgICBbZWFzdCwgbm9ydGhdLFxuICAgICdFUFNHOjQzMjYnLFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgKVxuICBjb25zdCBzb3V0aFdlc3QgPSBwcm9qVHJhbnNmb3JtKFxuICAgIFt3ZXN0LCBzb3V0aF0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG4gIGNvbnN0IHNvdXRoRWFzdCA9IHByb2pUcmFuc2Zvcm0oXG4gICAgW2Vhc3QsIHNvdXRoXSxcbiAgICAnRVBTRzo0MzI2JyxcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gIClcbiAgY29uc3QgY29vcmRzID0gW11cbiAgY29vcmRzLnB1c2gobm9ydGhXZXN0KVxuICBjb29yZHMucHVzaChub3J0aEVhc3QpXG4gIGNvb3Jkcy5wdXNoKHNvdXRoRWFzdClcbiAgY29vcmRzLnB1c2goc291dGhXZXN0KVxuICBjb29yZHMucHVzaChub3J0aFdlc3QpXG4gIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBMaW5lU3RyaW5nKGNvb3JkcylcbiAgcmV0dXJuIHJlY3RhbmdsZVxufVxuZXhwb3J0IGNvbnN0IGRyYXdCYm94ID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgcmVjdGFuZ2xlLFxuICBpZCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgcmVjdGFuZ2xlOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhblxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG59KSA9PiB7XG4gIGlmICghcmVjdGFuZ2xlKSB7XG4gICAgLy8gaGFuZGxlcyBjYXNlIHdoZXJlIG1vZGVsIGNoYW5nZXMgdG8gZW1wdHkgdmFycyBhbmQgd2UgZG9uJ3Qgd2FudCB0byBkcmF3IGFueW1vcmVcbiAgICByZXR1cm5cbiAgfVxuICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICByZWN0YW5nbGUudHJhbnNsYXRlKHRyYW5zbGF0aW9uLmxvbmdpdHVkZSwgdHJhbnNsYXRpb24ubGF0aXR1ZGUpXG4gIH1cbiAgY29uc3QgYmlsbGJvYXJkID0gbmV3IEZlYXR1cmUoe1xuICAgIGdlb21ldHJ5OiByZWN0YW5nbGUsXG4gIH0pXG4gIGJpbGxib2FyZC5zZXRJZChpZClcbiAgYmlsbGJvYXJkLnNldCgnbG9jYXRpb25JZCcsIG1vZGVsLmdldCgnbG9jYXRpb25JZCcpKVxuICBjb25zdCBjb2xvciA9IG1vZGVsLmdldCgnY29sb3InKVxuICBjb25zdCBpY29uU3R5bGUgPSBuZXcgU3R5bGUoe1xuICAgIHN0cm9rZTogbmV3IFN0cm9rZSh7XG4gICAgICBjb2xvcjogaXNJbnRlcmFjdGl2ZSA/IGNvbnRyYXN0aW5nQ29sb3IgOiBjb2xvciA/IGNvbG9yIDogJyM5MTQ1MDAnLFxuICAgICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICB9KSxcbiAgfSlcbiAgYmlsbGJvYXJkLnNldFN0eWxlKGljb25TdHlsZSlcbiAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IFZlY3RvclNvdXJjZSh7XG4gICAgZmVhdHVyZXM6IFtiaWxsYm9hcmRdLFxuICB9KVxuICBsZXQgdmVjdG9yTGF5ZXIgPSBuZXcgVmVjdG9yTGF5ZXIoe1xuICAgIHNvdXJjZTogdmVjdG9yU291cmNlLFxuICB9KVxuICB2ZWN0b3JMYXllci5zZXQoJ2lkJywgaWQpXG4gIGNvbnN0IG1hcFJlZiA9IG1hcC5nZXRNYXAoKSBhcyBNYXBcbiAgcmVtb3ZlT2xkRHJhd2luZyh7IG1hcDogbWFwUmVmLCBpZCB9KVxuICBtYXBSZWYuYWRkTGF5ZXIodmVjdG9yTGF5ZXIpXG59XG5jb25zdCB1cGRhdGVQcmltaXRpdmUgPSAoe1xuICBtYXAsXG4gIG1vZGVsLFxuICBpZCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhblxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG59KSA9PiB7XG4gIGNvbnN0IHJlY3RhbmdsZSA9IG1vZGVsVG9SZWN0YW5nbGUobW9kZWwpXG4gIC8vIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBtb2RlbCBoYXMgd2lkdGggYW5kIGhlaWdodCBiZWZvcmUgZHJhd2luZ1xuICBpZiAoXG4gICAgcmVjdGFuZ2xlICYmXG4gICAgIV8uaXNVbmRlZmluZWQocmVjdGFuZ2xlKSAmJlxuICAgIG1vZGVsLmdldCgnbm9ydGgnKSAhPT0gbW9kZWwuZ2V0KCdzb3V0aCcpICYmXG4gICAgbW9kZWwuZ2V0KCdlYXN0JykgIT09IG1vZGVsLmdldCgnd2VzdCcpXG4gICkge1xuICAgIGRyYXdCYm94KHsgcmVjdGFuZ2xlLCBtYXAsIG1vZGVsLCBpZCwgaXNJbnRlcmFjdGl2ZSwgdHJhbnNsYXRpb24gfSlcbiAgICAvL29ubHkgY2FsbCB0aGlzIGlmIHRoZSBtb3VzZSBidXR0b24gaXNuJ3QgcHJlc3NlZCwgaWYgd2UgdHJ5IHRvIGRyYXcgdGhlIGJvcmRlciB3aGlsZSBzb21lb25lIGlzIGRyYWdnaW5nXG4gICAgLy90aGUgZmlsbGVkIGluIHNoYXBlIHdvbid0IHNob3cgdXBcbiAgICAvLyBpZiAoIXRoaXMuYnV0dG9uUHJlc3NlZCkge1xuICAgIC8vICAgZHJhd0JvcmRlcmVkUmVjdGFuZ2xlKHJlY3RhbmdsZSlcbiAgICAvLyB9XG4gIH1cbn1cbmNvbnN0IHVzZUxpc3RlblRvQmJveE1vZGVsID0gKHtcbiAgbW9kZWwsXG4gIG1hcCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1vZGVsOiBhbnlcbiAgbWFwOiBhbnlcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW5cbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxufSkgPT4ge1xuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kZWwgJiYgbWFwKSB7XG4gICAgICAgIHVwZGF0ZVByaW1pdGl2ZSh7XG4gICAgICAgICAgbWFwLFxuICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgICBpc0ludGVyYWN0aXZlLFxuICAgICAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsLCBtYXAsIGlzSW50ZXJhY3RpdmUsIHRyYW5zbGF0aW9uXSlcbiAgdXNlTGlzdGVuVG8oXG4gICAgbW9kZWwsXG4gICAgJ2NoYW5nZTptYXBOb3J0aCBjaGFuZ2U6bWFwU291dGggY2hhbmdlOm1hcEVhc3QgY2hhbmdlOm1hcFdlc3QnLFxuICAgIGNhbGxiYWNrXG4gIClcbiAgY2FsbGJhY2soKVxufVxuZXhwb3J0IGNvbnN0IE9wZW5sYXllcnNCYm94RGlzcGxheSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIGlzSW50ZXJhY3RpdmUsXG4gIHRyYW5zbGF0aW9uLFxufToge1xuICBtYXA6IGFueVxuICBtb2RlbDogYW55XG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbn0pID0+IHtcbiAgdXNlTGlzdGVuVG9CYm94TW9kZWwoeyBtYXAsIG1vZGVsLCBpc0ludGVyYWN0aXZlLCB0cmFuc2xhdGlvbiB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobWFwICYmIG1vZGVsKSB7XG4gICAgICAgIHJlbW92ZU9sZERyYXdpbmcoe1xuICAgICAgICAgIG1hcDogbWFwLmdldE1hcCgpLFxuICAgICAgICAgIGlkOiBnZXRJZEZyb21Nb2RlbEZvckRpc3BsYXkoeyBtb2RlbCB9KSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sIFttYXAsIG1vZGVsXSlcbiAgcmV0dXJuIDw+PC8+XG59XG4iXX0=