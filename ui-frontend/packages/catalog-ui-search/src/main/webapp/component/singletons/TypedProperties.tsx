const properties = require('../../js/properties')

export const TypedProperties = {
  isHidden: (attribute: string): boolean => {
    return properties.isHidden(attribute)
  },
  isReadOnly: (attribute: string): boolean => {
    return properties.isReadOnly(attribute)
  },
  getHiddenAttributes: (): string[] => {
    return properties.hiddenAttributes
  },
  getSummaryShow: (): string[] => {
    return properties.summaryShow
  },
  getResultsAttributesShownTable: (): string[] => {
    return properties.defaultTableColumns
  },
  getResultsAttributesShownList: (): string[] => {
    return properties.resultShow
  },
  getReadOnly: (): string[] => {
    return properties.readOnly
  },
  isPhoneticsEnabled: (): boolean => {
    return properties.isPhoneticsEnabled
  },
  getIconConfig: (): {
    [key: string]: {
      code: string
      size: string
      className: string
      font: string
    }
  } => {
    return properties.iconConfig
  },
  getEnums: (): { [key: string]: string[] } => {
    return properties.enums
  },
  getBasicSearchMatchType: (): string => {
    return properties.basicSearchMatchType
  },
  getBasicSearchTemporalSelectionDefault: (): string[] => {
    return properties.basicSearchTemporalSelectionDefault
  },
  getWebSocketsEnabled: (): boolean => {
    return properties.webSocketsEnabled
  },
}
