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
const OverflowTip = ({ children, tooltipProps }: OverflowTipType) => {
  // Create Ref
  const textElementRef = useRef<any>()

  const compareSize = () => {
    if (textElementRef.current) {
      const compare =
        textElementRef.current.scrollWidth > textElementRef.current.clientWidth
      console.log('compare: ', compare)
      setIsOverflowed(compare)
    } else {
      console.log(
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
