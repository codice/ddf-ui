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
define([
        'marionette',
        'backbone',
        'cesium',
        'underscore',
        'wreqr',
        'maptype',
        './notification.view',
        'js/store',
        '@turf/turf'
    ],
    function (Marionette, Backbone, Cesium, _, wreqr, maptype, NotificationView, store, Turf) {
        "use strict";
        var Draw = {};

        Draw.LineRenderView = Backbone.View.extend({
            initialize: function(options){
                this.scene = options.scene;
                this.updatePrimitive();
                this.listenTo(this.model, 'change:line change:lineWidth', this.updatePrimitive);
            },
            modelEvents: {
                'changed': 'updatePrimitive'
            },
            updatePrimitive: function(){
                this.drawLine(this.model);
            },
            drawLine: function (model) {
                var linePoints = model.toJSON().line;
                var lineWidth = model.toJSON().lineWidth || 1;
                if(!linePoints) {
                    return;
                }
                var setArr = _.uniq(linePoints);
                if(setArr.length < 2){
                    return;
                }

                var turfLine = Turf.lineString(setArr);
                var bufferedLine = Turf.buffer(turfLine, lineWidth, 'meters');

                // first destroy old one
                if (this.primitive && !this.primitive.isDestroyed()) {
                    this.scene.primitives.remove(this.primitive);
                }

                var color = this.model.get('color');

                this.primitive = new Cesium.Primitive({
                    asynchronous: false,
                    geometryInstances: [
                        new Cesium.GeometryInstance({
                            geometry: new Cesium.PolygonOutlineGeometry({
                                polygonHierarchy: {
                                    positions: Cesium.Cartesian3.fromDegreesArray(_.flatten(bufferedLine.geometry.coordinates)),
                                    perPositionHeight: true
                                }
                            }),
                            attributes: {
                                color: color ? Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(this.model.get('color'))) :  Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.KHAKI)
                            }
                        })
                    ],
                    appearance: new Cesium.PerInstanceColorAppearance({
                        flat: true,
                        renderState: {
                            depthTest: {
                                enabled: true
                            },
                            lineWidth: Math.min(4.0, this.scene.maximumAliasedLineWidth)
                        }
                    })
                });

                this.scene.primitives.add(this.primitive);
            },
            destroy: function(){
                if(this.primitive){
                    this.scene.primitives.remove(this.primitive);
                }
                this.remove();  // backbone cleanup.
            }
        });

        Draw.Controller = Marionette.Controller.extend({
            enabled: maptype.is3d(),
            initialize: function (options) {
                this.scene = options.scene;
                this.notificationEl = options.notificationEl;
                this.drawHelper = options.drawHelper;
                this.geoController = options.geoController;

                this.listenTo(wreqr.vent, 'search:linedisplay',  function(model){
                    if (this.isVisible()){
                        this.showLine(model);
                    }
                });
                this.listenTo(wreqr.vent, 'search:drawline',  function(model){
                    if (this.isVisible()){
                        this.draw(model);
                    }
                });
                this.listenTo(wreqr.vent, 'search:drawstop',  function(model){
                    if (this.isVisible()){
                        this.stop(model);
                    }
                });
                this.listenTo(wreqr.vent, 'search:drawend',  function(model){
                    if (this.isVisible()){
                        this.destroy(model);
                    }
                });
                this.listenTo(wreqr.vent, 'search:destroyAllDraw',  function(model){
                    if (this.isVisible()){
                        this.destroyAll(model);
                    }
                });
                this.listenTo(store.get('content'), 'change:query',  function(model){
                    if (this.isVisible()){
                        this.destroyAll(model);
                    }
                });
            },
            views: [],
            isVisible: function(){
                return this.scene.canvas.width !== 0;
            },
            destroyAll: function(){
                for (var i = this.views.length - 1; i>=0 ; i-=1){
                    this.destroyView(this.views[i]);
                }
            },
            getViewForModel: function(model){
                return this.views.filter(function(view){
                    return view.model === model;
                })[0];
            },
            removeViewForModel: function(model){
                var view = this.getViewForModel(model);
                if (view){
                    this.views.splice(this.views.indexOf(view), 1);
                }
            },
            removeView: function(view){
                this.views.splice(this.views.indexOf(view), 1);
            },
            addView: function(view){
                this.views.push(view);
            },
            showLine: function(model) {
                if (this.enabled) {
                    this.drawHelper.stopDrawing();
                    // remove old line
                    var existingView = this.getViewForModel(model);
                    if(existingView){
                        existingView.destroy();
                        this.removeViewForModel(model);
                    }
                    var view = new Draw.LineRenderView({model: model, scene: this.scene});
                    this.addView(view);
                }
            },
            draw: function (model) {
                var controller = this;
                var toDeg = Cesium.Math.toDegrees;
                if (this.enabled) {
                    // start line draw.
                    this.notificationView = new NotificationView({
                        el: this.notificationEl
                    }).render();
                    this.drawHelper.startDrawingPolyline({
                        callback: function(positions) {

                            if(controller.notificationView) {
                                controller.notificationView.destroy();
                            }
                            var latLonRadPoints =_.map(positions, function(cartPos){
                                var latLon = controller.geoController.ellipsoid.cartesianToCartographic(cartPos);
                                return [ toDeg(latLon.longitude),toDeg(latLon.latitude)];
                            });

                            //this shouldn't ever get hit because the draw library should protect against it, but just in case it does, remove the point
                            if (latLonRadPoints.length > 3 && latLonRadPoints[latLonRadPoints.length - 1][0] === latLonRadPoints[latLonRadPoints.length - 2][0] &&
                                latLonRadPoints[latLonRadPoints.length - 1][1] === latLonRadPoints[latLonRadPoints.length - 2][1]) {
                                latLonRadPoints.pop();
                            }

                            model.set('line', latLonRadPoints);

                            // doing this out of formality since bbox/circle call this after drawing has ended.
                            model.trigger('EndExtent', model);

                            // lets go ahead and show our new shiny line.
                            wreqr.vent.trigger('search:linedisplay', model);
                        }
                    });
                }
            },
            stop: function () {
                if (this.enabled) {
                    // stop drawing
                    this.drawHelper.stopDrawing();
                    if(this.notificationView) {
                        this.notificationView.destroy();
                    }
                }
            },
            destroyView: function(view){
                view.destroy();
                this.removeView(view);
            },
            destroy: function (model) {
                var view = this.getViewForModel(model);
                // I don't think we need this method.
                if(this.notificationView) {
                    this.notificationView.destroy();
                }
                if(view){
                    view.destroy();
                    this.removeViewForModel(model);
                }
            }
        });

        return Draw;
    });