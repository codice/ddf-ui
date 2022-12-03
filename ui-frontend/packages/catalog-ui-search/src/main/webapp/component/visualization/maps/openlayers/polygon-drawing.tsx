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
import wreqr from '../../../../js/wreqr.js'
import { useRender } from '../../../hooks/useRender'
import OpenLayersGeometryUtils from '../../../../js/OpenLayersGeometryUtils'
import { removeOldDrawing } from './drawing-and-display'
import {
  drawPolygon,
  translateFromOpenlayersCoordinates,
} from './polygon-display'
import { getIdFromModelForDrawing } from '../drawing-and-display'

const setModelFromGeometry = ({
  model,
  geometry,
}: {
  model: any
  geometry: any
}) => {
  model.set({
    polygon: translateFromOpenlayersCoordinates(geometry.getCoordinates()),
  })
}

const useStartMapDrawing = ({ map, model }: { map: any; model: any }) => {
  const [feature, setFeature] = React.useState<any>(null)
  const render = useRender()

  React.useEffect(() => {
    if (feature && map && model) {
      let animationId = window.requestAnimationFrame(() => {
        drawPolygon({
          map,
          model,
          rectangle: feature.feature.getGeometry(),
          id: getIdFromModelForDrawing({ model }),
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
        type: 'Polygon',
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
        setModelFromGeometry({ geometry, model })
        model.trigger('EndExtent', model)
        wreqr.vent.trigger('search:polydisplay', model)
        wreqr.vent.trigger('search:drawpoly-end', model)
        mapRef.removeInteraction(primitive)
      })
      return () => {
        setFeature(null)
        mapRef.removeInteraction(primitive)
        removeOldDrawing({
          map: mapRef,
          id: getIdFromModelForDrawing({ model }),
        })
      }
    }
    return () => {}
  }, [map, model])
}

export const OpenlayersPolygonDrawing = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useStartMapDrawing({ map, model })
  return <></>
}
