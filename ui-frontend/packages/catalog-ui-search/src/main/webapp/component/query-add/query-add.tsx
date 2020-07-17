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
const Query = require('../../js/model/Query.js')
const user = require('../singletons/user-instance.js')
import Grid from '@material-ui/core/Grid'
const QueryBasic = require('../../component/query-basic/query-basic.view.js')

import QueryAdvanced from '../../component/query-advanced/query-advanced'
const CQLUtils = require('catalog-ui-search/src/main/webapp/js/CQLUtils.js')
import MRC from '../../react-component/marionette-region-container'
export const queryForms = [
  { id: 'basic', title: 'Basic Search', view: QueryBasic },
  {
    id: 'advanced',
    title: 'Advanced Search',
    view: QueryAdvanced,
  },
]

export default Marionette.LayoutView.extend({
  template() {
    const formType = this.model.get('type')
    const form = queryForms.find(form => form.id === formType) as {
      id: string
      title: string
      view: any
    }
    return (
      <React.Fragment>
        <form
          target="autocomplete"
          action="/search/catalog/blank.html"
          className="w-full h-full"
        >
          <Grid
            container
            direction="column"
            className="w-full h-full"
            wrap="nowrap"
          >
            <Grid item className="w-full h-full">
              {(() => {
                if (form.id === 'basic') {
                  return (
                    <MRC
                      view={
                        new QueryBasic({
                          model: this.model,
                        })
                      }
                    />
                  )
                } else {
                  return <QueryAdvanced model={this.model} />
                }
              })()}
            </Grid>
          </Grid>
        </form>
      </React.Fragment>
    )
  },
  className: 'global-query-add-view h-full w-full overflow-auto',
  tagName: 'div',
  regions: {
    queryContent: 'form .content-form',
  },
  initialize() {
    this.listenTo(this.model, 'resetToDefaults change:type', this.render)
  },
  save() {
    this.queryView
      ? this.queryView.save()
      : this.queryContent.currentView.save()
    this.queryTitle.currentView.save()
    this.cancel()
  },
  saveRun() {
    this._updateModel()
    this.options.selectionInterface.setCurrentQuery(this.model)
    this.model.startSearchFromFirstPage()
  },
  _updateModel() {
    const queryContentView = this.queryView
      ? this.queryView
      : this.queryContent.currentView
    queryContentView.save()
    this.queryTitle.currentView.save()

    if (this.model.get('type') === 'text') {
      this.model.set(
        'filterTree',
        CQLUtils.transformCQLToFilter(this.model.get('cql'))
      )
      if (!this.options.isSaved) {
        this.model.set('title', this.model.get('filterTree').value)
      }
    } else if (!this.options.isSaved && this.model.get('type') !== 'text') {
      this.model.set('title', this.model.get('filterTree').filters[0].value)
    }

    queryContentView.save()
  },
})
