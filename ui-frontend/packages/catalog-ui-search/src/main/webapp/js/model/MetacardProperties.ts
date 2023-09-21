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
import Backbone from 'backbone'

import _ from 'underscore'
import * as TurfMeta from '@turf/meta'
import wkx from 'wkx'
import 'backbone-associations'
import { StartupDataStore } from './Startup/startup'

export default Backbone.AssociatedModel.extend({
  type: 'metacard-properties',
  defaults() {
    return {
      'metacard-tags': ['resource'],
    }
  },
  hasGeometry(attribute: any) {
    return (
      _.filter(
        this.toJSON(),
        (_value, key) =>
          (attribute === undefined || attribute === key) &&
          StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
          StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
            'GEOMETRY'
      ).length > 0
    )
  },
  getCombinedGeoJSON() {
    return
  },
  getPoints(attribute: any) {
    try {
      return this.getGeometries(attribute).reduce(
        (pointArray: any, wkt: any) =>
          pointArray.concat(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
            TurfMeta.coordAll(wkx.Geometry.parse(wkt).toGeoJSON())
          ),
        []
      )
    } catch (err) {
      console.error(err)
      return []
    }
  },
  getGeometries(attribute: any) {
    return _.filter(
      this.toJSON(),
      (_value, key) =>
        !StartupDataStore.Configuration.isHiddenAttribute(key) &&
        (attribute === undefined || attribute === key) &&
        StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
        StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
          'GEOMETRY'
    )
  },
})
