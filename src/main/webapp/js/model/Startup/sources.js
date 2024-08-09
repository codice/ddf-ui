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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9TdGFydHVwL3NvdXJjZXMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFHbkQsT0FBTyxLQUFLLE1BQU0sNENBQTRDLENBQUE7QUFFOUQsU0FBUyxlQUFlLENBQUMsSUFBYztJQUNyQyxPQUFPLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLGFBQWEsS0FBSSxPQUFPLENBQUE7QUFDdkMsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsSUFBeUI7SUFDdEQsT0FBTyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxNQUFNLENBQUMsa0JBQWtCLEtBQUksS0FBSyxDQUFBO0FBQ2pELENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLEVBTTdCO1FBTEMsT0FBTyxhQUFBLEVBQ1AsSUFBSSxVQUFBO0lBS0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07O1FBQ3JCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsZ0JBQWdCLDBDQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDaEUsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsRUFNdEI7UUFMQyxJQUFJLFVBQUEsRUFDSixPQUFPLGFBQUE7SUFLUCxJQUFJLElBQUksRUFBRTtRQUNSLE9BQU8sR0FBRywwQkFBMEIsQ0FBQyxFQUFFLE9BQU8sU0FBQSxFQUFFLElBQUksTUFBQSxFQUFFLENBQUMsQ0FBQTtRQUN2RCxPQUFPLEdBQUcsV0FBVyxDQUFDLEVBQUUsT0FBTyxTQUFBLEVBQUUsQ0FBQyxDQUFBO1FBQ2xDLGVBQWUs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LGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsV0FBVyxDQUFDO1lBQ3ZCLGlCQUFpQixFQUFFLFNBQVM7WUFDNUIsUUFBUSxFQUFFLFVBQUMsY0FBYztnQkFDdkIsS0FBSSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFBO2dCQUNyQyxLQUFJLENBQUMsYUFBYSxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUE7Z0JBQ2pELEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUE7Z0JBQ3ZELEtBQUksQ0FBQyxtQkFBbUIsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFBO2dCQUNwRSxLQUFJLENBQUMsa0JBQWtCLEdBQUcscUJBQXFCLENBQUMsY0FBYyxDQUFDLENBQUE7Z0JBQy9ELEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDL0MsS0FBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7WUFDNUIsQ0FBQztTQUNGLENBQUMsQ0FBQTs7SUFDSixDQUFDO0lBNkJILGNBQUM7QUFBRCxDQUFDLEFBcERELENBQXNCLFlBQVksR0FvRGpDO0FBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3Vic2NyaWJhYmxlIH0gZnJvbSAnLi4vQmFzZS9iYXNlLWNsYXNzZXMnXG5pbXBvcnQgeyBTdGFydHVwUGF5bG9hZFR5cGUgfSBmcm9tICcuL3N0YXJ0dXAudHlwZXMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YSB9IGZyb20gJy4vc3RhcnR1cCdcbmltcG9ydCBmZXRjaCBmcm9tICcuLi8uLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZmV0Y2gvZmV0Y2gnXG5cbmZ1bmN0aW9uIGdldExvY2FsQ2F0YWxvZyhkYXRhPzogU291cmNlcykge1xuICByZXR1cm4gZGF0YT8ubG9jYWxTb3VyY2VJZCB8fCAnbG9jYWwnXG59XG5cbmZ1bmN0aW9uIGdldFNvdXJjZVBvbGxJbnRlcnZhbChkYXRhPzogU3RhcnR1cFBheWxvYWRUeXBlKSB7XG4gIHJldHVybiBkYXRhPy5jb25maWcuc291cmNlUG9sbEludGVydmFsIHx8IDYwMDAwXG59XG5cbmZ1bmN0aW9uIG1hcmtIYXJ2ZXN0ZWRTb3VyY2VzKHtcbiAgc291cmNlcyxcbiAgZGF0YSxcbn06IHtcbiAgc291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydzb3VyY2VzJ11cbiAgZGF0YT86IFNvdXJjZXNcbn0pIHtcbiAgc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICBzb3VyY2UuaGFydmVzdGVkID0gZGF0YT8uaGFydmVzdGVkU291cmNlcz8uaW5jbHVkZXMoc291cmNlLmlkKVxuICB9KVxufVxuXG5mdW5jdGlvbiB1cGRhdGVTb3VyY2VzKHtcbiAgZGF0YSxcbiAgc291cmNlcyxcbn06IHtcbiAgZGF0YT86IFNvdXJjZXNcbiAgc291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydzb3VyY2VzJ11cbn0pIHtcbiAgaWYgKGRhdGEpIHtcbiAgICBzb3VyY2VzID0gcmVtb3ZlTG9jYWxDYXRhbG9nSWZOZWVkZWQoeyBzb3VyY2VzLCBkYXRhIH0pXG4gICAgc291cmNlcyA9IHJlbW92ZUNhY2hlKHsgc291cmNlcyB9KVxuICAgIG1hcmtMb2NhbFNvdXJjZSh7IHNvdXJjZXMsIGRhdGEgfSlcbiAgICBtYXJrSGFydmVzdGVkU291cmNlcyh7IHNvdXJjZXMsIGRhdGEgfSlcbiAgICBzb3VyY2VzID0gc29ydFNvdXJjZXMoeyBzb3VyY2VzIH0pXG4gICAgZGF0YS5zb3VyY2VzID0gc291cmNlc1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUxvY2FsQ2F0YWxvZ0lmTmVlZGVkKHtcbiAgc291cmNlcyxcbiAgZGF0YSxcbn06IHtcbiAgc291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydzb3VyY2VzJ11cbiAgZGF0YT86IFNvdXJjZXNcbn0pIHtcbiAgaWYgKGRhdGE/LmRpc2FibGVMb2NhbENhdGFsb2cpIHtcbiAgICBzb3VyY2VzID0gc291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmlkICE9PSBnZXRMb2NhbENhdGFsb2coZGF0YSkpXG4gIH1cbiAgcmV0dXJuIHNvdXJjZXNcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2FjaGUoeyBzb3VyY2VzIH06IHsgc291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydzb3VyY2VzJ10gfSkge1xuICByZXR1cm4gc291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmlkICE9PSAnY2FjaGUnKVxufVxuXG5mdW5jdGlvbiBtYXJrTG9jYWxTb3VyY2Uoe1xuICBzb3VyY2VzLFxuICBkYXRhLFxufToge1xuICBzb3VyY2VzOiBTdGFydHVwUGF5bG9hZFR5cGVbJ3NvdXJjZXMnXVxuICBkYXRhPzogU291cmNlc1xufSkge1xuICBjb25zdCBsb2NhbFNvdXJjZSA9IHNvdXJjZXMuZmluZChcbiAgICAoc291cmNlKSA9PiBzb3VyY2UuaWQgPT09IGdldExvY2FsQ2F0YWxvZyhkYXRhKVxuICApXG4gIGlmIChsb2NhbFNvdXJjZSkge1xuICAgIGxvY2FsU291cmNlLmxvY2FsID0gdHJ1ZVxuICB9XG59XG5cbmZ1bmN0aW9uIHNvcnRTb3VyY2VzKHsgc291cmNlcyB9OiB7IHNvdXJjZXM6IFN0YXJ0dXBQYXlsb2FkVHlwZVsnc291cmNlcyddIH0pIHtcbiAgcmV0dXJuIHNvdXJjZXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGNvbnN0IGFOYW1lID0gYS5pZC50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3QgYk5hbWUgPSBiLmlkLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBhQXZhaWxhYmxlID0gYS5hdmFpbGFibGVcbiAgICBjb25zdCBiQXZhaWxhYmxlID0gYi5hdmFpbGFibGVcbiAgICBpZiAoKGFBdmFpbGFibGUgJiYgYkF2YWlsYWJsZSkgfHwgKCFhQXZhaWxhYmxlICYmICFiQXZhaWxhYmxlKSkge1xuICAgICAgaWYgKGFOYW1lIDwgYk5hbWUpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpZiAoYU5hbWUgPiBiTmFtZSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgcmV0dXJuIDBcbiAgICB9IGVsc2UgaWYgKCFhQXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9IGVsc2UgaWYgKCFiQXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cbiAgICByZXR1cm4gMFxuICB9KVxufVxuXG5jbGFzcyBTb3VyY2VzIGV4dGVuZHMgU3Vic2NyaWJhYmxlPHtcbiAgdGhpbmc6ICdzb3VyY2VzLWluaXRpYWxpemVkJyB8ICdzb3VyY2VzLXVwZGF0ZSdcbn0+IHtcbiAgc291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydzb3VyY2VzJ10gPSBbXVxuICBsb2NhbFNvdXJjZUlkOiBTdGFydHVwUGF5bG9hZFR5cGVbJ2xvY2FsU291cmNlSWQnXSA9ICdsb2NhbCdcbiAgaGFydmVzdGVkU291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydoYXJ2ZXN0ZWRTb3VyY2VzJ10gPSBbJ2xvY2FsJ11cbiAgc291cmNlUG9sbEludGVydmFsOiBTdGFydHVwUGF5bG9hZFR5cGVbJ2NvbmZpZyddWydzb3VyY2VQb2xsSW50ZXJ2YWwnXSA9IDYwMDAwXG4gIGRpc2FibGVMb2NhbENhdGFsb2c6IFN0YXJ0dXBQYXlsb2FkVHlwZVsnY29uZmlnJ11bJ2Rpc2FibGVMb2NhbENhdGFsb2cnXSA9XG4gICAgZmFsc2VcbiAgY29uc3RydWN0b3Ioc3RhcnR1cERhdGE/OiBTdGFydHVwRGF0YSkge1xuICAgIHN1cGVyKClcbiAgICBzdGFydHVwRGF0YT8uc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmZXRjaGVkJyxcbiAgICAgIGNhbGxiYWNrOiAoc3RhcnR1cFBheWxvYWQpID0+IHtcbiAgICAgICAgdGhpcy5zb3VyY2VzID0gc3RhcnR1cFBheWxvYWQuc291cmNlc1xuICAgICAgICB0aGlzLmxvY2FsU291cmNlSWQgPSBzdGFydHVwUGF5bG9hZC5sb2NhbFNvdXJjZUlkXG4gICAgICAgIHRoaXMuaGFydmVzdGVkU291cmNlcyA9IHN0YXJ0dXBQYXlsb2FkLmhhcnZlc3RlZFNvdXJjZXNcbiAgICAgICAgdGhpcy5kaXNhYmxlTG9jYWxDYXRhbG9nID0gc3RhcnR1cFBheWxvYWQuY29uZmlnLmRpc2FibGVMb2NhbENhdGFsb2dcbiAgICAgICAgdGhpcy5zb3VyY2VQb2xsSW50ZXJ2YWwgPSBnZXRTb3VyY2VQb2xsSW50ZXJ2YWwoc3RhcnR1cFBheWxvYWQpXG4gICAgICAgIHRoaXMuc2V0SGFydmVzdGVkU291cmNlcyh0aGlzLmhhcnZlc3RlZFNvdXJjZXMpXG4gICAgICAgIHRoaXMuc3RhcnRQb2xsaW5nU291cmNlcygpXG4gICAgICB9LFxuICAgIH0pXG4gIH1cblxuICBmZXRjaFNvdXJjZXMgPSAoKSA9PiB7XG4gICAgZmV0Y2goJy4vaW50ZXJuYWwvY2F0YWxvZy9zb3VyY2VzJylcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgLnRoZW4oKHNvdXJjZXMpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTb3VyY2VzKHNvdXJjZXMpXG4gICAgICB9KVxuICB9XG5cbiAgc3RhcnRQb2xsaW5nU291cmNlcyA9ICgpID0+IHtcbiAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnc291cmNlcy1pbml0aWFsaXplZCcgfSlcbiAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5mZXRjaFNvdXJjZXMoKVxuICAgIH0sIHRoaXMuc291cmNlUG9sbEludGVydmFsKVxuICB9XG4gIHVwZGF0ZVNvdXJjZXMgPSAoc291cmNlczogU3RhcnR1cFBheWxvYWRUeXBlWydzb3VyY2VzJ10gPSBbXSkgPT4ge1xuICAgIHVwZGF0ZVNvdXJjZXMoeyBkYXRhOiB0aGlzLCBzb3VyY2VzIH0pXG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ3NvdXJjZXMtdXBkYXRlJyB9KVxuICB9XG4gIHNldEhhcnZlc3RlZFNvdXJjZXMgPSAoaGFydmVzdGVkU291cmNlczogc3RyaW5nW10gPSBbXSkgPT4ge1xuICAgIGlmICh0aGlzLnNvdXJjZXMpIHtcbiAgICAgIHRoaXMuaGFydmVzdGVkU291cmNlcyA9XG4gICAgICAgIGhhcnZlc3RlZFNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICAgID8gWy4uLmhhcnZlc3RlZFNvdXJjZXMsIHRoaXMubG9jYWxTb3VyY2VJZF1cbiAgICAgICAgICA6IFt0aGlzLmxvY2FsU291cmNlSWRdXG4gICAgICB0aGlzLnVwZGF0ZVNvdXJjZXModGhpcy5zb3VyY2VzKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBTb3VyY2VzIH1cbiJdfQ==