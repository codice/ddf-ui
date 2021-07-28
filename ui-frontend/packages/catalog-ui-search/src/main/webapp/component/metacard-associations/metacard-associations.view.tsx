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
import Backbone from 'backbone'
const Marionette = require('marionette')
const $ = require('jquery')
const CustomElements = require('../../js/CustomElements.js')
const LoadingCompanionView = require('../loading-companion/loading-companion.view.js')
import { StateModel } from '../associations-menu/associations-menu.view'
const AssociationCollectionView = require('../association/association.collection.view.js')
const AssociationCollection = require('../association/association.collection.js')
import AssociationGraphView from '../associations-graph/associations-graph.view'
import MetacardAssociationsViewReact from './metacard-associations.react'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'

export default Marionette.LayoutView.extend({
  className: 'w-full h-full overflow-auto',
  lazyResult: undefined,
  setDefaultModel() {
    this.lazyResult = this.options.result
  },
  regions: {
    associationsList: '> .editor-content',
    associationsGraph: '> .content-graph',
  },
  template() {
    return <MetacardAssociationsViewReact view={this} />
  },
  tagName: CustomElements.register('metacard-associations'),
  events: {
    'click > .list-footer .footer-add': 'handleAdd',
    'click > .editor-footer .footer-edit': 'handleEdit',
    'click > .editor-footer .footer-cancel': 'handleCancel',
    'click > .editor-footer .footer-save': 'handleSave',
  },
  _associationCollection: undefined,
  _knownMetacards: undefined,
  initialize(options: any) {
    this.selectionInterface =
      options.selectionInterface || this.selectionInterface
    if (!options.model) {
      this.setDefaultModel()
    }
    this.handleType()
    this.getAssociations()
    this.setupListeners()
  },
  setupListeners() {
    this.listenTo(
      this._associationCollection,
      'reset add remove update change',
      this.handleFooter
    )
  },
  getAssociations() {
    if (this.lazyResult) {
      this.clearAssociations()
      LoadingCompanionView.beginLoading(this)
      $.get('./internal/associations/' + this.lazyResult.plain.id)
        .then((response: any) => {
          if (!this.isDestroyed) {
            this._originalAssociations = JSON.parse(JSON.stringify(response))
            this._associations = response
            this.parseAssociations()
            this.onBeforeShow()
          }
        })
        .always(() => {
          LoadingCompanionView.endLoading(this)
        })
    }
  },
  clearAssociations() {
    if (!this._knownMetacards) {
      this._knownMetacards = new Backbone.Collection()
    }
    if (!this._associationCollection) {
      this._associationCollection = new AssociationCollection()
    }
    this._associationCollection.reset()
  },
  parseAssociations() {
    this.clearAssociations()
    this._associations.forEach((association: any) => {
      this._knownMetacards.add([association.parent, association.child])
      this._associationCollection.add({
        parent: association.parent.id,
        child: association.child.id,
        relationship:
          association.relation === 'metacard.associations.derived'
            ? 'derived'
            : 'related',
      })
    })
  },
  onBeforeShow() {
    this.showAssociationsListView()
    this.showGraphView()
    this.handleFooter()
    this.setupMenuListeners()
    this.handleFilter()
    this.handleDisplay()
  },
  showGraphView() {
    this.associationsGraph.show(
      new AssociationGraphView({
        collection: this._associationCollection,
        knownMetacards: this._knownMetacards,
        lazyResults: this.selectionInterface
          .get('currentQuery')
          .get('result')
          .get('lazyResults'),
        currentLazyResult: this.lazyResult,
      })
    )
  },
  showAssociationsListView() {
    this.associationsList.show(
      new AssociationCollectionView({
        collection: this._associationCollection,
        lazyResults: this.selectionInterface
          .get('currentQuery')
          .get('result')
          .get('lazyResults'),
        knownMetacards: this._knownMetacards,
        currentLazyResult: this.lazyResult,
      })
    )
    this.associationsList.currentView.turnOffEditing()
  },
  setupMenuListeners() {
    this.listenTo(StateModel, 'change:filter', this.handleFilter)
    this.listenTo(StateModel, 'change:display', this.handleDisplay)
  },
  handleFilter() {
    const filter = StateModel.get('filter')
    this.$el.toggleClass('filter-by-parent', filter === 'parent')
    this.$el.toggleClass('filter-by-child', filter === 'child')
    this.associationsGraph.currentView.handleFilter(filter)
  },
  handleDisplay() {
    const display = StateModel.get('display')
    this.$el.toggleClass('show-list', display === 'list')
    this.$el.toggleClass('show-graph', display === 'graph')
    this.associationsGraph.currentView.fitGraph()
  },
  handleEdit() {
    this.turnOnEditing()
  },
  handleCancel() {
    this._associations = JSON.parse(JSON.stringify(this._originalAssociations))
    this.parseAssociations()
    this.onBeforeShow()
    this.turnOffEditing()
  },
  turnOnEditing() {
    this.$el.toggleClass('is-editing', true)
    this.associationsList.currentView.turnOnEditing()
    this.associationsGraph.currentView.turnOnEditing()
  },
  turnOffEditing() {
    this.$el.toggleClass('is-editing', false)
    this.associationsList.currentView.turnOffEditing()
    this.associationsGraph.currentView.turnOffEditing()
  },
  handleSave() {
    if (this.lazyResult) {
      LoadingCompanionView.beginLoading(this)
      const data = this._associationCollection.toJSON()
      data.forEach((association: any) => {
        association.parent = {
          id: association.parent,
        }
        association.child = {
          id: association.child,
        }
        association.relation =
          association.relationship === 'related'
            ? 'metacard.associations.related'
            : 'metacard.associations.derived'
      })
      $.ajax({
        url: './internal/associations/' + this.lazyResult.plain.id,
        data: JSON.stringify(data),
        method: 'PUT',
        contentType: 'application/json',
      }).always(() => {
        setTimeout(() => {
          if (!this.isDestroyed) {
            this.getAssociations()
            this.turnOffEditing()
          }
        }, 1000)
      })
    }
  },
  handleFooter() {
    this.$el
      .find('> .list-footer .footer-text')
      .html(this._associationCollection.length + ' association(s)')
  },
  handleAdd() {
    if (this.lazyResult) {
      this.associationsList.currentView.collection.add({
        parent: this.lazyResult.plain.id,
        child: this.lazyResult.plain.id,
      })
    }
  },
  handleType() {
    if (this.lazyResult) {
      this.$el.toggleClass('is-resource', this.lazyResult.isResource())
      this.$el.toggleClass('is-revision', this.lazyResult.isRevision())
      this.$el.toggleClass('is-deleted', this.lazyResult.isDeleted())
      this.$el.toggleClass('is-remote', this.lazyResult.isRemote())
    }
  },
} as {
  lazyResult: LazyQueryResult | undefined
  [key: string]: any
})
