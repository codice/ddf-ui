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
import { MapViewReact } from '../map.view'

//You typically don't want to use this view directly.  Instead, use the combined-map component which will handle falling back to openlayers.

const $ = require('jquery')
const _ = require('underscore')
const featureDetection = require('../../../singletons/feature-detection.js')

export const CesiumMapViewReact = ({
  selectionInterface,
}: {
  selectionInterface: any
}) => {
  return (
    <MapViewReact
      loadMap={() => {
        const deferred = new $.Deferred()
        require(['./map.cesium'], (CesiumMap) => {
          deferred.resolve(CesiumMap)
        })
        return deferred
      }}
      createMap={() => {}}
      selectionInterface={selectionInterface}
    />
  )
}

// try {
//   MapView.prototype.createMap.apply(this, arguments)
// } catch (err) {
//   console.error(err)
//   this.$el.addClass('not-supported')
//   setTimeout(() => {
//     this.switchTo2DMap()
//   }, 10000)
//   this.endLoading()
// }

// featureDetection.addFailure('cesium')
