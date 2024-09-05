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
import {
  FilterClass,
  isResourceSizeFilterClass,
  ResourceSizeFilterClass,
  sizeUnits,
} from '../filter-builder/filter.structure'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'
import { NumberField } from './number'
import Autocomplete from '@mui/material/Autocomplete'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import { castAndParseUnit, castAndParseValue } from './resource-size-range'

type GenericFilterType = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

type ResourceSizeFieldProps = {
  filter: ResourceSizeFilterClass
  setFilter: (filter: ResourceSizeFilterClass) => void
}

const defaultValue = 0
const defaultUnit = 'B'

const parseFilter = (props: GenericFilterType): ResourceSizeFilterClass => {
  const { filter } = props
  let newValue = castAndParseValue(filter.value, defaultValue)
  let newUnit = castAndParseUnit(filter.context?.units, defaultUnit)

  return new ResourceSizeFilterClass({
    ...filter,
    value: newValue,
    context: { ...filter.context, units: newUnit },
  })
}

type UnitSelectorProps = {
  value: string
  onChange: (newValue: string) => void
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Autocomplete
      value={value}
      onChange={(_event, newValue) => {
        onChange(newValue || defaultUnit)
      }}
      options={sizeUnits}
      className="min-w-24 ml-2"
      renderInput={(params) => <TextField {...params} size="small" />}
      disableClearable
    />
  )
}

const ValidatedResourceSizeField: React.FC<GenericFilterType> = (props) => {
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!isResourceSizeFilterClass(props.filter)) {
        props.setFilter(parseFilter(props))
      }
    }, 250)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [props])

  if (!isResourceSizeFilterClass(props.filter)) {
    return <LinearProgress />
  }

  return <ResourceSizeField filter={props.filter} setFilter={props.setFilter} />
}

const ResourceSizeField: React.FC<ResourceSizeFieldProps> = ({
  filter,
  setFilter,
}) => {
  const handleValueChange = (newValue: number) => {
    setFilter(
      new ResourceSizeFilterClass({
        ...filter,
        value: newValue,
      })
    )
  }

  const handleUnitChange = (newUnit: string) => {
    setFilter(
      new ResourceSizeFilterClass({
        ...filter,
        context: { units: newUnit },
      })
    )
  }

  return (
    <div className="flex flex-row items-start">
      <NumberField
        type="float"
        value={filter.value.toString()}
        onChange={handleValueChange}
        {...EnterKeySubmitProps}
      />
      <UnitSelector value={filter.context.units} onChange={handleUnitChange} />
    </div>
  )
}

export { ValidatedResourceSizeField as ResourceSizeField }
