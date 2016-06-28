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
    'wreqr',
    'marionette',
    'underscore',
    'jquery',
    'text!./alert.hbs',
    'js/CustomElements',
    'js/store',
    'component/navigation/alert/navigation.alert.view',
    'component/content/alert/content.alert.view'
], function (wreqr, Marionette, _, $, template, CustomElements, store, NavigationView,
             AlertContentView) {

    return Marionette.LayoutView.extend({
        template: template,
        tagName: CustomElements.register('alert'),
        modelEvents: {
        },
        events: {
        },
        ui: {
        },
        regions: {
            alertMenu: '.alert-menu',
            alertDetails: '.alert-details'
        },
        initialize: function(){
            this.listenTo(store.get('router'), 'change', this.handleRoute);
            this.handleRoute();
        },
        handleRoute: function(){
            var router = store.get('router').toJSON();
            if (router.name === 'openAlert'){
                this.$el.removeClass('is-hidden');
            } else {
                this.$el.addClass('is-hidden');
            }
        },
        onBeforeShow: function(){
            this.alertMenu.show(new NavigationView());
            this.alertDetails.show(new AlertContentView());
        }
    });
});
