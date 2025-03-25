import { ButtonProps } from '@mui/material/Button'
import { PopoverActions, PopoverProps } from '@mui/material/Popover'
import Paper from '@mui/material/Paper'
import * as React from 'react'

import debounce from 'lodash.debounce'
import { Elevations } from '../theme/theme'

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

interface MenuStateContextType {
  handleClose: () => void
  handleCascadeClose: () => void
  parentMenuStateContext?: MenuStateContextType | null
}

/**
 *  Notice we do not export this, as we want full control over parentMenuStateContext in order to make the dev experience smooth.
 *  Devs should be using the provider instance that gets returned with useMenuState.
 */
const MenuStateContext = React.createContext<MenuStateContextType>({
  handleClose: () => {
    console.warn(
      `No menu state context found, check to make sure you're wrapping the component with the menu state provider.  This handleClose call will be a noop.`
    )
  },
  handleCascadeClose: () => {
    console.warn(
      `No menu state context found, check to make sure you're wrapping the component with the menu state provider.  This handleCascadeClose call will be a noop.`
    )
  },
})

export function useMenuStateContext() {
  const menuState = React.useContext(MenuStateContext)
  return menuState
}

export function useMenuState({ maxHeight }: Props = {}) {
  const parentMenuStateContext = useMenuStateContext()
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const popoverRef = useRerenderingRef<HTMLDivElement>()
  const action = React.useRef<PopoverActions | null>(null)
  const [open, setOpen] = React.useState(false)
  useListenForChildUpdates({ popoverRef: popoverRef.current, action })
  const handleClick = React.useCallback(() => {
    setOpen((currentValue) => {
      return !currentValue
    })
  }, [])

  const handleClose = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleCascadeClose = React.useCallback(() => {
    handleClose()
    if (parentMenuStateContext.parentMenuStateContext) {
      parentMenuStateContext.handleCascadeClose()
    }
  }, [])

  // preconstruct this for convenience
  const MenuStateProviderInstance = React.useMemo(() => {
    return ({ children }: { children: React.ReactNode }) => {
      return (
        <MenuStateContext.Provider
          value={{
            handleClose,
            handleCascadeClose,
            parentMenuStateContext,
          }}
        >
          {children}
        </MenuStateContext.Provider>
      )
    }
  }, [])

  // if the MuiPopover props get used, then the children will automatically get access to the menustate
  const MuiPopoverMenuStateProviderInstance = React.useMemo(() => {
    return React.forwardRef<HTMLDivElement>((props, ref) => {
      return (
        <MenuStateProviderInstance>
          <Paper {...props} ref={ref} elevation={Elevations.overlays}></Paper>
        </MenuStateProviderInstance>
      )
    })
  }, [])

  const menuState = {
    anchorRef,
    open,
    handleClick,
    handleClose,
    /**
     *  For menus that are nested within other menus, this will ripple up the menu tree and close parent menus
     */
    handleCascadeClose,
    // these can also be used directly with the MuiPopper if desired
    MuiPopoverProps: {
      open,
      onClose: handleClose,
      anchorEl: anchorRef.current,
      action,
      ref: popoverRef.ref,
      ...POPOVER_DEFAULTS({ maxHeight }),
      slotProps: {
        paper: {
          component: MuiPopoverMenuStateProviderInstance,
        },
      },
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
        | 'slotProps'
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
    MenuStateProviderInstance,
  }

  return menuState
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
