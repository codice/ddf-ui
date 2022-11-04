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
const Marionette = require('marionette')
const CustomElements = require('../../js/CustomElements.js')
import { UploadBatchItemViewReact } from '../upload-batch-item/upload-batch-item.view'
const userNotifications = require('../singletons/user-notifications.js')
const user = require('../singletons/user-instance.js')

const $ = require('jquery')
const Common = require('../../js/Common.js')

function isEmpty(filter: any) {
  return userNotifications.filter(filter).length === 0
}

export default Marionette.LayoutView.extend({
  template: function () {
    return (
      <React.Fragment>
        <div className="group-header">
          <span className="header-when">{this.options.date}</span>
          <button className="old-button is-neutral header-clear">
            <span className="fa fa-times"></span>
          </button>
          <button className="old-button is-negative header-confirm">
            <span>Clear {this.options.date}</span>
          </button>
        </div>
        <div className="group-items">
          {userNotifications
            .filter(this.options.filter)
            .map((notification: any) => {
              return <UploadBatchItemViewReact model={notification} />
            })}
        </div>
      </React.Fragment>
    )
  },
  tagName: CustomElements.register('notification-group'),
  regions: {
    groupItems: '> .group-items',
  },
  events: {
    'click > .group-header .header-clear': 'handleClear',
    'click > .group-header .header-confirm': 'handleConfirm',
  },
  initialize() {
    this.handleEmpty()
    this.listenTo(userNotifications, 'add remove update', this.handleEmpty)
  },
  handleEmpty() {
    const empty = isEmpty(this.options.filter)
    if (empty) {
      this.$el.css('height', this.$el.height())
    } else {
      this.$el.css('height', '')
    }
    Common.executeAfterRepaint(() => {
      this.$el.toggleClass('is-empty', empty)
    })
  },
  handleClear(e: any) {
    this.$el.toggleClass('wait-for-confirmation', true)
    setTimeout(() => {
      this.listenForClick()
    }, 0)
  },
  listenForClick() {
    $(window).on('click.notification-group', (e: any) => {
      this.$el.toggleClass('wait-for-confirmation', false)
      this.unlistenForClick()
    })
  },
  unlistenForClick() {
    $(window).off('click.notification-group')
  },
  handleConfirm() {
    userNotifications.filter(this.options.filter).forEach((model: any) => {
      model.collection.remove(model)
    })
    user.get('user').get('preferences').savePreferences()
  },
  serializeData() {
    return {
      date: this.options.date,
    }
  },
  onDestroy() {
    this.unlistenForClick()
  },
})
