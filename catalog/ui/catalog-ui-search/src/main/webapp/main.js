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
/*global require, window */
/*jslint nomen:false, -W064 */
require.config({
    paths: {
        bootstrap: 'lib/bootstrap/dist/js/bootstrap.min',
        bootstrapselect: 'lib/bootstrap-select/dist/js/bootstrap-select.min',
        cometd: 'lib/cometd/org/cometd',
        bootstrapDatepicker: 'lib/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min',
        jquerycometd: 'lib/cometd/jquery/jquery.cometd',
        moment: 'lib/moment/min/moment.min',
        spin: 'lib/spin.js/spin',
        q: 'lib/q/q',
        spectrum: 'lib/spectrum/spectrum',
        // backbone
        backbone: 'lib/backbone/backbone',
        backboneassociations: 'lib/backbone-associations/backbone-associations',
        backbonepaginator: 'lib/backbone.paginator/lib/backbone.paginator.min',
        backbonecometd: 'lib/backbone-cometd/backbone.cometd.extension',
        poller: 'lib/backbone-poller/backbone.poller',
        underscore: 'lib/lodash/lodash',
        marionette: 'lib/marionette/lib/backbone.marionette',
        // TODO test combining
        modelbinder: 'lib/backbone.modelbinder/Backbone.ModelBinder',
        collectionbinder: 'lib/backbone.modelbinder/Backbone.CollectionBinder',
        // application
        application: 'js/application',
        cometdinit: 'js/cometd',
        direction: 'js/direction',
        webglcheck: 'js/webglcheck',
        twodcheck: 'js/2dmapcheck',
        maptype: 'js/maptype',
        spinnerConfig: 'js/spinnerConfig',
        wreqr: 'js/wreqr',
        properties: 'properties',
        // jquery
        jquery: 'lib/jquery/dist/jquery.min',
        jqueryCookie: 'lib/jquery-cookie/jquery.cookie',
        jqueryuiCore: 'lib/jquery-ui/ui/minified/jquery.ui.core.min',
        datepicker: 'lib/jquery-ui/ui/minified/jquery.ui.datepicker.min',
        progressbar: 'lib/jquery-ui/ui/minified/jquery.ui.progressbar.min',
        slider: 'lib/jquery-ui/ui/minified/jquery.ui.slider.min',
        mouse: 'lib/jquery-ui/ui/minified/jquery.ui.mouse.min',
        datepickerOverride: 'lib/jquery/js/plugin/jquery-ui-datepicker-4digitYearOverride-addon',
        purl: 'lib/purl/purl',
        multiselect: 'lib/jquery-ui-multiselect-widget/src/jquery.multiselect',
        multiselectfilter: 'lib/jquery-ui-multiselect-widget/src/jquery.multiselect.filter',
        'jquery.ui.widget': 'lib/jquery-ui/ui/minified/jquery.ui.widget.min',
        fileupload: 'lib/jquery-file-upload/js/jquery.fileupload',
        jquerySortable: 'lib/jquery-ui/ui/minified/jquery.ui.sortable.min',
        // handlebars
        handlebars: 'lib/handlebars/handlebars.min',
        // require plugins
        text: 'lib/requirejs-plugins/lib/text',
        css: 'lib/require-css/css.min',
        // pnotify
        pnotify: 'lib/pnotify/jquery.pnotify.min',
        // map
        cesium: 'lib/cesiumjs/Cesium/Cesium',
        drawHelper: 'lib/cesium-drawhelper/DrawHelper',
        openlayers: 'lib/openlayers3/build/ol',
        usngs: 'lib/usng.js/usng',
        wellknown: 'lib/wellknown/wellknown',
        // terraformer
        terraformer: 'lib/terraformer/terraformer',
        terraformerWKTParser: 'lib/terraformer-wkt-parser/terraformer-wkt-parser'
    },
    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        backbonepaginator: { deps: ['backbone'] },
        bootstrapDatepicker: {
            deps: [
                'jquery',
                'moment',
                'bootstrap'
            ]
        },
        modelbinder: {
            deps: [
                'underscore',
                'jquery',
                'backbone'
            ]
        },
        collectionbinder: { deps: ['modelbinder'] },
        poller: {
            deps: [
                'underscore',
                'backbone'
            ]
        },
        backboneassociations: ['backbone'],
        backbonecometd: [
            'underscore',
            'jquery',
            'backbone',
            'cometdinit'
        ],
        marionette: {
            deps: [
                'jquery',
                'underscore',
                'backbone'
            ],
            exports: 'Marionette'
        },
        underscore: { exports: '_' },
        handlebars: { exports: 'Handlebars' },
        moment: { exports: 'moment' },
        jquerycometd: {
            deps: [
                'jquery',
                'cometd'
            ]
        },
        'jquery.ui.widget': ['jquery'],
        jqueryuiCore: ['jquery'],
        jqueryCookie: ['jquery'],
        mouse: [
            'jqueryuiCore',
            'jquery.ui.widget'
        ],
        slider: ['mouse'],
        datepicker: ['slider'],
        datepickerOverride: ['datepicker'],
        progressbar: [
            'jquery',
            'jqueryuiCore',
            'jquery.ui.widget'
        ],
        multiselect: [
            'jquery',
            'jquery.ui.widget'
        ],
        multiselectfilter: [
            'jquery',
            'multiselect'
        ],
        fileupload: [
            'jquery',
            'jquery.ui.widget'
        ],
        jquerySortable: [
            'jquery',
            'jqueryuiCore',
            'jquery.ui.widget',
            'mouse'
        ],
        purl: ['jquery'],
        spectrum: ['jquery'],
        bootstrap: ['jquery'],
        cesium: { exports: 'Cesium' },
        drawHelper: {
            deps: ['cesium'],
            exports: 'DrawHelper'
        },
        openlayers: { exports: 'ol' },
        bootstrapselect: ['bootstrap'],
        terraformerWKTParser: ['terraformer']
    },
    waitSeconds: 0
});
/*require.onError = function (err) {
    if (typeof console !== 'undefined') {
        console.error('RequireJS failed to load a module', err);
    }
};*/

window.jQuery = window.$ = require('jquery');
window.CESIUM_BASE_URL = './lib/cesiumjs/Cesium/';
require('jquery-ui');
require('backbone').$ = window.$;
require('cesium.css');

require([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'application',
    'properties',
    'handlebars',
    'js/HandlebarsHelpers',
    'js/ApplicationHelpers'
], function (_, $, Backbone, Marionette, app, properties, hbs) {
    // Make lodash compatible with Backbone
    var lodash = _.noConflict();
    _.mixin({
        'debounce': _.debounce || lodash.debounce,
        'defer': _.defer || lodash.defer,
        'pluck': _.pluck || lodash.pluck
    });
    var document = window.document;
    //in here we drop in any top level patches, etc.
    var cache = {};
    var toJSON = Backbone.Model.prototype.toJSON;
    Backbone.Model.prototype.toJSON = function(options){
        var originalJSON = toJSON.call(this, options);
        if (options && options.additionalProperties !== undefined){
            var backboneModel = this;
            options.additionalProperties.forEach(function(property){
                originalJSON[property] = backboneModel[property];
            });
        }
        return originalJSON;
    };
    var clone = Backbone.Model.prototype.clone;
    Backbone.Model.prototype.clone = function(){
        var cloneRef = clone.call(this);
        cloneRef._cloneOf = this.id || this.cid;
        return cloneRef;
    };
    var associationsClone = Backbone.AssociatedModel.prototype.clone;
    Backbone.AssociatedModel.prototype.clone = function(){
        var cloneRef = associationsClone.call(this);
        cloneRef._cloneOf = this.id || this.cid;
        return cloneRef;
    };
    Marionette.Renderer.render = function (template, data) {
        if (cache[template] === undefined) {
            cache[template] = hbs.compile(template);
        }
        return cache[template](data);
    };
    //$(window).trigger('resize');
    $(document).ready(function () {
        document.title = properties.branding;
    });
    // Actually start up the application.
    app.App.start({});
});
