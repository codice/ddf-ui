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
const Tabs = require('../tabs')
const MetacardAssociationsView = require('../../metacard-associations/metacard-associations.view.js')
const MetacardPreviewView = require('../../metacard-preview/metacard-preview.view.js')
import React from 'react'
import MetacardOverwrite from '../../metacard-overwrite/metacard-overwrite.view.js'
import MetacardArchive from '../../../react-component/metacard-archive'
import MetacardActions from '../../../react-component/metacard-actions'
import MetacardQuality from '../../../react-component/metacard-quality'
import MetacardHistory from '../../../react-component/metacard-history'
import Summary from './summary'

const LightWeightSummaryView = Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-hidden',
  template() {
    return <Summary selectionInterface={this.options.selectionInterface} />
  },
})

const MetacardOverwriteView = Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-auto',
  template() {
    return (
      <MetacardOverwrite selectionInterface={this.options.selectionInterface} />
    )
  },
})

const MetacardArchiveView = Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-auto',
  template() {
    return (
      <MetacardArchive selectionInterface={this.options.selectionInterface} />
    )
  },
})

const MetacardActionsView = Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-auto',
  template() {
    return (
      <MetacardActions selectionInterface={this.options.selectionInterface} />
    )
  },
})

const MetacardQualityView = Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-auto',
  template() {
    return (
      <MetacardQuality selectionInterface={this.options.selectionInterface} />
    )
  },
})

const MetacardHistoryView = Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-auto',
  template() {
    return (
      <MetacardHistory selectionInterface={this.options.selectionInterface} />
    )
  },
})

module.exports = Tabs.extend({
  defaults: {
    tabs: {
      Details: LightWeightSummaryView,
      Preview: MetacardPreviewView,
      History: MetacardHistoryView,
      Associations: MetacardAssociationsView,
      Quality: MetacardQualityView,
      Actions: MetacardActionsView,
      Archive: MetacardArchiveView,
      Overwrite: MetacardOverwriteView,
    },
  },
})
