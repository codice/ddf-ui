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

import * as React from 'react'
import IconHelper from '../../js/IconHelper'
import TextField from '@mui/material/TextField'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'

import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks'
import { BasicDatatypeFilter } from '../filter-builder/filter.structure'

import Swath from '../swath/swath'
import {
  DataTypesConfiguration,
  ReverseDataTypesConfiguration,
} from '../datatypes/datatypes'

function getMatchTypeAttribute() {
  return StartupDataStore.MetacardDefinitions.getAttributeMap()[
    StartupDataStore.Configuration.getBasicSearchMatchType()
  ]
    ? StartupDataStore.Configuration.getBasicSearchMatchType()
    : 'datatype'
}

/**
 *  If the configuration is empty, we generate a configuration based off the enum instead
 */
function getTypesMapping({
  Configuration,
  MetacardDefinitions,
}: {
  Configuration: ReturnType<typeof useConfiguration>
  MetacardDefinitions: ReturnType<typeof useMetacardDefinitions>
}): DataTypesConfiguration {
  const customTypesConfig = Configuration.getDataTypes()
  if (Object.keys(customTypesConfig.groups).length > 0) {
    return customTypesConfig
  }
  const matchTypeAttr = getMatchTypeAttribute()
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
    } as ReturnType<typeof Configuration.getDataTypes>
  )
  return defaultTypesMapping
}

export function getDataTypesConfiguration({
  Configuration,
  MetacardDefinitions,
}: {
  Configuration: ReturnType<typeof useConfiguration>
  MetacardDefinitions: ReturnType<typeof useMetacardDefinitions>
}): {
  groupMap: DataTypesConfiguration
  valueMap: ReverseDataTypesConfiguration
} {
  const typesMapping = getTypesMapping({ Configuration, MetacardDefinitions })
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
    {} as ReverseDataTypesConfiguration
  )

  return {
    groupMap: typesMapping,
    valueMap: reverseMapping,
  }
}

function getGroupFromValue({
  dataTypesConfiguration,
  value,
  orderedGroups,
}: {
  dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>
  value: string
  orderedGroups: string[]
}) {
  const groupName = dataTypesConfiguration.valueMap[value]?.group.name
  return orderedGroups.includes(groupName)
    ? groupName
    : orderedGroups.includes(value)
    ? value
    : null
}

export function generateSortedValues({
  dataTypesConfiguration,
}: {
  dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>
}) {
  const orderedGroups = Object.keys(dataTypesConfiguration.groupMap.groups)
  return Object.keys(dataTypesConfiguration.valueMap)
    .concat(orderedGroups)
    .sort((a, b) => {
      const groupA = getGroupFromValue({
        dataTypesConfiguration,
        value: a,
        orderedGroups,
      })
      const groupB = getGroupFromValue({
        dataTypesConfiguration,
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
  dataTypesConfiguration,
}: {
  dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>
}) {
  return Object.keys(dataTypesConfiguration.groupMap.groups).reduce(
    (groupsToValuesMapping, groupName) => {
      groupsToValuesMapping[groupName] = Object.keys(
        dataTypesConfiguration.groupMap.groups[groupName].values
      )
      return groupsToValuesMapping
    },
    {} as { [key: string]: string[] }
  )
}

export function generateKnownGroups({
  dataTypesConfiguration,
}: {
  dataTypesConfiguration: ReturnType<typeof getDataTypesConfiguration>
}) {
  return Object.keys(dataTypesConfiguration.groupMap.groups)
}

function useDataTypesConfiguration(): {
  configuration: ReturnType<typeof getDataTypesConfiguration>
  sortedValues: { label: string; value: string }[]
  groupsToValues: {
    [key: string]: string[]
  }
  knownGroups: string[]
} {
  const Configuration = useConfiguration()
  const MetacardDefinitions = useMetacardDefinitions()

  const dataTypesConfiguration = React.useMemo(() => {
    return getDataTypesConfiguration({ Configuration, MetacardDefinitions })
  }, [Configuration.getDataTypes(), MetacardDefinitions])

  const sortedValues = React.useMemo(() => {
    return generateSortedValues({ dataTypesConfiguration })
  }, [dataTypesConfiguration])

  const groupsToValues = React.useMemo(() => {
    return generateGroupsToValues({ dataTypesConfiguration })
  }, [dataTypesConfiguration])

  const knownGroups = React.useMemo(() => {
    return generateKnownGroups({ dataTypesConfiguration })
  }, [dataTypesConfiguration])

  return {
    configuration: dataTypesConfiguration,
    sortedValues,
    groupsToValues,
    knownGroups,
  }
}

function validateShape({
  value,
  onChange,
}: {
  value: BasicDatatypeFilter['value']
  onChange: (value: BasicDatatypeFilter['value']) => void
}) {
  if (!hasValidShape({ value })) {
    onChange([])
  }
}

function hasValidShape({
  value,
}: {
  value: BasicDatatypeFilter['value']
}): boolean {
  if (value === undefined || value === null || !Array.isArray(value)) {
    return false
  } else {
    return (
      value.find((subvalue) => {
        return typeof subvalue !== 'string'
      }) === undefined
    )
  }
}

function getIconForValue({
  value,
  configuration,
}: {
  value: string
  configuration: ReturnType<typeof getDataTypesConfiguration>
}) {
  return (
    configuration.valueMap[value]?.iconConfig?.class ||
    configuration.groupMap.groups[value]?.iconConfig?.class
  )
}

export const ReservedBasicDatatype = ({
  value = [],
  onChange,
}: {
  value: BasicDatatypeFilter['value']
  onChange: (value: BasicDatatypeFilter['value']) => void
}) => {
  const datatypesConfiguration = useDataTypesConfiguration()
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])

  if (!hasValidShape({ value })) {
    return null
  }
  return (
    <Autocomplete
      fullWidth
      multiple
      options={datatypesConfiguration.sortedValues}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onChange={(_e, newValue) => {
        // should technically only ever be one value, since we filter these out at the end
        const includedGroup = newValue.find((val) => {
          return datatypesConfiguration.knownGroups.includes(val.value)
        })?.value

        // determine if we need to deselect or select all values in a group
        if (includedGroup) {
          // determine if everything in a group is selected
          const groupValues =
            datatypesConfiguration.groupsToValues[includedGroup]
          const isGroupSelected = groupValues.every((val) => {
            return value.includes(val)
          })
          if (isGroupSelected) {
            newValue = newValue.filter((val) => {
              return !groupValues.includes(val.value)
            })
          } else {
            groupValues.forEach((val) => {
              if (!newValue.find((value) => value.value === val)) {
                newValue.push({ label: val, value: val })
              }
            })
          }
        }

        // remove any groups, as we don't actually want these in the value or we can't remove other chips in that category once it gets added
        newValue = newValue.filter((val) => {
          return !datatypesConfiguration.knownGroups.includes(val.value)
        })
        onChange(newValue.map((val) => val.value))
      }}
      size="small"
      renderOption={(props, option) => {
        const isGroup = datatypesConfiguration.knownGroups.includes(
          option.value
        )
        // determine if everything in a group is selected
        const isGroupSelected = isGroup
          ? datatypesConfiguration.groupsToValues[option.value].every((val) => {
              return value.includes(val)
            })
          : false
        // determine if anything in a group is selected but not everything
        const isGroupPartiallySelected =
          isGroup && !isGroupSelected
            ? datatypesConfiguration.groupsToValues[option.value].some(
                (val) => {
                  return value.includes(val)
                }
              )
            : false

        const isSelected = props['aria-selected'] || isGroupSelected

        return (
          <li
            {...props}
            className={`${props.className} ${isGroup ? '!pl-2' : '!pl-8'} ${
              isGroupSelected ? '' : ''
            }`}
            aria-selected={isSelected}
          >
            {isGroup ? <></> : <Swath className="w-1 h-6" />}
            <div className="px-2">
              {isGroup ? (
                isGroupSelected ? (
                  <CheckBoxIcon />
                ) : isGroupPartiallySelected ? (
                  <IndeterminateCheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )
              ) : isSelected ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </div>
            <div
              className={`pr-2 icon ${getIconForValue({
                value: option.value,
                configuration: datatypesConfiguration.configuration,
              })}`}
            />
            <div className="pt-[3px]"> {option.label}</div>
          </li>
        )
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            variant="outlined"
            color="default"
            label={
              <>
                <div
                  className={`pr-2 icon ${getIconForValue({
                    value: option.value,
                    configuration: datatypesConfiguration.configuration,
                  })}`}
                />
                {option.label}
              </>
            }
            {...getTagProps({ index })}
          />
        ))
      }
      value={value.map((val) => {
        return {
          label: val,
          value: val,
        }
      })}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
    />
  )
}
