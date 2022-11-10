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

const Backbone = require('backbone')
const $ = require('jquery')
const wreqr = require('./wreqr.js')
const user = require('../component/singletons/user-instance.js')
const preferences = user.get('user').get('preferences')
let lessStyles = require('./uncompiled-less.unless')
import Common from './Common'

const backboneModel = new Backbone.Model()
import { lessWorkerModel } from './../component/singletons/less.worker-instance'
lessWorkerModel.subscribe((data) => {
  if (data.method === 'render') {
    updateTheme(data.css)
    wreqr.vent.trigger('resize')
    $(window).trigger('resize')
  }
})

function updateTheme(css) {
  const existingUserStyles = $('[data-theme=user]')
  const userStyles = document.createElement('style')
  userStyles.setAttribute('data-theme', 'user')
  userStyles.innerHTML = css
  document.body.appendChild(userStyles)
  existingUserStyles.remove()
}

function handleThemeChange() {
  lessWorkerModel.postMessage({
    method: 'render',
    less: lessStyles,
    theme: preferences.get('theme').getTheme(),
  })
}

function handleFontSizeChange() {
  const fontSize = preferences.get('fontSize')
  $('html').css('fontSize', fontSize + 'px')
  Common.repaintForTimeframe(500, () => {
    wreqr.vent.trigger('resize')
    $(window).trigger('resize')
  })
}

function handleAnimationChange() {
  const animationMode = preferences.get('animation')
  $('html').toggleClass('no-animation', !animationMode)
}

function attemptToStart() {
  if (user.fetched) {
    handleFontSizeChange()
    handleThemeChange()
    handleAnimationChange()
    backboneModel.listenTo(preferences, 'change:fontSize', handleFontSizeChange)
    backboneModel.listenTo(preferences.get('theme'), 'change', () => {
      if (Object.keys(preferences.get('theme').changed).includes('theme')) {
        handleThemeChange()
      }
    })
    backboneModel.listenTo(
      preferences,
      'change:animation',
      handleAnimationChange
    )
  } else {
    user.once('sync', () => {
      attemptToStart()
    })
  }
}

attemptToStart()

if (module.hot) {
  module.hot.accept('./uncompiled-less.unless', () => {
    lessStyles = require('./uncompiled-less.unless')
    handleThemeChange()
  })
}
