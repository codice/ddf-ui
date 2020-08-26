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
import { useState } from 'react'
import { hot } from 'react-hot-loader'
import styled from 'styled-components'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import SortItem from './sort-item'
import {
  getNextAttribute,
  getSortAttributeOptions,
  getSortDirectionOptions,
  getLabel,
} from './sort-selection-helpers'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

type SortsType = {
  attribute: string
  direction: string
}[]

type Props = {
  value: SortsType
  onChange: (newVal: SortsType) => void
}

export type Option = {
  label: string
  value: string
}

export type SortItemType = {
  attribute: Option
  direction: string
}

const getCollectionAsJson = (collection: Props['value']) => {
  const items: SortItemType[] = collection.map(sort => {
    return {
      attribute: {
        label: getLabel(sort.attribute),
        value: sort.attribute,
      },
      direction: sort.direction,
    }
  })
  return items
}

const SortSelections = ({ value = [], onChange }: Props) => {
  if (!value.length) {
    value.push({
      attribute: 'title',
      direction: 'ascending',
    })
    onChange(value.slice(0))
  }

  const collectionJson = getCollectionAsJson(value)

  const sortAttributeOptions = getSortAttributeOptions(
    collectionJson.map(item => item.attribute.value)
  )

  const updateAttribute = (index: number) => (attribute: string) => {
    value[index].attribute = attribute
    onChange(value.slice(0))
  }

  const updateDirection = (index: number) => (direction: string) => {
    value[index].direction = direction
    onChange(value.slice(0))
  }

  const removeItem = (index: number) => () => {
    value.splice(index, 1)
    onChange(value.slice(0))
  }

  const addSort = () => {
    value.push({
      attribute: getNextAttribute(collectionJson, sortAttributeOptions),
      direction: 'descending',
    })
    onChange(value.slice(0))
  }
  return (
    <div>
      <Typography className="pb-2">Sort</Typography>
      {collectionJson.map((sortItem, index) => {
        return (
          <div
            key={sortItem.attribute.value}
            className={index > 0 ? 'pt-2' : ''}
          >
            <SortItem
              sortItem={sortItem}
              attributeOptions={sortAttributeOptions}
              directionOptions={getSortDirectionOptions(
                sortItem.attribute.value
              )}
              updateAttribute={updateAttribute(index)}
              updateDirection={updateDirection(index)}
              onRemove={removeItem(index)}
              showRemove={index !== 0}
            />
          </div>
        )
      })}
      <div className="pt-2">
        <Button color="primary" fullWidth onClick={addSort}>
          <Grid container direction="row" alignItems="center" wrap="nowrap">
            <Grid item>
              <Box color="text.primary">
                <AddIcon />
              </Box>
            </Grid>
            <Grid item>Sort</Grid>
          </Grid>
        </Button>
      </div>
    </div>
  )
}

export default hot(module)(SortSelections)
