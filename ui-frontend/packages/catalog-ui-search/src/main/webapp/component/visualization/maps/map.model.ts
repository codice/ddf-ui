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

import wrapNum from '../../../react-component/utils/wrap-num/wrap-num'

import _ from 'lodash'
import Backbone from 'backbone'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo'
import * as usngs from 'usng.js'
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
const converter = new usngs.Converter()
const usngPrecision = 6

export default Backbone.AssociatedModel.extend({
  defaults: {
    mouseLat: undefined,
    mouseLon: undefined,
    coordinateValues: {
      dms: '',
      lat: '',
      lon: '',
      mgrs: '',
      utmUps: '',
    },
    target: undefined,
    targetMetacard: undefined,
  },
  clearMouseCoordinates() {
    this.set({
      mouseLat: undefined,
      mouseLon: undefined,
    })
  },
  updateMouseCoordinates(coordinates: any) {
    this.set({
      mouseLat: Number(coordinates.lat.toFixed(6)), // wrap in Number to chop off trailing zero
      mouseLon: Number(wrapNum(coordinates.lon, -180, 180).toFixed(6)),
    })
  },
  updateClickCoordinates() {
    const lat = this.get('mouseLat')
    const lon = this.get('mouseLon')
    const dms = `${mtgeo.toLat(lat)} ${mtgeo.toLon(lon)}`
    const mgrs = converter.isInUPSSpace(lat)
      ? undefined
      : converter.LLtoUSNG(lat, lon, usngPrecision)
    const utmUps = converter.LLtoUTMUPS(lat, lon)
    this.set({
      coordinateValues: {
        lat,
        lon,
        dms,
        mgrs,
        utmUps,
      },
    })
  },
})
