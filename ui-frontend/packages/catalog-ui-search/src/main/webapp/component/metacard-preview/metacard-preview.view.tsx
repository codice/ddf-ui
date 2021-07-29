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

const Marionette = require('marionette')
const template = require('./metacard-preview.hbs')
const CustomElements = require('../../js/CustomElements.js')
const LoadingCompanionView = require('../loading-companion/loading-companion.view.js')
const user = require('../singletons/user-instance.js')
const preferences = user.get('user').get('preferences')
const wreqr = require('../../js/wreqr.js')
import React from 'react'
import { renderToString } from 'react-dom/server'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import fetch from '../../react-component/utils/fetch'

function getSrc(previewHtml: any, textColor: any) {
  const fontSize = preferences.get('fontSize')

  return renderToString(
    <html
      dangerouslySetInnerHTML={{ __html: previewHtml }}
      className="is-iframe is-preview"
      style={{ fontSize, color: textColor, fontFamily: 'sans-serif' }}
    />
  )
}

export default Marionette.ItemView.extend({
  className: 'w-full h-full overflow-auto',

  template,
  tagName: CustomElements.register('metacard-preview'),
  initialize() {
    const result = this.options.result as LazyQueryResult
    LoadingCompanionView.beginLoading(this)
    this.previewRequest = fetch(new URL(result.getPreview()).pathname, {
      dataType: 'html',
    })
      .then((blob) => blob.text())
      .then((previewHtml: any) => {
        this.previewHtml = previewHtml
      })
      .finally(() => {
        LoadingCompanionView.endLoading(this)
      })
  },
  onAttach() {
    this.textColor = window.getComputedStyle(this.el).color
    this.previewRequest.then(() => {
      if (!this.isDestroyed) {
        this.populateIframe()
        this.listenTo(
          user.get('user').get('preferences'),
          'change:fontSize',
          this.populateIframe
        )
        this.listenTo(wreqr.vent, 'resize', this.populateIframeIfNecessary)
      }
    })
  },
  // golden layout destroys and recreates elements in such a way as to empty iframes: https://github.com/deepstreamIO/golden-layout/issues/154
  populateIframeIfNecessary() {
    if (
      this.$el
        .find('iframe')
        .contents()[0]
        .children[0].getAttribute('class') === null
    ) {
      this.populateIframe()
    }
  },
  populateIframe() {
    const $iframe = this.$el.find('iframe')
    $iframe.ready(() => {
      $iframe.contents()[0].open()
      $iframe.contents()[0].write(getSrc(this.previewHtml, this.textColor))
      $iframe.contents()[0].close()
    })
  },
  onDestroy() {},
})
