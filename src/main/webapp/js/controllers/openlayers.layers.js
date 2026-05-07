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
import { View } from 'ol';
import { getWMTSCapabilities } from './wmts';
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
    var proxyEnabled, _a, result, layer, matrixSet, originalUrl, options;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                proxyEnabled = opts.proxyEnabled;
                return [4 /*yield*/, getWMTSCapabilities(opts)];
            case 1:
                _a = _b.sent(), result = _a.result, layer = _a.layer, matrixSet = _a.matrixSet, originalUrl = _a.originalUrl;
                options = optionsFromCapabilities(result, __assign(__assign({}, opts), { layer: layer, matrixSet: matrixSet }));
                if (options === null) {
                    throw new Error('WMTS map layer source could not be setup.');
                }
                // always set to true, as optionsFromCapabilities is too strict in how it determines wrapX
                options.wrapX = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmxheWVycy5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY29udHJvbGxlcnMvb3BlbmxheWVycy5sYXllcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsSUFBSSxJQUFJLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsR0FBRyxJQUFJLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDNUUsT0FBTyxFQUFFLFNBQVMsSUFBSSxhQUFhLEVBQUUsR0FBRyxJQUFJLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFBO0FBQzVELE9BQU8sRUFBRSxRQUFRLElBQUksb0JBQW9CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQ3hCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUd4RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQ3pCLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUM1QyxJQUFN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QTtZQUMvQixDQUFDO1FBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ1IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0lBQ3hCLENBQUM7SUFDRCxtQ0FBUSxHQUFSLFVBQVMsS0FBVTtRQUNqQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQVUsQ0FBQTtRQUNqRCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN4QixLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxDQUFDO0lBQ0gsQ0FBQztJQUNELGtDQUFPLEdBQVAsVUFBUSxLQUFVO1FBQ2hCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3hDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUE7UUFDM0MsQ0FBQztJQUNILENBQUM7SUFDSCx1QkFBQztBQUFELENBQUMsQUF0R0QsSUFzR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMYXllcnMgfSBmcm9tICcuL2xheWVycydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgVGlsZSBhcyBUaWxlTGF5ZXIgfSBmcm9tICdvbC9sYXllcidcbmltcG9ydCB7IE9TTSBhcyBvbFNvdXJjZU9TTSwgQmluZ01hcHMsIFRpbGVXTVMsIFdNVFMsIFhZWiB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IHRyYW5zZm9ybSBhcyBwcm9qVHJhbnNmb3JtLCBnZXQgYXMgcHJvakdldCB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQgeyBJbWFnZSBhcyBJbWFnZUxheWVyIH0gZnJvbSAnb2wvbGF5ZXInXG5pbXBvcnQgeyBJbWFnZVN0YXRpYyBhcyBJbWFnZVN0YXRpY1NvdXJjZSB9IGZyb20gJ29sL3NvdXJjZSdcbmltcG9ydCB7IGRlZmF1bHRzIGFzIGludGVyYWN0aW9uc0RlZmF1bHRzIH0gZnJvbSAnb2wvaW50ZXJhY3Rpb24nXG5pbXBvcnQgeyBNYXAgfSBmcm9tICdvbCdcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBvcHRpb25zRnJvbUNhcGFiaWxpdGllcyB9IGZyb20gJ29sL3NvdXJjZS9XTVRTJ1xuaW1wb3J0IHsgUHJvamVjdGlvbkxpa2UgfSBmcm9tICdvbC9wcm9qJ1xuaW1wb3J0IExheWVyIGZyb20gJ29sL2xheWVyL0xheWVyJ1xuaW1wb3J0IHsgVmlldyB9IGZyb20gJ29sJ1xuaW1wb3J0IHsgZ2V0V01UU0NhcGFiaWxpdGllcyB9IGZyb20gJy4vd210cydcbmNvbnN0IGNyZWF0ZVRpbGUgPSAoXG4gIHsgc2hvdywgYWxwaGEsIC4uLm9wdGlvbnMgfTogYW55LFxuICBTb3VyY2U6IGFueSxcbiAgTGF5ZXIgPSBUaWxlTGF5ZXJcbikgPT5cbiAgbmV3IExheWVyKHtcbiAgICB2aXNpYmxlOiBzaG93LFxuICAgIHByZWxvYWQ6IEluZmluaXR5LFxuICAgIG9wYWNpdHk6IGFscGhhLFxuICAgIHNvdXJjZTogbmV3IFNvdXJjZShvcHRpb25zKSxcbiAgfSlcbmNvbnN0IE9TTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgeyB1cmwgfSA9IG9wdHNcbiAgcmV0dXJuIGNyZWF0ZVRpbGUoXG4gICAge1xuICAgICAgLi4ub3B0cyxcbiAgICAgIHVybDogdXJsICsgKHVybC5pbmRleE9mKCcve3p9L3t4fS97eX0nKSA9PT0gLTEgPyAnL3t6fS97eH0ve3l9LnBuZycgOiAnJyksXG4gICAgfSxcbiAgICBvbFNvdXJjZU9TTVxuICApXG59XG5jb25zdCBCTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgaW1hZ2VyeVNldCA9IG9wdHMuaW1hZ2VyeVNldCB8fCBvcHRzLnVybFxuICByZXR1cm4gY3JlYXRlVGlsZSh7IC4uLm9wdHMsIGltYWdlcnlTZXQgfSwgQmluZ01hcHMpXG59XG5jb25zdCBXTVMgPSAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IHBhcmFtcyA9IG9wdHMucGFyYW1zIHx8IHtcbiAgICBMQVlFUlM6IG9wdHMubGF5ZXJzLFxuICAgIC4uLm9wdHMucGFyYW1ldGVycyxcbiAgfVxuICByZXR1cm4gY3JlYXRlVGlsZSh7IC4uLm9wdHMsIHBhcmFtcyB9LCBUaWxlV01TKVxufVxuXG5jb25zdCBXTVQgPSBhc3luYyAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IHsgcHJveHlFbmFibGVkIH0gPSBvcHRzXG4gIGNvbnN0IHsgcmVzdWx0LCBsYXllciwgbWF0cml4U2V0LCBvcmlnaW5hbFVybCB9ID0gYXdhaXQgZ2V0V01UU0NhcGFiaWxpdGllcyhcbiAgICBvcHRzXG4gIClcblxuICBjb25zdCBvcHRpb25zID0gb3B0aW9uc0Zyb21DYXBhYmlsaXRpZXMocmVzdWx0LCB7XG4gICAgLi4ub3B0cyxcbiAgICBsYXllcixcbiAgICBtYXRyaXhTZXQsXG4gIH0pXG4gIGlmIChvcHRpb25zID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXTVRTIG1hcCBsYXllciBzb3VyY2UgY291bGQgbm90IGJlIHNldHVwLicpXG4gIH1cbiAgLy8gYWx3YXlzIHNldCB0byB0cnVlLCBhcyBvcHRpb25zRnJvbUNhcGFiaWxpdGllcyBpcyB0b28gc3RyaWN0IGluIGhvdyBpdCBkZXRlcm1pbmVzIHdyYXBYXG4gIG9wdGlvbnMud3JhcFggPSB0cnVlXG5cbiAgaWYgKHByb3h5RW5hYmxlZCkge1xuICAgIC8vIFNldCB0aGlzIHRvIHRoZSBwcm94eSBVUkwuIE90aGVyd2lzZSwgT3BlbkxheWVycyB3aWxsIHVzZSB0aGUgVVJMIHByb3ZpZGVkIGJ5IHRoZVxuICAgIC8vIEdldENhcGFiaWxpdGllcyByZXNwb25zZS5cbiAgICBvcHRpb25zLnVybCA9IG9yaWdpbmFsVXJsLnRvU3RyaW5nKClcbiAgICBvcHRpb25zLnVybHMgPSBbb3JpZ2luYWxVcmwudG9TdHJpbmcoKV1cbiAgfVxuICByZXR1cm4gY3JlYXRlVGlsZShvcHRzLCAoKSA9PiBuZXcgV01UUyhvcHRpb25zKSlcbn1cbmNvbnN0IEFHTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgLy8gV2Ugc3RyaXAgdGhlIHRlbXBsYXRlIHBhcnQgb2YgdGhlIHVybCBiZWNhdXNlIHdlIHdpbGwgbWFudWFsbHkgZm9ybWF0XG4gIC8vIGl0IGluIHRoZSBgdGlsZVVybEZ1bmN0aW9uYCBmdW5jdGlvbi5cbiAgY29uc3QgdXJsID0gb3B0cy51cmwucmVwbGFjZSgndGlsZS97en0ve3l9L3t4fScsICcnKVxuICAvLyBhcmNnaXMgdXJsIGZvcm1hdDpcbiAgLy8gICAgICBodHRwOi8vPG1hcHNlcnZpY2UtdXJsPi90aWxlLzxsZXZlbD4vPHJvdz4vPGNvbHVtbj5cbiAgLy9cbiAgLy8gcmVmZXJlbmNlIGxpbmtzOlxuICAvLyAgLSBodHRwczovL29wZW5sYXllcnMub3JnL2VuL2xhdGVzdC9leGFtcGxlcy94eXotZXNyaS00MzI2LTUxMi5odG1sXG4gIC8vICAtIGh0dHBzOi8vZGV2ZWxvcGVycy5hcmNnaXMuY29tL3Jlc3Qvc2VydmljZXMtcmVmZXJlbmNlL21hcC10aWxlLmh0bVxuICBjb25zdCB0aWxlVXJsRnVuY3Rpb24gPSAodGlsZUNvb3JkOiBhbnkpID0+IHtcbiAgICBjb25zdCBbeiwgeCwgeV0gPSB0aWxlQ29vcmRcbiAgICByZXR1cm4gYCR7dXJsfS90aWxlLyR7eiAtIDF9LyR7LXkgLSAxfS8ke3h9YFxuICB9XG4gIHJldHVybiBjcmVhdGVUaWxlKHsgLi4ub3B0cywgdGlsZVVybEZ1bmN0aW9uIH0sIFhZWilcbn1cbmNvbnN0IFNJID0gKG9wdHM6IGFueSkgPT4ge1xuICBjb25zdCBpbWFnZUV4dGVudCA9XG4gICAgb3B0cy5pbWFnZUV4dGVudCB8fFxuICAgIHByb2pHZXQoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFByb2plY3Rpb24oKSk/LmdldEV4dGVudCgpXG4gIHJldHVybiBjcmVhdGVUaWxlKFxuICAgIHsgLi4ub3B0cywgaW1hZ2VFeHRlbnQsIC4uLm9wdHMucGFyYW1ldGVycyB9LFxuICAgIEltYWdlU3RhdGljU291cmNlLFxuICAgIEltYWdlTGF5ZXIgYXMgYW55XG4gIClcbn1cbmNvbnN0IHNvdXJjZXMgPSB7IE9TTSwgQk0sIFdNUywgV01ULCBBR00sIFNJIH0gYXMge1xuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cbmNvbnN0IGNyZWF0ZUxheWVyID0gKHR5cGU6IGFueSwgb3B0czogYW55KSA9PiB7XG4gIGNvbnN0IGZuID0gc291cmNlc1t0eXBlXVxuICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgbWFwIGxheWVyIHR5cGUgJHt0eXBlfWApXG4gIH1cbiAgcmV0dXJuIGZuKG9wdHMpXG59XG50eXBlIE1ha2VNYXBUeXBlID0ge1xuICB6b29tOiBudW1iZXJcbiAgbWluWm9vbTogbnVtYmVyXG4gIGNlbnRlcjogW251bWJlciwgbnVtYmVyXVxuICBlbGVtZW50OiBIVE1MRWxlbWVudFxufVxuZXhwb3J0IGNsYXNzIE9wZW5sYXllcnNMYXllcnMge1xuICBsYXllcnM6IExheWVyc1xuICBtYXA6IGFueVxuICBpc01hcENyZWF0ZWQ6IGJvb2xlYW5cbiAgbGF5ZXJGb3JDaWQ6IGFueVxuICBiYWNrYm9uZU1vZGVsOiBhbnlcbiAgY29uc3RydWN0b3IoeyBjb2xsZWN0aW9uIH06IHsgY29sbGVjdGlvbjogYW55IH0pIHtcbiAgICB0aGlzLmJhY2tib25lTW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoe30pXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSBmYWxzZVxuICAgIHRoaXMubGF5ZXJGb3JDaWQgPSB7fVxuICAgIGNvbnN0IGxheWVyUHJlZnMgPSBjb2xsZWN0aW9uXG4gICAgdGhpcy5sYXllcnMgPSBuZXcgTGF5ZXJzKGxheWVyUHJlZnMpXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdjaGFuZ2U6YWxwaGEnLFxuICAgICAgdGhpcy5zZXRBbHBoYS5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAnY2hhbmdlOnNob3cgY2hhbmdlOmFscGhhJyxcbiAgICAgIHRoaXMuc2V0U2hvdy5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhsYXllclByZWZzLCAnYWRkJywgdGhpcy5hZGRMYXllci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAncmVtb3ZlJyxcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIuYmluZCh0aGlzKVxuICAgIClcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ3NvcnQnLFxuICAgICAgdGhpcy5yZUluZGV4TGF5ZXJzLmJpbmQodGhpcylcbiAgICApXG4gIH1cbiAgbWFrZU1hcChtYXBPcHRpb25zOiBNYWtlTWFwVHlwZSkge1xuICAgIHRoaXMubGF5ZXJzLmxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgdGhpcy5hZGRMYXllcihsYXllcilcbiAgICB9KVxuICAgIGNvbnN0IHZpZXcgPSBuZXcgVmlldyh7XG4gICAgICBwcm9qZWN0aW9uOiBwcm9qR2V0KFxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gICAgICApIGFzIFByb2plY3Rpb25MaWtlLFxuICAgICAgY2VudGVyOiBwcm9qVHJhbnNmb3JtKFxuICAgICAgICBbMCwgMF0sXG4gICAgICAgICdFUFNHOjQzMjYnLFxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpXG4gICAgICApLFxuICAgICAgem9vbTogbWFwT3B0aW9ucy56b29tLFxuICAgICAgbWluWm9vbTogbWFwT3B0aW9ucy5taW5ab29tLFxuICAgIH0pXG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgdGFyZ2V0OiBtYXBPcHRpb25zLmVsZW1lbnQsXG4gICAgICB2aWV3LFxuICAgICAgaW50ZXJhY3Rpb25zOiBpbnRlcmFjdGlvbnNEZWZhdWx0cyh7IGRvdWJsZUNsaWNrWm9vbTogZmFsc2UgfSksXG4gICAgfVxuICAgIHRoaXMubWFwID0gbmV3IE1hcChjb25maWcpXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMubWFwXG4gIH1cbiAgYXN5bmMgYWRkTGF5ZXIobW9kZWw6IGFueSkge1xuICAgIGNvbnN0IHsgaWQsIHR5cGUgfSA9IG1vZGVsLnRvSlNPTigpXG4gICAgY29uc3Qgb3B0cyA9IF8ub21pdChtb2RlbC5hdHRyaWJ1dGVzLCAndHlwZScsICdsYWJlbCcsICdpbmRleCcsICdtb2RlbENpZCcpXG4gICAgb3B0cy5zaG93ID0gbW9kZWwuc2hvdWxkU2hvd0xheWVyKClcbiAgICB0cnkge1xuICAgICAgY29uc3QgbGF5ZXIgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoY3JlYXRlTGF5ZXIodHlwZSwgb3B0cykpXG4gICAgICB0aGlzLm1hcC5hZGRMYXllcihsYXllcilcbiAgICAgIHRoaXMubGF5ZXJGb3JDaWRbaWRdID0gbGF5ZXJcbiAgICAgIHRoaXMucmVJbmRleExheWVycygpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbW9kZWwuc2V0KCd3YXJuaW5nJywgZS5tZXNzYWdlKVxuICAgIH1cbiAgfVxuICByZW1vdmVMYXllcihtb2RlbDogYW55KSB7XG4gICAgY29uc3QgaWQgPSBtb2RlbC5nZXQoJ2lkJylcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbaWRdXG4gICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGxheWVyKVxuICAgIH1cbiAgICBkZWxldGUgdGhpcy5sYXllckZvckNpZFtpZF1cbiAgICB0aGlzLnJlSW5kZXhMYXllcnMoKVxuICB9XG4gIHJlSW5kZXhMYXllcnMoKSB7XG4gICAgdGhpcy5sYXllcnMubGF5ZXJzLmZvckVhY2goKG1vZGVsLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXVxuICAgICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGF5ZXIuc2V0WkluZGV4KC0oaW5kZXggKyAxKSlcbiAgICAgIH1cbiAgICB9LCB0aGlzKVxuICAgIHVzZXIuc2F2ZVByZWZlcmVuY2VzKClcbiAgfVxuICBzZXRBbHBoYShtb2RlbDogYW55KSB7XG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXSBhcyBMYXllclxuICAgIGlmIChsYXllciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXllci5zZXRPcGFjaXR5KHBhcnNlRmxvYXQobW9kZWwuZ2V0KCdhbHBoYScpKSlcbiAgICB9XG4gIH1cbiAgc2V0U2hvdyhtb2RlbDogYW55KSB7XG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVyRm9yQ2lkW21vZGVsLmlkXVxuICAgIGlmIChsYXllciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXllci5zZXRWaXNpYmxlKG1vZGVsLnNob3VsZFNob3dMYXllcigpKVxuICAgIH1cbiAgfVxufVxuIl19