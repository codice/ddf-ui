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
                start: 1,
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
//# sourceMappingURL=QueryResult.js.map