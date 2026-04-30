import Swath from '../../../swath/swath'
import * as React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

import { KeyDisseminatorsFilter } from './filter.structure'
import {
  getIconForValue,
  useFilterConfiguration,
} from '../basic-search-filter-helper-functions'
import { KeyDisseminatorsPropertyName } from './property-name'
function validateShape({
  value,
  onChange,
}: {
  value: KeyDisseminatorsFilter['value']
  onChange: (value: KeyDisseminatorsFilter['value']) => void
}) {
  if (!hasValidShape({ value })) {
    onChange([])
  }
}

function hasValidShape({
  value,
}: {
  value: KeyDisseminatorsFilter['value']
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

export const KeyDisseminatorsFilterAutoComplete = ({
  value = [],
  onChange,
}: {
  value: KeyDisseminatorsFilter['value']
  onChange: (value: KeyDisseminatorsFilter['value']) => void
}) => {
  const filterConfiguration = useFilterConfiguration(
    KeyDisseminatorsPropertyName
  )
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
      options={filterConfiguration.sortedValues}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onChange={(_e, newValue) => {
        // should technically only ever be one value, since we filter these out at the end
        const includedGroup = newValue.find((val) => {
          return filterConfiguration.knownGroups.includes(val.value)
        })?.value

        // determine if we need to deselect or select all values in a group
        if (includedGroup) {
          // determine if everything in a group is selected
          const groupValues = filterConfiguration.groupsToValues[includedGroup]
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
          return !filterConfiguration.knownGroups.includes(val.value)
        })
        onChange(newValue.map((val) => val.value))
      }}
      size="small"
      renderOption={(props, option) => {
        const isGroup = filterConfiguration.knownGroups.includes(option.value)
        // determine if everything in a group is selected

        const isGroupSelected = isGroup
          ? filterConfiguration.groupsToValues[option.value].every((val) => {
              return value.includes(val)
            })
          : false
        // determine if anything in a group is selected but not everything
        const isGroupPartiallySelected =
          isGroup && !isGroupSelected
            ? filterConfiguration.groupsToValues[option.value].some((val) => {
                return value.includes(val)
              })
            : false

        const isSelected = props['aria-selected'] || isGroupSelected
        const { key, ...properties } = props
        return (
          <li
            key={key}
            {...properties}
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
                configuration: filterConfiguration.configuration,
              })}`}
            />
            <div className="pt-[3px]"> {option.label}</div>
          </li>
        )
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index })
          return (
            <Chip
              variant="outlined"
              color="default"
              label={
                <>
                  <div
                    className={`pr-2 icon ${getIconForValue({
                      value: option.value,
                      configuration: filterConfiguration.configuration,
                    })}`}
                  />
                  {option.label}
                </>
              }
              {...tagProps}
              key={key}
            />
          )
        })
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
