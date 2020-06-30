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
import { start } from 'imperio'

const $ = require('jquery')
import App from '../component/app/app'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
const properties = require('./properties.js')
const user = require('../component/singletons/user-instance.js')
require('./MediaQueries.js')
require('./Theming.js')
require('./SystemUsage.js')
require('../component/singletons/session-auto-renew.js')
require('./SessionTimeout.js')

function attemptToStart() {
  if (user.fetched) {
    document.querySelector('#loading').classList.remove('is-open')
    ReactDOM.render(<App />, document.querySelector('#router'))
    start()
  } else if (!user.fetched) {
    user.once('sync', () => {
      attemptToStart()
    })
  }
}

//$(window).trigger('resize');
$(window.document).ready(() => {
  window.document.title = properties.branding + ' ' + properties.product
})
attemptToStart()
