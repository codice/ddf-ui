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
import * as ReactDOM from 'react-dom'
import user from '../component/singletons/user-instance'
import SourcesInstance from '../component/singletons/sources-instance'
import MetacardDefinitions from '../component/tabs/metacard/metacardDefinitions'
import properties from '../js/properties'

export const attemptToStart = () => {
  if (
    user.fetched &&
    SourcesInstance.fetched &&
    MetacardDefinitions.typesFetched() &&
    properties.fetched
  ) {
    import('../component/app/base-app').then((BaseApp) => {
      ReactDOM.render(<BaseApp.default />, document.querySelector('#router'))
    })
  } else if (!user.fetched) {
    user.once('sync', () => {
      attemptToStart()
    })
  } else if (!SourcesInstance.fetched) {
    SourcesInstance.once('sync', () => {
      attemptToStart()
    })
  } else if (!MetacardDefinitions.typesFetched() || !properties.fetched) {
    setTimeout(() => {
      attemptToStart() // we don't have a sync event to listen to, so this will do
    }, 250)
  }
}
