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
    var northWest = ol.proj.transform([west, north], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var northEast = ol.proj.transform([east, north], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var southWest = ol.proj.transform([west, south], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var southEast = ol.proj.transform([east, south], 'EPSG:4326', StartupDataStore.Configuration.getProjection());
    var coords = [];
    coords.push(northWest);
    coords.push(northEast);
    coords.push(southEast);
    coords.push(southWest);
    coords.push(northWest);
    var rectangle = new ol.geom.LineString(coords);
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
    var billboard = new ol.Feature({
        geometry: rectangle,
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
    return React.createElement(React.Fragment, null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmJveC1kaXNwbGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvb3BlbmxheWVycy9iYm94LWRpc3BsYXkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQzNCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFBO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQ3hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBRXZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDhEQUE4RCxDQUFBO0FBQy9GLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxLQUFVOztJQUNsQyxvQ0FBb0M7SUFDcEMsbUNBQW1DO0lBQ25DLGFBQWE7SUFDYixJQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0lBQy9DLElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7SUFDL0MsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUMzQyxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FB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blxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IG9sIGZyb20gJ29wZW5sYXllcnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHsgdmFsaWRhdGVHZW8gfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvdmFsaWRhdGlvbidcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyByZW1vdmVPbGREcmF3aW5nIH0gZnJvbSAnLi9kcmF3aW5nLWFuZC1kaXNwbGF5J1xuaW1wb3J0IHsgZ2V0SWRGcm9tTW9kZWxGb3JEaXNwbGF5IH0gZnJvbSAnLi4vZHJhd2luZy1hbmQtZGlzcGxheSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBUcmFuc2xhdGlvbiB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy5wcm92aWRlcidcbmltcG9ydCB7IGNvbnRyYXN0aW5nQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vbG9jYXRpb24tY29sb3Itc2VsZWN0b3InXG5jb25zdCBtb2RlbFRvUmVjdGFuZ2xlID0gKG1vZGVsOiBhbnkpID0+IHtcbiAgLy9lbnN1cmUgdGhhdCB0aGUgdmFsdWVzIGFyZSBudW1lcmljXG4gIC8vc28gdGhhdCB0aGUgb3BlbmxheWVyIHByb2plY3Rpb25zXG4gIC8vZG8gbm90IGZhaWxcbiAgY29uc3Qgbm9ydGggPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbWFwTm9ydGgnKSlcbiAgY29uc3Qgc291dGggPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbWFwU291dGgnKSlcbiAgbGV0IGVhc3QgPSBwYXJzZUZsb2F0KG1vZGVsLmdldCgnbWFwRWFzdCcpKVxuICBsZXQgd2VzdCA9IHBhcnNlRmxvYXQobW9kZWwuZ2V0KCdtYXBXZXN0JykpXG4gIGlmIChpc05hTihub3J0aCkgfHwgaXNOYU4oc291dGgpIHx8IGlzTmFOKGVhc3QpIHx8IGlzTmFOKHdlc3QpKSB7XG4gICAgLy8gdGhpcy5kZXN0cm95UHJpbWl0aXZlKClcbiAgICByZXR1cm5cbiAgfVxuICAvLyBJZiBzb3V0aCBpcyBncmVhdGVyIHRoYW4gbm9ydGgsXG4gIC8vIHJlbW92ZSBzaGFwZSBmcm9tIG1hcFxuICBpZiAoc291dGggPiBub3J0aCkge1xuICAgIC8vIHRoaXMuZGVzdHJveVByaW1pdGl2ZSgpXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKFxuICAgIHZhbGlkYXRlR2VvKFxuICAgICAgJ3BvbHlnb24nLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgICBbd2VzdCwgbm9ydGhdLFxuICAgICAgICBbZWFzdCwgbm9ydGhdLFxuICAgICAgICBbd2VzdCwgc291dGhdLFxuICAgICAgICBbZWFzdCwgc291dGhdLFxuICAgICAgICBbd2VzdCwgbm9ydGhdLFxuICAgICAgXSlcbiAgICApPy5lcnJvclxuICApIHtcbiAgICByZXR1cm5cbiAgfVxuICAvLyBJZiB3ZSBhcmUgY3Jvc3NpbmcgdGhlIGRhdGUgbGluZSwgd2UgbXVzdCBnbyBvdXRzaWRlIFstMTgwLCAxODBdXG4gIC8vIGZvciBvcGVubGF5ZXJzIHRvIGRyYXcgY29ycmVjdGx5LiBUaGlzIG1lYW5zIHdlIGNhbid0IGRyYXcgYm94ZXNcbiAgLy8gdGhhdCBlbmNvbXBhc3MgbW9yZSB0aGFuIGhhbGYgdGhlIHdvcmxkLiBUaGlzIGFjdHVhbGx5IG1hdGNoZXNcbiAgLy8gaG93IHRoZSBiYWNrZW5kIHNlYXJjaGVzIGFueXdheS5cbiAgaWYgKGVhc3QgLSB3ZXN0IDwgLTE4MCkge1xuICAgIGVhc3QgKz0gMzYwXG4gIH0gZWxzZSBpZiAoZWFzdCAtIHdlc3QgPiAxODApIHtcbiAgICB3ZXN0ICs9IDM2MFxuICB9XG4gIGNvbnN0IG5vcnRoV2VzdCA9IG9sLnByb2oudHJhbnNmb3JtKFxuICAgIFt3ZXN0LCBub3J0aF0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG4gIGNvbnN0IG5vcnRoRWFzdCA9IG9sLnByb2oudHJhbnNmb3JtKFxuICAgIFtlYXN0LCBub3J0aF0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG4gIGNvbnN0IHNvdXRoV2VzdCA9IG9sLnByb2oudHJhbnNmb3JtKFxuICAgIFt3ZXN0LCBzb3V0aF0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG4gIGNvbnN0IHNvdXRoRWFzdCA9IG9sLnByb2oudHJhbnNmb3JtKFxuICAgIFtlYXN0LCBzb3V0aF0sXG4gICAgJ0VQU0c6NDMyNicsXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKVxuICApXG4gIGNvbnN0IGNvb3JkcyA9IFtdXG4gIGNvb3Jkcy5wdXNoKG5vcnRoV2VzdClcbiAgY29vcmRzLnB1c2gobm9ydGhFYXN0KVxuICBjb29yZHMucHVzaChzb3V0aEVhc3QpXG4gIGNvb3Jkcy5wdXNoKHNvdXRoV2VzdClcbiAgY29vcmRzLnB1c2gobm9ydGhXZXN0KVxuICBjb25zdCByZWN0YW5nbGUgPSBuZXcgb2wuZ2VvbS5MaW5lU3RyaW5nKGNvb3JkcylcbiAgcmV0dXJuIHJlY3RhbmdsZVxufVxuZXhwb3J0IGNvbnN0IGRyYXdCYm94ID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgcmVjdGFuZ2xlLFxuICBpZCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgcmVjdGFuZ2xlOiBhbnlcbiAgaWQ6IHN0cmluZ1xuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhblxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG59KSA9PiB7XG4gIGlmICghcmVjdGFuZ2xlKSB7XG4gICAgLy8gaGFuZGxlcyBjYXNlIHdoZXJlIG1vZGVsIGNoYW5nZXMgdG8gZW1wdHkgdmFycyBhbmQgd2UgZG9uJ3Qgd2FudCB0byBkcmF3IGFueW1vcmVcbiAgICByZXR1cm5cbiAgfVxuICBpZiAodHJhbnNsYXRpb24pIHtcbiAgICByZWN0YW5nbGUudHJhbnNsYXRlKHRyYW5zbGF0aW9uLmxvbmdpdHVkZSwgdHJhbnNsYXRpb24ubGF0aXR1ZGUpXG4gIH1cbiAgY29uc3QgYmlsbGJvYXJkID0gbmV3IG9sLkZlYXR1cmUoe1xuICAgIGdlb21ldHJ5OiByZWN0YW5nbGUsXG4gIH0pXG4gIGJpbGxib2FyZC5zZXRJZChpZClcbiAgYmlsbGJvYXJkLnNldCgnbG9jYXRpb25JZCcsIG1vZGVsLmdldCgnbG9jYXRpb25JZCcpKVxuICBjb25zdCBjb2xvciA9IG1vZGVsLmdldCgnY29sb3InKVxuICBjb25zdCBpY29uU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoe1xuICAgIHN0cm9rZTogbmV3IG9sLnN0eWxlLlN0cm9rZSh7XG4gICAgICBjb2xvcjogaXNJbnRlcmFjdGl2ZSA/IGNvbnRyYXN0aW5nQ29sb3IgOiBjb2xvciA/IGNvbG9yIDogJyM5MTQ1MDAnLFxuICAgICAgd2lkdGg6IGlzSW50ZXJhY3RpdmUgPyA2IDogNCxcbiAgICB9KSxcbiAgfSlcbiAgYmlsbGJvYXJkLnNldFN0eWxlKGljb25TdHlsZSlcbiAgY29uc3QgdmVjdG9yU291cmNlID0gbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe1xuICAgIGZlYXR1cmVzOiBbYmlsbGJvYXJkXSxcbiAgfSlcbiAgbGV0IHZlY3RvckxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XG4gICAgc291cmNlOiB2ZWN0b3JTb3VyY2UsXG4gIH0pXG4gIHZlY3RvckxheWVyLnNldCgnaWQnLCBpZClcbiAgY29uc3QgbWFwUmVmID0gbWFwLmdldE1hcCgpIGFzIG9sLk1hcFxuICByZW1vdmVPbGREcmF3aW5nKHsgbWFwOiBtYXBSZWYsIGlkIH0pXG4gIG1hcFJlZi5hZGRMYXllcih2ZWN0b3JMYXllcilcbn1cbmNvbnN0IHVwZGF0ZVByaW1pdGl2ZSA9ICh7XG4gIG1hcCxcbiAgbW9kZWwsXG4gIGlkLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbWFwOiBhbnlcbiAgbW9kZWw6IGFueVxuICBpZDogc3RyaW5nXG4gIGlzSW50ZXJhY3RpdmU/OiBib29sZWFuXG4gIHRyYW5zbGF0aW9uPzogVHJhbnNsYXRpb25cbn0pID0+IHtcbiAgY29uc3QgcmVjdGFuZ2xlID0gbW9kZWxUb1JlY3RhbmdsZShtb2RlbClcbiAgLy8gbWFrZSBzdXJlIHRoZSBjdXJyZW50IG1vZGVsIGhhcyB3aWR0aCBhbmQgaGVpZ2h0IGJlZm9yZSBkcmF3aW5nXG4gIGlmIChcbiAgICByZWN0YW5nbGUgJiZcbiAgICAhXy5pc1VuZGVmaW5lZChyZWN0YW5nbGUpICYmXG4gICAgbW9kZWwuZ2V0KCdub3J0aCcpICE9PSBtb2RlbC5nZXQoJ3NvdXRoJykgJiZcbiAgICBtb2RlbC5nZXQoJ2Vhc3QnKSAhPT0gbW9kZWwuZ2V0KCd3ZXN0JylcbiAgKSB7XG4gICAgZHJhd0Jib3goeyByZWN0YW5nbGUsIG1hcCwgbW9kZWwsIGlkLCBpc0ludGVyYWN0aXZlLCB0cmFuc2xhdGlvbiB9KVxuICAgIC8vb25seSBjYWxsIHRoaXMgaWYgdGhlIG1vdXNlIGJ1dHRvbiBpc24ndCBwcmVzc2VkLCBpZiB3ZSB0cnkgdG8gZHJhdyB0aGUgYm9yZGVyIHdoaWxlIHNvbWVvbmUgaXMgZHJhZ2dpbmdcbiAgICAvL3RoZSBmaWxsZWQgaW4gc2hhcGUgd29uJ3Qgc2hvdyB1cFxuICAgIC8vIGlmICghdGhpcy5idXR0b25QcmVzc2VkKSB7XG4gICAgLy8gICBkcmF3Qm9yZGVyZWRSZWN0YW5nbGUocmVjdGFuZ2xlKVxuICAgIC8vIH1cbiAgfVxufVxuY29uc3QgdXNlTGlzdGVuVG9CYm94TW9kZWwgPSAoe1xuICBtb2RlbCxcbiAgbWFwLFxuICBpc0ludGVyYWN0aXZlLFxuICB0cmFuc2xhdGlvbixcbn06IHtcbiAgbW9kZWw6IGFueVxuICBtYXA6IGFueVxuICBpc0ludGVyYWN0aXZlPzogYm9vbGVhblxuICB0cmFuc2xhdGlvbj86IFRyYW5zbGF0aW9uXG59KSA9PiB7XG4gIGNvbnN0IGNhbGxiYWNrID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtb2RlbCAmJiBtYXApIHtcbiAgICAgICAgdXBkYXRlUHJpbWl0aXZlKHtcbiAgICAgICAgICBtYXAsXG4gICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICAgIGlzSW50ZXJhY3RpdmUsXG4gICAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LCBbbW9kZWwsIG1hcCwgaXNJbnRlcmFjdGl2ZSwgdHJhbnNsYXRpb25dKVxuICB1c2VMaXN0ZW5UbyhcbiAgICBtb2RlbCxcbiAgICAnY2hhbmdlOm1hcE5vcnRoIGNoYW5nZTptYXBTb3V0aCBjaGFuZ2U6bWFwRWFzdCBjaGFuZ2U6bWFwV2VzdCcsXG4gICAgY2FsbGJhY2tcbiAgKVxuICBjYWxsYmFjaygpXG59XG5leHBvcnQgY29uc3QgT3BlbmxheWVyc0Jib3hEaXNwbGF5ID0gKHtcbiAgbWFwLFxuICBtb2RlbCxcbiAgaXNJbnRlcmFjdGl2ZSxcbiAgdHJhbnNsYXRpb24sXG59OiB7XG4gIG1hcDogYW55XG4gIG1vZGVsOiBhbnlcbiAgaXNJbnRlcmFjdGl2ZT86IGJvb2xlYW5cbiAgdHJhbnNsYXRpb24/OiBUcmFuc2xhdGlvblxufSkgPT4ge1xuICB1c2VMaXN0ZW5Ub0Jib3hNb2RlbCh7IG1hcCwgbW9kZWwsIGlzSW50ZXJhY3RpdmUsIHRyYW5zbGF0aW9uIH0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChtYXAgJiYgbW9kZWwpIHtcbiAgICAgICAgcmVtb3ZlT2xkRHJhd2luZyh7XG4gICAgICAgICAgbWFwOiBtYXAuZ2V0TWFwKCksXG4gICAgICAgICAgaWQ6IGdldElkRnJvbU1vZGVsRm9yRGlzcGxheSh7IG1vZGVsIH0pLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21hcCwgbW9kZWxdKVxuICByZXR1cm4gPD48Lz5cbn1cbiJdfQ==