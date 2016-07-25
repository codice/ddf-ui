/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
/*global define, require, setTimeout */
// #Main Application
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone',
    'properties',
    'maptype',
    // Templates
    'text!templates/header.layout.handlebars',
    'text!templates/footer.layout.handlebars',
    'js/controllers/Modal.controller',
    'js/controllers/SystemUsage.controller',
    'js/model/user',
    // Load non attached libs and plugins
    'bootstrap',
    'backboneassociations',
    'backbonecometd',
    'jquerycometd',
    'modelbinder',
    'collectionbinder',
    'datepicker',
    'datepickerOverride',
    'multiselect',
    'multiselectfilter'
], function ($, _, Marionette, Backbone, properties, maptype, header, footer, ModalController, SystemUsageController, User) {
    var Application = {};
    Application.App = new Marionette.Application();
    Application.AppModel = new Backbone.Model(properties);
    Application.UserModel = new User.Response();
    Application.UserModel.fetch();
    Application.Controllers = { modalController: new ModalController({ application: Application.App }) };
    // Set up the main regions that will be available at the Application level.
    Application.App.addRegions({
        loadingRegion: '#loading',
        headerRegion: 'header',
        footerRegion: 'footer',
        workspacesRegion: '#workspaces',
        workspaceRegion: '#workspace',
        metacardRegion: '#metacard',
        alertRegion: '#alert',
        controlPanelRegion: '#controlPanel',
        modalRegion: '#modalRegion'
    });

    //setup the header
    Application.App.addInitializer(function () {
        Application.App.headerRegion.show(new Marionette.ItemView({
            template: header,
            className: 'header-layout',
            model: Application.AppModel
        }));
        if (Application.AppModel.get('ui').header && Application.AppModel.get('ui').header !== ""){
            $('body').addClass('has-header');
        }
    });
    //setup the footer
    Application.App.addInitializer(function () {
        Application.App.footerRegion.show(new Marionette.ItemView({
            template: footer,
            className: 'footer-layout',
            model: Application.AppModel
        }));
        if (Application.AppModel.get('ui').footer &&Application.AppModel.get('ui').footer !== ""){
            $('body').addClass('has-footer');
        }
    });

    //load all modules
    Application.App.addInitializer(function () {
        require([
            'js/module/Notification.module',
            'js/module/Tasks.module',
            //'js/module/Content.module',
            //'js/module/Home.module',
            'js/router'
        ], function(){
            setTimeout(function(){
                Application.App.loadingRegion.$el.removeClass('is-open');
            }, 1000);
        });
    });

    // show System Notification Banner
    Application.App.addInitializer(function () {
        new SystemUsageController();
    });


    // Once the application has been initialized (i.e. all initializers have completed), start up
    // Backbone.history.
    Application.App.on('start', function () {
        Backbone.history.start();
    });


    return Application;
});
