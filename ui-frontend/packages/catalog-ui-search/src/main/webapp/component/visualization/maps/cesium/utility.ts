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

import _ from 'underscore'
import ShapeUtils from '../../../../js/ShapeUtils'
const Cesium = require('cesium')
const DistanceUtils = require('../../../../js/DistanceUtils')
const Turf = require('@turf/turf')

const METERS = 'meters'

interface FeatureWithCoords extends GeoJSON.Feature {
  geometry: Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>
}

/*
  A variety of helpful functions for dealing with Cesium
*/
module.exports = {
  /*
      Calculates the center of given a geometry (WKT)
    */
  calculateCartesian3CenterOfGeometry(propertyModel: any) {
    return Cesium.BoundingSphere.fromPoints(
      Cesium.Cartesian3.fromDegreesArray(_.flatten(propertyModel.getPoints()))
    ).center
  },
  /*
      Calculates the center of given a geometry (WKT)
    */
  calculateCartographicCenterOfGeometryInRadians(propertyModel: any) {
    return Cesium.Cartographic.fromCartesian(
      this.calculateCartesian3CenterOfGeometry(propertyModel)
    )
  },
  /*
      Calculates the center of given a geometry (WKT)
    */
  calculateCartographicCenterOfGeometryInDegrees(propertyModel: any) {
    const cartographicCenterInRadians = this.calculateCartographicCenterOfGeometryInRadians(
      propertyModel
    )
    return [
      Cesium.Math.toDegrees(cartographicCenterInRadians.longitude),
      Cesium.Math.toDegrees(cartographicCenterInRadians.latitude),
    ]
  },
  calculateWindowCenterOfGeometry(geometry: any, map: any) {
    let cartesian3position = geometry
    if (cartesian3position.constructor !== Cesium.Cartesian3) {
      cartesian3position = this.calculateCartesian3CenterOfGeometry(
        cartesian3position
      )
    }
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      map.scene,
      cartesian3position
    )
  },
  /*
      Calculates the center of given geometries (WKT)
    */
  calculateCartesian3CenterOfGeometries(propertyModels: any) {
    const allPoints = propertyModels.map((propertyModel: any) =>
      propertyModel.getPoints()
    )
    return Cesium.BoundingSphere.fromPoints(
      Cesium.Cartesian3.fromDegreesArray(_.flatten(allPoints))
    ).center
  },
  /*
      Calculates the center of given geometries (WKT)
    */
  calculateCartographicCenterOfGeometriesInRadians(propertyModels: any) {
    return Cesium.Cartographic.fromCartesian(
      this.calculateCartesian3CenterOfGeometries(propertyModels)
    )
  },
  /*
      Calculates the center of given geometries (WKT)
    */
  calculateCartographicCenterOfGeometriesInDegrees(propertyModels: any) {
    const cartographicCenterInRadians = this.calculateCartographicCenterOfGeometriesInRadians(
      propertyModels
    )
    return [
      Cesium.Math.toDegrees(cartographicCenterInRadians.longitude),
      Cesium.Math.toDegrees(cartographicCenterInRadians.latitude),
    ]
  },
  featureFromShape(shape: any) {
    const attrs = shape.model.attributes

    switch (attrs.type) {
      case 'LINE':
        const line = Turf.lineString(attrs.line)
        const lineMeters = DistanceUtils.getDistanceInMeters(
          attrs.lineWidth,
          attrs.lineUnits
        )
        return lineMeters ? Turf.buffer(line, lineMeters, METERS) : line
      case 'POLYGON':
        const polygon = Turf.polygon([attrs.polygon])
        const polygonMeters = DistanceUtils.getDistanceInMeters(
          attrs.polygonBufferWidth,
          attrs.polygonBufferUnits
        )
        return polygonMeters
          ? Turf.buffer(polygon, polygonMeters, METERS)
          : polygon
      case 'MULTIPOLYGON':
        const isMultiPolygon = ShapeUtils.isArray3D(attrs.polygon)
        const multiPolygon = isMultiPolygon
          ? Turf.polygon(attrs.polygon)
          : Turf.polygon([attrs.polygon])
        const multiPolygonMeters = DistanceUtils.getDistanceInMeters(
          attrs.polygonBufferWidth,
          attrs.polygonBufferUnits
        )
        return multiPolygonMeters
          ? Turf.buffer(multiPolygon, multiPolygonMeters, METERS)
          : multiPolygon
      case 'BBOX':
        return Turf.bboxPolygon([
          attrs.west,
          attrs.south,
          attrs.east,
          attrs.north,
        ])
      case 'POINTRADIUS':
        const point = Turf.point([attrs.lon, attrs.lat])
        const pointRadiusMeters = DistanceUtils.getDistanceInMeters(
          attrs.radius,
          attrs.radiusUnits
        )
        return pointRadiusMeters
          ? Turf.buffer(point, pointRadiusMeters, METERS)
          : point
      default:
        return null
    }
  },
  featureIsValid(feature: FeatureWithCoords) {
    return feature?.geometry?.coordinates?.length
  },
}
