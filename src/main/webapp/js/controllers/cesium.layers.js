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
/*jshint newcap: false, bitwise: false */
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium';
import url from 'url';
import { addLayer, shiftLayers, getShift } from './cesium.layer-ordering';
import _ from 'underscore';
var DEFAULT_HTTPS_PORT = 443;
var DEFAULT_HTTP_PORT = 80;
export var CesiumImageryProviderTypes = {
    OSM: Cesium.createOpenStreetMapImageryProvider,
    AGM: Cesium.ArcGisMapServerImageryProvider,
    BM: Cesium.BingMapsImageryProvider,
    WMS: Cesium.WebMapServiceImageryProvider,
    WMT: Cesium.WebMapTileServiceImageryProvider,
    TMS: Cesium.createTileMapServiceImageryProvider,
    GE: Cesium.GoogleEarthImageryProvider,
    CT: Cesium.CesiumTerrainProvider,
    AGS: Cesium.ArcGisImageServerTerrainProvider,
    VRW: Cesium.VRTheWorldTerrainProvider,
    SI: Cesium.SingleTileImageryProvider,
};
import { Layers } from './layers';
import Backbone from 'backbone';
import { StartupDataStore } from '../model/Startup/startup';
var CesiumLayers = /** @class */ (function () {
    function CesiumLayers(_a) {
        var collection = _a.collection;
        this.backboneModel = new Backbone.Model({});
        this.isMapCreated = false;
        this.layerOrder = [];
        this.layerForCid = {};
        var layerPrefs = collection;
        this.layers = new Layers(layerPrefs);
        this.backboneModel.listenTo(layerPrefs, 'change:alpha', this.setAlpha.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'change:show change:alpha', this.setShow.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'add', this.addLayer.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'remove', this.removeLayer.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'sort', this.reIndexLayers.bind(this));
    }
    CesiumLayers.prototype.makeMap = function (options) {
        var _this = this;
        // must create cesium map after containing DOM is attached.
        this.map = new Cesium.Viewer(options.element, options.cesiumOptions);
        this.map.scene.requestRenderMode = true;
        this.layers.layers.forEach(function (model) {
            if (model.get('show')) {
                _this.initLayer(model);
            }
        }, this);
        this.isMapCreated = true;
        return this.map;
    };
    CesiumLayers.prototype.initLayer = function (model) {
        var type = CesiumImageryProviderTypes[model.get('type')];
        var initObj = _.omit(model.attributes, 'type', 'label', 'index', 'modelCid');
        if (model.get('type') === 'WMT') {
            /* If matrixSet is present (OpenLayers WMTS keyword) set tileMatrixSetID (Cesium WMTS keyword) */
            if (initObj.matrixSet) {
                initObj.tileMatrixSetID = initObj.matrixSet;
            }
            /* Set the tiling scheme for WMTS imagery providers that are EPSG:4326 */
            if (StartupDataStore.Configuration.getProjection() === 'EPSG:4326') {
                initObj.tilingScheme = new Cesium.GeographicTilingScheme();
            }
        }
        var provider = new type(initObj);
        /*
              Optionally add this provider as a TrustedServer. This sets withCredentials = true
              on the XmlHttpRequests for CORS.
            */
        if (model.get('withCredentials')) {
            var parsedUrl = url.parse(provider.url);
            var port = parsedUrl.port;
            if (!port) {
                // @ts-expect-error ts-migrate(2322) FIXME: Type '443 | 80' is not assignable to type 'string ... Remove this comment to see the full error message
                port =
                    parsedUrl.protocol === 'https:'
                        ? DEFAULT_HTTPS_PORT
                        : DEFAULT_HTTP_PORT;
            }
            Cesium.TrustedServers.add(parsedUrl.hostname, port);
        }
        this.layerOrder = addLayer({
            initialized: this.layerOrder,
            all: this.layers.layers.map(function (model) { return model.id; }).reverse(),
            layer: model.id,
        });
        var layerIndex = this.layerOrder.indexOf(model.id);
        var layer = this.map.imageryLayers.addImageryProvider(provider, layerIndex);
        this.layerForCid[model.id] = layer;
        layer.alpha = model.get('alpha');
        layer.show = model.shouldShowLayer();
    };
    CesiumLayers.prototype.addLayer = function () {
        // never done
    };
    CesiumLayers.prototype.removeLayer = function () {
        // never done
    };
    CesiumLayers.prototype.setAlpha = function (model) {
        var layer = this.layerForCid[model.id];
        layer.alpha = model.get('alpha');
    };
    CesiumLayers.prototype.setShow = function (model) {
        if (!this.layerForCid[model.id]) {
            this.initLayer(model);
        }
        var layer = this.layerForCid[model.id];
        layer.show = model.shouldShowLayer();
        this.map.scene.requestRender();
    };
    /*
        removing/re-adding the layers causes visible "re-render" of entire map;
        raising/lowering is smoother.
        raising means to move to a higher index.  higher indexes are displayed on top of lower indexes.
        so we have to reverse the order property here to make it display correctly.
        in other words, order 1 means highest index.
      */
    CesiumLayers.prototype.reIndexLayers = function () {
        var _this = this;
        var newLayerOrder = shiftLayers({
            prev: this.layerOrder,
            cur: this.layers.layers.map(function (model) { return model.id; }).reverse(),
        });
        var _a = getShift({
            prev: this.layerOrder,
            cur: newLayerOrder,
        }), layer = _a.layer, method = _a.method, count = _a.count;
        _.times(count, function () {
            _this.map.imageryLayers[method](_this.layerForCid[layer]);
        }, this);
        this.layerOrder = newLayerOrder;
    };
    return CesiumLayers;
}());
export { CesiumLayers };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VzaXVtLmxheWVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9jb250cm9sbGVycy9jZXNpdW0ubGF5ZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0oseUNBQXlDO0FBQ3pDLG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFDckIsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDekUsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLElBQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFBO0FBQzlCLElBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFBO0FBQzVCLE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHO0lBQ3hDLEdBQUcsRUFBRSxNQUFNLENBQUMsa0NBQWtDO0lBQzlDLEdBQUcsRUFBRSxNQUFNLENBQUMsOEJBQThCO0lBQzFDLEVBQUUsRUFBRSxNQUFNLENBQUMsdUJBQXVCO0lBQ2xDLEdBQUcsRUFBRSxNQUFNLENBQUMsNEJBQTRCO0lBQ3hDLEdBQUcsRUFBRSxNQUFNLENBQUMsZ0NBQWdDO0lBQzVDLEdBQUcsRUFBRSxNQUFNLENBQUMsbUNBQW1DO0lBQy9DLEVBQUUsRUFBRSxNQUFNLENBQUMsMEJBQTBCO0lBQ3JDLEVBQUUsRUFBRSxNQUFNLENBQUMscUJBQXFCO0lBQ2hDLEdBQUcsRUFBRSxNQUFNLENBQUMsZ0NBQWdDO0lBQzVDLEdBQUcsRUFBRSxNQUFNLENBQUMseUJBQXlCO0lBQ3JDLEVBQUUsRUFBRSxNQUFNLENBQUMseUJBQXlCO0NBR3JDLENBQUE7QUFDRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sUUFBUSxNQUFNLFVB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SyxPQUFBLEtBQUssQ0FBQyxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUMsT0FBTyxFQUFFO1NBQzNELENBQUMsQ0FBQTtRQUNJLElBQUEsS0FBMkIsUUFBUSxDQUFDO1lBQ3hDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtZQUNyQixHQUFHLEVBQUUsYUFBYTtTQUNuQixDQUFDLEVBSE0sS0FBSyxXQUFBLEVBQUUsTUFBTSxZQUFBLEVBQUUsS0FBSyxXQUcxQixDQUFBO1FBQ0YsQ0FBQyxDQUFDLEtBQUssQ0FDTCxLQUFLLEVBQ0w7WUFDRSxLQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDekQsQ0FBQyxFQUNELElBQUksQ0FDTCxDQUFBO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUE7SUFDakMsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQTdJRCxJQTZJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLypqc2hpbnQgbmV3Y2FwOiBmYWxzZSwgYml0d2lzZTogZmFsc2UgKi9cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Nlc2kuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IENlc2l1bSBmcm9tICdjZXNpdW0vQnVpbGQvQ2VzaXVtL0Nlc2l1bSdcbmltcG9ydCB1cmwgZnJvbSAndXJsJ1xuaW1wb3J0IHsgYWRkTGF5ZXIsIHNoaWZ0TGF5ZXJzLCBnZXRTaGlmdCB9IGZyb20gJy4vY2VzaXVtLmxheWVyLW9yZGVyaW5nJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmNvbnN0IERFRkFVTFRfSFRUUFNfUE9SVCA9IDQ0M1xuY29uc3QgREVGQVVMVF9IVFRQX1BPUlQgPSA4MFxuZXhwb3J0IGNvbnN0IENlc2l1bUltYWdlcnlQcm92aWRlclR5cGVzID0ge1xuICBPU006IENlc2l1bS5jcmVhdGVPcGVuU3RyZWV0TWFwSW1hZ2VyeVByb3ZpZGVyLFxuICBBR006IENlc2l1bS5BcmNHaXNNYXBTZXJ2ZXJJbWFnZXJ5UHJvdmlkZXIsXG4gIEJNOiBDZXNpdW0uQmluZ01hcHNJbWFnZXJ5UHJvdmlkZXIsXG4gIFdNUzogQ2VzaXVtLldlYk1hcFNlcnZpY2VJbWFnZXJ5UHJvdmlkZXIsXG4gIFdNVDogQ2VzaXVtLldlYk1hcFRpbGVTZXJ2aWNlSW1hZ2VyeVByb3ZpZGVyLFxuICBUTVM6IENlc2l1bS5jcmVhdGVUaWxlTWFwU2VydmljZUltYWdlcnlQcm92aWRlcixcbiAgR0U6IENlc2l1bS5Hb29nbGVFYXJ0aEltYWdlcnlQcm92aWRlcixcbiAgQ1Q6IENlc2l1bS5DZXNpdW1UZXJyYWluUHJvdmlkZXIsXG4gIEFHUzogQ2VzaXVtLkFyY0dpc0ltYWdlU2VydmVyVGVycmFpblByb3ZpZGVyLFxuICBWUlc6IENlc2l1bS5WUlRoZVdvcmxkVGVycmFpblByb3ZpZGVyLFxuICBTSTogQ2VzaXVtLlNpbmdsZVRpbGVJbWFnZXJ5UHJvdmlkZXIsXG59IGFzIHtcbiAgW2tleTogc3RyaW5nXTogYW55XG59XG5pbXBvcnQgeyBMYXllcnMgfSBmcm9tICcuL2xheWVycydcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG50eXBlIE1ha2VNYXBUeXBlID0ge1xuICBjZXNpdW1PcHRpb25zOiBhbnlcbiAgZWxlbWVudDogSFRNTEVsZW1lbnRcbn1cbmV4cG9ydCBjbGFzcyBDZXNpdW1MYXllcnMge1xuICBsYXllcnM6IExheWVyc1xuICBtYXA6IGFueVxuICBpc01hcENyZWF0ZWQ6IGJvb2xlYW5cbiAgbGF5ZXJGb3JDaWQ6IGFueVxuICBiYWNrYm9uZU1vZGVsOiBhbnlcbiAgbGF5ZXJPcmRlcjogQXJyYXk8YW55PlxuICBjb25zdHJ1Y3Rvcih7IGNvbGxlY3Rpb24gfTogeyBjb2xsZWN0aW9uOiBhbnkgfSkge1xuICAgIHRoaXMuYmFja2JvbmVNb2RlbCA9IG5ldyBCYWNrYm9uZS5Nb2RlbCh7fSlcbiAgICB0aGlzLmlzTWFwQ3JlYXRlZCA9IGZhbHNlXG4gICAgdGhpcy5sYXllck9yZGVyID0gW11cbiAgICB0aGlzLmxheWVyRm9yQ2lkID0ge31cbiAgICBjb25zdCBsYXllclByZWZzID0gY29sbGVjdGlvblxuICAgIHRoaXMubGF5ZXJzID0gbmV3IExheWVycyhsYXllclByZWZzKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAnY2hhbmdlOmFscGhhJyxcbiAgICAgIHRoaXMuc2V0QWxwaGEuYmluZCh0aGlzKVxuICAgIClcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ2NoYW5nZTpzaG93IGNoYW5nZTphbHBoYScsXG4gICAgICB0aGlzLnNldFNob3cuYmluZCh0aGlzKVxuICAgIClcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8obGF5ZXJQcmVmcywgJ2FkZCcsIHRoaXMuYWRkTGF5ZXIuYmluZCh0aGlzKSlcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ3JlbW92ZScsXG4gICAgICB0aGlzLnJlbW92ZUxheWVyLmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdzb3J0JyxcbiAgICAgIHRoaXMucmVJbmRleExheWVycy5iaW5kKHRoaXMpXG4gICAgKVxuICB9XG4gIG1ha2VNYXAob3B0aW9uczogTWFrZU1hcFR5cGUpIHtcbiAgICAvLyBtdXN0IGNyZWF0ZSBjZXNpdW0gbWFwIGFmdGVyIGNvbnRhaW5pbmcgRE9NIGlzIGF0dGFjaGVkLlxuICAgIHRoaXMubWFwID0gbmV3IENlc2l1bS5WaWV3ZXIob3B0aW9ucy5lbGVtZW50LCBvcHRpb25zLmNlc2l1bU9wdGlvbnMpXG4gICAgdGhpcy5tYXAuc2NlbmUucmVxdWVzdFJlbmRlck1vZGUgPSB0cnVlXG4gICAgdGhpcy5sYXllcnMubGF5ZXJzLmZvckVhY2goKG1vZGVsKSA9PiB7XG4gICAgICBpZiAobW9kZWwuZ2V0KCdzaG93JykpIHtcbiAgICAgICAgdGhpcy5pbml0TGF5ZXIobW9kZWwpXG4gICAgICB9XG4gICAgfSwgdGhpcylcbiAgICB0aGlzLmlzTWFwQ3JlYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5tYXBcbiAgfVxuICBpbml0TGF5ZXIobW9kZWw6IGFueSkge1xuICAgIGNvbnN0IHR5cGUgPSBDZXNpdW1JbWFnZXJ5UHJvdmlkZXJUeXBlc1ttb2RlbC5nZXQoJ3R5cGUnKV1cbiAgICBjb25zdCBpbml0T2JqID0gXy5vbWl0KFxuICAgICAgbW9kZWwuYXR0cmlidXRlcyxcbiAgICAgICd0eXBlJyxcbiAgICAgICdsYWJlbCcsXG4gICAgICAnaW5kZXgnLFxuICAgICAgJ21vZGVsQ2lkJ1xuICAgIClcbiAgICBpZiAobW9kZWwuZ2V0KCd0eXBlJykgPT09ICdXTVQnKSB7XG4gICAgICAvKiBJZiBtYXRyaXhTZXQgaXMgcHJlc2VudCAoT3BlbkxheWVycyBXTVRTIGtleXdvcmQpIHNldCB0aWxlTWF0cml4U2V0SUQgKENlc2l1bSBXTVRTIGtleXdvcmQpICovXG4gICAgICBpZiAoaW5pdE9iai5tYXRyaXhTZXQpIHtcbiAgICAgICAgaW5pdE9iai50aWxlTWF0cml4U2V0SUQgPSBpbml0T2JqLm1hdHJpeFNldFxuICAgICAgfVxuICAgICAgLyogU2V0IHRoZSB0aWxpbmcgc2NoZW1lIGZvciBXTVRTIGltYWdlcnkgcHJvdmlkZXJzIHRoYXQgYXJlIEVQU0c6NDMyNiAqL1xuICAgICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKCkgPT09ICdFUFNHOjQzMjYnKSB7XG4gICAgICAgIGluaXRPYmoudGlsaW5nU2NoZW1lID0gbmV3IENlc2l1bS5HZW9ncmFwaGljVGlsaW5nU2NoZW1lKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgdHlwZShpbml0T2JqKVxuICAgIC8qXG4gICAgICAgICAgT3B0aW9uYWxseSBhZGQgdGhpcyBwcm92aWRlciBhcyBhIFRydXN0ZWRTZXJ2ZXIuIFRoaXMgc2V0cyB3aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICAgICAgb24gdGhlIFhtbEh0dHBSZXF1ZXN0cyBmb3IgQ09SUy5cbiAgICAgICAgKi9cbiAgICBpZiAobW9kZWwuZ2V0KCd3aXRoQ3JlZGVudGlhbHMnKSkge1xuICAgICAgY29uc3QgcGFyc2VkVXJsID0gdXJsLnBhcnNlKHByb3ZpZGVyLnVybClcbiAgICAgIGxldCBwb3J0ID0gcGFyc2VkVXJsLnBvcnRcbiAgICAgIGlmICghcG9ydCkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJzQ0MyB8IDgwJyBpcyBub3QgYXNzaWduYWJsZSB0byB0eXBlICdzdHJpbmcgLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgcG9ydCA9XG4gICAgICAgICAgcGFyc2VkVXJsLnByb3RvY29sID09PSAnaHR0cHM6J1xuICAgICAgICAgICAgPyBERUZBVUxUX0hUVFBTX1BPUlRcbiAgICAgICAgICAgIDogREVGQVVMVF9IVFRQX1BPUlRcbiAgICAgIH1cbiAgICAgIENlc2l1bS5UcnVzdGVkU2VydmVycy5hZGQocGFyc2VkVXJsLmhvc3RuYW1lLCBwb3J0KVxuICAgIH1cbiAgICB0aGlzLmxheWVyT3JkZXIgPSBhZGRMYXllcih7XG4gICAgICBpbml0aWFsaXplZDogdGhpcy5sYXllck9yZGVyLFxuICAgICAgYWxsOiB0aGlzLmxheWVycy5sYXllcnMubWFwKChtb2RlbCkgPT4gbW9kZWwuaWQpLnJldmVyc2UoKSxcbiAgICAgIGxheWVyOiBtb2RlbC5pZCxcbiAgICB9KVxuICAgIGNvbnN0IGxheWVySW5kZXggPSB0aGlzLmxheWVyT3JkZXIuaW5kZXhPZihtb2RlbC5pZClcbiAgICBjb25zdCBsYXllciA9IHRoaXMubWFwLmltYWdlcnlMYXllcnMuYWRkSW1hZ2VyeVByb3ZpZGVyKFxuICAgICAgcHJvdmlkZXIsXG4gICAgICBsYXllckluZGV4XG4gICAgKVxuICAgIHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdID0gbGF5ZXJcbiAgICBsYXllci5hbHBoYSA9IG1vZGVsLmdldCgnYWxwaGEnKVxuICAgIGxheWVyLnNob3cgPSBtb2RlbC5zaG91bGRTaG93TGF5ZXIoKVxuICB9XG4gIGFkZExheWVyKCkge1xuICAgIC8vIG5ldmVyIGRvbmVcbiAgfVxuICByZW1vdmVMYXllcigpIHtcbiAgICAvLyBuZXZlciBkb25lXG4gIH1cbiAgc2V0QWxwaGEobW9kZWw6IGFueSkge1xuICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllckZvckNpZFttb2RlbC5pZF1cbiAgICBsYXllci5hbHBoYSA9IG1vZGVsLmdldCgnYWxwaGEnKVxuICB9XG4gIHNldFNob3cobW9kZWw6IGFueSkge1xuICAgIGlmICghdGhpcy5sYXllckZvckNpZFttb2RlbC5pZF0pIHtcbiAgICAgIHRoaXMuaW5pdExheWVyKG1vZGVsKVxuICAgIH1cbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgbGF5ZXIuc2hvdyA9IG1vZGVsLnNob3VsZFNob3dMYXllcigpXG4gICAgdGhpcy5tYXAuc2NlbmUucmVxdWVzdFJlbmRlcigpXG4gIH1cbiAgLypcbiAgICAgIHJlbW92aW5nL3JlLWFkZGluZyB0aGUgbGF5ZXJzIGNhdXNlcyB2aXNpYmxlIFwicmUtcmVuZGVyXCIgb2YgZW50aXJlIG1hcDtcbiAgICAgIHJhaXNpbmcvbG93ZXJpbmcgaXMgc21vb3RoZXIuXG4gICAgICByYWlzaW5nIG1lYW5zIHRvIG1vdmUgdG8gYSBoaWdoZXIgaW5kZXguICBoaWdoZXIgaW5kZXhlcyBhcmUgZGlzcGxheWVkIG9uIHRvcCBvZiBsb3dlciBpbmRleGVzLlxuICAgICAgc28gd2UgaGF2ZSB0byByZXZlcnNlIHRoZSBvcmRlciBwcm9wZXJ0eSBoZXJlIHRvIG1ha2UgaXQgZGlzcGxheSBjb3JyZWN0bHkuXG4gICAgICBpbiBvdGhlciB3b3Jkcywgb3JkZXIgMSBtZWFucyBoaWdoZXN0IGluZGV4LlxuICAgICovXG4gIHJlSW5kZXhMYXllcnMoKSB7XG4gICAgY29uc3QgbmV3TGF5ZXJPcmRlciA9IHNoaWZ0TGF5ZXJzKHtcbiAgICAgIHByZXY6IHRoaXMubGF5ZXJPcmRlcixcbiAgICAgIGN1cjogdGhpcy5sYXllcnMubGF5ZXJzLm1hcCgobW9kZWwpID0+IG1vZGVsLmlkKS5yZXZlcnNlKCksXG4gICAgfSlcbiAgICBjb25zdCB7IGxheWVyLCBtZXRob2QsIGNvdW50IH0gPSBnZXRTaGlmdCh7XG4gICAgICBwcmV2OiB0aGlzLmxheWVyT3JkZXIsXG4gICAgICBjdXI6IG5ld0xheWVyT3JkZXIsXG4gICAgfSlcbiAgICBfLnRpbWVzKFxuICAgICAgY291bnQsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMubWFwLmltYWdlcnlMYXllcnNbbWV0aG9kXSh0aGlzLmxheWVyRm9yQ2lkW2xheWVyXSlcbiAgICAgIH0sXG4gICAgICB0aGlzXG4gICAgKVxuICAgIHRoaXMubGF5ZXJPcmRlciA9IG5ld0xheWVyT3JkZXJcbiAgfVxufVxuIl19