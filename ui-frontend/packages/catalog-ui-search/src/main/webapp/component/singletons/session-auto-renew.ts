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

//meant to be used for just in time feature detection

import Backbone from 'backbone'
import fetch from '../../react-component/utils/fetch'

const sessionExpiryUrl = './internal/session/expiry'

const sessionAutoRenewModel = new (Backbone.Model.extend({
  defaults: {
    sessionRenewDate: undefined,
  },
  initialize() {
    this.initializeSessionRenewDate()
    this.listenTo(this, 'change:sessionRenewDate', this.handleSessionRenewDate)
  },
  initializeSessionRenewDate() {
    fetch(sessionExpiryUrl)
      .then((response) => response.json())
      .then(this.handleExpiryTimeResponse.bind(this))
      .catch(() => {
        console.warn('what do we do on failure')
      })
  },
  handleExpiryTimeResponse(response: any) {
    const msUntilTimeout = parseInt(response)
    const msUntilAutoRenew = Math.max(
      msUntilTimeout * 0.7,
      msUntilTimeout - 60000
    ) // 70% or at least one minute before
    this.set('sessionRenewDate', Date.now() + msUntilAutoRenew)
  },
  handleSessionRenewDate() {
    this.clearSessionRenewTimer()
    this.setSessionRenewTimer()
  },
  setSessionRenewTimer() {
    this.sessionRenewTimer = setTimeout(
      this.renewSession.bind(this),
      this.get('sessionRenewDate') - Date.now()
    )
  },
  clearSessionRenewTimer() {
    clearTimeout(this.sessionRenewTimer)
  },
  renewSession() {
    fetch(sessionExpiryUrl)
      .then((response) => response.json())
      .then(this.handleExpiryTimeResponse.bind(this))
      .catch(() => {
        console.warn('what do we do on a failure')
      })
  },
}))()

export default sessionAutoRenewModel
