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
const _ = require('underscore')
const CustomElements = require('../../js/CustomElements.js')
const PropertyCollectionView = require('../property/property.collection.view.js')
const properties = require('../../js/properties.js')

const IngestEditor = Marionette.LayoutView.extend({
  template() {
    const handleClear = () => {
      this.editorProperties.currentView.revert()
      this.editorProperties.currentView.hideRequiredWarnings()
    }

    return (
      <React.Fragment>
        <div className="is-header">Attribute Editor</div>

        <div className="ingest-editor-properties"></div>

        <div className="ingest-editor-footer">
          <button
            className="old-button ingest-editor-clear is-primary"
            onClick={handleClear}
          >
            <span className="fa fa-undo"></span>
            <span>Reset Attributes</span>
          </button>
        </div>
      </React.Fragment>
    )
  },
  tagName: CustomElements.register('ingest-editor-override'),
  regions: {
    editorProperties: '.ingest-editor-properties',
  },
  onBeforeShow() {
    const PropertyCollection = PropertyCollectionView.generateFilteredPropertyCollectionView(
      properties.editorAttributes,
      [],
      {
        showValidationIssues: false,
      }
    )
    this.editorProperties.show(PropertyCollection)
    this.editorProperties.currentView.$el.addClass('is-list')
    this.editorProperties.currentView.turnOnEditing()
  },
  getPropertyCollectionView() {
    return this.editorProperties.currentView
  },
  /*
         Return a map of attributes to their corresponding value arrays. Blank values are
         filtered, and only attributes with at least one non-blank value are returned.
      */
  getAttributeOverrides() {
    return _.chain(
      this.editorProperties.currentView.toPropertyJSON().properties
    )
      .mapObject((values) =>
        values.filter((value: string) => value.trim().length > 0)
      )
      .pick((values) => values.length > 0)
      .value()
  },
})

module.exports = IngestEditor
