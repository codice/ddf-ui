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
    'text!./result-selector.hbs',
    'js/CustomElements',
    'properties',
    'js/store',
    'js/Common',
    'component/result-item/result-item.collection.view',
    'component/paging/paging.view',
    'component/dropdown/result-display/dropdown.result-display.view',
    'component/dropdown/result-filter/dropdown.result-filter.view',
    'component/dropdown/dropdown',
    'js/cql'
], function (Marionette, _, $, resultSelectorTemplate, CustomElements, properties, store, Common,
             ResultItemCollectionView, PagingView, DropdownView, ResultFilterDropdownView,
             DropdownModel, cql) {

    var namespace = CustomElements.getNamespace();
    var resultItemSelector = namespace+'result-item';
    var eventsHash = {
            'mousedown .resultSelector-list': 'stopTextSelection'
    };
    eventsHash['click .resultSelector-list '+resultItemSelector] = 'handleClick';

    var ResultSelector = Marionette.LayoutView.extend({
        template: resultSelectorTemplate,
        tagName: CustomElements.register('result-selector'),
        modelEvents: {
        },
        events: eventsHash,
        ui: {
        },
        regions: {
            resultList: '.resultSelector-list',
            resultPaging: '.resultSelector-paging',
            resultDisplay: '.menu-resultDisplay',
            resultFilter: '.menu-resultFilter'
        },
        initialize: function(options){
            if (!this.model.get('result')) {
                this.model.startSearch();
            }

            this.listenTo(store.getSelectedResults(), 'update', this.handleSelectionChange);
            this.listenTo(store.getSelectedResults(), 'add', this.handleSelectionChange);
            this.listenTo(store.getSelectedResults(), 'remove', this.handleSelectionChange);
            this.startListeningToFilter();
            this.startListeningToResult();

            store.addMetacardTypes(this.model.get('result').get('metacard-types'));
        },
        startListeningToResult: function(){
            this.listenTo(this.model.get('result'), 'sync', this.onBeforeShow);
        },
        startListeningToFilter: function(){
            this.listenTo(store.get('user').get('user').get('preferences'), 'change:resultFilter', this.onBeforeShow);
        },
        updateActiveRecords: function(results){
            store.get('content').setActiveSearchResults(results);
        },
        stopTextSelection: function(event){
            event.preventDefault();
        },
        handleClick: function(event){
            var indexClicked = parseInt(event.currentTarget.getAttribute('data-index'));
            var resultid = event.currentTarget.getAttribute('data-resultid');
            var alreadySelected = $(event.currentTarget).hasClass('is-selected');
            //shift key wins over all else
            if (event.shiftKey){
                this.handleShiftClick(resultid, indexClicked);
            } else if (event.ctrlKey || event.metaKey){
                this.handleControlClick(resultid, alreadySelected);
            } else {
                this.handleNormalClick(resultid);
            }
        },
        handleShiftClick: function(resultid, indexClicked){
            var firstIndex = parseInt(this.$el.find('.resultSelector-list '+resultItemSelector+'.is-selected').first().attr('data-index'));
            var lastIndex = parseInt(this.$el.find('.resultSelector-list '+resultItemSelector+'.is-selected').last().attr('data-index'));
            if (_.isNaN(firstIndex) && _.isNaN(lastIndex)){
                this.handleNormalClick(resultid);
            } else if (indexClicked <= firstIndex) {
                this.selectBetween(indexClicked, firstIndex);
            } else if (indexClicked >= lastIndex) {
                this.selectBetween(lastIndex, indexClicked + 1);
            } else {
                this.selectBetween(firstIndex, indexClicked + 1);
            }
        },
        selectBetween: function(startIndex, endIndex){
            store.addSelectedResult(this.model.get('result').get('results').slice(startIndex, endIndex));
        },
        handleControlClick: function(resultid, alreadySelected){
            if (alreadySelected){
                store.removeSelectedResult(this.model.get('result').get('results').get(resultid));
            } else {
                store.addSelectedResult(this.model.get('result').get('results').get(resultid));
            }
        },
        handleNormalClick: function(resultid){
            store.clearSelectedResults();
            store.addSelectedResult(this.model.get('result').get('results').get(resultid));
        },
        handleSelectionChange: function(){
            var self = this;
            self.$el.find('.resultSelector-list '+resultItemSelector+'[data-resultid]').removeClass('is-selected');
            store.getSelectedResults().forEach(function(metacard){
                self.$el.find('.resultSelector-list '+resultItemSelector+'[data-resultid="'+metacard.id+'"]').addClass('is-selected');
            });
            if (store.getSelectedResults().length === 1) {
               // this.scrollIntoView(store.getSelectedResults().at(0).get('metacard'));
            }
        },
        scrollIntoView: function(metacard){
            var result = this.$el.find('.resultSelector-list '+resultItemSelector+'[data-resultid="'+metacard.id + metacard.get('properties>source-id')+'"]');
            if (result && result.length > 0) {
                //result[0].scrollIntoView();
            }
        },
        onBeforeShow: function(){
            var resultFilter = store.get('user').get('user').get('preferences').get('resultFilter');
            if (resultFilter) {
                resultFilter = cql.simplify(cql.read(resultFilter));
            }
            var filteredResults = this.model.get('result').get('results').generateFilteredVersion(resultFilter, store.metacardTypes);
            this.showResultPaging(filteredResults);
            this.showResultList(filteredResults);
            this.showResultDisplayDropdown();
            this.showResultFilterDropdown();
            this.handleSelectionChange();
            this.updateActiveRecords(filteredResults);
        },
        showResultPaging: function(resultCollection){
            this.resultPaging.show(new PagingView({
                model: resultCollection
            }));
        },
        showResultList: function(resultCollection){
            this.resultList.show(new ResultItemCollectionView({
                collection: resultCollection
            }));
        },
        showResultFilterDropdown: function(){
            this.resultFilter.show(new ResultFilterDropdownView({
                model: new DropdownModel()
            }));
        },
        showResultDisplayDropdown: function(){
            this.resultDisplay.show(DropdownView.createSimpleDropdown([{
                label: 'List',
                value: 'List'
            }, {
                label: 'Grid',
                value: 'Grid'
            }], false, [store.get('user').get('user').get('preferences').get('resultDisplay')]));
            this.stopListening(this.resultDisplay.currentView.model);
            this.listenTo(this.resultDisplay.currentView.model, 'change:value', function(){
                store.get('user').get('user').get('preferences')
                    .set('resultDisplay',  this.resultDisplay.currentView.model.get('value')[0]);
            });
        }
    });

    return ResultSelector;
});
