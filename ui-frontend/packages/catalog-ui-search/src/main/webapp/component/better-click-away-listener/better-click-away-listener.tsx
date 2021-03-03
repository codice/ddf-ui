import * as React from 'react'
import ClickAwayListener, {
  ClickAwayListenerProps,
} from '@material-ui/core/ClickAwayListener'
import { Drawing } from '../singletons/drawing'

type BetterClickAwayListenerProps = ClickAwayListenerProps & {
  onClickAway: (event: React.MouseEvent<Document> | KeyboardEvent) => void
}

/**
 * Same as ClickAwayListener, but doesn't trigger onClickAway if the click was in a menu.  Also adds using escape to escape.
 * @param props
 */
export const BetterClickAwayListener = (
  props: BetterClickAwayListenerProps
) => {
  React.useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.keyCode === 27) {
        props.onClickAway(e)
      }
    }
    document.addEventListener('keyup', callback)
    return () => {
      document.removeEventListener('keyup', callback)
    }
  }, [])
  return (
    <ClickAwayListener
      {...props}
      onClickAway={(e) => {
        /**
         * Should we be doing a querySelectorAll and seeing if anything on the page contains the element?  I feel like this could fail in certain instances.
         */
        if (Drawing.isFuzzyDrawing()) {
          return
        }
        const dialog = document.querySelector('.MuiDialog-root')
        const menu = document.querySelector('#menu-')
        const probablyDropdown =
          document.querySelector(
            'div[style*="transform: translateX(calc((-50%"]'
          ) ||
          document.querySelector(
            'div[style*="transform: translateX(calc(-50%"]'
          )
        // needed for regular old selects
        if (
          document.activeElement &&
          document.activeElement.classList.contains('MuiListItem-root')
        ) {
          return
        }
        if (dialog && dialog.contains(e.target as HTMLBaseElement)) {
          return
        }
        if (menu && menu.contains(e.target as HTMLBaseElement)) {
          return
        }
        if (
          probablyDropdown &&
          probablyDropdown.contains(e.target as HTMLBaseElement)
        ) {
          return
        }
        if (props.onClickAway) props.onClickAway(e)
      }}
    />
  )
}
