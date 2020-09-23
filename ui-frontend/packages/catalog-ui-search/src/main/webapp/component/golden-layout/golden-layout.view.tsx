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
// @ts-ignore ts-migrate(6133) FIXME: 'template' is declared but its value is never read... Remove this comment to see the full error message
const template = require('./golden-layout.hbs')
const Marionette = require('marionette')
const CustomElements = require('../../js/CustomElements.js')
const GoldenLayout = require('golden-layout')
const properties = require('../../js/properties.js')
const Common = require('../../js/Common.js')
const user = require('../singletons/user-instance.js')
const sanitize = require('sanitize-html')
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import AllOutIcon from '@material-ui/icons/AllOut'
import MinimizeIcon from '@material-ui/icons/Minimize'
import CloseIcon from '@material-ui/icons/Close'
import { providers as Providers } from '../../extension-points/providers'
import { Visualizations } from '../visualization/visualizations'

// @ts-ignore ts-migrate(7024) FIXME: Function implicitly has return type 'any' because ... Remove this comment to see the full error message
const treeMap = (obj: any, fn: any, path = []) => {
  if (Array.isArray(obj)) {
    // @ts-ignore ts-migrate(2769) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    return obj.map((v, i) => treeMap(v, fn, path.concat(i)))
  }

  if (obj !== null && typeof obj === 'object') {
    return (
      Object.keys(obj)
        // @ts-ignore ts-migrate(2769) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
        .map((k) => [k, treeMap(obj[k], fn, path.concat(k))])
        .reduce((o, [k, v]) => {
          // @ts-ignore ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          o[k] = v
          return o
        }, {})
    )
  }

  return fn(obj, path)
}

// @ts-ignore ts-migrate(6133) FIXME: 'sanitizeTree' is declared but its value is never ... Remove this comment to see the full error message
const sanitizeTree = (tree: any) =>
  treeMap(tree, (obj: any) => {
    if (typeof obj === 'string') {
      return sanitize(obj, {
        allowedTags: [],
        allowedAttributes: [],
      })
    }
    return obj
  })

function getGoldenLayoutSettings() {
  const fontSize = parseInt(user.get('user').get('preferences').get('fontSize'))
  const theme = user.get('user').get('preferences').get('theme').getTheme()
  return {
    settings: {
      showPopoutIcon: false,
      responsiveMode: 'none',
    },
    dimensions: {
      borderWidth: 8,
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
  marionetteView: any,
  name: any,
  ComponentView: any,
  componentOptions: any,
  viz: any
) {
  const options = _.extend({}, marionetteView.options, componentOptions)
  marionetteView.goldenLayout.registerComponent(
    name,
    (container: any, componentState: any) => {
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
      })
      container.on('tab', (tab: any) => {
        tab.closeElement.off('click').on('click', (event: any) => {
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
              <Providers>
                <Grid
                  data-id={`${name}-tab`}
                  container
                  direction="row"
                  wrap="nowrap"
                >
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
                        data-id="close-tab-button"
                        onClick={(e) => {
                          tab._onCloseClickFn(e)
                        }}
                      >
                        <CloseIcon />
                      </Button>
                    ) : null}
                  </Grid>
                </Grid>
              </Providers>,
              tab.element[0]
            )
            clearInterval(intervalId)
          } catch (err) {}
        }, 100)
      })
    }
  )
}

function isMaximised(contentItem: any) {
  if (contentItem.isMaximised) {
    return true
  } else if (contentItem.contentItems.length === 0) {
    return false
  } else {
    return _.some(contentItem.contentItems, isMaximised)
  }
}

function removeActiveTabInformation(config: any) {
  if (config.activeItemIndex !== undefined) {
    config.activeItemIndex = 0
  }
  if (config.content === undefined || config.content.length === 0) {
    return
  } else {
    return _.forEach(config.content, removeActiveTabInformation)
  }
}

function removeMaximisedInformation(config: any) {
  delete config.maximisedItemId
}

function removeEphemeralState(config: any) {
  removeMaximisedInformation(config)
  removeActiveTabInformation(config)
  return config
}

const FALLBACK_GOLDEN_LAYOUT = [
  {
    type: 'stack',
    content: [
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
]

export const DEFAULT_GOLDEN_LAYOUT_CONTENT = {
  content: properties.defaultLayout || FALLBACK_GOLDEN_LAYOUT,
}

export const getStringifiedDefaultLayout = () => {
  try {
    return JSON.stringify(DEFAULT_GOLDEN_LAYOUT_CONTENT)
  } catch (err) {
    console.warn(err)
    return JSON.stringify(FALLBACK_GOLDEN_LAYOUT)
  }
}

export default Marionette.LayoutView.extend({
  tagName: CustomElements.register('golden-layout'),
  template() {
    return <div className="golden-layout-container w-full h-full" />
  },
  className: 'is-minimised h-full w-full',
  lastConfig: undefined,
  reconfigureLayout(layout: any) {
    this.goldenLayout.root.contentItems.forEach((item: any) => {
      item.remove()
    })
    layout.content.forEach((item: any) => {
      this.goldenLayout.root.addChild(item)
    })
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
  listenToGoldenLayoutStateChange() {
    this.goldenLayout.on(
      'stateChanged',
      _.debounce(this.handleGoldenLayoutStateChange.bind(this), 200)
    )
  },
  showGoldenLayout() {
    this.goldenLayout = new GoldenLayout(
      this.getGoldenLayoutConfig(),
      this.el.querySelector('.golden-layout-container')
    )
    this.registerGoldenLayoutComponents()
    this.listenToGoldenLayoutStateChange()
    this.goldenLayout.on('stackCreated', this.handleGoldenLayoutStackCreated)
    this.goldenLayout.on(
      'initialised',
      this.handleGoldenLayoutInitialised.bind(this)
    )

    this.goldenLayout.init()
  },
  getGoldenLayoutConfig() {
    let currentConfig = undefined
    if (this.options.layoutResult) {
      try {
        currentConfig = JSON.parse(
          this.options.layoutResult.metacard.properties.layout
        )
      } catch (err) {
        console.warn('issue parsing a saved layout, falling back to default')
      }
    } else if (this.options.editLayoutRef) {
      currentConfig = this.options.editLayoutRef.current
    } else {
      currentConfig = user
        .get('user')
        .get('preferences')
        .get(this.options.configName)
    }
    if (currentConfig === undefined) {
      currentConfig = DEFAULT_GOLDEN_LAYOUT_CONTENT
    }
    _merge(currentConfig, getGoldenLayoutSettings())
    return currentConfig
  },
  registerGoldenLayoutComponents() {
    Visualizations.forEach((viz) => {
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
  handleGoldenLayoutStackCreated(stack: any) {
    stack.header.controlsContainer
      .find('.lm_close')
      .off('click')
      // @ts-ignore ts-migrate(6133) FIXME: 'event' is declared but its value is never read.
      .on('click', (event: any) => {
        if (stack.isMaximised) {
          stack.toggleMaximise()
        }
        stack.remove()
      })
    // const root = document.createElement('div')
    // tab.element.append(root)
    let intervalId = setInterval(() => {
      try {
        ReactDOM.render(
          <Providers>
            <Grid container direction="row" wrap="nowrap">
              <Grid item>
                <Button
                  data-id="maximise-tab-button"
                  // @ts-ignore ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
                  onClick={(e) => {
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
                  data-id="minimise-layout-button"
                  // @ts-ignore ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
                  onClick={(e) => {
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
                  data-id="maximise-layout-button"
                  // @ts-ignore ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
                  onClick={(e) => {
                    stack.toggleMaximise()
                  }}
                >
                  <AllOutIcon />
                </Button>
              </Grid>
              <Grid item>
                {stack.header._isClosable() ? (
                  <Button
                    data-id="close-layout-button"
                    // @ts-ignore ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
                    onClick={(e) => {
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
          </Providers>,
          stack.header.controlsContainer[0]
        )
        clearInterval(intervalId)
      } catch (err) {}
    }, 100)
  },
  // @ts-ignore ts-migrate(6133) FIXME: 'event' is declared but its value is never read.
  handleGoldenLayoutStateChange(event: any) {
    if (this.isDestroyed) {
      return
    }
    if (this.lastConfig === undefined) {
      // this triggers on init of golden layout
      this.lastConfig = this.getInstanceConfig()
      return
    }
    wreqr.vent.trigger('resize') // do we need this?
    if (
      _.isEqual(
        removeEphemeralState(this.lastConfig),
        removeEphemeralState(this.getInstanceConfig())
      )
    ) {
      return
    }
    this.lastConfig = this.getInstanceConfig()

    /**
     * If we have this option, then we're editing a layout in the layout editor.
     * Otherwise, we're using a layout (or possibly custom) and need to take a change as indication of moving to custom.
     */
    if (this.options.editLayoutRef) {
      this.options.editLayoutRef.current = this.getInstanceConfig()
    } else {
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
      user.get('user').get('preferences').set(
        {
          layoutId: 'custom',
        },
        {
          internal: true,
        }
      )
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
  onFirstRender() {
    this.showGoldenLayout()
    this.setupListeners()
  },
  listenForResize() {
    $(window).on(
      'resize.' + this.cid,
      _debounce(
        // @ts-ignore ts-migrate(6133) FIXME: 'event' is declared but its value is never read.
        (event: any) => {
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
  getInstanceConfig() {
    const currentConfig = this.goldenLayout.toConfig()
    return removeEphemeralState(currentConfig)
  },
  onDestroy() {
    this.stopListeningForResize()
    if (this.goldenLayout) {
      this.goldenLayout.destroy()
    }
  },
})
