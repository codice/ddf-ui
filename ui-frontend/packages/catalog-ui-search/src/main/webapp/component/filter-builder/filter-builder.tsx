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
const Marionette = require('marionette')
const CustomElements = require('../../js/CustomElements.js')
const FilterView = require('../filter/filter.view.js')
const DropdownView = require('../dropdown/dropdown.view.js')
const CQLUtils = require('../../js/CQLUtils.js')
const cql = require('../../js/cql.js')
import Button from '@material-ui/core/Button'
import MRC from '../../react-component/marionette-region-container'
// @ts-ignore
import { serialize, deserialize } from './filter-serialization'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'
import Box from '@material-ui/core/Box'
import FilterLeaf from './filter-leaf'
import FilterBranch from './filter-branch'

import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import { FilterBuilderClass, FilterClass } from './filter.structure'

const FilterCollection = ({
  collection,
  view,
}: {
  collection: any
  view: any
}) => {
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())
  React.useEffect(() => {
    listenTo(collection, 'add remove reset', () => {
      setForceRender(Math.random())
    })
  }, [])

  return (
    <>
      {collection.map((item: any, index: number) => {
        return (
          <React.Fragment key={item.cid}>
            {index > 0 ? (
              <Grid
                container
                direction="row"
                alignItems="center"
                justify="center"
                wrap="nowrap"
              >
                <Grid item className="p-4">
                  <OperatorComponent model={view.model} />
                </Grid>
              </Grid>
            ) : null}
            {item.type === 'filter' ? (
              <FilterLeaf view={view} item={item} />
            ) : (
              <FilterBranch view={view} item={item} />
            )}
            {item.type === 'filter' ? (
              <Grid item className="w-full filter-actions">
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  className="w-full"
                >
                  {index === collection.length - 1 ? (
                    <AddGroup view={view} />
                  ) : null}
                  <Grid item className="ml-auto">
                    <Button
                      onClick={() => {
                        item.destroy()
                      }}
                    >
                      <Box color="primary.main">Remove</Box>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            ) : null}
          </React.Fragment>
        )
      })}
      {collection.length >= 1 && collection.last().type === 'filter' ? (
        <></>
      ) : (
        <>
          <Grid
            container
            direction="row"
            alignItems="center"
            className="w-full pt-2"
          >
            <AddGroup view={view} />
          </Grid>
        </>
      )}
    </>
  )
}

const OperatorComponent = ({ model }: { model: any }) => {
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())

  React.useEffect(() => {
    listenTo(model, 'change', () => {
      setForceRender(Math.random())
    })
  }, [])
  return (
    <TextField
      value={model.get('operator') || 'AND'}
      onChange={e => {
        model.set('operator', e.target.value)
      }}
      select
      variant="outlined"
    >
      {OperatorData.map(operatorInfo => {
        return (
          <MenuItem key={operatorInfo.value} value={operatorInfo.value}>
            {operatorInfo.label}
          </MenuItem>
        )
      })}
    </TextField>
  )
}

const OperatorData = [
  {
    label: 'AND',
    value: 'AND',
  },
  {
    label: 'OR',
    value: 'OR',
  },
  {
    label: 'NOT AND',
    value: 'NOT AND',
  },
  {
    label: 'NOT OR',
    value: 'NOT OR',
  },
]

const AddGroup = ({ view }: { view: any }) => {
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())

  React.useEffect(() => {
    listenTo(view.collection, 'add remove', () => {
      setForceRender(Math.random())
    })
  }, [])

  return (
    <>
      <Grid item>
        <Button
          onClick={() => {
            view.collection.push({
              isResultFilter: view.isResultFilter,
            })
          }}
        >
          <AddIcon /> <Box color="primary.main">Field</Box>
        </Button>
      </Grid>
      <Grid item>
        <Button
          onClick={() => {
            view.collection.push({
              filterBuilder: true,
              isResultFilter: view.isResultFilter,
            })
          }}
        >
          <AddIcon /> <Box color="primary.main">Group</Box>
        </Button>
      </Grid>
    </>
  )
}

const ReactPortion = ({ view }: { view: any }) => {
  const { filter, isResultFilter = false } = view.options

  if (view.model === undefined) {
    console.log('when does this happen')
    view.model = deserialize(filter, isResultFilter)
  }
  view.isResultFilter = isResultFilter
  view.collection = view.model.get('filters')
  view.filterView = FilterView
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())

  React.useEffect(() => {
    listenTo(view.collection, 'add remove reset', () => {
      if (view.collection.length === 0) {
        view.model.destroy()
      } else {
        setForceRender(Math.random())
      }
    })
  }, [])
  console.log(view.model.cid)
  return (
    <React.Fragment>
      <div className="filter-contents w-full pb-4">
        <FilterCollection collection={view.collection} view={view} />
      </div>
      <div>
        <Button
          onClick={() => {
            console.log(view.transformToCql())
          }}
        >
          CQL
        </Button>
        <Button
          onClick={() => {
            console.log(view.getFilters())
          }}
        >
          CQL Filter Tree
        </Button>
        <Button
          onClick={() => {
            console.log(view.model.toJSON())
          }}
        >
          Model
        </Button>
      </div>
    </React.Fragment>
  )
}

export default Marionette.LayoutView.extend({
  template() {
    return (
      <div className="pt-3">
        <ReactPortion view={this} />
      </div>
    )
  },
  printValue() {
    console.log(this.getFilters())
  },
  transformToCql() {
    this.deleteInvalidFilters()
    const filter = this.getFilters()
    if (filter.filters.length === 0) {
      return `(${cql.ANYTEXT_WILDCARD})`
    } else {
      return CQLUtils.transformFilterToCQL(filter)
    }
  },
  getFilters() {
    return serialize(this.model)
  },
  deleteInvalidFilters() {
    const collection = this.collection.filter(
      model => model.get('isValid') !== false
    )

    this.collection.reset(collection, { silent: true })

    if (collection.length === 0) {
      this.delete()
    }
  },
  serializeData() {
    return {
      cql: 'anyText ILIKE ""',
    }
  },
})

type Props = {
  model: any
}

const getBaseFilter = ({ model }: { model: any }): FilterBuilderClass => {
  const filter = model.get('filterTree')
  if (filter.filters === undefined) {
    return new FilterBuilderClass({
      operator: 'AND',
      filters: [filter],
      negated: false,
    })
  }
  return new FilterBuilderClass({
    ...filter,
  })
}

export const FilterBuilderRoot = ({ model }: Props) => {
  const [filter, setFilter] = React.useState(getBaseFilter({ model }))

  return (
    <FilterBranch
      filter={filter}
      setFilter={update => {
        setFilter(update)
      }}
    />
  )
}
