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
import QueryBasic from '../../component/query-basic/query-basic.view'

import QueryAdvanced from '../../component/query-advanced/query-advanced'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
export const queryForms = [
  { id: 'basic', title: 'Basic Search', view: QueryBasic },
  {
    id: 'advanced',
    title: 'Advanced Search',
    view: QueryAdvanced,
  },
]

type QueryAddReactType = {
  model: any
}

export const QueryAddReact = ({ model }: QueryAddReactType) => {
  const [, setForceRender] = React.useState(Math.random())
  useListenTo(model, 'resetToDefaults change:type', () => {
    setForceRender(Math.random())
  })
  const formType = model.get('type')
  const form =
    (queryForms.find((form) => form.id === formType) as {
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
            return <QueryBasic model={model} key={model.id} />
          } else {
            return <QueryAdvanced model={model} key={model.id} />
          }
        })()}
      </form>
    </React.Fragment>
  )
}
