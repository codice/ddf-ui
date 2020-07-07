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

import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'

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
          <>
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
            {/* {item.type !== 'filter' ? (
          <Grid item className="w-full filter-actions">
            <Button
              onClick={() => {
                if (collection && collection.length === 1) {
                  view.model.destroy()
                } else {
                  item.destroy()
                }
              }}
              className="ml-auto block"
            >
              <Box color="primary.main">Remove</Box>
            </Button>
          </Grid>
        ) : null} */}
            {item.type === 'filter' ? (
              <MRC
                key={item.cid}
                view={
                  item.type === 'filter' ? view.filterView : view.constructor
                }
                viewOptions={{
                  isChild: true,
                  destroyGroup: () => {
                    view.model.destroy()
                  },
                  model: item,
                  editing: true,
                  suggester: view.options.suggester,
                  includedAttributes: view.options.includedAttributes,
                  supportedAttributes: view.options.supportedAttributes,
                }}
              />
            ) : (
              <Paper elevation={10} className="p-2 ">
                <MRC
                  key={item.cid}
                  view={
                    item.type === 'filter' ? view.filterView : view.constructor
                  }
                  viewOptions={{
                    isChild: true,
                    destroyGroup: () => {
                      view.model.destroy()
                    },
                    model: item,
                    editing: true,
                    suggester: view.options.suggester,
                    includedAttributes: view.options.includedAttributes,
                    supportedAttributes: view.options.supportedAttributes,
                  }}
                />
              </Paper>
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
                        if (collection && collection.length === 1) {
                          view.model.destroy()
                        } else {
                          item.destroy()
                        }
                      }}
                    >
                      <Box color="primary.main">Remove</Box>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            ) : null}
          </>
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
  const { listenTo } = useBackbone()
  const [forceRender, setForceRender] = React.useState(Math.random())

  React.useEffect(() => {
    listenTo(view.collection, 'add remove reset', () => {
      setForceRender(Math.random())
    })
  }, [])
  console.log(view.model.cid)
  return (
    <React.Fragment>
      <div className="filter-contents w-full pb-4">
        <FilterCollection collection={view.collection} view={view} />

        <Grid container direction="row" alignItems="center" className="w-full">
          {/* <Grid item>
        <Button
          variant="text"
          color="inherit"
          onClick={() => {
            this.collection.push({
              isResultFilter: this.isResultFilter,
            })
          }}
        >
          <AddIcon /> <Box color="primary.main">Field</Box>
        </Button>
      </Grid> */}
          {/* <AddGroup view={view} /> */}
          {/* <Grid item className="ml-auto">
        <Button
          onClick={() => {
            this.model.destroy()
          }}
        >
          <Box color="primary.main">Remove</Box>
        </Button>
      </Grid> */}
        </Grid>
      </div>
    </React.Fragment>
  )
}

export default Marionette.LayoutView.extend({
  template() {
    return <ReactPortion view={this} />
  },
  tagName: CustomElements.register('filter-builder'),
  initialize() {
    const { filter, isResultFilter = false } = this.options
    if (this.model === undefined) {
      this.model = deserialize(filter, isResultFilter)
    }
    this.isResultFilter = isResultFilter
    this.collection = this.model.get('filters')
  },
  filterView: FilterView,
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
