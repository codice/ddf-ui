import GoldenLayout from 'golden-layout'
import React from 'react'
import MuiTooltip, { TooltipProps } from '@mui/material/Tooltip'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import MinimizeIcon from '@mui/icons-material/Minimize'
import CloseIcon from '@mui/icons-material/Close'
import PopoutIcon from '@mui/icons-material/OpenInNew'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { Elevations } from '../theme/theme'
import ExtensionPoints from '../../extension-points/extension-points'

export const HeaderHeight = 32
export const MinimizedHeight = HeaderHeight + 5

/**
 *  There's a bit of funkiness with normal tooltip behavior when we click the minimize buttons, as the tooltip sticks behind and flickers.
 *  This ensures that when the user clicks the button, the tooltip will be hidden.
 */
export function CloseOnClickTooltip(props: TooltipProps) {
  const [show, setShow] = React.useState(false)

  return (
    <MuiTooltip
      open={show}
      disableHoverListener
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseDown={() => setShow(false)}
      {...props}
    />
  )
}

/**
 *  This can change, so do not store it in a variable, instead keep around the Root from getRoot and refind the base item as necessary.
 * @param stack
 * @returns
 */
export function getRootColumnContent(
  stack: GoldenLayout.ContentItem | GoldenLayout.Tab
): GoldenLayout.ContentItem | undefined {
  const root = getRoot(stack)
  if (root) {
    return root.contentItems[0]
  }
  return undefined
}

function getStackInMinimizedLocation({
  goldenLayoutRoot,
}: {
  goldenLayoutRoot: GoldenLayout.ContentItem
}): GoldenLayout.Container | undefined {
  const rootColumnContent = getRootColumnContent(goldenLayoutRoot)
  if (rootColumnContent) {
    return (
      rootColumnContent.contentItems[
        rootColumnContent.contentItems.length - 1
      ].getActiveContentItem() as any
    ).container as GoldenLayout.Container
  }
  return undefined
}

export function rootIsNotAColumn(goldenLayoutRoot: GoldenLayout.ContentItem) {
  return (
    getRootColumnContent(goldenLayoutRoot) &&
    !getRootColumnContent(goldenLayoutRoot)?.isColumn
  )
}

export function rootIsEmpty(goldenLayoutRoot: GoldenLayout.ContentItem) {
  return !getRootColumnContent(goldenLayoutRoot)
}

// to avoid fixing types everywhere, let's make a function
function getStackHeight({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  return (stack.element as unknown as GoldenLayout.Header['element']).height()
}

export function getBottomItem(
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
): GoldenLayout.ContentItem | undefined {
  const rootColumnContent = getRootColumnContent(stack)
  if (rootColumnContent) {
    return rootColumnContent.contentItems[
      rootColumnContent.contentItems.length - 1
    ]
  }
  return undefined
}

export function useStackSize(
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
) {
  if (stack.titleElement) {
    stack = stack.contentItem.parent as any // this is a tab, so find the stack related to the tab
  }
  const [width, setWidth] = React.useState<number | undefined>(
    stack.header.element.width()
  )
  const [height, setHeight] = React.useState<number | undefined>(
    getStackHeight({ stack })
  )

  React.useEffect(() => {
    if (stack) {
      const resizeCallback = () => {
        setWidth(stack.header.element.width())
        setHeight(getStackHeight({ stack }))
      }
      stack.on('resize', resizeCallback)
      return () => {
        stack.off('resize', resizeCallback)
      }
    }
    return () => {}
  }, [stack])
  return { height, width }
}

export function useIsMaximized({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const [isMaximized, setIsMaximized] = React.useState(false)
  React.useEffect(() => {
    const maximizedCallback = () => {
      setIsMaximized(true)
    }
    stack.on('maximised', maximizedCallback)
    const minimizedCallback = () => {
      setIsMaximized(false)
    }
    stack.on('minimised', minimizedCallback)
    return () => {
      stack.off('maximised', maximizedCallback)
      stack.off('minimised', minimizedCallback)
    }
  }, [stack])
  React.useEffect(() => {
    setIsMaximized(stack.isMaximised)
  }, [stack])
  return isMaximized
}

/**
 *  Will return a safe, unchanging reference, feel free to keep in a variable
 * @param stack
 * @returns
 */
function getRoot(
  stack: GoldenLayout.ContentItem | GoldenLayout.Tab
): GoldenLayout.ContentItem | undefined {
  if (!stack) {
    return undefined
  }
  const stackAsContentItem = stack as GoldenLayout.ContentItem
  if (stackAsContentItem?.isRoot) {
    return stackAsContentItem
  }
  let parent = stackAsContentItem.parent
  if (parent?.type === 'root') {
    return parent
  } else {
    return getRoot(parent)
  }
}

export function useRoot(stack: GoldenLayout.Tab & GoldenLayout.ContentItem) {
  const [root, setRoot] = React.useState(getRoot(stack))
  React.useEffect(() => {
    setRoot(getRoot(stack))
  }, [stack])
  return root
}

// by ready, we mean the stack to be minimized is already on the bottom of a column layout => aka we can just resize it
function layoutIsAlreadyReady({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const bottomItem = getBottomItem(stack)
  const isBottomItem = stack === bottomItem
  return (
    (isBottomItem && getRootColumnContent(stack)?.isColumn) ||
    (!getRootColumnContent(stack)?.isColumn &&
      !getRootColumnContent(stack)?.isRow)
  )
}

// check if a minimized stack already exists
export function layoutAlreadyHasMinimizedStack({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const bottomItem = getBottomItem(stack)

  return (
    getRootColumnContent(stack)?.isColumn &&
    (bottomItem as any).pixelHeight <= MinimizedHeight
  )
}

// add the stack to the existing minimized stack
function addStackToExistingMinimizedStack({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const bottomItem = getBottomItem(stack)
  if (bottomItem) {
    stack.contentItems.slice().forEach((thing) => {
      stack.removeChild(thing as any, true) // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
      bottomItem.addChild(thing, undefined)
    })
  }
}

// we have to move each item individually because golden layout doesn't support moving an entire stack, and addChild does not work as documentation says (it doesn't remove the existing automatically)
function createNewStackFromExistingStack({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) {
  const existingItems = stack.contentItems.slice()
  const newStackItem = stack.layoutManager._$normalizeContentItem({
    type: 'stack',
  })
  existingItems.forEach((thing) => {
    stack.removeChild(thing as any, true) // for some reason removeChild is overly restrictive on type of "thing" so we have to cast
    newStackItem.addChild(thing, undefined)
  })
  return newStackItem
}

// create a new minimized stack and add the stack to it
function createAndAddNewMinimizedStack({
  stack,
  goldenLayoutRoot,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
  goldenLayoutRoot: GoldenLayout.ContentItem
}) {
  const newStackItem = createNewStackFromExistingStack({ stack })
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

// the true height of the stack - the golden layout implementation at the moment only tracks the height of the visual within the stack, not the stack itself
function getTrueHeight({
  goldenLayoutRoot,
}: {
  goldenLayoutRoot: GoldenLayout.ContentItem
}) {
  return (
    getStackInMinimizedLocation({ goldenLayoutRoot })?.parent.parent
      .element as unknown as GoldenLayout.Header['element']
  ).height()
}

export function adjustStackInMinimizedPlaceIfNecessary({
  goldenLayoutRoot,
}: {
  goldenLayoutRoot: GoldenLayout.ContentItem
}) {
  if (getRootColumnContent(goldenLayoutRoot)?.isColumn) {
    const trueHeight = getTrueHeight({ goldenLayoutRoot })
    const minimizedStack = getStackInMinimizedLocation({ goldenLayoutRoot })
    if (minimizedStack) {
      minimizedStack.height = trueHeight || minimizedStack.height // otherwise setSize will not work correctly! - this allows us to consistently and always set the height to what we want!
      minimizedStack.setSize(10, HeaderHeight)
    }
  }
}

// keep track of pixel height on each stack, which allows us to detect when a stack is "minimized" later on
function usePixelHeightTracking(
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
    if (layoutIsAlreadyReady({ stack })) {
      // do nothing? just resize to be minimized
    } else if (layoutAlreadyHasMinimizedStack({ stack })) {
      // minimized area exists, add this to it
      addStackToExistingMinimizedStack({ stack })
    } else {
      // rearrange layout if necessary and move the stack
      createAndAddNewMinimizedStack({ stack, goldenLayoutRoot })
    }
    adjustStackInMinimizedPlaceIfNecessary({ goldenLayoutRoot })
  }, [stack, goldenLayoutRoot])

  return { minimizeCallback }
}

function useCanBeMinimized({
  stack,
  height,
  width,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
  height?: number
  width?: number
}) {
  const [canBeMinimized, setCanBeMinimized] = React.useState(true)
  React.useEffect(() => {
    const rootContent = getRootColumnContent(stack)
    if (rootContent?.isStack) {
      setCanBeMinimized(false)
    } else {
      setCanBeMinimized(true)
    }
  }, [stack, height, width])
  return canBeMinimized
}

export const StackToolbar = ({
  stack,
}: {
  stack: GoldenLayout.Tab & GoldenLayout.ContentItem
}) => {
  const isMaximized = useIsMaximized({ stack })
  const { height, width } = useStackSize(stack)
  const { minimizeCallback } = usePixelHeightTracking(stack, height)
  const canBeMinimized = useCanBeMinimized({ stack, width, height })
  const isMinimized = height && height <= MinimizedHeight
  return (
    <ExtensionPoints.providers>
      <div className="flex flex-row flex-nowrap items-center">
        <>
          {isMaximized || isMinimized || !canBeMinimized ? (
            <></>
          ) : (
            <div>
              <CloseOnClickTooltip
                title={
                  <Paper elevation={Elevations.overlays} className="p-1">
                    Minimize stack of visuals to bottom of layout
                  </Paper>
                }
              >
                <Button
                  data-id="minimise-layout-button"
                  onClick={minimizeCallback}
                >
                  <MinimizeIcon fontSize="small" />
                </Button>
              </CloseOnClickTooltip>
            </div>
          )}
          {isMaximized ? (
            <div>
              <CloseOnClickTooltip
                title={
                  <Paper elevation={Elevations.overlays} className="p-1">
                    Restore stack of visuals to original size
                  </Paper>
                }
              >
                <Button
                  data-id="unmaximise-layout-button"
                  onClick={() => {
                    stack.toggleMaximise()
                  }}
                >
                  <FullscreenExitIcon fontSize="small" />
                </Button>
              </CloseOnClickTooltip>
            </div>
          ) : (
            <div>
              <CloseOnClickTooltip
                title={
                  <Paper elevation={Elevations.overlays} className="p-1">
                    Maximize stack of visuals
                  </Paper>
                }
              >
                <Button
                  data-id="maximise-layout-button"
                  onClick={() => {
                    stack.toggleMaximise()
                  }}
                >
                  <FullscreenIcon fontSize="small" />
                </Button>
              </CloseOnClickTooltip>
            </div>
          )}

          {stack.layoutManager.isSubWindow ? null : (
            <div>
              <CloseOnClickTooltip
                title={
                  <Paper elevation={Elevations.overlays} className="p-1">
                    Open stack of visuals in new window
                  </Paper>
                }
              >
                <Button
                  data-id="popout-layout-button"
                  onClick={() => {
                    stack.popout()
                  }}
                >
                  <PopoutIcon fontSize="small" />
                </Button>
              </CloseOnClickTooltip>
            </div>
          )}

          <div>
            {(stack.header as any)._isClosable() ? (
              <CloseOnClickTooltip
                title={
                  <Paper elevation={Elevations.overlays} className="p-1">
                    Close stack of visuals
                  </Paper>
                }
              >
                <Button
                  data-id="close-layout-button"
                  onClick={() => {
                    if (stack.isMaximised) {
                      stack.toggleMaximise()
                    }
                    stack.remove()
                  }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </CloseOnClickTooltip>
            ) : null}
          </div>
        </>
      </div>
    </ExtensionPoints.providers>
  )
}
