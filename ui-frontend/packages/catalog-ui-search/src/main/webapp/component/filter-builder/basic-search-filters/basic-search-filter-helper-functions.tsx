import * as React from 'react'

import {
  FilterConfiguration,
  ReverseFilterConfiguration,
} from './basic-search-filter-configuration'
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks'
import IconHelper from '../../../js/IconHelper'
import { StartupDataStore } from '../../../js/model/Startup/startup'
import { useConfiguration } from '../../../js/model/Startup/configuration.hooks'

function getValues(
  Configuration: ReturnType<typeof useConfiguration>,
  filterName: string
): FilterConfiguration {
  const values = {
    groups: Configuration.getExtra()?.[filterName]?.groups || {},
  }
  return values
}

function getMatchTypeAttribute(filterName: string) {
  return StartupDataStore.MetacardDefinitions.getAttributeMap()[
    StartupDataStore.Configuration.getBasicSearchMatchType()
  ]
    ? StartupDataStore.Configuration.getBasicSearchMatchType()
    : filterName
}

function getFilterMapping({
  Configuration,
  MetacardDefinitions,
  filterName,
}: {
  Configuration: ReturnType<typeof useConfiguration>
  MetacardDefinitions: ReturnType<typeof useMetacardDefinitions>
  filterName: string
}): FilterConfiguration {
  const filterValues = getValues(Configuration, filterName)
  if (Object.keys(filterValues.groups).length > 0) {
    return filterValues
  }
  const matchTypeAttr = getMatchTypeAttribute(filterName)
  const validTypes = MetacardDefinitions.getEnum(matchTypeAttr)
  const defaultTypesMapping = validTypes.reduce(
    (blob, value: any) => {
      const iconClass = IconHelper.getClassByName(value)
      blob.groups['Other'] = blob.groups['Other'] || {}
      blob.groups['Other'].values = blob.groups['Other'].values || {}

      blob.groups['Other'].values[value] = {
        attributes: {
          datatype: [value],
          'metadata-content-type': [value],
        },
        iconConfig: {
          class: iconClass,
        },
      }
      return blob
    },
    {
      groups: {},
    } as ReturnType<typeof getValues>
  )
  return defaultTypesMapping
}
export function getFilterConfiguration({
  Configuration,
  MetacardDefinitions,
  filterName,
}: {
  Configuration: ReturnType<typeof useConfiguration>
  MetacardDefinitions: ReturnType<typeof useMetacardDefinitions>
  filterName: string
}): {
  groupMap: FilterConfiguration
  valueMap: ReverseFilterConfiguration
} {
  const typesMapping = getFilterMapping({
    Configuration,
    MetacardDefinitions,
    filterName,
  })
  const reverseMapping = Object.entries(typesMapping.groups).reduce(
    (blob, [groupName, groupInfo]) => {
      Object.entries(groupInfo.values).forEach(([valueName, valueInfo]) => {
        blob[valueName] = {
          group: {
            name: groupName,
            iconConfig: groupInfo.iconConfig,
          },
          ...valueInfo,
        }
      })
      return blob
    },
    {} as ReverseFilterConfiguration
  )

  return {
    groupMap: typesMapping,
    valueMap: reverseMapping,
  }
}

function getGroupFromValue({
  filterConfiguration,
  value,
  orderedGroups,
}: {
  filterConfiguration: ReturnType<typeof getFilterConfiguration>
  value: string
  orderedGroups: string[]
}) {
  const groupName = filterConfiguration.valueMap[value]?.group.name
  return orderedGroups.includes(groupName)
    ? groupName
    : orderedGroups.includes(value)
    ? value
    : null
}

function generateSortedValues({
  filterConfiguration,
}: {
  filterConfiguration: ReturnType<typeof getFilterConfiguration>
}) {
  const orderedGroups = Object.keys(filterConfiguration.groupMap.groups)
  return Object.keys(filterConfiguration.valueMap)
    .concat(orderedGroups)
    .sort((a, b) => {
      const groupA = getGroupFromValue({
        filterConfiguration,
        value: a,
        orderedGroups,
      })
      const groupB = getGroupFromValue({
        filterConfiguration,
        value: b,
        orderedGroups,
      })

      // Handle cases where one value has a group and the other doesn't (grouped comes first)
      if (groupA && !groupB) return -1
      if (!groupA && groupB) return 1

      // Sort by group if both values have different groups (group order matters)
      if (groupA && groupB && groupA !== groupB) {
        return orderedGroups.indexOf(groupA) - orderedGroups.indexOf(groupB)
      }

      // If they are in the same group, sort by whether the value itself is the group (if it's the group, it comes first)
      if (groupA === groupB) {
        if (a === groupA) return -1
        if (b === groupB) return 1
        return a.localeCompare(b) // Sub-sort alphabetically if not the group itself
      }

      // If no groups are involved, sort alphabetically
      return a.localeCompare(b)
    })
    .map((value) => {
      return {
        label: value,
        value,
      }
    })
}

export function generateGroupsToValues({
  filterConfiguration,
}: {
  filterConfiguration: ReturnType<typeof getFilterConfiguration>
}) {
  return Object.keys(filterConfiguration.groupMap.groups).reduce(
    (groupsToValuesMapping, groupName) => {
      groupsToValuesMapping[groupName] = Object.keys(
        filterConfiguration.groupMap.groups[groupName].values
      )
      return groupsToValuesMapping
    },
    {} as { [key: string]: string[] }
  )
}

export function generateKnownGroups({
  filterConfiguration,
}: {
  filterConfiguration: ReturnType<typeof getFilterConfiguration>
}) {
  return Object.keys(filterConfiguration.groupMap.groups)
}

export function useFilterConfiguration(filterName: string): {
  configuration: ReturnType<typeof getFilterConfiguration>
  sortedValues: { label: string; value: string }[]
  groupsToValues: {
    [key: string]: string[]
  }
  knownGroups: string[]
} {
  const Configuration = useConfiguration()
  const MetacardDefinitions = useMetacardDefinitions()

  const filterConfiguration = React.useMemo(() => {
    return getFilterConfiguration({
      Configuration,
      MetacardDefinitions,
      filterName,
    })
  }, [getValues(Configuration, filterName), MetacardDefinitions])

  const sortedValues = React.useMemo(() => {
    return generateSortedValues({ filterConfiguration })
  }, [filterConfiguration])

  const groupsToValues = React.useMemo(() => {
    return generateGroupsToValues({ filterConfiguration })
  }, [filterConfiguration])

  const knownGroups = React.useMemo(() => {
    return generateKnownGroups({ filterConfiguration })
  }, [filterConfiguration])

  return {
    configuration: filterConfiguration,
    sortedValues,
    groupsToValues,
    knownGroups,
  }
}

export function getIconForValue({
  value,
  configuration,
}: {
  value: string
  configuration: ReturnType<typeof getFilterConfiguration>
}) {
  return (
    configuration.valueMap[value]?.iconConfig?.class ||
    configuration.groupMap.groups[value]?.iconConfig?.class
  )
}
