import { __assign, __read, __spreadArray } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import Backbone from 'backbone';
import _ from 'underscore';
import QueryResponse from './QueryResponse';
import { postSimpleAuditLog } from '../../react-component/utils/audit/audit-endpoint';
import cql from '../cql';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash.clonedeep';
import { v4 } from 'uuid';
import 'backbone-associations';
import { LazyQueryResults, } from './LazyQueryResult/LazyQueryResults';
import { FilterBuilderClass, FilterClass, } from '../../component/filter-builder/filter.structure';
import { downgradeFilterTreeToBasic } from '../../component/query-basic/query-basic.view';
import { getConstrainedFinalPageForSourceGroup, getConstrainedNextPageForSourceGroup, getCurrentStartAndEndForSourceGroup, getConstrainedPreviousPageForSourceGroup, hasNextPageForSourceGroup, hasPreviousPageForSourceGroup, } from './Query.methods';
import wreqr from '../wreqr';
import { CommonAjaxSettings } from '../AjaxSettings';
import { StartupDataStore } from './Startup/startup';
function limitToDeleted(cqlFilterTree) {
    return new FilterBuilderClass({
        type: 'AND',
        filters: [
            cqlFilterTree,
            new FilterClass({
                property: '"metacard-tags"',
                type: 'ILIKE',
                value: 'deleted',
            }),
            new FilterClass({
                property: '"metacard.deleted.tags"',
                type: 'ILIKE',
                value: 'resource',
            }),
        ],
    });
}
function limitToHistoric(cqlFilterTree) {
    return new FilterBuilderClass({
        type: 'AND',
        filters: [
            cqlFilterTree,
            new FilterClass({
                property: '"metacard-tags"',
                type: 'ILIKE',
                value: 'revision',
            }),
        ],
    });
}
export default Backbone.AssociatedModel.extend({
    relations: [
        {
            type: Backbone.One,
            key: 'result',
            relatedModel: QueryResponse,
            isTransient: true,
        },
    ],
    // override constructor slightly to ensure options / attributes are available on the self ref immediately
    constructor: function (attributes, options) {
        if (!options ||
            !options.transformDefaults ||
            !options.transformFilterTree ||
            !options.transformSorts ||
            !options.transformCount) {
            throw new Error('Options for transformDefaults, transformFilterTree, transformSorts, and transformCount must be provided');
        }
        this._constructorAttributes = attributes || {};
        this.options = options;
        return Backbone.AssociatedModel.apply(this, arguments);
    },
    set: function (data) {
        if (typeof data === 'object' &&
            data.filterTree !== undefined &&
            typeof data.filterTree === 'string') {
            // for backwards compatability
            try {
                data.filterTree = new FilterBuilderClass(JSON.parse(data.filterTree));
            }
            catch (e) {
                console.error(e);
            }
        }
        return Backbone.AssociatedModel.prototype.set.apply(this, arguments);
    },
    toJSON: function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var json = (_a = Backbone.AssociatedModel.prototype.toJSON).call.apply(_a, __spreadArray([this], __read(args), false));
        if (typeof json.filterTree === 'object') {
            json.filterTree = JSON.stringify(json.filterTree);
        }
        return json;
    },
    defaults: function () {
        var _this = this;
        var _a, _b;
        var filterTree = (_a = this._constructorAttributes) === null || _a === void 0 ? void 0 : _a.filterTree;
        var constructedFilterTree;
        var constructedCql = ((_b = this._constructorAttributes) === null || _b === void 0 ? void 0 : _b.cql) || "anyText ILIKE '*'";
        if (filterTree && typeof filterTree === 'string') {
            constructedFilterTree = new FilterBuilderClass(JSON.parse(filterTree));
        }
        else if (!filterTree || filterTree.id === undefined) {
            // when we make drastic changes to filter tree it will be necessary to fall back to cql and reconstruct a filter tree that's compatible
            constructedFilterTree = cql.read(constructedCql);
            console.warn('migrating a filter tree to the latest structure');
            wreqr.vent.trigger('filterTree:migration', {
                search: this,
            });
        }
        else {
            constructedFilterTree = new FilterBuilderClass(filterTree);
        }
        return this.options.transformDefaults({
            originalDefaults: {
                cql: constructedCql,
                filterTree: constructedFilterTree,
                associatedFormModel: undefined,
                excludeUnnecessaryAttributes: true,
                count: StartupDataStore.Configuration.getResultCount(),
                sorts: [
                    {
                        attribute: 'modified',
                        direction: 'descending',
                    },
                ],
                sources: ['all'],
                // initialize this here so we can avoid creating spurious references to LazyQueryResults objects
                result: new QueryResponse({
                    lazyResults: new LazyQueryResults({
                        filterTree: constructedFilterTree,
                        sorts: [],
                        sources: [],
                        transformSorts: function (_a) {
                            var originalSorts = _a.originalSorts;
                            return _this.options.transformSorts({
                                originalSorts: originalSorts,
                                queryRef: _this,
                            });
                        },
                    }),
                }),
                type: 'text',
                isLocal: false,
                isOutdated: false,
                'detail-level': undefined,
                spellcheck: false,
                phonetics: false,
                additionalOptions: '{}',
                currentIndexForSourceGroup: {},
                nextIndexForSourceGroup: {},
                mostRecentStatus: {},
            },
            queryRef: this,
        });
    },
    /**
     *  Add filterTree in here, since initialize is only run once (and defaults can't have filterTree)
     */
    resetToDefaults: function (overridenDefaults) {
        var defaults = _.omit(__assign(__assign({}, this.defaults()), { filterTree: new FilterBuilderClass({
                filters: [
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'AND',
            }) }), ['isLocal', 'result']);
        this.set(_merge(defaults, overridenDefaults));
        this.trigger('resetToDefaults');
    },
    applyDefaults: function () {
        this.set(_.pick(this.defaults(), ['sorts', 'sources']));
    },
    revert: function () {
        this.trigger('revert');
    },
    isLocal: function () {
        return this.get('isLocal');
    },
    _handleDeprecatedFederation: function (attributes) {
        if (attributes && attributes.federation) {
            console.error('Attempt to set federation on a search.  This attribute is deprecated.  Did you mean to set sources?');
        }
    },
    initialize: function (attributes) {
        var _this = this;
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        _.bindAll.apply(_, [this].concat(_.functions(this))); // underscore bindAll does not take array arg
        this._handleDeprecatedFederation(attributes);
        this.listenTo(this, 'change:cql change:filterTree change:sources change:sorts change:spellcheck change:phonetics change:count change:additionalOptions', function () {
            _this.set('isOutdated', true);
            _this.set('mostRecentStatus', {});
        });
        this.listenTo(this, 'change:filterTree', function () {
            _this.getLazyResults()._resetFilterTree(_this.get('filterTree'));
        });
        // basically remove invalid filters when going from basic to advanced, and make it basic compatible
        this.listenTo(this, 'change:type', function () {
            if (_this.get('type') === 'basic') {
                var cleanedUpFilterTree = cql.removeInvalidFilters(_this.get('filterTree'));
                _this.set('filterTree', downgradeFilterTreeToBasic(cleanedUpFilterTree));
            }
        });
        this.getLazyResults().subscribeTo({
            subscribableThing: 'status',
            callback: function () {
                _this.updateMostRecentStatus();
            },
        });
    },
    getSelectedSources: function () {
        var Sources = StartupDataStore.Sources.sources;
        var sourceIds = Sources.map(function (src) { return src.id; });
        var localSourceIds = Sources.filter(function (source) { return source.harvested; }).map(function (src) { return src.id; });
        var remoteSourceIds = Sources.filter(function (source) { return !source.harvested; }).map(function (src) { return src.id; });
        var selectedSources = this.get('sources');
        var sourceArray = selectedSources;
        if (selectedSources.includes('all')) {
            sourceArray = sourceIds;
        }
        if (selectedSources.includes('local')) {
            sourceArray = sourceArray
                .concat(localSourceIds)
                .filter(function (src) { return src !== 'local'; });
        }
        if (selectedSources.includes('remote')) {
            sourceArray = sourceArray
                .concat(remoteSourceIds)
                .filter(function (src) { return src !== 'remote'; });
        }
        return sourceArray;
    },
    buildSearchData: function () {
        var data = this.toJSON();
        data.sources = this.getSelectedSources();
        data.count = this.options.transformCount({
            originalCount: this.get('count'),
            queryRef: this,
        });
        data.sorts = this.options.transformSorts({
            originalSorts: this.get('sorts'),
            queryRef: this,
        });
        return _.pick(data, 'sources', 'count', 'timeout', 'cql', 'sorts', 'id', 'spellcheck', 'phonetics', 'additionalOptions');
    },
    isOutdated: function () {
        return this.get('isOutdated');
    },
    startSearchIfOutdated: function () {
        if (this.isOutdated()) {
            this.startSearch();
        }
    },
    /**
     * We only keep filterTree up to date, then when we interact with the server we write out what it means
     *
     * We do this for performance, and because transformation is lossy.
     *
     * Also notice that we do a slight bit of validation, so anything that has no filters will translate to a star query (everything)
     */
    updateCqlBasedOnFilterTree: function () {
        var filterTree = this.get('filterTree');
        if (!filterTree ||
            filterTree.filters === undefined ||
            filterTree.filters.length === 0) {
            this.set('filterTree', new FilterBuilderClass({
                filters: [
                    new FilterClass({ value: '*', property: 'anyText', type: 'ILIKE' }),
                ],
                type: 'AND',
            }));
            this.updateCqlBasedOnFilterTree();
        }
        else {
            this.set('cql', cql.write(filterTree));
        }
    },
    startSearchFromFirstPage: function (options, done) {
        this.updateCqlBasedOnFilterTree();
        this.resetCurrentIndexForSourceGroup();
        this.startSearch(options, done);
    },
    initializeResult: function (options) {
        var _this = this;
        var Sources = StartupDataStore.Sources.sources;
        options = _.extend({
            limitToDeleted: false,
            limitToHistoric: false,
        }, options);
        var data = _cloneDeep(this.buildSearchData());
        data.batchId = v4();
        // Data.sources is set in `buildSearchData` based on which sources you have selected.
        var selectedSources = data.sources;
        var harvestedSources = Sources.filter(function (source) { return source.harvested; }).map(function (source) { return source.id; });
        var isHarvested = function (id) { return harvestedSources.includes(id); };
        var isFederated = function (id) { return !harvestedSources.includes(id); };
        if (options.limitToDeleted) {
            selectedSources = data.sources.filter(isHarvested);
        }
        var result = this.get('result');
        this.getLazyResults().reset({
            filterTree: this.get('filterTree'),
            sorts: this.get('sorts'),
            sources: selectedSources,
            transformSorts: function (_a) {
                var originalSorts = _a.originalSorts;
                return _this.options.transformSorts({ originalSorts: originalSorts, queryRef: _this });
            },
        });
        return {
            data: data,
            selectedSources: selectedSources,
            isHarvested: isHarvested,
            isFederated: isFederated,
            result: result,
            resultOptions: options,
        };
    },
    // we need at least one status for the search to be able to correctly page things, technically we could just use the first one
    updateMostRecentStatus: function () {
        var currentStatus = this.getLazyResults().status;
        var previousStatus = this.getMostRecentStatus();
        var newStatus = JSON.parse(JSON.stringify(previousStatus));
        // compare each key and overwrite only when the new status is successful - we need a successful status to page
        Object.keys(currentStatus).forEach(function (key) {
            if (currentStatus[key].successful) {
                newStatus[key] = currentStatus[key];
            }
        });
        this.set('mostRecentStatus', newStatus);
    },
    getLazyResults: function () {
        return this.get('result').get('lazyResults');
    },
    startSearch: function (options, done) {
        var _this = this;
        this.trigger('panToShapesExtent');
        this.set('isOutdated', false);
        if (this.get('cql') === '') {
            return;
        }
        this.cancelCurrentSearches();
        var _a = this.initializeResult(options), data = _a.data, selectedSources = _a.selectedSources, isHarvested = _a.isHarvested, isFederated = _a.isFederated, result = _a.result, resultOptions = _a.resultOptions;
        data.fromUI = true;
        var cqlFilterTree = this.get('filterTree');
        if (resultOptions.limitToDeleted) {
            cqlFilterTree = limitToDeleted(cqlFilterTree);
        }
        else if (resultOptions.limitToHistoric) {
            cqlFilterTree = limitToHistoric(cqlFilterTree);
        }
        var cqlString = this.options.transformFilterTree({
            originalFilterTree: cqlFilterTree,
            queryRef: this,
        });
        this.set('currentIndexForSourceGroup', this.getNextIndexForSourceGroup());
        postSimpleAuditLog({
            action: 'SEARCH_SUBMITTED',
            component: 'query: [' + cqlString + '] sources: [' + selectedSources + ']',
        });
        var federatedSearchesToRun = selectedSources
            .filter(isFederated)
            .map(function (source) { return (__assign(__assign({}, data), { cql: cqlString, srcs: [source], start: _this.get('currentIndexForSourceGroup')[source] })); });
        var searchesToRun = __spreadArray([], __read(federatedSearchesToRun), false).filter(function (search) { return search.srcs.length > 0; });
        if (this.getCurrentIndexForSourceGroup().local) {
            var localSearchToRun = __assign(__assign({}, data), { cql: cqlString, srcs: selectedSources.filter(isHarvested), start: this.getCurrentIndexForSourceGroup().local });
            searchesToRun.push(localSearchToRun);
        }
        if (searchesToRun.length === 0) {
            // reset to all and run
            this.set('sources', ['all']);
            this.startSearchFromFirstPage();
            return;
        }
        this.currentSearches = searchesToRun.map(function (search) {
            delete search.sources; // This key isn't used on the backend and only serves to confuse those debugging this code.
            // `result` is QueryResponse
            return result.fetch(__assign(__assign({}, CommonAjaxSettings), { customErrorHandling: true, data: JSON.stringify(search), remove: false, dataType: 'json', contentType: 'application/json', method: 'POST', processData: false, timeout: StartupDataStore.Configuration.getSearchTimeout(), success: function (_model, response, options) {
                    response.options = options;
                }, error: function (_model, response, options) {
                    response.options = options;
                } }));
        });
        if (typeof done === 'function') {
            done(this.currentSearches);
        }
    },
    currentSearches: [],
    cancelCurrentSearches: function () {
        this.currentSearches.forEach(function (request) {
            request.abort('Canceled');
        });
        var result = this.get('result');
        if (result) {
            this.getLazyResults().cancel();
        }
        this.currentSearches = [];
    },
    clearResults: function () {
        this.cancelCurrentSearches();
        this.set({
            result: undefined,
        });
    },
    setSources: function (sources) {
        var sourceArr = [];
        sources.each(function (src) {
            if (src.get('available') === true) {
                sourceArr.push(src.get('id'));
            }
        });
        if (sourceArr.length > 0) {
            this.set('sources', sourceArr.join(','));
        }
        else {
            this.set('sources', '');
        }
    },
    setColor: function (color) {
        this.set('color', color);
    },
    getColor: function () {
        return this.get('color');
    },
    color: function () {
        return this.get('color');
    },
    getPreviousServerPage: function () {
        this.setNextIndexForSourceGroupToPrevPage();
        this.startSearch();
    },
    /**
     * Much simpler than seeing if a next page exists
     */
    hasPreviousServerPage: function () {
        return hasPreviousPageForSourceGroup({
            currentIndexForSourceGroup: this.getCurrentIndexForSourceGroup(),
        });
    },
    hasNextServerPage: function () {
        return hasNextPageForSourceGroup({
            queryStatus: this.getMostRecentStatus(),
            isLocal: this.isLocalSource,
            currentIndexForSourceGroup: this.getCurrentIndexForSourceGroup(),
            count: this.get('count'),
        });
    },
    getNextServerPage: function () {
        this.setNextIndexForSourceGroupToNextPage();
        this.startSearch();
    },
    getHasFirstServerPage: function () {
        // so technically always "true" but what we really mean is, are we not on page 1 already
        return this.hasPreviousServerPage();
    },
    getFirstServerPage: function () {
        this.startSearchFromFirstPage();
    },
    getHasLastServerPage: function () {
        // so technically always "true" but what we really mean is, are we not on last page already
        return this.hasNextServerPage();
    },
    getLastServerPage: function () {
        this.set('nextIndexForSourceGroup', getConstrainedFinalPageForSourceGroup({
            queryStatus: this.getMostRecentStatus(),
            isLocal: this.isLocalSource,
            count: this.get('count'),
        }));
        this.startSearch();
    },
    resetCurrentIndexForSourceGroup: function () {
        this.set('currentIndexForSourceGroup', {});
        if (this.get('result')) {
            this.getLazyResults()._resetSources([]);
        }
        this.setNextIndexForSourceGroupToNextPage();
    },
    /**
     * Update the next index to be the prev page
     */
    setNextIndexForSourceGroupToPrevPage: function () {
        this.set('nextIndexForSourceGroup', getConstrainedPreviousPageForSourceGroup({
            sources: this.getSelectedSources(),
            currentIndexForSourceGroup: this.getCurrentIndexForSourceGroup(),
            count: this.get('count'),
            isLocal: this.isLocalSource,
            queryStatus: this.getMostRecentStatus(),
        }));
    },
    isLocalSource: function (id) {
        var Sources = StartupDataStore.Sources.sources;
        var harvestedSources = Sources.filter(function (source) { return source.harvested; }).map(function (source) { return source.id; });
        return harvestedSources.includes(id);
    },
    /**
     * Update the next index to be the next page
     */
    setNextIndexForSourceGroupToNextPage: function () {
        this.set('nextIndexForSourceGroup', getConstrainedNextPageForSourceGroup({
            sources: this.getSelectedSources(),
            currentIndexForSourceGroup: this.getCurrentIndexForSourceGroup(),
            count: this.get('count'),
            isLocal: this.isLocalSource,
            queryStatus: this.getMostRecentStatus(),
        }));
    },
    getCurrentStartAndEndForSourceGroup: function () {
        return getCurrentStartAndEndForSourceGroup({
            currentIndexForSourceGroup: this.getCurrentIndexForSourceGroup(),
            queryStatus: this.getMostRecentStatus(),
            isLocal: this.isLocalSource,
        });
    },
    // try to return the most recent successful status
    getMostRecentStatus: function () {
        var mostRecentStatus = this.get('mostRecentStatus');
        if (Object.keys(mostRecentStatus).length === 0) {
            return this.getLazyResults().status || {};
        }
        return mostRecentStatus;
    },
    getCurrentIndexForSourceGroup: function () {
        return this.get('currentIndexForSourceGroup');
    },
    getNextIndexForSourceGroup: function () {
        return this.get('nextIndexForSourceGroup');
    },
    hasCurrentIndexForSourceGroup: function () {
        return Object.keys(this.getCurrentIndexForSourceGroup()).length > 0;
    },
    refetch: function () {
        if (this.canRefetch()) {
            this.set('nextIndexForSourceGroup', this.getCurrentIndexForSourceGroup());
            this.startSearch();
        }
        else {
            throw new Error('Missing necessary data to refetch (currentIndexForSourceGroup), or search criteria is outdated.');
        }
    },
    // as long as we have a current index, and the search criteria isn't out of date, we can refetch - useful for resuming searches
    canRefetch: function () {
        return this.hasCurrentIndexForSourceGroup() && !this.isOutdated();
    },
    // common enough that we should extract this for ease of use
    refetchOrStartSearchFromFirstPage: function () {
        if (this.canRefetch()) {
            this.refetch();
        }
        else {
            this.startSearchFromFirstPage();
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvUXVlcnkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTtBQUNyRixPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUE7QUFDeEIsT0FBTyxNQUFNLE1BQU0sY0FBYyxDQUFBO0FBQ2pDLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQ0wsZ0JBQWdCLEdBRWpCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixXQUFXLEdBQ1osTUFBTSxpREFBaUQsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQTtBQUN6RixPQUFPLEVBQ0wscUNBQXFDLEVBQ3JDLG9DQUFvQyxFQUNwQyxtQ0FBbUMsRUFDbkMsd0NBQXdDLEVBQ3hDLHlCQUF5QixFQUN6Qiw2QkFBNkIsR0FHOUIsTUFBTSxpQkFBaUIsQ0FBQTtBQUN4QixPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDcEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUF3RHBELFNBQVMsY0FBYyxDQUFDLGFBQWtCO0lBQ3hDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztRQUM1QixJ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QUNELE9BQU8sZ0JBQWdCLENBQUE7SUFDekIsQ0FBQztJQUNELDZCQUE2QjtRQUMzQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBQ0QsMEJBQTBCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFDRCw2QkFBNkI7UUFDM0IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNyRSxDQUFDO0lBQ0QsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQTtZQUN6RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7U0FDbkI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUdBQWlHLENBQ2xHLENBQUE7U0FDRjtJQUNILENBQUM7SUFDRCwrSEFBK0g7SUFDL0gsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7SUFDbkUsQ0FBQztJQUNELDREQUE0RDtJQUM1RCxpQ0FBaUM7UUFDL0IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ2Y7YUFBTTtZQUNMLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFBO1NBQ2hDO0lBQ0gsQ0FBQztDQUNXLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBRdWVyeVJlc3BvbnNlIGZyb20gJy4vUXVlcnlSZXNwb25zZSdcbmltcG9ydCB7IHBvc3RTaW1wbGVBdWRpdExvZyB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9hdWRpdC9hdWRpdC1lbmRwb2ludCdcbmltcG9ydCBjcWwgZnJvbSAnLi4vY3FsJ1xuaW1wb3J0IF9tZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJ1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG5pbXBvcnQge1xuICBMYXp5UXVlcnlSZXN1bHRzLFxuICBTZWFyY2hTdGF0dXMsXG59IGZyb20gJy4vTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQge1xuICBGaWx0ZXJCdWlsZGVyQ2xhc3MsXG4gIEZpbHRlckNsYXNzLFxufSBmcm9tICcuLi8uLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IGRvd25ncmFkZUZpbHRlclRyZWVUb0Jhc2ljIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3F1ZXJ5LWJhc2ljL3F1ZXJ5LWJhc2ljLnZpZXcnXG5pbXBvcnQge1xuICBnZXRDb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwLFxuICBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAsXG4gIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwLFxuICBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwLFxuICBoYXNOZXh0UGFnZUZvclNvdXJjZUdyb3VwLFxuICBoYXNQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCxcbiAgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUsXG4gIFF1ZXJ5U3RhcnRBbmRFbmRUeXBlLFxufSBmcm9tICcuL1F1ZXJ5Lm1ldGhvZHMnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vd3JlcXInXG5pbXBvcnQgeyBDb21tb25BamF4U2V0dGluZ3MgfSBmcm9tICcuLi9BamF4U2V0dGluZ3MnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9TdGFydHVwL3N0YXJ0dXAnXG5leHBvcnQgdHlwZSBRdWVyeVR5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiAoX2F0dHJpYnV0ZXM6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkXG4gIHNldDogKHAxOiBhbnksIHAyPzogYW55KSA9PiB2b2lkXG4gIHRvSlNPTjogKCkgPT4gYW55XG4gIGRlZmF1bHRzOiAoKSA9PiBhbnlcbiAgcmVzZXRUb0RlZmF1bHRzOiAob3ZlcnJpZGVuRGVmYXVsdHM6IGFueSkgPT4gdm9pZFxuICBhcHBseURlZmF1bHRzOiAoKSA9PiB2b2lkXG4gIHJldmVydDogKCkgPT4gdm9pZFxuICBpc0xvY2FsOiAoKSA9PiBib29sZWFuXG4gIF9oYW5kbGVEZXByZWNhdGVkRmVkZXJhdGlvbjogKGF0dHJpYnV0ZXM6IGFueSkgPT4gdm9pZFxuICBpbml0aWFsaXplOiAoYXR0cmlidXRlczogYW55KSA9PiB2b2lkXG4gIGdldFNlbGVjdGVkU291cmNlczogKCkgPT4gQXJyYXk8YW55PlxuICBidWlsZFNlYXJjaERhdGE6ICgpID0+IGFueVxuICBpc091dGRhdGVkOiAoKSA9PiBib29sZWFuXG4gIHN0YXJ0U2VhcmNoSWZPdXRkYXRlZDogKCkgPT4gdm9pZFxuICB1cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZTogKCkgPT4gdm9pZFxuICBpbml0aWFsaXplUmVzdWx0OiAob3B0aW9ucz86IGFueSkgPT4ge1xuICAgIGRhdGE6IGFueVxuICAgIHNlbGVjdGVkU291cmNlczogYW55XG4gICAgaXNIYXJ2ZXN0ZWQ6IGFueVxuICAgIGlzRmVkZXJhdGVkOiBhbnlcbiAgICByZXN1bHQ6IGFueVxuICAgIHJlc3VsdE9wdGlvbnM6IGFueVxuICB9XG4gIHN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZTogKG9wdGlvbnM/OiBhbnksIGRvbmU/OiBhbnkpID0+IHZvaWRcbiAgc3RhcnRTZWFyY2g6IChvcHRpb25zPzogYW55LCBkb25lPzogYW55KSA9PiB2b2lkXG4gIGN1cnJlbnRTZWFyY2hlczogQXJyYXk8YW55PlxuICBjYW5jZWxDdXJyZW50U2VhcmNoZXM6ICgpID0+IHZvaWRcbiAgY2xlYXJSZXN1bHRzOiAoKSA9PiB2b2lkXG4gIHNldFNvdXJjZXM6IChzb3VyY2VzOiBhbnkpID0+IHZvaWRcbiAgc2V0Q29sb3I6IChjb2xvcjogYW55KSA9PiB2b2lkXG4gIGdldENvbG9yOiAoKSA9PiBhbnlcbiAgY29sb3I6ICgpID0+IGFueVxuICBnZXRQcmV2aW91c1NlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgaGFzUHJldmlvdXNTZXJ2ZXJQYWdlOiAoKSA9PiBib29sZWFuXG4gIGhhc05leHRTZXJ2ZXJQYWdlOiAoKSA9PiBib29sZWFuXG4gIGdldE5leHRTZXJ2ZXJQYWdlOiAoKSA9PiB2b2lkXG4gIGdldEhhc0ZpcnN0U2VydmVyUGFnZTogKCkgPT4gYm9vbGVhblxuICBnZXRGaXJzdFNlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0SGFzTGFzdFNlcnZlclBhZ2U6ICgpID0+IGJvb2xlYW5cbiAgZ2V0TGFzdFNlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6ICgpID0+IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gIGdldE5leHRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICByZXNldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiB2b2lkXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9QcmV2UGFnZTogKCkgPT4gdm9pZFxuICBzZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvTmV4dFBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6ICgpID0+IFF1ZXJ5U3RhcnRBbmRFbmRUeXBlXG4gIGhhc0N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiBib29sZWFuXG4gIGdldE1vc3RSZWNlbnRTdGF0dXM6ICgpID0+IGFueVxuICBnZXRMYXp5UmVzdWx0czogKCkgPT4gTGF6eVF1ZXJ5UmVzdWx0c1xuICB1cGRhdGVNb3N0UmVjZW50U3RhdHVzOiAoKSA9PiB2b2lkXG4gIHJlZmV0Y2g6ICgpID0+IHZvaWRcbiAgY2FuUmVmZXRjaDogKCkgPT4gYm9vbGVhblxuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cbmZ1bmN0aW9uIGxpbWl0VG9EZWxldGVkKGNxbEZpbHRlclRyZWU6IGFueSkge1xuICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAgY3FsRmlsdGVyVHJlZSxcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC10YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgfSksXG4gICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICBwcm9wZXJ0eTogJ1wibWV0YWNhcmQuZGVsZXRlZC50YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ3Jlc291cmNlJyxcbiAgICAgIH0pLFxuICAgIF0sXG4gIH0pXG59XG5mdW5jdGlvbiBsaW1pdFRvSGlzdG9yaWMoY3FsRmlsdGVyVHJlZTogYW55KSB7XG4gIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICBjcWxGaWx0ZXJUcmVlLFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHk6ICdcIm1ldGFjYXJkLXRhZ3NcIicsXG4gICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgIHZhbHVlOiAncmV2aXNpb24nLFxuICAgICAgfSksXG4gICAgXSxcbiAgfSlcbn1cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICByZWxhdGlvbnM6IFtcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICdyZXN1bHQnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVJlc3BvbnNlLFxuICAgICAgaXNUcmFuc2llbnQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgLy8gb3ZlcnJpZGUgY29uc3RydWN0b3Igc2xpZ2h0bHkgdG8gZW5zdXJlIG9wdGlvbnMgLyBhdHRyaWJ1dGVzIGFyZSBhdmFpbGFibGUgb24gdGhlIHNlbGYgcmVmIGltbWVkaWF0ZWx5XG4gIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgaWYgKFxuICAgICAgIW9wdGlvbnMgfHxcbiAgICAgICFvcHRpb25zLnRyYW5zZm9ybURlZmF1bHRzIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1GaWx0ZXJUcmVlIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyB8fFxuICAgICAgIW9wdGlvbnMudHJhbnNmb3JtQ291bnRcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ09wdGlvbnMgZm9yIHRyYW5zZm9ybURlZmF1bHRzLCB0cmFuc2Zvcm1GaWx0ZXJUcmVlLCB0cmFuc2Zvcm1Tb3J0cywgYW5kIHRyYW5zZm9ybUNvdW50IG11c3QgYmUgcHJvdmlkZWQnXG4gICAgICApXG4gICAgfVxuICAgIHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge31cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgcmV0dXJuIEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH0sXG4gIHNldChkYXRhOiBhbnkpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiZcbiAgICAgIGRhdGEuZmlsdGVyVHJlZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0eXBlb2YgZGF0YS5maWx0ZXJUcmVlID09PSAnc3RyaW5nJ1xuICAgICkge1xuICAgICAgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRhYmlsaXR5XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhLmZpbHRlclRyZWUgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKEpTT04ucGFyc2UoZGF0YS5maWx0ZXJUcmVlKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLnByb3RvdHlwZS5zZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9LFxuICB0b0pTT04oLi4uYXJnczogYW55KSB7XG4gICAgY29uc3QganNvbiA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcywgLi4uYXJncylcbiAgICBpZiAodHlwZW9mIGpzb24uZmlsdGVyVHJlZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGpzb24uZmlsdGVyVHJlZSA9IEpTT04uc3RyaW5naWZ5KGpzb24uZmlsdGVyVHJlZSlcbiAgICB9XG4gICAgcmV0dXJuIGpzb25cbiAgfSxcbiAgZGVmYXVsdHMoKSB7XG4gICAgY29uc3QgZmlsdGVyVHJlZSA9IHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcz8uZmlsdGVyVHJlZVxuICAgIGxldCBjb25zdHJ1Y3RlZEZpbHRlclRyZWU6IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIGxldCBjb25zdHJ1Y3RlZENxbCA9IHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcz8uY3FsIHx8IFwiYW55VGV4dCBJTElLRSAnKidcIlxuICAgIGlmIChmaWx0ZXJUcmVlICYmIHR5cGVvZiBmaWx0ZXJUcmVlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3RydWN0ZWRGaWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhKU09OLnBhcnNlKGZpbHRlclRyZWUpKVxuICAgIH0gZWxzZSBpZiAoIWZpbHRlclRyZWUgfHwgZmlsdGVyVHJlZS5pZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB3aGVuIHdlIG1ha2UgZHJhc3RpYyBjaGFuZ2VzIHRvIGZpbHRlciB0cmVlIGl0IHdpbGwgYmUgbmVjZXNzYXJ5IHRvIGZhbGwgYmFjayB0byBjcWwgYW5kIHJlY29uc3RydWN0IGEgZmlsdGVyIHRyZWUgdGhhdCdzIGNvbXBhdGlibGVcbiAgICAgIGNvbnN0cnVjdGVkRmlsdGVyVHJlZSA9IGNxbC5yZWFkKGNvbnN0cnVjdGVkQ3FsKVxuICAgICAgY29uc29sZS53YXJuKCdtaWdyYXRpbmcgYSBmaWx0ZXIgdHJlZSB0byB0aGUgbGF0ZXN0IHN0cnVjdHVyZScpXG4gICAgICAvLyBhbGxvdyBkb3duc3RyZWFtIHByb2plY3RzIHRvIGhhbmRsZSBob3cgdGhleSB3YW50IHRvIGluZm9ybSB1c2VycyBvZiBtaWdyYXRpb25zXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdmaWx0ZXJUcmVlOm1pZ3JhdGlvbicsIHtcbiAgICAgICAgc2VhcmNoOiB0aGlzLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3RydWN0ZWRGaWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhmaWx0ZXJUcmVlKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybURlZmF1bHRzKHtcbiAgICAgIG9yaWdpbmFsRGVmYXVsdHM6IHtcbiAgICAgICAgY3FsOiBjb25zdHJ1Y3RlZENxbCxcbiAgICAgICAgZmlsdGVyVHJlZTogY29uc3RydWN0ZWRGaWx0ZXJUcmVlLFxuICAgICAgICBhc3NvY2lhdGVkRm9ybU1vZGVsOiB1bmRlZmluZWQsXG4gICAgICAgIGV4Y2x1ZGVVbm5lY2Vzc2FyeUF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGNvdW50OiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVzdWx0Q291bnQoKSxcbiAgICAgICAgc29ydHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhdHRyaWJ1dGU6ICdtb2RpZmllZCcsXG4gICAgICAgICAgICBkaXJlY3Rpb246ICdkZXNjZW5kaW5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzb3VyY2VzOiBbJ2FsbCddLFxuICAgICAgICAvLyBpbml0aWFsaXplIHRoaXMgaGVyZSBzbyB3ZSBjYW4gYXZvaWQgY3JlYXRpbmcgc3B1cmlvdXMgcmVmZXJlbmNlcyB0byBMYXp5UXVlcnlSZXN1bHRzIG9iamVjdHNcbiAgICAgICAgcmVzdWx0OiBuZXcgUXVlcnlSZXNwb25zZSh7XG4gICAgICAgICAgbGF6eVJlc3VsdHM6IG5ldyBMYXp5UXVlcnlSZXN1bHRzKHtcbiAgICAgICAgICAgIGZpbHRlclRyZWU6IGNvbnN0cnVjdGVkRmlsdGVyVHJlZSxcbiAgICAgICAgICAgIHNvcnRzOiBbXSxcbiAgICAgICAgICAgIHNvdXJjZXM6IFtdLFxuICAgICAgICAgICAgdHJhbnNmb3JtU29ydHM6ICh7IG9yaWdpbmFsU29ydHMgfSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybVNvcnRzKHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNvcnRzLFxuICAgICAgICAgICAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgaXNMb2NhbDogZmFsc2UsXG4gICAgICAgIGlzT3V0ZGF0ZWQ6IGZhbHNlLFxuICAgICAgICAnZGV0YWlsLWxldmVsJzogdW5kZWZpbmVkLFxuICAgICAgICBzcGVsbGNoZWNrOiBmYWxzZSxcbiAgICAgICAgcGhvbmV0aWNzOiBmYWxzZSxcbiAgICAgICAgYWRkaXRpb25hbE9wdGlvbnM6ICd7fScsXG4gICAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSxcbiAgICAgICAgbmV4dEluZGV4Rm9yU291cmNlR3JvdXA6IHt9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlLFxuICAgICAgICBtb3N0UmVjZW50U3RhdHVzOiB7fSBhcyBTZWFyY2hTdGF0dXMsXG4gICAgICB9LFxuICAgICAgcXVlcnlSZWY6IHRoaXMsXG4gICAgfSlcbiAgfSxcbiAgLyoqXG4gICAqICBBZGQgZmlsdGVyVHJlZSBpbiBoZXJlLCBzaW5jZSBpbml0aWFsaXplIGlzIG9ubHkgcnVuIG9uY2UgKGFuZCBkZWZhdWx0cyBjYW4ndCBoYXZlIGZpbHRlclRyZWUpXG4gICAqL1xuICByZXNldFRvRGVmYXVsdHMob3ZlcnJpZGVuRGVmYXVsdHM6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRzID0gXy5vbWl0KFxuICAgICAge1xuICAgICAgICAuLi50aGlzLmRlZmF1bHRzKCksXG4gICAgICAgIGZpbHRlclRyZWU6IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICBbJ2lzTG9jYWwnLCAncmVzdWx0J11cbiAgICApXG4gICAgdGhpcy5zZXQoX21lcmdlKGRlZmF1bHRzLCBvdmVycmlkZW5EZWZhdWx0cykpXG4gICAgdGhpcy50cmlnZ2VyKCdyZXNldFRvRGVmYXVsdHMnKVxuICB9LFxuICBhcHBseURlZmF1bHRzKCkge1xuICAgIHRoaXMuc2V0KF8ucGljayh0aGlzLmRlZmF1bHRzKCksIFsnc29ydHMnLCAnc291cmNlcyddKSlcbiAgfSxcbiAgcmV2ZXJ0KCkge1xuICAgIHRoaXMudHJpZ2dlcigncmV2ZXJ0JylcbiAgfSxcbiAgaXNMb2NhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2lzTG9jYWwnKVxuICB9LFxuICBfaGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb24oYXR0cmlidXRlczogYW55KSB7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5mZWRlcmF0aW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnQXR0ZW1wdCB0byBzZXQgZmVkZXJhdGlvbiBvbiBhIHNlYXJjaC4gIFRoaXMgYXR0cmlidXRlIGlzIGRlcHJlY2F0ZWQuICBEaWQgeW91IG1lYW4gdG8gc2V0IHNvdXJjZXM/J1xuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbGl6ZShhdHRyaWJ1dGVzOiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSkgLy8gdW5kZXJzY29yZSBiaW5kQWxsIGRvZXMgbm90IHRha2UgYXJyYXkgYXJnXG4gICAgdGhpcy5faGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb24oYXR0cmlidXRlcylcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6Y3FsIGNoYW5nZTpmaWx0ZXJUcmVlIGNoYW5nZTpzb3VyY2VzIGNoYW5nZTpzb3J0cyBjaGFuZ2U6c3BlbGxjaGVjayBjaGFuZ2U6cGhvbmV0aWNzIGNoYW5nZTpjb3VudCBjaGFuZ2U6YWRkaXRpb25hbE9wdGlvbnMnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldCgnaXNPdXRkYXRlZCcsIHRydWUpXG4gICAgICAgIHRoaXMuc2V0KCdtb3N0UmVjZW50U3RhdHVzJywge30pXG4gICAgICB9XG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpmaWx0ZXJUcmVlJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLl9yZXNldEZpbHRlclRyZWUodGhpcy5nZXQoJ2ZpbHRlclRyZWUnKSlcbiAgICB9KVxuICAgIC8vIGJhc2ljYWxseSByZW1vdmUgaW52YWxpZCBmaWx0ZXJzIHdoZW4gZ29pbmcgZnJvbSBiYXNpYyB0byBhZHZhbmNlZCwgYW5kIG1ha2UgaXQgYmFzaWMgY29tcGF0aWJsZVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTp0eXBlJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZ2V0KCd0eXBlJykgPT09ICdiYXNpYycpIHtcbiAgICAgICAgY29uc3QgY2xlYW5lZFVwRmlsdGVyVHJlZSA9IGNxbC5yZW1vdmVJbnZhbGlkRmlsdGVycyhcbiAgICAgICAgICB0aGlzLmdldCgnZmlsdGVyVHJlZScpXG4gICAgICAgIClcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgIGRvd25ncmFkZUZpbHRlclRyZWVUb0Jhc2ljKGNsZWFuZWRVcEZpbHRlclRyZWUgYXMgYW55KVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmdldExhenlSZXN1bHRzKCkuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzdGF0dXMnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVNb3N0UmVjZW50U3RhdHVzKClcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbiAgZ2V0U2VsZWN0ZWRTb3VyY2VzKCkge1xuICAgIGNvbnN0IFNvdXJjZXMgPSBTdGFydHVwRGF0YVN0b3JlLlNvdXJjZXMuc291cmNlc1xuICAgIGNvbnN0IHNvdXJjZUlkcyA9IFNvdXJjZXMubWFwKChzcmMpID0+IHNyYy5pZClcbiAgICBjb25zdCBsb2NhbFNvdXJjZUlkcyA9IFNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzcmMpID0+IHNyYy5pZFxuICAgIClcbiAgICBjb25zdCByZW1vdGVTb3VyY2VJZHMgPSBTb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiAhc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNyYykgPT4gc3JjLmlkXG4gICAgKVxuICAgIGNvbnN0IHNlbGVjdGVkU291cmNlcyA9IHRoaXMuZ2V0KCdzb3VyY2VzJylcbiAgICBsZXQgc291cmNlQXJyYXkgPSBzZWxlY3RlZFNvdXJjZXNcbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VzLmluY2x1ZGVzKCdhbGwnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VJZHNcbiAgICB9XG4gICAgaWYgKHNlbGVjdGVkU291cmNlcy5pbmNsdWRlcygnbG9jYWwnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VBcnJheVxuICAgICAgICAuY29uY2F0KGxvY2FsU291cmNlSWRzKVxuICAgICAgICAuZmlsdGVyKChzcmM6IGFueSkgPT4gc3JjICE9PSAnbG9jYWwnKVxuICAgIH1cbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VzLmluY2x1ZGVzKCdyZW1vdGUnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VBcnJheVxuICAgICAgICAuY29uY2F0KHJlbW90ZVNvdXJjZUlkcylcbiAgICAgICAgLmZpbHRlcigoc3JjOiBhbnkpID0+IHNyYyAhPT0gJ3JlbW90ZScpXG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VBcnJheVxuICB9LFxuICBidWlsZFNlYXJjaERhdGEoKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMudG9KU09OKClcbiAgICBkYXRhLnNvdXJjZXMgPSB0aGlzLmdldFNlbGVjdGVkU291cmNlcygpXG4gICAgZGF0YS5jb3VudCA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Db3VudCh7XG4gICAgICBvcmlnaW5hbENvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgZGF0YS5zb3J0cyA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyh7XG4gICAgICBvcmlnaW5hbFNvcnRzOiB0aGlzLmdldCgnc29ydHMnKSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgcmV0dXJuIF8ucGljayhcbiAgICAgIGRhdGEsXG4gICAgICAnc291cmNlcycsXG4gICAgICAnY291bnQnLFxuICAgICAgJ3RpbWVvdXQnLFxuICAgICAgJ2NxbCcsXG4gICAgICAnc29ydHMnLFxuICAgICAgJ2lkJyxcbiAgICAgICdzcGVsbGNoZWNrJyxcbiAgICAgICdwaG9uZXRpY3MnLFxuICAgICAgJ2FkZGl0aW9uYWxPcHRpb25zJ1xuICAgIClcbiAgfSxcbiAgaXNPdXRkYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2lzT3V0ZGF0ZWQnKVxuICB9LFxuICBzdGFydFNlYXJjaElmT3V0ZGF0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaXNPdXRkYXRlZCgpKSB7XG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBXZSBvbmx5IGtlZXAgZmlsdGVyVHJlZSB1cCB0byBkYXRlLCB0aGVuIHdoZW4gd2UgaW50ZXJhY3Qgd2l0aCB0aGUgc2VydmVyIHdlIHdyaXRlIG91dCB3aGF0IGl0IG1lYW5zXG4gICAqXG4gICAqIFdlIGRvIHRoaXMgZm9yIHBlcmZvcm1hbmNlLCBhbmQgYmVjYXVzZSB0cmFuc2Zvcm1hdGlvbiBpcyBsb3NzeS5cbiAgICpcbiAgICogQWxzbyBub3RpY2UgdGhhdCB3ZSBkbyBhIHNsaWdodCBiaXQgb2YgdmFsaWRhdGlvbiwgc28gYW55dGhpbmcgdGhhdCBoYXMgbm8gZmlsdGVycyB3aWxsIHRyYW5zbGF0ZSB0byBhIHN0YXIgcXVlcnkgKGV2ZXJ5dGhpbmcpXG4gICAqL1xuICB1cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpIHtcbiAgICBjb25zdCBmaWx0ZXJUcmVlID0gdGhpcy5nZXQoJ2ZpbHRlclRyZWUnKVxuICAgIGlmIChcbiAgICAgICFmaWx0ZXJUcmVlIHx8XG4gICAgICBmaWx0ZXJUcmVlLmZpbHRlcnMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgZmlsdGVyVHJlZS5maWx0ZXJzLmxlbmd0aCA9PT0gMFxuICAgICkge1xuICAgICAgdGhpcy5zZXQoXG4gICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHsgdmFsdWU6ICcqJywgcHJvcGVydHk6ICdhbnlUZXh0JywgdHlwZTogJ0lMSUtFJyB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgdGhpcy51cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdjcWwnLCBjcWwud3JpdGUoZmlsdGVyVHJlZSkpXG4gICAgfVxuICB9LFxuICBzdGFydFNlYXJjaEZyb21GaXJzdFBhZ2Uob3B0aW9uczogYW55LCBkb25lOiBhbnkpIHtcbiAgICB0aGlzLnVwZGF0ZUNxbEJhc2VkT25GaWx0ZXJUcmVlKClcbiAgICB0aGlzLnJlc2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKVxuICAgIHRoaXMuc3RhcnRTZWFyY2gob3B0aW9ucywgZG9uZSlcbiAgfSxcbiAgaW5pdGlhbGl6ZVJlc3VsdChvcHRpb25zOiBhbnkpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBvcHRpb25zID0gXy5leHRlbmQoXG4gICAgICB7XG4gICAgICAgIGxpbWl0VG9EZWxldGVkOiBmYWxzZSxcbiAgICAgICAgbGltaXRUb0hpc3RvcmljOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBvcHRpb25zXG4gICAgKVxuICAgIGNvbnN0IGRhdGEgPSBfY2xvbmVEZWVwKHRoaXMuYnVpbGRTZWFyY2hEYXRhKCkpXG4gICAgZGF0YS5iYXRjaElkID0gdjQoKVxuICAgIC8vIERhdGEuc291cmNlcyBpcyBzZXQgaW4gYGJ1aWxkU2VhcmNoRGF0YWAgYmFzZWQgb24gd2hpY2ggc291cmNlcyB5b3UgaGF2ZSBzZWxlY3RlZC5cbiAgICBsZXQgc2VsZWN0ZWRTb3VyY2VzID0gZGF0YS5zb3VyY2VzXG4gICAgY29uc3QgaGFydmVzdGVkU291cmNlcyA9IFNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzb3VyY2UpID0+IHNvdXJjZS5pZFxuICAgIClcbiAgICBjb25zdCBpc0hhcnZlc3RlZCA9IChpZDogYW55KSA9PiBoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKGlkKVxuICAgIGNvbnN0IGlzRmVkZXJhdGVkID0gKGlkOiBhbnkpID0+ICFoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKGlkKVxuICAgIGlmIChvcHRpb25zLmxpbWl0VG9EZWxldGVkKSB7XG4gICAgICBzZWxlY3RlZFNvdXJjZXMgPSBkYXRhLnNvdXJjZXMuZmlsdGVyKGlzSGFydmVzdGVkKVxuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5nZXQoJ3Jlc3VsdCcpXG4gICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLnJlc2V0KHtcbiAgICAgIGZpbHRlclRyZWU6IHRoaXMuZ2V0KCdmaWx0ZXJUcmVlJyksXG4gICAgICBzb3J0czogdGhpcy5nZXQoJ3NvcnRzJyksXG4gICAgICBzb3VyY2VzOiBzZWxlY3RlZFNvdXJjZXMsXG4gICAgICB0cmFuc2Zvcm1Tb3J0czogKHsgb3JpZ2luYWxTb3J0cyB9OiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyh7IG9yaWdpbmFsU29ydHMsIHF1ZXJ5UmVmOiB0aGlzIH0pXG4gICAgICB9LFxuICAgIH0pXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGEsXG4gICAgICBzZWxlY3RlZFNvdXJjZXMsXG4gICAgICBpc0hhcnZlc3RlZCxcbiAgICAgIGlzRmVkZXJhdGVkLFxuICAgICAgcmVzdWx0LFxuICAgICAgcmVzdWx0T3B0aW9uczogb3B0aW9ucyxcbiAgICB9XG4gIH0sXG4gIC8vIHdlIG5lZWQgYXQgbGVhc3Qgb25lIHN0YXR1cyBmb3IgdGhlIHNlYXJjaCB0byBiZSBhYmxlIHRvIGNvcnJlY3RseSBwYWdlIHRoaW5ncywgdGVjaG5pY2FsbHkgd2UgY291bGQganVzdCB1c2UgdGhlIGZpcnN0IG9uZVxuICB1cGRhdGVNb3N0UmVjZW50U3RhdHVzKCkge1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0dXMgPSB0aGlzLmdldExhenlSZXN1bHRzKCkuc3RhdHVzXG4gICAgY29uc3QgcHJldmlvdXNTdGF0dXMgPSB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKVxuICAgIGNvbnN0IG5ld1N0YXR1cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocHJldmlvdXNTdGF0dXMpKVxuICAgIC8vIGNvbXBhcmUgZWFjaCBrZXkgYW5kIG92ZXJ3cml0ZSBvbmx5IHdoZW4gdGhlIG5ldyBzdGF0dXMgaXMgc3VjY2Vzc2Z1bCAtIHdlIG5lZWQgYSBzdWNjZXNzZnVsIHN0YXR1cyB0byBwYWdlXG4gICAgT2JqZWN0LmtleXMoY3VycmVudFN0YXR1cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAoY3VycmVudFN0YXR1c1trZXldLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgbmV3U3RhdHVzW2tleV0gPSBjdXJyZW50U3RhdHVzW2tleV1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuc2V0KCdtb3N0UmVjZW50U3RhdHVzJywgbmV3U3RhdHVzKVxuICB9LFxuICBnZXRMYXp5UmVzdWx0cygpOiBMYXp5UXVlcnlSZXN1bHRzIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Jlc3VsdCcpLmdldCgnbGF6eVJlc3VsdHMnKVxuICB9LFxuICBzdGFydFNlYXJjaChvcHRpb25zOiBhbnksIGRvbmU6IGFueSkge1xuICAgIHRoaXMudHJpZ2dlcigncGFuVG9TaGFwZXNFeHRlbnQnKVxuICAgIHRoaXMuc2V0KCdpc091dGRhdGVkJywgZmFsc2UpXG4gICAgaWYgKHRoaXMuZ2V0KCdjcWwnKSA9PT0gJycpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmNhbmNlbEN1cnJlbnRTZWFyY2hlcygpXG4gICAgY29uc3Qge1xuICAgICAgZGF0YSxcbiAgICAgIHNlbGVjdGVkU291cmNlcyxcbiAgICAgIGlzSGFydmVzdGVkLFxuICAgICAgaXNGZWRlcmF0ZWQsXG4gICAgICByZXN1bHQsXG4gICAgICByZXN1bHRPcHRpb25zLFxuICAgIH0gPSB0aGlzLmluaXRpYWxpemVSZXN1bHQob3B0aW9ucylcbiAgICBkYXRhLmZyb21VSSA9IHRydWVcbiAgICBsZXQgY3FsRmlsdGVyVHJlZSA9IHRoaXMuZ2V0KCdmaWx0ZXJUcmVlJylcbiAgICBpZiAocmVzdWx0T3B0aW9ucy5saW1pdFRvRGVsZXRlZCkge1xuICAgICAgY3FsRmlsdGVyVHJlZSA9IGxpbWl0VG9EZWxldGVkKGNxbEZpbHRlclRyZWUpXG4gICAgfSBlbHNlIGlmIChyZXN1bHRPcHRpb25zLmxpbWl0VG9IaXN0b3JpYykge1xuICAgICAgY3FsRmlsdGVyVHJlZSA9IGxpbWl0VG9IaXN0b3JpYyhjcWxGaWx0ZXJUcmVlKVxuICAgIH1cbiAgICBsZXQgY3FsU3RyaW5nID0gdGhpcy5vcHRpb25zLnRyYW5zZm9ybUZpbHRlclRyZWUoe1xuICAgICAgb3JpZ2luYWxGaWx0ZXJUcmVlOiBjcWxGaWx0ZXJUcmVlLFxuICAgICAgcXVlcnlSZWY6IHRoaXMsXG4gICAgfSlcbiAgICB0aGlzLnNldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnLCB0aGlzLmdldE5leHRJbmRleEZvclNvdXJjZUdyb3VwKCkpXG5cbiAgICBwb3N0U2ltcGxlQXVkaXRMb2coe1xuICAgICAgYWN0aW9uOiAnU0VBUkNIX1NVQk1JVFRFRCcsXG4gICAgICBjb21wb25lbnQ6XG4gICAgICAgICdxdWVyeTogWycgKyBjcWxTdHJpbmcgKyAnXSBzb3VyY2VzOiBbJyArIHNlbGVjdGVkU291cmNlcyArICddJyxcbiAgICB9KVxuXG4gICAgY29uc3QgZmVkZXJhdGVkU2VhcmNoZXNUb1J1biA9IHNlbGVjdGVkU291cmNlc1xuICAgICAgLmZpbHRlcihpc0ZlZGVyYXRlZClcbiAgICAgIC5tYXAoKHNvdXJjZTogYW55KSA9PiAoe1xuICAgICAgICAuLi5kYXRhLFxuICAgICAgICBjcWw6IGNxbFN0cmluZyxcbiAgICAgICAgc3JjczogW3NvdXJjZV0sXG4gICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnKVtzb3VyY2VdLFxuICAgICAgfSkpXG4gICAgY29uc3Qgc2VhcmNoZXNUb1J1biA9IFsuLi5mZWRlcmF0ZWRTZWFyY2hlc1RvUnVuXS5maWx0ZXIoXG4gICAgICAoc2VhcmNoKSA9PiBzZWFyY2guc3Jjcy5sZW5ndGggPiAwXG4gICAgKVxuICAgIGlmICh0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkubG9jYWwpIHtcbiAgICAgIGNvbnN0IGxvY2FsU2VhcmNoVG9SdW4gPSB7XG4gICAgICAgIC4uLmRhdGEsXG4gICAgICAgIGNxbDogY3FsU3RyaW5nLFxuICAgICAgICBzcmNzOiBzZWxlY3RlZFNvdXJjZXMuZmlsdGVyKGlzSGFydmVzdGVkKSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKS5sb2NhbCxcbiAgICAgIH1cbiAgICAgIHNlYXJjaGVzVG9SdW4ucHVzaChsb2NhbFNlYXJjaFRvUnVuKVxuICAgIH1cbiAgICBpZiAoc2VhcmNoZXNUb1J1bi5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJlc2V0IHRvIGFsbCBhbmQgcnVuXG4gICAgICB0aGlzLnNldCgnc291cmNlcycsIFsnYWxsJ10pXG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5jdXJyZW50U2VhcmNoZXMgPSBzZWFyY2hlc1RvUnVuLm1hcCgoc2VhcmNoKSA9PiB7XG4gICAgICBkZWxldGUgc2VhcmNoLnNvdXJjZXMgLy8gVGhpcyBrZXkgaXNuJ3QgdXNlZCBvbiB0aGUgYmFja2VuZCBhbmQgb25seSBzZXJ2ZXMgdG8gY29uZnVzZSB0aG9zZSBkZWJ1Z2dpbmcgdGhpcyBjb2RlLlxuICAgICAgLy8gYHJlc3VsdGAgaXMgUXVlcnlSZXNwb25zZVxuICAgICAgcmV0dXJuIHJlc3VsdC5mZXRjaCh7XG4gICAgICAgIC4uLkNvbW1vbkFqYXhTZXR0aW5ncyxcbiAgICAgICAgY3VzdG9tRXJyb3JIYW5kbGluZzogdHJ1ZSxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoc2VhcmNoKSxcbiAgICAgICAgcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgdGltZW91dDogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFNlYXJjaFRpbWVvdXQoKSxcbiAgICAgICAgc3VjY2VzcyhfbW9kZWw6IGFueSwgcmVzcG9uc2U6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgICAgcmVzcG9uc2Uub3B0aW9ucyA9IG9wdGlvbnNcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IoX21vZGVsOiBhbnksIHJlc3BvbnNlOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgICAgIHJlc3BvbnNlLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pXG4gICAgaWYgKHR5cGVvZiBkb25lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkb25lKHRoaXMuY3VycmVudFNlYXJjaGVzKVxuICAgIH1cbiAgfSxcbiAgY3VycmVudFNlYXJjaGVzOiBbXSxcbiAgY2FuY2VsQ3VycmVudFNlYXJjaGVzKCkge1xuICAgIHRoaXMuY3VycmVudFNlYXJjaGVzLmZvckVhY2goKHJlcXVlc3Q6IGFueSkgPT4ge1xuICAgICAgcmVxdWVzdC5hYm9ydCgnQ2FuY2VsZWQnKVxuICAgIH0pXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5nZXQoJ3Jlc3VsdCcpXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLmNhbmNlbCgpXG4gICAgfVxuICAgIHRoaXMuY3VycmVudFNlYXJjaGVzID0gW11cbiAgfSxcbiAgY2xlYXJSZXN1bHRzKCkge1xuICAgIHRoaXMuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICB0aGlzLnNldCh7XG4gICAgICByZXN1bHQ6IHVuZGVmaW5lZCxcbiAgICB9KVxuICB9LFxuICBzZXRTb3VyY2VzKHNvdXJjZXM6IGFueSkge1xuICAgIGNvbnN0IHNvdXJjZUFyciA9IFtdIGFzIGFueVxuICAgIHNvdXJjZXMuZWFjaCgoc3JjOiBhbnkpID0+IHtcbiAgICAgIGlmIChzcmMuZ2V0KCdhdmFpbGFibGUnKSA9PT0gdHJ1ZSkge1xuICAgICAgICBzb3VyY2VBcnIucHVzaChzcmMuZ2V0KCdpZCcpKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKHNvdXJjZUFyci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnNldCgnc291cmNlcycsIHNvdXJjZUFyci5qb2luKCcsJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdzb3VyY2VzJywgJycpXG4gICAgfVxuICB9LFxuICBzZXRDb2xvcihjb2xvcjogYW55KSB7XG4gICAgdGhpcy5zZXQoJ2NvbG9yJywgY29sb3IpXG4gIH0sXG4gIGdldENvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY29sb3InKVxuICB9LFxuICBjb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NvbG9yJylcbiAgfSxcbiAgZ2V0UHJldmlvdXNTZXJ2ZXJQYWdlKCkge1xuICAgIHRoaXMuc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb1ByZXZQYWdlKClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgfSxcbiAgLyoqXG4gICAqIE11Y2ggc2ltcGxlciB0aGFuIHNlZWluZyBpZiBhIG5leHQgcGFnZSBleGlzdHNcbiAgICovXG4gIGhhc1ByZXZpb3VzU2VydmVyUGFnZSgpIHtcbiAgICByZXR1cm4gaGFzUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICB9KVxuICB9LFxuICBoYXNOZXh0U2VydmVyUGFnZSgpIHtcbiAgICByZXR1cm4gaGFzTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICBxdWVyeVN0YXR1czogdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKCksXG4gICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgY291bnQ6IHRoaXMuZ2V0KCdjb3VudCcpLFxuICAgIH0pXG4gIH0sXG4gIGdldE5leHRTZXJ2ZXJQYWdlKCkge1xuICAgIHRoaXMuc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb05leHRQYWdlKClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgfSxcbiAgZ2V0SGFzRmlyc3RTZXJ2ZXJQYWdlKCkge1xuICAgIC8vIHNvIHRlY2huaWNhbGx5IGFsd2F5cyBcInRydWVcIiBidXQgd2hhdCB3ZSByZWFsbHkgbWVhbiBpcywgYXJlIHdlIG5vdCBvbiBwYWdlIDEgYWxyZWFkeVxuICAgIHJldHVybiB0aGlzLmhhc1ByZXZpb3VzU2VydmVyUGFnZSgpXG4gIH0sXG4gIGdldEZpcnN0U2VydmVyUGFnZSgpIHtcbiAgICB0aGlzLnN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gIH0sXG4gIGdldEhhc0xhc3RTZXJ2ZXJQYWdlKCkge1xuICAgIC8vIHNvIHRlY2huaWNhbGx5IGFsd2F5cyBcInRydWVcIiBidXQgd2hhdCB3ZSByZWFsbHkgbWVhbiBpcywgYXJlIHdlIG5vdCBvbiBsYXN0IHBhZ2UgYWxyZWFkeVxuICAgIHJldHVybiB0aGlzLmhhc05leHRTZXJ2ZXJQYWdlKClcbiAgfSxcbiAgZ2V0TGFzdFNlcnZlclBhZ2UoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAnbmV4dEluZGV4Rm9yU291cmNlR3JvdXAnLFxuICAgICAgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgICAgICBjb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgICB9KVxuICAgIClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgfSxcbiAgcmVzZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpIHtcbiAgICB0aGlzLnNldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnLCB7fSlcbiAgICBpZiAodGhpcy5nZXQoJ3Jlc3VsdCcpKSB7XG4gICAgICB0aGlzLmdldExhenlSZXN1bHRzKCkuX3Jlc2V0U291cmNlcyhbXSlcbiAgICB9XG4gICAgdGhpcy5zZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvTmV4dFBhZ2UoKVxuICB9LFxuICAvKipcbiAgICogVXBkYXRlIHRoZSBuZXh0IGluZGV4IHRvIGJlIHRoZSBwcmV2IHBhZ2VcbiAgICovXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9QcmV2UGFnZSgpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsXG4gICAgICBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICAgICAgc291cmNlczogdGhpcy5nZXRTZWxlY3RlZFNvdXJjZXMoKSxcbiAgICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICAgICAgY291bnQ6IHRoaXMuZ2V0KCdjb3VudCcpLFxuICAgICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgIH0pXG4gICAgKVxuICB9LFxuICBpc0xvY2FsU291cmNlKGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBjb25zdCBoYXJ2ZXN0ZWRTb3VyY2VzID0gU291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNvdXJjZSkgPT4gc291cmNlLmlkXG4gICAgKVxuICAgIHJldHVybiBoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKGlkKVxuICB9LFxuICAvKipcbiAgICogVXBkYXRlIHRoZSBuZXh0IGluZGV4IHRvIGJlIHRoZSBuZXh0IHBhZ2VcbiAgICovXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9OZXh0UGFnZSgpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsXG4gICAgICBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgICBzb3VyY2VzOiB0aGlzLmdldFNlbGVjdGVkU291cmNlcygpLFxuICAgICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgICBjb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgICAgIGlzTG9jYWw6IHRoaXMuaXNMb2NhbFNvdXJjZSxcbiAgICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgfSlcbiAgICApXG4gIH0sXG4gIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHJldHVybiBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCh7XG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgIH0pXG4gIH0sXG4gIC8vIHRyeSB0byByZXR1cm4gdGhlIG1vc3QgcmVjZW50IHN1Y2Nlc3NmdWwgc3RhdHVzXG4gIGdldE1vc3RSZWNlbnRTdGF0dXMoKTogU2VhcmNoU3RhdHVzIHtcbiAgICBjb25zdCBtb3N0UmVjZW50U3RhdHVzID0gdGhpcy5nZXQoJ21vc3RSZWNlbnRTdGF0dXMnKSBhcyBTZWFyY2hTdGF0dXNcbiAgICBpZiAoT2JqZWN0LmtleXMobW9zdFJlY2VudFN0YXR1cykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRMYXp5UmVzdWx0cygpLnN0YXR1cyB8fCB7fVxuICAgIH1cbiAgICByZXR1cm4gbW9zdFJlY2VudFN0YXR1c1xuICB9LFxuICBnZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwJylcbiAgfSxcbiAgZ2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcpXG4gIH0sXG4gIGhhc0N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkpLmxlbmd0aCA+IDBcbiAgfSxcbiAgcmVmZXRjaCgpIHtcbiAgICBpZiAodGhpcy5jYW5SZWZldGNoKCkpIHtcbiAgICAgIHRoaXMuc2V0KCduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsIHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSlcbiAgICAgIHRoaXMuc3RhcnRTZWFyY2goKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdNaXNzaW5nIG5lY2Vzc2FyeSBkYXRhIHRvIHJlZmV0Y2ggKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKSwgb3Igc2VhcmNoIGNyaXRlcmlhIGlzIG91dGRhdGVkLidcbiAgICAgIClcbiAgICB9XG4gIH0sXG4gIC8vIGFzIGxvbmcgYXMgd2UgaGF2ZSBhIGN1cnJlbnQgaW5kZXgsIGFuZCB0aGUgc2VhcmNoIGNyaXRlcmlhIGlzbid0IG91dCBvZiBkYXRlLCB3ZSBjYW4gcmVmZXRjaCAtIHVzZWZ1bCBmb3IgcmVzdW1pbmcgc2VhcmNoZXNcbiAgY2FuUmVmZXRjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpICYmICF0aGlzLmlzT3V0ZGF0ZWQoKVxuICB9LFxuICAvLyBjb21tb24gZW5vdWdoIHRoYXQgd2Ugc2hvdWxkIGV4dHJhY3QgdGhpcyBmb3IgZWFzZSBvZiB1c2VcbiAgcmVmZXRjaE9yU3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKCkge1xuICAgIGlmICh0aGlzLmNhblJlZmV0Y2goKSkge1xuICAgICAgdGhpcy5yZWZldGNoKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgIH1cbiAgfSxcbn0gYXMgUXVlcnlUeXBlKVxuIl19