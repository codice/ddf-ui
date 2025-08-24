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
        }).flat();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF6eVF1ZXJ5UmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFlQSxPQUFPLFdBQVcsTUFBTSxnQkFBZ0IsQ0FBQTtBQUV4QyxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUE7QUFDM0IsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sS0FBSyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ3RDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUNyQixPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLFdBQVcsR0FDWixNQUFNLG9EQUFvRCxDQUFBO0FBQzNELE9BQU8sTUFBTSxNQUFNLGNBQWMsQ0FBQTtBQUNqQyxJQUFNLFlBQVksR0FBRyxFQUFFLENBQUE7QUFDdkIsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JELFNBQVMsa0JBQWtCLENBQUMsTUFBa0I7SUFDNUMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDeEIsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsRUFBRSxLQUFLLGlDQUFpQyxFQUEvQyxDQUErQyxDQUM1RCxDQUFBO0FBQ0gsQ0FBQztBQUNELFNBQVMsb0JBQW9CLENBQUMsS0FBaUI7SUFDN0MsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQy9DLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQzdELEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUMzQyxDQUFBO0lBQ0gs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QUE7WUFDckMsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFDRCxxQ0FBVyxHQUFYO1FBQ0UsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFDRCx1Q0FBYSxHQUFiO1FBQ0UsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDakMsQ0FBQztJQUNILENBQUM7SUFDRCxnQ0FBTSxHQUFOO1FBQ0UsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFDRCxxQ0FBVyxHQUFYLFVBQVksVUFBbUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO1lBQzVCLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLENBQUE7WUFDckMsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFSCxzQkFBQztBQUFELENBQUMsQUE1V0QsSUE0V0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7IFJlc3VsdFR5cGUgfSBmcm9tICcuLi9UeXBlcydcbmltcG9ydCBRdWVyeVJlc3VsdCBmcm9tICcuLi9RdWVyeVJlc3VsdCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdHMsIEF0dHJpYnV0ZUhpZ2hsaWdodHMgfSBmcm9tICcuL0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQgY3FsIGZyb20gJy4uLy4uL2NxbCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgKiBhcyBUdXJmTWV0YSBmcm9tICdAdHVyZi9tZXRhJ1xuaW1wb3J0IHdreCBmcm9tICd3a3gnXG5pbXBvcnQge1xuICBGaWx0ZXJCdWlsZGVyQ2xhc3MsXG4gIEZpbHRlckNsYXNzLFxufSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vLi4vQ29tbW9uJ1xuY29uc3QgZGVib3VuY2VUaW1lID0gNTBcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi9TdGFydHVwL3N0YXJ0dXAnXG5mdW5jdGlvbiBnZXRUaHVtYm5haWxBY3Rpb24ocmVzdWx0OiBSZXN1bHRUeXBlKSB7XG4gIHJldHVybiByZXN1bHQuYWN0aW9ucy5maW5kKFxuICAgIChhY3Rpb24pID0+IGFjdGlvbi5pZCA9PT0gJ2NhdGFsb2cuZGF0YS5tZXRhY2FyZC50aHVtYm5haWwnXG4gIClcbn1cbmZ1bmN0aW9uIGh1bWFuaXplUmVzb3VyY2VTaXplKHBsYWluOiBSZXN1bHRUeXBlKSB7XG4gIGlmIChwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydyZXNvdXJjZS1zaXplJ10pIHtcbiAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydyZXNvdXJjZS1zaXplJ10gPSBDb21tb24uZ2V0RmlsZVNpemUoXG4gICAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydyZXNvdXJjZS1zaXplJ11cbiAgICApXG4gIH1cbn1cbi8qKlxuICogQWRkIGRlZmF1bHRzLCBldGMuICBXZSBuZWVkIHRvIG1ha2Ugc3VyZSBldmVyeXRoaW5nIGhhcyBhIHRhZyBhdCB0aGUgdmVyeSBsZWFzdFxuICovXG5jb25zdCB0cmFuc2Zvcm1QbGFpbiA9ICh7XG4gIHBsYWluLFxufToge1xuICBwbGFpbjogTGF6eVF1ZXJ5UmVzdWx0WydwbGFpbiddXG59KTogTGF6eVF1ZXJ5UmVzdWx0WydwbGFpbiddID0+IHtcbiAgaWYgKCFwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10YWdzJ10pIHtcbiAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10YWdzJ10gPSBbJ3Jlc291cmNlJ11cbiAgfVxuICBjb25zdCB0aHVtYm5haWxBY3Rpb24gPSBnZXRUaHVtYm5haWxBY3Rpb24ocGxhaW4pXG4gIGlmICh0aHVtYm5haWxBY3Rpb24pIHtcbiAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRodW1ibmFpbCA9IHRodW1ibmFpbEFjdGlvbi51cmxcbiAgfVxuICBwbGFpbi5tZXRhY2FyZFR5cGUgPSBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10eXBlJ11cbiAgaWYgKFxuICAgIHBsYWluLm1ldGFjYXJkVHlwZSA9PT0gJ21ldGFjYXJkLnF1ZXJ5JyB8fFxuICAgIChwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5kZWxldGVkLnRhZ3MnXSAmJlxuICAgICAgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQuZGVsZXRlZC50YWdzJ10uaW5jbHVkZXMoJ3F1ZXJ5JykpXG4gICkge1xuICAgIC8vIHNpbmNlIHRoZSBwbGFpbiBjcWwgc2VhcmNoIGVuZHBvaW50IGRvZXNuJ3QgdW5kZXJzdGFuZCBtb3JlIGNvbXBsZXggcHJvcGVydGllcyBvbiBtZXRhY2FyZHMsIHdlIGNhbiBoYW5kbGUgdGhlbSBsaWtlIHRoaXNcbiAgICAvLyBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmZpbHRlclRyZWUgPVxuICAgIC8vICAgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5maWx0ZXJUcmVlICYmXG4gICAgLy8gICB0eXBlb2YgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5maWx0ZXJUcmVlID09PSAnc3RyaW5nJ1xuICAgIC8vICAgICA/IEpTT04ucGFyc2UocGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5maWx0ZXJUcmVlKVxuICAgIC8vICAgICA6IHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuZmlsdGVyVHJlZVxuICAgIC8vIHdlIGNvdWxkIGRvIHRoZSBzYW1lIHRoaW5nIHdlIGRvIGZvciBmaWx0ZXJUcmVlIGluIHF1ZXJ5IHRvIGdldCByaWQgb2YgdGhpcywgYnV0IGl0IHJlcXVpcmVzIGEgbG90IG9mIHRlY2ggZGVidCBjbGVhbnVwIEkgdGhpbmtcbiAgICB0cnkge1xuICAgICAgcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0cyA9XG4gICAgICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHMgJiZcbiAgICAgICAgdHlwZW9mIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHNbMF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgPyAocGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5zb3J0cyBhcyBzdHJpbmdbXSkubWFwKChzb3J0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHNvcnRcbiAgICAgICAgICAgICAgICAuc3BsaXQoJ2F0dHJpYnV0ZT0nKVsxXVxuICAgICAgICAgICAgICAgIC5zcGxpdCgnLCBkaXJlY3Rpb249JylbMF1cbiAgICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gc29ydC5zcGxpdCgnLCBkaXJlY3Rpb249JylbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICA6IHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHNcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHMgPVxuICAgICAgICBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnNvcnRzICYmXG4gICAgICAgIHR5cGVvZiBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnNvcnRzWzBdID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gKHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHMgYXMgc3RyaW5nW10pLm1hcCgoc29ydCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBzb3J0LnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gc29ydC5zcGxpdCgnLCcpWzFdXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICA6IHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuc29ydHNcbiAgICB9XG4gIH1cbiAgcGxhaW4ubWV0YWNhcmQuaWQgPSBwbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmlkXG4gIHBsYWluLmlkID0gcGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5pZFxuICByZXR1cm4gcGxhaW5cbn1cbnR5cGUgU3Vic2NyaWJhYmxlVHlwZSA9XG4gIHwgJ2JhY2tib25lQ3JlYXRlZCdcbiAgfCAnc2VsZWN0ZWQnXG4gIHwgJ2ZpbHRlcmVkJ1xuICB8ICdiYWNrYm9uZVN5bmMnXG50eXBlIFN1YnNjcmlwdGlvblR5cGUgPSB7XG4gIFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWRcbn1cbmV4cG9ydCBjbGFzcyBMYXp5UXVlcnlSZXN1bHQge1xuICBbJ3N1YnNjcmlwdGlvbnNUb01lLmJhY2tib25lQ3JlYXRlZCddOiB7XG4gICAgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZFxuICB9O1xuICBbJ3N1YnNjcmlwdGlvbnNUb01lLmJhY2tib25lU3luYyddOiB7XG4gICAgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZFxuICB9O1xuICBbJ3N1YnNjcmlwdGlvbnNUb01lLnNlbGVjdGVkJ106IHtcbiAgICBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkXG4gIH07XG4gIFsnc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyZWQnXToge1xuICAgIFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWRcbiAgfVxuICBzdWJzY3JpYmVUbyh7XG4gICAgc3Vic2NyaWJhYmxlVGhpbmcsXG4gICAgY2FsbGJhY2ssXG4gIH06IHtcbiAgICBzdWJzY3JpYmFibGVUaGluZzogU3Vic2NyaWJhYmxlVHlwZVxuICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkXG4gIH0pIHtcbiAgICBjb25zdCBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKVxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzW2BzdWJzY3JpcHRpb25zVG9NZS4ke3N1YnNjcmliYWJsZVRoaW5nfWBdW2lkXSA9IGNhbGxiYWNrXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGRlbGV0ZSB0aGlzW2BzdWJzY3JpcHRpb25zVG9NZS4ke3N1YnNjcmliYWJsZVRoaW5nfWBdW2lkXVxuICAgIH1cbiAgfVxuICBfbm90aWZ5U3Vic2NyaWJlcnMoc3Vic2NyaWJhYmxlVGhpbmc6IFN1YnNjcmliYWJsZVR5cGUpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSB0aGlzW1xuICAgICAgYHN1YnNjcmlwdGlvbnNUb01lLiR7c3Vic2NyaWJhYmxlVGhpbmd9YFxuICAgIF0gYXMgU3Vic2NyaXB0aW9uVHlwZVxuICAgIE9iamVjdC52YWx1ZXMoc3Vic2NyaWJlcnMpLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjaygpKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lQ3JlYXRlZCddKCkge1xuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKCdiYWNrYm9uZUNyZWF0ZWQnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lU3luYyddKCkge1xuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKCdiYWNrYm9uZVN5bmMnKVxuICB9XG4gIFsnX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkJ10oKSB7XG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoJ3NlbGVjdGVkJylcbiAgfVxuICBbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJlZCddKCkge1xuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKCdmaWx0ZXJlZCcpXG4gIH1cbiAgX3R1cm5PbkRlYm91bmNpbmcoKSB7XG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lQ3JlYXRlZCddID0gXy5kZWJvdW5jZShcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5iYWNrYm9uZUNyZWF0ZWQnXSxcbiAgICAgIGRlYm91bmNlVGltZVxuICAgIClcbiAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVTeW5jJ10gPSBfLmRlYm91bmNlKFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lU3luYyddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zZWxlY3RlZCddID0gXy5kZWJvdW5jZShcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5zZWxlY3RlZCddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJlZCddID0gXy5kZWJvdW5jZShcbiAgICAgIHRoaXNbJ19ub3RpZnlTdWJzY3JpYmVycy5maWx0ZXJlZCddLFxuICAgICAgZGVib3VuY2VUaW1lXG4gICAgKVxuICB9XG4gIGluZGV4OiBudW1iZXJcbiAgcHJldj86IExhenlRdWVyeVJlc3VsdFxuICBuZXh0PzogTGF6eVF1ZXJ5UmVzdWx0XG4gIHBhcmVudD86IExhenlRdWVyeVJlc3VsdHNcbiAgcGxhaW46IFJlc3VsdFR5cGVcbiAgYmFja2JvbmU/OiBhbnlcbiAgaXNSZXNvdXJjZUxvY2FsOiBib29sZWFuXG4gIGhpZ2hsaWdodHM6IEF0dHJpYnV0ZUhpZ2hsaWdodHNcbiAgdHlwZTogJ3F1ZXJ5LXJlc3VsdCc7XG4gIFsnbWV0YWNhcmQuaWQnXTogc3RyaW5nXG4gIGlzU2VsZWN0ZWQ6IGJvb2xlYW5cbiAgaXNGaWx0ZXJlZDogYm9vbGVhblxuICBjb25zdHJ1Y3RvcihwbGFpbjogUmVzdWx0VHlwZSwgaGlnaGxpZ2h0czogQXR0cmlidXRlSGlnaGxpZ2h0cyA9IHt9KSB7XG4gICAgdGhpcy5oaWdobGlnaHRzID0gaGlnaGxpZ2h0c1xuICAgIHRoaXMudHlwZSA9ICdxdWVyeS1yZXN1bHQnXG4gICAgdGhpcy5wbGFpbiA9IHRyYW5zZm9ybVBsYWluKHsgcGxhaW4gfSlcbiAgICB0aGlzLmlzUmVzb3VyY2VMb2NhbCA9IGZhbHNlIHx8IHBsYWluLmlzUmVzb3VyY2VMb2NhbFxuICAgIHRoaXNbJ3N1YnNjcmlwdGlvbnNUb01lLmJhY2tib25lQ3JlYXRlZCddID0ge31cbiAgICB0aGlzWydzdWJzY3JpcHRpb25zVG9NZS5iYWNrYm9uZVN5bmMnXSA9IHt9XG4gICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuc2VsZWN0ZWQnXSA9IHt9XG4gICAgdGhpc1snc3Vic2NyaXB0aW9uc1RvTWUuZmlsdGVyZWQnXSA9IHt9XG4gICAgdGhpc1snbWV0YWNhcmQuaWQnXSA9IHBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMuaWRcbiAgICB0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZVxuICAgIHRoaXMuaXNGaWx0ZXJlZCA9IGZhbHNlXG4gICAgaHVtYW5pemVSZXNvdXJjZVNpemUocGxhaW4pXG4gIH1cbiAgc3luY1dpdGhCYWNrYm9uZSgpIHtcbiAgICBpZiAodGhpcy5iYWNrYm9uZSkge1xuICAgICAgdGhpcy5wbGFpbiA9IHRyYW5zZm9ybVBsYWluKHsgcGxhaW46IHRoaXMuYmFja2JvbmUudG9KU09OKCkgfSlcbiAgICAgIGh1bWFuaXplUmVzb3VyY2VTaXplKHRoaXMucGxhaW4pXG4gICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuYmFja2JvbmVTeW5jJ10oKVxuICAgIH1cbiAgfVxuICBzeW5jV2l0aFBsYWluKCkge1xuICAgIHRoaXMucGxhaW4gPSB0cmFuc2Zvcm1QbGFpbih7IHBsYWluOiB7IC4uLnRoaXMucGxhaW4gfSB9KVxuICAgIGh1bWFuaXplUmVzb3VyY2VTaXplKHRoaXMucGxhaW4pXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lU3luYyddKClcbiAgfVxuICAvLyB0aGlzIGlzIGEgcGFydGlhbCB1cGRhdGUgKGxpa2UgdGl0bGUgb25seSBvciBzb21ldGhpbmcpXG4gIHJlZnJlc2hGcm9tRWRpdFJlc3BvbnNlKFxuICAgIHJlc3BvbnNlOiBbXG4gICAgICB7XG4gICAgICAgIGlkczogc3RyaW5nW11cbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZTogc3RyaW5nXG4gICAgICAgICAgICB2YWx1ZXM6IHN0cmluZ1tdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICApIHtcbiAgICByZXNwb25zZS5mb3JFYWNoKChwYXJ0KSA9PlxuICAgICAgcGFydC5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlLmF0dHJpYnV0ZV0gPVxuICAgICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5pc011bHRpKGF0dHJpYnV0ZS5hdHRyaWJ1dGUpXG4gICAgICAgICAgICA/IGF0dHJpYnV0ZS52YWx1ZXNcbiAgICAgICAgICAgIDogYXR0cmlidXRlLnZhbHVlc1swXVxuICAgICAgfSlcbiAgICApXG4gICAgLy8gSSB0aGluayB3ZSBzaG91bGQgdXBkYXRlIHRoZSBlZGl0IGVuZHBvaW50IHRvIGluY2x1ZGUgdGhlIG5ldyBtZXRhY2FyZCBtb2RpZmllZCBkYXRlLCBhcyB0aGlzIGlzIGp1c3QgdG8gZm9yY2UgYSByZWZyZXNoXG4gICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5tb2RpZmllZCddID0gbmV3IERhdGUoKS50b0pTT04oKVxuICAgIHRoaXMuc3luY1dpdGhQbGFpbigpXG4gIH1cbiAgLy8gd2UgaGF2ZSB0aGUgZW50aXJlIG1ldGFjYXJkIHNlbnQgYmFja1xuICByZWZyZXNoRGF0YShcbiAgICBtZXRhY2FyZFByb3BlcnRpZXM6IExhenlRdWVyeVJlc3VsdFsncGxhaW4nXVsnbWV0YWNhcmQnXVsncHJvcGVydGllcyddXG4gICkge1xuICAgIGlmIChtZXRhY2FyZFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzID0gbWV0YWNhcmRQcm9wZXJ0aWVzXG4gICAgICB0aGlzLnN5bmNXaXRoUGxhaW4oKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnJlc2hEYXRhT3Zlck5ldHdvcmsoKVxuICAgIH1cbiAgfVxuICAvLyBqdXN0IGFzayB0aGUgc291cmNlIG9mIHRydXRoXG4gIHJlZnJlc2hEYXRhT3Zlck5ldHdvcmsoKSB7XG4gICAgLy9sZXQgc29sciBmbHVzaFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgcmVxID0ge1xuICAgICAgICBjb3VudDogMSxcbiAgICAgICAgY3FsOiBjcWwud3JpdGUoXG4gICAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnXCJpZFwiJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5kZWxldGVkLmlkJ10gfHxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYWluLmlkLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC5kZWxldGVkLmlkXCInLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5wbGFpbi5pZCxcbiAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdcIm1ldGFjYXJkLXRhZ3NcIicsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICcqJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pXG4gICAgICAgICksXG4gICAgICAgIGlkOiAnMCcsXG4gICAgICAgIHNvcnQ6ICdtb2RpZmllZDpkZXNjJyxcbiAgICAgICAgc3JjOiB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3NvdXJjZS1pZCddLFxuICAgICAgfVxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICB1cmw6ICcuL2ludGVybmFsL2NxbCcsXG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHJlcSksXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9KS50aGVuKHRoaXMucGFyc2VSZWZyZXNoLmJpbmQodGhpcyksIHRoaXMuaGFuZGxlUmVmcmVzaEVycm9yLmJpbmQodGhpcykpXG4gICAgfSwgMTAwMClcbiAgfVxuICBoYW5kbGVSZWZyZXNoRXJyb3IoKSB7XG4gICAgLy9kbyBub3RoaW5nIGZvciBub3csIHNob3VsZCB3ZSBhbm5vdW5jZSB0aGlzP1xuICB9XG4gIHBhcnNlUmVmcmVzaChyZXNwb25zZTogeyByZXN1bHRzOiBSZXN1bHRUeXBlW10gfSkge1xuICAgIHJlc3BvbnNlLnJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICB0aGlzLnBsYWluID0gcmVzdWx0XG4gICAgfSlcbiAgICB0aGlzLnN5bmNXaXRoUGxhaW4oKVxuICB9XG4gIGdldERvd25sb2FkVXJsKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZG93bmxvYWRBY3Rpb24gPSB0aGlzLnBsYWluLmFjdGlvbnMuZmluZChcbiAgICAgIChhY3Rpb24pID0+XG4gICAgICAgIGFjdGlvbi5pZCA9PT0gJ2NhdGFsb2cuZGF0YS5tZXRhY2FyZC5yZXNvdXJjZS5hbHRlcm5hdGUtZG93bmxvYWQnXG4gICAgKVxuXG4gICAgcmV0dXJuIGRvd25sb2FkQWN0aW9uXG4gICAgICA/IGRvd25sb2FkQWN0aW9uLnVybFxuICAgICAgOiB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3Jlc291cmNlLWRvd25sb2FkLXVybCddXG4gIH1cbiAgZ2V0UHJldmlldygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ2V4dC5leHRyYWN0ZWQudGV4dCddXG4gIH1cbiAgaGFzUHJldmlldygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydleHQuZXh0cmFjdGVkLnRleHQnXSAhPT0gdW5kZWZpbmVkXG4gIH1cbiAgaXNTZWFyY2goKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQtdHlwZSddID09PSAnbWV0YWNhcmQucXVlcnknXG4gIH1cbiAgaXNSZXNvdXJjZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10YWdzJ10uaW5kZXhPZigncmVzb3VyY2UnKSA+PSAwXG4gICAgKVxuICB9XG4gIGlzUmV2aXNpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQtdGFncyddLmluZGV4T2YoJ3JldmlzaW9uJykgPj0gMFxuICAgIClcbiAgfVxuICBpc0RlbGV0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snbWV0YWNhcmQtdGFncyddLmluZGV4T2YoJ2RlbGV0ZWQnKSA+PSAwXG4gICAgKVxuICB9XG4gIGlzUmVtb3RlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGhhcnZlc3RlZFNvdXJjZXMgPSBTdGFydHVwRGF0YVN0b3JlLlNvdXJjZXMuaGFydmVzdGVkU291cmNlc1xuICAgIHJldHVybiAoXG4gICAgICBoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ10pID09PVxuICAgICAgZmFsc2VcbiAgICApXG4gIH1cbiAgaGFzR2VvbWV0cnkoYXR0cmlidXRlPzogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIF8uZmlsdGVyKFxuICAgICAgICB0aGlzLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMsXG4gICAgICAgIChfdmFsdWU6IGFueSwga2V5OiBzdHJpbmcpID0+XG4gICAgICAgICAgKGF0dHJpYnV0ZSA9PT0gdW5kZWZpbmVkIHx8IGF0dHJpYnV0ZSA9PT0ga2V5KSAmJlxuICAgICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtrZXldICYmXG4gICAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2tleV0udHlwZSA9PT1cbiAgICAgICAgICAgICdHRU9NRVRSWSdcbiAgICAgICkubGVuZ3RoID4gMFxuICAgIClcbiAgfVxuICBnZXRHZW9tZXRyaWVzKGF0dHJpYnV0ZT86IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKFxuICAgICAgdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLFxuICAgICAgKF92YWx1ZTogYW55LCBrZXk6IHN0cmluZykgPT5cbiAgICAgICAgIVN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5pc0hpZGRlbkF0dHJpYnV0ZShrZXkpICYmXG4gICAgICAgIChhdHRyaWJ1dGUgPT09IHVuZGVmaW5lZCB8fCBhdHRyaWJ1dGUgPT09IGtleSkgJiZcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2tleV0gJiZcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2tleV0udHlwZSA9PT1cbiAgICAgICAgICAnR0VPTUVUUlknXG4gICAgKS5mbGF0KClcbiAgfVxuICBnZXRQb2ludHMoYXR0cmlidXRlPzogYW55KTogYW55IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0R2VvbWV0cmllcyhhdHRyaWJ1dGUpLnJlZHVjZShcbiAgICAgICAgKHBvaW50QXJyYXk6IGFueSwgd2t0OiBhbnkpID0+XG4gICAgICAgICAgcG9pbnRBcnJheS5jb25jYXQoXG4gICAgICAgICAgICBUdXJmTWV0YS5jb29yZEFsbCh3a3guR2VvbWV0cnkucGFyc2Uod2t0KS50b0dlb0pTT04oKSBhcyBhbnkpXG4gICAgICAgICAgKSxcbiAgICAgICAgW11cbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9XG4gIGdldE1hcEFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGxhaW4uYWN0aW9ucy5maWx0ZXIoXG4gICAgICAoYWN0aW9uKSA9PiBhY3Rpb24uaWQuaW5kZXhPZignY2F0YWxvZy5kYXRhLm1ldGFjYXJkLm1hcC4nKSA9PT0gMFxuICAgIClcbiAgfVxuICBoYXNNYXBBY3Rpb25zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldE1hcEFjdGlvbnMoKS5sZW5ndGggPiAwXG4gIH1cbiAgZ2V0RXhwb3J0QWN0aW9ucygpIHtcbiAgICBjb25zdCBvdGhlckFjdGlvbnMgPSB0aGlzLmdldE1hcEFjdGlvbnMoKVxuICAgIHJldHVybiB0aGlzLnBsYWluLmFjdGlvbnNcbiAgICAgIC5maWx0ZXIoKGFjdGlvbikgPT4gYWN0aW9uLnRpdGxlLmluZGV4T2YoJ0V4cG9ydCcpID09PSAwKVxuICAgICAgLmZpbHRlcigoYWN0aW9uKSA9PiBvdGhlckFjdGlvbnMuaW5kZXhPZihhY3Rpb24pID09PSAtMSlcbiAgfVxuICBoYXNFeHBvcnRBY3Rpb25zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldEV4cG9ydEFjdGlvbnMoKS5sZW5ndGggPiAwXG4gIH1cbiAgZ2V0T3RoZXJBY3Rpb25zKCkge1xuICAgIGNvbnN0IG90aGVyQWN0aW9ucyA9IHRoaXMuZ2V0RXhwb3J0QWN0aW9ucygpLmNvbmNhdCh0aGlzLmdldE1hcEFjdGlvbnMoKSlcbiAgICByZXR1cm4gdGhpcy5wbGFpbi5hY3Rpb25zLmZpbHRlcihcbiAgICAgIChhY3Rpb24pID0+IG90aGVyQWN0aW9ucy5pbmRleE9mKGFjdGlvbikgPT09IC0xXG4gICAgKVxuICB9XG4gIGhhc1JlbGV2YW5jZSgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLnBsYWluLnJlbGV2YW5jZSlcbiAgfVxuICBnZXRSb3VuZGVkUmVsZXZhbmNlKCkge1xuICAgIHJldHVybiB0aGlzLnBsYWluLnJlbGV2YW5jZS50b1ByZWNpc2lvbihcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRSZWxldmFuY2VQcmVjaXNpb24oKVxuICAgIClcbiAgfVxuICBoYXNFcnJvcnMoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5nZXRFcnJvcnMoKSlcbiAgfVxuICBnZXRFcnJvcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1sndmFsaWRhdGlvbi1lcnJvcnMnXVxuICB9XG4gIGhhc1dhcm5pbmdzKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuZ2V0V2FybmluZ3MoKSlcbiAgfVxuICBnZXRXYXJuaW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWyd2YWxpZGF0aW9uLXdhcm5pbmdzJ11cbiAgfVxuICBnZXRDb2xvcigpIHtcbiAgICByZXR1cm4gJyMwMDQ5NDknXG4gIH1cbiAgZ2V0QmFja2JvbmUoKSB7XG4gICAgaWYgKHRoaXMuYmFja2JvbmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fc2V0QmFja2JvbmUobmV3IFF1ZXJ5UmVzdWx0KHRoaXMucGxhaW4pKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iYWNrYm9uZVxuICB9XG4gIF9zZXRCYWNrYm9uZShiYWNrYm9uZU1vZGVsOiBCYWNrYm9uZS5Nb2RlbCkge1xuICAgIHRoaXMuYmFja2JvbmUgPSBiYWNrYm9uZU1vZGVsXG4gICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLmJhY2tib25lQ3JlYXRlZCddKClcbiAgfVxuICBzZXRTZWxlY3RlZChpc1NlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuaXNTZWxlY3RlZCAhPT0gaXNTZWxlY3RlZCkge1xuICAgICAgdGhpcy5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZFxuICAgICAgdGhpc1snX25vdGlmeVN1YnNjcmliZXJzLnNlbGVjdGVkJ10oKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHNoaWZ0U2VsZWN0KCkge1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgdGhpcy5wYXJlbnQuc2hpZnRTZWxlY3QodGhpcylcbiAgICB9XG4gIH1cbiAgY29udHJvbFNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGFyZW50LmNvbnRyb2xTZWxlY3QodGhpcylcbiAgICB9XG4gIH1cbiAgc2VsZWN0KCkge1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgdGhpcy5wYXJlbnQuc2VsZWN0KHRoaXMpXG4gICAgfVxuICB9XG4gIHNldEZpbHRlcmVkKGlzRmlsdGVyZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5pc0ZpbHRlcmVkICE9PSBpc0ZpbHRlcmVkKSB7XG4gICAgICB0aGlzLmlzRmlsdGVyZWQgPSBpc0ZpbHRlcmVkXG4gICAgICB0aGlzWydfbm90aWZ5U3Vic2NyaWJlcnMuZmlsdGVyZWQnXSgpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgY3VycmVudE92ZXJsYXlVcmw/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTGF6eVF1ZXJ5UmVzdWx0VHlwZSA9IHR5cGVvZiBMYXp5UXVlcnlSZXN1bHRcbiJdfQ==