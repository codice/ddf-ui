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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VzaXVtLmxheWVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9jb250cm9sbGVycy9jZXNpdW0ubGF5ZXJzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0oseUNBQXlDO0FBQ3pDLG1KQUFtSjtBQUNuSixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUMvQyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFDckIsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDekUsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLElBQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFBO0FBQzlCLElBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFBO0FBQzVCLE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHO0lBQ3hDLEdBQUcsRUFBRSxNQUFNLENBQUMsa0NBQWtDO0lBQzlDLEdBQUcsRUFBRSxNQUFNLENBQUMsOEJBQThCO0lBQzFDLEVBQUUsRUFBRSxNQUFNLENBQUMsdUJBQXVCO0lBQ2xDLEdBQUcsRUFBRSxNQUFNLENBQUMsNEJBQTRCO0lBQ3hDLEdBQUcsRUFBRSxNQUFNLENBQUMsZ0NBQWdDO0lBQzVDLEdBQUcsRUFBRSxNQUFNLENBQUMsbUNBQW1DO0lBQy9DLEVBQUUsRUFBRSxNQUFNLENBQUMsMEJBQTBCO0lBQ3JDLEVBQUUsRUFBRSxNQUFNLENBQUMscUJBQXFCO0lBQ2hDLEdBQUcsRUFBRSxNQUFNLENBQUMsZ0NBQWdDO0lBQzVDLEdBQUcsRUFBRSxNQUFNLENBQUMseUJBQXlCO0lBQ3JDLEVBQUUsRUFBRSxNQUFNLENBQUMseUJBQXlCO0NBR3JDLENBQUE7QUFDRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sUUFBUSxNQUFNLFVB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O1lBQ3JCLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRTtTQUMzRCxDQUFDLENBQUE7UUFDSSxJQUFBLEtBQTJCLFFBQVEsQ0FBQztZQUN4QyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDckIsR0FBRyxFQUFFLGFBQWE7U0FDbkIsQ0FBQyxFQUhNLEtBQUssV0FBQSxFQUFFLE1BQU0sWUFBQSxFQUFFLEtBQUssV0FHMUIsQ0FBQTtRQUNGLENBQUMsQ0FBQyxLQUFLLENBQ0wsS0FBSyxFQUNMO1lBQ0UsS0FBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ3pELENBQUMsRUFDRCxJQUFJLENBQ0wsQ0FBQTtRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFBO0lBQ2pDLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUE3SUQsSUE2SUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qanNoaW50IG5ld2NhcDogZmFsc2UsIGJpdHdpc2U6IGZhbHNlICovXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjZXNpLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBDZXNpdW0gZnJvbSAnY2VzaXVtL0J1aWxkL0Nlc2l1bS9DZXNpdW0nXG5pbXBvcnQgdXJsIGZyb20gJ3VybCdcbmltcG9ydCB7IGFkZExheWVyLCBzaGlmdExheWVycywgZ2V0U2hpZnQgfSBmcm9tICcuL2Nlc2l1bS5sYXllci1vcmRlcmluZydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5jb25zdCBERUZBVUxUX0hUVFBTX1BPUlQgPSA0NDNcbmNvbnN0IERFRkFVTFRfSFRUUF9QT1JUID0gODBcbmV4cG9ydCBjb25zdCBDZXNpdW1JbWFnZXJ5UHJvdmlkZXJUeXBlcyA9IHtcbiAgT1NNOiBDZXNpdW0uY3JlYXRlT3BlblN0cmVldE1hcEltYWdlcnlQcm92aWRlcixcbiAgQUdNOiBDZXNpdW0uQXJjR2lzTWFwU2VydmVySW1hZ2VyeVByb3ZpZGVyLFxuICBCTTogQ2VzaXVtLkJpbmdNYXBzSW1hZ2VyeVByb3ZpZGVyLFxuICBXTVM6IENlc2l1bS5XZWJNYXBTZXJ2aWNlSW1hZ2VyeVByb3ZpZGVyLFxuICBXTVQ6IENlc2l1bS5XZWJNYXBUaWxlU2VydmljZUltYWdlcnlQcm92aWRlcixcbiAgVE1TOiBDZXNpdW0uY3JlYXRlVGlsZU1hcFNlcnZpY2VJbWFnZXJ5UHJvdmlkZXIsXG4gIEdFOiBDZXNpdW0uR29vZ2xlRWFydGhJbWFnZXJ5UHJvdmlkZXIsXG4gIENUOiBDZXNpdW0uQ2VzaXVtVGVycmFpblByb3ZpZGVyLFxuICBBR1M6IENlc2l1bS5BcmNHaXNJbWFnZVNlcnZlclRlcnJhaW5Qcm92aWRlcixcbiAgVlJXOiBDZXNpdW0uVlJUaGVXb3JsZFRlcnJhaW5Qcm92aWRlcixcbiAgU0k6IENlc2l1bS5TaW5nbGVUaWxlSW1hZ2VyeVByb3ZpZGVyLFxufSBhcyB7XG4gIFtrZXk6IHN0cmluZ106IGFueVxufVxuaW1wb3J0IHsgTGF5ZXJzIH0gZnJvbSAnLi9sYXllcnMnXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xudHlwZSBNYWtlTWFwVHlwZSA9IHtcbiAgY2VzaXVtT3B0aW9uczogYW55XG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50XG59XG5leHBvcnQgY2xhc3MgQ2VzaXVtTGF5ZXJzIHtcbiAgbGF5ZXJzOiBMYXllcnNcbiAgbWFwOiBhbnlcbiAgaXNNYXBDcmVhdGVkOiBib29sZWFuXG4gIGxheWVyRm9yQ2lkOiBhbnlcbiAgYmFja2JvbmVNb2RlbDogYW55XG4gIGxheWVyT3JkZXI6IEFycmF5PGFueT5cbiAgY29uc3RydWN0b3IoeyBjb2xsZWN0aW9uIH06IHsgY29sbGVjdGlvbjogYW55IH0pIHtcbiAgICB0aGlzLmJhY2tib25lTW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoe30pXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSBmYWxzZVxuICAgIHRoaXMubGF5ZXJPcmRlciA9IFtdXG4gICAgdGhpcy5sYXllckZvckNpZCA9IHt9XG4gICAgY29uc3QgbGF5ZXJQcmVmcyA9IGNvbGxlY3Rpb25cbiAgICB0aGlzLmxheWVycyA9IG5ldyBMYXllcnMobGF5ZXJQcmVmcylcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ2NoYW5nZTphbHBoYScsXG4gICAgICB0aGlzLnNldEFscGhhLmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdjaGFuZ2U6c2hvdyBjaGFuZ2U6YWxwaGEnLFxuICAgICAgdGhpcy5zZXRTaG93LmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKGxheWVyUHJlZnMsICdhZGQnLCB0aGlzLmFkZExheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdyZW1vdmUnLFxuICAgICAgdGhpcy5yZW1vdmVMYXllci5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAnc29ydCcsXG4gICAgICB0aGlzLnJlSW5kZXhMYXllcnMuYmluZCh0aGlzKVxuICAgIClcbiAgfVxuICBtYWtlTWFwKG9wdGlvbnM6IE1ha2VNYXBUeXBlKSB7XG4gICAgLy8gbXVzdCBjcmVhdGUgY2VzaXVtIG1hcCBhZnRlciBjb250YWluaW5nIERPTSBpcyBhdHRhY2hlZC5cbiAgICB0aGlzLm1hcCA9IG5ldyBDZXNpdW0uVmlld2VyKG9wdGlvbnMuZWxlbWVudCwgb3B0aW9ucy5jZXNpdW1PcHRpb25zKVxuICAgIHRoaXMubWFwLnNjZW5lLnJlcXVlc3RSZW5kZXJNb2RlID0gdHJ1ZVxuICAgIHRoaXMubGF5ZXJzLmxheWVycy5mb3JFYWNoKChtb2RlbCkgPT4ge1xuICAgICAgaWYgKG1vZGVsLmdldCgnc2hvdycpKSB7XG4gICAgICAgIHRoaXMuaW5pdExheWVyKG1vZGVsKVxuICAgICAgfVxuICAgIH0sIHRoaXMpXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMubWFwXG4gIH1cbiAgaW5pdExheWVyKG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCB0eXBlID0gQ2VzaXVtSW1hZ2VyeVByb3ZpZGVyVHlwZXNbbW9kZWwuZ2V0KCd0eXBlJyldXG4gICAgY29uc3QgaW5pdE9iaiA9IF8ub21pdChcbiAgICAgIG1vZGVsLmF0dHJpYnV0ZXMsXG4gICAgICAndHlwZScsXG4gICAgICAnbGFiZWwnLFxuICAgICAgJ2luZGV4JyxcbiAgICAgICdtb2RlbENpZCdcbiAgICApXG4gICAgaWYgKG1vZGVsLmdldCgndHlwZScpID09PSAnV01UJykge1xuICAgICAgLyogSWYgbWF0cml4U2V0IGlzIHByZXNlbnQgKE9wZW5MYXllcnMgV01UUyBrZXl3b3JkKSBzZXQgdGlsZU1hdHJpeFNldElEIChDZXNpdW0gV01UUyBrZXl3b3JkKSAqL1xuICAgICAgaWYgKGluaXRPYmoubWF0cml4U2V0KSB7XG4gICAgICAgIGluaXRPYmoudGlsZU1hdHJpeFNldElEID0gaW5pdE9iai5tYXRyaXhTZXRcbiAgICAgIH1cbiAgICAgIC8qIFNldCB0aGUgdGlsaW5nIHNjaGVtZSBmb3IgV01UUyBpbWFnZXJ5IHByb3ZpZGVycyB0aGF0IGFyZSBFUFNHOjQzMjYgKi9cbiAgICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpID09PSAnRVBTRzo0MzI2Jykge1xuICAgICAgICBpbml0T2JqLnRpbGluZ1NjaGVtZSA9IG5ldyBDZXNpdW0uR2VvZ3JhcGhpY1RpbGluZ1NjaGVtZSgpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IHR5cGUoaW5pdE9iailcbiAgICAvKlxuICAgICAgICAgIE9wdGlvbmFsbHkgYWRkIHRoaXMgcHJvdmlkZXIgYXMgYSBUcnVzdGVkU2VydmVyLiBUaGlzIHNldHMgd2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgICAgIG9uIHRoZSBYbWxIdHRwUmVxdWVzdHMgZm9yIENPUlMuXG4gICAgICAgICovXG4gICAgaWYgKG1vZGVsLmdldCgnd2l0aENyZWRlbnRpYWxzJykpIHtcbiAgICAgIGNvbnN0IHBhcnNlZFVybCA9IHVybC5wYXJzZShwcm92aWRlci51cmwpXG4gICAgICBsZXQgcG9ydCA9IHBhcnNlZFVybC5wb3J0XG4gICAgICBpZiAoIXBvcnQpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICc0NDMgfCA4MCcgaXMgbm90IGFzc2lnbmFibGUgdG8gdHlwZSAnc3RyaW5nIC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIHBvcnQgPVxuICAgICAgICAgIHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOidcbiAgICAgICAgICAgID8gREVGQVVMVF9IVFRQU19QT1JUXG4gICAgICAgICAgICA6IERFRkFVTFRfSFRUUF9QT1JUXG4gICAgICB9XG4gICAgICBDZXNpdW0uVHJ1c3RlZFNlcnZlcnMuYWRkKHBhcnNlZFVybC5ob3N0bmFtZSwgcG9ydClcbiAgICB9XG4gICAgdGhpcy5sYXllck9yZGVyID0gYWRkTGF5ZXIoe1xuICAgICAgaW5pdGlhbGl6ZWQ6IHRoaXMubGF5ZXJPcmRlcixcbiAgICAgIGFsbDogdGhpcy5sYXllcnMubGF5ZXJzLm1hcCgobW9kZWwpID0+IG1vZGVsLmlkKS5yZXZlcnNlKCksXG4gICAgICBsYXllcjogbW9kZWwuaWQsXG4gICAgfSlcbiAgICBjb25zdCBsYXllckluZGV4ID0gdGhpcy5sYXllck9yZGVyLmluZGV4T2YobW9kZWwuaWQpXG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLm1hcC5pbWFnZXJ5TGF5ZXJzLmFkZEltYWdlcnlQcm92aWRlcihcbiAgICAgIHByb3ZpZGVyLFxuICAgICAgbGF5ZXJJbmRleFxuICAgIClcbiAgICB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXSA9IGxheWVyXG4gICAgbGF5ZXIuYWxwaGEgPSBtb2RlbC5nZXQoJ2FscGhhJylcbiAgICBsYXllci5zaG93ID0gbW9kZWwuc2hvdWxkU2hvd0xheWVyKClcbiAgfVxuICBhZGRMYXllcigpIHtcbiAgICAvLyBuZXZlciBkb25lXG4gIH1cbiAgcmVtb3ZlTGF5ZXIoKSB7XG4gICAgLy8gbmV2ZXIgZG9uZVxuICB9XG4gIHNldEFscGhhKG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgbGF5ZXIuYWxwaGEgPSBtb2RlbC5nZXQoJ2FscGhhJylcbiAgfVxuICBzZXRTaG93KG1vZGVsOiBhbnkpIHtcbiAgICBpZiAoIXRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdKSB7XG4gICAgICB0aGlzLmluaXRMYXllcihtb2RlbClcbiAgICB9XG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXVxuICAgIGxheWVyLnNob3cgPSBtb2RlbC5zaG91bGRTaG93TGF5ZXIoKVxuICAgIHRoaXMubWFwLnNjZW5lLnJlcXVlc3RSZW5kZXIoKVxuICB9XG4gIC8qXG4gICAgICByZW1vdmluZy9yZS1hZGRpbmcgdGhlIGxheWVycyBjYXVzZXMgdmlzaWJsZSBcInJlLXJlbmRlclwiIG9mIGVudGlyZSBtYXA7XG4gICAgICByYWlzaW5nL2xvd2VyaW5nIGlzIHNtb290aGVyLlxuICAgICAgcmFpc2luZyBtZWFucyB0byBtb3ZlIHRvIGEgaGlnaGVyIGluZGV4LiAgaGlnaGVyIGluZGV4ZXMgYXJlIGRpc3BsYXllZCBvbiB0b3Agb2YgbG93ZXIgaW5kZXhlcy5cbiAgICAgIHNvIHdlIGhhdmUgdG8gcmV2ZXJzZSB0aGUgb3JkZXIgcHJvcGVydHkgaGVyZSB0byBtYWtlIGl0IGRpc3BsYXkgY29ycmVjdGx5LlxuICAgICAgaW4gb3RoZXIgd29yZHMsIG9yZGVyIDEgbWVhbnMgaGlnaGVzdCBpbmRleC5cbiAgICAqL1xuICByZUluZGV4TGF5ZXJzKCkge1xuICAgIGNvbnN0IG5ld0xheWVyT3JkZXIgPSBzaGlmdExheWVycyh7XG4gICAgICBwcmV2OiB0aGlzLmxheWVyT3JkZXIsXG4gICAgICBjdXI6IHRoaXMubGF5ZXJzLmxheWVycy5tYXAoKG1vZGVsKSA9PiBtb2RlbC5pZCkucmV2ZXJzZSgpLFxuICAgIH0pXG4gICAgY29uc3QgeyBsYXllciwgbWV0aG9kLCBjb3VudCB9ID0gZ2V0U2hpZnQoe1xuICAgICAgcHJldjogdGhpcy5sYXllck9yZGVyLFxuICAgICAgY3VyOiBuZXdMYXllck9yZGVyLFxuICAgIH0pXG4gICAgXy50aW1lcyhcbiAgICAgIGNvdW50LFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLm1hcC5pbWFnZXJ5TGF5ZXJzW21ldGhvZF0odGhpcy5sYXllckZvckNpZFtsYXllcl0pXG4gICAgICB9LFxuICAgICAgdGhpc1xuICAgIClcbiAgICB0aGlzLmxheWVyT3JkZXIgPSBuZXdMYXllck9yZGVyXG4gIH1cbn1cbiJdfQ==