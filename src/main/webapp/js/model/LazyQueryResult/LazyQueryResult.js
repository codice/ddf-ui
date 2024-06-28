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
            return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(key) &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF6eVF1ZXJ5UmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFlQSxPQUFPLFdBQVcsTUFBTSxnQkFBZ0IsQ0FBQTtBQUV4QyxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUE7QUFDM0IsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sS0FBSyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ3RDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUNyQixPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9EQUFvRCxDQUFBO0FBQzNELE9BQU8sTUFBTSxNQUFNLGNBQWMsQ0FBQTtBQUNqQyxJQUFNLFlBQVksR0FBRyxFQUFFLENBQUE7QUFDdkIsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JELFNBQVMsa0JBQWtCLENBQUMsTUFBa0I7SUFDNUMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDeEIsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsRUFBRSxLQUFLLGlDQUFpQyxFQUEvQyxDQUErQyxDQUM1RCxDQUFBO0FBQ0gsQ0FBQztBQUNELFNBQVMsb0JBQW9CLENBQUMsS0FBaUI7SUFDN0MsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRTtRQUM5QyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUM3RCxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FDM0MsQ0FBQTtLQUNGO0FBQ0gs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V0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzlCO0lBQ0gsQ0FBQztJQUNELHVDQUFhLEdBQWI7UUFDRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNoQztJQUNILENBQUM7SUFDRCxnQ0FBTSxHQUFOO1FBQ0UsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDekI7SUFDSCxDQUFDO0lBQ0QscUNBQVcsR0FBWCxVQUFZLFVBQW1CO1FBQzdCLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7WUFDNUIsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEVBQUUsQ0FBQTtZQUNyQyxPQUFPLElBQUksQ0FBQTtTQUNaO2FBQU07WUFDTCxPQUFPLEtBQUssQ0FBQTtTQUNiO0lBQ0gsQ0FBQztJQUVILHNCQUFDO0FBQUQsQ0FBQyxBQTVXRCxJQTRXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgUmVzdWx0VHlwZSB9IGZyb20gJy4uL1R5cGVzJ1xuaW1wb3J0IFF1ZXJ5UmVzdWx0IGZyb20gJy4uL1F1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0cywgQXR0cmlidXRlSGlnaGxpZ2h0cyB9IGZyb20gJy4vTGF6eVF1ZXJ5UmVzdWx0cydcbmltcG9ydCBjcWwgZnJvbSAnLi4vLi4vY3FsJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCAqIGFzIFR1cmZNZXRhIGZyb20gJ0B0dXJmL21ldGEnXG5pbXBvcnQgd2t4IGZyb20gJ3dreCdcbmltcG9ydCB7XG4gIEZpbHRlckJ1aWxkZXJDbGFzcyxcbiAgRmlsdGVyQ2xhc3MsXG59IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi9Db21tb24nXG5jb25zdCBkZWJvdW5jZVRpbWUgPSA1MFxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uL1N0YXJ0dXAvc3RhcnR1cCdcbmZ1bmN0aW9uIGdldFRodW1ibmFpbEFjdGlvbihyZXN1bHQ6IFJlc3VsdFR5cGUpIHtcbiAgcmV0dXJuIHJlc3VsdC5hY3Rpb25zLmZpbmQoXG4gICAgKGFjdGlvbikgPT4gYWN0aW9uLmlkID09PSAnY2F0YWxvZy5kYXRhLm1ldGFjYXJkLnRodW1ibmFpbCdcbiAgKVxufVxuZnVuY3Rpb24gaHVtYW5pemVSZXNvdXJjZVNpemUocGxhaW46IFJlc3VsdFR5cGUpIHtcbiAgaWYgKHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3Jlc291cmNlLXNpemUnXSkge1xuICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3Jlc291cmNlLXNpemUnXSA9IENvbW1vbi5nZXRGaWxlU2l6ZShcbiAgICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3Jlc291cmNlLXNpemUnXVxuICAgIClcbiAgfVxufVxuLyoqXG4gKiBBZGQgZGVmYXVsdHMsIGV0Yy4gIFdlIG5lZWQgdG8gbWFrZSBzdXJlIGV2ZXJ5dGhpbmcgaGFzIGEgdGFnIGF0IHRoZSB2ZXJ5IGxlYXN0XG4gKi9cbmNvbnN0IHRyYW5zZm9ybVBsYWluID0gKHtcbiAgcGxhaW4sXG59OiB7XG4gIHBsYWluOiBMYXp5UXVlcnlSZXN1bHRbJ3BsYWluJ11cbn0pOiBMYXp5UXVlcnlSZXN1bHRbJ3BsYWluJ10gPT4ge1xuICBpZiAoIXBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLXRhZ3MnXSkge1xuICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLXRhZ3MnXSA9IFsncmVzb3VyY2UnXVxuICB9XG4gIGNvbnN0IHRodW1ibmFpbEFjdGlvbiA9IGdldFRodW1ibmFpbEFjdGlvbihwbGFpbilcbiAgaWYgKHRodW1ibmFpbEFjdGlvbikge1xuICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGh1bWJuYWlsID0gdGh1bWJuYWlsQWN0aW9uLnVybFxuICB9XG4gIHBsYWluLm1ldGFjYXJkVHlwZSA9IHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLXR5cGUnXVxuICBpZiAoXG4gICAgcGxhaW4ubWV0YWNhcmRUeXBlID09PSAnbWV0YWNhcmQucXVlcnknIHx8XG4gICAgKHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLmRlbGV0ZWQudGFncyddICYmXG4gICAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5kZWxldGVkLnRhZ3MnXS5pbmNsdWRlcygncXVlcnknKSlcbiAgKSB7XG4gICAgLy8gc2luY2UgdGhlIHBsYWluIGNxbCBzZWFyY2ggZW5kcG9pbnQgZG9lc24ndCB1bmRlcnN0YW5kIG1vcmUgY29tcGxleCBwcm9wZXJ0aWVzIG9uIG1ldGFjYXJkcywgd2UgY2FuIGhhbmRsZSB0aGVtIGxpa2UgdGhpc1xuICAgIC8vIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuZmlsdGVyVHJlZSA9XG4gICAgLy8gICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmZpbHRlclRyZWUgJiZcbiAgICAvLyAgIHR5cGVvZiBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmZpbHRlclRyZWUgPT09ICdzdHJpbmcnXG4gICAgLy8gICAgID8gSlNPTi5wYXJzZShwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmZpbHRlclRyZWUpXG4gICAgLy8gICAgIDogcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5maWx0ZXJUcmVlXG4gICAgLy8gd2UgY291bGQgZG8gdGhlIHNhbWUgdGhpbmcgd2UgZG8gZm9yIGZpbHRlclRyZWUgaW4gcXVlcnkgdG8gZ2V0IHJpZCBvZiB0aGlzLCBidXQgaXQgcmVxdWlyZXMgYSBsb3Qgb2YgdGVjaCBkZWJ0IGNsZWFudXAgSSB0aGlua1xuICAgIHRyeSB7XG4gICAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnNvcnRzID1cbiAgICAgICAgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0cyAmJlxuICAgICAgICB0eXBlb2YgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0c1swXSA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IChwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnNvcnRzIGFzIHN0cmluZ1tdKS5tYXAoKHNvcnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gc29ydFxuICAgICAgICAgICAgICAgIC5zcGxpdCgnYXR0cmlidXRlPScpWzFdXG4gICAgICAgICAgICAgICAgLnNwbGl0KCcsIGRpcmVjdGlvbj0nKVswXVxuICAgICAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBzb3J0LnNwbGl0KCcsIGRpcmVjdGlvbj0nKVsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIDogcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0c1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0cyA9XG4gICAgICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHMgJiZcbiAgICAgICAgdHlwZW9mIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHNbMF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgPyAocGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0cyBhcyBzdHJpbmdbXSkubWFwKChzb3J0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHNvcnQuc3BsaXQoJywnKVswXVxuICAgICAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBzb3J0LnNwbGl0KCcsJylbMV1cbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIDogcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0c1xuICAgIH1cbiAgfVxuICBwbGFpbi5tZXRhY2FyZC5pZCA9IHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuaWRcbiAgcGxhaW4uaWQgPSBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmlkXG4gIHJldHVybiBwbGFpblxufVxudHlwZSBTdWJzY3JpYmFibGVUeXBlID1cbiAgfCAnYmFja2JvbmVDcmVhdGVkJ1xuICB8ICdzZWxlY3RlZCdcbiAgfCAnZmlsdGVyZWQnXG4gIHwgJ2JhY2tib25lU3luYydcbnR5cGUgU3Vic2NyaXB0aW9uVHlwZSA9IHtcbiAgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZFxufVxuZXhwb3J0IGNsYXNzIExhenlRdWVyeVJlc3VsdCB7XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuYmFja2JvbmVDcmVhdGVkJ106IHtcbiAgICBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkXG4gIH07XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuYmFja2JvbmVTeW5jJ106IHtcbiAgICBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkXG4gIH07XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuc2VsZWN0ZWQnXToge1xuICAgIFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWRcbiAgfTtcbiAgWydzdWJzY3JpcHRpb25zVG9NZS5maWx0ZXJlZCddOiB7XG4gICAgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZFxuICB9XG4gIHN1YnNjcmliZVRvKHtcbiAgICBzdWJzY3JpYmFibGVUaGluZyxcbiAgICBjYWxsYmFjayxcbiAgfToge1xuICAgIHN1YnNjcmliYWJsZVRoaW5nOiBTdWJzY3JpYmFibGVUeXBlXG4gICAgY2FsbGJhY2s6ICgpID0+IHZvaWRcbiAgfSkge1xuICAgIGNvbnN0IGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXNbYHN1YnNjcmlwdGlvbnNUb01lLiR7c3Vic2NyaWJhYmxlVGhpbmd9YF1baWRdID0gY2FsbGJhY2tcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgZGVsZXRlIHRoaXNbYHN1YnNjcmlwdGlvbnNUb01lLiR7c3Vic2NyaWJhYmxlVGhpbmd9YF1baWRdXG4gICAgfVxuICB9XG4gIF9ub3RpZnlTdWJzY3JpYmVycyhzdWJzY3JpYmFibGVUaGluZzogU3Vic2NyaWJhYmxlVHlwZSkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBzdWJzY3JpYmVycyA9IHRoaXNbXG4gICAgICBgc3Vic2NyaXB0aW9uc1RvTWUuJHtzdWJzY3JpYmFibGVUaGluZ31gXG4gICAgXSBhcyBTdWJzY3JpcHRpb25UeXBlXG4gICAgT2JqZWN0LnZhbHVlcyhzdWJzY3JpYmVycykuZm9yRWFjaCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKCkpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVDcmVhdGVkJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ2JhY2tib25lQ3JlYXRlZCcpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVTeW5jJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ2JhY2tib25lU3luYycpXG4gIH1cbiAgWydfbm90aWZ5U3Vic2NyaWJlcnMuc2VsZWN0ZWQnXSgpIHtcbiAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycygnc2VsZWN0ZWQnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ2ZpbHRlcmVkJylcbiAgfVxuICBfdHVybk9uRGVib3VuY2luZygpIHtcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVDcmVhdGVkJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lQ3JlYXRlZCddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5iYWNrYm9uZVN5bmMnXSA9IF8uZGVib3VuY2UoXG4gICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVTeW5jJ10sXG4gICAgICBkZWJvdW5jZVRpbWVcbiAgICApXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkJ10sXG4gICAgICBkZWJvdW5jZVRpbWVcbiAgICApXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkJ10sXG4gICAgICBkZWJvdW5jZVRpbWVcbiAgICApXG4gIH1cbiAgaW5kZXg6IG51bWJlclxuICBwcmV2PzogTGF6eVF1ZXJ5UmVzdWx0XG4gIG5leHQ/OiBMYXp5UXVlcnlSZXN1bHRcbiAgcGFyZW50PzogTGF6eVF1ZXJ5UmVzdWx0c1xuICBwbGFpbjogUmVzdWx0VHlwZVxuICBiYWNrYm9uZT86IGFueVxuICBpc1Jlc291cmNlTG9jYWw6IGJvb2xlYW5cbiAgaGlnaGxpZ2h0czogQXR0cmlidXRlSGlnaGxpZ2h0c1xuICB0eXBlOiAncXVlcnktcmVzdWx0JztcbiAgWydtZXRhY2FyZC5pZCddOiBzdHJpbmdcbiAgaXNTZWxlY3RlZDogYm9vbGVhblxuICBpc0ZpbHRlcmVkOiBib29sZWFuXG4gIGNvbnN0cnVjdG9yKHBsYWluOiBSZXN1bHRUeXBlLCBoaWdobGlnaHRzOiBBdHRyaWJ1dGVIaWdobGlnaHRzID0ge30pIHtcbiAgICB0aGlzLmhpZ2hsaWdodHMgPSBoaWdobGlnaHRzXG4gICAgdGhpcy50eXBlID0gJ3F1ZXJ5LXJlc3VsdCdcbiAgICB0aGlzLnBsYWluID0gdHJhbnNmb3JtUGxhaW4oeyBwbGFpbiB9KVxuICAgIHRoaXMuaXNSZXNvdXJjZUxvY2FsID0gZmFsc2UgfHwgcGxhaW4uaXNSZXNvdXJjZUxvY2FsXG4gICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuYmFja2JvbmVDcmVhdGVkJ10gPSB7fVxuICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLmJhY2tib25lU3luYyddID0ge31cbiAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5zZWxlY3RlZCddID0ge31cbiAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5maWx0ZXJlZCddID0ge31cbiAgICB0aGlzWydtZXRhY2FyZC5pZCddID0gcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5pZFxuICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlXG4gICAgdGhpcy5pc0ZpbHRlcmVkID0gZmFsc2VcbiAgICBodW1hbml6ZVJlc291cmNlU2l6ZShwbGFpbilcbiAgfVxuICBzeW5jV2l0aEJhY2tib25lKCkge1xuICAgIGlmICh0aGlzLmJhY2tib25lKSB7XG4gICAgICB0aGlzLnBsYWluID0gdHJhbnNmb3JtUGxhaW4oeyBwbGFpbjogdGhpcy5iYWNrYm9uZS50b0pTT04oKSB9KVxuICAgICAgaHVtYW5pemVSZXNvdXJjZVNpemUodGhpcy5wbGFpbilcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5iYWNrYm9uZVN5bmMnXSgpXG4gICAgfVxuICB9XG4gIHN5bmNXaXRoUGxhaW4oKSB7XG4gICAgdGhpcy5wbGFpbiA9IHRyYW5zZm9ybVBsYWluKHsgcGxhaW46IHsgLi4udGhpcy5wbGFpbiB9IH0pXG4gICAgaHVtYW5pemVSZXNvdXJjZVNpemUodGhpcy5wbGFpbilcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVTeW5jJ10oKVxuICB9XG4gIC8vIHRoaXMgaXMgYSBwYXJ0aWFsIHVwZGF0ZSAobGlrZSB0aXRsZSBvbmx5IG9yIHNvbWV0aGluZylcbiAgcmVmcmVzaEZyb21FZGl0UmVzcG9uc2UoXG4gICAgcmVzcG9uc2U6IFtcbiAgICAgIHtcbiAgICAgICAgaWRzOiBzdHJpbmdbXVxuICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgYXR0cmlidXRlOiBzdHJpbmdcbiAgICAgICAgICAgIHZhbHVlczogc3RyaW5nW11cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gICkge1xuICAgIHJlc3BvbnNlLmZvckVhY2goKHBhcnQpID0+XG4gICAgICBwYXJ0LmF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICAgIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyaWJ1dGUuYXR0cmlidXRlXSA9XG4gICAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzTXVsdGkoYXR0cmlidXRlLmF0dHJpYnV0ZSlcbiAgICAgICAgICAgID8gYXR0cmlidXRlLnZhbHVlc1xuICAgICAgICAgICAgOiBhdHRyaWJ1dGUudmFsdWVzWzBdXG4gICAgICB9KVxuICAgIClcbiAgICAvLyBJIHRoaW5rIHdlIHNob3VsZCB1cGRhdGUgdGhlIGVkaXQgZW5kcG9pbnQgdG8gaW5jbHVkZSB0aGUgbmV3IG1ldGFjYXJkIG1vZGlmaWVkIGRhdGUsIGFzIHRoaXMgaXMganVzdCB0byBmb3JjZSBhIHJlZnJlc2hcbiAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLm1vZGlmaWVkJ10gPSBuZXcgRGF0ZSgpLnRvSlNPTigpXG4gICAgdGhpcy5zeW5jV2l0aFBsYWluKClcbiAgfVxuICAvLyB3ZSBoYXZlIHRoZSBlbnRpcmUgbWV0YWNhcmQgc2VudCBiYWNrXG4gIHJlZnJlc2hEYXRhKFxuICAgIG1ldGFjYXJkUHJvcGVydGllczogTGF6eVF1ZXJ5UmVzdWx0WydwbGFpbiddWydtZXRhY2FyZCddWydwcm9wZXJ0aWVzJ11cbiAgKSB7XG4gICAgaWYgKG1ldGFjYXJkUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMgPSBtZXRhY2FyZFByb3BlcnRpZXNcbiAgICAgIHRoaXMuc3luY1dpdGhQbGFpbigpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVmcmVzaERhdGFPdmVyTmV0d29yaygpXG4gICAgfVxuICB9XG4gIC8vIGp1c3QgYXNrIHRoZSBzb3VyY2Ugb2YgdHJ1dGhcbiAgcmVmcmVzaERhdGFPdmVyTmV0d29yaygpIHtcbiAgICAvL2xldCBzb2xyIGZsdXNoXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCByZXEgPSB7XG4gICAgICAgIGNvdW50OiAxLFxuICAgICAgICBjcWw6IGNxbC53cml0ZShcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdcImlkXCInLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTpcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLmRlbGV0ZWQuaWQnXSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxhaW4uaWQsXG4gICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdcIm1ldGFjYXJkLmRlbGV0ZWQuaWRcIicsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnBsYWluLmlkLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ1wibWV0YWNhcmQtdGFnc1wiJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSlcbiAgICAgICAgKSxcbiAgICAgICAgaWQ6ICcwJyxcbiAgICAgICAgc29ydDogJ21vZGlmaWVkOmRlc2MnLFxuICAgICAgICBzcmM6IHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ10sXG4gICAgICB9XG4gICAgICAkLmFqYXgoe1xuICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy4vaW50ZXJuYWwvY3FsJyxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocmVxKSxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0pLnRoZW4odGhpcy5wYXJzZVJlZnJlc2guYmluZCh0aGlzKSwgdGhpcy5oYW5kbGVSZWZyZXNoRXJyb3IuYmluZCh0aGlzKSlcbiAgICB9LCAxMDAwKVxuICB9XG4gIGhhbmRsZVJlZnJlc2hFcnJvcigpIHtcbiAgICAvL2RvIG5vdGhpbmcgZm9yIG5vdywgc2hvdWxkIHdlIGFubm91bmNlIHRoaXM/XG4gIH1cbiAgcGFyc2VSZWZyZXNoKHJlc3BvbnNlOiB7IHJlc3VsdHM6IFJlc3VsdFR5cGVbXSB9KSB7XG4gICAgcmVzcG9uc2UucmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgIHRoaXMucGxhaW4gPSByZXN1bHRcbiAgICB9KVxuICAgIHRoaXMuc3luY1dpdGhQbGFpbigpXG4gIH1cbiAgZ2V0RG93bmxvYWRVcmwoKTogc3RyaW5nIHtcbiAgICBjb25zdCBkb3dubG9hZEFjdGlvbiA9IHRoaXMucGxhaW4uYWN0aW9ucy5maW5kKFxuICAgICAgKGFjdGlvbikgPT5cbiAgICAgICAgYWN0aW9uLmlkID09PSAnY2F0YWxvZy5kYXRhLm1ldGFjYXJkLnJlc291cmNlLmFsdGVybmF0ZS1kb3dubG9hZCdcbiAgICApXG5cbiAgICByZXR1cm4gZG93bmxvYWRBY3Rpb25cbiAgICAgID8gZG93bmxvYWRBY3Rpb24udXJsXG4gICAgICA6IHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1sncmVzb3VyY2UtZG93bmxvYWQtdXJsJ11cbiAgfVxuICBnZXRQcmV2aWV3KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snZXh0LmV4dHJhY3RlZC50ZXh0J11cbiAgfVxuICBoYXNQcmV2aWV3KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ2V4dC5leHRyYWN0ZWQudGV4dCddICE9PSB1bmRlZmluZWRcbiAgfVxuICBpc1NlYXJjaCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10eXBlJ10gPT09ICdtZXRhY2FyZC5xdWVyeSdcbiAgfVxuICBpc1Jlc291cmNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLXRhZ3MnXS5pbmRleE9mKCdyZXNvdXJjZScpID49IDBcbiAgICApXG4gIH1cbiAgaXNSZXZpc2lvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10YWdzJ10uaW5kZXhPZigncmV2aXNpb24nKSA+PSAwXG4gICAgKVxuICB9XG4gIGlzRGVsZXRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10YWdzJ10uaW5kZXhPZignZGVsZXRlZCcpID49IDBcbiAgICApXG4gIH1cbiAgaXNSZW1vdGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaGFydmVzdGVkU291cmNlcyA9IFN0YXJ0dXBEYXRhU3RvcmUuU291cmNlcy5oYXJ2ZXN0ZWRTb3VyY2VzXG4gICAgcmV0dXJuIChcbiAgICAgIGhhcnZlc3RlZFNvdXJjZXMuaW5jbHVkZXModGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzb3VyY2UtaWQnXSkgPT09XG4gICAgICBmYWxzZVxuICAgIClcbiAgfVxuICBoYXNHZW9tZXRyeShhdHRyaWJ1dGU/OiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgXy5maWx0ZXIoXG4gICAgICAgIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcyxcbiAgICAgICAgKF92YWx1ZTogYW55LCBrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAoYXR0cmlidXRlID09PSB1bmRlZmluZWQgfHwgYXR0cmlidXRlID09PSBrZXkpICYmXG4gICAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2tleV0gJiZcbiAgICAgICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClba2V5XS50eXBlID09PVxuICAgICAgICAgICAgJ0dFT01FVFJZJ1xuICAgICAgKS5sZW5ndGggPiAwXG4gICAgKVxuICB9XG4gIGdldEdlb21ldHJpZXMoYXR0cmlidXRlPzogYW55KTogYW55IHtcbiAgICByZXR1cm4gXy5maWx0ZXIoXG4gICAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMsXG4gICAgICAoX3ZhbHVlOiBhbnksIGtleTogc3RyaW5nKSA9PlxuICAgICAgICAhU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzSGlkZGVuQXR0cmlidXRlKGtleSkgJiZcbiAgICAgICAgKGF0dHJpYnV0ZSA9PT0gdW5kZWZpbmVkIHx8IGF0dHJpYnV0ZSA9PT0ga2V5KSAmJlxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClba2V5XSAmJlxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClba2V5XS50eXBlID09PVxuICAgICAgICAgICdHRU9NRVRSWSdcbiAgICApXG4gIH1cbiAgZ2V0UG9pbnRzKGF0dHJpYnV0ZT86IGFueSk6IGFueSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLmdldEdlb21ldHJpZXMoYXR0cmlidXRlKS5yZWR1Y2UoXG4gICAgICAgIChwb2ludEFycmF5OiBhbnksIHdrdDogYW55KSA9PlxuICAgICAgICAgIHBvaW50QXJyYXkuY29uY2F0KFxuICAgICAgICAgICAgVHVyZk1ldGEuY29vcmRBbGwod2t4Lkdlb21ldHJ5LnBhcnNlKHdrdCkudG9HZW9KU09OKCkgYXMgYW55KVxuICAgICAgICAgICksXG4gICAgICAgIFtdXG4gICAgICApXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgfVxuICBnZXRNYXBBY3Rpb25zKCkge1xuICAgIHJldHVybiB0aGlzLnBsYWluLmFjdGlvbnMuZmlsdGVyKFxuICAgICAgKGFjdGlvbikgPT4gYWN0aW9uLmlkLmluZGV4T2YoJ2NhdGFsb2cuZGF0YS5tZXRhY2FyZC5tYXAuJykgPT09IDBcbiAgICApXG4gIH1cbiAgaGFzTWFwQWN0aW9ucygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNYXBBY3Rpb25zKCkubGVuZ3RoID4gMFxuICB9XG4gIGdldEV4cG9ydEFjdGlvbnMoKSB7XG4gICAgY29uc3Qgb3RoZXJBY3Rpb25zID0gdGhpcy5nZXRNYXBBY3Rpb25zKClcbiAgICByZXR1cm4gdGhpcy5wbGFpbi5hY3Rpb25zXG4gICAgICAuZmlsdGVyKChhY3Rpb24pID0+IGFjdGlvbi50aXRsZS5pbmRleE9mKCdFeHBvcnQnKSA9PT0gMClcbiAgICAgIC5maWx0ZXIoKGFjdGlvbikgPT4gb3RoZXJBY3Rpb25zLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEpXG4gIH1cbiAgaGFzRXhwb3J0QWN0aW9ucygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHBvcnRBY3Rpb25zKCkubGVuZ3RoID4gMFxuICB9XG4gIGdldE90aGVyQWN0aW9ucygpIHtcbiAgICBjb25zdCBvdGhlckFjdGlvbnMgPSB0aGlzLmdldEV4cG9ydEFjdGlvbnMoKS5jb25jYXQodGhpcy5nZXRNYXBBY3Rpb25zKCkpXG4gICAgcmV0dXJuIHRoaXMucGxhaW4uYWN0aW9ucy5maWx0ZXIoXG4gICAgICAoYWN0aW9uKSA9PiBvdGhlckFjdGlvbnMuaW5kZXhPZihhY3Rpb24pID09PSAtMVxuICAgIClcbiAgfVxuICBoYXNSZWxldmFuY2UoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5wbGFpbi5yZWxldmFuY2UpXG4gIH1cbiAgZ2V0Um91bmRlZFJlbGV2YW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wbGFpbi5yZWxldmFuY2UudG9QcmVjaXNpb24oXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVsZXZhbmNlUHJlY2lzaW9uKClcbiAgICApXG4gIH1cbiAgaGFzRXJyb3JzKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuZ2V0RXJyb3JzKCkpXG4gIH1cbiAgZ2V0RXJyb3JzKCkge1xuICAgIHJldHVybiB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3ZhbGlkYXRpb24tZXJyb3JzJ11cbiAgfVxuICBoYXNXYXJuaW5ncygpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLmdldFdhcm5pbmdzKCkpXG4gIH1cbiAgZ2V0V2FybmluZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1sndmFsaWRhdGlvbi13YXJuaW5ncyddXG4gIH1cbiAgZ2V0Q29sb3IoKSB7XG4gICAgcmV0dXJuICcjMDA0OTQ5J1xuICB9XG4gIGdldEJhY2tib25lKCkge1xuICAgIGlmICh0aGlzLmJhY2tib25lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3NldEJhY2tib25lKG5ldyBRdWVyeVJlc3VsdCh0aGlzLnBsYWluKSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmFja2JvbmVcbiAgfVxuICBfc2V0QmFja2JvbmUoYmFja2JvbmVNb2RlbDogQmFja2JvbmUuTW9kZWwpIHtcbiAgICB0aGlzLmJhY2tib25lID0gYmFja2JvbmVNb2RlbFxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5iYWNrYm9uZUNyZWF0ZWQnXSgpXG4gIH1cbiAgc2V0U2VsZWN0ZWQoaXNTZWxlY3RlZDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQgIT09IGlzU2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWRcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zZWxlY3RlZCddKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICBzaGlmdFNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGFyZW50LnNoaWZ0U2VsZWN0KHRoaXMpXG4gICAgfVxuICB9XG4gIGNvbnRyb2xTZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICB0aGlzLnBhcmVudC5jb250cm9sU2VsZWN0KHRoaXMpXG4gICAgfVxuICB9XG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGFyZW50LnNlbGVjdCh0aGlzKVxuICAgIH1cbiAgfVxuICBzZXRGaWx0ZXJlZChpc0ZpbHRlcmVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuaXNGaWx0ZXJlZCAhPT0gaXNGaWx0ZXJlZCkge1xuICAgICAgdGhpcy5pc0ZpbHRlcmVkID0gaXNGaWx0ZXJlZFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmZpbHRlcmVkJ10oKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIGN1cnJlbnRPdmVybGF5VXJsPzogc3RyaW5nXG59XG4iXX0=