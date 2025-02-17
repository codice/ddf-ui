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
// @ts-nocheck FIXME: Property 'collection' does not exist on type 'Intr

import SortSelections from '../query-sort-selection/sort-selections'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

type Props = {
  removeSort: () => void
  saveSort: () => void
  hasSort: Boolean
  collection: Backbone.Collection<Backbone.Model>
}

const render = ({ removeSort, saveSort, hasSort, collection }: Props) => {
  return (
    <div className="min-w-120">
      <SortSelections collection={collection} />
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        {hasSort ? (
          <Grid item className="w-full">
            <Button
              fullWidth
              onClick={removeSort}
              variant="text"
              color="secondary"
            >
              Remove Sort
            </Button>
          </Grid>
        ) : null}
        <Grid item className="w-full">
          <Button
            fullWidth
            onClick={saveSort}
            variant="contained"
            color="primary"
          >
            Save Sort
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

export default render
