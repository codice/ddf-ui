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

export const waitForReady: () => Promise<void> = async () => {
  properties.init()
  if (
    user.fetched &&
    SourcesInstance.fetched &&
    MetacardDefinitions.typesFetched() &&
    properties.fetched
  ) {
    return
  } else {
    await new Promise((resolve) => setTimeout(resolve, 60))
    return waitForReady()
  }
}

export const attemptToStart = async () => {
  await waitForReady()
  import('../component/app/base-app').then((BaseApp) => {
    ReactDOM.render(<BaseApp.default />, document.querySelector('#router'))
  })
}
