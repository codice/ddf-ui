import { GoldenLayoutViewProps } from './golden-layout.view'
import * as React from 'react'
import _merge from 'lodash/merge'
import _ from 'underscore'
import wreqr from '../../js/wreqr'
import user from '../singletons/user-instance'
import { dispatchGoldenLayoutChangeEvent } from './golden-layout.events'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { LayoutConfig, PopoutContent, ContentItem } from './golden-layout.types'
import { HeaderHeight } from './stack-toolbar'
import { getDefaultComponentState } from '../visualization/settings-helpers'
import { ResultType } from '../../js/model/Types'

function normalizeContent(content: ContentItem) {
  if (content.componentState === undefined && content.componentName) {
    content.componentState = getDefaultComponentState(content.componentName)
  }
  if (content.content) {
    content.content.forEach((subContent) => {
      normalizeContent(subContent)
    })
  }
}

/**
 *  add in missing component state defaults, as we do not create layouts using golden layout all the time and sometimes they have minimal details,
 *  this will also add a default state to old layouts so they aren't seen as changed unnecessarily on load (we don't fire a change event)
 */
export function normalizeLayout(layout: LayoutConfig) {
  if (layout.content && layout.content.length > 0) {
    layout.content.forEach((contentItem) => {
      normalizeContent(contentItem)
    })
  }
  if (layout.openPopouts && layout.openPopouts.length > 0) {
    layout.openPopouts.forEach((popout) => {
      popout.content.forEach((contentItem) => {
        normalizeContent(contentItem)
      })
    })
  }
  return layout
}
export function getInstanceConfig({ goldenLayout }: { goldenLayout: any }) {
  const currentConfig = goldenLayout.toConfig()
  // tagAsProcessedByGoldenLayout({ config: currentConfig })
  return removeEphemeralStateAndNormalize(currentConfig)
}

export function parseResultLayout(layoutResult: ResultType) {
  let config = undefined
  try {
    config = JSON.parse(layoutResult.metacard.properties.layout)
  } catch (err) {
    console.warn('issue parsing a saved layout, falling back to default')
    config = DEFAULT_GOLDEN_LAYOUT_CONTENT
  }
  _merge(config, getGoldenLayoutSettings())
  return normalizeLayout(config)
}
export function getGoldenLayoutConfig({
  layoutResult,
  editLayoutRef,
  configName,
}: GoldenLayoutViewProps) {
  let currentConfig = undefined
  if (layoutResult) {
    return parseResultLayout(layoutResult)
  } else if (editLayoutRef) {
    currentConfig = editLayoutRef.current
  } else {
    currentConfig = user.get('user').get('preferences').get(configName)
  }
  if (currentConfig === undefined) {
    currentConfig = DEFAULT_GOLDEN_LAYOUT_CONTENT
  }
  _merge(currentConfig, getGoldenLayoutSettings())
  return normalizeLayout(currentConfig)
}
export function handleGoldenLayoutStateChange({
  options,
  goldenLayout,
  currentConfig,
  lastConfig,
}: {
  goldenLayout: any
  currentConfig: any
  options: GoldenLayoutViewProps
  lastConfig: React.MutableRefObject<any>
}) {
  const lastConfigValue = removeEphemeralStateAndNormalize(lastConfig.current)

  const currentConfigValue = removeEphemeralStateAndNormalize(currentConfig)
  if (_.isEqual(lastConfigValue, currentConfigValue)) {
    return
  }
  dispatchGoldenLayoutChangeEvent(goldenLayout.container[0], {
    value: currentConfigValue,
    goldenLayout,
  })
  lastConfig.current = currentConfig
  /**
   * If we have this option, then we're editing a layout in the layout editor.
   * Otherwise, we're using a layout (or possibly custom) and need to take a change as indication of moving to custom.
   */
  if (options.editLayoutRef) {
    options.editLayoutRef.current = currentConfig
  } else {
    // can technically do detections of max or empty here
    //https://github.com/deepstreamIO/golden-layout/issues/253
    if (goldenLayout.isInitialised) {
      user.get('user').get('preferences').set(options.configName, currentConfig)
      ;(wreqr as any).vent.trigger('resize')
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
}
function removeMaximisedInformation(config: LayoutConfig) {
  delete config.maximisedItemId
}
function isLayoutConfig(
  config: LayoutConfig | PopoutContent | ContentItem
): config is LayoutConfig {
  return (config as LayoutConfig).openPopouts !== undefined
}
function isPopoutContent(
  config: LayoutConfig | PopoutContent | ContentItem
): config is PopoutContent {
  return (config as PopoutContent).parentId !== undefined
}
function removeOpenPopoutDimensionInformation(
  config: LayoutConfig | PopoutContent
): any {
  delete config.dimensions
  if (
    isLayoutConfig(config) &&
    config.openPopouts &&
    config.openPopouts?.length > 0
  ) {
    return _.forEach(config.openPopouts, removeOpenPopoutDimensionInformation)
  }
}
function removeSettingsInformation(config: LayoutConfig) {
  delete config.settings
}
function removeUnusedTopLevelInformation(
  config: LayoutConfig | ContentItem | PopoutContent
) {
  delete config.isClosable
  delete config.reorderEnabled
  if (!isLayoutConfig(config) && !isPopoutContent(config)) {
    delete config.activeItemIndex
  }
  if (config.content !== undefined && config.content.length > 0) {
    _.forEach(config.content, removeUnusedTopLevelInformation)
  }
  if (
    isLayoutConfig(config) &&
    config.openPopouts &&
    config.openPopouts.length > 0
  ) {
    _.forEach(config.openPopouts, removeUnusedTopLevelInformation)
  }
}
function normalizeOpenPopouts(config: LayoutConfig) {
  if (config.openPopouts === undefined) {
    config.openPopouts = []
  }
}

export function removeEphemeralStateAndNormalize(config: LayoutConfig) {
  delete config.title // only on the top level
  removeMaximisedInformation(config)
  removeOpenPopoutDimensionInformation(config)
  removeSettingsInformation(config)
  removeUnusedTopLevelInformation(config)
  normalizeOpenPopouts(config)
  return config
}
export const FALLBACK_GOLDEN_LAYOUT = [
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
  content:
    StartupDataStore.Configuration.getDefaultLayout() || FALLBACK_GOLDEN_LAYOUT,
}

export const getStringifiedDefaultLayout = () => {
  try {
    return JSON.stringify(DEFAULT_GOLDEN_LAYOUT_CONTENT)
  } catch (err) {
    console.warn(err)
    return JSON.stringify(FALLBACK_GOLDEN_LAYOUT)
  }
}
export function getGoldenLayoutSettings() {
  return {
    settings: {
      showPopoutIcon: false,
      popoutWholeStack: true,
      responsiveMode: 'none',
    },
    dimensions: {
      borderWidth: 8,
      minItemHeight: HeaderHeight,
      minItemWidth: 50,
      headerHeight: HeaderHeight,
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
