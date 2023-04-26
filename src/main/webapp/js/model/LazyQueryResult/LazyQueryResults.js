import { __assign, __read, __spreadArray } from "tslib";
import { generateCompareFunction } from './sort';
import { LazyQueryResult } from './LazyQueryResult';
import { Status } from './status';
import _ from 'underscore';
var debounceTime = 50;
import Backbone from 'backbone';
/**
 * Constructed with performance in mind, taking advantage of maps whenever possible.
 * This is the heart of our app, so take care when updating / adding things here to
 * do it with performance in mind.
 *
 */
var LazyQueryResults = /** @class */ (function () {
    function LazyQueryResults(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.results, results = _c === void 0 ? [] : _c, _d = _b.sorts, sorts = _d === void 0 ? [] : _d, _e = _b.sources, sources = _e === void 0 ? [] : _e, transformSorts = _b.transformSorts;
        /**
         * Pass a function that returns the sorts to use, allowing such things as substituting ephemeral sorts
         */
        this.transformSorts = function (_a) {
            var originalSorts = _a.originalSorts;
            return originalSorts;
        };
        this.reset({ results: results, sorts: sorts, sources: sources, transformSorts: transformSorts });
        this.backboneModel = new Backbone.Model({
            id: Math.random().toString()
        });
    }
    LazyQueryResults.prototype.subscribeTo = function (_a) {
        var _this = this;
        var subscribableThing = _a.subscribableThing, callback = _a.callback;
        var id = Math.random().toString();
        // @ts-ignore remove when we upgrade ace to use latest typescript
        this["subscriptionsToMe.".concat(subscribableThing)][id] = callback;
        return function () {
            // @ts-ignore remove when we upgrade ace to use latest typescript
            delete _this["subscriptionsToMe.".concat(subscribableThing)][id];
        };
    };
    LazyQueryResults.prototype._notifySubscribers = function (subscribableThing) {
        // @ts-ignore remove when we upgrade ace to use latest typescript
        var subscribers = this["subscriptionsToMe.".concat(subscribableThing)];
        Object.values(subscribers).forEach(function (callback) { return callback(); });
    };
    LazyQueryResults.prototype['_notifySubscribers.status'] = function () {
        this._notifySubscribers('status');
    };
    LazyQueryResults.prototype['_notifySubscribers.filteredResults'] = function () {
        this._notifySubscribers('filteredResults');
    };
    LazyQueryResults.prototype['_notifySubscribers.selectedResults'] = function () {
        this._notifySubscribers('selectedResults');
    };
    LazyQueryResults.prototype['_notifySubscribers.results.backboneSync'] = function () {
        this._notifySubscribers('results.backboneSync');
    };
    LazyQueryResults.prototype._turnOnDebouncing = function () {
        this['_notifySubscribers.status'] = _.debounce(this['_notifySubscribers.status'], debounceTime);
        this['_notifySubscribers.filteredResults'] = _.debounce(this['_notifySubscribers.filteredResults'], debounceTime);
        this['_notifySubscribers.selectedResults'] = _.debounce(this['_notifySubscribers.selectedResults'], debounceTime);
        this['_notifySubscribers.results.backboneSync'] = _.debounce(this['_notifySubscribers.results.backboneSync'], debounceTime);
    };
    LazyQueryResults.prototype._getMaxIndexOfSelectedResults = function () {
        return Object.values(this.selectedResults).reduce(function (max, result) {
            return Math.max(max, result.index);
        }, -1);
    };
    LazyQueryResults.prototype._getMinIndexOfSelectedResults = function () {
        return Object.values(this.selectedResults).reduce(function (min, result) {
            return Math.min(min, result.index);
        }, Object.keys(this.results).length);
    };
    /**
     * This is used mostly by
     */
    LazyQueryResults.prototype.groupSelect = function () { };
    /**
     * This will set swathes of sorted results to be selected.  It does not deselect anything.
     * Primarily used in the list view (card / table)
     */
    LazyQueryResults.prototype.shiftSelect = function (target) {
        var firstIndex = this._getMinIndexOfSelectedResults();
        var lastIndex = this._getMaxIndexOfSelectedResults();
        var indexClicked = target.index;
        if (Object.keys(this.selectedResults).length === 0) {
            target.setSelected(target.isSelected);
        }
        else if (indexClicked <= firstIndex) {
            // traverse from target to next until firstIndex
            var currentItem = target;
            while (currentItem && currentItem.index <= firstIndex) {
                currentItem.setSelected(true);
                currentItem = currentItem.next;
            }
        }
        else if (indexClicked >= lastIndex) {
            // traverse from target to prev until lastIndex
            var currentItem = target;
            while (currentItem && currentItem.index >= lastIndex) {
                currentItem.setSelected(true);
                currentItem = currentItem.prev;
            }
        }
        else {
            // traverse from target to prev until something doesn't change
            var currentItem = target;
            var changed = true;
            while (currentItem && changed) {
                changed = currentItem.setSelected(true) && changed;
                currentItem = currentItem.prev;
            }
        }
    };
    /**
     * This takes a list of ids to set to selected, and will deselect all others.
     */
    LazyQueryResults.prototype.selectByIds = function (targets) {
        var _this = this;
        this.deselect();
        targets.forEach(function (id) {
            if (_this.results[id]) {
                _this.results[id].setSelected(true);
            }
        });
    };
    LazyQueryResults.prototype.controlSelect = function (target) {
        target.setSelected(!target.isSelected);
    };
    /**
     * This will toggle selection of the lazyResult passed in, and deselect all others.
     */
    LazyQueryResults.prototype.select = function (target) {
        var isSelected = !target.isSelected;
        this.deselect();
        target.setSelected(isSelected);
    };
    LazyQueryResults.prototype.deselect = function () {
        Object.values(this.selectedResults).forEach(function (result) {
            result.setSelected(false);
        });
    };
    /**
     *  Should really only be set at constructor time (moment a query is done)
     */
    LazyQueryResults.prototype._updatePersistantSorts = function (sorts) {
        this.persistantSorts = sorts;
    };
    LazyQueryResults.prototype._updateTransformSorts = function (transformSorts) {
        this.transformSorts = transformSorts;
    };
    LazyQueryResults.prototype._getSortedResults = function (results) {
        return results.sort(generateCompareFunction(this.transformSorts({ originalSorts: this.persistantSorts })));
    };
    /**
     * The map of results will ultimately be the source of truth here
     * Maps guarantee chronological order for Object.keys operations,
     * so we turn it into an array to sort then feed it back into a map.
     *
     * On resort we have to update the links between results (used for selecting performantly),
     * as well as the indexes which are used similarly
     *
     */
    LazyQueryResults.prototype._resort = function () {
        this.results = this._getSortedResults(Object.values(this.results)).reduce(function (blob, result, index, results) {
            result.index = index;
            result.prev = results[index - 1];
            result.next = results[index + 1];
            blob[result['metacard.id']] = result;
            return blob;
        }, {});
    };
    /**
     * This is purely to force a rerender in scenarios where we update result values and want to update views without resorting
     * (resorting wouldn't make sense to do client side since there could be more results on the server)
     * It also would be weird since things in tables or lists might jump around while the user is working with them.
     */
    LazyQueryResults.prototype._fakeResort = function () {
        this.results = Object.values(this.results).reduce(function (blob, result, index, results) {
            result.index = index;
            result.prev = results[index - 1];
            result.next = results[index + 1];
            blob[result['metacard.id']] = result;
            return blob;
        }, {});
    };
    LazyQueryResults.prototype.init = function () {
        this.currentAsOf = Date.now();
        if (this['subscriptionsToOthers.result.isSelected'])
            this['subscriptionsToOthers.result.isSelected'].forEach(function (unsubscribe) {
                unsubscribe();
            });
        if (this['subscriptionsToOthers.result.backboneSync'])
            this['subscriptionsToOthers.result.backboneSync'].forEach(function (unsubscribe) {
                unsubscribe();
            });
        this['subscriptionsToOthers.result.backboneSync'] = [];
        this['subscriptionsToOthers.result.isSelected'] = [];
        this._resetSelectedResults();
        if (this['subscriptionsToMe.filteredResults'] === undefined)
            this['subscriptionsToMe.filteredResults'] = {};
        if (this['subscriptionsToMe.selectedResults'] === undefined)
            this['subscriptionsToMe.selectedResults'] = {};
        if (this['subscriptionsToMe.status'] === undefined)
            this['subscriptionsToMe.status'] = {};
        this.results = {};
        this.types = {};
        this.sources = [];
        this.status = {};
    };
    LazyQueryResults.prototype._resetSelectedResults = function () {
        var shouldNotify = this.selectedResults !== undefined &&
            Object.keys(this.selectedResults).length > 0;
        this.selectedResults = {};
        if (shouldNotify)
            this['_notifySubscribers.selectedResults']();
    };
    LazyQueryResults.prototype.reset = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.results, results = _c === void 0 ? [] : _c, _d = _b.sorts, sorts = _d === void 0 ? [] : _d, _e = _b.sources, sources = _e === void 0 ? [] : _e, _f = _b.transformSorts, transformSorts = _f === void 0 ? function (_a) {
            var originalSorts = _a.originalSorts;
            return originalSorts;
        } : _f;
        this.init();
        this.resetDidYouMeanFields();
        this.resetShowingResultsForFields();
        this._resetSources(sources);
        this._updatePersistantSorts(sorts);
        this._updateTransformSorts(transformSorts);
        this.add({ results: results });
    };
    LazyQueryResults.prototype.destroy = function () {
        this.backboneModel.stopListening();
    };
    LazyQueryResults.prototype.isEmpty = function () {
        return Object.keys(this.results).length === 0;
    };
    LazyQueryResults.prototype.add = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.results, results = _c === void 0 ? [] : _c, _d = _b.highlights, highlights = _d === void 0 ? [] : _d;
        var highlightMap = highlights.reduce(function (blob, highlight) {
            blob[highlight.id] = highlight.highlights.reduce(function (innerblob, subhighlight) {
                innerblob[subhighlight.attribute] = highlight.highlights.filter(function (hl) { return hl.attribute === subhighlight.attribute; });
                return innerblob;
            }, {});
            return blob;
        }, {});
        results.forEach(function (result) {
            var lazyResult = new LazyQueryResult(result, highlightMap[result.metacard.properties.id]);
            _this.results[lazyResult['metacard.id']] = lazyResult;
            lazyResult.parent = _this;
            /**
             * Keep a fast lookup of what results are selected
             */
            _this['subscriptionsToOthers.result.isSelected'].push(lazyResult.subscribeTo({
                subscribableThing: 'selected',
                callback: function () {
                    _this._updateSelectedResults({ lazyResult: lazyResult });
                }
            }));
            /**
             * When a backbone model is created we want to start listening for updates so the plain object has the same information
             */
            _this['subscriptionsToOthers.result.backboneSync'].push(lazyResult.subscribeTo({
                subscribableThing: 'backboneSync',
                callback: function () {
                    /**
                     *  In this case we don't want to really resort, just force renders on views by telling them things have changed.
                     */
                    _this._fakeResort();
                    _this['_notifySubscribers.filteredResults']();
                }
            }));
        });
        this._resort();
        this['_notifySubscribers.filteredResults']();
    };
    LazyQueryResults.prototype._updateSelectedResults = function (_a) {
        var lazyResult = _a.lazyResult;
        if (lazyResult.isSelected) {
            this.selectedResults[lazyResult['metacard.id']] = lazyResult;
        }
        else {
            delete this.selectedResults[lazyResult['metacard.id']];
        }
        this['_notifySubscribers.selectedResults']();
    };
    LazyQueryResults.prototype.addTypes = function (types) {
        this.types = __assign(__assign({}, this.types), types);
    };
    LazyQueryResults.prototype.getCurrentAttributes = function () {
        return Object.keys(Object.values(this.types).reduce(function (blob, definition) {
            return __assign(__assign({}, blob), definition);
        }, {}));
    };
    LazyQueryResults.prototype._resetSources = function (sources) {
        this.sources = sources;
        this._resetStatus();
    };
    LazyQueryResults.prototype._resetStatus = function () {
        this.status = this.sources.reduce(function (blob, source) {
            blob[source] = new Status({ id: source });
            return blob;
        }, {});
        this._updateIsSearching();
        this['_notifySubscribers.status']();
    };
    LazyQueryResults.prototype.cancel = function () {
        var _this = this;
        Object.keys(status).forEach(function (id) {
            if (_this.status[id].hasReturned === false) {
                _this.status[id].updateStatus({
                    hasReturned: true,
                    message: 'Canceled by user',
                    successful: false
                });
            }
        });
        this._updateIsSearching();
        this['_notifySubscribers.status']();
    };
    LazyQueryResults.prototype.updateStatus = function (status) {
        var _this = this;
        Object.keys(status).forEach(function (id) {
            _this.status[id].updateStatus(status[id]);
        });
        this._updateIsSearching();
        this['_notifySubscribers.status']();
    };
    LazyQueryResults.prototype.updateStatusWithError = function (_a) {
        var _this = this;
        var sources = _a.sources, message = _a.message;
        sources.forEach(function (id) {
            if (_this.status[id])
                _this.status[id].updateStatus({
                    message: message,
                    successful: false
                });
        });
        this._updateIsSearching();
        this['_notifySubscribers.status']();
    };
    LazyQueryResults.prototype._updateIsSearching = function () {
        this.isSearching = Object.values(this.status).some(function (status) {
            return !status.hasReturned;
        });
    };
    LazyQueryResults.prototype.updateDidYouMeanFields = function (update) {
        if (update !== null)
            this.didYouMeanFields = __spreadArray(__spreadArray([], __read(this.didYouMeanFields), false), __read(update), false);
    };
    LazyQueryResults.prototype.resetDidYouMeanFields = function () {
        this.didYouMeanFields = [];
    };
    LazyQueryResults.prototype.updateShowingResultsForFields = function (update) {
        if (update !== null)
            this.showingResultsForFields = __spreadArray(__spreadArray([], __read(this.showingResultsForFields), false), __read(update), false);
    };
    LazyQueryResults.prototype.resetShowingResultsForFields = function () {
        this.showingResultsForFields = [];
    };
    return LazyQueryResults;
}());
export { LazyQueryResults };
//# sourceMappingURL=LazyQueryResults.js.map