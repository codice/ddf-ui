import { __assign, __awaiter, __generator, __read, __rest } from "tslib";
import { Layers } from './layers';
import _ from 'underscore';
import ol from 'openlayers';
import user from '../../component/singletons/user-instance';
import Backbone from 'backbone';
import { StartupDataStore } from '../model/Startup/startup';
var createTile = function (_a, Source, Layer) {
    var show = _a.show, alpha = _a.alpha, options = __rest(_a, ["show", "alpha"]);
    if (Layer === void 0) { Layer = ol.layer.Tile; }
    return new Layer({
        visible: show,
        preload: Infinity,
        opacity: alpha,
        source: new Source(options),
    });
};
var OSM = function (opts) {
    var url = opts.url;
    return createTile(__assign(__assign({}, opts), { url: url + (url.indexOf('/{z}/{x}/{y}') === -1 ? '/{z}/{x}/{y}.png' : '') }), ol.source.OSM);
};
var BM = function (opts) {
    var imagerySet = opts.imagerySet || opts.url;
    return createTile(__assign(__assign({}, opts), { imagerySet: imagerySet }), ol.source.BingMaps);
};
var WMS = function (opts) {
    var params = opts.params || __assign({ LAYERS: opts.layers }, opts.parameters);
    return createTile(__assign(__assign({}, opts), { params: params }), ol.source.TileWMS);
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
                parser = new ol.format.WMTSCapabilities();
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
                options = ol.source.WMTS.optionsFromCapabilities(result, __assign(__assign({}, opts), { layer: layer, matrixSet: matrixSet }));
                if (options === null) {
                    throw new Error('WMTS map layer source could not be setup.');
                }
                if (proxyEnabled) {
                    // Set this to the proxy URL. Otherwise, OpenLayers will use the URL provided by the
                    // GetCapabilities response.
                    options.url = originalUrl.toString();
                    options.urls = [originalUrl.toString()];
                }
                return [2 /*return*/, createTile(opts, function () { return new ol.source.WMTS(options); })];
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
    return createTile(__assign(__assign({}, opts), { tileUrlFunction: tileUrlFunction }), ol.source.XYZ);
};
var SI = function (opts) {
    var imageExtent = opts.imageExtent ||
        ol.proj.get(StartupDataStore.Configuration.getProjection()).getExtent();
    return createTile(__assign(__assign(__assign({}, opts), { imageExtent: imageExtent }), opts.parameters), ol.source.ImageStatic, ol.layer.Image);
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
        var view = new ol.View({
            projection: ol.proj.get(StartupDataStore.Configuration.getProjection()),
            center: ol.proj.transform([0, 0], 'EPSG:4326', StartupDataStore.Configuration.getProjection()),
            zoom: mapOptions.zoom,
            minZoom: mapOptions.minZoom,
        });
        var config = {
            target: mapOptions.element,
            view: view,
            interactions: ol.interaction.defaults({ doubleClickZoom: false }),
        };
        this.map = new ol.Map(config);
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
            layer.setOpacity(model.get('alpha'));
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
//# sourceMappingURL=openlayers.layers.js.map