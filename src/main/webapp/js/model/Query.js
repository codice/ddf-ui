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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvUXVlcnkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTtBQUNyRixPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUE7QUFDeEIsT0FBTyxNQUFNLE1BQU0sY0FBYyxDQUFBO0FBQ2pDLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQ0wsZ0JBQWdCLEdBRWpCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsb0JBQW9CLEdBQ3JCLE1BQU0saURBQWlELENBQUE7QUFDeEQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDekYsT0FBTyxFQUNMLHFDQUFxQyxFQUNyQyxvQ0FBb0MsRUFDcEMsbUNBQW1DLEVBQ25DLHdDQUF3QyxFQUN4Qyx5QkFBeUIsRUFDekIsNkJBQTZCLEdBRzlCLE1BQU0saUJBQWlCLENBQUE7QUFDeEIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBd0RwRCxNQUFNLFVBQVUsY0FBYyxDQUFDLGFBQWtCO0lBQy9DLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztRQUM1QixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRTtZQUNQLGFBQWE7WUFDYixJQUFJLFdBQVcsQ0FBQztnQkFDZCxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsU0FBUzthQUNqQixDQUFDO1lBQ0YsSUFBSSxXQUFXLENBQUM7Z0JBQ2QsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFLFVBQVU7YUFDbEIsQ0FBQztTQUNIO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUNELE1BQU0sVUFBVSxlQUFlLENBQUMsYUFBa0I7SUFDaEQsT0FBTyxJQUFJLGtCQUFrQixDQUFDO1FBQzVCLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFO1lBQ1AsYUFBYTtZQUNiLElBQUksV0FBVyxDQUFDO2dCQUNkLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxVQUFVO2FBQ2xCLENBQUM7U0FDSDtLQUNGLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFDRCxlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLFNBQVMsRUFBRTtRQUNUO1lBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ2xCLEdBQUcsRUFBRSxRQUFRO1lBQ2IsWUFBWSxFQUFFLGFBQWE7WUFDM0IsV0FBVyxFQUFFLElBQUk7U0FDbEI7S0FDRjtJQUNELHlHQUF5RztJQUN6RyxXQUFXLFlBQUMsVUFBZSxFQUFFLE9BQVk7UUFDdkMsSUFDRSxDQUFDLE9BQU87WUFDUixDQUFDLE9BQU8sQ0FBQyxpQkFBaUI7WUFDMUIsQ0FBQyxPQUFPLENBQUMsbUJBQW1CO1lBQzVCLENBQUMsT0FBTyxDQUFDLGNBQWM7WUFDdkIsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUN2QjtZQUNBLE1BQU0sSUFBSSxLQUFLLENBQ2IseUdBQXlHLENBQzFHLENBQUE7U0FDRjtRQUNELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLElBQUksRUFBRSxDQUFBO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ3hELENBQUM7SUFDRCxHQUFHLFlBQUMsSUFBUyxFQUFFLEtBQVUsRUFBRSxPQUFZO1FBQ3JDLElBQUk7WUFDRixRQUFRLE9BQU8sSUFBSSxFQUFFO2dCQUNuQixLQUFLLFFBQVE7b0JBQ1gsSUFDRSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVM7d0JBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQ25DO3dCQUNBLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7cUJBQzlDO29CQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQzFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7cUJBQzFEO29CQUNELE1BQUs7Z0JBQ1AsS0FBSyxRQUFRO29CQUNYLElBQUksSUFBSSxLQUFLLFlBQVksRUFBRTt3QkFDekIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7NEJBQzdCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO3lCQUMxQjt3QkFDRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQ2hDLEtBQUssR0FBRyxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFBO3lCQUN0QztxQkFDRjtvQkFDRCxNQUFLO2FBQ1I7U0FDRjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNqQjtRQUNELE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDeEQsSUFBSTtZQUNKLEtBQUs7WUFDTCxPQUFPO1NBQ1IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELE1BQU07O1FBQUMsY0FBWTthQUFaLFVBQVksRUFBWixxQkFBWSxFQUFaLElBQVk7WUFBWix5QkFBWTs7UUFDakIsSUFBTSxJQUFJLEdBQUcsQ0FBQSxLQUFBLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQSxDQUFDLElBQUksMEJBQUMsSUFBSSxVQUFLLElBQUksVUFBQyxDQUFBO1FBQzFFLElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFBRTtZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ2xEO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBQ0QsUUFBUTtRQUFSLGlCQTBEQzs7UUF6REMsSUFBTSxVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsc0JBQXNCLDBDQUFFLFVBQVUsQ0FBQTtRQUMxRCxJQUFJLHFCQUF5QyxDQUFBO1FBQzdDLElBQUksY0FBYyxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsc0JBQXNCLDBDQUFFLEdBQUcsS0FBSSxtQkFBbUIsQ0FBQTtRQUM1RSxJQUFJLFVBQVUsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDaEQscUJBQXFCLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7U0FDdkU7YUFBTSxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFO1lBQ3JELHVJQUF1STtZQUN2SSxxQkFBcUIsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsaURBQWlELENBQUMsQ0FFOUQ7WUFBQyxLQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRTtnQkFDbkQsTUFBTSxFQUFFLElBQUk7YUFDYixDQUFDLENBQUE7U0FDSDthQUFNO1lBQ0wscUJBQXFCLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUMzRDtRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztZQUNwQyxnQkFBZ0IsRUFBRTtnQkFDaEIsR0FBRyxFQUFFLGNBQWM7Z0JBQ25CLFVBQVUsRUFBRSxxQkFBcUI7Z0JBQ2pDLG1CQUFtQixFQUFFLFNBQVM7Z0JBQzlCLDRCQUE0QixFQUFFLElBQUk7Z0JBQ2xDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFO2dCQUN0RCxLQUFLLEVBQUU7b0JBQ0w7d0JBQ0UsU0FBUyxFQUFFLFVBQVU7d0JBQ3JCLFNBQVMsRUFBRSxZQUFZO3FCQUN4QjtpQkFDRjtnQkFDRCxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hCLGdHQUFnRztnQkFDaEcsTUFBTSxFQUFFLElBQUksYUFBYSxDQUFDO29CQUN4QixXQUFXLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQzt3QkFDaEMsVUFBVSxFQUFFLHFCQUFxQjt3QkFDakMsS0FBSyxFQUFFLEVBQUU7d0JBQ1QsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsY0FBYyxFQUFFLFVBQUMsRUFBaUI7Z0NBQWYsYUFBYSxtQkFBQTs0QkFDOUIsT0FBTyxLQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztnQ0FDakMsYUFBYSxlQUFBO2dDQUNiLFFBQVEsRUFBRSxLQUFJOzZCQUNmLENBQUMsQ0FBQTt3QkFDSixDQUFDO3FCQUNGLENBQUM7aUJBQ0gsQ0FBQztnQkFDRixJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPLEVBQUUsS0FBSztnQkFDZCxVQUFVLEVBQUUsS0FBSztnQkFDakIsY0FBYyxFQUFFLFNBQVM7Z0JBQ3pCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixTQUFTLEVBQUUsS0FBSztnQkFDaEIsaUJBQWlCLEVBQUUsSUFBSTtnQkFDdkIsMEJBQTBCLEVBQUUsRUFBNkI7Z0JBQ3pELHVCQUF1QixFQUFFLEVBQTZCO2dCQUN0RCxnQkFBZ0IsRUFBRSxFQUFrQjthQUNyQztZQUNELFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNEOztPQUVHO0lBQ0gsZUFBZSxZQUFDLGlCQUFzQjtRQUNwQyxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSx1QkFFaEIsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUNsQixVQUFVLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQztnQkFDakMsT0FBTyxFQUFFO29CQUNQLElBQUksV0FBVyxDQUFDO3dCQUNkLFFBQVEsRUFBRSxTQUFTO3dCQUNuQixLQUFLLEVBQUUsR0FBRzt3QkFDVixJQUFJLEVBQUUsT0FBTztxQkFDZCxDQUFDO2lCQUNIO2dCQUNELElBQUksRUFBRSxLQUFLO2FBQ1osQ0FBQyxLQUVKLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUN0QixDQUFBO1FBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDakMsQ0FBQztJQUNELGFBQWE7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RCxDQUFDO0lBQ0QsTUFBTTtRQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDeEIsQ0FBQztJQUNELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUNELDJCQUEyQixZQUFDLFVBQWU7UUFDekMsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtZQUN2QyxPQUFPLENBQUMsS0FBSyxDQUNYLHFHQUFxRyxDQUN0RyxDQUFBO1NBQ0Y7SUFDSCxDQUFDO0lBQ0QsVUFBVSxZQUFDLFVBQWU7UUFBMUIsaUJBaUNDO1FBaENDLDBFQUEwRTtRQUMxRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyw2Q0FBNkM7UUFDbEcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxRQUFRLENBQ1gsSUFBSSxFQUNKLG1JQUFtSSxFQUNuSTtZQUNFLEtBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQzVCLEtBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDbEMsQ0FBQyxDQUNGLENBQUE7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN2QyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO1FBQ2hFLENBQUMsQ0FBQyxDQUFBO1FBQ0YsbUdBQW1HO1FBQ25HLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNqQyxJQUFJLEtBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssT0FBTyxFQUFFO2dCQUNoQyxJQUFNLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FDbEQsS0FBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FDdkIsQ0FBQTtnQkFDRCxLQUFJLENBQUMsR0FBRyxDQUNOLFlBQVksRUFDWiwwQkFBMEIsQ0FBQyxtQkFBMEIsQ0FBQyxDQUN2RCxDQUFBO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDaEMsaUJBQWlCLEVBQUUsUUFBUTtZQUMzQixRQUFRLEVBQUU7Z0JBQ1IsS0FBSSxDQUFDLHNCQUFzQixFQUFFLENBQUE7WUFDL0IsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxrQkFBa0I7UUFDaEIsSUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQTtRQUNoRCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLEVBQUUsRUFBTixDQUFNLENBQUMsQ0FBQTtRQUM5QyxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLFNBQVMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FDckUsVUFBQyxHQUFHLElBQUssT0FBQSxHQUFHLENBQUMsRUFBRSxFQUFOLENBQU0sQ0FDaEIsQ0FBQTtRQUNELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxHQUFHLENBQ3ZFLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLEVBQUUsRUFBTixDQUFNLENBQ2hCLENBQUE7UUFDRCxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzNDLElBQUksV0FBVyxHQUFHLGVBQWUsQ0FBQTtRQUNqQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbkMsV0FBVyxHQUFHLFNBQVMsQ0FBQTtTQUN4QjtRQUNELElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNyQyxXQUFXLEdBQUcsV0FBVztpQkFDdEIsTUFBTSxDQUFDLGNBQWMsQ0FBQztpQkFDdEIsTUFBTSxDQUFDLFVBQUMsR0FBUSxJQUFLLE9BQUEsR0FBRyxLQUFLLE9BQU8sRUFBZixDQUFlLENBQUMsQ0FBQTtTQUN6QztRQUNELElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN0QyxXQUFXLEdBQUcsV0FBVztpQkFDdEIsTUFBTSxDQUFDLGVBQWUsQ0FBQztpQkFDdkIsTUFBTSxDQUFDLFVBQUMsR0FBUSxJQUFLLE9BQUEsR0FBRyxLQUFLLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO1NBQzFDO1FBQ0QsT0FBTyxXQUFXLENBQUE7SUFDcEIsQ0FBQztJQUNELGVBQWU7UUFDYixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO1lBQ3ZDLGFBQWEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUNoQyxRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFDdkMsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ2hDLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNYLElBQUksRUFDSixTQUFTLEVBQ1QsT0FBTyxFQUNQLFNBQVMsRUFDVCxLQUFLLEVBQ0wsT0FBTyxFQUNQLElBQUksRUFDSixZQUFZLEVBQ1osV0FBVyxFQUNYLG1CQUFtQixDQUNwQixDQUFBO0lBQ0gsQ0FBQztJQUNELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDL0IsQ0FBQztJQUNELHFCQUFxQjtRQUNuQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7U0FDbkI7SUFDSCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0gsMEJBQTBCO1FBQ3hCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDekMsSUFDRSxDQUFDLFVBQVU7WUFDWCxVQUFVLENBQUMsT0FBTyxLQUFLLFNBQVM7WUFDaEMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUMvQjtZQUNBLElBQUksQ0FBQyxHQUFHLENBQ04sWUFBWSxFQUNaLElBQUksa0JBQWtCLENBQUM7Z0JBQ3JCLE9BQU8sRUFBRTtvQkFDUCxJQUFJLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7aUJBQ3BFO2dCQUNELElBQUksRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUNILENBQUE7WUFDRCxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQTtTQUNsQzthQUFNO1lBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1NBQ3ZDO0lBQ0gsQ0FBQztJQUNELHdCQUF3QixZQUFDLE9BQVksRUFBRSxJQUFTO1FBQzlDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFBO1FBQ2pDLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFBO1FBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFDRCxnQkFBZ0IsWUFBQyxPQUFZO1FBQTdCLGlCQStDQztRQTlDQyxJQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFBO1FBQ2hELE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUNoQjtZQUNFLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGVBQWUsRUFBRSxLQUFLO1lBQ3RCLGlCQUFpQixFQUFFLFNBQVM7U0FDN0IsRUFDRCxPQUFPLENBQ1IsQ0FBQTtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRTlDLElBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQTtRQUUvQyxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtZQUM3QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsQ0FBQTtZQUMzRCxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFDNUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDcEQ7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRSxDQUFBO1FBQ25CLHFGQUFxRjtRQUNyRixJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFBO1FBQ2xDLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxTQUFTLEVBQWhCLENBQWdCLENBQUMsQ0FBQyxHQUFHLENBQ3ZFLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEVBQUUsRUFBVCxDQUFTLENBQ3RCLENBQUE7UUFDRCxJQUFNLFdBQVcsR0FBRyxVQUFDLEVBQU8sSUFBSyxPQUFBLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQTtRQUM5RCxJQUFNLFdBQVcsR0FBRyxVQUFDLEVBQU8sSUFBSyxPQUFBLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUE5QixDQUE4QixDQUFBO1FBQy9ELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtZQUMxQixlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7U0FDbkQ7UUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQy9CLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDMUIsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1lBQ2xDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUN4QixPQUFPLEVBQUUsZUFBZTtZQUN4QixjQUFjLEVBQUUsVUFBQyxFQUFzQjtvQkFBcEIsYUFBYSxtQkFBQTtnQkFDOUIsT0FBTyxLQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLGFBQWEsZUFBQSxFQUFFLFFBQVEsRUFBRSxLQUFJLEVBQUUsQ0FBQyxDQUFBO1lBQ3ZFLENBQUM7U0FDRixDQUFDLENBQUE7UUFDRixPQUFPO1lBQ0wsSUFBSSxNQUFBO1lBQ0osZUFBZSxpQkFBQTtZQUNmLFdBQVcsYUFBQTtZQUNYLFdBQVcsYUFBQTtZQUNYLE1BQU0sUUFBQTtZQUNOLGFBQWEsRUFBRSxPQUFPO1NBQ3ZCLENBQUE7SUFDSCxDQUFDO0lBQ0QsOEhBQThIO0lBQzlILHNCQUFzQjtRQUNwQixJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFBO1FBQ2xELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1FBQ2pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1FBQzVELDhHQUE4RztRQUM5RyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUc7WUFDckMsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFO2dCQUNqQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ3BDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ3pDLENBQUM7SUFDRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBQ0QsV0FBVyxZQUFDLE9BQVksRUFBRSxJQUFTO1FBQW5DLGlCQW9GQztRQW5GQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDN0IsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMxQixPQUFNO1NBQ1A7UUFDRCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtRQUN0QixJQUFBLEtBT0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQU5oQyxJQUFJLFVBQUEsRUFDSixlQUFlLHFCQUFBLEVBQ2YsV0FBVyxpQkFBQSxFQUNYLFdBQVcsaUJBQUEsRUFDWCxNQUFNLFlBQUEsRUFDTixhQUFhLG1CQUNtQixDQUFBO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO1FBQ2xCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDMUMsSUFBSSxhQUFhLENBQUMsY0FBYyxFQUFFO1lBQ2hDLGFBQWEsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUE7U0FDOUM7YUFBTSxJQUFJLGFBQWEsQ0FBQyxlQUFlLEVBQUU7WUFDeEMsYUFBYSxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQTtTQUMvQztRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7WUFDL0Msa0JBQWtCLEVBQUUsYUFBYTtZQUNqQyxRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQTtRQUV6RSxrQkFBa0IsQ0FBQztZQUNqQixNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLFNBQVMsRUFDUCxVQUFVLEdBQUcsU0FBUyxHQUFHLGNBQWMsR0FBRyxlQUFlLEdBQUcsR0FBRztTQUNsRSxDQUFDLENBQUE7UUFFRixJQUFNLHNCQUFzQixHQUFHLGVBQWU7YUFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQzthQUNuQixHQUFHLENBQUMsVUFBQyxNQUFXLElBQUssT0FBQSx1QkFDakIsSUFBSSxLQUNQLEdBQUcsRUFBRSxTQUFTLEVBQ2QsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQ2QsS0FBSyxFQUFFLEtBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFDckQsRUFMb0IsQ0FLcEIsQ0FBQyxDQUFBO1FBQ0wsSUFBTSxhQUFhLEdBQUcseUJBQUksc0JBQXNCLFVBQUUsTUFBTSxDQUN0RCxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBdEIsQ0FBc0IsQ0FDbkMsQ0FBQTtRQUNELElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsS0FBSyxFQUFFO1lBQzlDLElBQU0sZ0JBQWdCLHlCQUNqQixJQUFJLEtBQ1AsR0FBRyxFQUFFLFNBQVMsRUFDZCxJQUFJLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFDekMsS0FBSyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLEtBQUssR0FDbEQsQ0FBQTtZQUNELGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtTQUNyQztRQUNELElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUIsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtZQUM1QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQTtZQUMvQixPQUFNO1NBQ1A7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNO1lBQzlDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQSxDQUFDLDJGQUEyRjtZQUNqSCw0QkFBNEI7WUFDNUIsT0FBTyxNQUFNLENBQUMsS0FBSyx1QkFDZCxrQkFBa0IsS0FDckIsbUJBQW1CLEVBQUUsSUFBSSxFQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFDNUIsTUFBTSxFQUFFLEtBQUssRUFDYixRQUFRLEVBQUUsTUFBTSxFQUNoQixXQUFXLEVBQUUsa0JBQWtCLEVBQy9CLE1BQU0sRUFBRSxNQUFNLEVBQ2QsV0FBVyxFQUFFLEtBQUssRUFDbEIsT0FBTyxFQUFFLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUMxRCxPQUFPLFlBQUMsTUFBVyxFQUFFLFFBQWEsRUFBRSxPQUFZO29CQUM5QyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtnQkFDNUIsQ0FBQyxFQUNELEtBQUssWUFBQyxNQUFXLEVBQUUsUUFBYSxFQUFFLE9BQVk7b0JBQzVDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO2dCQUM1QixDQUFDLElBQ0QsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtTQUMzQjtJQUNILENBQUM7SUFDRCxlQUFlLEVBQUUsRUFBRTtJQUNuQixxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFZO1lBQ3hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDM0IsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2pDLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUE7SUFDM0IsQ0FBQztJQUNELFlBQVk7UUFDVixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsTUFBTSxFQUFFLFNBQVM7U0FDbEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELFVBQVUsWUFBQyxPQUFZO1FBQ3JCLElBQU0sU0FBUyxHQUFHLEVBQVMsQ0FBQTtRQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBUTtZQUNwQixJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNqQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTthQUM5QjtRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7U0FDekM7YUFBTTtZQUNMLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1NBQ3hCO0lBQ0gsQ0FBQztJQUNELFFBQVEsWUFBQyxLQUFVO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFDRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFDRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFDRCxxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUE7UUFDM0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDaEMsQ0FBQztJQUNEOztPQUVHO0lBQ0gscUJBQXFCO1FBQ25CLE9BQU8sNkJBQTZCLENBQUM7WUFDbkMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFO1NBQ2pFLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxpQkFBaUI7UUFDZixPQUFPLHlCQUF5QixDQUFDO1lBQy9CLFdBQVcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDdkMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzNCLDBCQUEwQixFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtZQUNoRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7U0FDekIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELGlCQUFpQjtRQUNmLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFBO1FBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFDRCxxQkFBcUI7UUFDbkIsd0ZBQXdGO1FBQ3hGLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7SUFDckMsQ0FBQztJQUNELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFDRCxvQkFBb0I7UUFDbEIsMkZBQTJGO1FBQzNGLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7SUFDakMsQ0FBQztJQUNELGlCQUFpQjtRQUNmLElBQUksQ0FBQyxHQUFHLENBQ04seUJBQXlCLEVBQ3pCLHFDQUFxQyxDQUFDO1lBQ3BDLFdBQVcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDdkMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzNCLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztTQUN6QixDQUFDLENBQ0gsQ0FBQTtRQUNELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFDRCwrQkFBK0I7UUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMxQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUN4QztRQUNELElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFBO0lBQzdDLENBQUM7SUFDRDs7T0FFRztJQUNILG9DQUFvQztRQUNsQyxJQUFJLENBQUMsR0FBRyxDQUNOLHlCQUF5QixFQUN6Qix3Q0FBd0MsQ0FBQztZQUN2QyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ2xDLDBCQUEwQixFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtZQUNoRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzNCLFdBQVcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7U0FDeEMsQ0FBQyxDQUNILENBQUE7SUFDSCxDQUFDO0lBQ0QsYUFBYSxZQUFDLEVBQVU7UUFDdEIsSUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQTtRQUNoRCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsU0FBUyxFQUFoQixDQUFnQixDQUFDLENBQUMsR0FBRyxDQUN2RSxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxFQUFFLEVBQVQsQ0FBUyxDQUN0QixDQUFBO1FBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsb0NBQW9DO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQ04seUJBQXlCLEVBQ3pCLG9DQUFvQyxDQUFDO1lBQ25DLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDbEMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFO1lBQ2hFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDM0IsV0FBVyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtTQUN4QyxDQUFDLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFDRCxtQ0FBbUM7UUFDakMsT0FBTyxtQ0FBbUMsQ0FBQztZQUN6QywwQkFBMEIsRUFBRSxJQUFJLENBQUMsNkJBQTZCLEVBQUU7WUFDaEUsV0FBVyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN2QyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDNUIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELGtEQUFrRDtJQUNsRCxtQkFBbUI7UUFDakIsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFpQixDQUFBO1FBQ3JFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUMsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQTtTQUMxQztRQUNELE9BQU8sZ0JBQWdCLENBQUE7SUFDekIsQ0FBQztJQUNELDZCQUE2QjtRQUMzQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBQ0QsMEJBQTBCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFDRCw2QkFBNkI7UUFDM0IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNyRSxDQUFDO0lBQ0QsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQTtZQUN6RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7U0FDbkI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUdBQWlHLENBQ2xHLENBQUE7U0FDRjtJQUNILENBQUM7SUFDRCwrSEFBK0g7SUFDL0gsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7SUFDbkUsQ0FBQztJQUNELDREQUE0RDtJQUM1RCxpQ0FBaUM7UUFDL0IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ2Y7YUFBTTtZQUNMLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFBO1NBQ2hDO0lBQ0gsQ0FBQztDQUNXLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBRdWVyeVJlc3BvbnNlIGZyb20gJy4vUXVlcnlSZXNwb25zZSdcbmltcG9ydCB7IHBvc3RTaW1wbGVBdWRpdExvZyB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9hdWRpdC9hdWRpdC1lbmRwb2ludCdcbmltcG9ydCBjcWwgZnJvbSAnLi4vY3FsJ1xuaW1wb3J0IF9tZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJ1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG5pbXBvcnQge1xuICBMYXp5UXVlcnlSZXN1bHRzLFxuICBTZWFyY2hTdGF0dXMsXG59IGZyb20gJy4vTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQge1xuICBGaWx0ZXJCdWlsZGVyQ2xhc3MsXG4gIEZpbHRlckNsYXNzLFxuICBpc0ZpbHRlckJ1aWxkZXJDbGFzcyxcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgeyBkb3duZ3JhZGVGaWx0ZXJUcmVlVG9CYXNpYyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9xdWVyeS1iYXNpYy9xdWVyeS1iYXNpYy52aWV3J1xuaW1wb3J0IHtcbiAgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgZ2V0Q29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwLFxuICBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCxcbiAgZ2V0Q29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCxcbiAgaGFzTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgaGFzUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAsXG4gIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlLFxuICBRdWVyeVN0YXJ0QW5kRW5kVHlwZSxcbn0gZnJvbSAnLi9RdWVyeS5tZXRob2RzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uL3dyZXFyJ1xuaW1wb3J0IHsgQ29tbW9uQWpheFNldHRpbmdzIH0gZnJvbSAnLi4vQWpheFNldHRpbmdzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vU3RhcnR1cC9zdGFydHVwJ1xuZXhwb3J0IHR5cGUgUXVlcnlUeXBlID0ge1xuICBjb25zdHJ1Y3RvcjogKF9hdHRyaWJ1dGVzOiBhbnksIG9wdGlvbnM6IGFueSkgPT4gdm9pZFxuICBzZXQ6IChwMTogYW55LCBwMj86IGFueSwgcDM/OiBhbnkpID0+IHZvaWRcbiAgdG9KU09OOiAoKSA9PiBhbnlcbiAgZGVmYXVsdHM6ICgpID0+IGFueVxuICByZXNldFRvRGVmYXVsdHM6IChvdmVycmlkZW5EZWZhdWx0czogYW55KSA9PiB2b2lkXG4gIGFwcGx5RGVmYXVsdHM6ICgpID0+IHZvaWRcbiAgcmV2ZXJ0OiAoKSA9PiB2b2lkXG4gIGlzTG9jYWw6ICgpID0+IGJvb2xlYW5cbiAgX2hhbmRsZURlcHJlY2F0ZWRGZWRlcmF0aW9uOiAoYXR0cmlidXRlczogYW55KSA9PiB2b2lkXG4gIGluaXRpYWxpemU6IChhdHRyaWJ1dGVzOiBhbnkpID0+IHZvaWRcbiAgZ2V0U2VsZWN0ZWRTb3VyY2VzOiAoKSA9PiBBcnJheTxhbnk+XG4gIGJ1aWxkU2VhcmNoRGF0YTogKCkgPT4gYW55XG4gIGlzT3V0ZGF0ZWQ6ICgpID0+IGJvb2xlYW5cbiAgc3RhcnRTZWFyY2hJZk91dGRhdGVkOiAoKSA9PiB2b2lkXG4gIHVwZGF0ZUNxbEJhc2VkT25GaWx0ZXJUcmVlOiAoKSA9PiB2b2lkXG4gIGluaXRpYWxpemVSZXN1bHQ6IChvcHRpb25zPzogYW55KSA9PiB7XG4gICAgZGF0YTogYW55XG4gICAgc2VsZWN0ZWRTb3VyY2VzOiBhbnlcbiAgICBpc0hhcnZlc3RlZDogYW55XG4gICAgaXNGZWRlcmF0ZWQ6IGFueVxuICAgIHJlc3VsdDogYW55XG4gICAgcmVzdWx0T3B0aW9uczogYW55XG4gIH1cbiAgc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlOiAob3B0aW9ucz86IGFueSwgZG9uZT86IGFueSkgPT4gdm9pZFxuICBzdGFydFNlYXJjaDogKG9wdGlvbnM/OiBhbnksIGRvbmU/OiBhbnkpID0+IHZvaWRcbiAgY3VycmVudFNlYXJjaGVzOiBBcnJheTxhbnk+XG4gIGNhbmNlbEN1cnJlbnRTZWFyY2hlczogKCkgPT4gdm9pZFxuICBjbGVhclJlc3VsdHM6ICgpID0+IHZvaWRcbiAgc2V0U291cmNlczogKHNvdXJjZXM6IGFueSkgPT4gdm9pZFxuICBzZXRDb2xvcjogKGNvbG9yOiBhbnkpID0+IHZvaWRcbiAgZ2V0Q29sb3I6ICgpID0+IGFueVxuICBjb2xvcjogKCkgPT4gYW55XG4gIGdldFByZXZpb3VzU2VydmVyUGFnZTogKCkgPT4gdm9pZFxuICBoYXNQcmV2aW91c1NlcnZlclBhZ2U6ICgpID0+IGJvb2xlYW5cbiAgaGFzTmV4dFNlcnZlclBhZ2U6ICgpID0+IGJvb2xlYW5cbiAgZ2V0TmV4dFNlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0SGFzRmlyc3RTZXJ2ZXJQYWdlOiAoKSA9PiBib29sZWFuXG4gIGdldEZpcnN0U2VydmVyUGFnZTogKCkgPT4gdm9pZFxuICBnZXRIYXNMYXN0U2VydmVyUGFnZTogKCkgPT4gYm9vbGVhblxuICBnZXRMYXN0U2VydmVyUGFnZTogKCkgPT4gdm9pZFxuICBnZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogKCkgPT4gSW5kZXhGb3JTb3VyY2VHcm91cFR5cGVcbiAgZ2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXA6ICgpID0+IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gIHJlc2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6ICgpID0+IHZvaWRcbiAgc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb1ByZXZQYWdlOiAoKSA9PiB2b2lkXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9OZXh0UGFnZTogKCkgPT4gdm9pZFxuICBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDogKCkgPT4gUXVlcnlTdGFydEFuZEVuZFR5cGVcbiAgaGFzQ3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6ICgpID0+IGJvb2xlYW5cbiAgZ2V0TW9zdFJlY2VudFN0YXR1czogKCkgPT4gYW55XG4gIGdldExhenlSZXN1bHRzOiAoKSA9PiBMYXp5UXVlcnlSZXN1bHRzXG4gIHVwZGF0ZU1vc3RSZWNlbnRTdGF0dXM6ICgpID0+IHZvaWRcbiAgcmVmZXRjaDogKCkgPT4gdm9pZFxuICBjYW5SZWZldGNoOiAoKSA9PiBib29sZWFuXG4gIFtrZXk6IHN0cmluZ106IGFueVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxpbWl0VG9EZWxldGVkKGNxbEZpbHRlclRyZWU6IGFueSkge1xuICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAgY3FsRmlsdGVyVHJlZSxcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC10YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgfSksXG4gICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICBwcm9wZXJ0eTogJ1wibWV0YWNhcmQuZGVsZXRlZC50YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ3Jlc291cmNlJyxcbiAgICAgIH0pLFxuICAgIF0sXG4gIH0pXG59XG5leHBvcnQgZnVuY3Rpb24gbGltaXRUb0hpc3RvcmljKGNxbEZpbHRlclRyZWU6IGFueSkge1xuICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAgY3FsRmlsdGVyVHJlZSxcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC10YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ3JldmlzaW9uJyxcbiAgICAgIH0pLFxuICAgIF0sXG4gIH0pXG59XG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgcmVsYXRpb25zOiBbXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuT25lLFxuICAgICAga2V5OiAncmVzdWx0JyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogUXVlcnlSZXNwb25zZSxcbiAgICAgIGlzVHJhbnNpZW50OiB0cnVlLFxuICAgIH0sXG4gIF0sXG4gIC8vIG92ZXJyaWRlIGNvbnN0cnVjdG9yIHNsaWdodGx5IHRvIGVuc3VyZSBvcHRpb25zIC8gYXR0cmlidXRlcyBhcmUgYXZhaWxhYmxlIG9uIHRoZSBzZWxmIHJlZiBpbW1lZGlhdGVseVxuICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIGlmIChcbiAgICAgICFvcHRpb25zIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1EZWZhdWx0cyB8fFxuICAgICAgIW9wdGlvbnMudHJhbnNmb3JtRmlsdGVyVHJlZSB8fFxuICAgICAgIW9wdGlvbnMudHJhbnNmb3JtU29ydHMgfHxcbiAgICAgICFvcHRpb25zLnRyYW5zZm9ybUNvdW50XG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdPcHRpb25zIGZvciB0cmFuc2Zvcm1EZWZhdWx0cywgdHJhbnNmb3JtRmlsdGVyVHJlZSwgdHJhbnNmb3JtU29ydHMsIGFuZCB0cmFuc2Zvcm1Db3VudCBtdXN0IGJlIHByb3ZpZGVkJ1xuICAgICAgKVxuICAgIH1cbiAgICB0aGlzLl9jb25zdHJ1Y3RvckF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHJldHVybiBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9LFxuICBzZXQoZGF0YTogYW55LCB2YWx1ZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICB0cnkge1xuICAgICAgc3dpdGNoICh0eXBlb2YgZGF0YSkge1xuICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGRhdGEuZmlsdGVyVHJlZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICB0eXBlb2YgZGF0YS5maWx0ZXJUcmVlID09PSAnc3RyaW5nJ1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgZGF0YS5maWx0ZXJUcmVlID0gSlNPTi5wYXJzZShkYXRhLmZpbHRlclRyZWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoZGF0YS5maWx0ZXJUcmVlKSkge1xuICAgICAgICAgICAgZGF0YS5maWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhkYXRhLmZpbHRlclRyZWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgaWYgKGRhdGEgPT09ICdmaWx0ZXJUcmVlJykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0ZpbHRlckJ1aWxkZXJDbGFzcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICB9XG4gICAgcmV0dXJuIEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5wcm90b3R5cGUuc2V0LmFwcGx5KHRoaXMsIFtcbiAgICAgIGRhdGEsXG4gICAgICB2YWx1ZSxcbiAgICAgIG9wdGlvbnMsXG4gICAgXSlcbiAgfSxcbiAgdG9KU09OKC4uLmFyZ3M6IGFueSkge1xuICAgIGNvbnN0IGpzb24gPSBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMsIC4uLmFyZ3MpXG4gICAgaWYgKHR5cGVvZiBqc29uLmZpbHRlclRyZWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBqc29uLmZpbHRlclRyZWUgPSBKU09OLnN0cmluZ2lmeShqc29uLmZpbHRlclRyZWUpXG4gICAgfVxuICAgIHJldHVybiBqc29uXG4gIH0sXG4gIGRlZmF1bHRzKCkge1xuICAgIGNvbnN0IGZpbHRlclRyZWUgPSB0aGlzLl9jb25zdHJ1Y3RvckF0dHJpYnV0ZXM/LmZpbHRlclRyZWVcbiAgICBsZXQgY29uc3RydWN0ZWRGaWx0ZXJUcmVlOiBGaWx0ZXJCdWlsZGVyQ2xhc3NcbiAgICBsZXQgY29uc3RydWN0ZWRDcWwgPSB0aGlzLl9jb25zdHJ1Y3RvckF0dHJpYnV0ZXM/LmNxbCB8fCBcImFueVRleHQgSUxJS0UgJyonXCJcbiAgICBpZiAoZmlsdGVyVHJlZSAmJiB0eXBlb2YgZmlsdGVyVHJlZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0cnVjdGVkRmlsdGVyVHJlZSA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3MoSlNPTi5wYXJzZShmaWx0ZXJUcmVlKSlcbiAgICB9IGVsc2UgaWYgKCFmaWx0ZXJUcmVlIHx8IGZpbHRlclRyZWUuaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gd2hlbiB3ZSBtYWtlIGRyYXN0aWMgY2hhbmdlcyB0byBmaWx0ZXIgdHJlZSBpdCB3aWxsIGJlIG5lY2Vzc2FyeSB0byBmYWxsIGJhY2sgdG8gY3FsIGFuZCByZWNvbnN0cnVjdCBhIGZpbHRlciB0cmVlIHRoYXQncyBjb21wYXRpYmxlXG4gICAgICBjb25zdHJ1Y3RlZEZpbHRlclRyZWUgPSBjcWwucmVhZChjb25zdHJ1Y3RlZENxbClcbiAgICAgIGNvbnNvbGUud2FybignbWlncmF0aW5nIGEgZmlsdGVyIHRyZWUgdG8gdGhlIGxhdGVzdCBzdHJ1Y3R1cmUnKVxuICAgICAgLy8gYWxsb3cgZG93bnN0cmVhbSBwcm9qZWN0cyB0byBoYW5kbGUgaG93IHRoZXkgd2FudCB0byBpbmZvcm0gdXNlcnMgb2YgbWlncmF0aW9uc1xuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignZmlsdGVyVHJlZTptaWdyYXRpb24nLCB7XG4gICAgICAgIHNlYXJjaDogdGhpcyxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0cnVjdGVkRmlsdGVyVHJlZSA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3MoZmlsdGVyVHJlZSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1EZWZhdWx0cyh7XG4gICAgICBvcmlnaW5hbERlZmF1bHRzOiB7XG4gICAgICAgIGNxbDogY29uc3RydWN0ZWRDcWwsXG4gICAgICAgIGZpbHRlclRyZWU6IGNvbnN0cnVjdGVkRmlsdGVyVHJlZSxcbiAgICAgICAgYXNzb2NpYXRlZEZvcm1Nb2RlbDogdW5kZWZpbmVkLFxuICAgICAgICBleGNsdWRlVW5uZWNlc3NhcnlBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBjb3VudDogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFJlc3VsdENvdW50KCksXG4gICAgICAgIHNvcnRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgYXR0cmlidXRlOiAnbW9kaWZpZWQnLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAnZGVzY2VuZGluZycsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc291cmNlczogWydhbGwnXSxcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGlzIGhlcmUgc28gd2UgY2FuIGF2b2lkIGNyZWF0aW5nIHNwdXJpb3VzIHJlZmVyZW5jZXMgdG8gTGF6eVF1ZXJ5UmVzdWx0cyBvYmplY3RzXG4gICAgICAgIHJlc3VsdDogbmV3IFF1ZXJ5UmVzcG9uc2Uoe1xuICAgICAgICAgIGxhenlSZXN1bHRzOiBuZXcgTGF6eVF1ZXJ5UmVzdWx0cyh7XG4gICAgICAgICAgICBmaWx0ZXJUcmVlOiBjb25zdHJ1Y3RlZEZpbHRlclRyZWUsXG4gICAgICAgICAgICBzb3J0czogW10sXG4gICAgICAgICAgICBzb3VyY2VzOiBbXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybVNvcnRzOiAoeyBvcmlnaW5hbFNvcnRzIH0pID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyh7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxTb3J0cyxcbiAgICAgICAgICAgICAgICBxdWVyeVJlZjogdGhpcyxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGlzTG9jYWw6IGZhbHNlLFxuICAgICAgICBpc091dGRhdGVkOiBmYWxzZSxcbiAgICAgICAgJ2RldGFpbC1sZXZlbCc6IHVuZGVmaW5lZCxcbiAgICAgICAgc3BlbGxjaGVjazogZmFsc2UsXG4gICAgICAgIHBob25ldGljczogZmFsc2UsXG4gICAgICAgIGFkZGl0aW9uYWxPcHRpb25zOiAne30nLFxuICAgICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30gYXMgSW5kZXhGb3JTb3VyY2VHcm91cFR5cGUsXG4gICAgICAgIG5leHRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSxcbiAgICAgICAgbW9zdFJlY2VudFN0YXR1czoge30gYXMgU2VhcmNoU3RhdHVzLFxuICAgICAgfSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gIH0sXG4gIC8qKlxuICAgKiAgQWRkIGZpbHRlclRyZWUgaW4gaGVyZSwgc2luY2UgaW5pdGlhbGl6ZSBpcyBvbmx5IHJ1biBvbmNlIChhbmQgZGVmYXVsdHMgY2FuJ3QgaGF2ZSBmaWx0ZXJUcmVlKVxuICAgKi9cbiAgcmVzZXRUb0RlZmF1bHRzKG92ZXJyaWRlbkRlZmF1bHRzOiBhbnkpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IF8ub21pdChcbiAgICAgIHtcbiAgICAgICAgLi4udGhpcy5kZWZhdWx0cygpLFxuICAgICAgICBmaWx0ZXJUcmVlOiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgICAgWydpc0xvY2FsJywgJ3Jlc3VsdCddXG4gICAgKVxuICAgIHRoaXMuc2V0KF9tZXJnZShkZWZhdWx0cywgb3ZlcnJpZGVuRGVmYXVsdHMpKVxuICAgIHRoaXMudHJpZ2dlcigncmVzZXRUb0RlZmF1bHRzJylcbiAgfSxcbiAgYXBwbHlEZWZhdWx0cygpIHtcbiAgICB0aGlzLnNldChfLnBpY2sodGhpcy5kZWZhdWx0cygpLCBbJ3NvcnRzJywgJ3NvdXJjZXMnXSkpXG4gIH0sXG4gIHJldmVydCgpIHtcbiAgICB0aGlzLnRyaWdnZXIoJ3JldmVydCcpXG4gIH0sXG4gIGlzTG9jYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpc0xvY2FsJylcbiAgfSxcbiAgX2hhbmRsZURlcHJlY2F0ZWRGZWRlcmF0aW9uKGF0dHJpYnV0ZXM6IGFueSkge1xuICAgIGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuZmVkZXJhdGlvbikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ0F0dGVtcHQgdG8gc2V0IGZlZGVyYXRpb24gb24gYSBzZWFyY2guICBUaGlzIGF0dHJpYnV0ZSBpcyBkZXByZWNhdGVkLiAgRGlkIHlvdSBtZWFuIHRvIHNldCBzb3VyY2VzPydcbiAgICAgIClcbiAgICB9XG4gIH0sXG4gIGluaXRpYWxpemUoYXR0cmlidXRlczogYW55KSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI3NjkpIEZJWE1FOiBObyBvdmVybG9hZCBtYXRjaGVzIHRoaXMgY2FsbC5cbiAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpIC8vIHVuZGVyc2NvcmUgYmluZEFsbCBkb2VzIG5vdCB0YWtlIGFycmF5IGFyZ1xuICAgIHRoaXMuX2hhbmRsZURlcHJlY2F0ZWRGZWRlcmF0aW9uKGF0dHJpYnV0ZXMpXG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMsXG4gICAgICAnY2hhbmdlOmNxbCBjaGFuZ2U6ZmlsdGVyVHJlZSBjaGFuZ2U6c291cmNlcyBjaGFuZ2U6c29ydHMgY2hhbmdlOnNwZWxsY2hlY2sgY2hhbmdlOnBob25ldGljcyBjaGFuZ2U6Y291bnQgY2hhbmdlOmFkZGl0aW9uYWxPcHRpb25zJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXQoJ2lzT3V0ZGF0ZWQnLCB0cnVlKVxuICAgICAgICB0aGlzLnNldCgnbW9zdFJlY2VudFN0YXR1cycsIHt9KVxuICAgICAgfVxuICAgIClcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6ZmlsdGVyVHJlZScsICgpID0+IHtcbiAgICAgIHRoaXMuZ2V0TGF6eVJlc3VsdHMoKS5fcmVzZXRGaWx0ZXJUcmVlKHRoaXMuZ2V0KCdmaWx0ZXJUcmVlJykpXG4gICAgfSlcbiAgICAvLyBiYXNpY2FsbHkgcmVtb3ZlIGludmFsaWQgZmlsdGVycyB3aGVuIGdvaW5nIGZyb20gYmFzaWMgdG8gYWR2YW5jZWQsIGFuZCBtYWtlIGl0IGJhc2ljIGNvbXBhdGlibGVcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6dHlwZScsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmdldCgndHlwZScpID09PSAnYmFzaWMnKSB7XG4gICAgICAgIGNvbnN0IGNsZWFuZWRVcEZpbHRlclRyZWUgPSBjcWwucmVtb3ZlSW52YWxpZEZpbHRlcnMoXG4gICAgICAgICAgdGhpcy5nZXQoJ2ZpbHRlclRyZWUnKVxuICAgICAgICApXG4gICAgICAgIHRoaXMuc2V0KFxuICAgICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgICBkb3duZ3JhZGVGaWx0ZXJUcmVlVG9CYXNpYyhjbGVhbmVkVXBGaWx0ZXJUcmVlIGFzIGFueSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLnN1YnNjcmliZVRvKHtcbiAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnc3RhdHVzJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlTW9zdFJlY2VudFN0YXR1cygpXG4gICAgICB9LFxuICAgIH0pXG4gIH0sXG4gIGdldFNlbGVjdGVkU291cmNlcygpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBjb25zdCBzb3VyY2VJZHMgPSBTb3VyY2VzLm1hcCgoc3JjKSA9PiBzcmMuaWQpXG4gICAgY29uc3QgbG9jYWxTb3VyY2VJZHMgPSBTb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2UuaGFydmVzdGVkKS5tYXAoXG4gICAgICAoc3JjKSA9PiBzcmMuaWRcbiAgICApXG4gICAgY29uc3QgcmVtb3RlU291cmNlSWRzID0gU291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gIXNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzcmMpID0+IHNyYy5pZFxuICAgIClcbiAgICBjb25zdCBzZWxlY3RlZFNvdXJjZXMgPSB0aGlzLmdldCgnc291cmNlcycpXG4gICAgbGV0IHNvdXJjZUFycmF5ID0gc2VsZWN0ZWRTb3VyY2VzXG4gICAgaWYgKHNlbGVjdGVkU291cmNlcy5pbmNsdWRlcygnYWxsJykpIHtcbiAgICAgIHNvdXJjZUFycmF5ID0gc291cmNlSWRzXG4gICAgfVxuICAgIGlmIChzZWxlY3RlZFNvdXJjZXMuaW5jbHVkZXMoJ2xvY2FsJykpIHtcbiAgICAgIHNvdXJjZUFycmF5ID0gc291cmNlQXJyYXlcbiAgICAgICAgLmNvbmNhdChsb2NhbFNvdXJjZUlkcylcbiAgICAgICAgLmZpbHRlcigoc3JjOiBhbnkpID0+IHNyYyAhPT0gJ2xvY2FsJylcbiAgICB9XG4gICAgaWYgKHNlbGVjdGVkU291cmNlcy5pbmNsdWRlcygncmVtb3RlJykpIHtcbiAgICAgIHNvdXJjZUFycmF5ID0gc291cmNlQXJyYXlcbiAgICAgICAgLmNvbmNhdChyZW1vdGVTb3VyY2VJZHMpXG4gICAgICAgIC5maWx0ZXIoKHNyYzogYW55KSA9PiBzcmMgIT09ICdyZW1vdGUnKVxuICAgIH1cbiAgICByZXR1cm4gc291cmNlQXJyYXlcbiAgfSxcbiAgYnVpbGRTZWFyY2hEYXRhKCkge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnRvSlNPTigpXG4gICAgZGF0YS5zb3VyY2VzID0gdGhpcy5nZXRTZWxlY3RlZFNvdXJjZXMoKVxuICAgIGRhdGEuY291bnQgPSB0aGlzLm9wdGlvbnMudHJhbnNmb3JtQ291bnQoe1xuICAgICAgb3JpZ2luYWxDb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgICBxdWVyeVJlZjogdGhpcyxcbiAgICB9KVxuICAgIGRhdGEuc29ydHMgPSB0aGlzLm9wdGlvbnMudHJhbnNmb3JtU29ydHMoe1xuICAgICAgb3JpZ2luYWxTb3J0czogdGhpcy5nZXQoJ3NvcnRzJyksXG4gICAgICBxdWVyeVJlZjogdGhpcyxcbiAgICB9KVxuICAgIHJldHVybiBfLnBpY2soXG4gICAgICBkYXRhLFxuICAgICAgJ3NvdXJjZXMnLFxuICAgICAgJ2NvdW50JyxcbiAgICAgICd0aW1lb3V0JyxcbiAgICAgICdjcWwnLFxuICAgICAgJ3NvcnRzJyxcbiAgICAgICdpZCcsXG4gICAgICAnc3BlbGxjaGVjaycsXG4gICAgICAncGhvbmV0aWNzJyxcbiAgICAgICdhZGRpdGlvbmFsT3B0aW9ucydcbiAgICApXG4gIH0sXG4gIGlzT3V0ZGF0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpc091dGRhdGVkJylcbiAgfSxcbiAgc3RhcnRTZWFyY2hJZk91dGRhdGVkKCkge1xuICAgIGlmICh0aGlzLmlzT3V0ZGF0ZWQoKSkge1xuICAgICAgdGhpcy5zdGFydFNlYXJjaCgpXG4gICAgfVxuICB9LFxuICAvKipcbiAgICogV2Ugb25seSBrZWVwIGZpbHRlclRyZWUgdXAgdG8gZGF0ZSwgdGhlbiB3aGVuIHdlIGludGVyYWN0IHdpdGggdGhlIHNlcnZlciB3ZSB3cml0ZSBvdXQgd2hhdCBpdCBtZWFuc1xuICAgKlxuICAgKiBXZSBkbyB0aGlzIGZvciBwZXJmb3JtYW5jZSwgYW5kIGJlY2F1c2UgdHJhbnNmb3JtYXRpb24gaXMgbG9zc3kuXG4gICAqXG4gICAqIEFsc28gbm90aWNlIHRoYXQgd2UgZG8gYSBzbGlnaHQgYml0IG9mIHZhbGlkYXRpb24sIHNvIGFueXRoaW5nIHRoYXQgaGFzIG5vIGZpbHRlcnMgd2lsbCB0cmFuc2xhdGUgdG8gYSBzdGFyIHF1ZXJ5IChldmVyeXRoaW5nKVxuICAgKi9cbiAgdXBkYXRlQ3FsQmFzZWRPbkZpbHRlclRyZWUoKSB7XG4gICAgY29uc3QgZmlsdGVyVHJlZSA9IHRoaXMuZ2V0KCdmaWx0ZXJUcmVlJylcbiAgICBpZiAoXG4gICAgICAhZmlsdGVyVHJlZSB8fFxuICAgICAgZmlsdGVyVHJlZS5maWx0ZXJzID09PSB1bmRlZmluZWQgfHxcbiAgICAgIGZpbHRlclRyZWUuZmlsdGVycy5sZW5ndGggPT09IDBcbiAgICApIHtcbiAgICAgIHRoaXMuc2V0KFxuICAgICAgICAnZmlsdGVyVHJlZScsXG4gICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7IHZhbHVlOiAnKicsIHByb3BlcnR5OiAnYW55VGV4dCcsIHR5cGU6ICdJTElLRScgfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIHRoaXMudXBkYXRlQ3FsQmFzZWRPbkZpbHRlclRyZWUoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldCgnY3FsJywgY3FsLndyaXRlKGZpbHRlclRyZWUpKVxuICAgIH1cbiAgfSxcbiAgc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKG9wdGlvbnM6IGFueSwgZG9uZTogYW55KSB7XG4gICAgdGhpcy51cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpXG4gICAgdGhpcy5yZXNldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKG9wdGlvbnMsIGRvbmUpXG4gIH0sXG4gIGluaXRpYWxpemVSZXN1bHQob3B0aW9uczogYW55KSB7XG4gICAgY29uc3QgU291cmNlcyA9IFN0YXJ0dXBEYXRhU3RvcmUuU291cmNlcy5zb3VyY2VzXG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAge1xuICAgICAgICBsaW1pdFRvRGVsZXRlZDogZmFsc2UsXG4gICAgICAgIGxpbWl0VG9IaXN0b3JpYzogZmFsc2UsXG4gICAgICAgIGFkZGl0aW9uYWxPcHRpb25zOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgb3B0aW9uc1xuICAgIClcbiAgICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZCh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXG5cbiAgICBjb25zdCBkYXRhID0gX2Nsb25lRGVlcCh0aGlzLmJ1aWxkU2VhcmNoRGF0YSgpKVxuXG4gICAgaWYgKG9wdGlvbnMuYWRkaXRpb25hbE9wdGlvbnMpIHtcbiAgICAgIGxldCBvcHRpb25zT2JqID0gSlNPTi5wYXJzZShkYXRhLmFkZGl0aW9uYWxPcHRpb25zIHx8ICd7fScpXG4gICAgICBvcHRpb25zT2JqID0gXy5leHRlbmQob3B0aW9uc09iaiwgb3B0aW9ucy5hZGRpdGlvbmFsT3B0aW9ucylcbiAgICAgIGRhdGEuYWRkaXRpb25hbE9wdGlvbnMgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zT2JqKVxuICAgIH1cbiAgICBkYXRhLmJhdGNoSWQgPSB2NCgpXG4gICAgLy8gRGF0YS5zb3VyY2VzIGlzIHNldCBpbiBgYnVpbGRTZWFyY2hEYXRhYCBiYXNlZCBvbiB3aGljaCBzb3VyY2VzIHlvdSBoYXZlIHNlbGVjdGVkLlxuICAgIGxldCBzZWxlY3RlZFNvdXJjZXMgPSBkYXRhLnNvdXJjZXNcbiAgICBjb25zdCBoYXJ2ZXN0ZWRTb3VyY2VzID0gU291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNvdXJjZSkgPT4gc291cmNlLmlkXG4gICAgKVxuICAgIGNvbnN0IGlzSGFydmVzdGVkID0gKGlkOiBhbnkpID0+IGhhcnZlc3RlZFNvdXJjZXMuaW5jbHVkZXMoaWQpXG4gICAgY29uc3QgaXNGZWRlcmF0ZWQgPSAoaWQ6IGFueSkgPT4gIWhhcnZlc3RlZFNvdXJjZXMuaW5jbHVkZXMoaWQpXG4gICAgaWYgKG9wdGlvbnMubGltaXRUb0RlbGV0ZWQpIHtcbiAgICAgIHNlbGVjdGVkU291cmNlcyA9IGRhdGEuc291cmNlcy5maWx0ZXIoaXNIYXJ2ZXN0ZWQpXG4gICAgfVxuICAgIGxldCByZXN1bHQgPSB0aGlzLmdldCgncmVzdWx0JylcbiAgICB0aGlzLmdldExhenlSZXN1bHRzKCkucmVzZXQoe1xuICAgICAgZmlsdGVyVHJlZTogdGhpcy5nZXQoJ2ZpbHRlclRyZWUnKSxcbiAgICAgIHNvcnRzOiB0aGlzLmdldCgnc29ydHMnKSxcbiAgICAgIHNvdXJjZXM6IHNlbGVjdGVkU291cmNlcyxcbiAgICAgIHRyYW5zZm9ybVNvcnRzOiAoeyBvcmlnaW5hbFNvcnRzIH06IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybVNvcnRzKHsgb3JpZ2luYWxTb3J0cywgcXVlcnlSZWY6IHRoaXMgfSlcbiAgICAgIH0sXG4gICAgfSlcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YSxcbiAgICAgIHNlbGVjdGVkU291cmNlcyxcbiAgICAgIGlzSGFydmVzdGVkLFxuICAgICAgaXNGZWRlcmF0ZWQsXG4gICAgICByZXN1bHQsXG4gICAgICByZXN1bHRPcHRpb25zOiBvcHRpb25zLFxuICAgIH1cbiAgfSxcbiAgLy8gd2UgbmVlZCBhdCBsZWFzdCBvbmUgc3RhdHVzIGZvciB0aGUgc2VhcmNoIHRvIGJlIGFibGUgdG8gY29ycmVjdGx5IHBhZ2UgdGhpbmdzLCB0ZWNobmljYWxseSB3ZSBjb3VsZCBqdXN0IHVzZSB0aGUgZmlyc3Qgb25lXG4gIHVwZGF0ZU1vc3RSZWNlbnRTdGF0dXMoKSB7XG4gICAgY29uc3QgY3VycmVudFN0YXR1cyA9IHRoaXMuZ2V0TGF6eVJlc3VsdHMoKS5zdGF0dXNcbiAgICBjb25zdCBwcmV2aW91c1N0YXR1cyA9IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpXG4gICAgY29uc3QgbmV3U3RhdHVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwcmV2aW91c1N0YXR1cykpXG4gICAgLy8gY29tcGFyZSBlYWNoIGtleSBhbmQgb3ZlcndyaXRlIG9ubHkgd2hlbiB0aGUgbmV3IHN0YXR1cyBpcyBzdWNjZXNzZnVsIC0gd2UgbmVlZCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIHRvIHBhZ2VcbiAgICBPYmplY3Qua2V5cyhjdXJyZW50U3RhdHVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChjdXJyZW50U3RhdHVzW2tleV0uc3VjY2Vzc2Z1bCkge1xuICAgICAgICBuZXdTdGF0dXNba2V5XSA9IGN1cnJlbnRTdGF0dXNba2V5XVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5zZXQoJ21vc3RSZWNlbnRTdGF0dXMnLCBuZXdTdGF0dXMpXG4gIH0sXG4gIGdldExhenlSZXN1bHRzKCk6IExhenlRdWVyeVJlc3VsdHMge1xuICAgIHJldHVybiB0aGlzLmdldCgncmVzdWx0JykuZ2V0KCdsYXp5UmVzdWx0cycpXG4gIH0sXG4gIHN0YXJ0U2VhcmNoKG9wdGlvbnM6IGFueSwgZG9uZTogYW55KSB7XG4gICAgdGhpcy50cmlnZ2VyKCdwYW5Ub1NoYXBlc0V4dGVudCcpXG4gICAgdGhpcy5zZXQoJ2lzT3V0ZGF0ZWQnLCBmYWxzZSlcbiAgICBpZiAodGhpcy5nZXQoJ2NxbCcpID09PSAnJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICBjb25zdCB7XG4gICAgICBkYXRhLFxuICAgICAgc2VsZWN0ZWRTb3VyY2VzLFxuICAgICAgaXNIYXJ2ZXN0ZWQsXG4gICAgICBpc0ZlZGVyYXRlZCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHJlc3VsdE9wdGlvbnMsXG4gICAgfSA9IHRoaXMuaW5pdGlhbGl6ZVJlc3VsdChvcHRpb25zKVxuICAgIGRhdGEuZnJvbVVJID0gdHJ1ZVxuICAgIGxldCBjcWxGaWx0ZXJUcmVlID0gdGhpcy5nZXQoJ2ZpbHRlclRyZWUnKVxuICAgIGlmIChyZXN1bHRPcHRpb25zLmxpbWl0VG9EZWxldGVkKSB7XG4gICAgICBjcWxGaWx0ZXJUcmVlID0gbGltaXRUb0RlbGV0ZWQoY3FsRmlsdGVyVHJlZSlcbiAgICB9IGVsc2UgaWYgKHJlc3VsdE9wdGlvbnMubGltaXRUb0hpc3RvcmljKSB7XG4gICAgICBjcWxGaWx0ZXJUcmVlID0gbGltaXRUb0hpc3RvcmljKGNxbEZpbHRlclRyZWUpXG4gICAgfVxuICAgIGxldCBjcWxTdHJpbmcgPSB0aGlzLm9wdGlvbnMudHJhbnNmb3JtRmlsdGVyVHJlZSh7XG4gICAgICBvcmlnaW5hbEZpbHRlclRyZWU6IGNxbEZpbHRlclRyZWUsXG4gICAgICBxdWVyeVJlZjogdGhpcyxcbiAgICB9KVxuICAgIHRoaXMuc2V0KCdjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCcsIHRoaXMuZ2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXAoKSlcblxuICAgIHBvc3RTaW1wbGVBdWRpdExvZyh7XG4gICAgICBhY3Rpb246ICdTRUFSQ0hfU1VCTUlUVEVEJyxcbiAgICAgIGNvbXBvbmVudDpcbiAgICAgICAgJ3F1ZXJ5OiBbJyArIGNxbFN0cmluZyArICddIHNvdXJjZXM6IFsnICsgc2VsZWN0ZWRTb3VyY2VzICsgJ10nLFxuICAgIH0pXG5cbiAgICBjb25zdCBmZWRlcmF0ZWRTZWFyY2hlc1RvUnVuID0gc2VsZWN0ZWRTb3VyY2VzXG4gICAgICAuZmlsdGVyKGlzRmVkZXJhdGVkKVxuICAgICAgLm1hcCgoc291cmNlOiBhbnkpID0+ICh7XG4gICAgICAgIC4uLmRhdGEsXG4gICAgICAgIGNxbDogY3FsU3RyaW5nLFxuICAgICAgICBzcmNzOiBbc291cmNlXSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0KCdjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCcpW3NvdXJjZV0sXG4gICAgICB9KSlcbiAgICBjb25zdCBzZWFyY2hlc1RvUnVuID0gWy4uLmZlZGVyYXRlZFNlYXJjaGVzVG9SdW5dLmZpbHRlcihcbiAgICAgIChzZWFyY2gpID0+IHNlYXJjaC5zcmNzLmxlbmd0aCA+IDBcbiAgICApXG4gICAgaWYgKHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKS5sb2NhbCkge1xuICAgICAgY29uc3QgbG9jYWxTZWFyY2hUb1J1biA9IHtcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgY3FsOiBjcWxTdHJpbmcsXG4gICAgICAgIHNyY3M6IHNlbGVjdGVkU291cmNlcy5maWx0ZXIoaXNIYXJ2ZXN0ZWQpLFxuICAgICAgICBzdGFydDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLmxvY2FsLFxuICAgICAgfVxuICAgICAgc2VhcmNoZXNUb1J1bi5wdXNoKGxvY2FsU2VhcmNoVG9SdW4pXG4gICAgfVxuICAgIGlmIChzZWFyY2hlc1RvUnVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gcmVzZXQgdG8gYWxsIGFuZCBydW5cbiAgICAgIHRoaXMuc2V0KCdzb3VyY2VzJywgWydhbGwnXSlcbiAgICAgIHRoaXMuc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRTZWFyY2hlcyA9IHNlYXJjaGVzVG9SdW4ubWFwKChzZWFyY2gpID0+IHtcbiAgICAgIGRlbGV0ZSBzZWFyY2guc291cmNlcyAvLyBUaGlzIGtleSBpc24ndCB1c2VkIG9uIHRoZSBiYWNrZW5kIGFuZCBvbmx5IHNlcnZlcyB0byBjb25mdXNlIHRob3NlIGRlYnVnZ2luZyB0aGlzIGNvZGUuXG4gICAgICAvLyBgcmVzdWx0YCBpcyBRdWVyeVJlc3BvbnNlXG4gICAgICByZXR1cm4gcmVzdWx0LmZldGNoKHtcbiAgICAgICAgLi4uQ29tbW9uQWpheFNldHRpbmdzLFxuICAgICAgICBjdXN0b21FcnJvckhhbmRsaW5nOiB0cnVlLFxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShzZWFyY2gpLFxuICAgICAgICByZW1vdmU6IGZhbHNlLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICB0aW1lb3V0OiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0U2VhcmNoVGltZW91dCgpLFxuICAgICAgICBzdWNjZXNzKF9tb2RlbDogYW55LCByZXNwb25zZTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICAgICAgICByZXNwb25zZS5vcHRpb25zID0gb3B0aW9uc1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcihfbW9kZWw6IGFueSwgcmVzcG9uc2U6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgICAgcmVzcG9uc2Uub3B0aW9ucyA9IG9wdGlvbnNcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpZiAodHlwZW9mIGRvbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGRvbmUodGhpcy5jdXJyZW50U2VhcmNoZXMpXG4gICAgfVxuICB9LFxuICBjdXJyZW50U2VhcmNoZXM6IFtdLFxuICBjYW5jZWxDdXJyZW50U2VhcmNoZXMoKSB7XG4gICAgdGhpcy5jdXJyZW50U2VhcmNoZXMuZm9yRWFjaCgocmVxdWVzdDogYW55KSA9PiB7XG4gICAgICByZXF1ZXN0LmFib3J0KCdDYW5jZWxlZCcpXG4gICAgfSlcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmdldCgncmVzdWx0JylcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB0aGlzLmdldExhenlSZXN1bHRzKCkuY2FuY2VsKClcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50U2VhcmNoZXMgPSBbXVxuICB9LFxuICBjbGVhclJlc3VsdHMoKSB7XG4gICAgdGhpcy5jYW5jZWxDdXJyZW50U2VhcmNoZXMoKVxuICAgIHRoaXMuc2V0KHtcbiAgICAgIHJlc3VsdDogdW5kZWZpbmVkLFxuICAgIH0pXG4gIH0sXG4gIHNldFNvdXJjZXMoc291cmNlczogYW55KSB7XG4gICAgY29uc3Qgc291cmNlQXJyID0gW10gYXMgYW55XG4gICAgc291cmNlcy5lYWNoKChzcmM6IGFueSkgPT4ge1xuICAgICAgaWYgKHNyYy5nZXQoJ2F2YWlsYWJsZScpID09PSB0cnVlKSB7XG4gICAgICAgIHNvdXJjZUFyci5wdXNoKHNyYy5nZXQoJ2lkJykpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAoc291cmNlQXJyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0KCdzb3VyY2VzJywgc291cmNlQXJyLmpvaW4oJywnKSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXQoJ3NvdXJjZXMnLCAnJylcbiAgICB9XG4gIH0sXG4gIHNldENvbG9yKGNvbG9yOiBhbnkpIHtcbiAgICB0aGlzLnNldCgnY29sb3InLCBjb2xvcilcbiAgfSxcbiAgZ2V0Q29sb3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb2xvcicpXG4gIH0sXG4gIGNvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY29sb3InKVxuICB9LFxuICBnZXRQcmV2aW91c1NlcnZlclBhZ2UoKSB7XG4gICAgdGhpcy5zZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvUHJldlBhZ2UoKVxuICAgIHRoaXMuc3RhcnRTZWFyY2godGhpcy5vcHRpb25zKVxuICB9LFxuICAvKipcbiAgICogTXVjaCBzaW1wbGVyIHRoYW4gc2VlaW5nIGlmIGEgbmV4dCBwYWdlIGV4aXN0c1xuICAgKi9cbiAgaGFzUHJldmlvdXNTZXJ2ZXJQYWdlKCkge1xuICAgIHJldHVybiBoYXNQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgIH0pXG4gIH0sXG4gIGhhc05leHRTZXJ2ZXJQYWdlKCkge1xuICAgIHJldHVybiBoYXNOZXh0UGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgIGlzTG9jYWw6IHRoaXMuaXNMb2NhbFNvdXJjZSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCksXG4gICAgICBjb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgfSlcbiAgfSxcbiAgZ2V0TmV4dFNlcnZlclBhZ2UoKSB7XG4gICAgdGhpcy5zZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvTmV4dFBhZ2UoKVxuICAgIHRoaXMuc3RhcnRTZWFyY2godGhpcy5vcHRpb25zKVxuICB9LFxuICBnZXRIYXNGaXJzdFNlcnZlclBhZ2UoKSB7XG4gICAgLy8gc28gdGVjaG5pY2FsbHkgYWx3YXlzIFwidHJ1ZVwiIGJ1dCB3aGF0IHdlIHJlYWxseSBtZWFuIGlzLCBhcmUgd2Ugbm90IG9uIHBhZ2UgMSBhbHJlYWR5XG4gICAgcmV0dXJuIHRoaXMuaGFzUHJldmlvdXNTZXJ2ZXJQYWdlKClcbiAgfSxcbiAgZ2V0Rmlyc3RTZXJ2ZXJQYWdlKCkge1xuICAgIHRoaXMuc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKHRoaXMub3B0aW9ucylcbiAgfSxcbiAgZ2V0SGFzTGFzdFNlcnZlclBhZ2UoKSB7XG4gICAgLy8gc28gdGVjaG5pY2FsbHkgYWx3YXlzIFwidHJ1ZVwiIGJ1dCB3aGF0IHdlIHJlYWxseSBtZWFuIGlzLCBhcmUgd2Ugbm90IG9uIGxhc3QgcGFnZSBhbHJlYWR5XG4gICAgcmV0dXJuIHRoaXMuaGFzTmV4dFNlcnZlclBhZ2UoKVxuICB9LFxuICBnZXRMYXN0U2VydmVyUGFnZSgpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsXG4gICAgICBnZXRDb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgICAgIGNvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICAgIH0pXG4gICAgKVxuICAgIHRoaXMuc3RhcnRTZWFyY2godGhpcy5vcHRpb25zKVxuICB9LFxuICByZXNldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHRoaXMuc2V0KCdjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCcsIHt9KVxuICAgIGlmICh0aGlzLmdldCgncmVzdWx0JykpIHtcbiAgICAgIHRoaXMuZ2V0TGF6eVJlc3VsdHMoKS5fcmVzZXRTb3VyY2VzKFtdKVxuICAgIH1cbiAgICB0aGlzLnNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9OZXh0UGFnZSgpXG4gIH0sXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIG5leHQgaW5kZXggdG8gYmUgdGhlIHByZXYgcGFnZVxuICAgKi9cbiAgc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb1ByZXZQYWdlKCkge1xuICAgIHRoaXMuc2V0KFxuICAgICAgJ25leHRJbmRleEZvclNvdXJjZUdyb3VwJyxcbiAgICAgIGdldENvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgICBzb3VyY2VzOiB0aGlzLmdldFNlbGVjdGVkU291cmNlcygpLFxuICAgICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgICBjb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgICAgIGlzTG9jYWw6IHRoaXMuaXNMb2NhbFNvdXJjZSxcbiAgICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgfSlcbiAgICApXG4gIH0sXG4gIGlzTG9jYWxTb3VyY2UoaWQ6IHN0cmluZykge1xuICAgIGNvbnN0IFNvdXJjZXMgPSBTdGFydHVwRGF0YVN0b3JlLlNvdXJjZXMuc291cmNlc1xuICAgIGNvbnN0IGhhcnZlc3RlZFNvdXJjZXMgPSBTb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2UuaGFydmVzdGVkKS5tYXAoXG4gICAgICAoc291cmNlKSA9PiBzb3VyY2UuaWRcbiAgICApXG4gICAgcmV0dXJuIGhhcnZlc3RlZFNvdXJjZXMuaW5jbHVkZXMoaWQpXG4gIH0sXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIG5leHQgaW5kZXggdG8gYmUgdGhlIG5leHQgcGFnZVxuICAgKi9cbiAgc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb05leHRQYWdlKCkge1xuICAgIHRoaXMuc2V0KFxuICAgICAgJ25leHRJbmRleEZvclNvdXJjZUdyb3VwJyxcbiAgICAgIGdldENvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICAgIHNvdXJjZXM6IHRoaXMuZ2V0U2VsZWN0ZWRTb3VyY2VzKCksXG4gICAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCksXG4gICAgICAgIGNvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgICAgICBxdWVyeVN0YXR1czogdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKCksXG4gICAgICB9KVxuICAgIClcbiAgfSxcbiAgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXAoKSB7XG4gICAgcmV0dXJuIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwKHtcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCksXG4gICAgICBxdWVyeVN0YXR1czogdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKCksXG4gICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgfSlcbiAgfSxcbiAgLy8gdHJ5IHRvIHJldHVybiB0aGUgbW9zdCByZWNlbnQgc3VjY2Vzc2Z1bCBzdGF0dXNcbiAgZ2V0TW9zdFJlY2VudFN0YXR1cygpOiBTZWFyY2hTdGF0dXMge1xuICAgIGNvbnN0IG1vc3RSZWNlbnRTdGF0dXMgPSB0aGlzLmdldCgnbW9zdFJlY2VudFN0YXR1cycpIGFzIFNlYXJjaFN0YXR1c1xuICAgIGlmIChPYmplY3Qua2V5cyhtb3N0UmVjZW50U3RhdHVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmdldExhenlSZXN1bHRzKCkuc3RhdHVzIHx8IHt9XG4gICAgfVxuICAgIHJldHVybiBtb3N0UmVjZW50U3RhdHVzXG4gIH0sXG4gIGdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnKVxuICB9LFxuICBnZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ25leHRJbmRleEZvclNvdXJjZUdyb3VwJylcbiAgfSxcbiAgaGFzQ3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSkubGVuZ3RoID4gMFxuICB9LFxuICByZWZldGNoKCkge1xuICAgIGlmICh0aGlzLmNhblJlZmV0Y2goKSkge1xuICAgICAgdGhpcy5zZXQoJ25leHRJbmRleEZvclNvdXJjZUdyb3VwJywgdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpKVxuICAgICAgdGhpcy5zdGFydFNlYXJjaCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ01pc3NpbmcgbmVjZXNzYXJ5IGRhdGEgdG8gcmVmZXRjaCAoY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXApLCBvciBzZWFyY2ggY3JpdGVyaWEgaXMgb3V0ZGF0ZWQuJ1xuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgLy8gYXMgbG9uZyBhcyB3ZSBoYXZlIGEgY3VycmVudCBpbmRleCwgYW5kIHRoZSBzZWFyY2ggY3JpdGVyaWEgaXNuJ3Qgb3V0IG9mIGRhdGUsIHdlIGNhbiByZWZldGNoIC0gdXNlZnVsIGZvciByZXN1bWluZyBzZWFyY2hlc1xuICBjYW5SZWZldGNoKCkge1xuICAgIHJldHVybiB0aGlzLmhhc0N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkgJiYgIXRoaXMuaXNPdXRkYXRlZCgpXG4gIH0sXG4gIC8vIGNvbW1vbiBlbm91Z2ggdGhhdCB3ZSBzaG91bGQgZXh0cmFjdCB0aGlzIGZvciBlYXNlIG9mIHVzZVxuICByZWZldGNoT3JTdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKSB7XG4gICAgaWYgKHRoaXMuY2FuUmVmZXRjaCgpKSB7XG4gICAgICB0aGlzLnJlZmV0Y2goKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gICAgfVxuICB9LFxufSBhcyBRdWVyeVR5cGUpXG4iXX0=