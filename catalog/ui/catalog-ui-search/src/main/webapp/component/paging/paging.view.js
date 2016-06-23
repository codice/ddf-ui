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
/*global define, alert*/
define([
    'marionette',
    'underscore',
    'jquery',
    'js/CustomElements',
    'text!./paging.hbs',
], function (Marionette, _, $, CustomElements, template) {

    return Marionette.ItemView.extend({
        tagName: CustomElements.register('paging'),
        template: template,
        initialize: function (options) {
            this.listenTo(this.model.get('results'), 'add', _.throttle(this.render, 200));
        },
        events: {
            'click .first': 'firstPage',
            'click .previous': 'previousPage',
            'click .next': 'nextPage',
            'click .last': 'lastPage'
        },
        firstPage: function() {
            this.model.get('results').getFirstPage();
            this.render();
        },
        previousPage: function() {
            this.model.get('results').getPreviousPage();
            this.render();
        },
        nextPage: function() {
            this.model.get('results').getNextPage();
            this.render();
        },
        lastPage: function() {
            this.model.get('results').getLastPage();
            this.render();
        },
        serializeData: function(){
            var status = _.filter(this.model.get('status').toJSON(), function (status) {
                return status.id !== 'cache';
            });
            var resultsCollection = this.model.get('results');
            return {
                status: status,
                pages: this.currentPages(resultsCollection.state.currentPage, resultsCollection.state.totalPages),
                hasPreviousPage: resultsCollection.hasPreviousPage(),
                hasNextPage: resultsCollection.hasNextPage()
            };
        },
        currentPages: function(current, total){
            var pages = '';
            if (current && total && total > 1) {
                pages = current + ' of ' + total;
            }
            return pages;
        }
    });
});