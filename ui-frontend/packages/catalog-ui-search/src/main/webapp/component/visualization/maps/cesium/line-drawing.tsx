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
import React from 'react'
const Cesium = require('cesium')
const wreqr = require('../../../../js/wreqr.js')

const toDeg = Cesium.Math.toDegrees

const useStartMapDrawing = ({ map, model }: { map: any; model: any }) => {
  React.useEffect(() => {
    if (map && model) {
      map.getMap().drawHelper[`startDrawingPolyline`]({
        callback: (positions: any) => {
          const latLonRadPoints = positions.map((cartPos: any) => {
            const latLon = map
              .getMap()
              .scene.globe.ellipsoid.cartesianToCartographic(cartPos)
            return [toDeg(latLon.longitude), toDeg(latLon.latitude)]
          })

          //this shouldn't ever get hit because the draw library should protect against it, but just in case it does, remove the point
          if (
            latLonRadPoints.length > 3 &&
            latLonRadPoints[latLonRadPoints.length - 1][0] ===
              latLonRadPoints[latLonRadPoints.length - 2][0] &&
            latLonRadPoints[latLonRadPoints.length - 1][1] ===
              latLonRadPoints[latLonRadPoints.length - 2][1]
          ) {
            latLonRadPoints.pop()
          }

          model.set('line', latLonRadPoints)

          // doing this out of formality since bbox/circle call this after drawing has ended.
          model.trigger('EndExtent', model)

          // lets go ahead and show our new shiny polygon.
          wreqr.vent.trigger(`search:linedisplay`, model)
        },
      })
      return () => {}
    }
    return () => {}
  }, [map, model])
}

export const CesiumLineDrawing = ({ map, model }: { map: any; model: any }) => {
  useStartMapDrawing({ map, model })
  React.useEffect(() => {
    return () => {
      if (map && model) {
      }
    }
  }, [map, model])
  return <></>
}
