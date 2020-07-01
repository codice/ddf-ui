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
import * as ReactDOM from 'react-dom'
const _ = require('underscore')
const _merge = require('lodash/merge')
const _debounce = require('lodash/debounce')
const $ = require('jquery')
const wreqr = require('../../js/wreqr.js')
const template = require('./golden-layout.hbs')
const Marionette = require('marionette')
const CustomElements = require('../../js/CustomElements.js')
const GoldenLayout = require('golden-layout')
const properties = require('../../js/properties.js')
const Common = require('../../js/Common.js')
const user = require('../singletons/user-instance.js')
const VisualizationDropdown = require('../dropdown/visualization-selector/dropdown.visualization-selector.view.js')
const DropdownModel = require('../dropdown/dropdown.js')
const sanitize = require('sanitize-html')
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import ExtensionPoints from '../../extension-points'
import AllOutIcon from '@material-ui/icons/AllOut'
import MinimizeIcon from '@material-ui/icons/Minimize'
import CloseIcon from '@material-ui/icons/Close'
const treeMap = (obj, fn, path = []) => {
  if (Array.isArray(obj)) {
    return obj.map((v, i) => treeMap(v, fn, path.concat(i)))
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .map(k => [k, treeMap(obj[k], fn, path.concat(k))])
      .reduce((o, [k, v]) => {
        o[k] = v
        return o
      }, {})
  }

  return fn(obj, path)
}

const sanitizeTree = tree =>
  treeMap(tree, obj => {
    if (typeof obj === 'string') {
      return sanitize(obj, {
        allowedTags: [],
        allowedAttributes: [],
      })
    }
    return obj
  })

const defaultGoldenLayoutContent = {
  content: properties.defaultLayout || [
    {
      type: 'stack',
      content: [
        {
          type: 'component',
          componentName: 'status',
          title: 'Search',
          isClosable: false,
        },
        {
          type: 'component',
          componentName: 'cesium',
          title: '3D Map',
        },
        {
          type: 'component',
          componentName: 'inspector',
          title: 'Inspector',
        },
      ],
    },
  ],
}

function getGoldenLayoutSettings() {
  const minimumScreenSize = 20 //20 rem or 320px at base font size
  const fontSize = parseInt(
    user
      .get('user')
      .get('preferences')
      .get('fontSize')
  )
  const theme = user
    .get('user')
    .get('preferences')
    .get('theme')
    .getTheme()
  return {
    settings: {
      showPopoutIcon: false,
      responsiveMode: 'none',
    },
    dimensions: {
      borderWidth: 0.5 * parseFloat(theme.minimumSpacing) * fontSize,
      minItemHeight: 50,
      minItemWidth: 50,
      headerHeight: parseFloat(theme.minimumButtonSize) * fontSize,
      dragProxyWidth: 300,
      dragProxyHeight: 200,
    },
    labels: {
      close: 'close',
      maximise: 'maximize',
      minimise: 'minimize',
      popout: 'open in new window',
      popin: 'pop in',
      tabDropdown: 'additional tabs',
    },
  }
}

// see https://github.com/deepstreamIO/golden-layout/issues/239 for details on why the setTimeout is necessary
// The short answer is it mostly has to do with making sure these ComponentViews are able to function normally (set up events, etc.)
function registerComponent(
  marionetteView,
  name,
  ComponentView,
  componentOptions,
  viz
) {
  const options = _.extend({}, marionetteView.options, componentOptions)
  marionetteView.goldenLayout.registerComponent(
    name,
    (container, componentState) => {
      container.on('open', () => {
        setTimeout(() => {
          const componentView = new ComponentView(
            _.extend({}, options, componentState, {
              container,
            })
          )
          container.getElement().append(componentView.el)
          componentView.render()
          container.on('destroy', () => {
            componentView.destroy()
          })
        }, 0)
      })
      container.on('resize', () => {
        if (container.width < 100) {
          container.parent.parent.element.addClass('is-minimized')
        } else {
          container.parent.parent.element.removeClass('is-minimized')
        }
        console.log('resize')
      })
      container.on('tab', tab => {
        tab.closeElement.off('click').on('click', event => {
          if (
            tab.header.parent.isMaximised &&
            tab.header.parent.contentItems.length === 1
          ) {
            tab.header.parent.toggleMaximise()
          }
          tab._onCloseClickFn(event)
        })
        const root = document.createElement('div')
        tab.element.append(root)
        let intervalId = setInterval(() => {
          try {
            ReactDOM.render(
              <React.Fragment>
                <Grid container direction="row" wrap="nowrap">
                  <Grid item className="px-2">
                    <div>{tab.titleElement.text()}</div>
                  </Grid>
                  <Grid item>
                    {viz.header ? (
                      <viz.header
                        {..._.extend({}, options, componentState, {
                          container,
                        })}
                      />
                    ) : null}
                  </Grid>
                  {/* <Grid item>
                    <Button
                      onClick={e => {
                        tab.contentItem.container.setSize(
                          10,
                          tab.contentItem.container.height
                        )
                      }}
                    >
                      -
                    </Button>
                  </Grid> */}
                  <Grid item>
                    {tab.closeElement[0].style.display !== 'none' ? (
                      <Button
                        onClick={e => {
                          tab._onCloseClickFn(e)
                        }}
                      >
                        <CloseIcon />
                      </Button>
                    ) : null}
                  </Grid>
                </Grid>
              </React.Fragment>,
              tab.element[0]
            )
            clearInterval(intervalId)
          } catch (err) {}
        }, 100)
      })
    }
  )
}

function isMaximised(contentItem) {
  if (contentItem.isMaximised) {
    return true
  } else if (contentItem.contentItems.length === 0) {
    return false
  } else {
    return _.some(contentItem.contentItems, isMaximised)
  }
}

function removeActiveTabInformation(config) {
  if (config.activeItemIndex !== undefined) {
    config.activeItemIndex = 0
  }
  if (config.content === undefined || config.content.length === 0) {
    return
  } else {
    return _.forEach(config.content, removeActiveTabInformation)
  }
}

function removeMaximisedInformation(config) {
  delete config.maximisedItemId
}

function removeEphemeralState(config) {
  removeMaximisedInformation(config)
  removeActiveTabInformation(config)
}

module.exports = Marionette.LayoutView.extend({
  tagName: CustomElements.register('golden-layout'),
  template,
  className: 'is-minimised',
  events: {
    'click > .golden-layout-toolbar .to-toggle-size': 'handleToggleSize',
  },
  regions: {
    toolbar: '> .golden-layout-toolbar',
    widgetDropdown: '> .golden-layout-toolbar .to-add',
  },
  updateFontSize() {
    const goldenLayoutSettings = getGoldenLayoutSettings()
    this.goldenLayout.config.dimensions.borderWidth =
      goldenLayoutSettings.dimensions.borderWidth
    this.goldenLayout.config.dimensions.minItemHeight =
      goldenLayoutSettings.dimensions.minItemHeight
    this.goldenLayout.config.dimensions.minItemWidth =
      goldenLayoutSettings.dimensions.minItemWidth
    this.goldenLayout.config.dimensions.headerHeight =
      goldenLayoutSettings.dimensions.headerHeight
    Common.repaintForTimeframe(2000, () => {
      this.goldenLayout.updateSize()
    })
  },
  updateSize() {
    if (this.isDestroyed) {
      return
    }
    this.goldenLayout.updateSize()
  },
  showWidgetDropdown() {
    this.widgetDropdown.show(
      new VisualizationDropdown({
        model: new DropdownModel(),
        goldenLayout: this.goldenLayout,
      })
    )
  },
  showGoldenLayout() {
    this.goldenLayout = new GoldenLayout(
      this.getGoldenLayoutConfig(),
      this.el.querySelector('.golden-layout-container')
    )
    this.registerGoldenLayoutComponents()
    this.goldenLayout.on(
      'stateChanged',
      _.debounce(this.handleGoldenLayoutStateChange.bind(this), 200)
    )
    this.goldenLayout.on('stackCreated', this.handleGoldenLayoutStackCreated)
    this.goldenLayout.on(
      'initialised',
      this.handleGoldenLayoutInitialised.bind(this)
    )

    this.goldenLayout.init()
  },
  getGoldenLayoutConfig() {
    let currentConfig = user
      .get('user')
      .get('preferences')
      .get(this.options.configName)
    if (currentConfig === undefined) {
      currentConfig = defaultGoldenLayoutContent
    }
    _merge(currentConfig, getGoldenLayoutSettings())
    return sanitizeTree(currentConfig)
  },
  registerGoldenLayoutComponents() {
    ExtensionPoints.visualizations.forEach(viz => {
      registerComponent(this, viz.id, viz.view, viz.options, viz)
    })
  },
  detectIfGoldenLayoutMaximised() {
    this.$el.toggleClass('is-maximised', isMaximised(this.goldenLayout.root))
  },
  detectIfGoldenLayoutEmpty() {
    this.$el.toggleClass(
      'is-empty',
      this.goldenLayout.root.contentItems.length === 0
    )
  },
  handleGoldenLayoutInitialised() {
    this.detectIfGoldenLayoutMaximised()
    this.detectIfGoldenLayoutEmpty()
  },
  handleGoldenLayoutStackCreated(stack) {
    stack.header.controlsContainer
      .find('.lm_close')
      .off('click')
      .on('click', event => {
        if (stack.isMaximised) {
          stack.toggleMaximise()
        }
        stack.remove()
      })
    // const root = document.createElement('div')
    // tab.element.append(root)
    console.log(stack)
    let intervalId = setInterval(() => {
      try {
        ReactDOM.render(
          <React.Fragment>
            <Grid container direction="row" wrap="nowrap">
              <Grid item>
                <Button
                  onClick={e => {
                    const prevWidth = stack.config.prevWidth || 500
                    const prevHeight = stack.config.prevHeight || 500
                    stack.contentItems[0].container.setSize(
                      prevWidth,
                      prevHeight
                    )
                  }}
                >
                  +
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={e => {
                    stack.config.prevWidth = stack.getActiveContentItem().container.width
                    stack.config.prevHeight = stack.getActiveContentItem().container.height
                    stack.contentItems[0].container.setSize(10, 45)
                  }}
                >
                  <MinimizeIcon />
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={e => {
                    stack.toggleMaximise()
                  }}
                >
                  <AllOutIcon />
                </Button>
              </Grid>
              <Grid item>
                {stack.header._isClosable() ? (
                  <Button
                    onClick={e => {
                      if (stack.isMaximised) {
                        stack.toggleMaximise()
                      }
                      stack.remove()
                    }}
                  >
                    <CloseIcon />
                  </Button>
                ) : null}
              </Grid>
            </Grid>
          </React.Fragment>,
          stack.header.controlsContainer[0]
        )
        clearInterval(intervalId)
      } catch (err) {}
    }, 100)
  },
  handleGoldenLayoutStateChange(event) {
    if (this.isDestroyed) {
      return
    }
    this.detectIfGoldenLayoutMaximised()
    this.detectIfGoldenLayoutEmpty()
    //https://github.com/deepstreamIO/golden-layout/issues/253
    if (this.goldenLayout.isInitialised) {
      const currentConfig = this.goldenLayout.toConfig()
      removeEphemeralState(currentConfig)
      user
        .get('user')
        .get('preferences')
        .set(this.options.configName, currentConfig)
      wreqr.vent.trigger('resize')
      //do not add a window resize event, that will cause an endless loop.  If you need something like that, listen to the wreqr resize event.
    }
  },
  setupListeners() {
    this.listenTo(
      user.get('user').get('preferences'),
      'change:theme',
      this.updateFontSize
    )
    this.listenTo(
      user.get('user').get('preferences'),
      'change:fontSize',
      this.updateFontSize
    )
    this.listenForResize()
  },
  onRender() {
    this.showGoldenLayout()
    this.showWidgetDropdown()
    this.setupListeners()
  },
  handleToggleSize() {
    this.$el.toggleClass('is-minimised')
    this.goldenLayout.updateSize()
  },
  listenForResize() {
    $(window).on(
      'resize.' + this.cid,
      _debounce(
        event => {
          this.updateSize()
        },
        100,
        {
          leading: false,
          trailing: true,
        }
      )
    )
    this.listenTo(wreqr.vent, 'gl-updateSize', () => {
      this.updateSize()
    })
  },
  stopListeningForResize() {
    $(window).off('resize.' + this.cid)
    this.stopListening(wreqr.vent)
  },
  onDestroy() {
    this.stopListeningForResize()
    if (this.goldenLayout) {
      this.goldenLayout.destroy()
    }
  },
})
