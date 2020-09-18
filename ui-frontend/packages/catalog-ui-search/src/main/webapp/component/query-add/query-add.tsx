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
// @ts-ignore ts-migrate(6133) FIXME: 'Query' is declared but its value is never read.
const Query = require('../../js/model/Query.js')
// @ts-ignore ts-migrate(6133) FIXME: 'user' is declared but its value is never read.
const user = require('../singletons/user-instance.js')
// @ts-ignore ts-migrate(6133) FIXME: 'Grid' is declared but its value is never read.
import Grid from '@material-ui/core/Grid'
import QueryBasic from '../../component/query-basic/query-basic.view'

import QueryAdvanced from '../../component/query-advanced/query-advanced'
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
    const form =
      (queryForms.find(form => form.id === formType) as {
        id: string
        title: string
        view: any
      }) || queryForms[0]
    return (
      <React.Fragment>
        <form
          target="autocomplete"
          action="/search/catalog/blank.html"
          className="w-full"
        >
          {(() => {
            if (form.id === 'basic') {
              return <QueryBasic model={this.model} />
            } else {
              return <QueryAdvanced model={this.model} />
            }
          })()}
        </form>
      </React.Fragment>
    )
  },
  className: 'w-full',
  tagName: 'div',
  regions: {
    queryContent: 'form .content-form',
  },
  onFirstRender() {
    this.listenTo(this.model, 'resetToDefaults change:type', this.render)
  },
})
