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
import fetch from '../../../react-component/utils/fetch/fetch'
import { Subscribable } from '../Base/base-classes'
import { StartupPayloadType } from './startup.types'

function getLocalCatalog(data?: StartupPayloadType) {
  return data?.localSourceId || 'local'
}

function getSourcePollInterval(data?: StartupPayloadType) {
  return data?.config.sourcePollInterval || 60000
}

function markHarvestedSources({
  sources,
  data,
}: {
  sources: StartupPayloadType['sources']
  data?: StartupPayloadType
}) {
  sources.forEach((source) => {
    source.harvested = data?.harvestedSources?.includes(source.id)
  })
}

function updateSources({
  data,
  sources,
}: {
  data?: StartupPayloadType
  sources: StartupPayloadType['sources']
}) {
  if (data) {
    sources = removeLocalCatalogIfNeeded({ sources, data })
    sources = removeCache({ sources })
    markLocalSource({ sources, data })
    markHarvestedSources({ sources, data })
    sources = sortSources({ sources })
    data.sources = sources
  }
}

function removeLocalCatalogIfNeeded({
  sources,
  data,
}: {
  sources: StartupPayloadType['sources']
  data?: StartupPayloadType
}) {
  if (StartupDataStore.data?.config.disableLocalCatalog) {
    sources = sources.filter((source) => source.id !== getLocalCatalog(data))
  }
  return sources
}

function removeCache({ sources }: { sources: StartupPayloadType['sources'] }) {
  return sources.filter((source) => source.id !== 'cache')
}

function markLocalSource({
  sources,
  data,
}: {
  sources: StartupPayloadType['sources']
  data?: StartupPayloadType
}) {
  const localSource = sources.find(
    (source) => source.id === getLocalCatalog(data)
  )
  if (localSource) {
    localSource.local = true
  }
}

function sortSources({ sources }: { sources: StartupPayloadType['sources'] }) {
  return sources.sort((a, b) => {
    const aName = a.id.toLowerCase()
    const bName = b.id.toLowerCase()
    const aAvailable = a.available
    const bAvailable = b.available
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
    return 0
  })
}

/**
 *   This fetches all the information necessary to start the application.
 */

class StartupData extends Subscribable<'fetched' | 'sources-update'> {
  data?: StartupPayloadType
  constructor() {
    super()
    this.subscribeTo({
      subscribableThing: 'fetched',
      callback: () => {
        window.setTimeout(() => {
          this.startPollingSources()
        }, getSourcePollInterval(this.data))
      },
    })
    this.fetch()
  }
  fetch() {
    fetch('./internal/compose/startup')
      .then((response) => response.json())
      .then((startupPayload: StartupPayloadType) => {
        this.data = startupPayload
        this._notifySubscribers('fetched')
        this.setHarvestedSources([startupPayload.localSourceId])
      })
  }
  fetchSources() {
    fetch('./internal/catalog/sources')
      .then((response) => response.json())
      .then((sources) => {
        updateSources({ data: this.data, sources })
        this._notifySubscribers('sources-update')
      })
  }
  startPollingSources() {
    window.setInterval(() => {
      this.fetchSources()
    }, getSourcePollInterval(this.data))
  }
  setHarvestedSources(harvestedSources: string[]) {
    if (this.data) {
      this.data.harvestedSources = harvestedSources
      updateSources({ data: this.data, sources: this.data.sources })
      this._notifySubscribers('sources-update')
    }
  }
}

export const StartupDataStore = new StartupData()
