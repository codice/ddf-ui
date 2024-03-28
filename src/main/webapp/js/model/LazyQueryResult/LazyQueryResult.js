import { __assign } from "tslib";
import QueryResult from '../QueryResult';
import cql from '../../cql';
import _ from 'underscore';
import * as TurfMeta from '@turf/meta';
import wkx from 'wkx';
import { FilterBuilderClass, FilterClass, } from '../../../component/filter-builder/filter.structure';
import Common from '../../Common';
var debounceTime = 50;
import $ from 'jquery';
import { StartupDataStore } from '../Startup/startup';
function getThumbnailAction(result) {
    return result.actions.find(function (action) { return action.id === 'catalog.data.metacard.thumbnail'; });
}
function humanizeResourceSize(plain) {
    if (plain.metacard.properties['resource-size']) {
        plain.metacard.properties['resource-size'] = Common.getFileSize(plain.metacard.properties['resource-size']);
    }
}
/**
 * Add defaults, etc.  We need to make sure everything has a tag at the very least
 */
var transformPlain = function (_a) {
    var plain = _a.plain;
    if (!plain.metacard.properties['metacard-tags']) {
        plain.metacard.properties['metacard-tags'] = ['resource'];
    }
    var thumbnailAction = getThumbnailAction(plain);
    if (thumbnailAction) {
        plain.metacard.properties.thumbnail = thumbnailAction.url;
    }
    plain.metacardType = plain.metacard.properties['metacard-type'];
    if (plain.metacardType === 'metacard.query' ||
        (plain.metacard.properties['metacard.deleted.tags'] &&
            plain.metacard.properties['metacard.deleted.tags'].includes('query'))) {
        // since the plain cql search endpoint doesn't understand more complex properties on metacards, we can handle them like this
        // plain.metacard.properties.filterTree =
        //   plain.metacard.properties.filterTree &&
        //   typeof plain.metacard.properties.filterTree === 'string'
        //     ? JSON.parse(plain.metacard.properties.filterTree)
        //     : plain.metacard.properties.filterTree
        // we could do the same thing we do for filterTree in query to get rid of this, but it requires a lot of tech debt cleanup I think
        try {
            plain.metacard.properties.sorts =
                plain.metacard.properties.sorts &&
                    typeof plain.metacard.properties.sorts[0] === 'string'
                    ? plain.metacard.properties.sorts.map(function (sort) {
                        var attribute = sort
                            .split('attribute=')[1]
                            .split(', direction=')[0];
                        var direction = sort.split(', direction=')[1].slice(0, -1);
                        return {
                            attribute: attribute,
                            direction: direction,
                        };
                    })
                    : plain.metacard.properties.sorts;
        }
        catch (err) {
            plain.metacard.properties.sorts =
                plain.metacard.properties.sorts &&
                    typeof plain.metacard.properties.sorts[0] === 'string'
                    ? plain.metacard.properties.sorts.map(function (sort) {
                        var attribute = sort.split(',')[0];
                        var direction = sort.split(',')[1];
                        return {
                            attribute: attribute,
                            direction: direction,
                        };
                    })
                    : plain.metacard.properties.sorts;
        }
    }
    plain.metacard.id = plain.metacard.properties.id;
    plain.id = plain.metacard.properties.id;
    return plain;
};
var LazyQueryResult = /** @class */ (function () {
    function LazyQueryResult(plain, highlights) {
        if (highlights === void 0) { highlights = {}; }
        this.highlights = highlights;
        this.type = 'query-result';
        this.plain = transformPlain({ plain: plain });
        this.isResourceLocal = false || plain.isResourceLocal;
        this['subscriptionsToMe.backboneCreated'] = {};
        this['subscriptionsToMe.backboneSync'] = {};
        this['subscriptionsToMe.selected'] = {};
        this['subscriptionsToMe.filtered'] = {};
        this['metacard.id'] = plain.metacard.properties.id;
        this.isSelected = false;
        this.isFiltered = false;
        humanizeResourceSize(plain);
    }
    LazyQueryResult.prototype.subscribeTo = function (_a) {
        var _this = this;
        var subscribableThing = _a.subscribableThing, callback = _a.callback;
        var id = Math.random().toString();
        // @ts-ignore
        this["subscriptionsToMe.".concat(subscribableThing)][id] = callback;
        return function () {
            // @ts-ignore
            delete _this["subscriptionsToMe.".concat(subscribableThing)][id];
        };
    };
    LazyQueryResult.prototype._notifySubscribers = function (subscribableThing) {
        // @ts-ignore
        var subscribers = this["subscriptionsToMe.".concat(subscribableThing)];
        Object.values(subscribers).forEach(function (callback) { return callback(); });
    };
    LazyQueryResult.prototype['_notifySubscribers.backboneCreated'] = function () {
        this._notifySubscribers('backboneCreated');
    };
    LazyQueryResult.prototype['_notifySubscribers.backboneSync'] = function () {
        this._notifySubscribers('backboneSync');
    };
    LazyQueryResult.prototype['_notifySubscribers.selected'] = function () {
        this._notifySubscribers('selected');
    };
    LazyQueryResult.prototype['_notifySubscribers.filtered'] = function () {
        this._notifySubscribers('filtered');
    };
    LazyQueryResult.prototype._turnOnDebouncing = function () {
        this['_notifySubscribers.backboneCreated'] = _.debounce(this['_notifySubscribers.backboneCreated'], debounceTime);
        this['_notifySubscribers.backboneSync'] = _.debounce(this['_notifySubscribers.backboneSync'], debounceTime);
        this['_notifySubscribers.selected'] = _.debounce(this['_notifySubscribers.selected'], debounceTime);
        this['_notifySubscribers.filtered'] = _.debounce(this['_notifySubscribers.filtered'], debounceTime);
    };
    LazyQueryResult.prototype.syncWithBackbone = function () {
        if (this.backbone) {
            this.plain = transformPlain({ plain: this.backbone.toJSON() });
            humanizeResourceSize(this.plain);
            this['_notifySubscribers.backboneSync']();
        }
    };
    LazyQueryResult.prototype.syncWithPlain = function () {
        this.plain = transformPlain({ plain: __assign({}, this.plain) });
        humanizeResourceSize(this.plain);
        this['_notifySubscribers.backboneSync']();
    };
    // this is a partial update (like title only or something)
    LazyQueryResult.prototype.refreshFromEditResponse = function (response) {
        var _this = this;
        response.forEach(function (part) {
            return part.attributes.forEach(function (attribute) {
                _this.plain.metacard.properties[attribute.attribute] =
                    StartupDataStore.MetacardDefinitions.isMulti(attribute.attribute)
                        ? attribute.values
                        : attribute.values[0];
            });
        });
        // I think we should update the edit endpoint to include the new metacard modified date, as this is just to force a refresh
        this.plain.metacard.properties['metacard.modified'] = new Date().toJSON();
        this.syncWithPlain();
    };
    // we have the entire metacard sent back
    LazyQueryResult.prototype.refreshData = function (metacardProperties) {
        if (metacardProperties !== undefined) {
            this.plain.metacard.properties = metacardProperties;
            this.syncWithPlain();
        }
        else {
            this.refreshDataOverNetwork();
        }
    };
    // just ask the source of truth
    LazyQueryResult.prototype.refreshDataOverNetwork = function () {
        var _this = this;
        //let solr flush
        setTimeout(function () {
            var req = {
                count: 1,
                cql: cql.write(new FilterBuilderClass({
                    type: 'AND',
                    filters: [
                        new FilterBuilderClass({
                            type: 'OR',
                            filters: [
                                new FilterClass({
                                    type: '=',
                                    property: '"id"',
                                    value: _this.plain.metacard.properties['metacard.deleted.id'] ||
                                        _this.plain.id,
                                }),
                                new FilterClass({
                                    type: '=',
                                    property: '"metacard.deleted.id"',
                                    value: _this.plain.id,
                                }),
                            ],
                        }),
                        new FilterClass({
                            type: 'ILIKE',
                            property: '"metacard-tags"',
                            value: '*',
                        }),
                    ],
                })),
                id: '0',
                sort: 'modified:desc',
                src: _this.plain.metacard.properties['source-id'],
                start: 1,
            };
            $.ajax({
                type: 'POST',
                url: './internal/cql',
                data: JSON.stringify(req),
                contentType: 'application/json',
            }).then(_this.parseRefresh.bind(_this), _this.handleRefreshError.bind(_this));
        }, 1000);
    };
    LazyQueryResult.prototype.handleRefreshError = function () {
        //do nothing for now, should we announce this?
    };
    LazyQueryResult.prototype.parseRefresh = function (response) {
        var _this = this;
        response.results.forEach(function (result) {
            _this.plain = result;
        });
        this.syncWithPlain();
    };
    LazyQueryResult.prototype.getDownloadUrl = function () {
        var downloadAction = this.plain.actions.find(function (action) {
            return action.id === 'catalog.data.metacard.resource.alternate-download';
        });
        return downloadAction
            ? downloadAction.url
            : this.plain.metacard.properties['resource-download-url'];
    };
    LazyQueryResult.prototype.getPreview = function () {
        return this.plain.metacard.properties['ext.extracted.text'];
    };
    LazyQueryResult.prototype.hasPreview = function () {
        return this.plain.metacard.properties['ext.extracted.text'] !== undefined;
    };
    LazyQueryResult.prototype.isSearch = function () {
        return this.plain.metacard.properties['metacard-type'] === 'metacard.query';
    };
    LazyQueryResult.prototype.isResource = function () {
        return (this.plain.metacard.properties['metacard-tags'].indexOf('resource') >= 0);
    };
    LazyQueryResult.prototype.isRevision = function () {
        return (this.plain.metacard.properties['metacard-tags'].indexOf('revision') >= 0);
    };
    LazyQueryResult.prototype.isDeleted = function () {
        return (this.plain.metacard.properties['metacard-tags'].indexOf('deleted') >= 0);
    };
    LazyQueryResult.prototype.isRemote = function () {
        var harvestedSources = StartupDataStore.Sources.harvestedSources;
        return (harvestedSources.includes(this.plain.metacard.properties['source-id']) ===
            false);
    };
    LazyQueryResult.prototype.hasGeometry = function (attribute) {
        return (_.filter(this.plain.metacard.properties, function (_value, key) {
            return (attribute === undefined || attribute === key) &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
                    'GEOMETRY';
        }).length > 0);
    };
    LazyQueryResult.prototype.getGeometries = function (attribute) {
        return _.filter(this.plain.metacard.properties, function (_value, key) {
            return !StartupDataStore.Configuration.isHiddenAttribute(key) &&
                (attribute === undefined || attribute === key) &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
                    'GEOMETRY';
        });
    };
    LazyQueryResult.prototype.getPoints = function (attribute) {
        try {
            return this.getGeometries(attribute).reduce(function (pointArray, wkt) {
                return pointArray.concat(TurfMeta.coordAll(wkx.Geometry.parse(wkt).toGeoJSON()));
            }, []);
        }
        catch (err) {
            console.error(err);
            return [];
        }
    };
    LazyQueryResult.prototype.getMapActions = function () {
        return this.plain.actions.filter(function (action) { return action.id.indexOf('catalog.data.metacard.map.') === 0; });
    };
    LazyQueryResult.prototype.hasMapActions = function () {
        return this.getMapActions().length > 0;
    };
    LazyQueryResult.prototype.getExportActions = function () {
        var otherActions = this.getMapActions();
        return this.plain.actions
            .filter(function (action) { return action.title.indexOf('Export') === 0; })
            .filter(function (action) { return otherActions.indexOf(action) === -1; });
    };
    LazyQueryResult.prototype.hasExportActions = function () {
        return this.getExportActions().length > 0;
    };
    LazyQueryResult.prototype.getOtherActions = function () {
        var otherActions = this.getExportActions().concat(this.getMapActions());
        return this.plain.actions.filter(function (action) { return otherActions.indexOf(action) === -1; });
    };
    LazyQueryResult.prototype.hasRelevance = function () {
        return Boolean(this.plain.relevance);
    };
    LazyQueryResult.prototype.getRoundedRelevance = function () {
        return this.plain.relevance.toPrecision(StartupDataStore.Configuration.getRelevancePrecision());
    };
    LazyQueryResult.prototype.hasErrors = function () {
        return Boolean(this.getErrors());
    };
    LazyQueryResult.prototype.getErrors = function () {
        return this.plain.metacard.properties['validation-errors'];
    };
    LazyQueryResult.prototype.hasWarnings = function () {
        return Boolean(this.getWarnings());
    };
    LazyQueryResult.prototype.getWarnings = function () {
        return this.plain.metacard.properties['validation-warnings'];
    };
    LazyQueryResult.prototype.getColor = function () {
        return '#004949';
    };
    LazyQueryResult.prototype.getBackbone = function () {
        if (this.backbone === undefined) {
            this._setBackbone(new QueryResult(this.plain));
        }
        return this.backbone;
    };
    LazyQueryResult.prototype._setBackbone = function (backboneModel) {
        this.backbone = backboneModel;
        this['_notifySubscribers.backboneCreated']();
    };
    LazyQueryResult.prototype.setSelected = function (isSelected) {
        if (this.isSelected !== isSelected) {
            this.isSelected = isSelected;
            this['_notifySubscribers.selected']();
            return true;
        }
        else {
            return false;
        }
    };
    LazyQueryResult.prototype.shiftSelect = function () {
        if (this.parent) {
            this.parent.shiftSelect(this);
        }
    };
    LazyQueryResult.prototype.controlSelect = function () {
        if (this.parent) {
            this.parent.controlSelect(this);
        }
    };
    LazyQueryResult.prototype.select = function () {
        if (this.parent) {
            this.parent.select(this);
        }
    };
    LazyQueryResult.prototype.setFiltered = function (isFiltered) {
        if (this.isFiltered !== isFiltered) {
            this.isFiltered = isFiltered;
            this['_notifySubscribers.filtered']();
            return true;
        }
        else {
            return false;
        }
    };
    return LazyQueryResult;
}());
export { LazyQueryResult };
//# sourceMappingURL=LazyQueryResult.js.map