import { Subscribable } from '../Base/base-classes'
import { StartupPayloadType } from './startup.types'
import { StartupData } from './startup'
import fetch from '../../../react-component/utils/fetch/fetch'

function getLocalCatalog(data?: Sources) {
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
  data?: Sources
}) {
  sources.forEach((source) => {
    source.harvested = data?.harvestedSources?.includes(source.id)
  })
}

function updateSources({
  data,
  sources,
}: {
  data?: Sources
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
  data?: Sources
}) {
  if (data?.disableLocalCatalog) {
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
  data?: Sources
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

class Sources extends Subscribable<['sources-update', undefined]> {
  sources: StartupPayloadType['sources'] = []
  localSourceId: StartupPayloadType['localSourceId'] = 'local'
  harvestedSources: StartupPayloadType['harvestedSources'] = ['local']
  sourcePollInterval: StartupPayloadType['config']['sourcePollInterval'] = 60000
  disableLocalCatalog: StartupPayloadType['config']['disableLocalCatalog'] =
    false
  constructor(startupData?: StartupData) {
    super()
    startupData?.subscribeTo({
      subscribableThing: 'fetched',
      callback: (startupPayload) => {
        this.sources = startupPayload.sources
        this.localSourceId = startupPayload.localSourceId
        this.harvestedSources = startupPayload.harvestedSources
        this.disableLocalCatalog = startupPayload.config.disableLocalCatalog
        this.sourcePollInterval = getSourcePollInterval(startupPayload)
        this.setHarvestedSources(this.harvestedSources)
        this.startPollingSources()
      },
    })
  }

  fetchSources() {
    fetch('./internal/catalog/sources')
      .then((response) => response.json())
      .then((sources) => {
        this.updateSources(sources)
      })
  }

  startPollingSources() {
    window.setInterval(() => {
      this.fetchSources()
    }, this.sourcePollInterval)
  }
  updateSources(sources: StartupPayloadType['sources'] = []) {
    updateSources({ data: this, sources })
    this._notifySubscribers('sources-update', undefined)
  }
  setHarvestedSources(harvestedSources: string[] = []) {
    if (this.sources) {
      this.harvestedSources =
        harvestedSources.length > 0 ? harvestedSources : [this.localSourceId]
      this.updateSources(this.sources)
    }
  }
}

export { Sources }
