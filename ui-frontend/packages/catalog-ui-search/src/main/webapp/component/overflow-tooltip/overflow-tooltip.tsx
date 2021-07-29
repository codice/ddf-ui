import React, { useRef, useEffect } from 'react'
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip'
import Paper from '@material-ui/core/Paper'
import { hot } from 'react-hot-loader'
import { Elevations } from '../theme/theme'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
const wreqr = require('../../js/wreqr.js')

type OverflowTipType = {
  children: React.ReactNode
  tooltipProps?: Partial<TooltipProps>
  refOfThingToMeasure?: HTMLDivElement | null
  className?: string
}

export type OverflowTooltipHTMLElement = HTMLDivElement & {
  overflowTooltip: {
    setOpen: (open: boolean) => void
  }
}

function areDescendentsTruncated(element?: Element): boolean {
  if (!element) {
    return false
  }
  /**
   * Why 1 and not 0?  Well, in writing mode vertical, there is a discrepancy of 1.
   */
  if (Math.abs(element.scrollWidth - element.clientWidth) > 1) {
    return true
  }
  if (element.children) {
    for (let i = 0; i < element.children.length; i++) {
      let hasTruncatedDescendent = areDescendentsTruncated(element.children[i])
      if (hasTruncatedDescendent) {
        return hasTruncatedDescendent
      }
    }
  }
  return false
}

export function useIsTruncated<T extends HTMLElement>(
  passedInRef: T | null = null
) {
  const [isTruncated, setIsTruncated] = React.useState(false)
  const ref = useRef<T | null>(passedInRef)
  const compareSizeRef = useRef<() => void>(() => {})
  const { listenTo, stopListening } = useBackbone()
  useEffect(() => {
    const compareSize = () => {
      if (ref.current) {
        setIsTruncated(areDescendentsTruncated(ref.current))
      }
    }
    compareSizeRef.current = compareSize
    if (ref.current) {
      compareSize()
      listenTo(wreqr.vent, 'resize', compareSize)
      window.addEventListener('resize', compareSize)
      ref.current.addEventListener('mouseenter', compareSize)
    } else {
      console.warn(
        'WARNING: No element found to compare.  You must take in and set a ref (refOfThingToMeasure) on one of your elements so this knows when to display a tooltip.'
      )
    }
    return () => {
      stopListening(wreqr.vent, 'resize', compareSize)
      window.removeEventListener('resize', compareSize)
      ref.current?.removeEventListener('mouseenter', compareSize)
    }
  })
  return {
    isTruncated,
    ref,
    compareSize: compareSizeRef,
  }
}

const OverflowTip = ({
  children,
  tooltipProps = {},
  refOfThingToMeasure: refOfThingToMeasurePassedIn,
  className,
}: OverflowTipType) => {
  const { title, ...otherTooltipProps } = tooltipProps
  const [open, setOpen] = React.useState(false)
  const isTruncatedState = useIsTruncated(refOfThingToMeasurePassedIn)

  React.useEffect(() => {
    // expose this ugly thing when no other way will work (autocompletes unfortunately)
    ;(isTruncatedState.ref
      .current as OverflowTooltipHTMLElement).overflowTooltip = {
      setOpen: (open: boolean) => {
        if (isTruncatedState.isTruncated) setOpen(open)
      },
    }
  }, [isTruncatedState.ref.current])

  return (
    <Tooltip
      title={
        <Paper
          className="p-1 overflow-auto max-w-screen-sm"
          elevation={Elevations.overlays}
        >
          {title ? title : children}
        </Paper>
      }
      open={open}
      onOpen={() => {
        if (isTruncatedState.isTruncated) {
          setOpen(true)
        }
      }}
      onClose={() => {
        setOpen(false)
      }}
      PopperProps={{
        className: '',
      }}
      {...otherTooltipProps}
    >
      <div ref={isTruncatedState.ref} className={className}>
        {children}
      </div>
    </Tooltip>
  )
}

export default hot(module)(OverflowTip)
