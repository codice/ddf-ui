import { __extends, __read, __spreadArray } from "tslib";
import { Subscribable } from '../Base/base-classes';
import fetch from '../../../react-component/utils/fetch/fetch';
function getLocalCatalog(data) {
    return (data === null || data === void 0 ? void 0 : data.localSourceId) || 'local';
}
function getSourcePollInterval(data) {
    return (data === null || data === void 0 ? void 0 : data.config.sourcePollInterval) || 60000;
}
function markHarvestedSources(_a) {
    var sources = _a.sources, data = _a.data;
    sources.forEach(function (source) {
        var _a;
        source.harvested = (_a = data === null || data === void 0 ? void 0 : data.harvestedSources) === null || _a === void 0 ? void 0 : _a.includes(source.id);
    });
}
function updateSources(_a) {
    var data = _a.data, sources = _a.sources;
    if (data) {
        sources = removeLocalCatalogIfNeeded({ sources: sources, data: data });
        sources = removeCache({ sources: sources });
        markLocalSource({ sources: sources, data: data });
        markHarvestedSources({ sources: sources, data: data });
        sources = sortSources({ sources: sources });
        data.sources = sources;
    }
}
function removeLocalCatalogIfNeeded(_a) {
    var sources = _a.sources, data = _a.data;
    if (data === null || data === void 0 ? void 0 : data.disableLocalCatalog) {
        sources = sources.filter(function (source) { return source.id !== getLocalCatalog(data); });
    }
    return sources;
}
function removeCache(_a) {
    var sources = _a.sources;
    return sources.filter(function (source) { return source.id !== 'cache'; });
}
function markLocalSource(_a) {
    var sources = _a.sources, data = _a.data;
    var localSource = sources.find(function (source) { return source.id === getLocalCatalog(data); });
    if (localSource) {
        localSource.local = true;
    }
}
function sortSources(_a) {
    var sources = _a.sources;
    return sources.sort(function (a, b) {
        var aName = a.id.toLowerCase();
        var bName = b.id.toLowerCase();
        var aAvailable = a.available;
        var bAvailable = b.available;
        if ((aAvailable && bAvailable) || (!aAvailable && !bAvailable)) {
            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return 1;
            }
            return 0;
        }
        else if (!aAvailable) {
            return -1;
        }
        else if (!bAvailable) {
            return 1;
        }
        return 0;
    });
}
var Sources = /** @class */ (function (_super) {
    __extends(Sources, _super);
    function Sources(startupData) {
        var _this = _super.call(this) || this;
        _this.sources = [];
        _this.localSourceId = 'local';
        _this.harvestedSources = ['local'];
        _this.sourcePollInterval = 60000;
        _this.disableLocalCatalog = false;
        _this.fetchSources = function () {
            fetch('./internal/catalog/sources')
                .then(function (response) { return response.json(); })
                .then(function (sources) {
                _this.updateSources(sources);
            });
        };
        _this.startPollingSources = function () {
            _this._notifySubscribers({ thing: 'sources-initialized' });
            window.setInterval(function () {
                _this.fetchSources();
            }, _this.sourcePollInterval);
        };
        _this.updateSources = function (sources) {
            if (sources === void 0) { sources = []; }
            updateSources({ data: _this, sources: sources });
            _this._notifySubscribers({ thing: 'sources-update' });
        };
        _this.setHarvestedSources = function (harvestedSources) {
            if (harvestedSources === void 0) { harvestedSources = []; }
            if (_this.sources) {
                _this.harvestedSources =
                    harvestedSources.length > 0
                        ? __spreadArray(__spreadArray([], __read(harvestedSources), false), [_this.localSourceId], false) : [_this.localSourceId];
                _this.updateSources(_this.sources);
            }
        };
        startupData === null || startupData === void 0 ? void 0 : startupData.subscribeTo({
            subscribableThing: 'fetched',
            callback: function (startupPayload) {
                _this.sources = startupPayload.sources;
                _this.localSourceId = startupPayload.localSourceId;
                _this.harvestedSources = startupPayload.harvestedSources;
                _this.disableLocalCatalog = startupPayload.config.disableLocalCatalog;
                _this.sourcePollInterval = getSourcePollInterval(startupPayload);
                _this.setHarvestedSources(_this.harvestedSources);
                _this.startPollingSources();
            },
        });
        return _this;
    }
    return Sources;
}(Subscribable));
export { Sources };
//# sourceMappingURL=sources.js.map