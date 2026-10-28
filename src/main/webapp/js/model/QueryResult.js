import { __read, __spreadArray } from "tslib";
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
import $ from 'jquery';
import Common from '../Common';
import cql from '../cql';
import 'backbone-associations';
import Metacard from './Metacard';
import MetacardActionModel from './MetacardAction';
import { StartupDataStore } from './Startup/startup';
function generateThumbnailUrl(url) {
    var newUrl = url;
    if (url.indexOf('?') >= 0) {
        newUrl += '&';
    }
    else {
        newUrl += '?';
    }
    newUrl += '_=' + Date.now();
    return newUrl;
}
function humanizeResourceSize(result) {
    if (result.metacard.properties['resource-size']) {
        result.metacard.properties['resource-size'] = Common.getFileSize(result.metacard.properties['resource-size']);
    }
}
export default Backbone.AssociatedModel.extend({
    type: 'query-result',
    defaults: function () {
        return {
            isResourceLocal: false,
        };
    },
    relations: [
        {
            type: Backbone.One,
            key: 'metacard',
            relatedModel: Metacard,
        },
        {
            type: Backbone.Many,
            key: 'actions',
            collectionType: Backbone.Collection.extend({
                model: MetacardActionModel,
                comparator: function (c) {
                    return c.get('title').toLowerCase();
                },
            }),
        },
    ],
    initialize: function () {
        this.refreshData = _.throttle(this.refreshData, 200);
    },
    getTitle: function () {
        return this.get('metacard').get('properties').attributes.title;
    },
    getPreview: function () {
        return this.get('metacard').get('properties').get('ext.extracted.text');
    },
    hasPreview: function () {
        return (this.get('metacard').get('properties').get('ext.extracted.text') !==
            undefined);
    },
    isResource: function () {
        return (this.get('metacard')
            .get('properties')
            .get('metacard-tags')
            .indexOf('resource') >= 0);
    },
    isRevision: function () {
        return (this.get('metacard')
            .get('properties')
            .get('metacard-tags')
            .indexOf('revision') >= 0);
    },
    isDeleted: function () {
        return (this.get('metacard')
            .get('properties')
            .get('metacard-tags')
            .indexOf('deleted') >= 0);
    },
    isRemote: function () {
        var Sources = StartupDataStore.Sources.sources;
        var harvestedSources = Sources.filter(function (source) { return source.harvested; }).map(function (source) { return source.id; });
        return (harvestedSources.includes(this.get('metacard').get('properties').get('source-id')) === false);
    },
    hasGeometry: function (attribute) {
        return this.get('metacard').hasGeometry(attribute);
    },
    getPoints: function (attribute) {
        return this.get('metacard').getPoints(attribute);
    },
    getGeometries: function (attribute) {
        return this.get('metacard').getGeometries(attribute);
    },
    hasExportActions: function () {
        return this.getExportActions().length > 0;
    },
    getOtherActions: function () {
        var otherActions = this.getExportActions().concat(this.getMapActions());
        return this.get('actions').filter(function (action) { return otherActions.indexOf(action) === -1; });
    },
    getExportActions: function () {
        var otherActions = this.getMapActions();
        return this.get('actions')
            .filter(function (action) { return action.get('title').indexOf('Export') === 0; })
            .filter(function (action) { return otherActions.indexOf(action) === -1; });
    },
    hasMapActions: function () {
        return this.getMapActions().length > 0;
    },
    getMapActions: function () {
        return this.get('actions').filter(function (action) { return action.id.indexOf('catalog.data.metacard.map.') === 0; });
    },
    refreshData: function (metacardProperties) {
        var _this = this;
        if (metacardProperties !== undefined) {
            var updatedResult = this.toJSON();
            updatedResult.metacard.properties = metacardProperties;
            this.set(updatedResult);
            var clearedAttributes = Object.keys(this.get('metacard').get('properties').toJSON()).reduce(function (acc, cur) {
                return cur in metacardProperties ? acc : __spreadArray([cur], __read(acc), false);
            }, []);
            clearedAttributes.forEach(function (attribute) {
                _this.get('metacard').get('properties').unset(attribute);
            });
            this.trigger('refreshdata');
            return;
        }
        //let solr flush
        setTimeout(function () {
            var metacard = _this.get('metacard');
            var req = {
                count: 1,
                cql: cql.write({
                    type: 'AND',
                    filters: [
                        {
                            type: 'OR',
                            filters: [
                                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: "="; property: string; value: any; }... Remove this comment to see the full error message
                                {
                                    type: '=',
                                    property: '"id"',
                                    value: metacard.get('properties').get('metacard.deleted.id') ||
                                        metacard.id,
                                },
                                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: "="; property: string; value: any; }... Remove this comment to see the full error message
                                {
                                    type: '=',
                                    property: '"metacard.deleted.id"',
                                    value: metacard.id,
                                },
                            ],
                        },
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: "ILIKE"; property: string; value: st... Remove this comment to see the full error message
                        {
                            type: 'ILIKE',
                            property: '"metacard-tags"',
                            value: '*',
                        },
                    ],
                }),
                id: '0',
                sort: 'modified:desc',
                src: metacard.get('properties').get('source-id'),
            };
            $.ajax({
                type: 'POST',
                url: './internal/cql',
                data: JSON.stringify(req),
                contentType: 'application/json',
            }).then(_this.parseRefresh.bind(_this), _this.handleRefreshError.bind(_this));
        }, 1000);
    },
    handleRefreshError: function () {
        //do nothing for now, should we announce this?
    },
    parseRefresh: function (response) {
        var queryId = this.get('metacard').get('queryId');
        var color = this.get('metacard').get('color');
        _.forEach(response.results, function (result) {
            delete result.relevance;
            result.propertyTypes =
                response.types[result.metacard.properties['metacard-type']];
            result.metacardType = result.metacard.properties['metacard-type'];
            result.metacard.id = result.metacard.properties.id;
            result.id = result.metacard.id + result.metacard.properties['source-id'];
            result.metacard.queryId = queryId;
            result.metacard.color = color;
            humanizeResourceSize(result);
            result.actions.forEach(function (action) { return (action.queryId = queryId); });
            var thumbnailAction = _.findWhere(result.actions, {
                id: 'catalog.data.metacard.thumbnail',
            });
            if (result.hasThumbnail && thumbnailAction) {
                result.metacard.properties.thumbnail = generateThumbnailUrl(thumbnailAction.url);
            }
            else {
                result.metacard.properties.thumbnail = undefined;
            }
        });
        this.set(response.results[0]);
        this.trigger('refreshdata');
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlSZXN1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvUXVlcnlSZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFFL0IsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFBO0FBQ3hCLE9BQU8sdUJBQXVCLENBQUE7QUFDOUIsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLE9BQU8sbUJBQW1CLE1BQU0sa0JBQWtCLENBQUE7QUFDbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFcEQsU0FBUyxvQkFBb0IsQ0FBQyxHQUFRO0lBQ3BDLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQTtJQUNoQixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDMUIsTUFBTSxJQUFJLEdBQUcsQ0FBQTtJQUNmLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxJQUFJLEdBQUcsQ0FBQTtJQUNmLENBQUM7SUFDRCxNQUFNLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUMzQixPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLE1BQVc7SUFDdkMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQzlELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUM1QyxDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLElBQUksRUFBRSxjQUFjO0lBQ3BCLFFBQVE7UUFDTixPQUFPO1lBQ0wsZUFBZSxFQUFFLEtBQUs7U0FDdkIsQ0FBQTtJQUNILENBQUM7SUFDRCxTQUFTLEVBQUU7UUFDVDtZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRztZQUNsQixHQUFHLEVBQUUsVUFBVTtZQUNmLFlBQVksRUFBRSxRQUFRO1NBQ3ZCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDbkIsR0FBRyxFQUFFLFNBQVM7WUFDZCxjQUFjLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3pDLEtBQUssRUFBRSxtQkFBbUI7Z0JBQzFCLFVBQVUsWUFBQyxDQUFNO29CQUNmLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtnQkFDckMsQ0FBQzthQUNGLENBQUM7U0FDSDtLQUNGO0lBQ0QsVUFBVTtRQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFDRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFBO0lBQ2hFLENBQUM7SUFDRCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0lBQ0QsVUFBVTtRQUNSLE9BQU8sQ0FDTCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7WUFDaEUsU0FBUyxDQUNWLENBQUE7SUFDSCxDQUFDO0lBQ0QsVUFBVTtRQUNSLE9BQU8sQ0FDTCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQzthQUNqQixHQUFHLENBQUMsWUFBWSxDQUFDO2FBQ2pCLEdBQUcsQ0FBQyxlQUFlLENBQUM7YUFDcEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FDNUIsQ0FBQTtJQUNILENBQUM7SUFDRCxVQUFVO1FBQ1IsT0FBTyxDQUNMLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO2FBQ2pCLEdBQUcsQ0FBQyxZQUFZLENBQUM7YUFDakIsR0FBRyxDQUFDLGVBQWUsQ0FBQzthQUNwQixPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUM1QixDQUFBO0lBQ0gsQ0FBQztJQUNELFNBQVM7UUFDUCxPQUFPLENBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7YUFDakIsR0FBRyxDQUFDLFlBQVksQ0FBQzthQUNqQixHQUFHLENBQUMsZUFBZSxDQUFDO2FBQ3BCLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQzNCLENBQUE7SUFDSCxDQUFDO0lBQ0QsUUFBUTtRQUNOLElBQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUE7UUFDaEQsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLFNBQVMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FDdkUsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsRUFBRSxFQUFULENBQVMsQ0FDdEIsQ0FBQTtRQUNELE9BQU8sQ0FDTCxnQkFBZ0IsQ0FBQyxRQUFRLENBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FDeEQsS0FBSyxLQUFLLENBQ1osQ0FBQTtJQUNILENBQUM7SUFDRCxXQUFXLFlBQUMsU0FBYztRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFDRCxTQUFTLFlBQUMsU0FBYztRQUN0QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ2xELENBQUM7SUFDRCxhQUFhLFlBQUMsU0FBYztRQUMxQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFDRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDM0MsQ0FBQztJQUNELGVBQWU7UUFDYixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUE7UUFDekUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FDL0IsVUFBQyxNQUFXLElBQUssT0FBQSxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFuQyxDQUFtQyxDQUNyRCxDQUFBO0lBQ0gsQ0FBQztJQUNELGdCQUFnQjtRQUNkLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUN6QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO2FBQ3ZCLE1BQU0sQ0FBQyxVQUFDLE1BQVcsSUFBSyxPQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQzthQUNwRSxNQUFNLENBQUMsVUFBQyxNQUFXLElBQUssT0FBQSxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUNELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBQ3hDLENBQUM7SUFDRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FDL0IsVUFBQyxNQUFXLElBQUssT0FBQSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsRUFBckQsQ0FBcUQsQ0FDdkUsQ0FBQTtJQUNILENBQUM7SUFDRCxXQUFXLFlBQUMsa0JBQXVCO1FBQW5DLGlCQWlFQztRQWhFQyxJQUFJLGtCQUFrQixLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3JDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtZQUNuQyxhQUFhLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQTtZQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBRXZCLElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2hELENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hCLE9BQU8sR0FBRyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBRSxHQUFHLFVBQUssR0FBRyxTQUFDLENBQUE7WUFDeEQsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ04saUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUMsU0FBUztnQkFDbEMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3pELENBQUMsQ0FBQyxDQUFBO1lBRUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUMzQixPQUFNO1FBQ1IsQ0FBQztRQUVELGdCQUFnQjtRQUNoQixVQUFVLENBQUM7WUFDVCxJQUFNLFFBQVEsR0FBRyxLQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ3JDLElBQU0sR0FBRyxHQUFHO2dCQUNWLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDO29CQUNiLElBQUksRUFBRSxLQUFLO29CQUNYLE9BQU8sRUFBRTt3QkFDUDs0QkFDRSxJQUFJLEVBQUUsSUFBSTs0QkFDVixPQUFPLEVBQUU7Z0NBQ1AsbUpBQW1KO2dDQUNuSjtvQ0FDRSxJQUFJLEVBQUUsR0FBRztvQ0FDVCxRQUFRLEVBQUUsTUFBTTtvQ0FDaEIsS0FBSyxFQUNILFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDO3dDQUNyRCxRQUFRLENBQUMsRUFBRTtpQ0FDZDtnQ0FDRCxtSkFBbUo7Z0NBQ25KO29DQUNFLElBQUksRUFBRSxHQUFHO29DQUNULFFBQVEsRUFBRSx1QkFBdUI7b0NBQ2pDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRTtpQ0FDbkI7NkJBQ0Y7eUJBQ0Y7d0JBQ0QsbUpBQW1KO3dCQUNuSjs0QkFDRSxJQUFJLEVBQUUsT0FBTzs0QkFDYixRQUFRLEVBQUUsaUJBQWlCOzRCQUMzQixLQUFLLEVBQUUsR0FBRzt5QkFDWDtxQkFDRjtpQkFDRixDQUFDO2dCQUNGLEVBQUUsRUFBRSxHQUFHO2dCQUNQLElBQUksRUFBRSxlQUFlO2dCQUNyQixHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2FBQ2pELENBQUE7WUFDRCxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNMLElBQUksRUFBRSxNQUFNO2dCQUNaLEdBQUcsRUFBRSxnQkFBZ0I7Z0JBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztnQkFDekIsV0FBVyxFQUFFLGtCQUFrQjthQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxFQUFFLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQTtRQUMzRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDVixDQUFDO0lBQ0Qsa0JBQWtCO1FBQ2hCLDhDQUE4QztJQUNoRCxDQUFDO0lBQ0QsWUFBWSxZQUFDLFFBQWE7UUFDeEIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbkQsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDL0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFVBQUMsTUFBTTtZQUNqQyxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUE7WUFDdkIsTUFBTSxDQUFDLGFBQWE7Z0JBQ2xCLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQTtZQUM3RCxNQUFNLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFBO1lBQ2pFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQTtZQUNsRCxNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ3hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtZQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7WUFDN0Isb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDNUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFXLElBQUssT0FBQSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQTtZQUNuRSxJQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xELEVBQUUsRUFBRSxpQ0FBaUM7YUFDdEMsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxNQUFNLENBQUMsWUFBWSxJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUMzQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQ3pELGVBQWUsQ0FBQyxHQUFHLENBQ3BCLENBQUE7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtZQUNsRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzdCLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IGNxbCBmcm9tICcuLi9jcWwnXG5pbXBvcnQgJ2JhY2tib25lLWFzc29jaWF0aW9ucydcbmltcG9ydCBNZXRhY2FyZCBmcm9tICcuL01ldGFjYXJkJ1xuaW1wb3J0IE1ldGFjYXJkQWN0aW9uTW9kZWwgZnJvbSAnLi9NZXRhY2FyZEFjdGlvbidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL1N0YXJ0dXAvc3RhcnR1cCdcblxuZnVuY3Rpb24gZ2VuZXJhdGVUaHVtYm5haWxVcmwodXJsOiBhbnkpIHtcbiAgbGV0IG5ld1VybCA9IHVybFxuICBpZiAodXJsLmluZGV4T2YoJz8nKSA+PSAwKSB7XG4gICAgbmV3VXJsICs9ICcmJ1xuICB9IGVsc2Uge1xuICAgIG5ld1VybCArPSAnPydcbiAgfVxuICBuZXdVcmwgKz0gJ189JyArIERhdGUubm93KClcbiAgcmV0dXJuIG5ld1VybFxufVxuXG5mdW5jdGlvbiBodW1hbml6ZVJlc291cmNlU2l6ZShyZXN1bHQ6IGFueSkge1xuICBpZiAocmVzdWx0Lm1ldGFjYXJkLnByb3BlcnRpZXNbJ3Jlc291cmNlLXNpemUnXSkge1xuICAgIHJlc3VsdC5tZXRhY2FyZC5wcm9wZXJ0aWVzWydyZXNvdXJjZS1zaXplJ10gPSBDb21tb24uZ2V0RmlsZVNpemUoXG4gICAgICByZXN1bHQubWV0YWNhcmQucHJvcGVydGllc1sncmVzb3VyY2Utc2l6ZSddXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICB0eXBlOiAncXVlcnktcmVzdWx0JyxcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzUmVzb3VyY2VMb2NhbDogZmFsc2UsXG4gICAgfVxuICB9LFxuICByZWxhdGlvbnM6IFtcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICdtZXRhY2FyZCcsXG4gICAgICByZWxhdGVkTW9kZWw6IE1ldGFjYXJkLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ2FjdGlvbnMnLFxuICAgICAgY29sbGVjdGlvblR5cGU6IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgICAgbW9kZWw6IE1ldGFjYXJkQWN0aW9uTW9kZWwsXG4gICAgICAgIGNvbXBhcmF0b3IoYzogYW55KSB7XG4gICAgICAgICAgcmV0dXJuIGMuZ2V0KCd0aXRsZScpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIH0sXG4gIF0sXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWZyZXNoRGF0YSA9IF8udGhyb3R0bGUodGhpcy5yZWZyZXNoRGF0YSwgMjAwKVxuICB9LFxuICBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ21ldGFjYXJkJykuZ2V0KCdwcm9wZXJ0aWVzJykuYXR0cmlidXRlcy50aXRsZVxuICB9LFxuICBnZXRQcmV2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWV0YWNhcmQnKS5nZXQoJ3Byb3BlcnRpZXMnKS5nZXQoJ2V4dC5leHRyYWN0ZWQudGV4dCcpXG4gIH0sXG4gIGhhc1ByZXZpZXcoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZ2V0KCdtZXRhY2FyZCcpLmdldCgncHJvcGVydGllcycpLmdldCgnZXh0LmV4dHJhY3RlZC50ZXh0JykgIT09XG4gICAgICB1bmRlZmluZWRcbiAgICApXG4gIH0sXG4gIGlzUmVzb3VyY2UoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZ2V0KCdtZXRhY2FyZCcpXG4gICAgICAgIC5nZXQoJ3Byb3BlcnRpZXMnKVxuICAgICAgICAuZ2V0KCdtZXRhY2FyZC10YWdzJylcbiAgICAgICAgLmluZGV4T2YoJ3Jlc291cmNlJykgPj0gMFxuICAgIClcbiAgfSxcbiAgaXNSZXZpc2lvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5nZXQoJ21ldGFjYXJkJylcbiAgICAgICAgLmdldCgncHJvcGVydGllcycpXG4gICAgICAgIC5nZXQoJ21ldGFjYXJkLXRhZ3MnKVxuICAgICAgICAuaW5kZXhPZigncmV2aXNpb24nKSA+PSAwXG4gICAgKVxuICB9LFxuICBpc0RlbGV0ZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZ2V0KCdtZXRhY2FyZCcpXG4gICAgICAgIC5nZXQoJ3Byb3BlcnRpZXMnKVxuICAgICAgICAuZ2V0KCdtZXRhY2FyZC10YWdzJylcbiAgICAgICAgLmluZGV4T2YoJ2RlbGV0ZWQnKSA+PSAwXG4gICAgKVxuICB9LFxuICBpc1JlbW90ZSgpIHtcbiAgICBjb25zdCBTb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Tb3VyY2VzLnNvdXJjZXNcbiAgICBjb25zdCBoYXJ2ZXN0ZWRTb3VyY2VzID0gU291cmNlcy5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmhhcnZlc3RlZCkubWFwKFxuICAgICAgKHNvdXJjZSkgPT4gc291cmNlLmlkXG4gICAgKVxuICAgIHJldHVybiAoXG4gICAgICBoYXJ2ZXN0ZWRTb3VyY2VzLmluY2x1ZGVzKFxuICAgICAgICB0aGlzLmdldCgnbWV0YWNhcmQnKS5nZXQoJ3Byb3BlcnRpZXMnKS5nZXQoJ3NvdXJjZS1pZCcpXG4gICAgICApID09PSBmYWxzZVxuICAgIClcbiAgfSxcbiAgaGFzR2VvbWV0cnkoYXR0cmlidXRlOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ21ldGFjYXJkJykuaGFzR2VvbWV0cnkoYXR0cmlidXRlKVxuICB9LFxuICBnZXRQb2ludHMoYXR0cmlidXRlOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ21ldGFjYXJkJykuZ2V0UG9pbnRzKGF0dHJpYnV0ZSlcbiAgfSxcbiAgZ2V0R2VvbWV0cmllcyhhdHRyaWJ1dGU6IGFueSkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbWV0YWNhcmQnKS5nZXRHZW9tZXRyaWVzKGF0dHJpYnV0ZSlcbiAgfSxcbiAgaGFzRXhwb3J0QWN0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHBvcnRBY3Rpb25zKCkubGVuZ3RoID4gMFxuICB9LFxuICBnZXRPdGhlckFjdGlvbnMoKSB7XG4gICAgY29uc3Qgb3RoZXJBY3Rpb25zID0gdGhpcy5nZXRFeHBvcnRBY3Rpb25zKCkuY29uY2F0KHRoaXMuZ2V0TWFwQWN0aW9ucygpKVxuICAgIHJldHVybiB0aGlzLmdldCgnYWN0aW9ucycpLmZpbHRlcihcbiAgICAgIChhY3Rpb246IGFueSkgPT4gb3RoZXJBY3Rpb25zLmluZGV4T2YoYWN0aW9uKSA9PT0gLTFcbiAgICApXG4gIH0sXG4gIGdldEV4cG9ydEFjdGlvbnMoKSB7XG4gICAgY29uc3Qgb3RoZXJBY3Rpb25zID0gdGhpcy5nZXRNYXBBY3Rpb25zKClcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2FjdGlvbnMnKVxuICAgICAgLmZpbHRlcigoYWN0aW9uOiBhbnkpID0+IGFjdGlvbi5nZXQoJ3RpdGxlJykuaW5kZXhPZignRXhwb3J0JykgPT09IDApXG4gICAgICAuZmlsdGVyKChhY3Rpb246IGFueSkgPT4gb3RoZXJBY3Rpb25zLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEpXG4gIH0sXG4gIGhhc01hcEFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFwQWN0aW9ucygpLmxlbmd0aCA+IDBcbiAgfSxcbiAgZ2V0TWFwQWN0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2FjdGlvbnMnKS5maWx0ZXIoXG4gICAgICAoYWN0aW9uOiBhbnkpID0+IGFjdGlvbi5pZC5pbmRleE9mKCdjYXRhbG9nLmRhdGEubWV0YWNhcmQubWFwLicpID09PSAwXG4gICAgKVxuICB9LFxuICByZWZyZXNoRGF0YShtZXRhY2FyZFByb3BlcnRpZXM6IGFueSkge1xuICAgIGlmIChtZXRhY2FyZFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgdXBkYXRlZFJlc3VsdCA9IHRoaXMudG9KU09OKClcbiAgICAgIHVwZGF0ZWRSZXN1bHQubWV0YWNhcmQucHJvcGVydGllcyA9IG1ldGFjYXJkUHJvcGVydGllc1xuICAgICAgdGhpcy5zZXQodXBkYXRlZFJlc3VsdClcblxuICAgICAgY29uc3QgY2xlYXJlZEF0dHJpYnV0ZXMgPSBPYmplY3Qua2V5cyhcbiAgICAgICAgdGhpcy5nZXQoJ21ldGFjYXJkJykuZ2V0KCdwcm9wZXJ0aWVzJykudG9KU09OKClcbiAgICAgICkucmVkdWNlKChhY2MsIGN1cikgPT4ge1xuICAgICAgICByZXR1cm4gY3VyIGluIG1ldGFjYXJkUHJvcGVydGllcyA/IGFjYyA6IFtjdXIsIC4uLmFjY11cbiAgICAgIH0sIFtdKVxuICAgICAgY2xlYXJlZEF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICAgIHRoaXMuZ2V0KCdtZXRhY2FyZCcpLmdldCgncHJvcGVydGllcycpLnVuc2V0KGF0dHJpYnV0ZSlcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMudHJpZ2dlcigncmVmcmVzaGRhdGEnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy9sZXQgc29sciBmbHVzaFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgbWV0YWNhcmQgPSB0aGlzLmdldCgnbWV0YWNhcmQnKVxuICAgICAgY29uc3QgcmVxID0ge1xuICAgICAgICBjb3VudDogMSxcbiAgICAgICAgY3FsOiBjcWwud3JpdGUoe1xuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBcIj1cIjsgcHJvcGVydHk6IHN0cmluZzsgdmFsdWU6IGFueTsgfS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJz0nLFxuICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdcImlkXCInLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6XG4gICAgICAgICAgICAgICAgICAgIG1ldGFjYXJkLmdldCgncHJvcGVydGllcycpLmdldCgnbWV0YWNhcmQuZGVsZXRlZC5pZCcpIHx8XG4gICAgICAgICAgICAgICAgICAgIG1ldGFjYXJkLmlkLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IHR5cGU6IFwiPVwiOyBwcm9wZXJ0eTogc3RyaW5nOyB2YWx1ZTogYW55OyB9Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ1wibWV0YWNhcmQuZGVsZXRlZC5pZFwiJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBtZXRhY2FyZC5pZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAneyB0eXBlOiBcIklMSUtFXCI7IHByb3BlcnR5OiBzdHJpbmc7IHZhbHVlOiBzdC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnXCJtZXRhY2FyZC10YWdzXCInLFxuICAgICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgICAgaWQ6ICcwJyxcbiAgICAgICAgc29ydDogJ21vZGlmaWVkOmRlc2MnLFxuICAgICAgICBzcmM6IG1ldGFjYXJkLmdldCgncHJvcGVydGllcycpLmdldCgnc291cmNlLWlkJyksXG4gICAgICB9XG4gICAgICAkLmFqYXgoe1xuICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy4vaW50ZXJuYWwvY3FsJyxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocmVxKSxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0pLnRoZW4odGhpcy5wYXJzZVJlZnJlc2guYmluZCh0aGlzKSwgdGhpcy5oYW5kbGVSZWZyZXNoRXJyb3IuYmluZCh0aGlzKSlcbiAgICB9LCAxMDAwKVxuICB9LFxuICBoYW5kbGVSZWZyZXNoRXJyb3IoKSB7XG4gICAgLy9kbyBub3RoaW5nIGZvciBub3csIHNob3VsZCB3ZSBhbm5vdW5jZSB0aGlzP1xuICB9LFxuICBwYXJzZVJlZnJlc2gocmVzcG9uc2U6IGFueSkge1xuICAgIGNvbnN0IHF1ZXJ5SWQgPSB0aGlzLmdldCgnbWV0YWNhcmQnKS5nZXQoJ3F1ZXJ5SWQnKVxuICAgIGNvbnN0IGNvbG9yID0gdGhpcy5nZXQoJ21ldGFjYXJkJykuZ2V0KCdjb2xvcicpXG4gICAgXy5mb3JFYWNoKHJlc3BvbnNlLnJlc3VsdHMsIChyZXN1bHQpID0+IHtcbiAgICAgIGRlbGV0ZSByZXN1bHQucmVsZXZhbmNlXG4gICAgICByZXN1bHQucHJvcGVydHlUeXBlcyA9XG4gICAgICAgIHJlc3BvbnNlLnR5cGVzW3Jlc3VsdC5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC10eXBlJ11dXG4gICAgICByZXN1bHQubWV0YWNhcmRUeXBlID0gcmVzdWx0Lm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLXR5cGUnXVxuICAgICAgcmVzdWx0Lm1ldGFjYXJkLmlkID0gcmVzdWx0Lm1ldGFjYXJkLnByb3BlcnRpZXMuaWRcbiAgICAgIHJlc3VsdC5pZCA9IHJlc3VsdC5tZXRhY2FyZC5pZCArIHJlc3VsdC5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzb3VyY2UtaWQnXVxuICAgICAgcmVzdWx0Lm1ldGFjYXJkLnF1ZXJ5SWQgPSBxdWVyeUlkXG4gICAgICByZXN1bHQubWV0YWNhcmQuY29sb3IgPSBjb2xvclxuICAgICAgaHVtYW5pemVSZXNvdXJjZVNpemUocmVzdWx0KVxuICAgICAgcmVzdWx0LmFjdGlvbnMuZm9yRWFjaCgoYWN0aW9uOiBhbnkpID0+IChhY3Rpb24ucXVlcnlJZCA9IHF1ZXJ5SWQpKVxuICAgICAgY29uc3QgdGh1bWJuYWlsQWN0aW9uID0gXy5maW5kV2hlcmUocmVzdWx0LmFjdGlvbnMsIHtcbiAgICAgICAgaWQ6ICdjYXRhbG9nLmRhdGEubWV0YWNhcmQudGh1bWJuYWlsJyxcbiAgICAgIH0pXG4gICAgICBpZiAocmVzdWx0Lmhhc1RodW1ibmFpbCAmJiB0aHVtYm5haWxBY3Rpb24pIHtcbiAgICAgICAgcmVzdWx0Lm1ldGFjYXJkLnByb3BlcnRpZXMudGh1bWJuYWlsID0gZ2VuZXJhdGVUaHVtYm5haWxVcmwoXG4gICAgICAgICAgdGh1bWJuYWlsQWN0aW9uLnVybFxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQubWV0YWNhcmQucHJvcGVydGllcy50aHVtYm5haWwgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuc2V0KHJlc3BvbnNlLnJlc3VsdHNbMF0pXG4gICAgdGhpcy50cmlnZ2VyKCdyZWZyZXNoZGF0YScpXG4gIH0sXG59KVxuIl19