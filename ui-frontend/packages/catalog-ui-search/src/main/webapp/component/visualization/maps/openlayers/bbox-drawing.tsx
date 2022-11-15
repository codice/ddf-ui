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
import { removeOldDrawing } from './drawing-and-display'
import DistanceUtils from '../../../../js/DistanceUtils'
import { drawBbox } from './bbox-display'
const properties = require('../../../../js/properties.js')

const setModelFromGeometry = ({
  model,
  geometry,
}: {
  model: any
  geometry: any
}) => {
  const extent = geometry.getExtent()

  const northWest = ol.proj.transform(
    [extent[0], extent[3]],
    properties.projection,
    'EPSG:4326'
  )
  const southEast = ol.proj.transform(
    [extent[2], extent[1]],
    properties.projection,
    'EPSG:4326'
  )
  model.set({
    north: DistanceUtils.coordinateRound(northWest[1]),
    south: DistanceUtils.coordinateRound(southEast[1]),
    west: DistanceUtils.coordinateRound(northWest[0]),
    east: DistanceUtils.coordinateRound(southEast[0]),
  })
}

const useStartMapDrawing = ({ map, model }: { map: any; model: any }) => {
  const [feature, setFeature] = React.useState<any>(null)
  const render = useRender()

  React.useEffect(() => {
    if (feature && map && model) {
      let animationId = window.requestAnimationFrame(() => {
        drawBbox({
          map,
          model,
          rectangle: feature.getGeometry(),
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
      const primitive = new ol.interaction.DragBox({
        condition: ol.events.condition.always,
        // @ts-ignore
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0],
          }),
        }),
      })

      mapRef.addInteraction(primitive)
      let startCoordinate = null as any
      let endCoordinate = null as any
      primitive.on('boxstart', (sketchFeature: any) => {
        startCoordinate = sketchFeature.coordinate
      })
      primitive.on('boxdrag', (sketchFeature: any) => {
        endCoordinate = sketchFeature.coordinate
        const geometryRepresentation = new ol.geom.LineString([
          startCoordinate,
          [startCoordinate[0], endCoordinate[1]],
          endCoordinate,
          [endCoordinate[0], startCoordinate[1]],
          startCoordinate,
        ])
        const feature = new ol.Feature({
          geometry: geometryRepresentation,
        })
        setFeature(feature)
      })
      primitive.on('boxend', (_sketchFeature: any) => {
        const geometryRepresentation = new ol.geom.LineString([
          startCoordinate,
          [startCoordinate[0], endCoordinate[1]],
          endCoordinate,
          [endCoordinate[0], startCoordinate[1]],
          startCoordinate,
        ])
        setModelFromGeometry({ geometry: geometryRepresentation, model })
        model.trigger('EndExtent', model)
        wreqr.vent.trigger('search:bboxdisplay', model)
        wreqr.vent.trigger('search:drawbbox-end', model)
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

export const OpenlayersBboxDrawing = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useStartMapDrawing({ map, model })
  return <></>
}