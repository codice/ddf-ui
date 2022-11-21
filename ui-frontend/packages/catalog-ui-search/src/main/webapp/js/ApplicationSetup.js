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
import React from 'react'
require('focus-visible')
require('../styles/tailwind.css')
require('../styles/libraries.less')
require('../styles/styles.less')

const $ = require('jquery')
$.ajaxSetup({
  cache: false,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
})

if (process.env.NODE_ENV !== 'production') {
  $('html').addClass('is-development')
  if (module.hot) {
    require('react-hot-loader')
    $('html').addClass('is-hot-reloading')
  }
}

window.CESIUM_BASE_URL = './cesium/assets'

const Backbone = require('backbone')
const properties = require('./properties.js')
require('./extensions/application.patches')

//in here we drop in any top level patches, etc.
const toJSON = Backbone.Model.prototype.toJSON
Backbone.Model.prototype.toJSON = function (options) {
  const originalJSON = toJSON.call(this, options)
  if (options && options.additionalProperties !== undefined) {
    const backboneModel = this
    options.additionalProperties.forEach((property) => {
      originalJSON[property] = backboneModel[property]
    })
  }
  return originalJSON
}
const clone = Backbone.Model.prototype.clone
Backbone.Model.prototype.clone = function () {
  const cloneRef = clone.call(this)
  cloneRef._cloneOf = this.id || this.cid
  return cloneRef
}
const associationsClone = Backbone.AssociatedModel.prototype.clone
Backbone.AssociatedModel.prototype.clone = function () {
  const cloneRef = associationsClone.call(this)
  cloneRef._cloneOf = this.id || this.cid
  return cloneRef
}
const associationsSet = Backbone.AssociatedModel.prototype.set
Backbone.AssociatedModel.prototype.set = function (key, value, options) {
  if (typeof key === 'object') {
    options = value
  }
  if (options && options.withoutSet === true) {
    return this
  }
  return associationsSet.apply(this, arguments)
}

require('@connexta/icons/icons/codice.font')
require('./MediaQueries.js')
require('../component/singletons/session-auto-renew.js')

$(window.document).ready(() => {
  window.document.title = properties.customBranding + ' ' + properties.product
  window.document.querySelector('.welcome-branding').textContent =
    properties.customBranding
  window.document.querySelector('.welcome-branding-name').textContent =
    properties.product
  window.document.querySelector('#loading').classList.add('show-welcome')
})
