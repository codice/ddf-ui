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
  ResourceSizeRangeFilterClass,
  FilterClass,
  sizeUnits,
  isResourceSizeRangeFilterClass,
} from '../filter-builder/filter.structure'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'
import { NumberField } from './number'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'

type GenericFilterType = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

type ResourceSizeRangeFieldProps = {
  filter: ResourceSizeRangeFilterClass
  setFilter: (filter: ResourceSizeRangeFilterClass) => void
}

const defaultValue = {
  start: 0,
  end: 1,
  startUnits: 'B',
  endUnits: 'B',
}

function castAndParseFilterValue(
  value: unknown
): ResourceSizeRangeFilterClass['value'] {
  const castedValue = value as ResourceSizeRangeFilterClass['value']
  try {
    return {
      start: castAndParseValue(castedValue.start, defaultValue.start),
      end: castAndParseValue(castedValue.end, defaultValue.end),
    }
  } catch (e) {
    return {
      start: defaultValue.start,
      end: defaultValue.end,
    }
  }
}

function parseFilterContext(
  context: unknown
): ResourceSizeRangeFilterClass['context'] {
  const castedContext = context as ResourceSizeRangeFilterClass['context']
  try {
    return {
      startUnits: castAndParseUnit(
        castedContext.startUnits,
        defaultValue.startUnits
      ),
      endUnits: castAndParseUnit(castedContext.endUnits, defaultValue.endUnits),
    }
  } catch (e) {
    return {
      startUnits: defaultValue.startUnits,
      endUnits: defaultValue.endUnits,
    }
  }
}

export function castAndParseValue(
  value: unknown,
  defaultValue: number
): number {
  try {
    const castedValue = value as number
    if (typeof castedValue === 'number' && !isNaN(castedValue)) {
      return castedValue
    }
  } catch (e) {
    // If casting fails, fall through to default
  }
  return defaultValue
}

export function castAndParseUnit(unit: unknown, defaultValue: string): string {
  try {
    const castedUnit = unit as string
    if (sizeUnits.includes(castedUnit)) {
      return castedUnit
    }
  } catch (e) {
    // If casting fails, fall through to default
  }
  return defaultValue
}

function parseFilter(props: GenericFilterType): ResourceSizeRangeFilterClass {
  const { filter } = props
  let newValue = castAndParseFilterValue(filter.value)
  let newContext = parseFilterContext(filter.context)

  return new ResourceSizeRangeFilterClass({
    ...filter,
    value: {
      start: newValue.start,
      end: newValue.end,
    },
    context: {
      startUnits: newContext.startUnits,
      endUnits: newContext.endUnits,
    },
  })
}

const ResourceSizeRangeFieldWrapper: React.FC<GenericFilterType> = ({
  filter,
  setFilter,
}) => {
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!isResourceSizeRangeFilterClass(filter)) {
        setFilter(parseFilter({ filter, setFilter }))
      }
    }, 250)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [filter])

  if (!isResourceSizeRangeFilterClass(filter)) {
    return <LinearProgress />
  }

  return <ResourceSizeRangeField filter={filter} setFilter={setFilter} />
}

const ResourceSizeRangeField: React.FC<ResourceSizeRangeFieldProps> = ({
  filter,
  setFilter,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row items-start">
        <NumberField
          value={filter.value.start.toString()}
          TextFieldProps={{ label: 'From' }}
          type="float"
          onChange={(val) => {
            setFilter(
              new ResourceSizeRangeFilterClass({
                ...filter,
                value: { start: val, end: filter.value.end },
              })
            )
          }}
          {...EnterKeySubmitProps}
        />
        <Autocomplete
          value={filter.context.startUnits}
          onChange={(_, newValue) =>
            setFilter(
              new ResourceSizeRangeFilterClass({
                ...filter,
                context: {
                  startUnits: newValue || 'B',
                  endUnits: filter.context.endUnits,
                },
              })
            )
          }
          className="min-w-24 ml-2"
          options={sizeUnits}
          renderInput={(params) => <TextField {...params} size="small" />}
          fullWidth
        />
      </div>
      <div className="flex flex-row items-start">
        <NumberField
          value={filter.value.end.toString()}
          TextFieldProps={{ label: 'To' }}
          type="float"
          onChange={(val) => {
            setFilter(
              new ResourceSizeRangeFilterClass({
                ...filter,
                value: { start: filter.value.start, end: val },
              })
            )
          }}
          {...EnterKeySubmitProps}
        />
        <Autocomplete
          value={filter.context.endUnits}
          className="min-w-24 ml-2"
          onChange={(_, newValue) => {
            setFilter(
              new ResourceSizeRangeFilterClass({
                ...filter,
                context: {
                  startUnits: filter.context.startUnits,
                  endUnits: newValue || 'B',
                },
              })
            )
          }}
          options={sizeUnits}
          renderInput={(params) => <TextField {...params} size="small" />}
          fullWidth
        />
      </div>
    </div>
  )
}

export { ResourceSizeRangeFieldWrapper as ResourceSizeRangeField }
