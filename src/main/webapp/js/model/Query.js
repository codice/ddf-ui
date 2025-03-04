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
import { FilterBuilderClass, FilterClass, isFilterBuilderClass, } from '../../component/filter-builder/filter.structure';
import { downgradeFilterTreeToBasic } from '../../component/query-basic/query-basic.view';
import { getConstrainedFinalPageForSourceGroup, getConstrainedNextPageForSourceGroup, getCurrentStartAndEndForSourceGroup, getConstrainedPreviousPageForSourceGroup, hasNextPageForSourceGroup, hasPreviousPageForSourceGroup, } from './Query.methods';
import wreqr from '../wreqr';
import { CommonAjaxSettings } from '../AjaxSettings';
import { StartupDataStore } from './Startup/startup';
export function limitToDeleted(cqlFilterTree) {
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
export function limitToHistoric(cqlFilterTree) {
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
    set: function (data, value, options) {
        try {
            switch (typeof data) {
                case 'object':
                    if (data.filterTree !== undefined &&
                        typeof data.filterTree === 'string') {
                        data.filterTree = JSON.parse(data.filterTree);
                    }
                    if (!isFilterBuilderClass(data.filterTree)) {
                        data.filterTree = new FilterBuilderClass(data.filterTree);
                    }
                    break;
                case 'string':
                    if (data === 'filterTree') {
                        if (typeof value === 'string') {
                            value = JSON.parse(value);
                        }
                        if (!isFilterBuilderClass(value)) {
                            value = new FilterBuilderClass(value);
                        }
                    }
                    break;
            }
        }
        catch (e) {
            console.error(e);
        }
        return Backbone.AssociatedModel.prototype.set.apply(this, [
            data,
            value,
            options,
        ]);
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
            additionalOptions: undefined,
        }, options);
        this.options = _.extend(this.options, options);
        var data = _cloneDeep(this.buildSearchData());
        if (options.additionalOptions) {
            var optionsObj = JSON.parse(data.additionalOptions || '{}');
            optionsObj = _.extend(optionsObj, options.additionalOptions);
            data.additionalOptions = JSON.stringify(optionsObj);
        }
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
        this.startSearch(this.options);
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
        this.startSearch(this.options);
    },
    getHasFirstServerPage: function () {
        // so technically always "true" but what we really mean is, are we not on page 1 already
        return this.hasPreviousServerPage();
    },
    getFirstServerPage: function () {
        this.startSearchFromFirstPage(this.options);
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
        this.startSearch(this.options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvUXVlcnkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTtBQUNyRixPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUE7QUFDeEIsT0FBTyxNQUFNLE1BQU0sY0FBYyxDQUFBO0FBQ2pDLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQ0wsZ0JBQWdCLEdBRWpCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsb0JBQW9CLEdBQ3JCLE1BQU0saURBQWlELENBQUE7QUFDeEQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDekYsT0FBTyxFQUNMLHFDQUFxQyxFQUNyQyxvQ0FBb0MsRUFDcEMsbUNBQW1DLEVBQ25DLHdDQUF3QyxFQUN4Qyx5QkFBeUIsRUFDekIsNkJBQTZCLEdBRzlCLE1BQU0saUJBQWlCLENBQUE7QUFDeEIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBd0RwRCxNQUFNLFVBQVUsY0FBYyxDQUFDLGFBQWtCO0lBQy9DLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztRQUM1QixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRTtZQUNQLGFBQWE7WUFDYixJQUFJLFdBQVcsQ0FBQztnQkFDZCxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsU0FBUzthQUNqQixDQUFDO1lBQ0YsSUFBSSxXQUFXLENBQUM7Z0JBQ2QsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFLFVBQVU7YUFDbEIsQ0FBQztTQUNIO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUNELE1BQU0sVUFBVSxlQUFlLENBQUMsYUFBa0I7SUFDaEQsT0FBTyxJQUFJLGtCQUFrQixDQUFDO1FBQzVCLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFO1lBQ1AsYUFBYTtZQUNiLElBQUksV0FBVyxDQUFDO2dCQUNkLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxVQUFVO2FBQ2xCLENBQUM7U0FDSDtLQUNGLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFDRCxlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLFNBQVMsRUFBRTtRQUNUO1lBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ2xCLEdBQUcsRUFBRSxRQUFRO1lBQ2IsWUFBWSxFQUFFLGFBQWE7WUFDM0IsV0FBVyxFQUFFLElBQUk7U0FDbEI7S0FDRjtJQUNELHlHQUF5RztJQUN6RyxXQUFXLFlBQUMsVUFBZSxFQUFFLE9BQVk7UUFDdkMsSUFDRSxDQUFDLE9BQU87WUFDUixDQUFDLE9BQU8sQ0FBQyxpQkFBaUI7WUFDMUIsQ0FBQyxPQUFPLENBQUMsbUJBQW1CO1lBQzVCLENBQUMsT0FBTyxDQUFDLGNBQWM7WUFDdkIsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUN2QixDQUFDO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FDYix5R0FBeUcsQ0FDMUcsQ0FBQTtRQUNILENBQUM7UUFDRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxJQUFJLEVBQUUsQ0FBQTtRQUM5QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixPQUFPLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBQ0QsR0FBRyxZQUFDLElBQVMsRUFBRSxLQUFVLEVBQUUsT0FBWTtRQUNyQyxJQUFJLENBQUM7WUFDSCxRQUFRLE9BQU8sSUFBSSxFQUFFLENBQUM7Z0JBQ3BCLEtBQUssUUFBUTtvQkFDWCxJQUNFLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUzt3QkFDN0IsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFDbkMsQ0FBQzt3QkFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO29CQUMvQyxDQUFDO29CQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQkFDM0QsQ0FBQztvQkFDRCxNQUFLO2dCQUNQLEtBQUssUUFBUTtvQkFDWCxJQUFJLElBQUksS0FBSyxZQUFZLEVBQUUsQ0FBQzt3QkFDMUIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQzs0QkFDOUIsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQzNCLENBQUM7d0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7NEJBQ2pDLEtBQUssR0FBRyxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFBO3dCQUN2QyxDQUFDO29CQUNILENBQUM7b0JBQ0QsTUFBSztZQUNULENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDeEQsSUFBSTtZQUNKLEtBQUs7WUFDTCxPQUFPO1NBQ1IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELE1BQU07O1FBQUMsY0FBWTthQUFaLFVBQVksRUFBWixxQkFBWSxFQUFaLElBQVk7WUFBWix5QkFBWTs7UUFDakIsSUFBTSxJQUFJLEdBQUcsQ0FBQSxLQUFBLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQSxDQUFDLElBQUksMEJBQUMsSUFBSSxVQUFLLElBQUksVUFBQyxDQUFBO1FBQzFFLElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDbkQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUNELFFBQVE7UUFBUixpQkEwREM7O1FBekRDLElBQU0sVUFBVSxHQUFHLE1BQUEsSUFBSSxDQUFDLHNCQUFzQiwwQ0FBRSxVQUFVLENBQUE7UUFDMUQsSUFBSSxxQkFBeUMsQ0FBQTtRQUM3QyxJQUFJLGNBQWMsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLHNCQUFzQiwwQ0FBRSxHQUFHLEtBQUksbUJBQW1CLENBQUE7UUFDNUUsSUFBSSxVQUFVLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDakQscUJBQXFCLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDeEUsQ0FBQzthQUFNLElBQUksQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN0RCx1SUFBdUk7WUFDdkkscUJBQXFCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxDQUFDLENBRTlEO1lBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ25ELE1BQU0sRUFBRSxJQUFJO2FBQ2IsQ0FBQyxDQUFBO1FBQ0osQ0FBQzthQUFNLENBQUM7WUFDTixxQkFBcUIsR0FBRyxJQUFJLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzVELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDcEMsZ0JBQWdCLEVBQUU7Z0JBQ2hCLEdBQUcsRUFBRSxjQUFjO2dCQUNuQixVQUFVLEVBQUUscUJBQXFCO2dCQUNqQyxtQkFBbUIsRUFBRSxTQUFTO2dCQUM5Qiw0QkFBNEIsRUFBRSxJQUFJO2dCQUNsQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRTtnQkFDdEQsS0FBSyxFQUFFO29CQUNMO3dCQUNFLFNBQVMsRUFBRSxVQUFVO3dCQUNyQixTQUFTLEVBQUUsWUFBWTtxQkFDeEI7aUJBQ0Y7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUNoQixnR0FBZ0c7Z0JBQ2hHLE1BQU0sRUFBRSxJQUFJLGFBQWEsQ0FBQztvQkFDeEIsV0FBVyxFQUFFLElBQUksZ0JBQWdCLENBQUM7d0JBQ2hDLFVBQVUsRUFBRSxxQkFBcUI7d0JBQ2pDLEtBQUssRUFBRSxFQUFFO3dCQUNULE9BQU8sRUFBRSxFQUFFO3dCQUNYLGNBQWMsRUFBRSxVQUFDLEVBQWlCO2dDQUFmLGFBQWEsbUJBQUE7NEJBQzlCLE9BQU8sS0FBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7Z0NBQ2pDLGFBQWEsZUFBQTtnQ0FDYixRQUFRLEVBQUUsS0FBSTs2QkFDZixDQUFDLENBQUE7d0JBQ0osQ0FBQztxQkFDRixDQUFDO2lCQUNILENBQUM7Z0JBQ0YsSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLGNBQWMsRUFBRSxTQUFTO2dCQUN6QixVQUFVLEVBQUUsS0FBSztnQkFDakIsU0FBUyxFQUFFLEtBQUs7Z0JBQ2hCLGlCQUFpQixFQUFFLElBQUk7Z0JBQ3ZCLDBCQUEwQixFQUFFLEVBQTZCO2dCQUN6RCx1QkFBdUIsRUFBRSxFQUE2QjtnQkFDdEQsZ0JBQWdCLEVBQUUsRUFBa0I7YUFDckM7WUFDRCxRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRDs7T0FFRztJQUNILGVBQWUsWUFBQyxpQkFBc0I7UUFDcEMsSUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksdUJBRWhCLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FDbEIsVUFBVSxFQUFFLElBQUksa0JBQWtCLENBQUM7Z0JBQ2pDLE9BQU8sRUFBRTtvQkFDUCxJQUFJLFdBQVcsQ0FBQzt3QkFDZCxRQUFRLEVBQUUsU0FBUzt3QkFDbkIsS0FBSyxFQUFFLEdBQUc7d0JBQ1YsSUFBSSxFQUFFLE9BQU87cUJBQ2QsQ0FBQztpQkFDSDtnQkFDRCxJQUFJLEVBQUUsS0FBSzthQUNaLENBQUMsS0FFSixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FDdEIsQ0FBQTtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7UUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFDRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDekQsQ0FBQztJQUNELE1BQU07UUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3hCLENBQUM7SUFDRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFDRCwyQkFBMkIsWUFBQyxVQUFlO1FBQ3pDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxPQUFPLENBQUMsS0FBSyxDQUNYLHFHQUFxRyxDQUN0RyxDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxVQUFVLFlBQUMsVUFBZTtRQUExQixpQkFpQ0M7UUFoQ0MsMEVBQTBFO1FBQzFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLDZDQUE2QztRQUNsRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FDWCxJQUFJLEVBQ0osbUlBQW1JLEVBQ25JO1lBQ0UsS0FBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDNUIsS0FBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUNsQyxDQUFDLENBQ0YsQ0FBQTtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZDLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7UUFDaEUsQ0FBQyxDQUFDLENBQUE7UUFDRixtR0FBbUc7UUFDbkcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2pDLElBQUksS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDakMsSUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsb0JBQW9CLENBQ2xELEtBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQ3ZCLENBQUE7Z0JBQ0QsS0FBSSxDQUFDLEdBQUcsQ0FDTixZQUFZLEVBQ1osMEJBQTBCLENBQUMsbUJBQTBCLENBQUMsQ0FDdkQsQ0FBQTtZQUNILENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDaEMsaUJBQWlCLEVBQUUsUUFBUTtZQUMzQixRQUFRLEVBQUU7Z0JBQ1IsS0FBSSxDQUFDLHNCQUFzQixFQUFFLENBQUE7WUFDL0IsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxrQkFBa0I7UUFDaEIsSUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQTtRQUNoRCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLEVBQUUsRUFBTixDQUFNLENBQUMsQ0FBQTtRQUM5QyxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLFNBQVMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FDckUsVUFBQyxHQUFHLElBQUssT0FBQSxHQUFHLENBQUMsRUFBRSxFQUFOLENBQU0sQ0FDaEIsQ0FBQTtRQUNELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxHQUFHLENBQ3ZFLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLEVBQUUsRUFBTixDQUFNLENBQ2hCLENBQUE7UUFDRCxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzNDLElBQUksV0FBVyxHQUFHLGVBQWUsQ0FBQTtRQUNqQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxXQUFXLEdBQUcsU0FBUyxDQUFBO1FBQ3pCLENBQUM7UUFDRCxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN0QyxXQUFXLEdBQUcsV0FBVztpQkFDdEIsTUFBTSxDQUFDLGNBQWMsQ0FBQztpQkFDdEIsTUFBTSxDQUFDLFVBQUMsR0FBUSxJQUFLLE9BQUEsR0FBRyxLQUFLLE9BQU8sRUFBZixDQUFlLENBQUMsQ0FBQTtRQUMxQyxDQUFDO1FBQ0QsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdkMsV0FBVyxHQUFHLFdBQVc7aUJBQ3RCLE1BQU0sQ0FBQyxlQUFlLENBQUM7aUJBQ3ZCLE1BQU0sQ0FBQyxVQUFDLEdBQVEsSUFBSyxPQUFBLEdBQUcsS0FBSyxRQUFRLEVBQWhCLENBQWdCLENBQUMsQ0FBQTtRQUMzQyxDQUFDO1FBQ0QsT0FBTyxXQUFXLENBQUE7SUFDcEIsQ0FBQztJQUNELGVBQWU7UUFDYixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO1lBQ3ZDLGFBQWEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUNoQyxRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFDdkMsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ2hDLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNYLElBQUksRUFDSixTQUFTLEVBQ1QsT0FBTyxFQUNQLFNBQVMsRUFDVCxLQUFLLEVBQ0wsT0FBTyxFQUNQLElBQUksRUFDSixZQUFZLEVBQ1osV0FBVyxFQUNYLG1CQUFtQixDQUNwQixDQUFBO0lBQ0gsQ0FBQztJQUNELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDL0IsQ0FBQztJQUNELHFCQUFxQjtRQUNuQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNwQixDQUFDO0lBQ0gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUNILDBCQUEwQjtRQUN4QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3pDLElBQ0UsQ0FBQyxVQUFVO1lBQ1gsVUFBVSxDQUFDLE9BQU8sS0FBSyxTQUFTO1lBQ2hDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDL0IsQ0FBQztZQUNELElBQUksQ0FBQyxHQUFHLENBQ04sWUFBWSxFQUNaLElBQUksa0JBQWtCLENBQUM7Z0JBQ3JCLE9BQU8sRUFBRTtvQkFDUCxJQUFJLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7aUJBQ3BFO2dCQUNELElBQUksRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUNILENBQUE7WUFDRCxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQTtRQUNuQyxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUN4QyxDQUFDO0lBQ0gsQ0FBQztJQUNELHdCQUF3QixZQUFDLE9BQVksRUFBRSxJQUFTO1FBQzlDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFBO1FBQ2pDLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFBO1FBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFDRCxnQkFBZ0IsWUFBQyxPQUFZO1FBQTdCLGlCQStDQztRQTlDQyxJQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFBO1FBQ2hELE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUNoQjtZQUNFLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGVBQWUsRUFBRSxLQUFLO1lBQ3RCLGlCQUFpQixFQUFFLFNBQVM7U0FDN0IsRUFDRCxPQUFPLENBQ1IsQ0FBQTtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRTlDLElBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQTtRQUUvQyxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzlCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxDQUFBO1lBQzNELFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUM1RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNyRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsQ0FBQTtRQUNuQixxRkFBcUY7UUFDckYsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQTtRQUNsQyxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsU0FBUyxFQUFoQixDQUFnQixDQUFDLENBQUMsR0FBRyxDQUN2RSxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxFQUFFLEVBQVQsQ0FBUyxDQUN0QixDQUFBO1FBQ0QsSUFBTSxXQUFXLEdBQUcsVUFBQyxFQUFPLElBQUssT0FBQSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQTdCLENBQTZCLENBQUE7UUFDOUQsSUFBTSxXQUFXLEdBQUcsVUFBQyxFQUFPLElBQUssT0FBQSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQTtRQUMvRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMzQixlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDcEQsQ0FBQztRQUNELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDL0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUMxQixVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDbEMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ3hCLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLGNBQWMsRUFBRSxVQUFDLEVBQXNCO29CQUFwQixhQUFhLG1CQUFBO2dCQUM5QixPQUFPLEtBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsYUFBYSxlQUFBLEVBQUUsUUFBUSxFQUFFLEtBQUksRUFBRSxDQUFDLENBQUE7WUFDdkUsQ0FBQztTQUNGLENBQUMsQ0FBQTtRQUNGLE9BQU87WUFDTCxJQUFJLE1BQUE7WUFDSixlQUFlLGlCQUFBO1lBQ2YsV0FBVyxhQUFBO1lBQ1gsV0FBVyxhQUFBO1lBQ1gsTUFBTSxRQUFBO1lBQ04sYUFBYSxFQUFFLE9BQU87U0FDdkIsQ0FBQTtJQUNILENBQUM7SUFDRCw4SEFBOEg7SUFDOUgsc0JBQXNCO1FBQ3BCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUE7UUFDbEQsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7UUFDakQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7UUFDNUQsOEdBQThHO1FBQzlHLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztZQUNyQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNyQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ3pDLENBQUM7SUFDRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBQ0QsV0FBVyxZQUFDLE9BQVksRUFBRSxJQUFTO1FBQW5DLGlCQW9GQztRQW5GQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDN0IsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzNCLE9BQU07UUFDUixDQUFDO1FBQ0QsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7UUFDdEIsSUFBQSxLQU9GLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFOaEMsSUFBSSxVQUFBLEVBQ0osZUFBZSxxQkFBQSxFQUNmLFdBQVcsaUJBQUEsRUFDWCxXQUFXLGlCQUFBLEVBQ1gsTUFBTSxZQUFBLEVBQ04sYUFBYSxtQkFDbUIsQ0FBQTtRQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtRQUNsQixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQzFDLElBQUksYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2pDLGFBQWEsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDL0MsQ0FBQzthQUFNLElBQUksYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3pDLGFBQWEsR0FBRyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDaEQsQ0FBQztRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7WUFDL0Msa0JBQWtCLEVBQUUsYUFBYTtZQUNqQyxRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQTtRQUV6RSxrQkFBa0IsQ0FBQztZQUNqQixNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLFNBQVMsRUFDUCxVQUFVLEdBQUcsU0FBUyxHQUFHLGNBQWMsR0FBRyxlQUFlLEdBQUcsR0FBRztTQUNsRSxDQUFDLENBQUE7UUFFRixJQUFNLHNCQUFzQixHQUFHLGVBQWU7YUFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQzthQUNuQixHQUFHLENBQUMsVUFBQyxNQUFXLElBQUssT0FBQSx1QkFDakIsSUFBSSxLQUNQLEdBQUcsRUFBRSxTQUFTLEVBQ2QsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQ2QsS0FBSyxFQUFFLEtBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFDckQsRUFMb0IsQ0FLcEIsQ0FBQyxDQUFBO1FBQ0wsSUFBTSxhQUFhLEdBQUcseUJBQUksc0JBQXNCLFVBQUUsTUFBTSxDQUN0RCxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBdEIsQ0FBc0IsQ0FDbkMsQ0FBQTtRQUNELElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDL0MsSUFBTSxnQkFBZ0IseUJBQ2pCLElBQUksS0FDUCxHQUFHLEVBQUUsU0FBUyxFQUNkLElBQUksRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUN6QyxLQUFLLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsS0FBSyxHQUNsRCxDQUFBO1lBQ0QsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFDRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDL0IsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtZQUM1QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQTtZQUMvQixPQUFNO1FBQ1IsQ0FBQztRQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU07WUFDOUMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFBLENBQUMsMkZBQTJGO1lBQ2pILDRCQUE0QjtZQUM1QixPQUFPLE1BQU0sQ0FBQyxLQUFLLHVCQUNkLGtCQUFrQixLQUNyQixtQkFBbUIsRUFBRSxJQUFJLEVBQ3pCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUM1QixNQUFNLEVBQUUsS0FBSyxFQUNiLFFBQVEsRUFBRSxNQUFNLEVBQ2hCLFdBQVcsRUFBRSxrQkFBa0IsRUFDL0IsTUFBTSxFQUFFLE1BQU0sRUFDZCxXQUFXLEVBQUUsS0FBSyxFQUNsQixPQUFPLEVBQUUsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQzFELE9BQU8sWUFBQyxNQUFXLEVBQUUsUUFBYSxFQUFFLE9BQVk7b0JBQzlDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO2dCQUM1QixDQUFDLEVBQ0QsS0FBSyxZQUFDLE1BQVcsRUFBRSxRQUFhLEVBQUUsT0FBWTtvQkFDNUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7Z0JBQzVCLENBQUMsSUFDRCxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDNUIsQ0FBQztJQUNILENBQUM7SUFDRCxlQUFlLEVBQUUsRUFBRTtJQUNuQixxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFZO1lBQ3hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDM0IsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2pDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDaEMsQ0FBQztRQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFBO0lBQzNCLENBQUM7SUFDRCxZQUFZO1FBQ1YsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLE1BQU0sRUFBRSxTQUFTO1NBQ2xCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxVQUFVLFlBQUMsT0FBWTtRQUNyQixJQUFNLFNBQVMsR0FBRyxFQUFTLENBQUE7UUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQVE7WUFDcEIsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNsQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtZQUMvQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzFDLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDekIsQ0FBQztJQUNILENBQUM7SUFDRCxRQUFRLFlBQUMsS0FBVTtRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBQ0QsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBQ0QsS0FBSztRQUNILE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBQ0QscUJBQXFCO1FBQ25CLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFBO1FBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFDRDs7T0FFRztJQUNILHFCQUFxQjtRQUNuQixPQUFPLDZCQUE2QixDQUFDO1lBQ25DLDBCQUEwQixFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtTQUNqRSxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsaUJBQWlCO1FBQ2YsT0FBTyx5QkFBeUIsQ0FBQztZQUMvQixXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtZQUMzQiwwQkFBMEIsRUFBRSxJQUFJLENBQUMsNkJBQTZCLEVBQUU7WUFDaEUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1NBQ3pCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQTtRQUMzQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0lBQ0QscUJBQXFCO1FBQ25CLHdGQUF3RjtRQUN4RixPQUFPLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0lBQ3JDLENBQUM7SUFDRCxrQkFBa0I7UUFDaEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBQ0Qsb0JBQW9CO1FBQ2xCLDJGQUEyRjtRQUMzRixPQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0lBQ2pDLENBQUM7SUFDRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsR0FBRyxDQUNOLHlCQUF5QixFQUN6QixxQ0FBcUMsQ0FBQztZQUNwQyxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtZQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7U0FDekIsQ0FBQyxDQUNILENBQUE7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0lBQ0QsK0JBQStCO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDMUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN6QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUE7SUFDN0MsQ0FBQztJQUNEOztPQUVHO0lBQ0gsb0NBQW9DO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQ04seUJBQXlCLEVBQ3pCLHdDQUF3QyxDQUFDO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDbEMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFO1lBQ2hFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDM0IsV0FBVyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtTQUN4QyxDQUFDLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFDRCxhQUFhLFlBQUMsRUFBVTtRQUN0QixJQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFBO1FBQ2hELElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxTQUFTLEVBQWhCLENBQWdCLENBQUMsQ0FBQyxHQUFHLENBQ3ZFLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEVBQUUsRUFBVCxDQUFTLENBQ3RCLENBQUE7UUFDRCxPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxvQ0FBb0M7UUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FDTix5QkFBeUIsRUFDekIsb0NBQW9DLENBQUM7WUFDbkMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNsQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsNkJBQTZCLEVBQUU7WUFDaEUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ3hCLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtZQUMzQixXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1NBQ3hDLENBQUMsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztJQUNELG1DQUFtQztRQUNqQyxPQUFPLG1DQUFtQyxDQUFDO1lBQ3pDLDBCQUEwQixFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtZQUNoRSxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtTQUM1QixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0Qsa0RBQWtEO0lBQ2xELG1CQUFtQjtRQUNqQixJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQWlCLENBQUE7UUFDckUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUE7UUFDM0MsQ0FBQztRQUNELE9BQU8sZ0JBQWdCLENBQUE7SUFDekIsQ0FBQztJQUNELDZCQUE2QjtRQUMzQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBQ0QsMEJBQTBCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFDRCw2QkFBNkI7UUFDM0IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNyRSxDQUFDO0lBQ0QsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFBO1lBQ3pFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNwQixDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUdBQWlHLENBQ2xHLENBQUE7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELCtIQUErSDtJQUMvSCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUNuRSxDQUFDO0lBQ0QsNERBQTREO0lBQzVELGlDQUFpQztRQUMvQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNoQixDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFBO1FBQ2pDLENBQUM7SUFDSCxDQUFDO0NBQ1csQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IFF1ZXJ5UmVzcG9uc2UgZnJvbSAnLi9RdWVyeVJlc3BvbnNlJ1xuaW1wb3J0IHsgcG9zdFNpbXBsZUF1ZGl0TG9nIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2F1ZGl0L2F1ZGl0LWVuZHBvaW50J1xuaW1wb3J0IGNxbCBmcm9tICcuLi9jcWwnXG5pbXBvcnQgX21lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZSdcbmltcG9ydCBfY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC5jbG9uZWRlZXAnXG5pbXBvcnQgeyB2NCB9IGZyb20gJ3V1aWQnXG5pbXBvcnQgJ2JhY2tib25lLWFzc29jaWF0aW9ucydcbmltcG9ydCB7XG4gIExhenlRdWVyeVJlc3VsdHMsXG4gIFNlYXJjaFN0YXR1cyxcbn0gZnJvbSAnLi9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0cydcbmltcG9ydCB7XG4gIEZpbHRlckJ1aWxkZXJDbGFzcyxcbiAgRmlsdGVyQ2xhc3MsXG4gIGlzRmlsdGVyQnVpbGRlckNsYXNzLFxufSBmcm9tICcuLi8uLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IGRvd25ncmFkZUZpbHRlclRyZWVUb0Jhc2ljIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3F1ZXJ5LWJhc2ljL3F1ZXJ5LWJhc2ljLnZpZXcnXG5pbXBvcnQge1xuICBnZXRDb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwLFxuICBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAsXG4gIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwLFxuICBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwLFxuICBoYXNOZXh0UGFnZUZvclNvdXJjZUdyb3VwLFxuICBoYXNQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCxcbiAgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUsXG4gIFF1ZXJ5U3RhcnRBbmRFbmRUeXBlLFxufSBmcm9tICcuL1F1ZXJ5Lm1ldGhvZHMnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vd3JlcXInXG5pbXBvcnQgeyBDb21tb25BamF4U2V0dGluZ3MgfSBmcm9tICcuLi9BamF4U2V0dGluZ3MnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9TdGFydHVwL3N0YXJ0dXAnXG5leHBvcnQgdHlwZSBRdWVyeVR5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiAoX2F0dHJpYnV0ZXM6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkXG4gIHNldDogKHAxOiBhbnksIHAyPzogYW55LCBwMz86IGFueSkgPT4gdm9pZFxuICB0b0pTT046ICgpID0+IGFueVxuICBkZWZhdWx0czogKCkgPT4gYW55XG4gIHJlc2V0VG9EZWZhdWx0czogKG92ZXJyaWRlbkRlZmF1bHRzOiBhbnkpID0+IHZvaWRcbiAgYXBwbHlEZWZhdWx0czogKCkgPT4gdm9pZFxuICByZXZlcnQ6ICgpID0+IHZvaWRcbiAgaXNMb2NhbDogKCkgPT4gYm9vbGVhblxuICBfaGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb246IChhdHRyaWJ1dGVzOiBhbnkpID0+IHZvaWRcbiAgaW5pdGlhbGl6ZTogKGF0dHJpYnV0ZXM6IGFueSkgPT4gdm9pZFxuICBnZXRTZWxlY3RlZFNvdXJjZXM6ICgpID0+IEFycmF5PGFueT5cbiAgYnVpbGRTZWFyY2hEYXRhOiAoKSA9PiBhbnlcbiAgaXNPdXRkYXRlZDogKCkgPT4gYm9vbGVhblxuICBzdGFydFNlYXJjaElmT3V0ZGF0ZWQ6ICgpID0+IHZvaWRcbiAgdXBkYXRlQ3FsQmFzZWRPbkZpbHRlclRyZWU6ICgpID0+IHZvaWRcbiAgaW5pdGlhbGl6ZVJlc3VsdDogKG9wdGlvbnM/OiBhbnkpID0+IHtcbiAgICBkYXRhOiBhbnlcbiAgICBzZWxlY3RlZFNvdXJjZXM6IGFueVxuICAgIGlzSGFydmVzdGVkOiBhbnlcbiAgICBpc0ZlZGVyYXRlZDogYW55XG4gICAgcmVzdWx0OiBhbnlcbiAgICByZXN1bHRPcHRpb25zOiBhbnlcbiAgfVxuICBzdGFydFNlYXJjaEZyb21GaXJzdFBhZ2U6IChvcHRpb25zPzogYW55LCBkb25lPzogYW55KSA9PiB2b2lkXG4gIHN0YXJ0U2VhcmNoOiAob3B0aW9ucz86IGFueSwgZG9uZT86IGFueSkgPT4gdm9pZFxuICBjdXJyZW50U2VhcmNoZXM6IEFycmF5PGFueT5cbiAgY2FuY2VsQ3VycmVudFNlYXJjaGVzOiAoKSA9PiB2b2lkXG4gIGNsZWFyUmVzdWx0czogKCkgPT4gdm9pZFxuICBzZXRTb3VyY2VzOiAoc291cmNlczogYW55KSA9PiB2b2lkXG4gIHNldENvbG9yOiAoY29sb3I6IGFueSkgPT4gdm9pZFxuICBnZXRDb2xvcjogKCkgPT4gYW55XG4gIGNvbG9yOiAoKSA9PiBhbnlcbiAgZ2V0UHJldmlvdXNTZXJ2ZXJQYWdlOiAoKSA9PiB2b2lkXG4gIGhhc1ByZXZpb3VzU2VydmVyUGFnZTogKCkgPT4gYm9vbGVhblxuICBoYXNOZXh0U2VydmVyUGFnZTogKCkgPT4gYm9vbGVhblxuICBnZXROZXh0U2VydmVyUGFnZTogKCkgPT4gdm9pZFxuICBnZXRIYXNGaXJzdFNlcnZlclBhZ2U6ICgpID0+IGJvb2xlYW5cbiAgZ2V0Rmlyc3RTZXJ2ZXJQYWdlOiAoKSA9PiB2b2lkXG4gIGdldEhhc0xhc3RTZXJ2ZXJQYWdlOiAoKSA9PiBib29sZWFuXG4gIGdldExhc3RTZXJ2ZXJQYWdlOiAoKSA9PiB2b2lkXG4gIGdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICBnZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cDogKCkgPT4gSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgcmVzZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogKCkgPT4gdm9pZFxuICBzZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvUHJldlBhZ2U6ICgpID0+IHZvaWRcbiAgc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb05leHRQYWdlOiAoKSA9PiB2b2lkXG4gIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiAoKSA9PiBRdWVyeVN0YXJ0QW5kRW5kVHlwZVxuICBoYXNDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogKCkgPT4gYm9vbGVhblxuICBnZXRNb3N0UmVjZW50U3RhdHVzOiAoKSA9PiBhbnlcbiAgZ2V0TGF6eVJlc3VsdHM6ICgpID0+IExhenlRdWVyeVJlc3VsdHNcbiAgdXBkYXRlTW9zdFJlY2VudFN0YXR1czogKCkgPT4gdm9pZFxuICByZWZldGNoOiAoKSA9PiB2b2lkXG4gIGNhblJlZmV0Y2g6ICgpID0+IGJvb2xlYW5cbiAgW2tleTogc3RyaW5nXTogYW55XG59XG5leHBvcnQgZnVuY3Rpb24gbGltaXRUb0RlbGV0ZWQoY3FsRmlsdGVyVHJlZTogYW55KSB7XG4gIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICBjcWxGaWx0ZXJUcmVlLFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHk6ICdcIm1ldGFjYXJkLXRhZ3NcIicsXG4gICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgIHZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICB9KSxcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC5kZWxldGVkLnRhZ3NcIicsXG4gICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgIHZhbHVlOiAncmVzb3VyY2UnLFxuICAgICAgfSksXG4gICAgXSxcbiAgfSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBsaW1pdFRvSGlzdG9yaWMoY3FsRmlsdGVyVHJlZTogYW55KSB7XG4gIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICBjcWxGaWx0ZXJUcmVlLFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHk6ICdcIm1ldGFjYXJkLXRhZ3NcIicsXG4gICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgIHZhbHVlOiAncmV2aXNpb24nLFxuICAgICAgfSksXG4gICAgXSxcbiAgfSlcbn1cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICByZWxhdGlvbnM6IFtcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICdyZXN1bHQnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVJlc3BvbnNlLFxuICAgICAgaXNUcmFuc2llbnQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgLy8gb3ZlcnJpZGUgY29uc3RydWN0b3Igc2xpZ2h0bHkgdG8gZW5zdXJlIG9wdGlvbnMgLyBhdHRyaWJ1dGVzIGFyZSBhdmFpbGFibGUgb24gdGhlIHNlbGYgcmVmIGltbWVkaWF0ZWx5XG4gIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgaWYgKFxuICAgICAgIW9wdGlvbnMgfHxcbiAgICAgICFvcHRpb25zLnRyYW5zZm9ybURlZmF1bHRzIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1GaWx0ZXJUcmVlIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyB8fFxuICAgICAgIW9wdGlvbnMudHJhbnNmb3JtQ291bnRcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ09wdGlvbnMgZm9yIHRyYW5zZm9ybURlZmF1bHRzLCB0cmFuc2Zvcm1GaWx0ZXJUcmVlLCB0cmFuc2Zvcm1Tb3J0cywgYW5kIHRyYW5zZm9ybUNvdW50IG11c3QgYmUgcHJvdmlkZWQnXG4gICAgICApXG4gICAgfVxuICAgIHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge31cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgcmV0dXJuIEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH0sXG4gIHNldChkYXRhOiBhbnksIHZhbHVlOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBzd2l0Y2ggKHR5cGVvZiBkYXRhKSB7XG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgZGF0YS5maWx0ZXJUcmVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHR5cGVvZiBkYXRhLmZpbHRlclRyZWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBkYXRhLmZpbHRlclRyZWUgPSBKU09OLnBhcnNlKGRhdGEuZmlsdGVyVHJlZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhkYXRhLmZpbHRlclRyZWUpKSB7XG4gICAgICAgICAgICBkYXRhLmZpbHRlclRyZWUgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKGRhdGEuZmlsdGVyVHJlZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICBpZiAoZGF0YSA9PT0gJ2ZpbHRlclRyZWUnKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzRmlsdGVyQnVpbGRlckNsYXNzKHZhbHVlKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3ModmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgIH1cbiAgICByZXR1cm4gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLnByb3RvdHlwZS5zZXQuYXBwbHkodGhpcywgW1xuICAgICAgZGF0YSxcbiAgICAgIHZhbHVlLFxuICAgICAgb3B0aW9ucyxcbiAgICBdKVxuICB9LFxuICB0b0pTT04oLi4uYXJnczogYW55KSB7XG4gICAgY29uc3QganNvbiA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcywgLi4uYXJncylcbiAgICBpZiAodHlwZW9mIGpzb24uZmlsdGVyVHJlZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGpzb24uZmlsdGVyVHJlZSA9IEpTT04uc3RyaW5naWZ5KGpzb24uZmlsdGVyVHJlZSlcbiAgICB9XG4gICAgcmV0dXJuIGpzb25cbiAgfSxcbiAgZGVmYXVsdHMoKSB7XG4gICAgY29uc3QgZmlsdGVyVHJlZSA9IHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcz8uZmlsdGVyVHJlZVxuICAgIGxldCBjb25zdHJ1Y3RlZEZpbHRlclRyZWU6IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIGxldCBjb25zdHJ1Y3RlZENxbCA9IHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcz8uY3FsIHx8IFwiYW55VGV4dCBJTElLRSAnKidcIlxuICAgIGlmIChmaWx0ZXJUcmVlICYmIHR5cGVvZiBmaWx0ZXJUcmVlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3RydWN0ZWRGaWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhKU09OLnBhcnNlKGZpbHRlclRyZWUpKVxuICAgIH0gZWxzZSBpZiAoIWZpbHRlclRyZWUgfHwgZmlsdGVyVHJlZS5pZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB3aGVuIHdlIG1ha2UgZHJhc3RpYyBjaGFuZ2VzIHRvIGZpbHRlciB0cmVlIGl0IHdpbGwgYmUgbmVjZXNzYXJ5IHRvIGZhbGwgYmFjayB0byBjcWwgYW5kIHJlY29uc3RydWN0IGEgZmlsdGVyIHRyZWUgdGhhdCdzIGNvbXBhdGlibGVcbiAgICAgIGNvbnN0cnVjdGVkRmlsdGVyVHJlZSA9IGNxbC5yZWFkKGNvbnN0cnVjdGVkQ3FsKVxuICAgICAgY29uc29sZS53YXJuKCdtaWdyYXRpbmcgYSBmaWx0ZXIgdHJlZSB0byB0aGUgbGF0ZXN0IHN0cnVjdHVyZScpXG4gICAgICAvLyBhbGxvdyBkb3duc3RyZWFtIHByb2plY3RzIHRvIGhhbmRsZSBob3cgdGhleSB3YW50IHRvIGluZm9ybSB1c2VycyBvZiBtaWdyYXRpb25zXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdmaWx0ZXJUcmVlOm1pZ3JhdGlvbicsIHtcbiAgICAgICAgc2VhcmNoOiB0aGlzLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3RydWN0ZWRGaWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhmaWx0ZXJUcmVlKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybURlZmF1bHRzKHtcbiAgICAgIG9yaWdpbmFsRGVmYXVsdHM6IHtcbiAgICAgICAgY3FsOiBjb25zdHJ1Y3RlZENxbCxcbiAgICAgICAgZmlsdGVyVHJlZTogY29uc3RydWN0ZWRGaWx0ZXJUcmVlLFxuICAgICAgICBhc3NvY2lhdGVkRm9ybU1vZGVsOiB1bmRlZmluZWQsXG4gICAgICAgIGV4Y2x1ZGVVbm5lY2Vzc2FyeUF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGNvdW50OiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVzdWx0Q291bnQoKSxcbiAgICAgICAgc29ydHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhdHRyaWJ1dGU6ICdtb2RpZmllZCcsXG4gICAgICAgICAgICBkaXJlY3Rpb246ICdkZXNjZW5kaW5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzb3VyY2VzOiBbJ2FsbCddLFxuICAgICAgICAvLyBpbml0aWFsaXplIHRoaXMgaGVyZSBzbyB3ZSBjYW4gYXZvaWQgY3JlYXRpbmcgc3B1cmlvdXMgcmVmZXJlbmNlcyB0byBMYXp5UXVlcnlSZXN1bHRzIG9iamVjdHNcbiAgICAgICAgcmVzdWx0OiBuZXcgUXVlcnlSZXNwb25zZSh7XG4gICAgICAgICAgbGF6eVJlc3VsdHM6IG5ldyBMYXp5UXVlcnlSZXN1bHRzKHtcbiAgICAgICAgICAgIGZpbHRlclRyZWU6IGNvbnN0cnVjdGVkRmlsdGVyVHJlZSxcbiAgICAgICAgICAgIHNvcnRzOiBbXSxcbiAgICAgICAgICAgIHNvdXJjZXM6IFtdLFxuICAgICAgICAgICAgdHJhbnNmb3JtU29ydHM6ICh7IG9yaWdpbmFsU29ydHMgfSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybVNvcnRzKHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNvcnRzLFxuICAgICAgICAgICAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgaXNMb2NhbDogZmFsc2UsXG4gICAgICAgIGlzT3V0ZGF0ZWQ6IGZhbHNlLFxuICAgICAgICAnZGV0YWlsLWxldmVsJzogdW5kZWZpbmVkLFxuICAgICAgICBzcGVsbGNoZWNrOiBmYWxzZSxcbiAgICAgICAgcGhvbmV0aWNzOiBmYWxzZSxcbiAgICAgICAgYWRkaXRpb25hbE9wdGlvbnM6ICd7fScsXG4gICAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSxcbiAgICAgICAgbmV4dEluZGV4Rm9yU291cmNlR3JvdXA6IHt9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlLFxuICAgICAgICBtb3N0UmVjZW50U3RhdHVzOiB7fSBhcyBTZWFyY2hTdGF0dXMsXG4gICAgICB9LFxuICAgICAgcXVlcnlSZWY6IHRoaXMsXG4gICAgfSlcbiAgfSxcbiAgLyoqXG4gICAqICBBZGQgZmlsdGVyVHJlZSBpbiBoZXJlLCBzaW5jZSBpbml0aWFsaXplIGlzIG9ubHkgcnVuIG9uY2UgKGFuZCBkZWZhdWx0cyBjYW4ndCBoYXZlIGZpbHRlclRyZWUpXG4gICAqL1xuICByZXNldFRvRGVmYXVsdHMob3ZlcnJpZGVuRGVmYXVsdHM6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRzID0gXy5vbWl0KFxuICAgICAge1xuICAgICAgICAuLi50aGlzLmRlZmF1bHRzKCksXG4gICAgICAgIGZpbHRlclRyZWU6IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICBbJ2lzTG9jYWwnLCAncmVzdWx0J11cbiAgICApXG4gICAgdGhpcy5zZXQoX21lcmdlKGRlZmF1bHRzLCBvdmVycmlkZW5EZWZhdWx0cykpXG4gICAgdGhpcy50cmlnZ2VyKCdyZXNldFRvRGVmYXVsdHMnKVxuICB9LFxuICBhcHBseURlZmF1bHRzKCkge1xuICAgIHRoaXMuc2V0KF8ucGljayh0aGlzLmRlZmF1bHRzKCksIFsnc29ydHMnLCAnc291cmNlcyddKSlcbiAgfSxcbiAgcmV2ZXJ0KCkge1xuICAgIHRoaXMudHJpZ2dlcigncmV2ZXJ0JylcbiAgfSxcbiAgaXNMb2NhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2lzTG9jYWwnKVxuICB9LFxuICBfaGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb24oYXR0cmlidXRlczogYW55KSB7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5mZWRlcmF0aW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnQXR0ZW1wdCB0byBzZXQgZmVkZXJhdGlvbiBvbiBhIHNlYXJjaC4gIFRoaXMgYXR0cmlidXRlIGlzIGRlcHJlY2F0ZWQuICBEaWQgeW91IG1lYW4gdG8gc2V0IHNvdXJjZXM/J1xuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbGl6ZShhdHRyaWJ1dGVzOiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSkgLy8gdW5kZXJzY29yZSBiaW5kQWxsIGRvZXMgbm90IHRha2UgYXJyYXkgYXJnXG4gICAgdGhpcy5faGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb24oYXR0cmlidXRlcylcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6Y3FsIGNoYW5nZTpmaWx0ZXJUcmVlIGNoYW5nZTpzb3VyY2VzIGNoYW5nZTpzb3J0cyBjaGFuZ2U6c3BlbGxjaGVjayBjaGFuZ2U6cGhvbmV0aWNzIGNoYW5nZTpjb3VudCBjaGFuZ2U6YWRkaXRpb25hbE9wdGlvbnMnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldCgnaXNPdXRkYXRlZCcsIHRydWUpXG4gICAgICAgIHRoaXMuc2V0KCdtb3N0UmVjZW50U3RhdHVzJywge30pXG4gICAgICB9XG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpmaWx0ZXJUcmVlJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLl9yZXNldEZpbHRlclRyZWUodGhpcy5nZXQoJ2ZpbHRlclRyZWUnKSlcbiAgICB9KVxuICAgIC8vIGJhc2ljYWxseSByZW1vdmUgaW52YWxpZCBmaWx0ZXJzIHdoZW4gZ29pbmcgZnJvbSBiYXNpYyB0byBhZHZhbmNlZCwgYW5kIG1ha2UgaXQgYmFzaWMgY29tcGF0aWJsZVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTp0eXBlJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZ2V0KCd0eXBlJykgPT09ICdiYXNpYycpIHtcbiAgICAgICAgY29uc3QgY2xlYW5lZFVwRmlsdGVyVHJlZSA9IGNxbC5yZW1vdmVJbnZhbGlkRmlsdGVycyhcbiAgICAgICAgICB0aGlzLmdldCgnZmlsdGVyVHJlZScpXG4gICAgICAgIClcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgIGRvd25ncmFkZUZpbHRlclRyZWVUb0Jhc2ljKGNsZWFuZWRVcEZpbHRlclRyZWUgYXMgYW55KVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmdldExhenlSZXN1bHRzKCkuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzdGF0dXMnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVNb3N0UmVjZW50U3RhdHVzKClcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbiAgZ2V0U2VsZWN0ZWRTb3VyY2VzKCkge1xuICAgIGNvbnN0IFNvdXJjZXMgPSBTdGFydHVwRGF0YVN0b3JlLlNvdXJjZXMuc291cmNlc1xuICAgIGNvbnN0IHNvdXJjZUlkcyA9IFNvdXJjZXMubWFwKChzcmMpID0+IHNyYy5pZClcbiAgICBjb25zdCBsb2NhbFNvdXJjZUlkcyA9IFNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzcmMpID0+IHNyYy5pZFxuICAgIClcbiAgICBjb25zdCByZW1vdGVTb3VyY2VJZHMgPSBTb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiAhc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNyYykgPT4gc3JjLmlkXG4gICAgKVxuICAgIGNvbnN0IHNlbGVjdGVkU291cmNlcyA9IHRoaXMuZ2V0KCdzb3VyY2VzJylcbiAgICBsZXQgc291cmNlQXJyYXkgPSBzZWxlY3RlZFNvdXJjZXNcbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VzLmluY2x1ZGVzKCdhbGwnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VJZHNcbiAgICB9XG4gICAgaWYgKHNlbGVjdGVkU291cmNlcy5pbmNsdWRlcygnbG9jYWwnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VBcnJheVxuICAgICAgICAuY29uY2F0KGxvY2FsU291cmNlSWRzKVxuICAgICAgICAuZmlsdGVyKChzcmM6IGFueSkgPT4gc3JjICE9PSAnbG9jYWwnKVxuICAgIH1cbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VzLmluY2x1ZGVzKCdyZW1vdGUnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VBcnJheVxuICAgICAgICAuY29uY2F0KHJlbW90ZVNvdXJjZUlkcylcbiAgICAgICAgLmZpbHRlcigoc3JjOiBhbnkpID0+IHNyYyAhPT0gJ3JlbW90ZScpXG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VBcnJheVxuICB9LFxuICBidWlsZFNlYXJjaERhdGEoKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMudG9KU09OKClcbiAgICBkYXRhLnNvdXJjZXMgPSB0aGlzLmdldFNlbGVjdGVkU291cmNlcygpXG4gICAgZGF0YS5jb3VudCA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Db3VudCh7XG4gICAgICBvcmlnaW5hbENvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgZGF0YS5zb3J0cyA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyh7XG4gICAgICBvcmlnaW5hbFNvcnRzOiB0aGlzLmdldCgnc29ydHMnKSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgcmV0dXJuIF8ucGljayhcbiAgICAgIGRhdGEsXG4gICAgICAnc291cmNlcycsXG4gICAgICAnY291bnQnLFxuICAgICAgJ3RpbWVvdXQnLFxuICAgICAgJ2NxbCcsXG4gICAgICAnc29ydHMnLFxuICAgICAgJ2lkJyxcbiAgICAgICdzcGVsbGNoZWNrJyxcbiAgICAgICdwaG9uZXRpY3MnLFxuICAgICAgJ2FkZGl0aW9uYWxPcHRpb25zJ1xuICAgIClcbiAgfSxcbiAgaXNPdXRkYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2lzT3V0ZGF0ZWQnKVxuICB9LFxuICBzdGFydFNlYXJjaElmT3V0ZGF0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaXNPdXRkYXRlZCgpKSB7XG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBXZSBvbmx5IGtlZXAgZmlsdGVyVHJlZSB1cCB0byBkYXRlLCB0aGVuIHdoZW4gd2UgaW50ZXJhY3Qgd2l0aCB0aGUgc2VydmVyIHdlIHdyaXRlIG91dCB3aGF0IGl0IG1lYW5zXG4gICAqXG4gICAqIFdlIGRvIHRoaXMgZm9yIHBlcmZvcm1hbmNlLCBhbmQgYmVjYXVzZSB0cmFuc2Zvcm1hdGlvbiBpcyBsb3NzeS5cbiAgICpcbiAgICogQWxzbyBub3RpY2UgdGhhdCB3ZSBkbyBhIHNsaWdodCBiaXQgb2YgdmFsaWRhdGlvbiwgc28gYW55dGhpbmcgdGhhdCBoYXMgbm8gZmlsdGVycyB3aWxsIHRyYW5zbGF0ZSB0byBhIHN0YXIgcXVlcnkgKGV2ZXJ5dGhpbmcpXG4gICAqL1xuICB1cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpIHtcbiAgICBjb25zdCBmaWx0ZXJUcmVlID0gdGhpcy5nZXQoJ2ZpbHRlclRyZWUnKVxuICAgIGlmIChcbiAgICAgICFmaWx0ZXJUcmVlIHx8XG4gICAgICBmaWx0ZXJUcmVlLmZpbHRlcnMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgZmlsdGVyVHJlZS5maWx0ZXJzLmxlbmd0aCA9PT0gMFxuICAgICkge1xuICAgICAgdGhpcy5zZXQoXG4gICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHsgdmFsdWU6ICcqJywgcHJvcGVydHk6ICdhbnlUZXh0JywgdHlwZTogJ0lMSUtFJyB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgdGhpcy51cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdjcWwnLCBjcWwud3JpdGUoZmlsdGVyVHJlZSkpXG4gICAgfVxuICB9LFxuICBzdGFydFNlYXJjaEZyb21GaXJzdFBhZ2Uob3B0aW9uczogYW55LCBkb25lOiBhbnkpIHtcbiAgICB0aGlzLnVwZGF0ZUNxbEJhc2VkT25GaWx0ZXJUcmVlKClcbiAgICB0aGlzLnJlc2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKVxuICAgIHRoaXMuc3RhcnRTZWFyY2gob3B0aW9ucywgZG9uZSlcbiAgfSxcbiAgaW5pdGlhbGl6ZVJlc3VsdChvcHRpb25zOiBhbnkpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBvcHRpb25zID0gXy5leHRlbmQoXG4gICAgICB7XG4gICAgICAgIGxpbWl0VG9EZWxldGVkOiBmYWxzZSxcbiAgICAgICAgbGltaXRUb0hpc3RvcmljOiBmYWxzZSxcbiAgICAgICAgYWRkaXRpb25hbE9wdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgICBvcHRpb25zXG4gICAgKVxuICAgIHRoaXMub3B0aW9ucyA9IF8uZXh0ZW5kKHRoaXMub3B0aW9ucywgb3B0aW9ucylcblxuICAgIGNvbnN0IGRhdGEgPSBfY2xvbmVEZWVwKHRoaXMuYnVpbGRTZWFyY2hEYXRhKCkpXG5cbiAgICBpZiAob3B0aW9ucy5hZGRpdGlvbmFsT3B0aW9ucykge1xuICAgICAgbGV0IG9wdGlvbnNPYmogPSBKU09OLnBhcnNlKGRhdGEuYWRkaXRpb25hbE9wdGlvbnMgfHwgJ3t9JylcbiAgICAgIG9wdGlvbnNPYmogPSBfLmV4dGVuZChvcHRpb25zT2JqLCBvcHRpb25zLmFkZGl0aW9uYWxPcHRpb25zKVxuICAgICAgZGF0YS5hZGRpdGlvbmFsT3B0aW9ucyA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnNPYmopXG4gICAgfVxuICAgIGRhdGEuYmF0Y2hJZCA9IHY0KClcbiAgICAvLyBEYXRhLnNvdXJjZXMgaXMgc2V0IGluIGBidWlsZFNlYXJjaERhdGFgIGJhc2VkIG9uIHdoaWNoIHNvdXJjZXMgeW91IGhhdmUgc2VsZWN0ZWQuXG4gICAgbGV0IHNlbGVjdGVkU291cmNlcyA9IGRhdGEuc291cmNlc1xuICAgIGNvbnN0IGhhcnZlc3RlZFNvdXJjZXMgPSBTb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2UuaGFydmVzdGVkKS5tYXAoXG4gICAgICAoc291cmNlKSA9PiBzb3VyY2UuaWRcbiAgICApXG4gICAgY29uc3QgaXNIYXJ2ZXN0ZWQgPSAoaWQ6IGFueSkgPT4gaGFydmVzdGVkU291cmNlcy5pbmNsdWRlcyhpZClcbiAgICBjb25zdCBpc0ZlZGVyYXRlZCA9IChpZDogYW55KSA9PiAhaGFydmVzdGVkU291cmNlcy5pbmNsdWRlcyhpZClcbiAgICBpZiAob3B0aW9ucy5saW1pdFRvRGVsZXRlZCkge1xuICAgICAgc2VsZWN0ZWRTb3VyY2VzID0gZGF0YS5zb3VyY2VzLmZpbHRlcihpc0hhcnZlc3RlZClcbiAgICB9XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuZ2V0KCdyZXN1bHQnKVxuICAgIHRoaXMuZ2V0TGF6eVJlc3VsdHMoKS5yZXNldCh7XG4gICAgICBmaWx0ZXJUcmVlOiB0aGlzLmdldCgnZmlsdGVyVHJlZScpLFxuICAgICAgc29ydHM6IHRoaXMuZ2V0KCdzb3J0cycpLFxuICAgICAgc291cmNlczogc2VsZWN0ZWRTb3VyY2VzLFxuICAgICAgdHJhbnNmb3JtU29ydHM6ICh7IG9yaWdpbmFsU29ydHMgfTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMudHJhbnNmb3JtU29ydHMoeyBvcmlnaW5hbFNvcnRzLCBxdWVyeVJlZjogdGhpcyB9KVxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiB7XG4gICAgICBkYXRhLFxuICAgICAgc2VsZWN0ZWRTb3VyY2VzLFxuICAgICAgaXNIYXJ2ZXN0ZWQsXG4gICAgICBpc0ZlZGVyYXRlZCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHJlc3VsdE9wdGlvbnM6IG9wdGlvbnMsXG4gICAgfVxuICB9LFxuICAvLyB3ZSBuZWVkIGF0IGxlYXN0IG9uZSBzdGF0dXMgZm9yIHRoZSBzZWFyY2ggdG8gYmUgYWJsZSB0byBjb3JyZWN0bHkgcGFnZSB0aGluZ3MsIHRlY2huaWNhbGx5IHdlIGNvdWxkIGp1c3QgdXNlIHRoZSBmaXJzdCBvbmVcbiAgdXBkYXRlTW9zdFJlY2VudFN0YXR1cygpIHtcbiAgICBjb25zdCBjdXJyZW50U3RhdHVzID0gdGhpcy5nZXRMYXp5UmVzdWx0cygpLnN0YXR1c1xuICAgIGNvbnN0IHByZXZpb3VzU3RhdHVzID0gdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKClcbiAgICBjb25zdCBuZXdTdGF0dXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHByZXZpb3VzU3RhdHVzKSlcbiAgICAvLyBjb21wYXJlIGVhY2gga2V5IGFuZCBvdmVyd3JpdGUgb25seSB3aGVuIHRoZSBuZXcgc3RhdHVzIGlzIHN1Y2Nlc3NmdWwgLSB3ZSBuZWVkIGEgc3VjY2Vzc2Z1bCBzdGF0dXMgdG8gcGFnZVxuICAgIE9iamVjdC5rZXlzKGN1cnJlbnRTdGF0dXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnRTdGF0dXNba2V5XS5zdWNjZXNzZnVsKSB7XG4gICAgICAgIG5ld1N0YXR1c1trZXldID0gY3VycmVudFN0YXR1c1trZXldXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnNldCgnbW9zdFJlY2VudFN0YXR1cycsIG5ld1N0YXR1cylcbiAgfSxcbiAgZ2V0TGF6eVJlc3VsdHMoKTogTGF6eVF1ZXJ5UmVzdWx0cyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdyZXN1bHQnKS5nZXQoJ2xhenlSZXN1bHRzJylcbiAgfSxcbiAgc3RhcnRTZWFyY2gob3B0aW9uczogYW55LCBkb25lOiBhbnkpIHtcbiAgICB0aGlzLnRyaWdnZXIoJ3BhblRvU2hhcGVzRXh0ZW50JylcbiAgICB0aGlzLnNldCgnaXNPdXRkYXRlZCcsIGZhbHNlKVxuICAgIGlmICh0aGlzLmdldCgnY3FsJykgPT09ICcnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5jYW5jZWxDdXJyZW50U2VhcmNoZXMoKVxuICAgIGNvbnN0IHtcbiAgICAgIGRhdGEsXG4gICAgICBzZWxlY3RlZFNvdXJjZXMsXG4gICAgICBpc0hhcnZlc3RlZCxcbiAgICAgIGlzRmVkZXJhdGVkLFxuICAgICAgcmVzdWx0LFxuICAgICAgcmVzdWx0T3B0aW9ucyxcbiAgICB9ID0gdGhpcy5pbml0aWFsaXplUmVzdWx0KG9wdGlvbnMpXG4gICAgZGF0YS5mcm9tVUkgPSB0cnVlXG4gICAgbGV0IGNxbEZpbHRlclRyZWUgPSB0aGlzLmdldCgnZmlsdGVyVHJlZScpXG4gICAgaWYgKHJlc3VsdE9wdGlvbnMubGltaXRUb0RlbGV0ZWQpIHtcbiAgICAgIGNxbEZpbHRlclRyZWUgPSBsaW1pdFRvRGVsZXRlZChjcWxGaWx0ZXJUcmVlKVxuICAgIH0gZWxzZSBpZiAocmVzdWx0T3B0aW9ucy5saW1pdFRvSGlzdG9yaWMpIHtcbiAgICAgIGNxbEZpbHRlclRyZWUgPSBsaW1pdFRvSGlzdG9yaWMoY3FsRmlsdGVyVHJlZSlcbiAgICB9XG4gICAgbGV0IGNxbFN0cmluZyA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1GaWx0ZXJUcmVlKHtcbiAgICAgIG9yaWdpbmFsRmlsdGVyVHJlZTogY3FsRmlsdGVyVHJlZSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgdGhpcy5zZXQoJ2N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwJywgdGhpcy5nZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cCgpKVxuXG4gICAgcG9zdFNpbXBsZUF1ZGl0TG9nKHtcbiAgICAgIGFjdGlvbjogJ1NFQVJDSF9TVUJNSVRURUQnLFxuICAgICAgY29tcG9uZW50OlxuICAgICAgICAncXVlcnk6IFsnICsgY3FsU3RyaW5nICsgJ10gc291cmNlczogWycgKyBzZWxlY3RlZFNvdXJjZXMgKyAnXScsXG4gICAgfSlcblxuICAgIGNvbnN0IGZlZGVyYXRlZFNlYXJjaGVzVG9SdW4gPSBzZWxlY3RlZFNvdXJjZXNcbiAgICAgIC5maWx0ZXIoaXNGZWRlcmF0ZWQpXG4gICAgICAubWFwKChzb3VyY2U6IGFueSkgPT4gKHtcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgY3FsOiBjcWxTdHJpbmcsXG4gICAgICAgIHNyY3M6IFtzb3VyY2VdLFxuICAgICAgICBzdGFydDogdGhpcy5nZXQoJ2N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwJylbc291cmNlXSxcbiAgICAgIH0pKVxuICAgIGNvbnN0IHNlYXJjaGVzVG9SdW4gPSBbLi4uZmVkZXJhdGVkU2VhcmNoZXNUb1J1bl0uZmlsdGVyKFxuICAgICAgKHNlYXJjaCkgPT4gc2VhcmNoLnNyY3MubGVuZ3RoID4gMFxuICAgIClcbiAgICBpZiAodGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLmxvY2FsKSB7XG4gICAgICBjb25zdCBsb2NhbFNlYXJjaFRvUnVuID0ge1xuICAgICAgICAuLi5kYXRhLFxuICAgICAgICBjcWw6IGNxbFN0cmluZyxcbiAgICAgICAgc3Jjczogc2VsZWN0ZWRTb3VyY2VzLmZpbHRlcihpc0hhcnZlc3RlZCksXG4gICAgICAgIHN0YXJ0OiB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkubG9jYWwsXG4gICAgICB9XG4gICAgICBzZWFyY2hlc1RvUnVuLnB1c2gobG9jYWxTZWFyY2hUb1J1bilcbiAgICB9XG4gICAgaWYgKHNlYXJjaGVzVG9SdW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyByZXNldCB0byBhbGwgYW5kIHJ1blxuICAgICAgdGhpcy5zZXQoJ3NvdXJjZXMnLCBbJ2FsbCddKVxuICAgICAgdGhpcy5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuY3VycmVudFNlYXJjaGVzID0gc2VhcmNoZXNUb1J1bi5tYXAoKHNlYXJjaCkgPT4ge1xuICAgICAgZGVsZXRlIHNlYXJjaC5zb3VyY2VzIC8vIFRoaXMga2V5IGlzbid0IHVzZWQgb24gdGhlIGJhY2tlbmQgYW5kIG9ubHkgc2VydmVzIHRvIGNvbmZ1c2UgdGhvc2UgZGVidWdnaW5nIHRoaXMgY29kZS5cbiAgICAgIC8vIGByZXN1bHRgIGlzIFF1ZXJ5UmVzcG9uc2VcbiAgICAgIHJldHVybiByZXN1bHQuZmV0Y2goe1xuICAgICAgICAuLi5Db21tb25BamF4U2V0dGluZ3MsXG4gICAgICAgIGN1c3RvbUVycm9ySGFuZGxpbmc6IHRydWUsXG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHNlYXJjaCksXG4gICAgICAgIHJlbW92ZTogZmFsc2UsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICAgIHRpbWVvdXQ6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRTZWFyY2hUaW1lb3V0KCksXG4gICAgICAgIHN1Y2Nlc3MoX21vZGVsOiBhbnksIHJlc3BvbnNlOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgICAgIHJlc3BvbnNlLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yKF9tb2RlbDogYW55LCByZXNwb25zZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgICByZXNwb25zZS5vcHRpb25zID0gb3B0aW9uc1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9KVxuICAgIGlmICh0eXBlb2YgZG9uZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZG9uZSh0aGlzLmN1cnJlbnRTZWFyY2hlcylcbiAgICB9XG4gIH0sXG4gIGN1cnJlbnRTZWFyY2hlczogW10sXG4gIGNhbmNlbEN1cnJlbnRTZWFyY2hlcygpIHtcbiAgICB0aGlzLmN1cnJlbnRTZWFyY2hlcy5mb3JFYWNoKChyZXF1ZXN0OiBhbnkpID0+IHtcbiAgICAgIHJlcXVlc3QuYWJvcnQoJ0NhbmNlbGVkJylcbiAgICB9KVxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZ2V0KCdyZXN1bHQnKVxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHRoaXMuZ2V0TGF6eVJlc3VsdHMoKS5jYW5jZWwoKVxuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRTZWFyY2hlcyA9IFtdXG4gIH0sXG4gIGNsZWFyUmVzdWx0cygpIHtcbiAgICB0aGlzLmNhbmNlbEN1cnJlbnRTZWFyY2hlcygpXG4gICAgdGhpcy5zZXQoe1xuICAgICAgcmVzdWx0OiB1bmRlZmluZWQsXG4gICAgfSlcbiAgfSxcbiAgc2V0U291cmNlcyhzb3VyY2VzOiBhbnkpIHtcbiAgICBjb25zdCBzb3VyY2VBcnIgPSBbXSBhcyBhbnlcbiAgICBzb3VyY2VzLmVhY2goKHNyYzogYW55KSA9PiB7XG4gICAgICBpZiAoc3JjLmdldCgnYXZhaWxhYmxlJykgPT09IHRydWUpIHtcbiAgICAgICAgc291cmNlQXJyLnB1c2goc3JjLmdldCgnaWQnKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChzb3VyY2VBcnIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZXQoJ3NvdXJjZXMnLCBzb3VyY2VBcnIuam9pbignLCcpKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldCgnc291cmNlcycsICcnKVxuICAgIH1cbiAgfSxcbiAgc2V0Q29sb3IoY29sb3I6IGFueSkge1xuICAgIHRoaXMuc2V0KCdjb2xvcicsIGNvbG9yKVxuICB9LFxuICBnZXRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NvbG9yJylcbiAgfSxcbiAgY29sb3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb2xvcicpXG4gIH0sXG4gIGdldFByZXZpb3VzU2VydmVyUGFnZSgpIHtcbiAgICB0aGlzLnNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9QcmV2UGFnZSgpXG4gICAgdGhpcy5zdGFydFNlYXJjaCh0aGlzLm9wdGlvbnMpXG4gIH0sXG4gIC8qKlxuICAgKiBNdWNoIHNpbXBsZXIgdGhhbiBzZWVpbmcgaWYgYSBuZXh0IHBhZ2UgZXhpc3RzXG4gICAqL1xuICBoYXNQcmV2aW91c1NlcnZlclBhZ2UoKSB7XG4gICAgcmV0dXJuIGhhc1ByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCksXG4gICAgfSlcbiAgfSxcbiAgaGFzTmV4dFNlcnZlclBhZ2UoKSB7XG4gICAgcmV0dXJuIGhhc05leHRQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICAgIGNvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICB9KVxuICB9LFxuICBnZXROZXh0U2VydmVyUGFnZSgpIHtcbiAgICB0aGlzLnNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9OZXh0UGFnZSgpXG4gICAgdGhpcy5zdGFydFNlYXJjaCh0aGlzLm9wdGlvbnMpXG4gIH0sXG4gIGdldEhhc0ZpcnN0U2VydmVyUGFnZSgpIHtcbiAgICAvLyBzbyB0ZWNobmljYWxseSBhbHdheXMgXCJ0cnVlXCIgYnV0IHdoYXQgd2UgcmVhbGx5IG1lYW4gaXMsIGFyZSB3ZSBub3Qgb24gcGFnZSAxIGFscmVhZHlcbiAgICByZXR1cm4gdGhpcy5oYXNQcmV2aW91c1NlcnZlclBhZ2UoKVxuICB9LFxuICBnZXRGaXJzdFNlcnZlclBhZ2UoKSB7XG4gICAgdGhpcy5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UodGhpcy5vcHRpb25zKVxuICB9LFxuICBnZXRIYXNMYXN0U2VydmVyUGFnZSgpIHtcbiAgICAvLyBzbyB0ZWNobmljYWxseSBhbHdheXMgXCJ0cnVlXCIgYnV0IHdoYXQgd2UgcmVhbGx5IG1lYW4gaXMsIGFyZSB3ZSBub3Qgb24gbGFzdCBwYWdlIGFscmVhZHlcbiAgICByZXR1cm4gdGhpcy5oYXNOZXh0U2VydmVyUGFnZSgpXG4gIH0sXG4gIGdldExhc3RTZXJ2ZXJQYWdlKCkge1xuICAgIHRoaXMuc2V0KFxuICAgICAgJ25leHRJbmRleEZvclNvdXJjZUdyb3VwJyxcbiAgICAgIGdldENvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgICBxdWVyeVN0YXR1czogdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKCksXG4gICAgICAgIGlzTG9jYWw6IHRoaXMuaXNMb2NhbFNvdXJjZSxcbiAgICAgICAgY291bnQ6IHRoaXMuZ2V0KCdjb3VudCcpLFxuICAgICAgfSlcbiAgICApXG4gICAgdGhpcy5zdGFydFNlYXJjaCh0aGlzLm9wdGlvbnMpXG4gIH0sXG4gIHJlc2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSB7XG4gICAgdGhpcy5zZXQoJ2N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwJywge30pXG4gICAgaWYgKHRoaXMuZ2V0KCdyZXN1bHQnKSkge1xuICAgICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLl9yZXNldFNvdXJjZXMoW10pXG4gICAgfVxuICAgIHRoaXMuc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb05leHRQYWdlKClcbiAgfSxcbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgbmV4dCBpbmRleCB0byBiZSB0aGUgcHJldiBwYWdlXG4gICAqL1xuICBzZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvUHJldlBhZ2UoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAnbmV4dEluZGV4Rm9yU291cmNlR3JvdXAnLFxuICAgICAgZ2V0Q29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICAgIHNvdXJjZXM6IHRoaXMuZ2V0U2VsZWN0ZWRTb3VyY2VzKCksXG4gICAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCksXG4gICAgICAgIGNvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgICAgICBxdWVyeVN0YXR1czogdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKCksXG4gICAgICB9KVxuICAgIClcbiAgfSxcbiAgaXNMb2NhbFNvdXJjZShpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgU291cmNlcyA9IFN0YXJ0dXBEYXRhU3RvcmUuU291cmNlcy5zb3VyY2VzXG4gICAgY29uc3QgaGFydmVzdGVkU291cmNlcyA9IFNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzb3VyY2UpID0+IHNvdXJjZS5pZFxuICAgIClcbiAgICByZXR1cm4gaGFydmVzdGVkU291cmNlcy5pbmNsdWRlcyhpZClcbiAgfSxcbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgbmV4dCBpbmRleCB0byBiZSB0aGUgbmV4dCBwYWdlXG4gICAqL1xuICBzZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvTmV4dFBhZ2UoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAnbmV4dEluZGV4Rm9yU291cmNlR3JvdXAnLFxuICAgICAgZ2V0Q29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICAgICAgc291cmNlczogdGhpcy5nZXRTZWxlY3RlZFNvdXJjZXMoKSxcbiAgICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICAgICAgY291bnQ6IHRoaXMuZ2V0KCdjb3VudCcpLFxuICAgICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgIH0pXG4gICAgKVxuICB9LFxuICBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCgpIHtcbiAgICByZXR1cm4gZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXAoe1xuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgIGlzTG9jYWw6IHRoaXMuaXNMb2NhbFNvdXJjZSxcbiAgICB9KVxuICB9LFxuICAvLyB0cnkgdG8gcmV0dXJuIHRoZSBtb3N0IHJlY2VudCBzdWNjZXNzZnVsIHN0YXR1c1xuICBnZXRNb3N0UmVjZW50U3RhdHVzKCk6IFNlYXJjaFN0YXR1cyB7XG4gICAgY29uc3QgbW9zdFJlY2VudFN0YXR1cyA9IHRoaXMuZ2V0KCdtb3N0UmVjZW50U3RhdHVzJykgYXMgU2VhcmNoU3RhdHVzXG4gICAgaWYgKE9iamVjdC5rZXlzKG1vc3RSZWNlbnRTdGF0dXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGF6eVJlc3VsdHMoKS5zdGF0dXMgfHwge31cbiAgICB9XG4gICAgcmV0dXJuIG1vc3RSZWNlbnRTdGF0dXNcbiAgfSxcbiAgZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCcpXG4gIH0sXG4gIGdldE5leHRJbmRleEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbmV4dEluZGV4Rm9yU291cmNlR3JvdXAnKVxuICB9LFxuICBoYXNDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpKS5sZW5ndGggPiAwXG4gIH0sXG4gIHJlZmV0Y2goKSB7XG4gICAgaWYgKHRoaXMuY2FuUmVmZXRjaCgpKSB7XG4gICAgICB0aGlzLnNldCgnbmV4dEluZGV4Rm9yU291cmNlR3JvdXAnLCB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkpXG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnTWlzc2luZyBuZWNlc3NhcnkgZGF0YSB0byByZWZldGNoIChjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCksIG9yIHNlYXJjaCBjcml0ZXJpYSBpcyBvdXRkYXRlZC4nXG4gICAgICApXG4gICAgfVxuICB9LFxuICAvLyBhcyBsb25nIGFzIHdlIGhhdmUgYSBjdXJyZW50IGluZGV4LCBhbmQgdGhlIHNlYXJjaCBjcml0ZXJpYSBpc24ndCBvdXQgb2YgZGF0ZSwgd2UgY2FuIHJlZmV0Y2ggLSB1c2VmdWwgZm9yIHJlc3VtaW5nIHNlYXJjaGVzXG4gIGNhblJlZmV0Y2goKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzQ3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSAmJiAhdGhpcy5pc091dGRhdGVkKClcbiAgfSxcbiAgLy8gY29tbW9uIGVub3VnaCB0aGF0IHdlIHNob3VsZCBleHRyYWN0IHRoaXMgZm9yIGVhc2Ugb2YgdXNlXG4gIHJlZmV0Y2hPclN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpIHtcbiAgICBpZiAodGhpcy5jYW5SZWZldGNoKCkpIHtcbiAgICAgIHRoaXMucmVmZXRjaCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKClcbiAgICB9XG4gIH0sXG59IGFzIFF1ZXJ5VHlwZSlcbiJdfQ==