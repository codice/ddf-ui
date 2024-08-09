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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvUXVlcnkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTtBQUNyRixPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUE7QUFDeEIsT0FBTyxNQUFNLE1BQU0sY0FBYyxDQUFBO0FBQ2pDLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQ0wsZ0JBQWdCLEdBRWpCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsb0JBQW9CLEdBQ3JCLE1BQU0saURBQWlELENBQUE7QUFDeEQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDekYsT0FBTyxFQUNMLHFDQUFxQyxFQUNyQyxvQ0FBb0MsRUFDcEMsbUNBQW1DLEVBQ25DLHdDQUF3QyxFQUN4Qyx5QkFBeUIsRUFDekIsNkJBQTZCLEdBRzlCLE1BQU0saUJBQWlCLENBQUE7QUFDeEIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBd0RwRCxTQUFTLGNBQWMsQ0FBQyxhQUFrQjtJQUN4QyxPQUFPLElBQUksa0JBQWtC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QUksS0FBSyxDQUNiLGlHQUFpRyxDQUNsRyxDQUFBO1NBQ0Y7SUFDSCxDQUFDO0lBQ0QsK0hBQStIO0lBQy9ILFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO0lBQ25FLENBQUM7SUFDRCw0REFBNEQ7SUFDNUQsaUNBQWlDO1FBQy9CLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtTQUNmO2FBQU07WUFDTCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQTtTQUNoQztJQUNILENBQUM7Q0FDVyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgUXVlcnlSZXNwb25zZSBmcm9tICcuL1F1ZXJ5UmVzcG9uc2UnXG5pbXBvcnQgeyBwb3N0U2ltcGxlQXVkaXRMb2cgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvYXVkaXQvYXVkaXQtZW5kcG9pbnQnXG5pbXBvcnQgY3FsIGZyb20gJy4uL2NxbCdcbmltcG9ydCBfbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoLmNsb25lZGVlcCdcbmltcG9ydCB7IHY0IH0gZnJvbSAndXVpZCdcbmltcG9ydCAnYmFja2JvbmUtYXNzb2NpYXRpb25zJ1xuaW1wb3J0IHtcbiAgTGF6eVF1ZXJ5UmVzdWx0cyxcbiAgU2VhcmNoU3RhdHVzLFxufSBmcm9tICcuL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHRzJ1xuaW1wb3J0IHtcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbiAgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MsXG59IGZyb20gJy4uLy4uL2NvbXBvbmVudC9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgZG93bmdyYWRlRmlsdGVyVHJlZVRvQmFzaWMgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvcXVlcnktYmFzaWMvcXVlcnktYmFzaWMudmlldydcbmltcG9ydCB7XG4gIGdldENvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXAsXG4gIGdldENvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXAsXG4gIGdldENvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAsXG4gIGhhc05leHRQYWdlRm9yU291cmNlR3JvdXAsXG4gIGhhc1ByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwLFxuICBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSxcbiAgUXVlcnlTdGFydEFuZEVuZFR5cGUsXG59IGZyb20gJy4vUXVlcnkubWV0aG9kcydcbmltcG9ydCB3cmVxciBmcm9tICcuLi93cmVxcidcbmltcG9ydCB7IENvbW1vbkFqYXhTZXR0aW5ncyB9IGZyb20gJy4uL0FqYXhTZXR0aW5ncydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL1N0YXJ0dXAvc3RhcnR1cCdcbmV4cG9ydCB0eXBlIFF1ZXJ5VHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IChfYXR0cmlidXRlczogYW55LCBvcHRpb25zOiBhbnkpID0+IHZvaWRcbiAgc2V0OiAocDE6IGFueSwgcDI/OiBhbnksIHAzPzogYW55KSA9PiB2b2lkXG4gIHRvSlNPTjogKCkgPT4gYW55XG4gIGRlZmF1bHRzOiAoKSA9PiBhbnlcbiAgcmVzZXRUb0RlZmF1bHRzOiAob3ZlcnJpZGVuRGVmYXVsdHM6IGFueSkgPT4gdm9pZFxuICBhcHBseURlZmF1bHRzOiAoKSA9PiB2b2lkXG4gIHJldmVydDogKCkgPT4gdm9pZFxuICBpc0xvY2FsOiAoKSA9PiBib29sZWFuXG4gIF9oYW5kbGVEZXByZWNhdGVkRmVkZXJhdGlvbjogKGF0dHJpYnV0ZXM6IGFueSkgPT4gdm9pZFxuICBpbml0aWFsaXplOiAoYXR0cmlidXRlczogYW55KSA9PiB2b2lkXG4gIGdldFNlbGVjdGVkU291cmNlczogKCkgPT4gQXJyYXk8YW55PlxuICBidWlsZFNlYXJjaERhdGE6ICgpID0+IGFueVxuICBpc091dGRhdGVkOiAoKSA9PiBib29sZWFuXG4gIHN0YXJ0U2VhcmNoSWZPdXRkYXRlZDogKCkgPT4gdm9pZFxuICB1cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZTogKCkgPT4gdm9pZFxuICBpbml0aWFsaXplUmVzdWx0OiAob3B0aW9ucz86IGFueSkgPT4ge1xuICAgIGRhdGE6IGFueVxuICAgIHNlbGVjdGVkU291cmNlczogYW55XG4gICAgaXNIYXJ2ZXN0ZWQ6IGFueVxuICAgIGlzRmVkZXJhdGVkOiBhbnlcbiAgICByZXN1bHQ6IGFueVxuICAgIHJlc3VsdE9wdGlvbnM6IGFueVxuICB9XG4gIHN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZTogKG9wdGlvbnM/OiBhbnksIGRvbmU/OiBhbnkpID0+IHZvaWRcbiAgc3RhcnRTZWFyY2g6IChvcHRpb25zPzogYW55LCBkb25lPzogYW55KSA9PiB2b2lkXG4gIGN1cnJlbnRTZWFyY2hlczogQXJyYXk8YW55PlxuICBjYW5jZWxDdXJyZW50U2VhcmNoZXM6ICgpID0+IHZvaWRcbiAgY2xlYXJSZXN1bHRzOiAoKSA9PiB2b2lkXG4gIHNldFNvdXJjZXM6IChzb3VyY2VzOiBhbnkpID0+IHZvaWRcbiAgc2V0Q29sb3I6IChjb2xvcjogYW55KSA9PiB2b2lkXG4gIGdldENvbG9yOiAoKSA9PiBhbnlcbiAgY29sb3I6ICgpID0+IGFueVxuICBnZXRQcmV2aW91c1NlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgaGFzUHJldmlvdXNTZXJ2ZXJQYWdlOiAoKSA9PiBib29sZWFuXG4gIGhhc05leHRTZXJ2ZXJQYWdlOiAoKSA9PiBib29sZWFuXG4gIGdldE5leHRTZXJ2ZXJQYWdlOiAoKSA9PiB2b2lkXG4gIGdldEhhc0ZpcnN0U2VydmVyUGFnZTogKCkgPT4gYm9vbGVhblxuICBnZXRGaXJzdFNlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0SGFzTGFzdFNlcnZlclBhZ2U6ICgpID0+IGJvb2xlYW5cbiAgZ2V0TGFzdFNlcnZlclBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6ICgpID0+IEluZGV4Rm9yU291cmNlR3JvdXBUeXBlXG4gIGdldE5leHRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiBJbmRleEZvclNvdXJjZUdyb3VwVHlwZVxuICByZXNldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiB2b2lkXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9QcmV2UGFnZTogKCkgPT4gdm9pZFxuICBzZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvTmV4dFBhZ2U6ICgpID0+IHZvaWRcbiAgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6ICgpID0+IFF1ZXJ5U3RhcnRBbmRFbmRUeXBlXG4gIGhhc0N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiAoKSA9PiBib29sZWFuXG4gIGdldE1vc3RSZWNlbnRTdGF0dXM6ICgpID0+IGFueVxuICBnZXRMYXp5UmVzdWx0czogKCkgPT4gTGF6eVF1ZXJ5UmVzdWx0c1xuICB1cGRhdGVNb3N0UmVjZW50U3RhdHVzOiAoKSA9PiB2b2lkXG4gIHJlZmV0Y2g6ICgpID0+IHZvaWRcbiAgY2FuUmVmZXRjaDogKCkgPT4gYm9vbGVhblxuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cbmZ1bmN0aW9uIGxpbWl0VG9EZWxldGVkKGNxbEZpbHRlclRyZWU6IGFueSkge1xuICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgdHlwZTogJ0FORCcsXG4gICAgZmlsdGVyczogW1xuICAgICAgY3FsRmlsdGVyVHJlZSxcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC10YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ2RlbGV0ZWQnLFxuICAgICAgfSksXG4gICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICBwcm9wZXJ0eTogJ1wibWV0YWNhcmQuZGVsZXRlZC50YWdzXCInLFxuICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICB2YWx1ZTogJ3Jlc291cmNlJyxcbiAgICAgIH0pLFxuICAgIF0sXG4gIH0pXG59XG5mdW5jdGlvbiBsaW1pdFRvSGlzdG9yaWMoY3FsRmlsdGVyVHJlZTogYW55KSB7XG4gIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICB0eXBlOiAnQU5EJyxcbiAgICBmaWx0ZXJzOiBbXG4gICAgICBjcWxGaWx0ZXJUcmVlLFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHk6ICdcIm1ldGFjYXJkLXRhZ3NcIicsXG4gICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgIHZhbHVlOiAncmV2aXNpb24nLFxuICAgICAgfSksXG4gICAgXSxcbiAgfSlcbn1cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICByZWxhdGlvbnM6IFtcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICdyZXN1bHQnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVJlc3BvbnNlLFxuICAgICAgaXNUcmFuc2llbnQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbiAgLy8gb3ZlcnJpZGUgY29uc3RydWN0b3Igc2xpZ2h0bHkgdG8gZW5zdXJlIG9wdGlvbnMgLyBhdHRyaWJ1dGVzIGFyZSBhdmFpbGFibGUgb24gdGhlIHNlbGYgcmVmIGltbWVkaWF0ZWx5XG4gIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgaWYgKFxuICAgICAgIW9wdGlvbnMgfHxcbiAgICAgICFvcHRpb25zLnRyYW5zZm9ybURlZmF1bHRzIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1GaWx0ZXJUcmVlIHx8XG4gICAgICAhb3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyB8fFxuICAgICAgIW9wdGlvbnMudHJhbnNmb3JtQ291bnRcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ09wdGlvbnMgZm9yIHRyYW5zZm9ybURlZmF1bHRzLCB0cmFuc2Zvcm1GaWx0ZXJUcmVlLCB0cmFuc2Zvcm1Tb3J0cywgYW5kIHRyYW5zZm9ybUNvdW50IG11c3QgYmUgcHJvdmlkZWQnXG4gICAgICApXG4gICAgfVxuICAgIHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge31cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgcmV0dXJuIEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH0sXG4gIHNldChkYXRhOiBhbnksIHZhbHVlOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBzd2l0Y2ggKHR5cGVvZiBkYXRhKSB7XG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgZGF0YS5maWx0ZXJUcmVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHR5cGVvZiBkYXRhLmZpbHRlclRyZWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBkYXRhLmZpbHRlclRyZWUgPSBKU09OLnBhcnNlKGRhdGEuZmlsdGVyVHJlZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhkYXRhLmZpbHRlclRyZWUpKSB7XG4gICAgICAgICAgICBkYXRhLmZpbHRlclRyZWUgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKGRhdGEuZmlsdGVyVHJlZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICBpZiAoZGF0YSA9PT0gJ2ZpbHRlclRyZWUnKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzRmlsdGVyQnVpbGRlckNsYXNzKHZhbHVlKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3ModmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgIH1cbiAgICByZXR1cm4gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLnByb3RvdHlwZS5zZXQuYXBwbHkodGhpcywgW1xuICAgICAgZGF0YSxcbiAgICAgIHZhbHVlLFxuICAgICAgb3B0aW9ucyxcbiAgICBdKVxuICB9LFxuICB0b0pTT04oLi4uYXJnczogYW55KSB7XG4gICAgY29uc3QganNvbiA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcywgLi4uYXJncylcbiAgICBpZiAodHlwZW9mIGpzb24uZmlsdGVyVHJlZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGpzb24uZmlsdGVyVHJlZSA9IEpTT04uc3RyaW5naWZ5KGpzb24uZmlsdGVyVHJlZSlcbiAgICB9XG4gICAgcmV0dXJuIGpzb25cbiAgfSxcbiAgZGVmYXVsdHMoKSB7XG4gICAgY29uc3QgZmlsdGVyVHJlZSA9IHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcz8uZmlsdGVyVHJlZVxuICAgIGxldCBjb25zdHJ1Y3RlZEZpbHRlclRyZWU6IEZpbHRlckJ1aWxkZXJDbGFzc1xuICAgIGxldCBjb25zdHJ1Y3RlZENxbCA9IHRoaXMuX2NvbnN0cnVjdG9yQXR0cmlidXRlcz8uY3FsIHx8IFwiYW55VGV4dCBJTElLRSAnKidcIlxuICAgIGlmIChmaWx0ZXJUcmVlICYmIHR5cGVvZiBmaWx0ZXJUcmVlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3RydWN0ZWRGaWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhKU09OLnBhcnNlKGZpbHRlclRyZWUpKVxuICAgIH0gZWxzZSBpZiAoIWZpbHRlclRyZWUgfHwgZmlsdGVyVHJlZS5pZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB3aGVuIHdlIG1ha2UgZHJhc3RpYyBjaGFuZ2VzIHRvIGZpbHRlciB0cmVlIGl0IHdpbGwgYmUgbmVjZXNzYXJ5IHRvIGZhbGwgYmFjayB0byBjcWwgYW5kIHJlY29uc3RydWN0IGEgZmlsdGVyIHRyZWUgdGhhdCdzIGNvbXBhdGlibGVcbiAgICAgIGNvbnN0cnVjdGVkRmlsdGVyVHJlZSA9IGNxbC5yZWFkKGNvbnN0cnVjdGVkQ3FsKVxuICAgICAgY29uc29sZS53YXJuKCdtaWdyYXRpbmcgYSBmaWx0ZXIgdHJlZSB0byB0aGUgbGF0ZXN0IHN0cnVjdHVyZScpXG4gICAgICAvLyBhbGxvdyBkb3duc3RyZWFtIHByb2plY3RzIHRvIGhhbmRsZSBob3cgdGhleSB3YW50IHRvIGluZm9ybSB1c2VycyBvZiBtaWdyYXRpb25zXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdmaWx0ZXJUcmVlOm1pZ3JhdGlvbicsIHtcbiAgICAgICAgc2VhcmNoOiB0aGlzLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3RydWN0ZWRGaWx0ZXJUcmVlID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyhmaWx0ZXJUcmVlKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybURlZmF1bHRzKHtcbiAgICAgIG9yaWdpbmFsRGVmYXVsdHM6IHtcbiAgICAgICAgY3FsOiBjb25zdHJ1Y3RlZENxbCxcbiAgICAgICAgZmlsdGVyVHJlZTogY29uc3RydWN0ZWRGaWx0ZXJUcmVlLFxuICAgICAgICBhc3NvY2lhdGVkRm9ybU1vZGVsOiB1bmRlZmluZWQsXG4gICAgICAgIGV4Y2x1ZGVVbm5lY2Vzc2FyeUF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGNvdW50OiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVzdWx0Q291bnQoKSxcbiAgICAgICAgc29ydHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhdHRyaWJ1dGU6ICdtb2RpZmllZCcsXG4gICAgICAgICAgICBkaXJlY3Rpb246ICdkZXNjZW5kaW5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzb3VyY2VzOiBbJ2FsbCddLFxuICAgICAgICAvLyBpbml0aWFsaXplIHRoaXMgaGVyZSBzbyB3ZSBjYW4gYXZvaWQgY3JlYXRpbmcgc3B1cmlvdXMgcmVmZXJlbmNlcyB0byBMYXp5UXVlcnlSZXN1bHRzIG9iamVjdHNcbiAgICAgICAgcmVzdWx0OiBuZXcgUXVlcnlSZXNwb25zZSh7XG4gICAgICAgICAgbGF6eVJlc3VsdHM6IG5ldyBMYXp5UXVlcnlSZXN1bHRzKHtcbiAgICAgICAgICAgIGZpbHRlclRyZWU6IGNvbnN0cnVjdGVkRmlsdGVyVHJlZSxcbiAgICAgICAgICAgIHNvcnRzOiBbXSxcbiAgICAgICAgICAgIHNvdXJjZXM6IFtdLFxuICAgICAgICAgICAgdHJhbnNmb3JtU29ydHM6ICh7IG9yaWdpbmFsU29ydHMgfSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYW5zZm9ybVNvcnRzKHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNvcnRzLFxuICAgICAgICAgICAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgaXNMb2NhbDogZmFsc2UsXG4gICAgICAgIGlzT3V0ZGF0ZWQ6IGZhbHNlLFxuICAgICAgICAnZGV0YWlsLWxldmVsJzogdW5kZWZpbmVkLFxuICAgICAgICBzcGVsbGNoZWNrOiBmYWxzZSxcbiAgICAgICAgcGhvbmV0aWNzOiBmYWxzZSxcbiAgICAgICAgYWRkaXRpb25hbE9wdGlvbnM6ICd7fScsXG4gICAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSBhcyBJbmRleEZvclNvdXJjZUdyb3VwVHlwZSxcbiAgICAgICAgbmV4dEluZGV4Rm9yU291cmNlR3JvdXA6IHt9IGFzIEluZGV4Rm9yU291cmNlR3JvdXBUeXBlLFxuICAgICAgICBtb3N0UmVjZW50U3RhdHVzOiB7fSBhcyBTZWFyY2hTdGF0dXMsXG4gICAgICB9LFxuICAgICAgcXVlcnlSZWY6IHRoaXMsXG4gICAgfSlcbiAgfSxcbiAgLyoqXG4gICAqICBBZGQgZmlsdGVyVHJlZSBpbiBoZXJlLCBzaW5jZSBpbml0aWFsaXplIGlzIG9ubHkgcnVuIG9uY2UgKGFuZCBkZWZhdWx0cyBjYW4ndCBoYXZlIGZpbHRlclRyZWUpXG4gICAqL1xuICByZXNldFRvRGVmYXVsdHMob3ZlcnJpZGVuRGVmYXVsdHM6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRzID0gXy5vbWl0KFxuICAgICAge1xuICAgICAgICAuLi50aGlzLmRlZmF1bHRzKCksXG4gICAgICAgIGZpbHRlclRyZWU6IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICBbJ2lzTG9jYWwnLCAncmVzdWx0J11cbiAgICApXG4gICAgdGhpcy5zZXQoX21lcmdlKGRlZmF1bHRzLCBvdmVycmlkZW5EZWZhdWx0cykpXG4gICAgdGhpcy50cmlnZ2VyKCdyZXNldFRvRGVmYXVsdHMnKVxuICB9LFxuICBhcHBseURlZmF1bHRzKCkge1xuICAgIHRoaXMuc2V0KF8ucGljayh0aGlzLmRlZmF1bHRzKCksIFsnc29ydHMnLCAnc291cmNlcyddKSlcbiAgfSxcbiAgcmV2ZXJ0KCkge1xuICAgIHRoaXMudHJpZ2dlcigncmV2ZXJ0JylcbiAgfSxcbiAgaXNMb2NhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2lzTG9jYWwnKVxuICB9LFxuICBfaGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb24oYXR0cmlidXRlczogYW55KSB7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5mZWRlcmF0aW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAnQXR0ZW1wdCB0byBzZXQgZmVkZXJhdGlvbiBvbiBhIHNlYXJjaC4gIFRoaXMgYXR0cmlidXRlIGlzIGRlcHJlY2F0ZWQuICBEaWQgeW91IG1lYW4gdG8gc2V0IHNvdXJjZXM/J1xuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbGl6ZShhdHRyaWJ1dGVzOiBhbnkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSkgLy8gdW5kZXJzY29yZSBiaW5kQWxsIGRvZXMgbm90IHRha2UgYXJyYXkgYXJnXG4gICAgdGhpcy5faGFuZGxlRGVwcmVjYXRlZEZlZGVyYXRpb24oYXR0cmlidXRlcylcbiAgICB0aGlzLmxpc3RlblRvKFxuICAgICAgdGhpcyxcbiAgICAgICdjaGFuZ2U6Y3FsIGNoYW5nZTpmaWx0ZXJUcmVlIGNoYW5nZTpzb3VyY2VzIGNoYW5nZTpzb3J0cyBjaGFuZ2U6c3BlbGxjaGVjayBjaGFuZ2U6cGhvbmV0aWNzIGNoYW5nZTpjb3VudCBjaGFuZ2U6YWRkaXRpb25hbE9wdGlvbnMnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldCgnaXNPdXRkYXRlZCcsIHRydWUpXG4gICAgICAgIHRoaXMuc2V0KCdtb3N0UmVjZW50U3RhdHVzJywge30pXG4gICAgICB9XG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpmaWx0ZXJUcmVlJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLl9yZXNldEZpbHRlclRyZWUodGhpcy5nZXQoJ2ZpbHRlclRyZWUnKSlcbiAgICB9KVxuICAgIC8vIGJhc2ljYWxseSByZW1vdmUgaW52YWxpZCBmaWx0ZXJzIHdoZW4gZ29pbmcgZnJvbSBiYXNpYyB0byBhZHZhbmNlZCwgYW5kIG1ha2UgaXQgYmFzaWMgY29tcGF0aWJsZVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTp0eXBlJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZ2V0KCd0eXBlJykgPT09ICdiYXNpYycpIHtcbiAgICAgICAgY29uc3QgY2xlYW5lZFVwRmlsdGVyVHJlZSA9IGNxbC5yZW1vdmVJbnZhbGlkRmlsdGVycyhcbiAgICAgICAgICB0aGlzLmdldCgnZmlsdGVyVHJlZScpXG4gICAgICAgIClcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICAgIGRvd25ncmFkZUZpbHRlclRyZWVUb0Jhc2ljKGNsZWFuZWRVcEZpbHRlclRyZWUgYXMgYW55KVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmdldExhenlSZXN1bHRzKCkuc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdzdGF0dXMnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVNb3N0UmVjZW50U3RhdHVzKClcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbiAgZ2V0U2VsZWN0ZWRTb3VyY2VzKCkge1xuICAgIGNvbnN0IFNvdXJjZXMgPSBTdGFydHVwRGF0YVN0b3JlLlNvdXJjZXMuc291cmNlc1xuICAgIGNvbnN0IHNvdXJjZUlkcyA9IFNvdXJjZXMubWFwKChzcmMpID0+IHNyYy5pZClcbiAgICBjb25zdCBsb2NhbFNvdXJjZUlkcyA9IFNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzcmMpID0+IHNyYy5pZFxuICAgIClcbiAgICBjb25zdCByZW1vdGVTb3VyY2VJZHMgPSBTb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiAhc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNyYykgPT4gc3JjLmlkXG4gICAgKVxuICAgIGNvbnN0IHNlbGVjdGVkU291cmNlcyA9IHRoaXMuZ2V0KCdzb3VyY2VzJylcbiAgICBsZXQgc291cmNlQXJyYXkgPSBzZWxlY3RlZFNvdXJjZXNcbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VzLmluY2x1ZGVzKCdhbGwnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VJZHNcbiAgICB9XG4gICAgaWYgKHNlbGVjdGVkU291cmNlcy5pbmNsdWRlcygnbG9jYWwnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VBcnJheVxuICAgICAgICAuY29uY2F0KGxvY2FsU291cmNlSWRzKVxuICAgICAgICAuZmlsdGVyKChzcmM6IGFueSkgPT4gc3JjICE9PSAnbG9jYWwnKVxuICAgIH1cbiAgICBpZiAoc2VsZWN0ZWRTb3VyY2VzLmluY2x1ZGVzKCdyZW1vdGUnKSkge1xuICAgICAgc291cmNlQXJyYXkgPSBzb3VyY2VBcnJheVxuICAgICAgICAuY29uY2F0KHJlbW90ZVNvdXJjZUlkcylcbiAgICAgICAgLmZpbHRlcigoc3JjOiBhbnkpID0+IHNyYyAhPT0gJ3JlbW90ZScpXG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VBcnJheVxuICB9LFxuICBidWlsZFNlYXJjaERhdGEoKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMudG9KU09OKClcbiAgICBkYXRhLnNvdXJjZXMgPSB0aGlzLmdldFNlbGVjdGVkU291cmNlcygpXG4gICAgZGF0YS5jb3VudCA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Db3VudCh7XG4gICAgICBvcmlnaW5hbENvdW50OiB0aGlzLmdldCgnY291bnQnKSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgZGF0YS5zb3J0cyA9IHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyh7XG4gICAgICBvcmlnaW5hbFNvcnRzOiB0aGlzLmdldCgnc29ydHMnKSxcbiAgICAgIHF1ZXJ5UmVmOiB0aGlzLFxuICAgIH0pXG4gICAgcmV0dXJuIF8ucGljayhcbiAgICAgIGRhdGEsXG4gICAgICAnc291cmNlcycsXG4gICAgICAnY291bnQnLFxuICAgICAgJ3RpbWVvdXQnLFxuICAgICAgJ2NxbCcsXG4gICAgICAnc29ydHMnLFxuICAgICAgJ2lkJyxcbiAgICAgICdzcGVsbGNoZWNrJyxcbiAgICAgICdwaG9uZXRpY3MnLFxuICAgICAgJ2FkZGl0aW9uYWxPcHRpb25zJ1xuICAgIClcbiAgfSxcbiAgaXNPdXRkYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2lzT3V0ZGF0ZWQnKVxuICB9LFxuICBzdGFydFNlYXJjaElmT3V0ZGF0ZWQoKSB7XG4gICAgaWYgKHRoaXMuaXNPdXRkYXRlZCgpKSB7XG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBXZSBvbmx5IGtlZXAgZmlsdGVyVHJlZSB1cCB0byBkYXRlLCB0aGVuIHdoZW4gd2UgaW50ZXJhY3Qgd2l0aCB0aGUgc2VydmVyIHdlIHdyaXRlIG91dCB3aGF0IGl0IG1lYW5zXG4gICAqXG4gICAqIFdlIGRvIHRoaXMgZm9yIHBlcmZvcm1hbmNlLCBhbmQgYmVjYXVzZSB0cmFuc2Zvcm1hdGlvbiBpcyBsb3NzeS5cbiAgICpcbiAgICogQWxzbyBub3RpY2UgdGhhdCB3ZSBkbyBhIHNsaWdodCBiaXQgb2YgdmFsaWRhdGlvbiwgc28gYW55dGhpbmcgdGhhdCBoYXMgbm8gZmlsdGVycyB3aWxsIHRyYW5zbGF0ZSB0byBhIHN0YXIgcXVlcnkgKGV2ZXJ5dGhpbmcpXG4gICAqL1xuICB1cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpIHtcbiAgICBjb25zdCBmaWx0ZXJUcmVlID0gdGhpcy5nZXQoJ2ZpbHRlclRyZWUnKVxuICAgIGlmIChcbiAgICAgICFmaWx0ZXJUcmVlIHx8XG4gICAgICBmaWx0ZXJUcmVlLmZpbHRlcnMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgZmlsdGVyVHJlZS5maWx0ZXJzLmxlbmd0aCA9PT0gMFxuICAgICkge1xuICAgICAgdGhpcy5zZXQoXG4gICAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHsgdmFsdWU6ICcqJywgcHJvcGVydHk6ICdhbnlUZXh0JywgdHlwZTogJ0lMSUtFJyB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgdGhpcy51cGRhdGVDcWxCYXNlZE9uRmlsdGVyVHJlZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdjcWwnLCBjcWwud3JpdGUoZmlsdGVyVHJlZSkpXG4gICAgfVxuICB9LFxuICBzdGFydFNlYXJjaEZyb21GaXJzdFBhZ2Uob3B0aW9uczogYW55LCBkb25lOiBhbnkpIHtcbiAgICB0aGlzLnVwZGF0ZUNxbEJhc2VkT25GaWx0ZXJUcmVlKClcbiAgICB0aGlzLnJlc2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKVxuICAgIHRoaXMuc3RhcnRTZWFyY2gob3B0aW9ucywgZG9uZSlcbiAgfSxcbiAgaW5pdGlhbGl6ZVJlc3VsdChvcHRpb25zOiBhbnkpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBvcHRpb25zID0gXy5leHRlbmQoXG4gICAgICB7XG4gICAgICAgIGxpbWl0VG9EZWxldGVkOiBmYWxzZSxcbiAgICAgICAgbGltaXRUb0hpc3RvcmljOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBvcHRpb25zXG4gICAgKVxuICAgIGNvbnN0IGRhdGEgPSBfY2xvbmVEZWVwKHRoaXMuYnVpbGRTZWFyY2hEYXRhKCkpXG4gICAgZGF0YS5iYXRjaElkID0gdjQoKVxuICAgIC8vIERhdGEuc291cmNlcyBpcyBzZXQgaW4gYGJ1aWxkU2VhcmNoRGF0YWAgYmFzZWQgb24gd2hpY2ggc291cmNlcyB5b3UgaGF2ZSBzZWxlY3RlZC5cbiAgICBsZXQgc2VsZWN0ZWRTb3VyY2VzID0gZGF0YS5zb3VyY2VzXG4gICAgY29uc3QgaGFydmVzdGVkU291cmNlcyA9IFNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5oYXJ2ZXN0ZWQpLm1hcChcbiAgICAgIChzb3VyY2UpID0+IHNvdXJjZS5pZFxuICAgIClcbiAgICBjb25zdCBpc0hhcnZlc3RlZCA9IChpZDogYW55KSA9PiBoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKGlkKVxuICAgIGNvbnN0IGlzRmVkZXJhdGVkID0gKGlkOiBhbnkpID0+ICFoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKGlkKVxuICAgIGlmIChvcHRpb25zLmxpbWl0VG9EZWxldGVkKSB7XG4gICAgICBzZWxlY3RlZFNvdXJjZXMgPSBkYXRhLnNvdXJjZXMuZmlsdGVyKGlzSGFydmVzdGVkKVxuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5nZXQoJ3Jlc3VsdCcpXG4gICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLnJlc2V0KHtcbiAgICAgIGZpbHRlclRyZWU6IHRoaXMuZ2V0KCdmaWx0ZXJUcmVlJyksXG4gICAgICBzb3J0czogdGhpcy5nZXQoJ3NvcnRzJyksXG4gICAgICBzb3VyY2VzOiBzZWxlY3RlZFNvdXJjZXMsXG4gICAgICB0cmFuc2Zvcm1Tb3J0czogKHsgb3JpZ2luYWxTb3J0cyB9OiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Tb3J0cyh7IG9yaWdpbmFsU29ydHMsIHF1ZXJ5UmVmOiB0aGlzIH0pXG4gICAgICB9LFxuICAgIH0pXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGEsXG4gICAgICBzZWxlY3RlZFNvdXJjZXMsXG4gICAgICBpc0hhcnZlc3RlZCxcbiAgICAgIGlzRmVkZXJhdGVkLFxuICAgICAgcmVzdWx0LFxuICAgICAgcmVzdWx0T3B0aW9uczogb3B0aW9ucyxcbiAgICB9XG4gIH0sXG4gIC8vIHdlIG5lZWQgYXQgbGVhc3Qgb25lIHN0YXR1cyBmb3IgdGhlIHNlYXJjaCB0byBiZSBhYmxlIHRvIGNvcnJlY3RseSBwYWdlIHRoaW5ncywgdGVjaG5pY2FsbHkgd2UgY291bGQganVzdCB1c2UgdGhlIGZpcnN0IG9uZVxuICB1cGRhdGVNb3N0UmVjZW50U3RhdHVzKCkge1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0dXMgPSB0aGlzLmdldExhenlSZXN1bHRzKCkuc3RhdHVzXG4gICAgY29uc3QgcHJldmlvdXNTdGF0dXMgPSB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKVxuICAgIGNvbnN0IG5ld1N0YXR1cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocHJldmlvdXNTdGF0dXMpKVxuICAgIC8vIGNvbXBhcmUgZWFjaCBrZXkgYW5kIG92ZXJ3cml0ZSBvbmx5IHdoZW4gdGhlIG5ldyBzdGF0dXMgaXMgc3VjY2Vzc2Z1bCAtIHdlIG5lZWQgYSBzdWNjZXNzZnVsIHN0YXR1cyB0byBwYWdlXG4gICAgT2JqZWN0LmtleXMoY3VycmVudFN0YXR1cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAoY3VycmVudFN0YXR1c1trZXldLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgbmV3U3RhdHVzW2tleV0gPSBjdXJyZW50U3RhdHVzW2tleV1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuc2V0KCdtb3N0UmVjZW50U3RhdHVzJywgbmV3U3RhdHVzKVxuICB9LFxuICBnZXRMYXp5UmVzdWx0cygpOiBMYXp5UXVlcnlSZXN1bHRzIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Jlc3VsdCcpLmdldCgnbGF6eVJlc3VsdHMnKVxuICB9LFxuICBzdGFydFNlYXJjaChvcHRpb25zOiBhbnksIGRvbmU6IGFueSkge1xuICAgIHRoaXMudHJpZ2dlcigncGFuVG9TaGFwZXNFeHRlbnQnKVxuICAgIHRoaXMuc2V0KCdpc091dGRhdGVkJywgZmFsc2UpXG4gICAgaWYgKHRoaXMuZ2V0KCdjcWwnKSA9PT0gJycpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmNhbmNlbEN1cnJlbnRTZWFyY2hlcygpXG4gICAgY29uc3Qge1xuICAgICAgZGF0YSxcbiAgICAgIHNlbGVjdGVkU291cmNlcyxcbiAgICAgIGlzSGFydmVzdGVkLFxuICAgICAgaXNGZWRlcmF0ZWQsXG4gICAgICByZXN1bHQsXG4gICAgICByZXN1bHRPcHRpb25zLFxuICAgIH0gPSB0aGlzLmluaXRpYWxpemVSZXN1bHQob3B0aW9ucylcbiAgICBkYXRhLmZyb21VSSA9IHRydWVcbiAgICBsZXQgY3FsRmlsdGVyVHJlZSA9IHRoaXMuZ2V0KCdmaWx0ZXJUcmVlJylcbiAgICBpZiAocmVzdWx0T3B0aW9ucy5saW1pdFRvRGVsZXRlZCkge1xuICAgICAgY3FsRmlsdGVyVHJlZSA9IGxpbWl0VG9EZWxldGVkKGNxbEZpbHRlclRyZWUpXG4gICAgfSBlbHNlIGlmIChyZXN1bHRPcHRpb25zLmxpbWl0VG9IaXN0b3JpYykge1xuICAgICAgY3FsRmlsdGVyVHJlZSA9IGxpbWl0VG9IaXN0b3JpYyhjcWxGaWx0ZXJUcmVlKVxuICAgIH1cbiAgICBsZXQgY3FsU3RyaW5nID0gdGhpcy5vcHRpb25zLnRyYW5zZm9ybUZpbHRlclRyZWUoe1xuICAgICAgb3JpZ2luYWxGaWx0ZXJUcmVlOiBjcWxGaWx0ZXJUcmVlLFxuICAgICAgcXVlcnlSZWY6IHRoaXMsXG4gICAgfSlcbiAgICB0aGlzLnNldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnLCB0aGlzLmdldE5leHRJbmRleEZvclNvdXJjZUdyb3VwKCkpXG5cbiAgICBwb3N0U2ltcGxlQXVkaXRMb2coe1xuICAgICAgYWN0aW9uOiAnU0VBUkNIX1NVQk1JVFRFRCcsXG4gICAgICBjb21wb25lbnQ6XG4gICAgICAgICdxdWVyeTogWycgKyBjcWxTdHJpbmcgKyAnXSBzb3VyY2VzOiBbJyArIHNlbGVjdGVkU291cmNlcyArICddJyxcbiAgICB9KVxuXG4gICAgY29uc3QgZmVkZXJhdGVkU2VhcmNoZXNUb1J1biA9IHNlbGVjdGVkU291cmNlc1xuICAgICAgLmZpbHRlcihpc0ZlZGVyYXRlZClcbiAgICAgIC5tYXAoKHNvdXJjZTogYW55KSA9PiAoe1xuICAgICAgICAuLi5kYXRhLFxuICAgICAgICBjcWw6IGNxbFN0cmluZyxcbiAgICAgICAgc3JjczogW3NvdXJjZV0sXG4gICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnKVtzb3VyY2VdLFxuICAgICAgfSkpXG4gICAgY29uc3Qgc2VhcmNoZXNUb1J1biA9IFsuLi5mZWRlcmF0ZWRTZWFyY2hlc1RvUnVuXS5maWx0ZXIoXG4gICAgICAoc2VhcmNoKSA9PiBzZWFyY2guc3Jjcy5sZW5ndGggPiAwXG4gICAgKVxuICAgIGlmICh0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkubG9jYWwpIHtcbiAgICAgIGNvbnN0IGxvY2FsU2VhcmNoVG9SdW4gPSB7XG4gICAgICAgIC4uLmRhdGEsXG4gICAgICAgIGNxbDogY3FsU3RyaW5nLFxuICAgICAgICBzcmNzOiBzZWxlY3RlZFNvdXJjZXMuZmlsdGVyKGlzSGFydmVzdGVkKSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKS5sb2NhbCxcbiAgICAgIH1cbiAgICAgIHNlYXJjaGVzVG9SdW4ucHVzaChsb2NhbFNlYXJjaFRvUnVuKVxuICAgIH1cbiAgICBpZiAoc2VhcmNoZXNUb1J1bi5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJlc2V0IHRvIGFsbCBhbmQgcnVuXG4gICAgICB0aGlzLnNldCgnc291cmNlcycsIFsnYWxsJ10pXG4gICAgICB0aGlzLnN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5jdXJyZW50U2VhcmNoZXMgPSBzZWFyY2hlc1RvUnVuLm1hcCgoc2VhcmNoKSA9PiB7XG4gICAgICBkZWxldGUgc2VhcmNoLnNvdXJjZXMgLy8gVGhpcyBrZXkgaXNuJ3QgdXNlZCBvbiB0aGUgYmFja2VuZCBhbmQgb25seSBzZXJ2ZXMgdG8gY29uZnVzZSB0aG9zZSBkZWJ1Z2dpbmcgdGhpcyBjb2RlLlxuICAgICAgLy8gYHJlc3VsdGAgaXMgUXVlcnlSZXNwb25zZVxuICAgICAgcmV0dXJuIHJlc3VsdC5mZXRjaCh7XG4gICAgICAgIC4uLkNvbW1vbkFqYXhTZXR0aW5ncyxcbiAgICAgICAgY3VzdG9tRXJyb3JIYW5kbGluZzogdHJ1ZSxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoc2VhcmNoKSxcbiAgICAgICAgcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgdGltZW91dDogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFNlYXJjaFRpbWVvdXQoKSxcbiAgICAgICAgc3VjY2VzcyhfbW9kZWw6IGFueSwgcmVzcG9uc2U6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgICAgcmVzcG9uc2Uub3B0aW9ucyA9IG9wdGlvbnNcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IoX21vZGVsOiBhbnksIHJlc3BvbnNlOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgICAgICAgIHJlc3BvbnNlLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pXG4gICAgaWYgKHR5cGVvZiBkb25lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkb25lKHRoaXMuY3VycmVudFNlYXJjaGVzKVxuICAgIH1cbiAgfSxcbiAgY3VycmVudFNlYXJjaGVzOiBbXSxcbiAgY2FuY2VsQ3VycmVudFNlYXJjaGVzKCkge1xuICAgIHRoaXMuY3VycmVudFNlYXJjaGVzLmZvckVhY2goKHJlcXVlc3Q6IGFueSkgPT4ge1xuICAgICAgcmVxdWVzdC5hYm9ydCgnQ2FuY2VsZWQnKVxuICAgIH0pXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5nZXQoJ3Jlc3VsdCcpXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdGhpcy5nZXRMYXp5UmVzdWx0cygpLmNhbmNlbCgpXG4gICAgfVxuICAgIHRoaXMuY3VycmVudFNlYXJjaGVzID0gW11cbiAgfSxcbiAgY2xlYXJSZXN1bHRzKCkge1xuICAgIHRoaXMuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICB0aGlzLnNldCh7XG4gICAgICByZXN1bHQ6IHVuZGVmaW5lZCxcbiAgICB9KVxuICB9LFxuICBzZXRTb3VyY2VzKHNvdXJjZXM6IGFueSkge1xuICAgIGNvbnN0IHNvdXJjZUFyciA9IFtdIGFzIGFueVxuICAgIHNvdXJjZXMuZWFjaCgoc3JjOiBhbnkpID0+IHtcbiAgICAgIGlmIChzcmMuZ2V0KCdhdmFpbGFibGUnKSA9PT0gdHJ1ZSkge1xuICAgICAgICBzb3VyY2VBcnIucHVzaChzcmMuZ2V0KCdpZCcpKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKHNvdXJjZUFyci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnNldCgnc291cmNlcycsIHNvdXJjZUFyci5qb2luKCcsJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdzb3VyY2VzJywgJycpXG4gICAgfVxuICB9LFxuICBzZXRDb2xvcihjb2xvcjogYW55KSB7XG4gICAgdGhpcy5zZXQoJ2NvbG9yJywgY29sb3IpXG4gIH0sXG4gIGdldENvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY29sb3InKVxuICB9LFxuICBjb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NvbG9yJylcbiAgfSxcbiAgZ2V0UHJldmlvdXNTZXJ2ZXJQYWdlKCkge1xuICAgIHRoaXMuc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb1ByZXZQYWdlKClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgfSxcbiAgLyoqXG4gICAqIE11Y2ggc2ltcGxlciB0aGFuIHNlZWluZyBpZiBhIG5leHQgcGFnZSBleGlzdHNcbiAgICovXG4gIGhhc1ByZXZpb3VzU2VydmVyUGFnZSgpIHtcbiAgICByZXR1cm4gaGFzUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICB9KVxuICB9LFxuICBoYXNOZXh0U2VydmVyUGFnZSgpIHtcbiAgICByZXR1cm4gaGFzTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICBxdWVyeVN0YXR1czogdGhpcy5nZXRNb3N0UmVjZW50U3RhdHVzKCksXG4gICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgY291bnQ6IHRoaXMuZ2V0KCdjb3VudCcpLFxuICAgIH0pXG4gIH0sXG4gIGdldE5leHRTZXJ2ZXJQYWdlKCkge1xuICAgIHRoaXMuc2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXBUb05leHRQYWdlKClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgfSxcbiAgZ2V0SGFzRmlyc3RTZXJ2ZXJQYWdlKCkge1xuICAgIC8vIHNvIHRlY2huaWNhbGx5IGFsd2F5cyBcInRydWVcIiBidXQgd2hhdCB3ZSByZWFsbHkgbWVhbiBpcywgYXJlIHdlIG5vdCBvbiBwYWdlIDEgYWxyZWFkeVxuICAgIHJldHVybiB0aGlzLmhhc1ByZXZpb3VzU2VydmVyUGFnZSgpXG4gIH0sXG4gIGdldEZpcnN0U2VydmVyUGFnZSgpIHtcbiAgICB0aGlzLnN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gIH0sXG4gIGdldEhhc0xhc3RTZXJ2ZXJQYWdlKCkge1xuICAgIC8vIHNvIHRlY2huaWNhbGx5IGFsd2F5cyBcInRydWVcIiBidXQgd2hhdCB3ZSByZWFsbHkgbWVhbiBpcywgYXJlIHdlIG5vdCBvbiBsYXN0IHBhZ2UgYWxyZWFkeVxuICAgIHJldHVybiB0aGlzLmhhc05leHRTZXJ2ZXJQYWdlKClcbiAgfSxcbiAgZ2V0TGFzdFNlcnZlclBhZ2UoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAnbmV4dEluZGV4Rm9yU291cmNlR3JvdXAnLFxuICAgICAgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCh7XG4gICAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgICAgICBjb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgICB9KVxuICAgIClcbiAgICB0aGlzLnN0YXJ0U2VhcmNoKClcbiAgfSxcbiAgcmVzZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpIHtcbiAgICB0aGlzLnNldCgnY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAnLCB7fSlcbiAgICBpZiAodGhpcy5nZXQoJ3Jlc3VsdCcpKSB7XG4gICAgICB0aGlzLmdldExhenlSZXN1bHRzKCkuX3Jlc2V0U291cmNlcyhbXSlcbiAgICB9XG4gICAgdGhpcy5zZXROZXh0SW5kZXhGb3JTb3VyY2VHcm91cFRvTmV4dFBhZ2UoKVxuICB9LFxuICAvKipcbiAgICogVXBkYXRlIHRoZSBuZXh0IGluZGV4IHRvIGJlIHRoZSBwcmV2IHBhZ2VcbiAgICovXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9QcmV2UGFnZSgpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsXG4gICAgICBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwKHtcbiAgICAgICAgc291cmNlczogdGhpcy5nZXRTZWxlY3RlZFNvdXJjZXMoKSxcbiAgICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSxcbiAgICAgICAgY291bnQ6IHRoaXMuZ2V0KCdjb3VudCcpLFxuICAgICAgICBpc0xvY2FsOiB0aGlzLmlzTG9jYWxTb3VyY2UsXG4gICAgICAgIHF1ZXJ5U3RhdHVzOiB0aGlzLmdldE1vc3RSZWNlbnRTdGF0dXMoKSxcbiAgICAgIH0pXG4gICAgKVxuICB9LFxuICBpc0xvY2FsU291cmNlKGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBjb25zdCBoYXJ2ZXN0ZWRTb3VyY2VzID0gU291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNvdXJjZSkgPT4gc291cmNlLmlkXG4gICAgKVxuICAgIHJldHVybiBoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKGlkKVxuICB9LFxuICAvKipcbiAgICogVXBkYXRlIHRoZSBuZXh0IGluZGV4IHRvIGJlIHRoZSBuZXh0IHBhZ2VcbiAgICovXG4gIHNldE5leHRJbmRleEZvclNvdXJjZUdyb3VwVG9OZXh0UGFnZSgpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsXG4gICAgICBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAoe1xuICAgICAgICBzb3VyY2VzOiB0aGlzLmdldFNlbGVjdGVkU291cmNlcygpLFxuICAgICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgICBjb3VudDogdGhpcy5nZXQoJ2NvdW50JyksXG4gICAgICAgIGlzTG9jYWw6IHRoaXMuaXNMb2NhbFNvdXJjZSxcbiAgICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgfSlcbiAgICApXG4gIH0sXG4gIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHJldHVybiBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCh7XG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogdGhpcy5nZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpLFxuICAgICAgcXVlcnlTdGF0dXM6IHRoaXMuZ2V0TW9zdFJlY2VudFN0YXR1cygpLFxuICAgICAgaXNMb2NhbDogdGhpcy5pc0xvY2FsU291cmNlLFxuICAgIH0pXG4gIH0sXG4gIC8vIHRyeSB0byByZXR1cm4gdGhlIG1vc3QgcmVjZW50IHN1Y2Nlc3NmdWwgc3RhdHVzXG4gIGdldE1vc3RSZWNlbnRTdGF0dXMoKTogU2VhcmNoU3RhdHVzIHtcbiAgICBjb25zdCBtb3N0UmVjZW50U3RhdHVzID0gdGhpcy5nZXQoJ21vc3RSZWNlbnRTdGF0dXMnKSBhcyBTZWFyY2hTdGF0dXNcbiAgICBpZiAoT2JqZWN0LmtleXMobW9zdFJlY2VudFN0YXR1cykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRMYXp5UmVzdWx0cygpLnN0YXR1cyB8fCB7fVxuICAgIH1cbiAgICByZXR1cm4gbW9zdFJlY2VudFN0YXR1c1xuICB9LFxuICBnZXRDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwJylcbiAgfSxcbiAgZ2V0TmV4dEluZGV4Rm9yU291cmNlR3JvdXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcpXG4gIH0sXG4gIGhhc0N1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmdldEN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKCkpLmxlbmd0aCA+IDBcbiAgfSxcbiAgcmVmZXRjaCgpIHtcbiAgICBpZiAodGhpcy5jYW5SZWZldGNoKCkpIHtcbiAgICAgIHRoaXMuc2V0KCduZXh0SW5kZXhGb3JTb3VyY2VHcm91cCcsIHRoaXMuZ2V0Q3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAoKSlcbiAgICAgIHRoaXMuc3RhcnRTZWFyY2goKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdNaXNzaW5nIG5lY2Vzc2FyeSBkYXRhIHRvIHJlZmV0Y2ggKGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwKSwgb3Igc2VhcmNoIGNyaXRlcmlhIGlzIG91dGRhdGVkLidcbiAgICAgIClcbiAgICB9XG4gIH0sXG4gIC8vIGFzIGxvbmcgYXMgd2UgaGF2ZSBhIGN1cnJlbnQgaW5kZXgsIGFuZCB0aGUgc2VhcmNoIGNyaXRlcmlhIGlzbid0IG91dCBvZiBkYXRlLCB3ZSBjYW4gcmVmZXRjaCAtIHVzZWZ1bCBmb3IgcmVzdW1pbmcgc2VhcmNoZXNcbiAgY2FuUmVmZXRjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNDdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCgpICYmICF0aGlzLmlzT3V0ZGF0ZWQoKVxuICB9LFxuICAvLyBjb21tb24gZW5vdWdoIHRoYXQgd2Ugc2hvdWxkIGV4dHJhY3QgdGhpcyBmb3IgZWFzZSBvZiB1c2VcbiAgcmVmZXRjaE9yU3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKCkge1xuICAgIGlmICh0aGlzLmNhblJlZmV0Y2goKSkge1xuICAgICAgdGhpcy5yZWZldGNoKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgIH1cbiAgfSxcbn0gYXMgUXVlcnlUeXBlKVxuIl19