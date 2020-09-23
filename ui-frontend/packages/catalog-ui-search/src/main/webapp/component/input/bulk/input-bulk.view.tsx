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
const InputView = require('../input.view')
const MultivalueView = require('../../multivalue/multivalue.view.js')
const DropdownView = require('../../dropdown/dropdown.view.js')
const Common = require('../../../js/Common.js')
const moment = require('moment')
const user = require('../../singletons/user-instance.js')
import * as React from 'react'

function sortNoValueToTop(a: any, b: any) {
  if (a.value === 'bulkDefault') {
    return -1
  }
  if (b.value === 'bulkDefault') {
    return 1
  }
  if (a.value === 'bulkCustom') {
    return -1
  }
  if (b.value === 'bulkCustom') {
    return 1
  }
  if (a.hasNoValue === true && b.hasNoValue === false) {
    return -1
  }
  if (b.hasNoValue === true && a.hasNoValue === false) {
    return 1
  }
  return 0
}

module.exports = InputView.extend({
  className: 'is-bulk',
  template(data: any) {
    return (
      <React.Fragment>
        <div className="if-editing">
          <div className="enum-region" />
        </div>
        <div className="if-viewing">
          <label
            className="value-list-header"
            data-help="This indicates there are multiple values for this attribute among the results."
          >
            (Multiple Values)
          </label>
          <div
            className={`value-list is-list ${
              data.isThumbnail ? 'is-thumbnail' : ''
            }`}
          >
            {data.values.map((subvalue: any) => {
              return (
                <div
                  className={`list-value ${
                    subvalue.hasNoValue ? 'hasNoValue' : ''
                  }`}
                  data-ids={data.ids}
                >
                  <div className="cell-value">
                    {data.isThumbnail ? (
                      <React.Fragment>
                        {subvalue.value.map((subsubvalue: any) => {
                          return (
                            <div className="value-subvalue" title={subsubvalue}>
                              {subsubvalue ? (
                                <img src={subsubvalue} />
                              ) : (
                                subsubvalue
                              )}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {subvalue.value.map((subsubvalue: any) => {
                          return (
                            <div className="value-subvalue" title={subsubvalue}>
                              {subsubvalue &&
                              subsubvalue.toString().substring(0, 4) ===
                                'http' ? (
                                <a href={subsubvalue} target="_blank">
                                  {subsubvalue}
                                </a>
                              ) : (
                                subsubvalue
                              )}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    )}
                  </div>
                  <span
                    className="cell-hits"
                    title={`${subvalue.hits} result(s) have this value`}
                    data-help="This number represents how many results have this value."
                  >
                    ({subvalue.hits})
                  </span>
                  <span className="cell-validation fa fa-exclamation-triangle is-hidden" />
                </div>
              )
            })}
          </div>
        </div>
        <div className="if-homogeneous if-other">
          <div className="input-other" />
        </div>
      </React.Fragment>
    )
  },
  regions: {
    enumRegion: '.enum-region',
    otherInput: '.input-other',
  },
  events: {},
  listenForChange() {
    this.listenTo(
      this.enumRegion.currentView.model,
      'change:value',
      function () {
        // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        const value = this.enumRegion.currentView.model.get('value')[0]
        switch (value) {
          case 'bulkDefault':
            // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.model.revert()
            break
          case 'bulkCustom':
            // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.model.setValue(this.otherInput.currentView.model.getValue())

            // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.model.set('hasChanged', true)
            break
          default:
            // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.model.setValue(value)

            // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.model.set('hasChanged', true)
            break
        }

        // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.handleChange()
      }
    )
    this.listenTo(
      this.otherInput.currentView.model,
      'change:value',
      function () {
        // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.model.setValue(this.otherInput.currentView.model.getValue())

        // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (!this.model.isHomogeneous()) {
          // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
          this.model.set('hasChanged', true)
        }

        // @ts-ignore ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.handleChange()
      }
    )
  },
  onRender() {
    this.initializeDropdown()
    InputView.prototype.onRender.call(this)
    this.handleOther()
    this.handleBulk()
  },
  serializeData() {
    // need duplicate (usually toJSON returns a side-effect free version, but this has a nested object that isn't using backbone associations)
    const modelJSON = Common.duplicate(this.model.toJSON())
    const type = this.model.getCalculatedType()
    modelJSON.isThumbnail = type === 'thumbnail'
    switch (type) {
      case 'date':
        modelJSON.values = _.map(modelJSON.values, (valueInfo: any) => {
          if (valueInfo.hasNoValue) {
            valueInfo.value[0] = 'No Value'
          } else {
            valueInfo.value = valueInfo.value.map((value: any) =>
              user.getUserReadableDateTime(value)
            )
            return valueInfo
          }
          return valueInfo
        })
        break
      case 'thumbnail':
        modelJSON.values = _.map(modelJSON.values, (valueInfo: any) => {
          if (valueInfo.hasNoValue) {
            valueInfo.value[0] = 'No Value'
          } else {
            valueInfo.value = valueInfo.value.map((value: any) =>
              Common.getImageSrc(value)
            )
            return valueInfo
          }
          return valueInfo
        })
        break
      default:
        modelJSON.values = _.map(modelJSON.values, (valueInfo: any) => {
          if (valueInfo.hasNoValue) {
            valueInfo.value[0] = 'No Value'
          }
          return valueInfo
        })
        break
    }
    modelJSON.values.sort(sortNoValueToTop)
    return modelJSON
  },
  initializeDropdown() {
    const enumValues = [
      {
        label: 'Multiple Values',
        value: 'bulkDefault',
        help:
          'This is the default.  Selecting it will cause no changes to the results, allowing them to keep their multiple values.',
      },
      {
        label: 'Custom',
        value: 'bulkCustom',
        help: 'Select this to enter a custom value.',
      },
    ] as any[]
    _.forEach(this.model.get('values'), (valueInfo: any) => {
      let value = valueInfo.value
      let label = valueInfo.hasNoValue ? 'No Value' : value
      const type = this.model.getCalculatedType()
      if (!valueInfo.hasNoValue) {
        switch (type) {
          case 'date':
            label = label.map((text: any) => user.getUserReadableDateTime(text))
            value = value.map((text: any) => moment(text))
            break
          default:
            break
        }
      }
      if (type !== 'thumbnail' || valueInfo.hasNoValue) {
        enumValues.push({
          label,
          value,
          hits: valueInfo.hits,
          hasNoValue: valueInfo.hasNoValue,
          isThumbnail: type === 'thumbnail',
        })
      }
    })
    enumValues.sort(sortNoValueToTop)
    this.enumRegion.show(
      DropdownView.createSimpleDropdown({
        list: enumValues,
        defaultSelection: ['bulkDefault'],
        hasFiltering: true,
      })
    )
  },
  onBeforeShow() {
    this.otherInput.show(
      new MultivalueView({
        model: this.model.isHomogeneous() ? this.model : this.model.clone(), // in most cases this view is the real input, except for the heterogenous case
      })
    )
    this.otherInput.currentView.listenTo(this.model, 'change:isEditing', () => {
      this.otherInput.currentView.model.set(
        'isEditing',
        this.model.get('isEditing')
      )
    })
    if (!this.model.isHomogeneous() && this.model.isMultivalued()) {
      this.otherInput.currentView.addNewValue()
    }
  },
  handleChange() {
    this.handleOther()
  },
  handleOther() {
    if (this.enumRegion.currentView.model.get('value')[0] === 'bulkCustom') {
      this.$el.addClass('is-other')
    } else {
      this.$el.removeClass('is-other')
    }
  },
  handleBulk() {
    if (this.model.isHomogeneous()) {
      this.turnOffBulk()
    }
  },
  turnOffBulk() {
    this.$el.addClass('is-homogeneous')
  },
})
