import { __assign, __awaiter, __generator, __read, __rest } from "tslib";
import { Layers } from './layers';
import _ from 'underscore';
import user from '../../component/singletons/user-instance';
import { Tile as TileLayer } from 'ol/layer';
import { OSM as olSourceOSM, BingMaps, TileWMS, WMTS, XYZ } from 'ol/source';
import { transform as projTransform, get as projGet } from 'ol/proj';
import { Image as ImageLayer } from 'ol/layer';
import { ImageStatic as ImageStaticSource } from 'ol/source';
import { defaults as interactionsDefaults } from 'ol/interaction';
import { Map } from 'ol';
import Backbone from 'backbone';
import { StartupDataStore } from '../model/Startup/startup';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { View } from 'ol';
var createTile = function (_a, Source, Layer) {
    var show = _a.show, alpha = _a.alpha, options = __rest(_a, ["show", "alpha"]);
    if (Layer === void 0) { Layer = TileLayer; }
    return new Layer({
        visible: show,
        preload: Infinity,
        opacity: alpha,
        source: new Source(options),
    });
};
var OSM = function (opts) {
    var url = opts.url;
    return createTile(__assign(__assign({}, opts), { url: url + (url.indexOf('/{z}/{x}/{y}') === -1 ? '/{z}/{x}/{y}.png' : '') }), olSourceOSM);
};
var BM = function (opts) {
    var imagerySet = opts.imagerySet || opts.url;
    return createTile(__assign(__assign({}, opts), { imagerySet: imagerySet }), BingMaps);
};
var WMS = function (opts) {
    var params = opts.params || __assign({ LAYERS: opts.layers }, opts.parameters);
    return createTile(__assign(__assign({}, opts), { params: params }), TileWMS);
};
var WMT = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var url, withCredentials, proxyEnabled, originalUrl, getCapabilitiesUrl, res, text, parser, result, layer, matrixSet, options;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = opts.url, withCredentials = opts.withCredentials, proxyEnabled = opts.proxyEnabled;
                originalUrl = proxyEnabled
                    ? new URL(url, window.location.origin + window.location.pathname)
                    : new URL(url);
                getCapabilitiesUrl = new URL(originalUrl);
                getCapabilitiesUrl.searchParams.set('request', 'GetCapabilities');
                return [4 /*yield*/, window.fetch(getCapabilitiesUrl, {
                        credentials: withCredentials ? 'include' : 'same-origin',
                    })];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.text()];
            case 2:
                text = _a.sent();
                parser = new WMTSCapabilities();
                result = parser.read(text);
                if (result.Contents.Layer.length === 0) {
                    throw new Error('WMTS map layer source has no layers.');
                }
                layer = opts.layer, matrixSet = opts.matrixSet;
                /* If tileMatrixSetID is present (Cesium WMTS keyword) set matrixSet (OpenLayers WMTS keyword) */
                if (opts.tileMatrixSetID) {
                    matrixSet = opts.tileMatrixSetID;
                }
                if (!layer) {
                    layer = result.Contents.Layer[0].Identifier;
                }
                options = optionsFromCapabilities(result, __assign(__assign({}, opts), { layer: layer, matrixSet: matrixSet, wrapX: true }));
                if (options === null) {
                    throw new Error('WMTS map layer source could not be setup.');
                }
                if (proxyEnabled) {
                    // Set this to the proxy URL. Otherwise, OpenLayers will use the URL provided by the
                    // GetCapabilities response.
                    options.url = originalUrl.toString();
                    options.urls = [originalUrl.toString()];
                }
                return [2 /*return*/, createTile(opts, function () { return new WMTS(options); })];
        }
    });
}); };
var AGM = function (opts) {
    // We strip the template part of the url because we will manually format
    // it in the `tileUrlFunction` function.
    var url = opts.url.replace('tile/{z}/{y}/{x}', '');
    // arcgis url format:
    //      http://<mapservice-url>/tile/<level>/<row>/<column>
    //
    // reference links:
    //  - https://openlayers.org/en/latest/examples/xyz-esri-4326-512.html
    //  - https://developers.arcgis.com/rest/services-reference/map-tile.htm
    var tileUrlFunction = function (tileCoord) {
        var _a = __read(tileCoord, 3), z = _a[0], x = _a[1], y = _a[2];
        return "".concat(url, "/tile/").concat(z - 1, "/").concat(-y - 1, "/").concat(x);
    };
    return createTile(__assign(__assign({}, opts), { tileUrlFunction: tileUrlFunction }), XYZ);
};
var SI = function (opts) {
    var _a;
    var imageExtent = opts.imageExtent ||
        ((_a = projGet(StartupDataStore.Configuration.getProjection())) === null || _a === void 0 ? void 0 : _a.getExtent());
    return createTile(__assign(__assign(__assign({}, opts), { imageExtent: imageExtent }), opts.parameters), ImageStaticSource, ImageLayer);
};
var sources = { OSM: OSM, BM: BM, WMS: WMS, WMT: WMT, AGM: AGM, SI: SI };
var createLayer = function (type, opts) {
    var fn = sources[type];
    if (fn === undefined) {
        throw new Error("Unsupported map layer type ".concat(type));
    }
    return fn(opts);
};
var OpenlayersLayers = /** @class */ (function () {
    function OpenlayersLayers(_a) {
        var collection = _a.collection;
        this.backboneModel = new Backbone.Model({});
        this.isMapCreated = false;
        this.layerForCid = {};
        var layerPrefs = collection;
        this.layers = new Layers(layerPrefs);
        this.backboneModel.listenTo(layerPrefs, 'change:alpha', this.setAlpha.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'change:show change:alpha', this.setShow.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'add', this.addLayer.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'remove', this.removeLayer.bind(this));
        this.backboneModel.listenTo(layerPrefs, 'sort', this.reIndexLayers.bind(this));
    }
    OpenlayersLayers.prototype.makeMap = function (mapOptions) {
        var _this = this;
        this.layers.layers.forEach(function (layer) {
            _this.addLayer(layer);
        });
        var view = new View({
            projection: projGet(StartupDataStore.Configuration.getProjection()),
            center: projTransform([0, 0], 'EPSG:4326', StartupDataStore.Configuration.getProjection()),
            zoom: mapOptions.zoom,
            minZoom: mapOptions.minZoom,
        });
        var config = {
            target: mapOptions.element,
            view: view,
            interactions: interactionsDefaults({ doubleClickZoom: false }),
        };
        this.map = new Map(config);
        this.isMapCreated = true;
        return this.map;
    };
    OpenlayersLayers.prototype.addLayer = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, type, opts, layer, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = model.toJSON(), id = _a.id, type = _a.type;
                        opts = _.omit(model.attributes, 'type', 'label', 'index', 'modelCid');
                        opts.show = model.shouldShowLayer();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve(createLayer(type, opts))];
                    case 2:
                        layer = _b.sent();
                        this.map.addLayer(layer);
                        this.layerForCid[id] = layer;
                        this.reIndexLayers();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        model.set('warning', e_1.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OpenlayersLayers.prototype.removeLayer = function (model) {
        var id = model.get('id');
        var layer = this.layerForCid[id];
        if (layer !== undefined) {
            this.map.removeLayer(layer);
        }
        delete this.layerForCid[id];
        this.reIndexLayers();
    };
    OpenlayersLayers.prototype.reIndexLayers = function () {
        var _this = this;
        this.layers.layers.forEach(function (model, index) {
            var layer = _this.layerForCid[model.id];
            if (layer !== undefined) {
                layer.setZIndex(-(index + 1));
            }
        }, this);
        user.savePreferences();
    };
    OpenlayersLayers.prototype.setAlpha = function (model) {
        var layer = this.layerForCid[model.id];
        if (layer !== undefined) {
            layer.setOpacity(parseFloat(model.get('alpha')));
        }
    };
    OpenlayersLayers.prototype.setShow = function (model) {
        var layer = this.layerForCid[model.id];
        if (layer !== undefined) {
            layer.setVisible(model.shouldShowLayer());
        }
    };
    return OpenlayersLayers;
}());
export { OpenlayersLayers };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmxheWVycy5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY29udHJvbGxlcnMvb3BlbmxheWVycy5sYXllcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsSUFBSSxJQUFJLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsR0FBRyxJQUFJLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDNUUsT0FBTyxFQUFFLFNBQVMsSUFBSSxhQUFhLEVBQUUsR0FBRyxJQUFJLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxRQUFRLElBQUksb0JBQW9CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQ3hCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN4RCxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFBO0FBR3pELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxJQUFJLENBQUE7QUFDekIsSUFBTSxVQUFVLEdB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SUFBSSxDQUFDLENBQUE7UUFDUixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDeEIsQ0FBQztJQUNELG1DQUFRLEdBQVIsVUFBUyxLQUFVO1FBQ2pCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBVSxDQUFBO1FBQ2pELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELENBQUM7SUFDSCxDQUFDO0lBQ0Qsa0NBQU8sR0FBUCxVQUFRLEtBQVU7UUFDaEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDeEMsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDeEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQTtRQUMzQyxDQUFDO0lBQ0gsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FBQyxBQXRHRCxJQXNHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExheWVycyB9IGZyb20gJy4vbGF5ZXJzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyBUaWxlIGFzIFRpbGVMYXllciB9IGZyb20gJ29sL2xheWVyJ1xuaW1wb3J0IHsgT1NNIGFzIG9sU291cmNlT1NNLCBCaW5nTWFwcywgVGlsZVdNUywgV01UUywgWFlaIH0gZnJvbSAnb2wvc291cmNlJ1xuaW1wb3J0IHsgdHJhbnNmb3JtIGFzIHByb2pUcmFuc2Zvcm0sIGdldCBhcyBwcm9qR2V0IH0gZnJvbSAnb2wvcHJvaidcbmltcG9ydCB7IEltYWdlIGFzIEltYWdlTGF5ZXIgfSBmcm9tICdvbC9sYXllcidcbmltcG9ydCB7IEltYWdlU3RhdGljIGFzIEltYWdlU3RhdGljU291cmNlIH0gZnJvbSAnb2wvc291cmNlJ1xuaW1wb3J0IHsgZGVmYXVsdHMgYXMgaW50ZXJhY3Rpb25zRGVmYXVsdHMgfSBmcm9tICdvbC9pbnRlcmFjdGlvbidcbmltcG9ydCB7IE1hcCB9IGZyb20gJ29sJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IG9wdGlvbnNGcm9tQ2FwYWJpbGl0aWVzIH0gZnJvbSAnb2wvc291cmNlL1dNVFMnXG5pbXBvcnQgV01UU0NhcGFiaWxpdGllcyBmcm9tICdvbC9mb3JtYXQvV01UU0NhcGFiaWxpdGllcydcbmltcG9ydCB7IFByb2plY3Rpb25MaWtlIH0gZnJvbSAnb2wvcHJvaidcbmltcG9ydCBMYXllciBmcm9tICdvbC9sYXllci9MYXllcidcbmltcG9ydCB7IFZpZXcgfSBmcm9tICdvbCdcbmNvbnN0IGNyZWF0ZVRpbGUgPSAoXG4gIHsgc2hvdywgYWxwaGEsIC4uLm9wdGlvbnMgfTogYW55LFxuICBTb3VyY2U6IGFueSxcbiAgTGF5ZXIgPSBUaWxlTGF5ZXJcbikgPT5cbiAgbmV3IExheWVyKHtcbiAgICB2aXNpYmxlOiBzaG93LFxuICAgIHByZWxvYWQ6IEluZmluaXR5LFxuICAgIG9wYWNpdHk6IGFscGhhLFxuICAgIHNvdXJjZTogbmV3IFNvdXJjZShvcHRpb25zKSxcbiAgfSlcbmNvbnN0IE9TTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgeyB1cmwgfSA9IG9wdHNcbiAgcmV0dXJuIGNyZWF0ZVRpbGUoXG4gICAge1xuICAgICAgLi4ub3B0cyxcbiAgICAgIHVybDogdXJsICsgKHVybC5pbmRleE9mKCcve3p9L3t4fS97eX0nKSA9PT0gLTEgPyAnL3t6fS97eH0ve3l9LnBuZycgOiAnJyksXG4gICAgfSxcbiAgICBvbFNvdXJjZU9TTVxuICApXG59XG5jb25zdCBCTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgaW1hZ2VyeVNldCA9IG9wdHMuaW1hZ2VyeVNldCB8fCBvcHRzLnVybFxuICByZXR1cm4gY3JlYXRlVGlsZSh7IC4uLm9wdHMsIGltYWdlcnlTZXQgfSwgQmluZ01hcHMpXG59XG5jb25zdCBXTVMgPSAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IHBhcmFtcyA9IG9wdHMucGFyYW1zIHx8IHtcbiAgICBMQVlFUlM6IG9wdHMubGF5ZXJzLFxuICAgIC4uLm9wdHMucGFyYW1ldGVycyxcbiAgfVxuICByZXR1cm4gY3JlYXRlVGlsZSh7IC4uLm9wdHMsIHBhcmFtcyB9LCBUaWxlV01TKVxufVxuY29uc3QgV01UID0gYXN5bmMgKG9wdHM6IGFueSkgPT4ge1xuICBjb25zdCB7IHVybCwgd2l0aENyZWRlbnRpYWxzLCBwcm94eUVuYWJsZWQgfSA9IG9wdHNcbiAgY29uc3Qgb3JpZ2luYWxVcmwgPSBwcm94eUVuYWJsZWRcbiAgICA/IG5ldyBVUkwodXJsLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKVxuICAgIDogbmV3IFVSTCh1cmwpXG4gIGNvbnN0IGdldENhcGFiaWxpdGllc1VybCA9IG5ldyBVUkwob3JpZ2luYWxVcmwpXG4gIGdldENhcGFiaWxpdGllc1VybC5zZWFyY2hQYXJhbXMuc2V0KCdyZXF1ZXN0JywgJ0dldENhcGFiaWxpdGllcycpXG4gIGNvbnN0IHJlcyA9IGF3YWl0IHdpbmRvdy5mZXRjaChnZXRDYXBhYmlsaXRpZXNVcmwsIHtcbiAgICBjcmVkZW50aWFsczogd2l0aENyZWRlbnRpYWxzID8gJ2luY2x1ZGUnIDogJ3NhbWUtb3JpZ2luJyxcbiAgfSlcbiAgY29uc3QgdGV4dCA9IGF3YWl0IHJlcy50ZXh0KClcbiAgY29uc3QgcGFyc2VyID0gbmV3IFdNVFNDYXBhYmlsaXRpZXMoKVxuICBjb25zdCByZXN1bHQgPSBwYXJzZXIucmVhZCh0ZXh0KVxuICBpZiAoKHJlc3VsdCBhcyBhbnkpLkNvbnRlbnRzLkxheWVyLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignV01UUyBtYXAgbGF5ZXIgc291cmNlIGhhcyBubyBsYXllcnMuJylcbiAgfVxuICBsZXQgeyBsYXllciwgbWF0cml4U2V0IH0gPSBvcHRzXG4gIC8qIElmIHRpbGVNYXRyaXhTZXRJRCBpcyBwcmVzZW50IChDZXNpdW0gV01UUyBrZXl3b3JkKSBzZXQgbWF0cml4U2V0IChPcGVuTGF5ZXJzIFdNVFMga2V5d29yZCkgKi9cbiAgaWYgKG9wdHMudGlsZU1hdHJpeFNldElEKSB7XG4gICAgbWF0cml4U2V0ID0gb3B0cy50aWxlTWF0cml4U2V0SURcbiAgfVxuICBpZiAoIWxheWVyKSB7XG4gICAgbGF5ZXIgPSAocmVzdWx0IGFzIGFueSkuQ29udGVudHMuTGF5ZXJbMF0uSWRlbnRpZmllclxuICB9XG4gIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25zRnJvbUNhcGFiaWxpdGllcyhyZXN1bHQsIHtcbiAgICAuLi5vcHRzLFxuICAgIGxheWVyLFxuICAgIG1hdHJpeFNldCxcbiAgICB3cmFwWDogdHJ1ZSxcbiAgfSlcbiAgaWYgKG9wdGlvbnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dNVFMgbWFwIGxheWVyIHNvdXJjZSBjb3VsZCBub3QgYmUgc2V0dXAuJylcbiAgfVxuICBpZiAocHJveHlFbmFibGVkKSB7XG4gICAgLy8gU2V0IHRoaXMgdG8gdGhlIHByb3h5IFVSTC4gT3RoZXJ3aXNlLCBPcGVuTGF5ZXJzIHdpbGwgdXNlIHRoZSBVUkwgcHJvdmlkZWQgYnkgdGhlXG4gICAgLy8gR2V0Q2FwYWJpbGl0aWVzIHJlc3BvbnNlLlxuICAgIG9wdGlvbnMudXJsID0gb3JpZ2luYWxVcmwudG9TdHJpbmcoKVxuICAgIG9wdGlvbnMudXJscyA9IFtvcmlnaW5hbFVybC50b1N0cmluZygpXVxuICB9XG4gIHJldHVybiBjcmVhdGVUaWxlKG9wdHMsICgpID0+IG5ldyBXTVRTKG9wdGlvbnMpKVxufVxuY29uc3QgQUdNID0gKG9wdHM6IGFueSkgPT4ge1xuICAvLyBXZSBzdHJpcCB0aGUgdGVtcGxhdGUgcGFydCBvZiB0aGUgdXJsIGJlY2F1c2Ugd2Ugd2lsbCBtYW51YWxseSBmb3JtYXRcbiAgLy8gaXQgaW4gdGhlIGB0aWxlVXJsRnVuY3Rpb25gIGZ1bmN0aW9uLlxuICBjb25zdCB1cmwgPSBvcHRzLnVybC5yZXBsYWNlKCd0aWxlL3t6fS97eX0ve3h9JywgJycpXG4gIC8vIGFyY2dpcyB1cmwgZm9ybWF0OlxuICAvLyAgICAgIGh0dHA6Ly88bWFwc2VydmljZS11cmw+L3RpbGUvPGxldmVsPi88cm93Pi88Y29sdW1uPlxuICAvL1xuICAvLyByZWZlcmVuY2UgbGlua3M6XG4gIC8vICAtIGh0dHBzOi8vb3BlbmxheWVycy5vcmcvZW4vbGF0ZXN0L2V4YW1wbGVzL3h5ei1lc3JpLTQzMjYtNTEyLmh0bWxcbiAgLy8gIC0gaHR0cHM6Ly9kZXZlbG9wZXJzLmFyY2dpcy5jb20vcmVzdC9zZXJ2aWNlcy1yZWZlcmVuY2UvbWFwLXRpbGUuaHRtXG4gIGNvbnN0IHRpbGVVcmxGdW5jdGlvbiA9ICh0aWxlQ29vcmQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IFt6LCB4LCB5XSA9IHRpbGVDb29yZFxuICAgIHJldHVybiBgJHt1cmx9L3RpbGUvJHt6IC0gMX0vJHsteSAtIDF9LyR7eH1gXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZVRpbGUoeyAuLi5vcHRzLCB0aWxlVXJsRnVuY3Rpb24gfSwgWFlaKVxufVxuY29uc3QgU0kgPSAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IGltYWdlRXh0ZW50ID1cbiAgICBvcHRzLmltYWdlRXh0ZW50IHx8XG4gICAgcHJvakdldChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpKT8uZ2V0RXh0ZW50KClcbiAgcmV0dXJuIGNyZWF0ZVRpbGUoXG4gICAgeyAuLi5vcHRzLCBpbWFnZUV4dGVudCwgLi4ub3B0cy5wYXJhbWV0ZXJzIH0sXG4gICAgSW1hZ2VTdGF0aWNTb3VyY2UsXG4gICAgSW1hZ2VMYXllciBhcyBhbnlcbiAgKVxufVxuY29uc3Qgc291cmNlcyA9IHsgT1NNLCBCTSwgV01TLCBXTVQsIEFHTSwgU0kgfSBhcyB7XG4gIFtrZXk6IHN0cmluZ106IGFueVxufVxuY29uc3QgY3JlYXRlTGF5ZXIgPSAodHlwZTogYW55LCBvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgZm4gPSBzb3VyY2VzW3R5cGVdXG4gIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBtYXAgbGF5ZXIgdHlwZSAke3R5cGV9YClcbiAgfVxuICByZXR1cm4gZm4ob3B0cylcbn1cbnR5cGUgTWFrZU1hcFR5cGUgPSB7XG4gIHpvb206IG51bWJlclxuICBtaW5ab29tOiBudW1iZXJcbiAgY2VudGVyOiBbbnVtYmVyLCBudW1iZXJdXG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50XG59XG5leHBvcnQgY2xhc3MgT3BlbmxheWVyc0xheWVycyB7XG4gIGxheWVyczogTGF5ZXJzXG4gIG1hcDogYW55XG4gIGlzTWFwQ3JlYXRlZDogYm9vbGVhblxuICBsYXllckZvckNpZDogYW55XG4gIGJhY2tib25lTW9kZWw6IGFueVxuICBjb25zdHJ1Y3Rvcih7IGNvbGxlY3Rpb24gfTogeyBjb2xsZWN0aW9uOiBhbnkgfSkge1xuICAgIHRoaXMuYmFja2JvbmVNb2RlbCA9IG5ldyBCYWNrYm9uZS5Nb2RlbCh7fSlcbiAgICB0aGlzLmlzTWFwQ3JlYXRlZCA9IGZhbHNlXG4gICAgdGhpcy5sYXllckZvckNpZCA9IHt9XG4gICAgY29uc3QgbGF5ZXJQcmVmcyA9IGNvbGxlY3Rpb25cbiAgICB0aGlzLmxheWVycyA9IG5ldyBMYXllcnMobGF5ZXJQcmVmcylcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ2NoYW5nZTphbHBoYScsXG4gICAgICB0aGlzLnNldEFscGhhLmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdjaGFuZ2U6c2hvdyBjaGFuZ2U6YWxwaGEnLFxuICAgICAgdGhpcy5zZXRTaG93LmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKGxheWVyUHJlZnMsICdhZGQnLCB0aGlzLmFkZExheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdyZW1vdmUnLFxuICAgICAgdGhpcy5yZW1vdmVMYXllci5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAnc29ydCcsXG4gICAgICB0aGlzLnJlSW5kZXhMYXllcnMuYmluZCh0aGlzKVxuICAgIClcbiAgfVxuICBtYWtlTWFwKG1hcE9wdGlvbnM6IE1ha2VNYXBUeXBlKSB7XG4gICAgdGhpcy5sYXllcnMubGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICB0aGlzLmFkZExheWVyKGxheWVyKVxuICAgIH0pXG4gICAgY29uc3QgdmlldyA9IG5ldyBWaWV3KHtcbiAgICAgIHByb2plY3Rpb246IHByb2pHZXQoXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgICAgICkgYXMgUHJvamVjdGlvbkxpa2UsXG4gICAgICBjZW50ZXI6IHByb2pUcmFuc2Zvcm0oXG4gICAgICAgIFswLCAwXSxcbiAgICAgICAgJ0VQU0c6NDMyNicsXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgICAgICksXG4gICAgICB6b29tOiBtYXBPcHRpb25zLnpvb20sXG4gICAgICBtaW5ab29tOiBtYXBPcHRpb25zLm1pblpvb20sXG4gICAgfSlcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICB0YXJnZXQ6IG1hcE9wdGlvbnMuZWxlbWVudCxcbiAgICAgIHZpZXcsXG4gICAgICBpbnRlcmFjdGlvbnM6IGludGVyYWN0aW9uc0RlZmF1bHRzKHsgZG91YmxlQ2xpY2tab29tOiBmYWxzZSB9KSxcbiAgICB9XG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwKGNvbmZpZylcbiAgICB0aGlzLmlzTWFwQ3JlYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5tYXBcbiAgfVxuICBhc3luYyBhZGRMYXllcihtb2RlbDogYW55KSB7XG4gICAgY29uc3QgeyBpZCwgdHlwZSB9ID0gbW9kZWwudG9KU09OKClcbiAgICBjb25zdCBvcHRzID0gXy5vbWl0KG1vZGVsLmF0dHJpYnV0ZXMsICd0eXBlJywgJ2xhYmVsJywgJ2luZGV4JywgJ21vZGVsQ2lkJylcbiAgICBvcHRzLnNob3cgPSBtb2RlbC5zaG91bGRTaG93TGF5ZXIoKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBsYXllciA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShjcmVhdGVMYXllcih0eXBlLCBvcHRzKSlcbiAgICAgIHRoaXMubWFwLmFkZExheWVyKGxheWVyKVxuICAgICAgdGhpcy5sYXllckZvckNpZFtpZF0gPSBsYXllclxuICAgICAgdGhpcy5yZUluZGV4TGF5ZXJzKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBtb2RlbC5zZXQoJ3dhcm5pbmcnLCBlLm1lc3NhZ2UpXG4gICAgfVxuICB9XG4gIHJlbW92ZUxheWVyKG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBpZCA9IG1vZGVsLmdldCgnaWQnKVxuICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllckZvckNpZFtpZF1cbiAgICBpZiAobGF5ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIobGF5ZXIpXG4gICAgfVxuICAgIGRlbGV0ZSB0aGlzLmxheWVyRm9yQ2lkW2lkXVxuICAgIHRoaXMucmVJbmRleExheWVycygpXG4gIH1cbiAgcmVJbmRleExheWVycygpIHtcbiAgICB0aGlzLmxheWVycy5sYXllcnMuZm9yRWFjaCgobW9kZWwsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgICBpZiAobGF5ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsYXllci5zZXRaSW5kZXgoLShpbmRleCArIDEpKVxuICAgICAgfVxuICAgIH0sIHRoaXMpXG4gICAgdXNlci5zYXZlUHJlZmVyZW5jZXMoKVxuICB9XG4gIHNldEFscGhhKG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdIGFzIExheWVyXG4gICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxheWVyLnNldE9wYWNpdHkocGFyc2VGbG9hdChtb2RlbC5nZXQoJ2FscGhhJykpKVxuICAgIH1cbiAgfVxuICBzZXRTaG93KG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxheWVyLnNldFZpc2libGUobW9kZWwuc2hvdWxkU2hvd0xheWVyKCkpXG4gICAgfVxuICB9XG59XG4iXX0=