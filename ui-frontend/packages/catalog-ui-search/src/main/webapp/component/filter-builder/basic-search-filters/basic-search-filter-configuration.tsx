export interface FontAwesomeIconConfig {
  // FontAwesome classes, e.g., 'fa fa-file-text'
  class: string
}

export interface ValueInformation {
  attributes: {
    [key: string]: string[] // the values to use when filtering on this attribute
  }
  // Optional in case some data types might not have an associated icon, eg
  iconConfig?: FontAwesomeIconConfig
}

export interface FilterConfiguration {
  groups: {
    [key: string]: {
      values: {
        [key: string]: ValueInformation
      }
      iconConfig?: FontAwesomeIconConfig
    }
  }
}

// this is a structure to make it easier to go from value to group, which we'll make by transforming the DataTypesConfiguration
export interface ReverseFilterConfiguration {
  [key: string]: {
    group: {
      name: string
      iconConfig?: FontAwesomeIconConfig
    }
  } & ValueInformation
}
