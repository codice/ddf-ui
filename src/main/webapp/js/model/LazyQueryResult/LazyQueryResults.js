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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF6eVF1ZXJ5UmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0cy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWVBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFbkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUVqQyxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFBO0FBRXhCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQTZEL0IsTUFBTSxDQUFDLElBQU0sZ0NBQWdDLEdBQUcsVUFBQyxFQUloRDtRQUhDLGtCQUFlLEVBQWYsVUFBVSxtQkFBRyxFQUFFLEtBQUE7SUFJZixPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsU0FBUztRQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUM5QyxVQUFDLFNBQVMsRUFBRSxZQUFZO1lBQ3RCLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQzdELFVBQUMsRUFBRSxJQUFLLE9BQUEsRUFBRSxDQUFDLFNBQVMsS0FBSyxZQUFZLENBQUMsU0FBUyxFQUF2QyxDQUF1QyxDQUNoRCxDQUFBO1lBQ0QsT0FBTyxTQUFTLENBQUE7UUFDbEIsQ0FBQyxFQUNELEVBQWtELENBQ25ELENBQUE7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsRUFBRSxFQUErQixDQUFDLENBQUE7QUFDckMsQ0FBQyxDQUFBO0FBcUJEOzs7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VUFBOEIsTUFBb0I7UUFDaEQsSUFBSSxNQUFNLEtBQUssSUFBSTtZQUNqQixJQUFJLENBQUMsdUJBQXVCLDBDQUN2QixJQUFJLENBQUMsdUJBQXVCLGtCQUM1QixNQUFNLFNBQ1YsQ0FBQTtJQUNMLENBQUM7SUFDRCx1REFBNEIsR0FBNUI7UUFDRSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFFSCx1QkFBQztBQUFELENBQUMsQUF0ZEQsSUFzZEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7IFJlc3VsdFR5cGUgfSBmcm9tICcuLi9UeXBlcydcbmltcG9ydCB7IGdlbmVyYXRlQ29tcGFyZUZ1bmN0aW9uIH0gZnJvbSAnLi9zb3J0J1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBRdWVyeVNvcnRUeXBlIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IFN0YXR1cyB9IGZyb20gJy4vc3RhdHVzJ1xuaW1wb3J0IHsgVHJhbnNmb3JtU29ydHNDb21wb3NlZEZ1bmN0aW9uVHlwZSB9IGZyb20gJy4uL1R5cGVkUXVlcnknXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuY29uc3QgZGVib3VuY2VUaW1lID0gMjUwXG5cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCB7IEZpbHRlckJ1aWxkZXJDbGFzcyB9IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuXG5leHBvcnQgdHlwZSBTZWFyY2hTdGF0dXMgPSB7XG4gIFtrZXk6IHN0cmluZ106IFN0YXR1c1xufVxuXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVIaWdobGlnaHQgPSB7XG4gIGhpZ2hsaWdodDogc3RyaW5nXG4gIGF0dHJpYnV0ZTogc3RyaW5nXG4gIGVuZEluZGV4OiBzdHJpbmdcbiAgc3RhcnRJbmRleDogc3RyaW5nXG4gIHZhbHVlSW5kZXg6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVIaWdobGlnaHRzID0ge1xuICBba2V5OiBzdHJpbmddOiBBcnJheTxBdHRyaWJ1dGVIaWdobGlnaHQ+XG59XG5cbi8qKlxuICogRXhhbXBsZTpcbiAqIFtcbiAgICB7XG4gICAgICAgIFwiaWRcIjogXCIyOWMwYzBlOS1iMjA1LTQ5YmItOTY0OS1kZGYzYjMxZTQ2ZjdcIixcbiAgICAgICAgXCJoaWdobGlnaHRzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcInZhbHVlSW5kZXhcIjogXCIwXCIsXG4gICAgICAgICAgICAgICAgXCJoaWdobGlnaHRcIjogXCJXaW5kaGFtIENvdW50eSwgPHNwYW4gY2xhc3M9XFxcImhpZ2hsaWdodFxcXCI+VmVybW9udDwvc3Bhbj5cIixcbiAgICAgICAgICAgICAgICBcInN0YXJ0SW5kZXhcIjogXCIxNlwiLFxuICAgICAgICAgICAgICAgIFwiZW5kSW5kZXhcIjogXCIyM1wiLFxuICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwidGl0bGVcIlxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfVxuICBdXG4gKi9cbmV4cG9ydCB0eXBlIFJlc3BvbnNlSGlnaGxpZ2h0VHlwZSA9IEFycmF5PHtcbiAgaWQ6IHN0cmluZ1xuICBoaWdobGlnaHRzOiBBcnJheTxBdHRyaWJ1dGVIaWdobGlnaHQ+XG59PlxuXG4vKiogc3RvcmUgaGlnaGxpZ2h0cyBpbiBhIG1hcFxuICogRXhhbXBsZTpcbiAqIHtcbiAgICBcIjI5YzBjMGU5LWIyMDUtNDliYi05NjQ5LWRkZjNiMzFlNDZmN1wiOiB7XG4gICAgICAgIFwidGl0bGVcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwidmFsdWVJbmRleFwiOiBcIjBcIixcbiAgICAgICAgICAgICAgICBcImhpZ2hsaWdodFwiOiBcIldpbmRoYW0gQ291bnR5LCA8c3BhbiBjbGFzcz1cXFwiaGlnaGxpZ2h0XFxcIj5WZXJtb250PC9zcGFuPlwiLFxuICAgICAgICAgICAgICAgIFwic3RhcnRJbmRleFwiOiBcIjE2XCIsXG4gICAgICAgICAgICAgICAgXCJlbmRJbmRleFwiOiBcIjIzXCIsXG4gICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ0aXRsZVwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9XG4gICB9XG4gKi9cbnR5cGUgVHJhbnNmb3JtZWRIaWdobGlnaHRzVHlwZSA9IHtcbiAgW2tleTogc3RyaW5nXTogQXR0cmlidXRlSGlnaGxpZ2h0c1xufVxuXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtUmVzcG9uc2VIaWdobGlnaHRzVG9NYXAgPSAoe1xuICBoaWdobGlnaHRzID0gW10sXG59OiB7XG4gIGhpZ2hsaWdodHM/OiBSZXNwb25zZUhpZ2hsaWdodFR5cGVcbn0pID0+IHtcbiAgcmV0dXJuIGhpZ2hsaWdodHMucmVkdWNlKChibG9iLCBoaWdobGlnaHQpID0+IHtcbiAgICBibG9iW2hpZ2hsaWdodC5pZF0gPSBoaWdobGlnaHQuaGlnaGxpZ2h0cy5yZWR1Y2UoXG4gICAgICAoaW5uZXJibG9iLCBzdWJoaWdobGlnaHQpID0+IHtcbiAgICAgICAgaW5uZXJibG9iW3N1YmhpZ2hsaWdodC5hdHRyaWJ1dGVdID0gaGlnaGxpZ2h0LmhpZ2hsaWdodHMuZmlsdGVyKFxuICAgICAgICAgIChobCkgPT4gaGwuYXR0cmlidXRlID09PSBzdWJoaWdobGlnaHQuYXR0cmlidXRlXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIGlubmVyYmxvYlxuICAgICAgfSxcbiAgICAgIHt9IGFzIHsgW2tleTogc3RyaW5nXTogQXJyYXk8QXR0cmlidXRlSGlnaGxpZ2h0PiB9XG4gICAgKVxuICAgIHJldHVybiBibG9iXG4gIH0sIHt9IGFzIFRyYW5zZm9ybWVkSGlnaGxpZ2h0c1R5cGUpXG59XG5cbnR5cGUgQ29uc3RydWN0b3JQcm9wcyA9IHtcbiAgZmlsdGVyVHJlZT86IEZpbHRlckJ1aWxkZXJDbGFzc1xuICByZXN1bHRzPzogUmVzdWx0VHlwZVtdXG4gIHNvcnRzPzogUXVlcnlTb3J0VHlwZVtdXG4gIHNvdXJjZXM/OiBzdHJpbmdbXVxuICB0cmFuc2Zvcm1Tb3J0cz86IFRyYW5zZm9ybVNvcnRzQ29tcG9zZWRGdW5jdGlvblR5cGVcbiAgc3RhdHVzPzogU2VhcmNoU3RhdHVzXG4gIGhpZ2hsaWdodHM/OiBUcmFuc2Zvcm1lZEhpZ2hsaWdodHNUeXBlXG4gIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzPzogYW55W11cbiAgZGlkWW91TWVhbkZpZWxkcz86IGFueVtdXG59XG5cbnR5cGUgU3Vic2NyaWJhYmxlVHlwZSA9XG4gIHwgJ3N0YXR1cydcbiAgfCAnZmlsdGVyZWRSZXN1bHRzJ1xuICB8ICdzZWxlY3RlZFJlc3VsdHMnXG4gIHwgJ3Jlc3VsdHMuYmFja2JvbmVTeW5jJ1xuICB8ICdmaWx0ZXJUcmVlJ1xudHlwZSBTdWJzY3JpcHRpb25UeXBlID0geyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH1cbi8qKlxuICogQ29uc3RydWN0ZWQgd2l0aCBwZXJmb3JtYW5jZSBpbiBtaW5kLCB0YWtpbmcgYWR2YW50YWdlIG9mIG1hcHMgd2hlbmV2ZXIgcG9zc2libGUuXG4gKiBUaGlzIGlzIHRoZSBoZWFydCBvZiBvdXIgYXBwLCBzbyB0YWtlIGNhcmUgd2hlbiB1cGRhdGluZyAvIGFkZGluZyB0aGluZ3MgaGVyZSB0b1xuICogZG8gaXQgd2l0aCBwZXJmb3JtYW5jZSBpbiBtaW5kLlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIExhenlRdWVyeVJlc3VsdHMge1xuICBbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuaXNTZWxlY3RlZCddOiAoKCkgPT4gdm9pZClbXTtcbiAgWydzdWJzY3JpcHRpb25zVG9PdGhlcnMucmVzdWx0LmJhY2tib25lQ3JlYXRlZCddOiAoKCkgPT4gdm9pZClbXTtcbiAgWydzdWJzY3JpcHRpb25zVG9PdGhlcnMucmVzdWx0LmJhY2tib25lU3luYyddOiAoKCkgPT4gdm9pZClbXTtcbiAgWydzdWJzY3JpcHRpb25zVG9NZS5zdGF0dXMnXTogU3Vic2NyaXB0aW9uVHlwZTtcbiAgWydzdWJzY3JpcHRpb25zVG9NZS5maWx0ZXJlZFJlc3VsdHMnXTogU3Vic2NyaXB0aW9uVHlwZTtcbiAgWydzdWJzY3JpcHRpb25zVG9NZS5zZWxlY3RlZFJlc3VsdHMnXTogU3Vic2NyaXB0aW9uVHlwZTtcbiAgWydzdWJzY3JpcHRpb25zVG9NZS5maWx0ZXJUcmVlJ106IFN1YnNjcmlwdGlvblR5cGU7XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUucmVzdWx0cy5iYWNrYm9uZVN5bmMnXTogU3Vic2NyaXB0aW9uVHlwZVxuICBzdWJzY3JpYmVUbyh7XG4gICAgc3Vic2NyaWJhYmxlVGhpbmcsXG4gICAgY2FsbGJhY2ssXG4gIH06IHtcbiAgICBzdWJzY3JpYmFibGVUaGluZzogU3Vic2NyaWJhYmxlVHlwZVxuICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkXG4gIH0pIHtcbiAgICBjb25zdCBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKVxuXG4gICAgLy8gQHRzLWlnbm9yZSByZW1vdmUgd2hlbiB3ZSB1cGdyYWRlIGFjZSB0byB1c2UgbGF0ZXN0IHR5cGVzY3JpcHRcbiAgICB0aGlzW2BzdWJzY3JpcHRpb25zVG9NZS4ke3N1YnNjcmliYWJsZVRoaW5nfWBdW2lkXSA9IGNhbGxiYWNrXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIEB0cy1pZ25vcmUgcmVtb3ZlIHdoZW4gd2UgdXBncmFkZSBhY2UgdG8gdXNlIGxhdGVzdCB0eXBlc2NyaXB0XG4gICAgICBkZWxldGUgdGhpc1tgc3Vic2NyaXB0aW9uc1RvTWUuJHtzdWJzY3JpYmFibGVUaGluZ31gXVtpZF1cbiAgICB9XG4gIH1cbiAgX25vdGlmeVN1YnNjcmliZXJzKHN1YnNjcmliYWJsZVRoaW5nOiBTdWJzY3JpYmFibGVUeXBlKSB7XG4gICAgLy8gQHRzLWlnbm9yZSByZW1vdmUgd2hlbiB3ZSB1cGdyYWRlIGFjZSB0byB1c2UgbGF0ZXN0IHR5cGVzY3JpcHRcbiAgICBjb25zdCBzdWJzY3JpYmVycyA9IHRoaXNbXG4gICAgICBgc3Vic2NyaXB0aW9uc1RvTWUuJHtzdWJzY3JpYmFibGVUaGluZ31gXG4gICAgXSBhcyBTdWJzY3JpcHRpb25UeXBlXG4gICAgT2JqZWN0LnZhbHVlcyhzdWJzY3JpYmVycykuZm9yRWFjaCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKCkpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMuc3RhdHVzJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ3N0YXR1cycpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMuZmlsdGVyZWRSZXN1bHRzJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ2ZpbHRlcmVkUmVzdWx0cycpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMuc2VsZWN0ZWRSZXN1bHRzJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ3NlbGVjdGVkUmVzdWx0cycpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMucmVzdWx0cy5iYWNrYm9uZVN5bmMnXSgpIHtcbiAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycygncmVzdWx0cy5iYWNrYm9uZVN5bmMnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlclRyZWUnXSgpIHtcbiAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycygnZmlsdGVyVHJlZScpXG4gIH1cbiAgX3R1cm5PbkRlYm91bmNpbmcoKSB7XG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnN0YXR1cyddID0gXy5kZWJvdW5jZShcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zdGF0dXMnXSxcbiAgICAgIGRlYm91bmNlVGltZVxuICAgIClcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuZmlsdGVyZWRSZXN1bHRzJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkUmVzdWx0cyddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zZWxlY3RlZFJlc3VsdHMnXSA9IF8uZGVib3VuY2UoXG4gICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc2VsZWN0ZWRSZXN1bHRzJ10sXG4gICAgICBkZWJvdW5jZVRpbWVcbiAgICApXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnJlc3VsdHMuYmFja2JvbmVTeW5jJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnJlc3VsdHMuYmFja2JvbmVTeW5jJ10sXG4gICAgICBkZWJvdW5jZVRpbWVcbiAgICApXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlclRyZWUnXSA9IF8uZGVib3VuY2UoXG4gICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuZmlsdGVyVHJlZSddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICB9XG4gIGNvbXBhcmVGdW5jdGlvbjogKGE6IExhenlRdWVyeVJlc3VsdCwgYjogTGF6eVF1ZXJ5UmVzdWx0KSA9PiBudW1iZXJcbiAgcmVzdWx0czoge1xuICAgIFtrZXk6IHN0cmluZ106IExhenlRdWVyeVJlc3VsdFxuICB9XG4gIHNlbGVjdGVkUmVzdWx0czoge1xuICAgIFtrZXk6IHN0cmluZ106IExhenlRdWVyeVJlc3VsdFxuICB9XG4gIF9nZXRNYXhJbmRleE9mU2VsZWN0ZWRSZXN1bHRzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuc2VsZWN0ZWRSZXN1bHRzKS5yZWR1Y2UoKG1heCwgcmVzdWx0KSA9PiB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgobWF4LCByZXN1bHQuaW5kZXgpXG4gICAgfSwgLTEpXG4gIH1cbiAgX2dldE1pbkluZGV4T2ZTZWxlY3RlZFJlc3VsdHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5zZWxlY3RlZFJlc3VsdHMpLnJlZHVjZSgobWluLCByZXN1bHQpID0+IHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihtaW4sIHJlc3VsdC5pbmRleClcbiAgICB9LCBPYmplY3Qua2V5cyh0aGlzLnJlc3VsdHMpLmxlbmd0aClcbiAgfVxuICAvKipcbiAgICogVGhpcyBpcyB1c2VkIG1vc3RseSBieVxuICAgKi9cbiAgZ3JvdXBTZWxlY3QoKSB7fVxuICAvKipcbiAgICogVGhpcyB3aWxsIHNldCBzd2F0aGVzIG9mIHNvcnRlZCByZXN1bHRzIHRvIGJlIHNlbGVjdGVkLiAgSXQgZG9lcyBub3QgZGVzZWxlY3QgYW55dGhpbmcuXG4gICAqIFByaW1hcmlseSB1c2VkIGluIHRoZSBsaXN0IHZpZXcgKGNhcmQgLyB0YWJsZSlcbiAgICovXG4gIHNoaWZ0U2VsZWN0KHRhcmdldDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgY29uc3QgZmlyc3RJbmRleCA9IHRoaXMuX2dldE1pbkluZGV4T2ZTZWxlY3RlZFJlc3VsdHMoKVxuICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuX2dldE1heEluZGV4T2ZTZWxlY3RlZFJlc3VsdHMoKVxuICAgIGNvbnN0IGluZGV4Q2xpY2tlZCA9IHRhcmdldC5pbmRleFxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkUmVzdWx0cykubGVuZ3RoID09PSAwKSB7XG4gICAgICB0YXJnZXQuc2V0U2VsZWN0ZWQodGFyZ2V0LmlzU2VsZWN0ZWQpXG4gICAgfSBlbHNlIGlmIChpbmRleENsaWNrZWQgPD0gZmlyc3RJbmRleCkge1xuICAgICAgLy8gdHJhdmVyc2UgZnJvbSB0YXJnZXQgdG8gbmV4dCB1bnRpbCBmaXJzdEluZGV4XG4gICAgICBsZXQgY3VycmVudEl0ZW0gPSB0YXJnZXQgYXMgTGF6eVF1ZXJ5UmVzdWx0IHwgdW5kZWZpbmVkXG4gICAgICB3aGlsZSAoY3VycmVudEl0ZW0gJiYgY3VycmVudEl0ZW0uaW5kZXggPD0gZmlyc3RJbmRleCkge1xuICAgICAgICBjdXJyZW50SXRlbS5zZXRTZWxlY3RlZCh0cnVlKVxuICAgICAgICBjdXJyZW50SXRlbSA9IGN1cnJlbnRJdGVtLm5leHRcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluZGV4Q2xpY2tlZCA+PSBsYXN0SW5kZXgpIHtcbiAgICAgIC8vIHRyYXZlcnNlIGZyb20gdGFyZ2V0IHRvIHByZXYgdW50aWwgbGFzdEluZGV4XG4gICAgICBsZXQgY3VycmVudEl0ZW0gPSB0YXJnZXQgYXMgTGF6eVF1ZXJ5UmVzdWx0IHwgdW5kZWZpbmVkXG4gICAgICB3aGlsZSAoY3VycmVudEl0ZW0gJiYgY3VycmVudEl0ZW0uaW5kZXggPj0gbGFzdEluZGV4KSB7XG4gICAgICAgIGN1cnJlbnRJdGVtLnNldFNlbGVjdGVkKHRydWUpXG4gICAgICAgIGN1cnJlbnRJdGVtID0gY3VycmVudEl0ZW0ucHJldlxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0cmF2ZXJzZSBmcm9tIHRhcmdldCB0byBwcmV2IHVudGlsIHNvbWV0aGluZyBkb2Vzbid0IGNoYW5nZVxuICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGFyZ2V0IGFzIExhenlRdWVyeVJlc3VsdCB8IHVuZGVmaW5lZFxuICAgICAgbGV0IGNoYW5nZWQgPSB0cnVlXG4gICAgICB3aGlsZSAoY3VycmVudEl0ZW0gJiYgY2hhbmdlZCkge1xuICAgICAgICBjaGFuZ2VkID0gY3VycmVudEl0ZW0uc2V0U2VsZWN0ZWQodHJ1ZSkgJiYgY2hhbmdlZFxuICAgICAgICBjdXJyZW50SXRlbSA9IGN1cnJlbnRJdGVtLnByZXZcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFRoaXMgdGFrZXMgYSBsaXN0IG9mIGlkcyB0byBzZXQgdG8gc2VsZWN0ZWQsIGFuZCB3aWxsIGRlc2VsZWN0IGFsbCBvdGhlcnMuXG4gICAqL1xuICBzZWxlY3RCeUlkcyh0YXJnZXRzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZGVzZWxlY3QoKVxuICAgIHRhcmdldHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGlmICh0aGlzLnJlc3VsdHNbaWRdKSB7XG4gICAgICAgIHRoaXMucmVzdWx0c1tpZF0uc2V0U2VsZWN0ZWQodHJ1ZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGNvbnRyb2xTZWxlY3QodGFyZ2V0OiBMYXp5UXVlcnlSZXN1bHQpIHtcbiAgICB0YXJnZXQuc2V0U2VsZWN0ZWQoIXRhcmdldC5pc1NlbGVjdGVkKVxuICB9XG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgdG9nZ2xlIHNlbGVjdGlvbiBvZiB0aGUgbGF6eVJlc3VsdCBwYXNzZWQgaW4sIGFuZCBkZXNlbGVjdCBhbGwgb3RoZXJzLlxuICAgKi9cbiAgc2VsZWN0KHRhcmdldDogTGF6eVF1ZXJ5UmVzdWx0KSB7XG4gICAgY29uc3QgaXNTZWxlY3RlZCA9ICF0YXJnZXQuaXNTZWxlY3RlZFxuICAgIHRoaXMuZGVzZWxlY3QoKVxuICAgIHRhcmdldC5zZXRTZWxlY3RlZChpc1NlbGVjdGVkKVxuICB9XG4gIGRlc2VsZWN0KCkge1xuICAgIE9iamVjdC52YWx1ZXModGhpcy5zZWxlY3RlZFJlc3VsdHMpLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgcmVzdWx0LnNldFNlbGVjdGVkKGZhbHNlKVxuICAgIH0pXG4gIH1cbiAgYmFja2JvbmVNb2RlbDogQmFja2JvbmUuTW9kZWxcbiAgLyoqXG4gICAqIENhbiBjb250YWluIGRpc3RhbmNlIC8gYmVzdCB0ZXh0IG1hdGNoXG4gICAqICh0aGlzIG1hdGNoZXMgd2hhdCB0aGUgcXVlcnkgcmVxdWVzdGVkKVxuICAgKi9cbiAgcGVyc2lzdGFudFNvcnRzOiBRdWVyeVNvcnRUeXBlW11cbiAgLyoqXG4gICAqIFBhc3MgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHNvcnRzIHRvIHVzZSwgYWxsb3dpbmcgc3VjaCB0aGluZ3MgYXMgc3Vic3RpdHV0aW5nIGVwaGVtZXJhbCBzb3J0c1xuICAgKi9cbiAgdHJhbnNmb3JtU29ydHM6IFRyYW5zZm9ybVNvcnRzQ29tcG9zZWRGdW5jdGlvblR5cGUgPSAoeyBvcmlnaW5hbFNvcnRzIH0pID0+IHtcbiAgICByZXR1cm4gb3JpZ2luYWxTb3J0c1xuICB9XG4gIC8qKlxuICAgKiAgU2hvdWxkIHJlYWxseSBvbmx5IGJlIHNldCBhdCBjb25zdHJ1Y3RvciB0aW1lIChtb21lbnQgYSBxdWVyeSBpcyBkb25lKVxuICAgKi9cbiAgX3VwZGF0ZVBlcnNpc3RhbnRTb3J0cyhzb3J0czogUXVlcnlTb3J0VHlwZVtdKSB7XG4gICAgdGhpcy5wZXJzaXN0YW50U29ydHMgPSBzb3J0c1xuICB9XG4gIF91cGRhdGVUcmFuc2Zvcm1Tb3J0cyh0cmFuc2Zvcm1Tb3J0czogVHJhbnNmb3JtU29ydHNDb21wb3NlZEZ1bmN0aW9uVHlwZSkge1xuICAgIHRoaXMudHJhbnNmb3JtU29ydHMgPSB0cmFuc2Zvcm1Tb3J0c1xuICB9XG4gIF9nZXRTb3J0ZWRSZXN1bHRzKHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdKSB7XG4gICAgcmV0dXJuIHJlc3VsdHMuc29ydChcbiAgICAgIGdlbmVyYXRlQ29tcGFyZUZ1bmN0aW9uKFxuICAgICAgICB0aGlzLnRyYW5zZm9ybVNvcnRzKHsgb3JpZ2luYWxTb3J0czogdGhpcy5wZXJzaXN0YW50U29ydHMgfSlcbiAgICAgIClcbiAgICApXG4gIH1cbiAgLyoqXG4gICAqIFRoZSBtYXAgb2YgcmVzdWx0cyB3aWxsIHVsdGltYXRlbHkgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlXG4gICAqIE1hcHMgZ3VhcmFudGVlIGNocm9ub2xvZ2ljYWwgb3JkZXIgZm9yIE9iamVjdC5rZXlzIG9wZXJhdGlvbnMsXG4gICAqIHNvIHdlIHR1cm4gaXQgaW50byBhbiBhcnJheSB0byBzb3J0IHRoZW4gZmVlZCBpdCBiYWNrIGludG8gYSBtYXAuXG4gICAqXG4gICAqIE9uIHJlc29ydCB3ZSBoYXZlIHRvIHVwZGF0ZSB0aGUgbGlua3MgYmV0d2VlbiByZXN1bHRzICh1c2VkIGZvciBzZWxlY3RpbmcgcGVyZm9ybWFudGx5KSxcbiAgICogYXMgd2VsbCBhcyB0aGUgaW5kZXhlcyB3aGljaCBhcmUgdXNlZCBzaW1pbGFybHlcbiAgICpcbiAgICovXG4gIF9yZXNvcnQoKSB7XG4gICAgdGhpcy5yZXN1bHRzID0gdGhpcy5fZ2V0U29ydGVkUmVzdWx0cyhPYmplY3QudmFsdWVzKHRoaXMucmVzdWx0cykpLnJlZHVjZShcbiAgICAgIChibG9iLCByZXN1bHQsIGluZGV4LCByZXN1bHRzKSA9PiB7XG4gICAgICAgIHJlc3VsdC5pbmRleCA9IGluZGV4XG4gICAgICAgIHJlc3VsdC5wcmV2ID0gcmVzdWx0c1tpbmRleCAtIDFdXG4gICAgICAgIHJlc3VsdC5uZXh0ID0gcmVzdWx0c1tpbmRleCArIDFdXG4gICAgICAgIGJsb2JbcmVzdWx0WydtZXRhY2FyZC5pZCddXSA9IHJlc3VsdFxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSxcbiAgICAgIHt9IGFzIHsgW2tleTogc3RyaW5nXTogTGF6eVF1ZXJ5UmVzdWx0IH1cbiAgICApXG4gIH1cbiAgLyoqXG4gICAqIFRoaXMgaXMgcHVyZWx5IHRvIGZvcmNlIGEgcmVyZW5kZXIgaW4gc2NlbmFyaW9zIHdoZXJlIHdlIHVwZGF0ZSByZXN1bHQgdmFsdWVzIGFuZCB3YW50IHRvIHVwZGF0ZSB2aWV3cyB3aXRob3V0IHJlc29ydGluZ1xuICAgKiAocmVzb3J0aW5nIHdvdWxkbid0IG1ha2Ugc2Vuc2UgdG8gZG8gY2xpZW50IHNpZGUgc2luY2UgdGhlcmUgY291bGQgYmUgbW9yZSByZXN1bHRzIG9uIHRoZSBzZXJ2ZXIpXG4gICAqIEl0IGFsc28gd291bGQgYmUgd2VpcmQgc2luY2UgdGhpbmdzIGluIHRhYmxlcyBvciBsaXN0cyBtaWdodCBqdW1wIGFyb3VuZCB3aGlsZSB0aGUgdXNlciBpcyB3b3JraW5nIHdpdGggdGhlbS5cbiAgICovXG4gIF9mYWtlUmVzb3J0KCkge1xuICAgIHRoaXMucmVzdWx0cyA9IE9iamVjdC52YWx1ZXModGhpcy5yZXN1bHRzKS5yZWR1Y2UoXG4gICAgICAoYmxvYiwgcmVzdWx0LCBpbmRleCwgcmVzdWx0cykgPT4ge1xuICAgICAgICByZXN1bHQuaW5kZXggPSBpbmRleFxuICAgICAgICByZXN1bHQucHJldiA9IHJlc3VsdHNbaW5kZXggLSAxXVxuICAgICAgICByZXN1bHQubmV4dCA9IHJlc3VsdHNbaW5kZXggKyAxXVxuICAgICAgICBibG9iW3Jlc3VsdFsnbWV0YWNhcmQuaWQnXV0gPSByZXN1bHRcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sXG4gICAgICB7fSBhcyB7IFtrZXk6IHN0cmluZ106IExhenlRdWVyeVJlc3VsdCB9XG4gICAgKVxuICB9XG4gIGhpZ2hsaWdodHM6IFRyYW5zZm9ybWVkSGlnaGxpZ2h0c1R5cGUgPSB7fVxuICAvLyB3ZSBjYW4gZG8gYSBzaGFsbG93IG1lcmdlIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyBvdmVybGFwIGJldHdlZW4gdGhlIHR3byBvYmplY3RzIChzZXBhcmF0ZSBxdWVyaWVzLCBzZXBlcmF0ZSByZXN1bHRzIGkuZS4gaWRzKVxuICBhZGRIaWdobGlnaHRzKGhpZ2hsaWdodHM6IFRyYW5zZm9ybWVkSGlnaGxpZ2h0c1R5cGUpIHtcbiAgICB0aGlzLmhpZ2hsaWdodHMgPSB7IC4uLnRoaXMuaGlnaGxpZ2h0cywgLi4uaGlnaGxpZ2h0cyB9XG4gIH1cbiAgcmVzZXRIaWdobGlnaHRzKCkge1xuICAgIHRoaXMuaGlnaGxpZ2h0cyA9IHt9XG4gIH1cbiAgY29uc3RydWN0b3Ioe1xuICAgIGZpbHRlclRyZWUgPSB1bmRlZmluZWQsXG4gICAgcmVzdWx0cyA9IFtdLFxuICAgIHNvcnRzID0gW10sXG4gICAgc291cmNlcyA9IFtdLFxuICAgIHRyYW5zZm9ybVNvcnRzLFxuICAgIHN0YXR1cyA9IHt9LFxuICAgIGhpZ2hsaWdodHMgPSB7fSxcbiAgICBkaWRZb3VNZWFuRmllbGRzID0gW10sXG4gICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMgPSBbXSxcbiAgfTogQ29uc3RydWN0b3JQcm9wcyA9IHt9KSB7XG4gICAgdGhpcy5fdHVybk9uRGVib3VuY2luZygpXG4gICAgdGhpcy5yZXNldCh7XG4gICAgICBmaWx0ZXJUcmVlLFxuICAgICAgcmVzdWx0cyxcbiAgICAgIHNvcnRzLFxuICAgICAgc291cmNlcyxcbiAgICAgIHRyYW5zZm9ybVNvcnRzLFxuICAgICAgc3RhdHVzLFxuICAgICAgaGlnaGxpZ2h0cyxcbiAgICAgIGRpZFlvdU1lYW5GaWVsZHMsXG4gICAgICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkcyxcbiAgICB9KVxuXG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKHtcbiAgICAgIGlkOiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCksXG4gICAgfSlcbiAgfVxuICBpbml0KCkge1xuICAgIHRoaXMuY3VycmVudEFzT2YgPSBEYXRlLm5vdygpXG4gICAgaWYgKHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuaXNTZWxlY3RlZCddKVxuICAgICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5pc1NlbGVjdGVkJ10uZm9yRWFjaCgodW5zdWJzY3JpYmUpID0+IHtcbiAgICAgICAgdW5zdWJzY3JpYmUoKVxuICAgICAgfSlcbiAgICBpZiAodGhpc1snc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5iYWNrYm9uZVN5bmMnXSlcbiAgICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb090aGVycy5yZXN1bHQuYmFja2JvbmVTeW5jJ10uZm9yRWFjaChcbiAgICAgICAgKHVuc3Vic2NyaWJlKSA9PiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5iYWNrYm9uZVN5bmMnXSA9IFtdXG4gICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5pc1NlbGVjdGVkJ10gPSBbXVxuICAgIHRoaXMuX3Jlc2V0U2VsZWN0ZWRSZXN1bHRzKClcbiAgICBpZiAodGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyZWRSZXN1bHRzJ10gPT09IHVuZGVmaW5lZClcbiAgICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLmZpbHRlcmVkUmVzdWx0cyddID0ge31cbiAgICBpZiAodGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuc2VsZWN0ZWRSZXN1bHRzJ10gPT09IHVuZGVmaW5lZClcbiAgICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLnNlbGVjdGVkUmVzdWx0cyddID0ge31cbiAgICBpZiAodGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuc3RhdHVzJ10gPT09IHVuZGVmaW5lZClcbiAgICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLnN0YXR1cyddID0ge31cbiAgICBpZiAodGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyVHJlZSddID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5maWx0ZXJUcmVlJ10gPSB7fVxuICAgIHRoaXMucmVzdWx0cyA9IHt9XG4gICAgdGhpcy50eXBlcyA9IHt9XG4gICAgdGhpcy5zb3VyY2VzID0gW11cbiAgICB0aGlzLnN0YXR1cyA9IHt9XG4gIH1cbiAgX3Jlc2V0U2VsZWN0ZWRSZXN1bHRzKCkge1xuICAgIGNvbnN0IHNob3VsZE5vdGlmeSA9XG4gICAgICB0aGlzLnNlbGVjdGVkUmVzdWx0cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkUmVzdWx0cykubGVuZ3RoID4gMFxuICAgIHRoaXMuc2VsZWN0ZWRSZXN1bHRzID0ge31cbiAgICBpZiAoc2hvdWxkTm90aWZ5KSB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc2VsZWN0ZWRSZXN1bHRzJ10oKVxuICB9XG4gIHJlc2V0KHtcbiAgICBmaWx0ZXJUcmVlID0gdW5kZWZpbmVkLFxuICAgIHJlc3VsdHMgPSBbXSxcbiAgICBzb3J0cyA9IFtdLFxuICAgIHNvdXJjZXMgPSBbXSxcbiAgICB0cmFuc2Zvcm1Tb3J0cyA9ICh7IG9yaWdpbmFsU29ydHMgfSkgPT4ge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsU29ydHNcbiAgICB9LFxuICAgIHN0YXR1cyA9IHt9LFxuICAgIGhpZ2hsaWdodHMgPSB7fSxcbiAgICBkaWRZb3VNZWFuRmllbGRzID0gW10sXG4gICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMgPSBbXSxcbiAgfTogQ29uc3RydWN0b3JQcm9wcyA9IHt9KSB7XG4gICAgdGhpcy5pbml0KClcbiAgICB0aGlzLnJlc2V0SGlnaGxpZ2h0cygpXG4gICAgdGhpcy5yZXNldERpZFlvdU1lYW5GaWVsZHMoKVxuICAgIHRoaXMucmVzZXRTaG93aW5nUmVzdWx0c0ZvckZpZWxkcygpXG4gICAgdGhpcy5fcmVzZXRGaWx0ZXJUcmVlKGZpbHRlclRyZWUpXG4gICAgdGhpcy5fcmVzZXRTb3VyY2VzKHNvdXJjZXMpXG4gICAgdGhpcy5fdXBkYXRlUGVyc2lzdGFudFNvcnRzKHNvcnRzKVxuICAgIHRoaXMuX3VwZGF0ZVRyYW5zZm9ybVNvcnRzKHRyYW5zZm9ybVNvcnRzKVxuICAgIHRoaXMudXBkYXRlRGlkWW91TWVhbkZpZWxkcyhkaWRZb3VNZWFuRmllbGRzKVxuICAgIHRoaXMudXBkYXRlU2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMoc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMpXG4gICAgdGhpcy5hZGRIaWdobGlnaHRzKGhpZ2hsaWdodHMpXG4gICAgdGhpcy5hZGQoeyByZXN1bHRzIH0pXG4gICAgdGhpcy51cGRhdGVTdGF0dXMoc3RhdHVzKVxuICB9XG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5iYWNrYm9uZU1vZGVsLnN0b3BMaXN0ZW5pbmcoKVxuICB9XG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucmVzdWx0cykubGVuZ3RoID09PSAwXG4gIH1cbiAgYWRkKHtcbiAgICByZXN1bHRzID0gW10sXG4gIH06IHtcbiAgICByZXN1bHRzPzogUmVzdWx0VHlwZVtdXG4gIH0gPSB7fSkge1xuICAgIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICBjb25zdCBsYXp5UmVzdWx0ID0gbmV3IExhenlRdWVyeVJlc3VsdChcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICB0aGlzLmhpZ2hsaWdodHNbcmVzdWx0Lm1ldGFjYXJkLnByb3BlcnRpZXMuaWRdXG4gICAgICApXG4gICAgICB0aGlzLnJlc3VsdHNbbGF6eVJlc3VsdFsnbWV0YWNhcmQuaWQnXV0gPSBsYXp5UmVzdWx0XG4gICAgICBsYXp5UmVzdWx0LnBhcmVudCA9IHRoaXNcbiAgICAgIC8qKlxuICAgICAgICogS2VlcCBhIGZhc3QgbG9va3VwIG9mIHdoYXQgcmVzdWx0cyBhcmUgc2VsZWN0ZWRcbiAgICAgICAqL1xuICAgICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvT3RoZXJzLnJlc3VsdC5pc1NlbGVjdGVkJ10ucHVzaChcbiAgICAgICAgbGF6eVJlc3VsdC5zdWJzY3JpYmVUbyh7XG4gICAgICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzZWxlY3RlZCcsXG4gICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGVkUmVzdWx0cyh7IGxhenlSZXN1bHQgfSlcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLyoqXG4gICAgICAgKiBXaGVuIGEgYmFja2JvbmUgbW9kZWwgaXMgY3JlYXRlZCB3ZSB3YW50IHRvIHN0YXJ0IGxpc3RlbmluZyBmb3IgdXBkYXRlcyBzbyB0aGUgcGxhaW4gb2JqZWN0IGhhcyB0aGUgc2FtZSBpbmZvcm1hdGlvblxuICAgICAgICovXG4gICAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9PdGhlcnMucmVzdWx0LmJhY2tib25lU3luYyddLnB1c2goXG4gICAgICAgIGxhenlSZXN1bHQuc3Vic2NyaWJlVG8oe1xuICAgICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnYmFja2JvbmVTeW5jJyxcbiAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiAgSW4gdGhpcyBjYXNlIHdlIGRvbid0IHdhbnQgdG8gcmVhbGx5IHJlc29ydCwganVzdCBmb3JjZSByZW5kZXJzIG9uIHZpZXdzIGJ5IHRlbGxpbmcgdGhlbSB0aGluZ3MgaGF2ZSBjaGFuZ2VkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9mYWtlUmVzb3J0KClcbiAgICAgICAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJlZFJlc3VsdHMnXSgpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9KVxuICAgIHRoaXMuX3Jlc29ydCgpXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkUmVzdWx0cyddKClcbiAgfVxuICBfdXBkYXRlU2VsZWN0ZWRSZXN1bHRzKHsgbGF6eVJlc3VsdCB9OiB7IGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdCB9KSB7XG4gICAgaWYgKGxhenlSZXN1bHQuaXNTZWxlY3RlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZFJlc3VsdHNbbGF6eVJlc3VsdFsnbWV0YWNhcmQuaWQnXV0gPSBsYXp5UmVzdWx0XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkUmVzdWx0c1tsYXp5UmVzdWx0WydtZXRhY2FyZC5pZCddXVxuICAgIH1cbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc2VsZWN0ZWRSZXN1bHRzJ10oKVxuICB9XG4gIHR5cGVzOiBNZXRhY2FyZFR5cGVzXG4gIGFkZFR5cGVzKHR5cGVzOiBNZXRhY2FyZFR5cGVzKSB7XG4gICAgdGhpcy50eXBlcyA9IHtcbiAgICAgIC4uLnRoaXMudHlwZXMsXG4gICAgICAuLi50eXBlcyxcbiAgICB9XG4gIH1cbiAgZ2V0Q3VycmVudEF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKFxuICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLnR5cGVzKS5yZWR1Y2UoKGJsb2IsIGRlZmluaXRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5ibG9iLFxuICAgICAgICAgIC4uLmRlZmluaXRpb24sXG4gICAgICAgIH1cbiAgICAgIH0sIHt9KVxuICAgIClcbiAgfVxuICBzb3VyY2VzOiBzdHJpbmdbXVxuICBfcmVzZXRTb3VyY2VzKHNvdXJjZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5zb3VyY2VzID0gc291cmNlc1xuICAgIHRoaXMuX3Jlc2V0U3RhdHVzKClcbiAgfVxuICBfcmVzZXRTdGF0dXMoKSB7XG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLnNvdXJjZXMucmVkdWNlKChibG9iLCBzb3VyY2UpID0+IHtcbiAgICAgIGJsb2Jbc291cmNlXSA9IG5ldyBTdGF0dXMoeyBpZDogc291cmNlIH0pXG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sIHt9IGFzIFNlYXJjaFN0YXR1cylcbiAgICB0aGlzLl91cGRhdGVJc1NlYXJjaGluZygpXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnN0YXR1cyddKClcbiAgfVxuICBmaWx0ZXJUcmVlPzogRmlsdGVyQnVpbGRlckNsYXNzXG4gIF9yZXNldEZpbHRlclRyZWUoZmlsdGVyVHJlZT86IEZpbHRlckJ1aWxkZXJDbGFzcykge1xuICAgIHRoaXMuZmlsdGVyVHJlZSA9IGZpbHRlclRyZWVcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuZmlsdGVyVHJlZSddKClcbiAgfVxuICBjYW5jZWwoKSB7XG4gICAgT2JqZWN0LmtleXMoc3RhdHVzKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzW2lkXS5oYXNSZXR1cm5lZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5zdGF0dXNbaWRdLnVwZGF0ZVN0YXR1cyh7XG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZTogJ0NhbmNlbGVkIGJ5IHVzZXInLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IGZhbHNlLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5fdXBkYXRlSXNTZWFyY2hpbmcoKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zdGF0dXMnXSgpXG4gIH1cbiAgdXBkYXRlU3RhdHVzKHN0YXR1czogU2VhcmNoU3RhdHVzKSB7XG4gICAgT2JqZWN0LmtleXMoc3RhdHVzKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgdGhpcy5zdGF0dXNbaWRdLnVwZGF0ZVN0YXR1cyhzdGF0dXNbaWRdKVxuICAgIH0pXG4gICAgdGhpcy5fdXBkYXRlSXNTZWFyY2hpbmcoKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zdGF0dXMnXSgpXG4gIH1cbiAgdXBkYXRlU3RhdHVzV2l0aEVycm9yKHtcbiAgICBzb3VyY2VzLFxuICAgIG1lc3NhZ2UsXG4gIH06IHtcbiAgICBzb3VyY2VzOiBzdHJpbmdbXVxuICAgIG1lc3NhZ2U6IHN0cmluZ1xuICB9KSB7XG4gICAgc291cmNlcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzW2lkXSlcbiAgICAgICAgdGhpcy5zdGF0dXNbaWRdLnVwZGF0ZVN0YXR1cyh7XG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICBzdWNjZXNzZnVsOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX3VwZGF0ZUlzU2VhcmNoaW5nKClcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuc3RhdHVzJ10oKVxuICB9XG4gIF91cGRhdGVJc1NlYXJjaGluZygpIHtcbiAgICB0aGlzLmlzU2VhcmNoaW5nID0gT2JqZWN0LnZhbHVlcyh0aGlzLnN0YXR1cykuc29tZSgoc3RhdHVzKSA9PiB7XG4gICAgICByZXR1cm4gIXN0YXR1cy5oYXNSZXR1cm5lZFxuICAgIH0pXG4gIH1cbiAgaXNTZWFyY2hpbmc6IGJvb2xlYW5cbiAgY3VycmVudEFzT2Y6IG51bWJlclxuICBzdGF0dXM6IFNlYXJjaFN0YXR1c1xuICB1cGRhdGVEaWRZb3VNZWFuRmllbGRzKHVwZGF0ZTogYW55W10gfCBudWxsKSB7XG4gICAgaWYgKHVwZGF0ZSAhPT0gbnVsbClcbiAgICAgIHRoaXMuZGlkWW91TWVhbkZpZWxkcyA9IFsuLi50aGlzLmRpZFlvdU1lYW5GaWVsZHMsIC4uLnVwZGF0ZV1cbiAgfVxuICByZXNldERpZFlvdU1lYW5GaWVsZHMoKSB7XG4gICAgdGhpcy5kaWRZb3VNZWFuRmllbGRzID0gW11cbiAgfVxuICBkaWRZb3VNZWFuRmllbGRzOiBhbnlbXVxuICB1cGRhdGVTaG93aW5nUmVzdWx0c0ZvckZpZWxkcyh1cGRhdGU6IGFueVtdIHwgbnVsbCkge1xuICAgIGlmICh1cGRhdGUgIT09IG51bGwpXG4gICAgICB0aGlzLnNob3dpbmdSZXN1bHRzRm9yRmllbGRzID0gW1xuICAgICAgICAuLi50aGlzLnNob3dpbmdSZXN1bHRzRm9yRmllbGRzLFxuICAgICAgICAuLi51cGRhdGUsXG4gICAgICBdXG4gIH1cbiAgcmVzZXRTaG93aW5nUmVzdWx0c0ZvckZpZWxkcygpIHtcbiAgICB0aGlzLnNob3dpbmdSZXN1bHRzRm9yRmllbGRzID0gW11cbiAgfVxuICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkczogYW55W11cbn1cblxudHlwZSBNZXRhY2FyZFR5cGVzID0ge1xuICBba2V5OiBzdHJpbmddOiB7XG4gICAgW2tleTogc3RyaW5nXToge1xuICAgICAgZm9ybWF0OiBzdHJpbmdcbiAgICAgIG11bHRpdmFsdWVkOiBib29sZWFuXG4gICAgICBpbmRleGVkOiBib29sZWFuXG4gICAgfVxuICB9XG59XG4iXX0=