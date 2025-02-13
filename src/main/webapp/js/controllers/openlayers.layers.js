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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmxheWVycy5sYXllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY29udHJvbGxlcnMvb3BlbmxheWVycy5sYXllcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFDM0IsT0FBTyxJQUFJLE1BQU0sMENBQTBDLENBQUE7QUFDM0QsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQzNELElBQU0sVUFBVSxHQUFHLFVBQ2pCLEVBQWdDLEVBQ2hDLE1BQVcsRUFDWCxLQUFxQjtJQUZuQixJQUFBLElBQUksVUFBQSxFQUFFLEtBQUssV0FBQSxFQUFLLE9BQU8sY0FBekIsaUJBQTJCLENBQUY7SUFFekIsc0JBQUEsRUFBQSxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSTtJQUVyQixPQUFBLElBQUksS0FBSyxDQUFDO1FBQ1IsT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsUUFBUTtRQUNqQixPQUFPLEVBQUUsS0FBSztRQUNkLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUM7S0FDNUIsQ0FBQyxDQUFBO0NBQUEsQ0FBQTtBQUNKLElBQU0sR0FBRyxHQUFHLFVBQUMsSUFBUztJQUNaLElBQUEsR0FBRyxHQUFLLElBQUksSUFBVCxDQUFTO0lBQ3BCLE9BQU8sVUFBVSx1QkFFVixJQUFJLEtBQ1AsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FB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SUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDeEMsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZCLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUE7U0FDMUM7SUFDSCxDQUFDO0lBQ0gsdUJBQUM7QUFBRCxDQUFDLEFBcEdELElBb0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGF5ZXJzIH0gZnJvbSAnLi9sYXllcnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IG9sIGZyb20gJ29wZW5sYXllcnMnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmNvbnN0IGNyZWF0ZVRpbGUgPSAoXG4gIHsgc2hvdywgYWxwaGEsIC4uLm9wdGlvbnMgfTogYW55LFxuICBTb3VyY2U6IGFueSxcbiAgTGF5ZXIgPSBvbC5sYXllci5UaWxlXG4pID0+XG4gIG5ldyBMYXllcih7XG4gICAgdmlzaWJsZTogc2hvdyxcbiAgICBwcmVsb2FkOiBJbmZpbml0eSxcbiAgICBvcGFjaXR5OiBhbHBoYSxcbiAgICBzb3VyY2U6IG5ldyBTb3VyY2Uob3B0aW9ucyksXG4gIH0pXG5jb25zdCBPU00gPSAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IHsgdXJsIH0gPSBvcHRzXG4gIHJldHVybiBjcmVhdGVUaWxlKFxuICAgIHtcbiAgICAgIC4uLm9wdHMsXG4gICAgICB1cmw6IHVybCArICh1cmwuaW5kZXhPZignL3t6fS97eH0ve3l9JykgPT09IC0xID8gJy97en0ve3h9L3t5fS5wbmcnIDogJycpLFxuICAgIH0sXG4gICAgb2wuc291cmNlLk9TTVxuICApXG59XG5jb25zdCBCTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgaW1hZ2VyeVNldCA9IG9wdHMuaW1hZ2VyeVNldCB8fCBvcHRzLnVybFxuICByZXR1cm4gY3JlYXRlVGlsZSh7IC4uLm9wdHMsIGltYWdlcnlTZXQgfSwgb2wuc291cmNlLkJpbmdNYXBzKVxufVxuY29uc3QgV01TID0gKG9wdHM6IGFueSkgPT4ge1xuICBjb25zdCBwYXJhbXMgPSBvcHRzLnBhcmFtcyB8fCB7XG4gICAgTEFZRVJTOiBvcHRzLmxheWVycyxcbiAgICAuLi5vcHRzLnBhcmFtZXRlcnMsXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZVRpbGUoeyAuLi5vcHRzLCBwYXJhbXMgfSwgb2wuc291cmNlLlRpbGVXTVMpXG59XG5jb25zdCBXTVQgPSBhc3luYyAob3B0czogYW55KSA9PiB7XG4gIGNvbnN0IHsgdXJsLCB3aXRoQ3JlZGVudGlhbHMsIHByb3h5RW5hYmxlZCB9ID0gb3B0c1xuICBjb25zdCBvcmlnaW5hbFVybCA9IHByb3h5RW5hYmxlZFxuICAgID8gbmV3IFVSTCh1cmwsIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpXG4gICAgOiBuZXcgVVJMKHVybClcbiAgY29uc3QgZ2V0Q2FwYWJpbGl0aWVzVXJsID0gbmV3IFVSTChvcmlnaW5hbFVybClcbiAgZ2V0Q2FwYWJpbGl0aWVzVXJsLnNlYXJjaFBhcmFtcy5zZXQoJ3JlcXVlc3QnLCAnR2V0Q2FwYWJpbGl0aWVzJylcbiAgY29uc3QgcmVzID0gYXdhaXQgd2luZG93LmZldGNoKGdldENhcGFiaWxpdGllc1VybCwge1xuICAgIGNyZWRlbnRpYWxzOiB3aXRoQ3JlZGVudGlhbHMgPyAnaW5jbHVkZScgOiAnc2FtZS1vcmlnaW4nLFxuICB9KVxuICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzLnRleHQoKVxuICBjb25zdCBwYXJzZXIgPSBuZXcgb2wuZm9ybWF0LldNVFNDYXBhYmlsaXRpZXMoKVxuICBjb25zdCByZXN1bHQgPSBwYXJzZXIucmVhZCh0ZXh0KVxuICBpZiAoKHJlc3VsdCBhcyBhbnkpLkNvbnRlbnRzLkxheWVyLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignV01UUyBtYXAgbGF5ZXIgc291cmNlIGhhcyBubyBsYXllcnMuJylcbiAgfVxuICBsZXQgeyBsYXllciwgbWF0cml4U2V0IH0gPSBvcHRzXG4gIC8qIElmIHRpbGVNYXRyaXhTZXRJRCBpcyBwcmVzZW50IChDZXNpdW0gV01UUyBrZXl3b3JkKSBzZXQgbWF0cml4U2V0IChPcGVuTGF5ZXJzIFdNVFMga2V5d29yZCkgKi9cbiAgaWYgKG9wdHMudGlsZU1hdHJpeFNldElEKSB7XG4gICAgbWF0cml4U2V0ID0gb3B0cy50aWxlTWF0cml4U2V0SURcbiAgfVxuICBpZiAoIWxheWVyKSB7XG4gICAgbGF5ZXIgPSAocmVzdWx0IGFzIGFueSkuQ29udGVudHMuTGF5ZXJbMF0uSWRlbnRpZmllclxuICB9XG4gIGNvbnN0IG9wdGlvbnMgPSBvbC5zb3VyY2UuV01UUy5vcHRpb25zRnJvbUNhcGFiaWxpdGllcyhyZXN1bHQsIHtcbiAgICAuLi5vcHRzLFxuICAgIGxheWVyLFxuICAgIG1hdHJpeFNldCxcbiAgfSlcbiAgaWYgKG9wdGlvbnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dNVFMgbWFwIGxheWVyIHNvdXJjZSBjb3VsZCBub3QgYmUgc2V0dXAuJylcbiAgfVxuICBpZiAocHJveHlFbmFibGVkKSB7XG4gICAgLy8gU2V0IHRoaXMgdG8gdGhlIHByb3h5IFVSTC4gT3RoZXJ3aXNlLCBPcGVuTGF5ZXJzIHdpbGwgdXNlIHRoZSBVUkwgcHJvdmlkZWQgYnkgdGhlXG4gICAgLy8gR2V0Q2FwYWJpbGl0aWVzIHJlc3BvbnNlLlxuICAgIG9wdGlvbnMudXJsID0gb3JpZ2luYWxVcmwudG9TdHJpbmcoKVxuICAgIG9wdGlvbnMudXJscyA9IFtvcmlnaW5hbFVybC50b1N0cmluZygpXVxuICB9XG4gIHJldHVybiBjcmVhdGVUaWxlKG9wdHMsICgpID0+IG5ldyBvbC5zb3VyY2UuV01UUyhvcHRpb25zKSlcbn1cbmNvbnN0IEFHTSA9IChvcHRzOiBhbnkpID0+IHtcbiAgLy8gV2Ugc3RyaXAgdGhlIHRlbXBsYXRlIHBhcnQgb2YgdGhlIHVybCBiZWNhdXNlIHdlIHdpbGwgbWFudWFsbHkgZm9ybWF0XG4gIC8vIGl0IGluIHRoZSBgdGlsZVVybEZ1bmN0aW9uYCBmdW5jdGlvbi5cbiAgY29uc3QgdXJsID0gb3B0cy51cmwucmVwbGFjZSgndGlsZS97en0ve3l9L3t4fScsICcnKVxuICAvLyBhcmNnaXMgdXJsIGZvcm1hdDpcbiAgLy8gICAgICBodHRwOi8vPG1hcHNlcnZpY2UtdXJsPi90aWxlLzxsZXZlbD4vPHJvdz4vPGNvbHVtbj5cbiAgLy9cbiAgLy8gcmVmZXJlbmNlIGxpbmtzOlxuICAvLyAgLSBodHRwczovL29wZW5sYXllcnMub3JnL2VuL2xhdGVzdC9leGFtcGxlcy94eXotZXNyaS00MzI2LTUxMi5odG1sXG4gIC8vICAtIGh0dHBzOi8vZGV2ZWxvcGVycy5hcmNnaXMuY29tL3Jlc3Qvc2VydmljZXMtcmVmZXJlbmNlL21hcC10aWxlLmh0bVxuICBjb25zdCB0aWxlVXJsRnVuY3Rpb24gPSAodGlsZUNvb3JkOiBhbnkpID0+IHtcbiAgICBjb25zdCBbeiwgeCwgeV0gPSB0aWxlQ29vcmRcbiAgICByZXR1cm4gYCR7dXJsfS90aWxlLyR7eiAtIDF9LyR7LXkgLSAxfS8ke3h9YFxuICB9XG4gIHJldHVybiBjcmVhdGVUaWxlKHsgLi4ub3B0cywgdGlsZVVybEZ1bmN0aW9uIH0sIG9sLnNvdXJjZS5YWVopXG59XG5jb25zdCBTSSA9IChvcHRzOiBhbnkpID0+IHtcbiAgY29uc3QgaW1hZ2VFeHRlbnQgPVxuICAgIG9wdHMuaW1hZ2VFeHRlbnQgfHxcbiAgICBvbC5wcm9qLmdldChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpKS5nZXRFeHRlbnQoKVxuICByZXR1cm4gY3JlYXRlVGlsZShcbiAgICB7IC4uLm9wdHMsIGltYWdlRXh0ZW50LCAuLi5vcHRzLnBhcmFtZXRlcnMgfSxcbiAgICBvbC5zb3VyY2UuSW1hZ2VTdGF0aWMsXG4gICAgb2wubGF5ZXIuSW1hZ2UgYXMgYW55XG4gIClcbn1cbmNvbnN0IHNvdXJjZXMgPSB7IE9TTSwgQk0sIFdNUywgV01ULCBBR00sIFNJIH0gYXMge1xuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cbmNvbnN0IGNyZWF0ZUxheWVyID0gKHR5cGU6IGFueSwgb3B0czogYW55KSA9PiB7XG4gIGNvbnN0IGZuID0gc291cmNlc1t0eXBlXVxuICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgbWFwIGxheWVyIHR5cGUgJHt0eXBlfWApXG4gIH1cbiAgcmV0dXJuIGZuKG9wdHMpXG59XG50eXBlIE1ha2VNYXBUeXBlID0ge1xuICB6b29tOiBudW1iZXJcbiAgbWluWm9vbTogbnVtYmVyXG4gIGNlbnRlcjogW251bWJlciwgbnVtYmVyXVxuICBlbGVtZW50OiBIVE1MRWxlbWVudFxufVxuZXhwb3J0IGNsYXNzIE9wZW5sYXllcnNMYXllcnMge1xuICBsYXllcnM6IExheWVyc1xuICBtYXA6IGFueVxuICBpc01hcENyZWF0ZWQ6IGJvb2xlYW5cbiAgbGF5ZXJGb3JDaWQ6IGFueVxuICBiYWNrYm9uZU1vZGVsOiBhbnlcbiAgY29uc3RydWN0b3IoeyBjb2xsZWN0aW9uIH06IHsgY29sbGVjdGlvbjogYW55IH0pIHtcbiAgICB0aGlzLmJhY2tib25lTW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoe30pXG4gICAgdGhpcy5pc01hcENyZWF0ZWQgPSBmYWxzZVxuICAgIHRoaXMubGF5ZXJGb3JDaWQgPSB7fVxuICAgIGNvbnN0IGxheWVyUHJlZnMgPSBjb2xsZWN0aW9uXG4gICAgdGhpcy5sYXllcnMgPSBuZXcgTGF5ZXJzKGxheWVyUHJlZnMpXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLmxpc3RlblRvKFxuICAgICAgbGF5ZXJQcmVmcyxcbiAgICAgICdjaGFuZ2U6YWxwaGEnLFxuICAgICAgdGhpcy5zZXRBbHBoYS5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAnY2hhbmdlOnNob3cgY2hhbmdlOmFscGhhJyxcbiAgICAgIHRoaXMuc2V0U2hvdy5iaW5kKHRoaXMpXG4gICAgKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhsYXllclByZWZzLCAnYWRkJywgdGhpcy5hZGRMYXllci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5saXN0ZW5UbyhcbiAgICAgIGxheWVyUHJlZnMsXG4gICAgICAncmVtb3ZlJyxcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIuYmluZCh0aGlzKVxuICAgIClcbiAgICB0aGlzLmJhY2tib25lTW9kZWwubGlzdGVuVG8oXG4gICAgICBsYXllclByZWZzLFxuICAgICAgJ3NvcnQnLFxuICAgICAgdGhpcy5yZUluZGV4TGF5ZXJzLmJpbmQodGhpcylcbiAgICApXG4gIH1cbiAgbWFrZU1hcChtYXBPcHRpb25zOiBNYWtlTWFwVHlwZSkge1xuICAgIHRoaXMubGF5ZXJzLmxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgdGhpcy5hZGRMYXllcihsYXllcilcbiAgICB9KVxuICAgIGNvbnN0IHZpZXcgPSBuZXcgb2wuVmlldyh7XG4gICAgICBwcm9qZWN0aW9uOiBvbC5wcm9qLmdldChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UHJvamVjdGlvbigpKSxcbiAgICAgIGNlbnRlcjogb2wucHJvai50cmFuc2Zvcm0oXG4gICAgICAgIFswLCAwXSxcbiAgICAgICAgJ0VQU0c6NDMyNicsXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQcm9qZWN0aW9uKClcbiAgICAgICksXG4gICAgICB6b29tOiBtYXBPcHRpb25zLnpvb20sXG4gICAgICBtaW5ab29tOiBtYXBPcHRpb25zLm1pblpvb20sXG4gICAgfSlcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICB0YXJnZXQ6IG1hcE9wdGlvbnMuZWxlbWVudCxcbiAgICAgIHZpZXcsXG4gICAgICBpbnRlcmFjdGlvbnM6IG9sLmludGVyYWN0aW9uLmRlZmF1bHRzKHsgZG91YmxlQ2xpY2tab29tOiBmYWxzZSB9KSxcbiAgICB9XG4gICAgdGhpcy5tYXAgPSBuZXcgb2wuTWFwKGNvbmZpZylcbiAgICB0aGlzLmlzTWFwQ3JlYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5tYXBcbiAgfVxuICBhc3luYyBhZGRMYXllcihtb2RlbDogYW55KSB7XG4gICAgY29uc3QgeyBpZCwgdHlwZSB9ID0gbW9kZWwudG9KU09OKClcbiAgICBjb25zdCBvcHRzID0gXy5vbWl0KG1vZGVsLmF0dHJpYnV0ZXMsICd0eXBlJywgJ2xhYmVsJywgJ2luZGV4JywgJ21vZGVsQ2lkJylcbiAgICBvcHRzLnNob3cgPSBtb2RlbC5zaG91bGRTaG93TGF5ZXIoKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBsYXllciA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShjcmVhdGVMYXllcih0eXBlLCBvcHRzKSlcbiAgICAgIHRoaXMubWFwLmFkZExheWVyKGxheWVyKVxuICAgICAgdGhpcy5sYXllckZvckNpZFtpZF0gPSBsYXllclxuICAgICAgdGhpcy5yZUluZGV4TGF5ZXJzKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBtb2RlbC5zZXQoJ3dhcm5pbmcnLCBlLm1lc3NhZ2UpXG4gICAgfVxuICB9XG4gIHJlbW92ZUxheWVyKG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBpZCA9IG1vZGVsLmdldCgnaWQnKVxuICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllckZvckNpZFtpZF1cbiAgICBpZiAobGF5ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIobGF5ZXIpXG4gICAgfVxuICAgIGRlbGV0ZSB0aGlzLmxheWVyRm9yQ2lkW2lkXVxuICAgIHRoaXMucmVJbmRleExheWVycygpXG4gIH1cbiAgcmVJbmRleExheWVycygpIHtcbiAgICB0aGlzLmxheWVycy5sYXllcnMuZm9yRWFjaCgobW9kZWwsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgICBpZiAobGF5ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsYXllci5zZXRaSW5kZXgoLShpbmRleCArIDEpKVxuICAgICAgfVxuICAgIH0sIHRoaXMpXG4gICAgdXNlci5zYXZlUHJlZmVyZW5jZXMoKVxuICB9XG4gIHNldEFscGhhKG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxheWVyLnNldE9wYWNpdHkobW9kZWwuZ2V0KCdhbHBoYScpKVxuICAgIH1cbiAgfVxuICBzZXRTaG93KG1vZGVsOiBhbnkpIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJGb3JDaWRbbW9kZWwuaWRdXG4gICAgaWYgKGxheWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxheWVyLnNldFZpc2libGUobW9kZWwuc2hvdWxkU2hvd0xheWVyKCkpXG4gICAgfVxuICB9XG59XG4iXX0=