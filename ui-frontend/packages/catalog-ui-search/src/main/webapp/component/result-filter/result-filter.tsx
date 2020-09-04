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

import { hot } from 'react-hot-loader'
import * as React from 'react'
import FilterBranch from '../filter-builder/filter-branch'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
const user = require('../singletons/user-instance.js')

const getResultFilter = () => {
  return user
    .get('user')
    .get('preferences')
    .get('resultFilter')
}

const getBaseFilter = () => {
  const filter = getResultFilter()
  if (filter === undefined) {
    return new FilterBuilderClass({
      type: 'AND',
      filters: [
        new FilterClass({
          property: 'anyText',
          value: '',
          type: 'ILIKE',
        }),
      ],
      negated: false,
    })
  } else if (filter.filters === undefined) {
    return new FilterBuilderClass({
      type: 'AND',
      filters: [filter],
      negated: false,
    })
  }
  return new FilterBuilderClass({
    ...filter,
  })
}

const removeFilter = () => {
  user
    .get('user')
    .get('preferences')
    .set('resultFilter', undefined)
  user
    .get('user')
    .get('preferences')
    .savePreferences()
}

const saveFilter = ({ filter }: any) => {
  user
    .get('user')
    .get('preferences')
    .set('resultFilter', filter)
  user
    .get('user')
    .get('preferences')
    .savePreferences()
}

const ResultFilter = ({ closeDropdown }: { closeDropdown: () => void }) => {
  const [filter, setFilter] = React.useState(getBaseFilter())
  return (
    <>
      <div className="min-w-120 max-w-120">
        <FilterBranch root={true} filter={filter} setFilter={setFilter} />
      </div>
      <Grid
        className="w-full pt-2"
        container
        direction="row"
        alignItems="center"
        wrap="nowrap"
      >
        <Grid item className="w-full">
          <Button
            data-id="remove-all-results-filters-button"
            fullWidth
            variant="text"
            color="secondary"
            onClick={() => {
              removeFilter()
              closeDropdown()
            }}
          >
            Remove
          </Button>
        </Grid>
        <Grid item className="w-full">
          <Button
            data-id="save-results-filters-button"
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              saveFilter({ filter })
              closeDropdown()
            }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default hot(module)(ResultFilter)
