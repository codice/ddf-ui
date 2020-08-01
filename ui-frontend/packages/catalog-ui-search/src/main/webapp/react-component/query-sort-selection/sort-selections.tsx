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

const AddSortContainer = styled.div`
  padding: 0px 1.5rem;
`

type Props = {
  collection: any
}

export type Option = {
  label: string
  value: string
}

export type SortItemType = {
  attribute: Option
  direction: string
}

const getCollectionAsJson = (collection: any) => {
  const items: SortItemType[] = collection.models.map((model: any) => {
    return {
      attribute: {
        label: getLabel(model.get('attribute')),
        value: model.get('attribute'),
      },
      direction: model.get('direction'),
    }
  })
  return items
}

const SortSelections = ({ collection }: Props) => {
  if (!collection.length) {
    collection.add({
      attribute: 'title',
      direction: 'ascending',
    })
  }

  const { listenTo } = useBackbone()
  const [collectionJson, setCollectionJson] = useState<SortItemType[]>(
    getCollectionAsJson(collection)
  )

  const sortAttributeOptions = getSortAttributeOptions(
    collectionJson.map(item => item.attribute.value)
  )

  React.useEffect(() => {
    listenTo(collection, 'add remove change', () => {
      setCollectionJson(getCollectionAsJson(collection))
    })
  }, [])

  const updateAttribute = (index: number) => (attribute: string) => {
    collection.models[index].set('attribute', attribute)
  }

  const updateDirection = (index: number) => (direction: string) => {
    collection.models[index].set('direction', direction)
  }

  const removeItem = (index: number) => () => {
    collection.models[index].destroy()
  }

  const addSort = () => {
    collection.add({
      attribute: getNextAttribute(collectionJson, sortAttributeOptions),
      direction: 'descending',
    })
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
        <Button fullWidth onClick={addSort}>
          <Grid container direction="row" alignItems="center" wrap="nowrap">
            <Grid item>
              <AddIcon />
            </Grid>
            <Grid item>
              <Box color="primary.main">Sort</Box>
            </Grid>
          </Grid>
        </Button>
      </div>
    </div>
  )
}

export default hot(module)(SortSelections)
