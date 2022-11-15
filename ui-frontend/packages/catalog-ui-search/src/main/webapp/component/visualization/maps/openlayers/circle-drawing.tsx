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
import ol from 'openlayers'
const wreqr = require('../../../../js/wreqr.js')
import { useRender } from '../../../hooks/useRender'
import OpenLayersGeometryUtils from '../../../../js/OpenLayersGeometryUtils'
import { removeOldDrawing } from './drawing-and-display'
import DistanceUtils from '../../../../js/DistanceUtils'
import { drawCircle, translateFromOpenlayersCoordinate } from './circle-display'

const setModelFromGeometry = ({
  model,
  geometry,
  map,
}: {
  model: any
  geometry: any
  map: any
}) => {
  const center = translateFromOpenlayersCoordinate(geometry.getCenter())
  const rad =
    geometry.getRadius() *
    map.getMap().getView().getProjection().getMetersPerUnit()

  model.set({
    lat: DistanceUtils.coordinateRound(center[1]),
    lon: DistanceUtils.coordinateRound(center[0]),
    radius: DistanceUtils.coordinateRound(
      DistanceUtils.getDistanceFromMeters(rad, model.get('radiusUnits'))
    ),
  })
}

const useStartMapDrawing = ({ map, model }: { map: any; model: any }) => {
  const [feature, setFeature] = React.useState<any>(null)
  const render = useRender()

  React.useEffect(() => {
    if (feature && map && model) {
      let animationId = window.requestAnimationFrame(() => {
        drawCircle({
          map,
          model,
          rectangle: feature.feature.getGeometry(),
          id: model.cid + 'dynamic',
        })
        render()
      })
      return () => {
        cancelAnimationFrame(animationId)
      }
    }
    return () => {}
  }, [feature, map, model, render])
  React.useEffect(() => {
    if (map && model) {
      const mapRef = map.getMap() as ol.Map
      const primitive = new ol.interaction.Draw({
        type: 'Circle',
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0],
          }),
        }),
      })

      mapRef.addInteraction(primitive)

      primitive.on('drawstart', (sketchFeature: any) => {
        setFeature(sketchFeature)
      })
      primitive.on('drawend', (sketchFeature: any) => {
        const geometry = OpenLayersGeometryUtils.wrapCoordinatesFromGeometry(
          sketchFeature.feature.getGeometry()
        )
        setModelFromGeometry({ model, geometry, map })
        model.trigger('EndExtent', model)
        wreqr.vent.trigger('search:circledisplay', model)
        wreqr.vent.trigger('search:drawcircle-end', model)
        mapRef.removeInteraction(primitive)
      })
      return () => {
        setFeature(null)
        mapRef.removeInteraction(primitive)
        removeOldDrawing({ map: mapRef, id: model.cid + 'dynamic' })
      }
    }
    return () => {}
  }, [map, model])
}

export const OpenlayersCircleDrawing = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useStartMapDrawing({ map, model })
  return <></>
}
