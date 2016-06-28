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
/*global define, setTimeout*/
define([
    'marionette',
    'underscore',
    'jquery',
    'text!./metacard-history.hbs',
    'js/CustomElements',
    'component/loading/loading.view',
    'js/store',
    'js/Common'
], function (Marionette, _, $, template, CustomElements, LoadingView, store, Common) {

    var selectedVersion;

    return Marionette.ItemView.extend({
        setDefaultModel: function(){
            this.model = store.getSelectedResults().first();
        },
        template: template,
        tagName: CustomElements.register('metacard-history'),
        modelEvents: {
            'all': 'render'
        },
        events: {
            'click .metacardHistory-body .metacardHistory-row': 'clickWorkspace',
            'click button': 'revertToSelectedVersion'
        },
        ui: {
        },
        initialize: function(options){
            if (!options.model){
                this.setDefaultModel();
            }
            this.loadData();
        },
        loadData: function(){
            selectedVersion = undefined;
            var loadingView = new LoadingView();
            var self = this;
            setTimeout(function(){
                $.get('/services/search/catalog/history/'+self.model.get('metacard').get('id')).then(function(response){
                    self._history = response;
                }).always(function(){
                    loadingView.remove();
                    self.render();
                });
            }, 1000);
        },
        onRender: function(){
            this.showButton();
        },
        serializeData: function(){
            var self = this;
            if (this._history){
                this._history.sort(function(historyItem1, historyItem2){
                    return (new Date(historyItem2.versioned)) - (new Date(historyItem1.versioned));
                });
                this._history.forEach(function(historyItem, index){
                    historyItem.niceDate = Common.getMomentDate(historyItem.versioned);
                    historyItem.versionNumber = self._history.length - index;
                });
            }
            return this._history;
        },
        highlightSelectedWorkspace: function(){
            this.$el.find('.metacardHistory-body .metacardHistory-row').removeClass('is-selected');
            this.$el.find('[data-id='+selectedVersion+']').addClass('is-selected');
        },
        clickWorkspace: function(event){
            var version = event.currentTarget;
            selectedVersion = version.getAttribute('data-id');
            this.highlightSelectedWorkspace();
            this.showButton();
        },
        showButton: function(){
            this.$el.toggleClass('has-selection',Boolean(selectedVersion));
        },
        revertToSelectedVersion: function(){
            var loadingView = new LoadingView();
            var self = this;
            $.get('/services/search/catalog/history/'+this.model.get('metacard').get('id')+'/revert/'+selectedVersion).then(function(response){
                if (!self.isDestroyed){

                }
            }).always(function(){
                if (!self.isDestroyed){
                    loadingView.remove();
                    self.loadData();
                }
            });
        }
    });
});
