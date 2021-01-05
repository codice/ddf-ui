import React, { useRef, useEffect, useState, MutableRefObject } from 'react'
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip'
import Paper from '@material-ui/core/Paper'
import { hot } from 'react-hot-loader'
import { Elevations } from '../theme/theme'

type OverflowTipType = {
  children: ({
    refOfThingToMeasure,
  }: {
    refOfThingToMeasure?: MutableRefObject<HTMLDivElement>
  }) => JSX.Element
  tooltipProps?: Partial<TooltipProps>
}

export type OverflowTooltipHTMLElement = HTMLDivElement & {
  overflowTooltip: {
    setOpen: (open: boolean) => void
  }
}

const OverflowTip = ({ children, tooltipProps }: OverflowTipType) => {
  // Create Ref
  const textElementRef = useRef<any>()
  const [open, setOpen] = React.useState(false)

  const compareSize = () => {
    if (textElementRef.current) {
      const compare =
        textElementRef.current.scrollWidth > textElementRef.current.clientWidth
      setIsOverflowed(compare)
    } else {
      console.warn(
        'WARNING: No element found to compare.  You must take in and set a ref (refOfThingToMeasure) on one of your elements so this knows when to display a tooltip.'
      )
    }
  }

  // compare once and add resize listener on "componentDidMount"
  useEffect(() => {
    compareSize()
    window.addEventListener('resize', compareSize)
  }, [])

  // remove resize listener again on "componentWillUnmount"
  useEffect(
    () => () => {
      window.removeEventListener('resize', compareSize)
    },
    []
  )

  React.useEffect(() => {
    // expose this ugly thing when no other way will work (autocompletes unfortunately)
    ;(textElementRef.current as OverflowTooltipHTMLElement).overflowTooltip = {
      setOpen: (open: boolean) => {
        if (isOverflowed) setOpen(open)
      },
    }
  }, [textElementRef.current])

  // Define state and function to update the value
  const [isOverflowed, setIsOverflowed] = useState(false)
  return (
    <Tooltip
      title={
        <Paper
          className="p-1 overflow-auto max-w-screen-sm"
          elevation={Elevations.overlays}
        >
          {children({})}
        </Paper>
      }
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      PopperProps={{
        className: '',
      }}
      disableHoverListener={!isOverflowed}
      disableFocusListener={!isOverflowed}
      {...tooltipProps}
    >
      {children({ refOfThingToMeasure: textElementRef })}
    </Tooltip>
  )
}

export default hot(module)(OverflowTip)
