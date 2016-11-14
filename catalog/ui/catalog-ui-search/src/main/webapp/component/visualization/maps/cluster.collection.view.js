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
/*global require, window*/
var Marionette = require('marionette');
var $ = require('jquery');
var _ = require('underscore');
var store = require('js/store');
var ClusterView = require('./cluster.view');
var Clustering = require('./Clustering');

var ClusterCollectionView = Marionette.CollectionView.extend({
    childView: ClusterView,
    selectionInterface: store,
    childViewOptions: function() {
        return {
            map: this.options.map,
            selectionInterface: this.selectionInterface
        };
    },
    isActive: false,
    initialize: function(options) {
        this.isActive = Boolean(options.isActive) || this.isActive;
        this.render = _.throttle(this.render, 200);
        this.selectionInterface = options.selectionInterface || this.selectionInterface;
        this.options.map.onLeftClick(this.onMapLeftClick.bind(this));
        this.options.map.onMouseMove(this.handleMapHover.bind(this));
        this.listenTo(this.selectionInterface.getActiveSearchResults(), 'reset', this.handleResultsChange);
        this.listenForCameraChange();
        this.listenForResultsChange();
        this.calculateClusters = _.throttle(this.calculateClusters, 200);
        this.render();
    },
    onRender: function() {},
    handleMapHover: function(event, mapEvent) {
        this.children.forEach(function(clusterView) {
            clusterView.handleHover(mapEvent.mapTarget);
        });
    },
    onMapLeftClick: function(event, mapEvent) {
        if (mapEvent.mapTarget) {
            if (event.shiftKey) {
                this.handleShiftClick(mapEvent.mapTarget);
            } else if (event.ctrlKey || event.metaKey) {
                this.handleCtrlClick(mapEvent.mapTarget);
            } else {
                this.handleClick(mapEvent.mapTarget);
            }
        }
    },
    getModelsForId: function(id) {
        return this.collection.get(id.sort().toString()).get('results').models;
    },
    handleClick: function(id) {
        if (id.constructor === Array) {
            this.options.selectionInterface.clearSelectedResults();
            this.options.selectionInterface.addSelectedResult(this.getModelsForId(id));
        }
    },
    handleCtrlClick: function(id) {
        if (id.constructor === Array) {
            this.options.selectionInterface.addSelectedResult(this.getModelsForId(id));
        }
    },
    handleShiftClick: function(id) {
        if (id.constructor === Array) {
            this.options.selectionInterface.addSelectedResult(this.getModelsForId(id));
        }
    },
    handleCameraMoveStart: function() {
        if (!this.isDestroyed) {
            this.startClusterAnimating();
        }
    },
    handleCameraMoveEnd: function() {
        if (!this.isDestroyed) {
            window.cancelAnimationFrame(this.clusteringAnimationFrameId);
            this.calculateClusters();
        }
    },
    listenForCameraChange: function() {
        this.options.map.onCameraMoveStart(this.handleCameraMoveStart.bind(this))
        this.options.map.onCameraMoveEnd(this.handleCameraMoveEnd.bind(this))
    },
    clusteringAnimationFrameId: undefined,
    startClusterAnimating: function() {
        if (this.isActive) {
            this.clusteringAnimationFrameId = window.requestAnimationFrame(function() {
                this.calculateClusters();
                this.startClusterAnimating();
            }.bind(this));
        }
    },
    calculateClusters: function() {
        if (this.isActive) {
            var clusters = Clustering
                .calculateClusters(this.getResultsWithGeometry(), this.options.map);
            this.collection.set(clusters.map(function(cluster) {
                return {
                    results: cluster,
                    id: cluster.map(function(result) {
                        return result.id
                    }).sort().toString()
                };
            }), { merge: false });
        } else {
            this.collection.set([]);
        }
    },
    getResultsWithGeometry: function() {
        return this.selectionInterface.getActiveSearchResults().filter(function(result) {
            return Boolean(result.get('metacard').get('geometry'));
        });
    },
    listenForResultsChange: function() {
        this.listenTo(this.selectionInterface.getActiveSearchResults(), 'reset',
            this.handleResultsChange);
    },
    handleResultsChange: function() {
        this.collection.set([]);
        this.calculateClusters();
    },
    onDestroy: function() {
        window.cancelAnimationFrame(this.clusteringAnimationFrameId);
    },
    toggleActive: function() {
        this.isActive = !this.isActive;
        this.calculateClusters();
    }
});

module.exports = ClusterCollectionView;