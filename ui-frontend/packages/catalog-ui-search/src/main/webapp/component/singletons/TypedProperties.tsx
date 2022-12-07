import properties from '../../js/properties'
export const TypedProperties = {
  isHidden: (attribute: string): boolean => {
    return properties.isHidden(attribute)
  },
  isReadOnly: (attribute: string): boolean => {
    return properties.isReadOnly(attribute)
  },
  getHiddenAttributes: (): string[] => {
    return (properties as any).hiddenAttributes
  },
  getSummaryShow: (): string[] => {
    return (properties as any).summaryShow
  },
  getResultsAttributesShownTable: (): string[] => {
    return (properties as any).defaultTableColumns
  },
  getResultsAttributesShownList: (): string[] => {
    return (properties as any).resultShow
  },
  getReadOnly: (): string[] => {
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'readOnly' does not exist on type '{ comm... Remove this comment to see the full error message
    return properties.readOnly
  },
  isPhoneticsEnabled: (): boolean => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '() => ...' is not assignable to type 'boolea... Remove this comment to see the full error message
    return properties.isPhoneticsEnabled
  },
  isFuzzyResultsEnabled: (): boolean => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '() => ...' is not assignable to type 'boolea... Remove this comment to see the full error message
    return properties.isFuzzyResultsEnabled
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
  getEnums: (): {
    [key: string]: string[]
  } => {
    return properties.enums
  },
  getBasicSearchMatchType: (): string => {
    return (properties as any).basicSearchMatchType
  },
  getBasicSearchTemporalSelectionDefault: (): string[] => {
    return properties.basicSearchTemporalSelectionDefault
  },
  getWebSocketsEnabled: (): boolean => {
    return (properties as any).webSocketsEnabled
  },
  isDevelopment: (): boolean => {
    return properties.isDevelopment()
  },
  isMetacardPreviewEnabled: (): boolean => {
    return properties.isMetacardPreviewEnabled()
  },
}
