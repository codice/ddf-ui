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
const LocationView = require('../../location/index.js')
const LocationOldModel = require('../../../component/location-old/location-old')
const ShapeUtils = require('../../../js/ShapeUtils.js')
const wreqr = require('../../../js/wreqr.js')
import { Drawing } from '../../../component/singletons/drawing'
import { useBackbone } from '../../../component/selection-checkbox/useBackbone.hook'

function getCurrentValue({locationModel}: any) {
  const modelJSON = locationModel.toJSON()
  let type
  if (modelJSON.polygon !== undefined) {
    type = ShapeUtils.isArray3D(modelJSON.polygon)
      ? 'MULTIPOLYGON'
      : 'POLYGON'
  } else if (
    modelJSON.lat !== undefined &&
    modelJSON.lon !== undefined &&
    modelJSON.radius !== undefined
  ) {
    type = 'POINTRADIUS'
  } else if (
    modelJSON.line !== undefined &&
    modelJSON.lineWidth !== undefined
  ) {
    type = 'LINE'
  } else if (
    modelJSON.north !== undefined &&
    modelJSON.south !== undefined &&
    modelJSON.east !== undefined &&
    modelJSON.west !== undefined
  ) {
    type = 'BBOX'
  }

  return Object.assign(modelJSON, {
    type,
    lineWidth: modelJSON.lineWidth,
    radius: modelJSON.radius,
  })
}

function clearLocation({locationModel, setState}: any) {
  locationModel.set(new LocationOldModel().toJSON())
  wreqr.vent.trigger('search:drawend', locationModel)
  setState(locationModel.toJSON())
}

function updateMap({locationModel}: any) {
  const mode = locationModel.get('mode')
    if (mode !== undefined && Drawing.isDrawing() !== true) {
      wreqr.vent.trigger('search:' + mode + 'display', locationModel)
    }
}

const LocationInput = ({onChange, value}: any) => {
  const [locationModel] = React.useState(new LocationOldModel(value) as any)
  const [state, setState] = React.useState(locationModel.toJSON() as any)
  const {listenTo} = useBackbone()
  React.useEffect(() => {
    onChange(getCurrentValue({locationModel}))
    listenTo(locationModel, 'change', () => {
      setState(locationModel.toJSON())
      updateMap({locationModel})
      onChange(getCurrentValue({locationModel}))
    })
    listenTo(locationModel,'change:mapNorth change:mapSouth change:mapEast change:mapWest', locationModel.setLatLon)
    listenTo(locationModel, 'change:mode', () => {
      clearLocation({locationModel, setState})
    })
    return () => {
      locationModel.set(new LocationOldModel().toJSON())
      wreqr.vent.trigger('search:drawend', locationModel)
    }
  }, [])

  const options = {
    // @ts-ignore ts-migrate(6133) FIXME: 'drawingType' is declared but its value is never r... Remove this comment to see the full error message
    onDraw: (drawingType: any) => {
      wreqr.vent.trigger(
        'search:draw' + locationModel.get('mode'),
        locationModel
      )
    },
  }
  return (
    <LocationView
    state={state}
    options={options}
    setState={(args:any) => locationModel.set(args)}
  /> )
}

export default LocationInput
