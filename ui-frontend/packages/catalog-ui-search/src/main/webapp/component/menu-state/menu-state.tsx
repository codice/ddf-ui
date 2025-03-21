import { ButtonProps } from '@mui/material/Button'
import { PopoverActions, PopoverProps } from '@mui/material/Popover'
import * as React from 'react'

import debounce from 'lodash.debounce'

type Props = {
  /**
   * Why maxheight?  Well, we just want to be able to constrain popovers.  It also doesn't preclude the inside components from having am min height if they so desire.
   */
  maxHeight?: CSSStyleDeclaration['maxHeight']
}

/**
 * Normal refs don't cause a rerender, but often times we want that behavior when grabbing dom nodes and otherwise
 * https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
 */
export function useRerenderingRef<T>() {
  const [ref, setRef] = React.useState<T>()
  const rerenderingRef = React.useCallback(setRef, [])
  return {
    current: ref,
    ref: rerenderingRef,
  }
}

/**
 * Firefox and Chrome differ slightly in implementation.  If only one entry, firefox returns that instead of an array!
 */
const getBorderBoxSizeFromEntry = (entry: ResizeObserverEntry) => {
  const borderBoxSizeArray: ResizeObserverSize[] = []
  return borderBoxSizeArray.concat(entry.borderBoxSize)
}

const useListenForChildUpdates = ({
  popoverRef,
  action,
}: {
  popoverRef: HTMLDivElement | undefined
  action: React.MutableRefObject<PopoverActions | null>
}) => {
  React.useEffect(() => {
    let lastWidth = 0
    let lastHeight = 0
    /**
     * Width is less likely to change in popups, so we can react immediately
     */
    const widthCallback = (entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        for (let subentry of getBorderBoxSizeFromEntry(entry)) {
          if (subentry.inlineSize !== lastWidth) {
            lastWidth = subentry.inlineSize
            action.current?.updatePosition()
          }
        }
      }
    }
    /**
     * Height is very likely to change in popups, so we should react less immediately
     */
    const heightCallback = debounce((entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        for (let subentry of getBorderBoxSizeFromEntry(entry)) {
          if (subentry.blockSize !== lastHeight) {
            lastHeight = subentry.blockSize
            action.current?.updatePosition()
          }
        }
      }
    }, 300)
    let resizeObserver = new ResizeObserver((entries) => {
      widthCallback(entries)
      heightCallback(entries)
    })
    if (popoverRef) {
      const paperElement = popoverRef.querySelector(':scope > .MuiPaper-root')
      if (paperElement) {
        resizeObserver.observe(paperElement)
      }
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [action.current, popoverRef])
}

export function useMenuState({ maxHeight }: Props = {}) {
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const popoverRef = useRerenderingRef<HTMLDivElement>()
  const action = React.useRef<PopoverActions | null>(null)
  const [open, setOpen] = React.useState(false)
  useListenForChildUpdates({ popoverRef: popoverRef.current, action })
  const handleClick = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }
  return {
    anchorRef,
    open,
    handleClick,
    handleClose,
    /**
     * Handy prop bundles for passing to common components
     */
    dropdownProps: {
      open,
      handleClose,
    },
    MuiPopoverProps: {
      open,
      onClose: handleClose,
      anchorEl: anchorRef.current,
      action,
      ref: popoverRef.ref,
      ...POPOVER_DEFAULTS({ maxHeight }),
    } as Required<
      Pick<
        PopoverProps,
        | 'open'
        | 'onClose'
        | 'anchorEl'
        | 'TransitionProps'
        | 'anchorOrigin'
        | 'transformOrigin'
        | 'action'
        | 'ref'
      >
    >,
    MuiButtonProps: {
      ref: anchorRef as unknown as ButtonProps['ref'],
      onClick: handleClick,
    } as Required<Pick<ButtonProps, 'ref' | 'onClick'>>,
    buttonProps: {
      ref: anchorRef,
      onClick: handleClick,
    },
  }
}

export default useMenuState

export const POPOVER_DEFAULTS = ({ maxHeight }: Props = {}) => {
  return {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'center',
    },
    TransitionProps: {
      onEntered: (element) => {
        element.style.maxHeight =
          maxHeight || `calc(100% - ${element.style.top} - 10px)`
      },
    },
  } as Required<
    Pick<PopoverProps, 'anchorOrigin' | 'transformOrigin' | 'TransitionProps'>
  >
}

const MenuStateContext = React.createContext<ReturnType<typeof useMenuState>>(
  {} as ReturnType<typeof useMenuState>
)

export const MenuStateProvider = MenuStateContext.Provider

export function useMenuStateContext() {
  return React.useContext(MenuStateContext)
}
