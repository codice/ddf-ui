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
                options = optionsFromCapabilities(result, __assign(__assign({}, opts), { layer: layer, matrixSet: matrixSet }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmxheWVycy5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY29udHJvbGxlcnMvb3BlbmxheWVycy5sYXllcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsSUFBSSxJQUFJLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsR0FBRyxJQUFJLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDNUUsT0FBTyxFQUFFLFNBQVMsSUFBSSxhQUFhLEVBQUUsR0FBRyxJQUFJLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxRQUFRLElBQUksb0JBQW9CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQ3hCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN4RCxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFBO0FBR3pELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxJQUFJLENBQUE7QUFDekIsSUFBTSxVQUFVLEdB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SUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0lBQ3hCLENBQUM7SUFDRCxtQ0FBUSxHQUFSLFVBQVMsS0FBVTtRQUNqQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQVUsQ0FBQTtRQUNqRCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN4QixLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxDQUFDO0lBQ0gsQ0FBQztJQUNELGtDQUFPLEdBQVAsVUFBUSxLQUFVO1FBQ2hCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3hDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUE7UUFDM0MsQ0FBQztJQUNILENBQUM7SUFDSCx1QkFBQztBQUFELENBQUMsQUF0R0QsSUFzR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMYXllcnMgfSBmcm9tICcuL2xheWVycydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgVGlsZSBhcyBUaWxlTGF5ZXIgfSBmcm9tICdvbC9sYXllcidcbmltcG9ydCB7IE9TTSBhcyBvbFNvdXJjZU9TTSwgQmluZ01hcHMsIFRpbGVXTVMsIFdNVFMsIFhZWiB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IHRyYW5zZm9ybSBhcyBwcm9qVHJhbnNmb3JtLCBnZXQgYXMgcHJvakdldCB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgeyBJbWFnZSBhcyBJbWFnZUxheWVyIH0gZnJvbSAnb2wvbGF5ZXInXG5pbXBvcnQgeyBJbWFnZVN0YXRpYyBhcyBJbWFnZVN0YXRpY1NvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IGRlZmF1bHRzIGFzIGludGVyYWN0aW9uc0RlZmF1bHRzIH0gZnJvbSAnb2wvaW50ZXJhY3Rpb24nXG5pbXBvcnQgeyBNYXAgfSBmcm9tICdvbCdcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBvcHRpb25zRnJvbUNhcGFiaWxpdGllcyB9IGZyb20gJ29sL3NvdXJjZS9XTVRTJ1xuaW1wb3J0IFdNVFNDYXBhYmlsaXRpZXMgZnJvbSAnb2wvZm9ybWF0L1dNVFNDYXBhYmlsaXRpZXMnXG5pbXBvcnQgeyBQcm9qZWN0aW9uTGlrZSB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgTGF5ZXIgZnJvbSAnb2wvbGF5ZXIvTGF5ZXInXG5pbXBvcnQgeyBWaWV3IH0gZnJvbSAnb2wnXG5jb25zdCBjcmVhdGVUaWxlID0gKFxuICB7IHNob3csIGFscGhhLCAuLi5vcHRpb25zIH06IGFueSxcbiAgU291cmNlOiBhbnksXG4gIExheWVyID0gVGlsZUxheWVyXG4pID0+XG4gIG5ldyBMYXllcih7XG4gICAgdmlzaWJsZTogc2hvdyxcbiAgICBwcmVsb2FkOiBJbmZpbml0eSxcbiAgICBvcGFjaXR5OiBhbHBoYSxcbiAgICBzb3VyY2U6IG5ldyBTb3VyY2Uob3B0aW9ucyksXG4gIH0pXG5jb25zdCBPU00gPSAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IHsgdXJsIH0gPSBvcHRzXG4gIHJldHVybiBjcmVhdGVUaWxlKFxuICAgIHtcbiAgICAgIC4uLm9wdHMsXG4gICAgICB1cmw6IHVybCArICh1cmwuaW5kZXhPZignL3t6fS97eH0ve3l9JykgPT09IC0xID8gJy97en0ve3h9L3t5fS5wbmcnIDogJycpLFxuICAgIH0sXG4gICAgb2xTb3VyY2VPU01cbiAgKVxufVxuY29uc3QgQk0gPSAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IGltYWdlcnlTZXQgPSBvcHRzLmltYWdlcnlTZXQgfHwgb3B0cy51cmxcbiAgcmV0dXJuIGNyZWF0ZVRpbGUoeyAuLi5vcHRzLCBpbWFnZXJ5U2V0IH0sIEJpbmdNYXBzKVxufVxuY29uc3QgV01TID0gKG9wdHM6IGFueSkgPT4ge1xuICBjb25zdCBwYXJhbXMgPSBvcHRzLnBhcmFtcyB8fCB7XG4gICAgTEFZRVJTOiBvcHRzLmxheWVycyxcbiAgICAuLi5vcHRzLnBhcmFtZXRlcnMsXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZVRpbGUoeyAuLi5vcHRzLCBwYXJhbXMgfSwgVGlsZVdNUylcbn1cbmNvbnN0IFdNVCA9IGFzeW5jIChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgeyB1cmwsIHdpdGhDcmVkZW50aWFscywgcHJveHlFbmFibGVkIH0gPSBvcHRzXG4gIGNvbnN0IG9yaWdpbmFsVXJsID0gcHJveHlFbmFibGVkXG4gICAgPyBuZXcgVVJMKHVybCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSlcbiAgICA6IG5ldyBVUkwodXJsKVxuICBjb25zdCBnZXRDYXBhYmlsaXRpZXNVcmwgPSBuZXcgVVJMKG9yaWdpbmFsVXJsKVxuICBnZXRDYXBhYmlsaXRpZXNVcmwuc2VhcmNoUGFyYW1zLnNldCgncmVxdWVzdCcsICdHZXRDYXBhYmlsaXRpZXMnKVxuICBjb25zdCByZXMgPSBhd2FpdCB3aW5kb3cuZmV0Y2goZ2V0Q2FwYWJpbGl0aWVzVXJsLCB7XG4gICAgY3JlZGVudGlhbHM6IHdpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6ICdzYW1lLW9yaWdpbicsXG4gIH0pXG4gIGNvbnN0IHRleHQgPSBhd2FpdCByZXMudGV4dCgpXG4gIGNvbnN0IHBhcnNlciA9IG5ldyBXTVRTQ2FwYWJpbGl0aWVzKClcbiAgY29uc3QgcmVzdWx0ID0gcGFyc2VyLnJlYWQodGV4dClcbiAgaWYgKChyZXN1bHQgYXMgYW55KS5Db250ZW50cy5MYXllci5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dNVFMgbWFwIGxheWVyIHNvdXJjZSBoYXMgbm8gbGF5ZXJzLicpXG4gIH1cbiAgbGV0IHsgbGF5ZXIsIG1hdHJpeFNldCB9ID0gb3B0c1xuICAvKiBJZiB0aWxlTWF0cml4U2V0SUQgaXMgcHJlc2VudCAoQ2VzaXVtIFdNVFMga2V5d29yZCkgc2V0IG1hdHJpeFNldCAoT3BlbkxheWVycyBXTVRTIGtleXdvcmQpICovXG4gIGlmIChvcHRzLnRpbGVNYXRyaXhTZXRJRCkge1xuICAgIG1hdHJpeFNldCA9IG9wdHMudGlsZU1hdHJpeFNldElEXG4gIH1cbiAgaWYgKCFsYXllcikge1xuICAgIGxheWVyID0gKHJlc3VsdCBhcyBhbnkpLkNvbnRlbnRzLkxheWVyWzBdLklkZW50aWZpZXJcbiAgfVxuICBjb25zdCBvcHRpb25zID0gb3B0aW9uc0Zyb21DYXBhYmlsaXRpZXMocmVzdWx0LCB7XG4gICAgLi4ub3B0cyxcbiAgICBsYXllcixcbiAgICBtYXRyaXhTZXQsXG4gIH0pXG4gIGlmIChvcHRpb25zID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXTVRTIG1hcCBsYXllciBzb3VyY2UgY291bGQgbm90IGJlIHNldHVwLicpXG4gIH1cbiAgaWYgKHByb3h5RW5hYmxlZCkge1xuICAgIC8vIFNldCB0aGlzIHRvIHRoZSBwcm94eSBVUkwuIE90aGVyd2lzZSwgT3BlbkxheWVycyB3aWxsIHVzZSB0aGUgVVJMIHByb3ZpZGVkIGJ5IHRoZVxuICAgIC8vIEdldENhcGFiaWxpdGllcyByZXNwb25zZS5cbiAgICBvcHRpb25zLnVybCA9IG9yaWdpbmFsVXJsLnRvU3RyaW5nKClcbiAgICBvcHRpb25zLnVybHMgPSBbb3JpZ2luYWxVcmwudG9TdHJpbmcoKV1cbiAgfVxuICByZXR1cm4gY3JlYXRlVGlsZShvcHRzLCAoKSA9PiBuZXcgV01UUyhvcHRpb25zKSlcbn1cbmNvbnN0IEFHTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgLy8gV2Ugc3RyaXAgdGhlIHRlbXBsYXRlIHBhcnQgb2YgdGhlIHVybCBiZWNhdXNlIHdlIHdpbGwgbWFudWFsbHkgZm9ybWF0XG4gIC8vIGl0IGluIHRoZSBgdGlsZVVybEZ1bmN0aW9uYCBmdW5jdGlvbi5cbiAgY29uc3QgdXJsID0gb3B0cy51cmwucmVwbGFjZSgndGlsZS97en0ve3l9L3t4fScsICcnKVxuICAvLyBhcmNnaXMgdXJsIGZvcm1hdDpcbiAgLy8gICAgICBodHRwOi8vPG1hcHNlcnZpY2UtdXJsPi90aWxlLzxsZXZlbD4vPHJvdz4vPGNvbHVtbj5cbiAgLy9cbiAgLy8gcmVmZXJlbmNlIGxpbmtzOlxuICAvLyAgLSBodHRwczovL29wZW5sYXllcnMub3JnL2VuL2xhdGVzdC9leGFtcGxlcy94eXotZXNyaS00MzI2LTUxMi5odG1sXG4gIC8vICAtIGh0dHBzOi8vZGV2ZWxvcGVycy5hcmNnaXMuY29tL3Jlc3Qvc2VydmljZXMtcmVmZXJlbmNlL21hcC10aWxlLmh0bVxuICBjb25zdCB0aWxlVXJsRnVuY3Rpb24gPSAodGlsZUNvb3JkOiBhbnkpID0+IHtcbiAgICBjb25zdCBbeiwgeCwgeV0gPSB0aWxlQ29vcmRcbiAgICByZXR1cm4gYCR7dXJsfS90aWxlLyR7eiAtIDF9LyR7LXkgLSAxfS8ke3h9YFxuICB9XG4gIHJldHVybiBjcmVhdGVUaWxlKHsgLi4ub3B0cywgdGlsZVVybEZ1bmN0aW9uIH0sIFhZWilcbn1cbmNvbnN0IFNJID0gKG9wdHM6IGFueSkgPT4ge1xuICBjb25zdCBpbWFnZUV4dGVudCA9XG4gICAgb3B0cy5pbWFnZUV4dGVudCB8fFxuICAgIHByb2pHZXQoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSk/LmdldEV4dGVudCgpXG4gIHJldHVybiBjcmVhdGVUaWxlKFxuICAgIHsgLi4ub3B0cywgaW1hZ2VFeHRlbnQsIC4uLm9wdHMucGFyYW1ldGVycyB9LFxuICAgIEltYWdlU3RhdGljU291cmNlLFxuICAgIEltYWdlTGF5ZXIgYXMgYW55XG4gIClcbn1cbmNvbnN0IHNvdXJjZXMgPSB7IE9TTSwgQk0sIFdNUywgV01ULCBBR00sIFNJIH0gYXMge1xuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cbmNvbnN0IGNyZWF0ZUxheWVyID0gKHR5cGU6IGFueSwgb3B0czogYW55KSA9PiB7XG4gIGNvbnN0IGZuID0gc291cmNlc1t0eXBlXVxuICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgbWFwIGxheWVyIHR5cGUgJHt0eXBlfWApXG4gIH1cbiAgcmV0dXJuIGZuKG9wdHMpXG59XG50eXBlIE1ha2VNYXBUeXBlID0ge1xuICB6b29tOiBudW1iZXJcbiAgbWluWm9vbTogbnVtYmVyXG4gIGNlbnRlcjogW251bWJlciwgbnVtYmVyXVxuICBlbGVtZW50OiBIVE1MRWxlbWVudFxufVxuZXhwb3J0IGNsYXNzIE9wZW5sYXllcnNMYXllcnMge1xuICBsYXllcnM6IExheWVyc1xuICBtYXA6IGFueVxuICBpc01hcENyZWF0ZWQ6IGJvb2xlYW5cbiAgbGF5ZXJGb3JDaWQ6IGFueVxuICBiYWNrYm9uZU1vZGVsOiBhbnlcbiAgY29uc3RydWN0b3IoeyBjb2xsZWN0aW9uIH06IHsgY29sbGVjdGlvbjogYW55IH0pIHtcbiAgICB0aGlzLmJhY2tib25lTW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoe30pXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSBmYWxzZVxuICAgIHRoaXMubGF5ZXJGb3JDaWQgPSB7fVxuICAgIGNvbnN0IGxheWVyUHJlZnMgPSBjb2xsZWN0aW9uXG4gICAgdGhpcy5sYXllcnMgPSBuZXcgTGF5ZXJzKGxheWVyUHJlZnMpXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdjaGFuZ2U6YWxwaGEnLFxuICAgICAgdGhpcy5zZXRBbHBoYS5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAnY2hhbmdlOnNob3cgY2hhbmdlOmFscGhhJyxcbiAgICAgIHRoaXMuc2V0U2hvdy5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhsYXllclByZWZzLCAnYWRkJywgdGhpcy5hZGRMYXllci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAncmVtb3ZlJyxcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIuYmluZCh0aGlzKVxuICAgIClcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ3NvcnQnLFxuICAgICAgdGhpcy5yZUluZGV4TGF5ZXJzLmJpbmQodGhpcylcbiAgICApXG4gIH1cbiAgbWFrZU1hcChtYXBPcHRpb25zOiBNYWtlTWFwVHlwZSkge1xuICAgIHRoaXMubGF5ZXJzLmxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgdGhpcy5hZGRMYXllcihsYXllcilcbiAgICB9KVxuICAgIGNvbnN0IHZpZXcgPSBuZXcgVmlldyh7XG4gICAgICBwcm9qZWN0aW9uOiBwcm9qR2V0KFxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gICAgICApIGFzIFByb2plY3Rpb25MaWtlLFxuICAgICAgY2VudGVyOiBwcm9qVHJhbnNmb3JtKFxuICAgICAgICBbMCwgMF0sXG4gICAgICAgICdFUFNHOjQzMjYnLFxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gICAgICApLFxuICAgICAgem9vbTogbWFwT3B0aW9ucy56b29tLFxuICAgICAgbWluWm9vbTogbWFwT3B0aW9ucy5taW5ab29tLFxuICAgIH0pXG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgdGFyZ2V0OiBtYXBPcHRpb25zLmVsZW1lbnQsXG4gICAgICB2aWV3LFxuICAgICAgaW50ZXJhY3Rpb25zOiBpbnRlcmFjdGlvbnNEZWZhdWx0cyh7IGRvdWJsZUNsaWNrWm9vbTogZmFsc2UgfSksXG4gICAgfVxuICAgIHRoaXMubWFwID0gbmV3IE1hcChjb25maWcpXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMubWFwXG4gIH1cbiAgYXN5bmMgYWRkTGF5ZXIobW9kZWw6IGFueSkge1xuICAgIGNvbnN0IHsgaWQsIHR5cGUgfSA9IG1vZGVsLnRvSlNPTigpXG4gICAgY29uc3Qgb3B0cyA9IF8ub21pdChtb2RlbC5hdHRyaWJ1dGVzLCAndHlwZScsICdsYWJlbCcsICdpbmRleCcsICdtb2RlbENpZCcpXG4gICAgb3B0cy5zaG93ID0gbW9kZWwuc2hvdWxkU2hvd0xheWVyKClcbiAgICB0cnkge1xuICAgICAgY29uc3QgbGF5ZXIgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoY3JlYXRlTGF5ZXIodHlwZSwgb3B0cykpXG4gICAgICB0aGlzLm1hcC5hZGRMYXllcihsYXllcilcbiAgICAgIHRoaXMubGF5ZXJGb3JDaWRbaWRdID0gbGF5ZXJcbiAgICAgIHRoaXMucmVJbmRleExheWVycygpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbW9kZWwuc2V0KCd3YXJuaW5nJywgZS5tZXNzYWdlKVxuICAgIH1cbiAgfVxuICByZW1vdmVMYXllcihtb2RlbDogYW55KSB7XG4gICAgY29uc3QgaWQgPSBtb2RlbC5nZXQoJ2lkJylcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbaWRdXG4gICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGxheWVyKVxuICAgIH1cbiAgICBkZWxldGUgdGhpcy5sYXllckZvckNpZFtpZF1cbiAgICB0aGlzLnJlSW5kZXhMYXllcnMoKVxuICB9XG4gIHJlSW5kZXhMYXllcnMoKSB7XG4gICAgdGhpcy5sYXllcnMubGF5ZXJzLmZvckVhY2goKG1vZGVsLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXVxuICAgICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGF5ZXIuc2V0WkluZGV4KC0oaW5kZXggKyAxKSlcbiAgICAgIH1cbiAgICB9LCB0aGlzKVxuICAgIHVzZXIuc2F2ZVByZWZlcmVuY2VzKClcbiAgfVxuICBzZXRBbHBoYShtb2RlbDogYW55KSB7XG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXSBhcyBMYXllclxuICAgIGlmIChsYXllciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXllci5zZXRPcGFjaXR5KHBhcnNlRmxvYXQobW9kZWwuZ2V0KCdhbHBoYScpKSlcbiAgICB9XG4gIH1cbiAgc2V0U2hvdyhtb2RlbDogYW55KSB7XG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXVxuICAgIGlmIChsYXllciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXllci5zZXRWaXNpYmxlKG1vZGVsLnNob3VsZFNob3dMYXllcigpKVxuICAgIH1cbiAgfVxufVxuIl19