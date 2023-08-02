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
import Backbone from 'backbone'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'back... Remove this comment to see the full error message
import poller from 'backbone-poller'
import { StartupDataStore } from './Startup/startup'
function removeLocalCatalogIfNeeded(response: any, localCatalog: any) {
  if (StartupDataStore.data?.config.disableLocalCatalog) {
    response = _.filter(response, (source) => source.id !== localCatalog)
  }
  return response
}
function removeCache(response: any) {
  response = _.filter(response, (source) => source.id !== 'cache')
  return response
}

export default Backbone.Collection.extend({
  url: './internal/catalog/sources',
  // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
  comparator(a: any, b: any) {
    const aName = a.id.toLowerCase()
    const bName = b.id.toLowerCase()
    const aAvailable = a.get('available')
    const bAvailable = b.get('available')
    if ((aAvailable && bAvailable) || (!aAvailable && !bAvailable)) {
      if (aName < bName) {
        return -1
      }
      if (aName > bName) {
        return 1
      }
      return 0
    } else if (!aAvailable) {
      return -1
    } else if (!bAvailable) {
      return 1
    }
  },
  initialize() {
    this.listenTo(this, 'change', this.sort)
    this.listenTo(this, 'sync', this.updateLocalCatalog)
    poller
      .get(this, {
        delay: StartupDataStore.data?.config.sourcePollInterval || 60000,
        delayed: StartupDataStore.data?.config.sourcePollInterval || 60000,
        continueOnError: true,
      })
      .start()
  },
  parse(response: any) {
    response = removeLocalCatalogIfNeeded(response, this.localCatalog)
    response = removeCache(response)
    response.sort((a: any, b: any) => {
      return a.id.toLowerCase().localeCompare(b.id.toLowerCase()) // case insensitive sort
    })
    return response
  },
  getHarvested() {
    return [this.localCatalog]
  },
  updateLocalCatalog() {
    if (this.get(this.localCatalog)) {
      this.get(this.localCatalog).set('local', true)
    }
  },
  localCatalog: StartupDataStore.data?.localSourceId || 'local',
})
