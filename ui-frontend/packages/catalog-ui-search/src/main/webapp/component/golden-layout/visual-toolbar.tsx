import GoldenLayout from 'golden-layout'
import React from 'react'
import MinimizeIcon from '@mui/icons-material/Minimize'
import CloseIcon from '@mui/icons-material/Close'
import PopoutIcon from '@mui/icons-material/OpenInNew'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import ExtensionPoints from '../../extension-points/extension-points'
import {
  CloseOnClickTooltip,
  MinimizedHeight,
  adjustStackInMinimizedPlaceIfNecessary,
  getBottomItem,
  getRootColumnContent,
  layoutAlreadyHasMinimizedStack,
  rootIsEmpty,
  rootIsNotAColumn,
  useIsMaximized,
  useRoot,
  useStackSize,
} from './stack-toolbar'
import { Grid } from '@mui/material'
import _ from 'underscore'

function useStackRelatedToTab(tab: GoldenLayout.Tab) {
  const [stack, setStack] = React.useState(tab.contentItem.parent)
  React.useEffect(() => {
    setStack(tab.contentItem.parent)
  }, [tab])
  return stack as GoldenLayout.Tab & GoldenLayout.ContentItem
}

// add the tab to the existing minimized stack
function addTabToExistingMinimizedStack({
  tab,
  stack,
}: {
  tab: GoldenLayout.Tab & GoldenLayout.ContentItem
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const bottomItem = getBottomItem(stack)
  if (bottomItem) {
    stack.removeChild(tab.contentItem as any, true) // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
    bottomItem.addChild(tab.contentItem, undefined)
  }
}

// we have to move each item individually because golden layout doesn't support moving an entire stack, and addChild does not work as documentation says (it doesn't remove the existing automatically)
function createNewStackFromExistingTab({
  tab,
  stack,
}: {
  tab: GoldenLayout.Tab & GoldenLayout.ContentItem
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const existingItem = tab.contentItem
  const newStackItem = stack.layoutManager._$normalizeContentItem({
    type: 'stack',
  })
  stack.removeChild(existingItem as any, true) // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
  newStackItem.addChild(existingItem, undefined)
  return newStackItem
}

function createAndAddNewMinimizedStackForTab({
  tab,
  stack,
  goldenLayoutRoot,
}: {
  tab: GoldenLayout.Tab & GoldenLayout.ContentItem
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
  goldenLayoutRoot: GoldenLayout.ContentItem
}) {
  const newStackItem = createNewStackFromExistingTab({ stack, tab })
  if (rootIsNotAColumn(goldenLayoutRoot)) {
    const existingRootContent = getRootColumnContent(goldenLayoutRoot)
    goldenLayoutRoot.removeChild(existingRootContent as any, true) // for some reason removeChild is overly restrictive on type of "thing" so we have to cast

    // we need a column for minimize to work, so make a new column and add the existing root to it
    const newColumnItem = stack.layoutManager._$normalizeContentItem({
      type: 'column',
    })
    newColumnItem.addChild(existingRootContent)
    newColumnItem.addChild(newStackItem)

    goldenLayoutRoot.addChild(newColumnItem)
  } else if (rootIsEmpty(goldenLayoutRoot)) {
    const newColumnItem = stack.layoutManager._$normalizeContentItem({
      type: 'column',
    })
    newColumnItem.addChild(newStackItem)

    goldenLayoutRoot.addChild(newColumnItem)
  } else {
    getRootColumnContent(goldenLayoutRoot)?.addChild(newStackItem)
  }
}

// keep track of pixel height on each stack, which allows us to detect when a stack is "minimized" later on
function usePixelHeightTrackingForTab(
  tab: GoldenLayout.Tab & GoldenLayout.ContentItem,
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem,
  height: number | undefined
) {
  React.useEffect(() => {
    if (stack) {
      ;(stack as any).pixelHeight = height
    }
  }, [height, stack])
  const goldenLayoutRoot = useRoot(stack)

  const minimizeCallback = React.useCallback(() => {
    if (!goldenLayoutRoot) {
      return
    }
    if (layoutAlreadyHasMinimizedStack({ stack })) {
      // minimized area exists, add this to it
      addTabToExistingMinimizedStack({ tab, stack })
    } else {
      // rearrange layout if necessary and move the stack
      createAndAddNewMinimizedStackForTab({ tab, stack, goldenLayoutRoot })
    }
    adjustStackInMinimizedPlaceIfNecessary({ goldenLayoutRoot })
  }, [stack, goldenLayoutRoot])

  return { minimizeCallback }
}

function useCanBeMinimizedTab({
  stack,
  height,
  width,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
  height?: number
  width?: number
}) {
  const [itemCount, setItemCount] = React.useState(stack.contentItems.length)
  const [canBeMinimized, setCanBeMinimized] = React.useState(true)
  React.useEffect(() => {
    const rootContent = getRootColumnContent(stack)
    if (rootContent?.isStack && rootContent?.contentItems.length === 1) {
      setCanBeMinimized(false)
    } else {
      setCanBeMinimized(true)
    }
  }, [stack, height, width, itemCount])
  React.useEffect(() => {
    if (stack) {
      const callback = () => {
        setItemCount(stack.contentItems.length)
      }
      stack.on('itemCreated', callback)
      stack.on('itemDestroyed', callback)
      return () => {
        stack.off('itemCreated', callback)
        stack.off('itemDestroyed', callback)
      }
    }
    return () => {}
  }, [stack])
  return canBeMinimized
}

export const GoldenLayoutComponentHeader = ({
  viz,
  tab,
  options,
  componentState,
  container,
  name,
}: {
  viz: any
  tab: GoldenLayout.Tab & GoldenLayout.ContentItem
  options: any
  componentState: any
  container: any
  name: any
}) => {
  const relatedStack = useStackRelatedToTab(tab)
  const { height, width } = useStackSize(relatedStack)
  const { minimizeCallback } = usePixelHeightTrackingForTab(
    tab as any,
    relatedStack,
    height
  )
  const canBeMinimized = useCanBeMinimizedTab({
    stack: relatedStack,
    width,
    height,
  })
  const isMaximized = useIsMaximized({ stack: relatedStack })
  const isMinimized = height && height <= MinimizedHeight
  return (
    <ExtensionPoints.providers>
      <div
        data-id={`${name}-tab`}
        className={`flex flex-row items-center flex-nowrap`}
      >
        <Grid item className="px-1 text-base">
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
        {isMinimized || isMaximized || !canBeMinimized ? (
          <></>
        ) : (
          <Grid item>
            <CloseOnClickTooltip
              title={
                <Paper elevation={Elevations.overlays} className="p-1">
                  Minimize visual to bottom of layout
                </Paper>
              }
            >
              <Button onClick={minimizeCallback}>
                <MinimizeIcon fontSize="small" />
              </Button>
            </CloseOnClickTooltip>
          </Grid>
        )}

        <Grid item>
          {!tab.contentItem.layoutManager.isSubWindow &&
          tab.closeElement[0].style.display !== 'none' ? (
            <CloseOnClickTooltip
              title={
                <Paper elevation={Elevations.overlays} className="p-1">
                  Open visual in new window
                </Paper>
              }
            >
              <Button
                data-id="popout-tab-button"
                onClick={() => {
                  tab.contentItem.popout()
                }}
              >
                <PopoutIcon fontSize="small" />
              </Button>
            </CloseOnClickTooltip>
          ) : null}
        </Grid>
        <Grid item>
          {tab.closeElement[0].style.display !== 'none' ? (
            <CloseOnClickTooltip
              title={
                <Paper elevation={Elevations.overlays} className="p-1">
                  Close visual
                </Paper>
              }
            >
              <Button
                data-id="close-tab-button"
                onClick={(e) => {
                  ;(tab as any)._onCloseClickFn(e)
                }}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </CloseOnClickTooltip>
          ) : null}
        </Grid>
      </div>
    </ExtensionPoints.providers>
  )
}
