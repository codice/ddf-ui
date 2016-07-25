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
/*global define*/
define([
    'marionette',
    'underscore',
    'jquery',
    'text!./query-item.hbs',
    'js/CustomElements',
    'js/store',
    'component/menu-vertical/popout/menu-vertical.popout.view',
    'component/content-toolbar/content-toolbar',
    'moment'
], function (Marionette, _, $, template, CustomElements, store, MenuView,
             ContentToolbar, moment) {

    function getResultsFound(data){
        var hits = _.reduce(data, function(hits, status) {
            return status.hits ? hits + status.hits : hits;
        }, 0);
        var count = _.reduce(data, function(count, status) {
            return status.count ? count + status.count : count;
        }, 0);
        var searching = _.every(data, function(status) {
            return _.isUndefined(status.count);
        });
        if (searching) {
            return 'Searching...'
        }
        if (hits === count || count > hits) {
            return count + ' results';
        } else {
            return count + ' of ' + hits + ' results';
        }
    }

    function getSomeStatusSuccess(status, value){
        return _.some(status, function(s) {
            return s.successful === value;
        });
    }

    function getPending(status){
        return getSomeStatusSuccess(status, undefined);
    }

    function getFailed(status){
        return getSomeStatusSuccess(status, false);
    }

    function getLastRan(initiated) {
        if (!_.isUndefined(initiated)) {
            return moment(new Date(initiated)).fromNow();
        } else {
            return '';
        }
    }

    return Marionette.ItemView.extend({
        template: template,
        attributes: function(){
            return {
                'data-queryid': this.model.id
            };
        },
        tagName: CustomElements.register('query-item'),
        modelEvents: {
        },
        events: {
            'click .query-actions': 'editQueryDetails'
        },
        ui: {
        },
        initialize: function(options){
            var query = store.getQueryById(this.model.id);
            this.listenTo(query, 'change', this.updateQuery);
            if (query.has('result')) {
                this.listenToStatus(query);
            } else {
                this.listenTo(query, 'change:result', this.resultAdded);
            }
            this.listenTo(store.get('content'), 'change:query', this.highlight);
            this._menuModel = new ContentToolbar();
        },
        updateQuery: function() {
            if (!this.isDestroyed){
                this.render();
            }
        },
        resultAdded: function(model) {
            if (model.has('result') && _.isUndefined(model.previous('result'))) {
                this.listenToStatus(model);
            }
        },
        listenToStatus: function(model) {
            this.listenTo(model.get('result>results'), 'reset', this.updateQuery);
            this.listenTo(model.get('result'), 'sync', this.updateQuery);
        },
        initializeMenus: function(){
            MenuView.getNewQueryMenu(this._menuModel,
                function(){
                    return this.el.querySelector('.actions-icon');
                }.bind(this),
                'query',
                this.model);
        },
        firstRender: true,
        onRender: function(){
            if (this.firstRender){
                this.firstRender = false;
                this.initializeMenus();
            }
        },
        onDestroy: function(){
            this._menuModel.destroy();
        },
        editQueryDetails: function(event){
            event.stopPropagation();
            this._menuModel.activate('query');
        },
        highlight: function(){
            var queryRef = store.getQuery();
            this.$el.removeClass('is-selected');
            if (queryRef !== undefined && queryRef.id === this.model.id){
                this.$el.addClass('is-selected');
            }
        },
        serializeData: function(){
            var query = this.model.toJSON({
                additionalProperties: ['cid', 'color']
            });
            if (this.model.get('result')){
                var status = _.filter(this.model.get('result').get('status').toJSON(), function (status) {
                    return status.id !== 'cache';
                });
                return {
                    query: query,
                    status: status,
                    resultCount: getResultsFound(status),
                    pending: getPending(status),
                    failed: getFailed(status),
                    queryStatus: getLastRan(this.model.get('result>initiated'))
                };
            } else {
                return {
                    query: query,
                    resultCount: 'Has not been run',
                    queryStatus: ''
                };
            }
        },
        hideActions: function(){
            this.$el.addClass('hide-actions');
        }
    });
});
