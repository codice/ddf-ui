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
import _ from 'underscore'
import MetacardActionsPresentation from './presentation'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import user from '../../component/singletons/user-instance'

type Props = {
  result: LazyQueryResult
}

const MetacardActions = (props: Props) => {
  const model = props.result
  const columnOrder = user
    .get('user')
    .get('preferences')
    .get('inspector-summaryShown')
  const exportActions = _.sortBy(
    model.getExportActions().map((action) => ({
      url: action.url + `&columnOrder=${columnOrder}`,
      title: action.displayName,
    })),
    (action: any) => action.title.toLowerCase()
  )
  const otherActions = _.sortBy(
    model.getOtherActions().map((action) => ({
      url: action.url,
      title: action.title,
    })),
    (action: any) => action.title.toLowerCase()
  )

  return (
    <MetacardActionsPresentation
      model={model}
      exportActions={exportActions}
      otherActions={otherActions}
    />
  )
}

export default hot(module)(MetacardActions)
