import { Subscribable } from '../Base/base-classes'
import { StartupPayloadType } from './startup.types'
import { StartupData } from './startup'
import _ from 'underscore'

function match(regexList: any, attribute: any) {
  return (
    _.chain(regexList)
      .map((str) => new RegExp(str))
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(regex: RegExp) => RegExpExecArr... Remove this comment to see the full error message
      .find((regex) => regex.exec(attribute))
      .value() !== undefined
  )
}

class Configuration extends Subscribable<{ thing: 'configuration-update' }> {
  config?: StartupPayloadType['config']
  platformUiConfiguration?: StartupPayloadType['platformUiConfiguration']
  constructor(startupData?: StartupData) {
    super()
    startupData?.subscribeTo({
      subscribableThing: 'fetched',
      callback: (startupPayload) => {
        this.config = startupPayload.config
        this.platformUiConfiguration = startupPayload.platformUiConfiguration
        this._notifySubscribers({ thing: 'configuration-update' })
      },
    })
  }
  isHiddenAttribute = (attribute: any) => {
    if (attribute === 'anyDate') {
      // feels like we should consolidate all the attribute logic into the metacard definitions file, but for now don't want to risk circular dependency
      return true
    }
    return match(this.getHiddenAttributes(), attribute)
  }
  getHiddenAttributes = () => {
    return this.config?.hiddenAttributes || []
  }
  getExportLimit = () => {
    return this.config?.exportResultLimit || 1000
  }
  getResultCount = () => {
    return this.config?.resultCount || 250
  }
  getProjection = () => {
    return this.config?.projection || 'EPSG:4326'
  }
  getI18n = () => {
    return this.config?.i18n || {}
  }
  getAttributeAliases = () => {
    return this.config?.attributeAliases || {}
  }
  isReadOnly = (attribute: string) => {
    return match(this.getReadOnly(), attribute)
  }
  getReadOnly = () => {
    return this.config?.readOnly || []
  }
  getSummaryShow = () => {
    return this.config?.summaryShow || []
  }
  getCommonAttributes = () => {
    return this.config?.commonAttributes || []
  }
  getImageryProviders = () => {
    return this.config?.imageryProviders || []
  }
  getTerrainProvider = () => {
    return this.config?.terrainProvider || {}
  }
  getBingKey = () => {
    return this.config?.bingKey || ''
  }
  getSystemUsageMessage = () => {
    return this.platformUiConfiguration?.systemUsageMessage || ''
  }
  // in minutes
  getPlatformUITimeout = () => {
    return this.platformUiConfiguration?.timeout || 15
  }
  getBasicSearchTemporalSelectionDefault = () => {
    return (
      this.config?.basicSearchTemporalSelectionDefault || [
        'created',
        'effective',
        'modified',
        'metacard.created',
        'metacard.modified',
      ]
    )
  }
  getEnums = () => {
    return this.config?.enums || {}
  }
  getOnlineGazetteer = () => {
    return this.config?.onlineGazetteer || false
  }
  getResultShow = () => {
    return this.config?.resultShow || []
  }
  getIconConfig = () => {
    return this.config?.iconConfig || {}
  }
  getShowRelevanceScores = () => {
    return this.config?.showRelevanceScores || false
  }
  getRelevancePrecision = () => {
    return this.config?.relevancePrecision || 2
  }
  getMapHome = () => {
    return this.config?.mapHome || ''
  }
  getHelpUrl = () => {
    return this.config?.helpUrl || ''
  }
  getCustomBranding = () => {
    return this.config?.customBranding || ''
  }
  getTopLeftLogoSrc = () => {
    return this.config?.topLeftLogoSrc || ''
  }
  getProduct = () => {
    return this.config?.product || ''
  }
  getMenuIconSrc = () => {
    return this.config?.menuIconSrc || ''
  }
  getBottomLeftBackgroundSrc = () => {
    return this.config?.bottomLeftBackgroundSrc || ''
  }
  getPlatformHeader = () => {
    return this.platformUiConfiguration?.header
  }
  getPlatformFooter = () => {
    return this.platformUiConfiguration?.footer
  }
  getPlatformBackground = () => {
    return this.platformUiConfiguration?.background
  }
  getPlatformColor = () => {
    return this.platformUiConfiguration?.color
  }
  getWebSocketsEnabled = () => {
    return this.config?.webSocketsEnabled
  }
  getBasicSearchMatchType = () => {
    return this.config?.basicSearchMatchType || 'datatype'
  }
  getDefaultLayout = () => {
    return this.config?.defaultLayout
  }
  // in milliseconds
  getSearchTimeout = () => {
    return this.config?.timeout || 300000
  }
  getDefaultSources = () => {
    return this.config?.defaultSources && this.config?.defaultSources.length > 0
      ? this.config.defaultSources
      : ['all']
  }
  getDefaultTableColumns = () => {
    return this.config?.defaultTableColumns || []
  }
  getIsFuzzyResultsEnabled = () => {
    return this.config?.isFuzzyResultsEnabled || false
  }
  getDisableUnknownErrorBox = () => {
    return this.config?.disableUnknownErrorBox || false
  }
}

export { Configuration }
