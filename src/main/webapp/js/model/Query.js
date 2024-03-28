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
import { LazyQueryResults } from './LazyQueryResult/LazyQueryResults';
import { FilterBuilderClass, FilterClass, } from '../../component/filter-builder/filter.structure';
import { downgradeFilterTreeToBasic } from '../../component/query-basic/query-basic.view';
import { getConstrainedFinalPageForSourceGroup, getCurrentStartAndEndForSourceGroup, getNextPageForSourceGroup, getPreviousPageForSourceGroup, hasNextPageForSourceGroup, hasPreviousPageForSourceGroup, } from './Query.methods';
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
                start: 1,
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
        });
        this.listenTo(this, 'change:filterTree', function () {
            _this.get('result')
                .get('lazyResults')
                ._resetFilterTree(_this.get('filterTree'));
        });
        // basically remove invalid filters when going from basic to advanced, and make it basic compatible
        this.listenTo(this, 'change:type', function () {
            if (_this.get('type') === 'basic') {
                var cleanedUpFilterTree = cql.removeInvalidFilters(_this.get('filterTree'));
                _this.set('filterTree', downgradeFilterTreeToBasic(cleanedUpFilterTree));
            }
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
        return _.pick(data, 'sources', 'start', 'count', 'timeout', 'cql', 'sorts', 'id', 'spellcheck', 'phonetics', 'additionalOptions');
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
        result.get('lazyResults').reset({
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
        this.currentIndexForSourceGroup = this.nextIndexForSourceGroup;
        postSimpleAuditLog({
            action: 'SEARCH_SUBMITTED',
            component: 'query: [' + cqlString + '] sources: [' + selectedSources + ']',
        });
        var localSearchToRun = __assign(__assign({}, data), { cql: cqlString, srcs: selectedSources.filter(isHarvested), start: this.currentIndexForSourceGroup.local });
        var federatedSearchesToRun = selectedSources
            .filter(isFederated)
            .map(function (source) { return (__assign(__assign({}, data), { cql: cqlString, srcs: [source], start: _this.currentIndexForSourceGroup[source] })); });
        var searchesToRun = __spreadArray([localSearchToRun], __read(federatedSearchesToRun), false).filter(function (search) { return search.srcs.length > 0; });
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
            result.get('lazyResults').cancel();
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
        this.nextIndexForSourceGroup = getPreviousPageForSourceGroup({
            currentIndexForSourceGroup: this.currentIndexForSourceGroup,
            count: this.get('count'),
        });
        // this.setNextIndexForSourceGroupToPrevPage()
        this.startSearch();
    },
    /**
     * Much simpler than seeing if a next page exists
     */
    hasPreviousServerPage: function () {
        return hasPreviousPageForSourceGroup({
            currentIndexForSourceGroup: this.currentIndexForSourceGroup,
        });
    },
    hasNextServerPage: function () {
        var _a, _b;
        var Sources = StartupDataStore.Sources.sources;
        var harvestedSources = Sources.filter(function (source) { return source.harvested; }).map(function (source) { return source.id; });
        return hasNextPageForSourceGroup({
            queryStatus: (_b = (_a = this.get('result')) === null || _a === void 0 ? void 0 : _a.get('lazyResults')) === null || _b === void 0 ? void 0 : _b.status,
            isLocal: function (id) {
                return harvestedSources.includes(id);
            },
            currentIndexForSourceGroup: this.currentIndexForSourceGroup,
            count: this.get('count'),
        });
    },
    getNextServerPage: function () {
        this.setNextIndexForSourceGroupToNextPage(this.getSelectedSources());
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
        var _a, _b;
        var Sources = StartupDataStore.Sources.sources;
        var harvestedSources = Sources.filter(function (source) { return source.harvested; }).map(function (source) { return source.id; });
        this.nextIndexForSourceGroup = getConstrainedFinalPageForSourceGroup({
            queryStatus: (_b = (_a = this.get('result')) === null || _a === void 0 ? void 0 : _a.get('lazyResults')) === null || _b === void 0 ? void 0 : _b.status,
            isLocal: function (id) {
                return harvestedSources.includes(id);
            },
            count: this.get('count'),
        });
        this.startSearch();
    },
    resetCurrentIndexForSourceGroup: function () {
        this.currentIndexForSourceGroup = {};
        if (this.get('result')) {
            this.get('result').get('lazyResults')._resetSources([]);
        }
        this.setNextIndexForSourceGroupToNextPage(this.getSelectedSources());
        this.pastIndexesForSourceGroup = [];
    },
    currentIndexForSourceGroup: {},
    pastIndexesForSourceGroup: [],
    nextIndexForSourceGroup: {},
    /**
     * Update the next index to be the prev page
     */
    setNextIndexForSourceGroupToPrevPage: function () {
        if (this.pastIndexesForSourceGroup.length > 0) {
            this.nextIndexForSourceGroup = this.pastIndexesForSourceGroup.pop() || {};
        }
        else {
            console.error('this should not happen');
        }
    },
    /**
     * Update the next index to be the next page
     */
    setNextIndexForSourceGroupToNextPage: function (sources) {
        var Sources = StartupDataStore.Sources.sources;
        var harvestedSources = Sources.filter(function (source) { return source.harvested; }).map(function (source) { return source.id; });
        this.pastIndexesForSourceGroup.push(this.nextIndexForSourceGroup);
        this.nextIndexForSourceGroup = getNextPageForSourceGroup({
            sources: sources,
            currentIndexForSourceGroup: this.currentIndexForSourceGroup,
            count: this.get('count'),
            isLocal: function (id) {
                return harvestedSources.includes(id);
            },
        });
    },
    getCurrentStartAndEndForSourceGroup: function () {
        var _a, _b;
        return getCurrentStartAndEndForSourceGroup({
            currentIndexForSourceGroup: this.currentIndexForSourceGroup,
            queryStatus: (_b = (_a = this.get('result')) === null || _a === void 0 ? void 0 : _a.get('lazyResults')) === null || _b === void 0 ? void 0 : _b.status,
        });
    },
});
//# sourceMappingURL=Query.js.map