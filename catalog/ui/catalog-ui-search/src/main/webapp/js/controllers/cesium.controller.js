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
/*global define*/
/*jshint newcap:false */

define(['application',
        'underscore',
        'backbone',
        'marionette',
        'cesium',
        'q',
        'wreqr',
        'js/store',
        'properties',
        'js/view/cesium.metacard',
        'jquery',
        'drawHelper',
        'js/controllers/cesium.layerCollection.controller',
        'js/widgets/cesium.mapclustering',
        'js/model/user'
    ], function (Application, _, Backbone, Marionette, Cesium, Q, wreqr, store, properties, CesiumMetacard,
                 $, DrawHelper, LayerCollectionController, MapClustering, user) {
        "use strict";

        var imageryProviderTypes = LayerCollectionController.imageryProviderTypes;

         var mapclustering = new MapClustering();

        var CesiumLayerCollectionController = LayerCollectionController.extend({
            initialize: function () {
                this.listenTo(wreqr.vent, 'preferencesModal:reorder:bigMap', this.reIndexAll);

                // there is no automatic chaining of initialize.
                LayerCollectionController.prototype.initialize.apply(this, arguments);
            }
        });

        var Controller = Marionette.Controller.extend({
            selectionInterface: store,
            initialize: function(options){
                this.selectionInterface = options.selectionInterface || this.selectionInterface;
                this.overlays = {};
                this.listenTo(wreqr.vent, 'metacard:overlay', this.overlayImage);
                this.listenTo(wreqr.vent, 'metacard:overlay:remove', this.removeOverlay);
                this.clustering = false;

                Cesium.BingMapsApi.defaultKey = properties.bingKey || 0;
                this.mapViewer = this.createMap();
                this.drawHelper = new DrawHelper(this.mapViewer);

                this.scene = this.mapViewer.scene;
                //this.scene.backgroundColor = Cesium.Color.WHITE.clone();
                this.ellipsoid = this.mapViewer.scene.globe.ellipsoid;
                this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
                this.setupEvents();
                this._billboardPromise = this.preloadBillboards();
            },

            toggleClustering: function() {
                if(!this.clustering) {
                    this.clustering = true;
                    mapclustering.clusteringAlgorithm();
                } else {
                    this.clustering = false;
                    mapclustering.resetBillboard();
                }
             },

            createMap: function () {
                var layerPrefs = user.get('user>preferences>mapLayers');
                var layerCollectionController = new CesiumLayerCollectionController({
                    collection: layerPrefs
                });

                var viewer = layerCollectionController.makeMap({
                        element: this.options.element,
                        cesiumOptions: {
                            sceneMode: Cesium.SceneMode.SCENE3D,
                            animation: false,
                            fullscreenButton: false,
                            timeline: false,
                            geocoder: properties.gazetteer,
                            homeButton: true,
                            sceneModePicker: true,
                            selectionIndicator: false,
                            infoBox: false,
                            //skyBox: false,
                            //skyAtmosphere: false,
                            baseLayerPicker: false // Hide the base layer picker
                        }
                    }
                );

                var that = this;
                viewer.camera.moveEnd.addEventListener(function() {
                    if(that.clustering) {
                        var cartographic = new Cesium.Cartographic();
                        var metersToKm = 0.001;
                        viewer.scene.mapProjection.ellipsoid.cartesianToCartographic(viewer.camera.positionWC, cartographic);
                        var cameraHeight = (cartographic.height * metersToKm).toFixed(1);
                        mapclustering.clusteringAlgorithm(cameraHeight);
                    }
                });

                 mapclustering.setViewer(viewer);

                if (properties.terrainProvider) {
                    var type = imageryProviderTypes[properties.terrainProvider.type];
                    var initObj = _.omit(properties.terrainProvider, 'type');
                    viewer.scene.terrainProvider = new type(initObj);
                }

                if (properties.gazetteer) {
                    var container = $('div.cesium-viewer-geocoderContainer');
                    container.html("");
                    viewer._geocoder = new Cesium.Geocoder({
                        container: container[0],
                        url: '/services/',
                        scene: viewer.scene
                    });
                }
                $(this.options.element).find('.cesium-viewer-toolbar').append("<button class='cesium-button cesium-toolbar-button cesium-home-button'><span class='cluster-results'></span></button>");

                return viewer;
            },

            billboards: [
                'images/default.png',
                'images/default-selected.png'
                // add extra here if you want to switch
            ],
            // since we only need a single global collection of these billboards, we can prepare them here, if it
            // gets more complex, this should be pushed to individual collection views or views.
            preloadBillboards: function () {
                var controller = this;
                controller.billboardCollection = new Cesium.BillboardCollection();
                // cesium loads the images asynchronously, so we need to use promises
                this.billboardPromise = Q.all(_.map(this.billboards, function (billboard) {
                    return Q(Cesium.loadImage(billboard));
                }))
                    .then(function (images) {
                        var texAtlas = new Cesium.TextureAtlas({
                            context: controller.scene.context,
                            images: images
                        });
                        controller.billboardCollection.textureAtlas = texAtlas;
                        controller.scene.primitives.add(controller.billboardCollection);
                    });
                return this.billboardPromise;
            },

            setupEvents: function () {
                var controller = this;
                //Left button events
                controller.handler.setInputAction(function (event) {
                    controller.trigger('click:left', controller.pickObject(event), false);
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                controller.handler.setInputAction(function (event) {
                    controller.trigger('click:left', controller.pickObject(event), true);

                }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
                controller.handler.setInputAction(function (event) {
                    controller.trigger('click:left', controller.pickObject(event), true);

                }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.SHIFT);


                controller.handler.setInputAction(function (event) {
                    controller.trigger('doubleclick:left', controller.pickObject(event));

                }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                //Right button events
                controller.handler.setInputAction(function (event) {
                    //Tack on the object if one was clicked
                    controller.trigger('click:right', controller.pickObject(event));

                }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            },

            pickObject: function (event) {
                var controller = this,
                //Add the offset created by the timeline
                    position = new Cesium.Cartesian2(event.position.x, event.position.y),
                    selectedObject = controller.scene.pick(position);

                if (selectedObject) {
                    selectedObject = selectedObject.primitive;
                }

                return {
                    position: event.position,
                    object: selectedObject
                };
            },

            expandRectangle: function (rectangle) {
                var scalingFactor = 0.25;

                var widthGap = Math.abs(rectangle.east) - Math.abs(rectangle.west);
                var heightGap = Math.abs(rectangle.north) - Math.abs(rectangle.south);

                //ensure rectangle has some size
                if (widthGap === 0) {
                    widthGap = 1;
                }
                if (heightGap === 0) {
                    heightGap = 1;
                }

                rectangle.east = rectangle.east + Math.abs(scalingFactor * widthGap);
                rectangle.north = rectangle.north + Math.abs(scalingFactor * heightGap);
                rectangle.south = rectangle.south - Math.abs(scalingFactor * heightGap);
                rectangle.west = rectangle.west - Math.abs(scalingFactor * widthGap);

                return rectangle;
            },

            getResultCenterPoint: function (result) {
                var regionPoints = [],
                    resultQuad,
                    quadrantCounts = [
                        {
                            quad: 'one',
                            count: 0
                        },
                        {
                            quad: 'two',
                            count: 0
                        },
                        {
                            quad: 'three',
                            count: 0
                        },
                        {
                            quad: 'four',
                            count: 0
                        }
                    ];

                result.each(function (item) {
                    if (item.get("metacard").get("geometry")) {
                        var point = item.get("metacard").get("geometry").getPoint();
                        if (point.longitude > 0 && point.latitude > 0) {
                            quadrantCounts[0].count++;
                        } else if (point.longitude < 0 && point.latitude > 0) {
                            quadrantCounts[1].count++;
                        } else if (point.longitude < 0 && point.latitude < 0) {
                            quadrantCounts[2].count++;
                        } else {
                            quadrantCounts[3].count++;
                        }
                    }
                });

                quadrantCounts = _.sortBy(quadrantCounts, 'count');

                quadrantCounts.reverse();
                resultQuad = quadrantCounts[0].quad;

                result.each(function (item) {
                    if (item.get("metacard").get("geometry")) {
                        var newPoint = item.get("metacard").get("geometry").getPoint(),
                            isInRegion = false;

                        if (newPoint.longitude >= 0 && newPoint.latitude >= 0 && resultQuad === "one") {
                            isInRegion = true;
                        } else if (newPoint.longitude <= 0 && newPoint.latitude >= 0 && resultQuad === "two") {
                            isInRegion = true;
                        } else if (newPoint.longitude <= 0 && newPoint.latitude <= 0 && resultQuad === "three") {
                            isInRegion = true;
                        } else if (newPoint.longitude >= 0 && newPoint.latitude <= 0 && resultQuad === "four") {
                            isInRegion = true;
                        }

                        if (isInRegion) {
                            regionPoints.push(newPoint);
                        }
                    }
                });

                if (regionPoints.length === 0) {
                    return null;
                }

                var cartPoints = _.map(regionPoints, function (point) {
                    return Cesium.Cartographic.fromDegrees(point.longitude, point.latitude, point.altitude);
                });

                var rectangle = Cesium.Rectangle.fromCartographicArray(cartPoints);
                return rectangle;
            },
            flyToLocation: function (model) {
                var geometry = model.get('geometry');
                this.flyToGeometry(geometry);
            },

            flyToGeometry: function (geometry) {
                var rectangle, cartArray;

                cartArray = _.map(geometry.getAllPoints(), function (coordinate) {
                    return Cesium.Cartographic.fromDegrees(coordinate[0], coordinate[1], properties.defaultFlytoHeight);
                });

                rectangle = Cesium.Rectangle.fromCartographicArray(cartArray);
                this.flyToRectangle(rectangle);
            },

            flyToRectangle: function (rectangle) {
                if (rectangle.north === rectangle.south && rectangle.east === rectangle.west) {
                    this.mapViewer.scene.camera.flyTo({
                        duration: 0.250,
                        destination: Cesium.Cartesian3.fromRadians(rectangle.west, rectangle.north, this.mapViewer.camera._positionCartographic.height)
                    });
                } else {
                    this.mapViewer.scene.camera.flyTo({
                        destination: this.expandRectangle(rectangle)
                    });
                }

            },

            flyToCenterPoint: function (results) {
                var rectangle = this.getResultCenterPoint(results);
                if (rectangle) {
                    this.flyToRectangle(rectangle);
                }
            },

            overlayImage: function (model) {
                var metacardId = model.get('properties').get('id');
                this.removeOverlay(metacardId);

                var coords = model.get('geometry').getPolygon();
                var cartographics = _.map(coords, function(coord) {
                    return Cesium.Cartographic.fromDegrees(coord.longitude, coord.latitude, coord.altitude);
                });

                var rectangle = Cesium.Rectangle.fromCartographicArray(cartographics);

                var overlayLayer = this.scene.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
                    url: model.get('currentOverlayUrl'),
                    rectangle: rectangle
                }));

                this.overlays[metacardId] = overlayLayer;
            },

            removeOverlay: function (metacardId) {
                if (this.overlays[metacardId]) {
                    this.scene.imageryLayers.remove(this.overlays[metacardId]);
                    delete this.overlays[metacardId];
                }
            },

            removeAllOverlays: function() {
                for (var overlay in this.overlays) {
                    if (this.overlays.hasOwnProperty(overlay)) {
                        this.scene.imageryLayers.remove(this.overlays[overlay]);
                    }
                }
                this.overlays = {};
            },


            newActiveSearchResults: function (results) {
                this.newResults(results);
            },

            newResults: function (results, zoomOnResults) {
                this.showResults(results);
                if (zoomOnResults) {
                    this.flyToCenterPoint(results);
                }
                this.removeAllOverlays();
            },
            zoomToSelected: function(){
                if (this.selectionInterface.getSelectedResults().length === 1){
                    this.flyToCenterPoint(this.selectionInterface.getSelectedResults());
                }
            },

            zoomToResult: function(result){
                this.flyToCenterPoint(new Backbone.Collection([result]));
            },

            showResults: function (results) {
                this.clearResults();
                this.mapViews = new CesiumMetacard.ResultsView({
                    collection: results,
                    geoController: this,
                    selectionInterface: this.selectionInterface
                });
                this.mapViews.render();
                mapclustering.setResultLists(this.mapViews);

                if(this.clustering && typeof results !== "undefined") {
                    mapclustering.clusteringAlgorithm();
                }



            },
            
            showResult: function(result){
                this.clearResults();
                this.mapViews = new CesiumMetacard.ResultsView({
                    collection: new Backbone.Collection([result]),
                    geoController: this,
                    selectionInterface: this.selectionInterface
                });
                this.mapViews.render();
                mapclustering.setResultLists(this.mapViews);

                if(this.clustering && typeof results !== "undefined") {
                    mapclustering.clusteringAlgorithm();
                }
            },

            clear: function () {
                this.clearResults();
                this.billboardCollection.removeAll();
            },

            clearResults: function () {
                if (this.mapViews) {
                    this.mapViews.destroy();
                }
                if (this.clustering) {
                    mapclustering.resetBillboard();
                }
            }

        });

        return Controller;
    }
);
