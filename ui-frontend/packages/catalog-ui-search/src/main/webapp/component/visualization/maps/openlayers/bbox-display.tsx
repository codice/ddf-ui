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
import _ from 'underscore'
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { removeOldDrawing } from './drawing-and-display'
import { getIdFromModelForDisplay } from '../drawing-and-display'
import { StartupDataStore } from '../../../../js/model/Startup/startup'
import { Translation } from '../interactions.provider'
import { contrastingColor } from '../../../../react-component/location/location-color-selector'
const modelToRectangle = (model: any) => {
  //ensure that the values are numeric
  //so that the openlayer projections
  //do not fail
  const north = parseFloat(model.get('mapNorth'))
  const south = parseFloat(model.get('mapSouth'))
  let east = parseFloat(model.get('mapEast'))
  let west = parseFloat(model.get('mapWest'))
  if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
    // this.destroyPrimitive()
    return
  }
  // If south is greater than north,
  // remove shape from map
  if (south > north) {
    // this.destroyPrimitive()
    return
  }
  if (
    validateGeo(
      'polygon',
      JSON.stringify([
        [west, north],
        [east, north],
        [west, south],
        [east, south],
        [west, north],
      ])
    )?.error
  ) {
    return
  }
  // If we are crossing the date line, we must go outside [-180, 180]
  // for openlayers to draw correctly. This means we can't draw boxes
  // that encompass more than half the world. This actually matches
  // how the backend searches anyway.
  if (east - west < -180) {
    east += 360
  } else if (east - west > 180) {
    west += 360
  }
  const northWest = ol.proj.transform(
    [west, north],
    'EPSG:4326',
    StartupDataStore.Configuration.getProjection()
  )
  const northEast = ol.proj.transform(
    [east, north],
    'EPSG:4326',
    StartupDataStore.Configuration.getProjection()
  )
  const southWest = ol.proj.transform(
    [west, south],
    'EPSG:4326',
    StartupDataStore.Configuration.getProjection()
  )
  const southEast = ol.proj.transform(
    [east, south],
    'EPSG:4326',
    StartupDataStore.Configuration.getProjection()
  )
  const coords = []
  coords.push(northWest)
  coords.push(northEast)
  coords.push(southEast)
  coords.push(southWest)
  coords.push(northWest)
  const rectangle = new ol.geom.LineString(coords)
  return rectangle
}
export const drawBbox = ({
  map,
  model,
  rectangle,
  id,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  rectangle: any
  id: string
  isInteractive?: boolean
  translation?: Translation
}) => {
  if (!rectangle) {
    // handles case where model changes to empty vars and we don't want to draw anymore
    return
  }
  if (translation) {
    rectangle.translate(translation.longitude, translation.latitude)
  }
  const billboard = new ol.Feature({
    geometry: rectangle,
  })
  billboard.setId(id)
  billboard.set('locationId', model.get('locationId'))
  const color = model.get('color')
  const iconStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: isInteractive ? contrastingColor : color ? color : '#914500',
      width: isInteractive ? 6 : 4,
    }),
  })
  billboard.setStyle(iconStyle)
  const vectorSource = new ol.source.Vector({
    features: [billboard],
  })
  let vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  })
  vectorLayer.set('id', id)
  const mapRef = map.getMap() as ol.Map
  removeOldDrawing({ map: mapRef, id })
  mapRef.addLayer(vectorLayer)
}
const updatePrimitive = ({
  map,
  model,
  id,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  id: string
  isInteractive?: boolean
  translation?: Translation
}) => {
  const rectangle = modelToRectangle(model)
  // make sure the current model has width and height before drawing
  if (
    rectangle &&
    !_.isUndefined(rectangle) &&
    model.get('north') !== model.get('south') &&
    model.get('east') !== model.get('west')
  ) {
    drawBbox({ rectangle, map, model, id, isInteractive, translation })
    //only call this if the mouse button isn't pressed, if we try to draw the border while someone is dragging
    //the filled in shape won't show up
    // if (!this.buttonPressed) {
    //   drawBorderedRectangle(rectangle)
    // }
  }
}
const useListenToBboxModel = ({
  model,
  map,
  isInteractive,
  translation,
}: {
  model: any
  map: any
  isInteractive?: boolean
  translation?: Translation
}) => {
  const callback = React.useMemo(() => {
    return () => {
      if (model && map) {
        updatePrimitive({
          map,
          model,
          id: getIdFromModelForDisplay({ model }),
          isInteractive,
          translation,
        })
      }
    }
  }, [model, map, isInteractive, translation])
  useListenTo(
    model,
    'change:mapNorth change:mapSouth change:mapEast change:mapWest',
    callback
  )
  callback()
}
export const OpenlayersBboxDisplay = ({
  map,
  model,
  isInteractive,
  translation,
}: {
  map: any
  model: any
  isInteractive?: boolean
  translation?: Translation
}) => {
  useListenToBboxModel({ map, model, isInteractive, translation })
  React.useEffect(() => {
    return () => {
      if (map && model) {
        removeOldDrawing({
          map: map.getMap(),
          id: getIdFromModelForDisplay({ model }),
        })
      }
    }
  }, [map, model])
  return <></>
}
