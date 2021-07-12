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

const _ = require('underscore')
const TabsView = require('../tabs.view')
const properties = require('../../../js/properties.js')
const user = require('../../singletons/user-instance')

module.exports = TabsView.extend({
  className: 'is-metacard',
  initialize(options) {
    this.selectionInterface = options.selectionInterface
    if (options.model === undefined) {
      this.setDefaultModel()
    }
    this.determineDisabledContent()
    this.determineAvailableContent()
    TabsView.prototype.initialize.call(this)
  },
  onFirstRender() {
    const debounceDetermineContent = _.debounce(this.handleMetacardChange, 200)
    const throttleDetermineContent = _.throttle(this.handleMetacardChange, 200)
    this.listenTo(
      this.selectionInterface.getSelectedResults(),
      'update',
      debounceDetermineContent
    )
    this.listenTo(
      this.selectionInterface.getSelectedResults(),
      'add',
      debounceDetermineContent
    )
    this.listenTo(
      this.selectionInterface.getSelectedResults(),
      'remove',
      debounceDetermineContent
    )
    this.listenTo(
      this.selectionInterface.getSelectedResults(),
      'reset',
      debounceDetermineContent
    )
    this.listenTo(
      this.selectionInterface.getSelectedResults(),
      'refreshdata',
      throttleDetermineContent
    )
  },
  handleMetacardChange() {
    this.determineAvailableContent()
    this.determineContent()
  },
  determineContentFromType() {
    if (this.isDestroyed) {
      return
    }
    const activeTabName = this.model.get('activeTab')
    const result = this.selectionInterface.getSelectedResults().first()
    if (
      result.isRevision() &&
      ['History', 'Actions', 'Overwrite', 'Archive'].indexOf(activeTabName) >= 0
    ) {
      this.model.set('activeTab', 'Details')
    } else if (
      result.isDeleted() &&
      ['History', 'Actions', 'Overwrite'].indexOf(activeTabName) >= 0
    ) {
      this.model.set('activeTab', 'Details')
    }
    if (
      result.isRemote() &&
      ['History', 'Associations', 'Quality', 'Archive', 'Overwrite'].indexOf(
        activeTabName
      ) >= 0
    ) {
      this.model.set('activeTab', 'Details')
    }
    if (
      !user.canWrite(result) &&
      ['Archive', 'Overwrite'].indexOf(activeTabName) >= 0
    ) {
      this.model.set('activeTab', 'Details')
    }
    if (!result.hasPreview() && ['Preview'].indexOf(activeTabName) >= 0) {
      this.model.set('activeTab', 'Details')
    }
    const activeTab = this.model.getActiveView()
    if (activeTab) {
      this.tabsContent.show(
        new activeTab({
          selectionInterface: this.selectionInterface,
        })
      )
    }
    this._clickHandler()
  },
  determineContent() {
    if (this.selectionInterface.getSelectedResults().length === 1) {
      setTimeout(() => this.determineContentFromType(), 0)
    }
  },
  determineAvailableContent() {
    if (this.selectionInterface.getSelectedResults().length === 1) {
      const result = this.selectionInterface.getSelectedResults().first()
      this.$el.toggleClass('is-resource', result.isResource())
      this.$el.toggleClass('is-revision', result.isRevision())
      this.$el.toggleClass('is-deleted', result.isDeleted())
      this.$el.toggleClass('is-remote', result.isRemote())
      this.$el.toggleClass('lacks-preview', !result.hasPreview())
    }
  },
  determineDisabledContent() {
    this.$el.toggleClass(
      'is-preview-disabled',
      !properties.isMetacardPreviewEnabled()
    )
    this.$el.toggleClass(
      'is-editing-disabled',
      !user.canWrite(this.selectionInterface.getSelectedResults().first())
    )
  },
})
