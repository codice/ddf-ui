import { __assign, __read, __spreadArray } from "tslib";
import { generateCompareFunction } from './sort';
import { LazyQueryResult } from './LazyQueryResult';
import { Status } from './status';
import _ from 'underscore';
var debounceTime = 250;
import Backbone from 'backbone';
export var transformResponseHighlightsToMap = function (_a) {
    var _b = _a.highlights, highlights = _b === void 0 ? [] : _b;
    return highlights.reduce(function (blob, highlight) {
        blob[highlight.id] = highlight.highlights.reduce(function (innerblob, subhighlight) {
            innerblob[subhighlight.attribute] = highlight.highlights.filter(function (hl) { return hl.attribute === subhighlight.attribute; });
            return innerblob;
        }, {});
        return blob;
    }, {});
};
/**
 * Constructed with performance in mind, taking advantage of maps whenever possible.
 * This is the heart of our app, so take care when updating / adding things here to
 * do it with performance in mind.
 *
 */
var LazyQueryResults = /** @class */ (function () {
    function LazyQueryResults(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.filterTree, filterTree = _c === void 0 ? undefined : _c, _d = _b.results, results = _d === void 0 ? [] : _d, _e = _b.sorts, sorts = _e === void 0 ? [] : _e, _f = _b.sources, sources = _f === void 0 ? [] : _f, transformSorts = _b.transformSorts, _g = _b.status, status = _g === void 0 ? {} : _g, _h = _b.highlights, highlights = _h === void 0 ? {} : _h, _j = _b.didYouMeanFields, didYouMeanFields = _j === void 0 ? [] : _j, _k = _b.showingResultsForFields, showingResultsForFields = _k === void 0 ? [] : _k;
        /**
         * Pass a function that returns the sorts to use, allowing such things as substituting ephemeral sorts
         */
        this.transformSorts = function (_a) {
            var originalSorts = _a.originalSorts;
            return originalSorts;
        };
        this.highlights = {};
        this._turnOnDebouncing();
        this.reset({
            filterTree: filterTree,
            results: results,
            sorts: sorts,
            sources: sources,
            transformSorts: transformSorts,
            status: status,
            highlights: highlights,
            didYouMeanFields: didYouMeanFields,
            showingResultsForFields: showingResultsForFields,
        });
        this.backboneModel = new Backbone.Model({
            id: Math.random().toString(),
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
    LazyQueryResults.prototype['_notifySubscribers.filterTree'] = function () {
        this._notifySubscribers('filterTree');
    };
    LazyQueryResults.prototype._turnOnDebouncing = function () {
        this['_notifySubscribers.status'] = _.debounce(this['_notifySubscribers.status'], debounceTime);
        this['_notifySubscribers.filteredResults'] = _.debounce(this['_notifySubscribers.filteredResults'], debounceTime);
        this['_notifySubscribers.selectedResults'] = _.debounce(this['_notifySubscribers.selectedResults'], debounceTime);
        this['_notifySubscribers.results.backboneSync'] = _.debounce(this['_notifySubscribers.results.backboneSync'], debounceTime);
        this['_notifySubscribers.filterTree'] = _.debounce(this['_notifySubscribers.filterTree'], debounceTime);
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
    // we can do a shallow merge because there will be no overlap between the two objects (separate queries, seperate results i.e. ids)
    LazyQueryResults.prototype.addHighlights = function (highlights) {
        this.highlights = __assign(__assign({}, this.highlights), highlights);
    };
    LazyQueryResults.prototype.resetHighlights = function () {
        this.highlights = {};
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
        if (this['subscriptionsToMe.filterTree'] === undefined)
            this['subscriptionsToMe.filterTree'] = {};
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
        var _b = _a === void 0 ? {} : _a, _c = _b.filterTree, filterTree = _c === void 0 ? undefined : _c, _d = _b.results, results = _d === void 0 ? [] : _d, _e = _b.sorts, sorts = _e === void 0 ? [] : _e, _f = _b.sources, sources = _f === void 0 ? [] : _f, _g = _b.transformSorts, transformSorts = _g === void 0 ? function (_a) {
            var originalSorts = _a.originalSorts;
            return originalSorts;
        } : _g, _h = _b.status, status = _h === void 0 ? {} : _h, _j = _b.highlights, highlights = _j === void 0 ? {} : _j, _k = _b.didYouMeanFields, didYouMeanFields = _k === void 0 ? [] : _k, _l = _b.showingResultsForFields, showingResultsForFields = _l === void 0 ? [] : _l;
        this.init();
        this.resetHighlights();
        this.resetDidYouMeanFields();
        this.resetShowingResultsForFields();
        this._resetFilterTree(filterTree);
        this._resetSources(sources);
        this._updatePersistantSorts(sorts);
        this._updateTransformSorts(transformSorts);
        this.updateDidYouMeanFields(didYouMeanFields);
        this.updateShowingResultsForFields(showingResultsForFields);
        this.addHighlights(highlights);
        this.add({ results: results });
        this.updateStatus(status);
    };
    LazyQueryResults.prototype.destroy = function () {
        this.backboneModel.stopListening();
    };
    LazyQueryResults.prototype.isEmpty = function () {
        return Object.keys(this.results).length === 0;
    };
    LazyQueryResults.prototype.add = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.results, results = _c === void 0 ? [] : _c;
        results.forEach(function (result) {
            var lazyResult = new LazyQueryResult(result, _this.highlights[result.metacard.properties.id]);
            _this.results[lazyResult['metacard.id']] = lazyResult;
            lazyResult.parent = _this;
            /**
             * Keep a fast lookup of what results are selected
             */
            _this['subscriptionsToOthers.result.isSelected'].push(lazyResult.subscribeTo({
                subscribableThing: 'selected',
                callback: function () {
                    _this._updateSelectedResults({ lazyResult: lazyResult });
                },
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
                },
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
    LazyQueryResults.prototype._resetFilterTree = function (filterTree) {
        this.filterTree = filterTree;
        this['_notifySubscribers.filterTree']();
    };
    LazyQueryResults.prototype.cancel = function () {
        var _this = this;
        Object.keys(status).forEach(function (id) {
            if (_this.status[id].hasReturned === false) {
                _this.status[id].updateStatus({
                    hasReturned: true,
                    message: 'Canceled by user',
                    successful: false,
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
                    successful: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF6eVF1ZXJ5UmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0cy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWVBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFbkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUVqQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFBO0FBRXhCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQTZEL0IsTUFBTSxDQUFDLElBQU0sZ0NBQWdDLEdBQUcsVUFBQyxFQUloRDtRQUhDLGtCQUFlLEVBQWYsVUFBVSxtQkFBRyxFQUFFLEtBQUE7SUFJZixPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsU0FBUztRQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUM5QyxVQUFDLFNBQVMsRUFBRSxZQUFZO1lBQ3RCLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQzdELFVBQUMsRUFBRSxJQUFLLE9BQUEsRUFBRSxDQUFDLFNBQVMsS0FBSyxZQUFZLENBQUMsU0FBUyxFQUF2QyxDQUF1QyxDQUNoRCxDQUFBO1lBQ0QsT0FBTyxTQUFTLENBQUE7UUFDbEIsQ0FBQyxFQUNELEVBQWtELENBQ25ELENBQUE7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsRUFBRSxFQUErQixDQUFDLENBQUE7QUFDckMsQ0FBQyxDQUFBO0FBcUJEOzs7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TCxDQUFDO0lBQ0QsdURBQTRCLEdBQTVCO1FBQ0UsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQTtJQUNuQyxDQUFDO0lBRUgsdUJBQUM7QUFBRCxDQUFDLEFBdGRELElBc2RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBSZXN1bHRUeXBlIH0gZnJvbSAnLi4vVHlwZXMnXG5pbXBvcnQgeyBnZW5lcmF0ZUNvbXBhcmVGdW5jdGlvbiB9IGZyb20gJy4vc29ydCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4vTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgUXVlcnlTb3J0VHlwZSB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBTdGF0dXMgfSBmcm9tICcuL3N0YXR1cydcbmltcG9ydCB7IFRyYW5zZm9ybVNvcnRzQ29tcG9zZWRGdW5jdGlvblR5cGUgfSBmcm9tICcuLi9UeXBlZFF1ZXJ5J1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmNvbnN0IGRlYm91bmNlVGltZSA9IDI1MFxuXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgeyBGaWx0ZXJCdWlsZGVyQ2xhc3MgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcblxuZXhwb3J0IHR5cGUgU2VhcmNoU3RhdHVzID0ge1xuICBba2V5OiBzdHJpbmddOiBTdGF0dXNcbn1cblxuZXhwb3J0IHR5cGUgQXR0cmlidXRlSGlnaGxpZ2h0ID0ge1xuICBoaWdobGlnaHQ6IHN0cmluZ1xuICBhdHRyaWJ1dGU6IHN0cmluZ1xuICBlbmRJbmRleDogc3RyaW5nXG4gIHN0YXJ0SW5kZXg6IHN0cmluZ1xuICB2YWx1ZUluZGV4OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgQXR0cmlidXRlSGlnaGxpZ2h0cyA9IHtcbiAgW2tleTogc3RyaW5nXTogQXJyYXk8QXR0cmlidXRlSGlnaGxpZ2h0PlxufVxuXG4vKipcbiAqIEV4YW1wbGU6XG4gKiBbXG4gICAge1xuICAgICAgICBcImlkXCI6IFwiMjljMGMwZTktYjIwNS00OWJiLTk2NDktZGRmM2IzMWU0NmY3XCIsXG4gICAgICAgIFwiaGlnaGxpZ2h0c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJ2YWx1ZUluZGV4XCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgIFwiaGlnaGxpZ2h0XCI6IFwiV2luZGhhbSBDb3VudHksIDxzcGFuIGNsYXNzPVxcXCJoaWdobGlnaHRcXFwiPlZlcm1vbnQ8L3NwYW4+XCIsXG4gICAgICAgICAgICAgICAgXCJzdGFydEluZGV4XCI6IFwiMTZcIixcbiAgICAgICAgICAgICAgICBcImVuZEluZGV4XCI6IFwiMjNcIixcbiAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcInRpdGxlXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH1cbiAgXVxuICovXG5leHBvcnQgdHlwZSBSZXNwb25zZUhpZ2hsaWdodFR5cGUgPSBBcnJheTx7XG4gIGlkOiBzdHJpbmdcbiAgaGlnaGxpZ2h0czogQXJyYXk8QXR0cmlidXRlSGlnaGxpZ2h0PlxufT5cblxuLyoqIHN0b3JlIGhpZ2hsaWdodHMgaW4gYSBtYXBcbiAqIEV4YW1wbGU6XG4gKiB7XG4gICAgXCIyOWMwYzBlOS1iMjA1LTQ5YmItOTY0OS1kZGYzYjMxZTQ2ZjdcIjoge1xuICAgICAgICBcInRpdGxlXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcInZhbHVlSW5kZXhcIjogXCIwXCIsXG4gICAgICAgICAgICAgICAgXCJoaWdobGlnaHRcIjogXCJXaW5kaGFtIENvdW50eSwgPHNwYW4gY2xhc3M9XFxcImhpZ2hsaWdodFxcXCI+VmVybW9udDwvc3Bhbj5cIixcbiAgICAgICAgICAgICAgICBcInN0YXJ0SW5kZXhcIjogXCIxNlwiLFxuICAgICAgICAgICAgICAgIFwiZW5kSW5kZXhcIjogXCIyM1wiLFxuICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwidGl0bGVcIlxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxuICAgfVxuICovXG50eXBlIFRyYW5zZm9ybWVkSGlnaGxpZ2h0c1R5cGUgPSB7XG4gIFtrZXk6IHN0cmluZ106IEF0dHJpYnV0ZUhpZ2hsaWdodHNcbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybVJlc3BvbnNlSGlnaGxpZ2h0c1RvTWFwID0gKHtcbiAgaGlnaGxpZ2h0cyA9IFtdLFxufToge1xuICBoaWdobGlnaHRzPzogUmVzcG9uc2VIaWdobGlnaHRUeXBlXG59KSA9PiB7XG4gIHJldHVybiBoaWdobGlnaHRzLnJlZHVjZSgoYmxvYiwgaGlnaGxpZ2h0KSA9PiB7XG4gICAgYmxvYltoaWdobGlnaHQuaWRdID0gaGlnaGxpZ2h0LmhpZ2hsaWdodHMucmVkdWNlKFxuICAgICAgKGlubmVyYmxvYiwgc3ViaGlnaGxpZ2h0KSA9PiB7XG4gICAgICAgIGlubmVyYmxvYltzdWJoaWdobGlnaHQuYXR0cmlidXRlXSA9IGhpZ2hsaWdodC5oaWdobGlnaHRzLmZpbHRlcihcbiAgICAgICAgICAoaGwpID0+IGhsLmF0dHJpYnV0ZSA9PT0gc3ViaGlnaGxpZ2h0LmF0dHJpYnV0ZVxuICAgICAgICApXG4gICAgICAgIHJldHVybiBpbm5lcmJsb2JcbiAgICAgIH0sXG4gICAgICB7fSBhcyB7IFtrZXk6IHN0cmluZ106IEFycmF5PEF0dHJpYnV0ZUhpZ2hsaWdodD4gfVxuICAgIClcbiAgICByZXR1cm4gYmxvYlxuICB9LCB7fSBhcyBUcmFuc2Zvcm1lZEhpZ2hsaWdodHNUeXBlKVxufVxuXG50eXBlIENvbnN0cnVjdG9yUHJvcHMgPSB7XG4gIGZpbHRlclRyZWU/OiBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgcmVzdWx0cz86IFJlc3VsdFR5cGVbXVxuICBzb3J0cz86IFF1ZXJ5U29ydFR5cGVbXVxuICBzb3VyY2VzPzogc3RyaW5nW11cbiAgdHJhbnNmb3JtU29ydHM/OiBUcmFuc2Zvcm1Tb3J0c0NvbXBvc2VkRnVuY3Rpb25UeXBlXG4gIHN0YXR1cz86IFNlYXJjaFN0YXR1c1xuICBoaWdobGlnaHRzPzogVHJhbnNmb3JtZWRIaWdobGlnaHRzVHlwZVxuICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkcz86IGFueVtdXG4gIGRpZFlvdU1lYW5GaWVsZHM/OiBhbnlbXVxufVxuXG50eXBlIFN1YnNjcmliYWJsZVR5cGUgPVxuICB8ICdzdGF0dXMnXG4gIHwgJ2ZpbHRlcmVkUmVzdWx0cydcbiAgfCAnc2VsZWN0ZWRSZXN1bHRzJ1xuICB8ICdyZXN1bHRzLmJhY2tib25lU3luYydcbiAgfCAnZmlsdGVyVHJlZSdcbnR5cGUgU3Vic2NyaXB0aW9uVHlwZSA9IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9XG4vKipcbiAqIENvbnN0cnVjdGVkIHdpdGggcGVyZm9ybWFuY2UgaW4gbWluZCwgdGFraW5nIGFkdmFudGFnZSBvZiBtYXBzIHdoZW5ldmVyIHBvc3NpYmxlLlxuICogVGhpcyBpcyB0aGUgaGVhcnQgb2Ygb3VyIGFwcCwgc28gdGFrZSBjYXJlIHdoZW4gdXBkYXRpbmcgLyBhZGRpbmcgdGhpbmdzIGhlcmUgdG9cbiAqIGRvIGl0IHdpdGggcGVyZm9ybWFuY2UgaW4gbWluZC5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBMYXp5UXVlcnlSZXN1bHRzIHtcbiAgWydzdWJzY3JpcHRpb25zVG9PdGhlcnMucmVzdWx0LmlzU2VsZWN0ZWQnXTogKCgpID0+IHZvaWQpW107XG4gIFsnc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5iYWNrYm9uZUNyZWF0ZWQnXTogKCgpID0+IHZvaWQpW107XG4gIFsnc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5iYWNrYm9uZVN5bmMnXTogKCgpID0+IHZvaWQpW107XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuc3RhdHVzJ106IFN1YnNjcmlwdGlvblR5cGU7XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyZWRSZXN1bHRzJ106IFN1YnNjcmlwdGlvblR5cGU7XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuc2VsZWN0ZWRSZXN1bHRzJ106IFN1YnNjcmlwdGlvblR5cGU7XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyVHJlZSddOiBTdWJzY3JpcHRpb25UeXBlO1xuICBbJ3N1YnNjcmlwdGlvbnNUb01lLnJlc3VsdHMuYmFja2JvbmVTeW5jJ106IFN1YnNjcmlwdGlvblR5cGVcbiAgc3Vic2NyaWJlVG8oe1xuICAgIHN1YnNjcmliYWJsZVRoaW5nLFxuICAgIGNhbGxiYWNrLFxuICB9OiB7XG4gICAgc3Vic2NyaWJhYmxlVGhpbmc6IFN1YnNjcmliYWJsZVR5cGVcbiAgICBjYWxsYmFjazogKCkgPT4gdm9pZFxuICB9KSB7XG4gICAgY29uc3QgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKClcblxuICAgIC8vIEB0cy1pZ25vcmUgcmVtb3ZlIHdoZW4gd2UgdXBncmFkZSBhY2UgdG8gdXNlIGxhdGVzdCB0eXBlc2NyaXB0XG4gICAgdGhpc1tgc3Vic2NyaXB0aW9uc1RvTWUuJHtzdWJzY3JpYmFibGVUaGluZ31gXVtpZF0gPSBjYWxsYmFja1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlIHJlbW92ZSB3aGVuIHdlIHVwZ3JhZGUgYWNlIHRvIHVzZSBsYXRlc3QgdHlwZXNjcmlwdFxuICAgICAgZGVsZXRlIHRoaXNbYHN1YnNjcmlwdGlvbnNUb01lLiR7c3Vic2NyaWJhYmxlVGhpbmd9YF1baWRdXG4gICAgfVxuICB9XG4gIF9ub3RpZnlTdWJzY3JpYmVycyhzdWJzY3JpYmFibGVUaGluZzogU3Vic2NyaWJhYmxlVHlwZSkge1xuICAgIC8vIEB0cy1pZ25vcmUgcmVtb3ZlIHdoZW4gd2UgdXBncmFkZSBhY2UgdG8gdXNlIGxhdGVzdCB0eXBlc2NyaXB0XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSB0aGlzW1xuICAgICAgYHN1YnNjcmlwdGlvbnNUb01lLiR7c3Vic2NyaWJhYmxlVGhpbmd9YFxuICAgIF0gYXMgU3Vic2NyaXB0aW9uVHlwZVxuICAgIE9iamVjdC52YWx1ZXMoc3Vic2NyaWJlcnMpLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjaygpKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLnN0YXR1cyddKCkge1xuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKCdzdGF0dXMnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkUmVzdWx0cyddKCkge1xuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKCdmaWx0ZXJlZFJlc3VsdHMnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkUmVzdWx0cyddKCkge1xuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKCdzZWxlY3RlZFJlc3VsdHMnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLnJlc3VsdHMuYmFja2JvbmVTeW5jJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ3Jlc3VsdHMuYmFja2JvbmVTeW5jJylcbiAgfVxuICBbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJUcmVlJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ2ZpbHRlclRyZWUnKVxuICB9XG4gIF90dXJuT25EZWJvdW5jaW5nKCkge1xuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zdGF0dXMnXSA9IF8uZGVib3VuY2UoXG4gICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc3RhdHVzJ10sXG4gICAgICBkZWJvdW5jZVRpbWVcbiAgICApXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkUmVzdWx0cyddID0gXy5kZWJvdW5jZShcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJlZFJlc3VsdHMnXSxcbiAgICAgIGRlYm91bmNlVGltZVxuICAgIClcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc2VsZWN0ZWRSZXN1bHRzJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkUmVzdWx0cyddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5yZXN1bHRzLmJhY2tib25lU3luYyddID0gXy5kZWJvdW5jZShcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5yZXN1bHRzLmJhY2tib25lU3luYyddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJUcmVlJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlclRyZWUnXSxcbiAgICAgIGRlYm91bmNlVGltZVxuICAgIClcbiAgfVxuICBjb21wYXJlRnVuY3Rpb246IChhOiBMYXp5UXVlcnlSZXN1bHQsIGI6IExhenlRdWVyeVJlc3VsdCkgPT4gbnVtYmVyXG4gIHJlc3VsdHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBMYXp5UXVlcnlSZXN1bHRcbiAgfVxuICBzZWxlY3RlZFJlc3VsdHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBMYXp5UXVlcnlSZXN1bHRcbiAgfVxuICBfZ2V0TWF4SW5kZXhPZlNlbGVjdGVkUmVzdWx0cygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLnNlbGVjdGVkUmVzdWx0cykucmVkdWNlKChtYXgsIHJlc3VsdCkgPT4ge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgcmVzdWx0LmluZGV4KVxuICAgIH0sIC0xKVxuICB9XG4gIF9nZXRNaW5JbmRleE9mU2VsZWN0ZWRSZXN1bHRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuc2VsZWN0ZWRSZXN1bHRzKS5yZWR1Y2UoKG1pbiwgcmVzdWx0KSA9PiB7XG4gICAgICByZXR1cm4gTWF0aC5taW4obWluLCByZXN1bHQuaW5kZXgpXG4gICAgfSwgT2JqZWN0LmtleXModGhpcy5yZXN1bHRzKS5sZW5ndGgpXG4gIH1cbiAgLyoqXG4gICAqIFRoaXMgaXMgdXNlZCBtb3N0bHkgYnlcbiAgICovXG4gIGdyb3VwU2VsZWN0KCkge31cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBzZXQgc3dhdGhlcyBvZiBzb3J0ZWQgcmVzdWx0cyB0byBiZSBzZWxlY3RlZC4gIEl0IGRvZXMgbm90IGRlc2VsZWN0IGFueXRoaW5nLlxuICAgKiBQcmltYXJpbHkgdXNlZCBpbiB0aGUgbGlzdCB2aWV3IChjYXJkIC8gdGFibGUpXG4gICAqL1xuICBzaGlmdFNlbGVjdCh0YXJnZXQ6IExhenlRdWVyeVJlc3VsdCkge1xuICAgIGNvbnN0IGZpcnN0SW5kZXggPSB0aGlzLl9nZXRNaW5JbmRleE9mU2VsZWN0ZWRSZXN1bHRzKClcbiAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLl9nZXRNYXhJbmRleE9mU2VsZWN0ZWRSZXN1bHRzKClcbiAgICBjb25zdCBpbmRleENsaWNrZWQgPSB0YXJnZXQuaW5kZXhcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZFJlc3VsdHMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGFyZ2V0LnNldFNlbGVjdGVkKHRhcmdldC5pc1NlbGVjdGVkKVxuICAgIH0gZWxzZSBpZiAoaW5kZXhDbGlja2VkIDw9IGZpcnN0SW5kZXgpIHtcbiAgICAgIC8vIHRyYXZlcnNlIGZyb20gdGFyZ2V0IHRvIG5leHQgdW50aWwgZmlyc3RJbmRleFxuICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGFyZ2V0IGFzIExhenlRdWVyeVJlc3VsdCB8IHVuZGVmaW5lZFxuICAgICAgd2hpbGUgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLmluZGV4IDw9IGZpcnN0SW5kZXgpIHtcbiAgICAgICAgY3VycmVudEl0ZW0uc2V0U2VsZWN0ZWQodHJ1ZSlcbiAgICAgICAgY3VycmVudEl0ZW0gPSBjdXJyZW50SXRlbS5uZXh0XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRleENsaWNrZWQgPj0gbGFzdEluZGV4KSB7XG4gICAgICAvLyB0cmF2ZXJzZSBmcm9tIHRhcmdldCB0byBwcmV2IHVudGlsIGxhc3RJbmRleFxuICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGFyZ2V0IGFzIExhenlRdWVyeVJlc3VsdCB8IHVuZGVmaW5lZFxuICAgICAgd2hpbGUgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLmluZGV4ID49IGxhc3RJbmRleCkge1xuICAgICAgICBjdXJyZW50SXRlbS5zZXRTZWxlY3RlZCh0cnVlKVxuICAgICAgICBjdXJyZW50SXRlbSA9IGN1cnJlbnRJdGVtLnByZXZcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdHJhdmVyc2UgZnJvbSB0YXJnZXQgdG8gcHJldiB1bnRpbCBzb21ldGhpbmcgZG9lc24ndCBjaGFuZ2VcbiAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRhcmdldCBhcyBMYXp5UXVlcnlSZXN1bHQgfCB1bmRlZmluZWRcbiAgICAgIGxldCBjaGFuZ2VkID0gdHJ1ZVxuICAgICAgd2hpbGUgKGN1cnJlbnRJdGVtICYmIGNoYW5nZWQpIHtcbiAgICAgICAgY2hhbmdlZCA9IGN1cnJlbnRJdGVtLnNldFNlbGVjdGVkKHRydWUpICYmIGNoYW5nZWRcbiAgICAgICAgY3VycmVudEl0ZW0gPSBjdXJyZW50SXRlbS5wcmV2XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUaGlzIHRha2VzIGEgbGlzdCBvZiBpZHMgdG8gc2V0IHRvIHNlbGVjdGVkLCBhbmQgd2lsbCBkZXNlbGVjdCBhbGwgb3RoZXJzLlxuICAgKi9cbiAgc2VsZWN0QnlJZHModGFyZ2V0czogc3RyaW5nW10pIHtcbiAgICB0aGlzLmRlc2VsZWN0KClcbiAgICB0YXJnZXRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICBpZiAodGhpcy5yZXN1bHRzW2lkXSkge1xuICAgICAgICB0aGlzLnJlc3VsdHNbaWRdLnNldFNlbGVjdGVkKHRydWUpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBjb250cm9sU2VsZWN0KHRhcmdldDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgdGFyZ2V0LnNldFNlbGVjdGVkKCF0YXJnZXQuaXNTZWxlY3RlZClcbiAgfVxuICAvKipcbiAgICogVGhpcyB3aWxsIHRvZ2dsZSBzZWxlY3Rpb24gb2YgdGhlIGxhenlSZXN1bHQgcGFzc2VkIGluLCBhbmQgZGVzZWxlY3QgYWxsIG90aGVycy5cbiAgICovXG4gIHNlbGVjdCh0YXJnZXQ6IExhenlRdWVyeVJlc3VsdCkge1xuICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSAhdGFyZ2V0LmlzU2VsZWN0ZWRcbiAgICB0aGlzLmRlc2VsZWN0KClcbiAgICB0YXJnZXQuc2V0U2VsZWN0ZWQoaXNTZWxlY3RlZClcbiAgfVxuICBkZXNlbGVjdCgpIHtcbiAgICBPYmplY3QudmFsdWVzKHRoaXMuc2VsZWN0ZWRSZXN1bHRzKS5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgIHJlc3VsdC5zZXRTZWxlY3RlZChmYWxzZSlcbiAgICB9KVxuICB9XG4gIGJhY2tib25lTW9kZWw6IEJhY2tib25lLk1vZGVsXG4gIC8qKlxuICAgKiBDYW4gY29udGFpbiBkaXN0YW5jZSAvIGJlc3QgdGV4dCBtYXRjaFxuICAgKiAodGhpcyBtYXRjaGVzIHdoYXQgdGhlIHF1ZXJ5IHJlcXVlc3RlZClcbiAgICovXG4gIHBlcnNpc3RhbnRTb3J0czogUXVlcnlTb3J0VHlwZVtdXG4gIC8qKlxuICAgKiBQYXNzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBzb3J0cyB0byB1c2UsIGFsbG93aW5nIHN1Y2ggdGhpbmdzIGFzIHN1YnN0aXR1dGluZyBlcGhlbWVyYWwgc29ydHNcbiAgICovXG4gIHRyYW5zZm9ybVNvcnRzOiBUcmFuc2Zvcm1Tb3J0c0NvbXBvc2VkRnVuY3Rpb25UeXBlID0gKHsgb3JpZ2luYWxTb3J0cyB9KSA9PiB7XG4gICAgcmV0dXJuIG9yaWdpbmFsU29ydHNcbiAgfVxuICAvKipcbiAgICogIFNob3VsZCByZWFsbHkgb25seSBiZSBzZXQgYXQgY29uc3RydWN0b3IgdGltZSAobW9tZW50IGEgcXVlcnkgaXMgZG9uZSlcbiAgICovXG4gIF91cGRhdGVQZXJzaXN0YW50U29ydHMoc29ydHM6IFF1ZXJ5U29ydFR5cGVbXSkge1xuICAgIHRoaXMucGVyc2lzdGFudFNvcnRzID0gc29ydHNcbiAgfVxuICBfdXBkYXRlVHJhbnNmb3JtU29ydHModHJhbnNmb3JtU29ydHM6IFRyYW5zZm9ybVNvcnRzQ29tcG9zZWRGdW5jdGlvblR5cGUpIHtcbiAgICB0aGlzLnRyYW5zZm9ybVNvcnRzID0gdHJhbnNmb3JtU29ydHNcbiAgfVxuICBfZ2V0U29ydGVkUmVzdWx0cyhyZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSkge1xuICAgIHJldHVybiByZXN1bHRzLnNvcnQoXG4gICAgICBnZW5lcmF0ZUNvbXBhcmVGdW5jdGlvbihcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1Tb3J0cyh7IG9yaWdpbmFsU29ydHM6IHRoaXMucGVyc2lzdGFudFNvcnRzIH0pXG4gICAgICApXG4gICAgKVxuICB9XG4gIC8qKlxuICAgKiBUaGUgbWFwIG9mIHJlc3VsdHMgd2lsbCB1bHRpbWF0ZWx5IGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZVxuICAgKiBNYXBzIGd1YXJhbnRlZSBjaHJvbm9sb2dpY2FsIG9yZGVyIGZvciBPYmplY3Qua2V5cyBvcGVyYXRpb25zLFxuICAgKiBzbyB3ZSB0dXJuIGl0IGludG8gYW4gYXJyYXkgdG8gc29ydCB0aGVuIGZlZWQgaXQgYmFjayBpbnRvIGEgbWFwLlxuICAgKlxuICAgKiBPbiByZXNvcnQgd2UgaGF2ZSB0byB1cGRhdGUgdGhlIGxpbmtzIGJldHdlZW4gcmVzdWx0cyAodXNlZCBmb3Igc2VsZWN0aW5nIHBlcmZvcm1hbnRseSksXG4gICAqIGFzIHdlbGwgYXMgdGhlIGluZGV4ZXMgd2hpY2ggYXJlIHVzZWQgc2ltaWxhcmx5XG4gICAqXG4gICAqL1xuICBfcmVzb3J0KCkge1xuICAgIHRoaXMucmVzdWx0cyA9IHRoaXMuX2dldFNvcnRlZFJlc3VsdHMoT2JqZWN0LnZhbHVlcyh0aGlzLnJlc3VsdHMpKS5yZWR1Y2UoXG4gICAgICAoYmxvYiwgcmVzdWx0LCBpbmRleCwgcmVzdWx0cykgPT4ge1xuICAgICAgICByZXN1bHQuaW5kZXggPSBpbmRleFxuICAgICAgICByZXN1bHQucHJldiA9IHJlc3VsdHNbaW5kZXggLSAxXVxuICAgICAgICByZXN1bHQubmV4dCA9IHJlc3VsdHNbaW5kZXggKyAxXVxuICAgICAgICBibG9iW3Jlc3VsdFsnbWV0YWNhcmQuaWQnXV0gPSByZXN1bHRcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sXG4gICAgICB7fSBhcyB7IFtrZXk6IHN0cmluZ106IExhenlRdWVyeVJlc3VsdCB9XG4gICAgKVxuICB9XG4gIC8qKlxuICAgKiBUaGlzIGlzIHB1cmVseSB0byBmb3JjZSBhIHJlcmVuZGVyIGluIHNjZW5hcmlvcyB3aGVyZSB3ZSB1cGRhdGUgcmVzdWx0IHZhbHVlcyBhbmQgd2FudCB0byB1cGRhdGUgdmlld3Mgd2l0aG91dCByZXNvcnRpbmdcbiAgICogKHJlc29ydGluZyB3b3VsZG4ndCBtYWtlIHNlbnNlIHRvIGRvIGNsaWVudCBzaWRlIHNpbmNlIHRoZXJlIGNvdWxkIGJlIG1vcmUgcmVzdWx0cyBvbiB0aGUgc2VydmVyKVxuICAgKiBJdCBhbHNvIHdvdWxkIGJlIHdlaXJkIHNpbmNlIHRoaW5ncyBpbiB0YWJsZXMgb3IgbGlzdHMgbWlnaHQganVtcCBhcm91bmQgd2hpbGUgdGhlIHVzZXIgaXMgd29ya2luZyB3aXRoIHRoZW0uXG4gICAqL1xuICBfZmFrZVJlc29ydCgpIHtcbiAgICB0aGlzLnJlc3VsdHMgPSBPYmplY3QudmFsdWVzKHRoaXMucmVzdWx0cykucmVkdWNlKFxuICAgICAgKGJsb2IsIHJlc3VsdCwgaW5kZXgsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgcmVzdWx0LmluZGV4ID0gaW5kZXhcbiAgICAgICAgcmVzdWx0LnByZXYgPSByZXN1bHRzW2luZGV4IC0gMV1cbiAgICAgICAgcmVzdWx0Lm5leHQgPSByZXN1bHRzW2luZGV4ICsgMV1cbiAgICAgICAgYmxvYltyZXN1bHRbJ21ldGFjYXJkLmlkJ11dID0gcmVzdWx0XG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAge30gYXMgeyBba2V5OiBzdHJpbmddOiBMYXp5UXVlcnlSZXN1bHQgfVxuICAgIClcbiAgfVxuICBoaWdobGlnaHRzOiBUcmFuc2Zvcm1lZEhpZ2hsaWdodHNUeXBlID0ge31cbiAgLy8gd2UgY2FuIGRvIGEgc2hhbGxvdyBtZXJnZSBiZWNhdXNlIHRoZXJlIHdpbGwgYmUgbm8gb3ZlcmxhcCBiZXR3ZWVuIHRoZSB0d28gb2JqZWN0cyAoc2VwYXJhdGUgcXVlcmllcywgc2VwZXJhdGUgcmVzdWx0cyBpLmUuIGlkcylcbiAgYWRkSGlnaGxpZ2h0cyhoaWdobGlnaHRzOiBUcmFuc2Zvcm1lZEhpZ2hsaWdodHNUeXBlKSB7XG4gICAgdGhpcy5oaWdobGlnaHRzID0geyAuLi50aGlzLmhpZ2hsaWdodHMsIC4uLmhpZ2hsaWdodHMgfVxuICB9XG4gIHJlc2V0SGlnaGxpZ2h0cygpIHtcbiAgICB0aGlzLmhpZ2hsaWdodHMgPSB7fVxuICB9XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBmaWx0ZXJUcmVlID0gdW5kZWZpbmVkLFxuICAgIHJlc3VsdHMgPSBbXSxcbiAgICBzb3J0cyA9IFtdLFxuICAgIHNvdXJjZXMgPSBbXSxcbiAgICB0cmFuc2Zvcm1Tb3J0cyxcbiAgICBzdGF0dXMgPSB7fSxcbiAgICBoaWdobGlnaHRzID0ge30sXG4gICAgZGlkWW91TWVhbkZpZWxkcyA9IFtdLFxuICAgIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzID0gW10sXG4gIH06IENvbnN0cnVjdG9yUHJvcHMgPSB7fSkge1xuICAgIHRoaXMuX3R1cm5PbkRlYm91bmNpbmcoKVxuICAgIHRoaXMucmVzZXQoe1xuICAgICAgZmlsdGVyVHJlZSxcbiAgICAgIHJlc3VsdHMsXG4gICAgICBzb3J0cyxcbiAgICAgIHNvdXJjZXMsXG4gICAgICB0cmFuc2Zvcm1Tb3J0cyxcbiAgICAgIHN0YXR1cyxcbiAgICAgIGhpZ2hsaWdodHMsXG4gICAgICBkaWRZb3VNZWFuRmllbGRzLFxuICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMsXG4gICAgfSlcblxuICAgIHRoaXMuYmFja2JvbmVNb2RlbCA9IG5ldyBCYWNrYm9uZS5Nb2RlbCh7XG4gICAgICBpZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygpLFxuICAgIH0pXG4gIH1cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmN1cnJlbnRBc09mID0gRGF0ZS5ub3coKVxuICAgIGlmICh0aGlzWydzdWJzY3JpcHRpb25zVG9PdGhlcnMucmVzdWx0LmlzU2VsZWN0ZWQnXSlcbiAgICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuaXNTZWxlY3RlZCddLmZvckVhY2goKHVuc3Vic2NyaWJlKSA9PiB7XG4gICAgICAgIHVuc3Vic2NyaWJlKClcbiAgICAgIH0pXG4gICAgaWYgKHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuYmFja2JvbmVTeW5jJ10pXG4gICAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9PdGhlcnMucmVzdWx0LmJhY2tib25lU3luYyddLmZvckVhY2goXG4gICAgICAgICh1bnN1YnNjcmliZSkgPT4ge1xuICAgICAgICAgIHVuc3Vic2NyaWJlKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuYmFja2JvbmVTeW5jJ10gPSBbXVxuICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuaXNTZWxlY3RlZCddID0gW11cbiAgICB0aGlzLl9yZXNldFNlbGVjdGVkUmVzdWx0cygpXG4gICAgaWYgKHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLmZpbHRlcmVkUmVzdWx0cyddID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5maWx0ZXJlZFJlc3VsdHMnXSA9IHt9XG4gICAgaWYgKHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLnNlbGVjdGVkUmVzdWx0cyddID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5zZWxlY3RlZFJlc3VsdHMnXSA9IHt9XG4gICAgaWYgKHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLnN0YXR1cyddID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5zdGF0dXMnXSA9IHt9XG4gICAgaWYgKHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLmZpbHRlclRyZWUnXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyVHJlZSddID0ge31cbiAgICB0aGlzLnJlc3VsdHMgPSB7fVxuICAgIHRoaXMudHlwZXMgPSB7fVxuICAgIHRoaXMuc291cmNlcyA9IFtdXG4gICAgdGhpcy5zdGF0dXMgPSB7fVxuICB9XG4gIF9yZXNldFNlbGVjdGVkUmVzdWx0cygpIHtcbiAgICBjb25zdCBzaG91bGROb3RpZnkgPVxuICAgICAgdGhpcy5zZWxlY3RlZFJlc3VsdHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZFJlc3VsdHMpLmxlbmd0aCA+IDBcbiAgICB0aGlzLnNlbGVjdGVkUmVzdWx0cyA9IHt9XG4gICAgaWYgKHNob3VsZE5vdGlmeSkgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkUmVzdWx0cyddKClcbiAgfVxuICByZXNldCh7XG4gICAgZmlsdGVyVHJlZSA9IHVuZGVmaW5lZCxcbiAgICByZXN1bHRzID0gW10sXG4gICAgc29ydHMgPSBbXSxcbiAgICBzb3VyY2VzID0gW10sXG4gICAgdHJhbnNmb3JtU29ydHMgPSAoeyBvcmlnaW5hbFNvcnRzIH0pID0+IHtcbiAgICAgIHJldHVybiBvcmlnaW5hbFNvcnRzXG4gICAgfSxcbiAgICBzdGF0dXMgPSB7fSxcbiAgICBoaWdobGlnaHRzID0ge30sXG4gICAgZGlkWW91TWVhbkZpZWxkcyA9IFtdLFxuICAgIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzID0gW10sXG4gIH06IENvbnN0cnVjdG9yUHJvcHMgPSB7fSkge1xuICAgIHRoaXMuaW5pdCgpXG4gICAgdGhpcy5yZXNldEhpZ2hsaWdodHMoKVxuICAgIHRoaXMucmVzZXREaWRZb3VNZWFuRmllbGRzKClcbiAgICB0aGlzLnJlc2V0U2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMoKVxuICAgIHRoaXMuX3Jlc2V0RmlsdGVyVHJlZShmaWx0ZXJUcmVlKVxuICAgIHRoaXMuX3Jlc2V0U291cmNlcyhzb3VyY2VzKVxuICAgIHRoaXMuX3VwZGF0ZVBlcnNpc3RhbnRTb3J0cyhzb3J0cylcbiAgICB0aGlzLl91cGRhdGVUcmFuc2Zvcm1Tb3J0cyh0cmFuc2Zvcm1Tb3J0cylcbiAgICB0aGlzLnVwZGF0ZURpZFlvdU1lYW5GaWVsZHMoZGlkWW91TWVhbkZpZWxkcylcbiAgICB0aGlzLnVwZGF0ZVNob3dpbmdSZXN1bHRzRm9yRmllbGRzKHNob3dpbmdSZXN1bHRzRm9yRmllbGRzKVxuICAgIHRoaXMuYWRkSGlnaGxpZ2h0cyhoaWdobGlnaHRzKVxuICAgIHRoaXMuYWRkKHsgcmVzdWx0cyB9KVxuICAgIHRoaXMudXBkYXRlU3RhdHVzKHN0YXR1cylcbiAgfVxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuYmFja2JvbmVNb2RlbC5zdG9wTGlzdGVuaW5nKClcbiAgfVxuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnJlc3VsdHMpLmxlbmd0aCA9PT0gMFxuICB9XG4gIGFkZCh7XG4gICAgcmVzdWx0cyA9IFtdLFxuICB9OiB7XG4gICAgcmVzdWx0cz86IFJlc3VsdFR5cGVbXVxuICB9ID0ge30pIHtcbiAgICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgY29uc3QgbGF6eVJlc3VsdCA9IG5ldyBMYXp5UXVlcnlSZXN1bHQoXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgdGhpcy5oaWdobGlnaHRzW3Jlc3VsdC5tZXRhY2FyZC5wcm9wZXJ0aWVzLmlkXVxuICAgICAgKVxuICAgICAgdGhpcy5yZXN1bHRzW2xhenlSZXN1bHRbJ21ldGFjYXJkLmlkJ11dID0gbGF6eVJlc3VsdFxuICAgICAgbGF6eVJlc3VsdC5wYXJlbnQgPSB0aGlzXG4gICAgICAvKipcbiAgICAgICAqIEtlZXAgYSBmYXN0IGxvb2t1cCBvZiB3aGF0IHJlc3VsdHMgYXJlIHNlbGVjdGVkXG4gICAgICAgKi9cbiAgICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuaXNTZWxlY3RlZCddLnB1c2goXG4gICAgICAgIGxhenlSZXN1bHQuc3Vic2NyaWJlVG8oe1xuICAgICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnc2VsZWN0ZWQnLFxuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTZWxlY3RlZFJlc3VsdHMoeyBsYXp5UmVzdWx0IH0pXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC8qKlxuICAgICAgICogV2hlbiBhIGJhY2tib25lIG1vZGVsIGlzIGNyZWF0ZWQgd2Ugd2FudCB0byBzdGFydCBsaXN0ZW5pbmcgZm9yIHVwZGF0ZXMgc28gdGhlIHBsYWluIG9iamVjdCBoYXMgdGhlIHNhbWUgaW5mb3JtYXRpb25cbiAgICAgICAqL1xuICAgICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5iYWNrYm9uZVN5bmMnXS5wdXNoKFxuICAgICAgICBsYXp5UmVzdWx0LnN1YnNjcmliZVRvKHtcbiAgICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ2JhY2tib25lU3luYycsXG4gICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogIEluIHRoaXMgY2FzZSB3ZSBkb24ndCB3YW50IHRvIHJlYWxseSByZXNvcnQsIGp1c3QgZm9yY2UgcmVuZGVycyBvbiB2aWV3cyBieSB0ZWxsaW5nIHRoZW0gdGhpbmdzIGhhdmUgY2hhbmdlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5fZmFrZVJlc29ydCgpXG4gICAgICAgICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuZmlsdGVyZWRSZXN1bHRzJ10oKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfSlcbiAgICB0aGlzLl9yZXNvcnQoKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJlZFJlc3VsdHMnXSgpXG4gIH1cbiAgX3VwZGF0ZVNlbGVjdGVkUmVzdWx0cyh7IGxhenlSZXN1bHQgfTogeyBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQgfSkge1xuICAgIGlmIChsYXp5UmVzdWx0LmlzU2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZXN1bHRzW2xhenlSZXN1bHRbJ21ldGFjYXJkLmlkJ11dID0gbGF6eVJlc3VsdFxuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdGhpcy5zZWxlY3RlZFJlc3VsdHNbbGF6eVJlc3VsdFsnbWV0YWNhcmQuaWQnXV1cbiAgICB9XG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkUmVzdWx0cyddKClcbiAgfVxuICB0eXBlczogTWV0YWNhcmRUeXBlc1xuICBhZGRUeXBlcyh0eXBlczogTWV0YWNhcmRUeXBlcykge1xuICAgIHRoaXMudHlwZXMgPSB7XG4gICAgICAuLi50aGlzLnR5cGVzLFxuICAgICAgLi4udHlwZXMsXG4gICAgfVxuICB9XG4gIGdldEN1cnJlbnRBdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhcbiAgICAgIE9iamVjdC52YWx1ZXModGhpcy50eXBlcykucmVkdWNlKChibG9iLCBkZWZpbml0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmxvYixcbiAgICAgICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgICB9XG4gICAgICB9LCB7fSlcbiAgICApXG4gIH1cbiAgc291cmNlczogc3RyaW5nW11cbiAgX3Jlc2V0U291cmNlcyhzb3VyY2VzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuc291cmNlcyA9IHNvdXJjZXNcbiAgICB0aGlzLl9yZXNldFN0YXR1cygpXG4gIH1cbiAgX3Jlc2V0U3RhdHVzKCkge1xuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5zb3VyY2VzLnJlZHVjZSgoYmxvYiwgc291cmNlKSA9PiB7XG4gICAgICBibG9iW3NvdXJjZV0gPSBuZXcgU3RhdHVzKHsgaWQ6IHNvdXJjZSB9KVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LCB7fSBhcyBTZWFyY2hTdGF0dXMpXG4gICAgdGhpcy5fdXBkYXRlSXNTZWFyY2hpbmcoKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zdGF0dXMnXSgpXG4gIH1cbiAgZmlsdGVyVHJlZT86IEZpbHRlckJ1aWxkZXJDbGFzc1xuICBfcmVzZXRGaWx0ZXJUcmVlKGZpbHRlclRyZWU/OiBGaWx0ZXJCdWlsZGVyQ2xhc3MpIHtcbiAgICB0aGlzLmZpbHRlclRyZWUgPSBmaWx0ZXJUcmVlXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlclRyZWUnXSgpXG4gIH1cbiAgY2FuY2VsKCkge1xuICAgIE9iamVjdC5rZXlzKHN0YXR1cykuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXR1c1tpZF0uaGFzUmV0dXJuZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuc3RhdHVzW2lkXS51cGRhdGVTdGF0dXMoe1xuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIG1lc3NhZ2U6ICdDYW5jZWxlZCBieSB1c2VyJyxcbiAgICAgICAgICBzdWNjZXNzZnVsOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuX3VwZGF0ZUlzU2VhcmNoaW5nKClcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc3RhdHVzJ10oKVxuICB9XG4gIHVwZGF0ZVN0YXR1cyhzdGF0dXM6IFNlYXJjaFN0YXR1cykge1xuICAgIE9iamVjdC5rZXlzKHN0YXR1cykuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIHRoaXMuc3RhdHVzW2lkXS51cGRhdGVTdGF0dXMoc3RhdHVzW2lkXSlcbiAgICB9KVxuICAgIHRoaXMuX3VwZGF0ZUlzU2VhcmNoaW5nKClcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc3RhdHVzJ10oKVxuICB9XG4gIHVwZGF0ZVN0YXR1c1dpdGhFcnJvcih7XG4gICAgc291cmNlcyxcbiAgICBtZXNzYWdlLFxuICB9OiB7XG4gICAgc291cmNlczogc3RyaW5nW11cbiAgICBtZXNzYWdlOiBzdHJpbmdcbiAgfSkge1xuICAgIHNvdXJjZXMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXR1c1tpZF0pXG4gICAgICAgIHRoaXMuc3RhdHVzW2lkXS51cGRhdGVTdGF0dXMoe1xuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLl91cGRhdGVJc1NlYXJjaGluZygpXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnN0YXR1cyddKClcbiAgfVxuICBfdXBkYXRlSXNTZWFyY2hpbmcoKSB7XG4gICAgdGhpcy5pc1NlYXJjaGluZyA9IE9iamVjdC52YWx1ZXModGhpcy5zdGF0dXMpLnNvbWUoKHN0YXR1cykgPT4ge1xuICAgICAgcmV0dXJuICFzdGF0dXMuaGFzUmV0dXJuZWRcbiAgICB9KVxuICB9XG4gIGlzU2VhcmNoaW5nOiBib29sZWFuXG4gIGN1cnJlbnRBc09mOiBudW1iZXJcbiAgc3RhdHVzOiBTZWFyY2hTdGF0dXNcbiAgdXBkYXRlRGlkWW91TWVhbkZpZWxkcyh1cGRhdGU6IGFueVtdIHwgbnVsbCkge1xuICAgIGlmICh1cGRhdGUgIT09IG51bGwpXG4gICAgICB0aGlzLmRpZFlvdU1lYW5GaWVsZHMgPSBbLi4udGhpcy5kaWRZb3VNZWFuRmllbGRzLCAuLi51cGRhdGVdXG4gIH1cbiAgcmVzZXREaWRZb3VNZWFuRmllbGRzKCkge1xuICAgIHRoaXMuZGlkWW91TWVhbkZpZWxkcyA9IFtdXG4gIH1cbiAgZGlkWW91TWVhbkZpZWxkczogYW55W11cbiAgdXBkYXRlU2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHModXBkYXRlOiBhbnlbXSB8IG51bGwpIHtcbiAgICBpZiAodXBkYXRlICE9PSBudWxsKVxuICAgICAgdGhpcy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyA9IFtcbiAgICAgICAgLi4udGhpcy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyxcbiAgICAgICAgLi4udXBkYXRlLFxuICAgICAgXVxuICB9XG4gIHJlc2V0U2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMoKSB7XG4gICAgdGhpcy5zaG93aW5nUmVzdWx0c0ZvckZpZWxkcyA9IFtdXG4gIH1cbiAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHM6IGFueVtdXG59XG5cbnR5cGUgTWV0YWNhcmRUeXBlcyA9IHtcbiAgW2tleTogc3RyaW5nXToge1xuICAgIFtrZXk6IHN0cmluZ106IHtcbiAgICAgIGZvcm1hdDogc3RyaW5nXG4gICAgICBtdWx0aXZhbHVlZDogYm9vbGVhblxuICAgICAgaW5kZXhlZDogYm9vbGVhblxuICAgIH1cbiAgfVxufVxuIl19