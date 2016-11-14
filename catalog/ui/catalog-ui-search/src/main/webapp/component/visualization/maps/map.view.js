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
/*global require*/
var wreqr = require('wreqr');
var template = require('./map.hbs');
var Marionette = require('marionette');
var CustomElements = require('js/CustomElements');
var LoadingCompanionView = require('component/loading-companion/loading-companion.view');
var store = require('js/store');
var GeometryCollectionView = require('./geometry.collection.view');
var ClusterCollectionView = require('./cluster.collection.view');
var ClusterCollection = require('./cluster.collection');

module.exports = Marionette.LayoutView.extend({
    tagName: CustomElements.register('map'),
    template: template,
    regions: {
        mapDrawingPopup: '#mapDrawingPopup'
    },
    events: {
        'click .cluster-button': 'toggleClustering'
    },
    clusterCollection: undefined,
    clusterCollectionView: undefined,
    geometryCollectionView: undefined,
    map: undefined,
    initialize: function(options) {
        if (!options.selectionInterface) {
            throw 'Selection interface has not been provided';
        }
        this.listenTo(store.get('content'), 'change:drawing', this.handleDrawing);
        this.handleDrawing();
    },
    setupCollections: function() {
        if (!this.map) {
            throw 'Map has not been set.'
        }
        this.clusterCollection = new ClusterCollection();
        this.geometryCollectionView = new GeometryCollectionView({
            collection: this.options.selectionInterface.getActiveSearchResults(),
            map: this.map,
            selectionInterface: this.options.selectionInterface,
            clusterCollection: this.clusterCollection
        });
        this.clusterCollectionView = new ClusterCollectionView({
            collection: this.clusterCollection,
            map: this.map,
            selectionInterface: this.options.selectionInterface
        });
    },
    setupListeners: function() {
        this.listenTo(wreqr.vent, 'metacard:overlay', this.map.overlayImage.bind(this.map));
        this.listenTo(wreqr.vent, 'metacard:overlay:remove', this.map.removeOverlay.bind(this.map));
        this.listenTo(wreqr.vent, 'search:maprectanglefly', this.map.zoomToExtent.bind(this.map));
        this.listenTo(this.options.selectionInterface, 'reset:activeSearchResults', this.map.removeAllOverlays.bind(this.map));

        this.listenTo(this.options.selectionInterface.getSelectedResults(), 'update', this.map.zoomToSelected.bind(this.map));
        this.listenTo(this.options.selectionInterface.getSelectedResults(), 'add', this.map.zoomToSelected.bind(this.map));
        this.listenTo(this.options.selectionInterface.getSelectedResults(), 'remove', this.map.zoomToSelected.bind(this.map));

        if (this.options.selectionInterface.getSelectedResults()) {
            this.map.zoomToSelected(this.options.selectionInterface.getSelectedResults());
        }
        this.map.onMouseMove(this.onMapHover.bind(this));
    },
    onMapHover: function(event, mapEvent) {
        this.$el.toggleClass('is-hovering', Boolean(mapEvent.mapTarget));
    },
    /*
        Map creation is deferred to this method, so that all resources pertaining to the map can be loaded lazily and 
        not be included in the initial page payload.
        Because of this, make sure to return a deferred that will resolve when your respective map implementation 
        is finished loading / starting up.
        Also, make sure you resolve that deferred by passing the reference to the map implementation.
    */
    createMap: function() {
        throw 'Map not implemented';
    },
    startLoading: function() {
        LoadingCompanionView.beginLoading(this);
    },
    endLoading: function() {
        LoadingCompanionView.endLoading(this);
    },
    onShow: function() {
        this.startLoading();
        setTimeout(function() {
            this.createMap().then(function(Map) {
                this.map = Map(this.el.querySelector('#mapContainer'),
                    this.options.selectionInterface, this.mapDrawingPopup.el);
                this.setupCollections();
                this.setupListeners();
                this.endLoading();
            }.bind(this));
        }.bind(this), 1000);
    },
    toggleClustering: function() {
        this.$el.toggleClass('is-clustering');
        this.clusterCollectionView.toggleActive();
    },
    handleDrawing: function() {
        this.$el.toggleClass('is-drawing', store.get('content').get('drawing'));
    },
    onDestroy: function() {
        if (this.map) {
            this.map.destroy();
        }
    }
});