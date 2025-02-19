import * as d3 from 'd3'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipProps } from './tooltip'
import {
  range,
  formatDate,
  dateWithinRange,
  convertToDisplayable,
  multiFormat,
} from './util'
import { useSelectionRange } from './hooks'
import _ from 'lodash'
import { Timescale } from './types'
import styled from 'styled-components'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { lighten } from 'polished'
import { readableColor } from 'polished'
import moment, { Moment } from 'moment-timezone'
// Constants
const AXIS_MARGIN = 20
const AXIS_HEIGHT = 15
// Color Theme
const ContextRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`
const HoverLineText = styled.text`
  fill: ${({ theme }) => readableColor(theme.backgroundContent)};
  font-family: 'Open Sans', sans-serif;
  pointer-events: none;
`
const HoverLine = styled.line`
  stroke: ${({ theme }) => theme.primaryColor};
  stroke-width: 3;
  pointer-events: none;
`
const MarkerHover = styled.g`
  :hover {
    cursor: ew-resize;
  }
`
const MarkerLine = styled.line<{
  hidden?: boolean
}>`
  stroke: ${(props: any) =>
    !props.hidden
      ? lighten(0.1, props.theme.primaryColor)
      : 'rgba(0, 0, 0, 0)'};
  stroke-width: ${(props: any) => (!props.hidden ? 2 : 18)};
`
const TimelineButton = styled(Button)<{
  icon?: boolean
  color?: string
}>`
  display: flex;
  justify-content: center;
  font-family: 'Open Sans', sans-serif;
  min-width: 3rem;
  height: 3rem;

  ${({ icon }) =>
    !icon &&
    `
      font-size: 1rem;
      padding: 0px 20px;
      margin-left: 15px !important;
    `} :hover {
  }

  :focus {
    outline: none;
  }
`
const DateAttributeSelect = styled(Select)<{
  visible?: boolean
}>`
  margin: 10px;
  visibility: ${(props: any) => (props.visible ? 'visible' : 'hidden')};
`
const ButtonArea = styled.div`
  margin: 10px;
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;

  button {
    margin-left: 5px;
  }
`
const Root = styled.div`
  display: flex;
  flex-direction: column;

  .brushBar {
    /* This will let you select/hover records behind area, but can't brush-drag area if it's set. */
    pointer-events: none;
    opacity: 0.5;

    /* If it's discovered that brush dragging is wanted more than hovering behind the highlighted brush area, 
    simply comment the above lines and uncomment this opacity */
    /* opacity: 0.1; */
    fill: ${({ theme }) => theme.primaryColor};
    display: none;

    :hover {
      cursor: move;
      fill: ${({ theme }) => theme.primaryColor};
      opacity: 0.5;
    }
  }

  .axis {
    color: ${({ theme }) => readableColor(theme.backgroundContent)};
    font-size: 0.9rem;
    :hover {
      cursor: ew-resize;
    }
  }

  .selected {
    fill: ${({ theme }) => theme.primaryColor} !important;
  }

  .data {
    fill: ${({ theme: { theme } }) =>
      theme === 'dark' ? lighten(0.7, 'black') : lighten(0.3, 'black')};
    fill-opacity: 0.7;
    :hover {
      stroke-width: 2px;
      stroke: ${({ theme }) => theme.primaryColor};
    }
  }
`
const TimeText = styled.div`
  margin: 10px;
  font-family: 'Open Sans', sans-serif;
  text-align: center;

  br {
    line-height: 150%;
  }
`
const Message = styled.span`
  font-family: 'Open Sans', sans-serif;
  margin: 10px;
  color: ${({ theme }) => readableColor(theme.backgroundContent)};
`
// Helper Methods
const generateTooltipMessage = (data: string[]) => {
  const titles = data.slice(0, 5).map((d) => {
    return (
      <React.Fragment>
        <span>{d}</span>
        <br />
      </React.Fragment>
    )
  })
  const otherResults = (
    <React.Fragment>
      <br />
      {`+${data.length - 5} other results`}
    </React.Fragment>
  )
  return (
    <React.Fragment>
      {titles}
      {data.length > 5 && otherResults}
    </React.Fragment>
  )
}
/**
 * Given a d3 selection, set the display to none.
 */
const hideElement = (element: d3.Selection<null, unknown, null, undefined>) =>
  element.attr('style', 'display: none')
/**
 * Given a d3 selection, set the display to block.
 */
const showElement = (element: d3.Selection<null, unknown, null, undefined>) =>
  element.attr('style', 'display: block')
/**
 * Domain is the minimum and maximum values that the scale contains.
 */
const getTimescaleFromWidth = (
  width: number,
  min: Moment = moment('1980-01-01:00:00.000z'),
  max: Moment = moment()
): Timescale => {
  const timeScale = d3.scaleUtc().domain([min, max]).nice()
  timeScale.range([AXIS_MARGIN, width - AXIS_MARGIN])
  return timeScale
}
const getPossibleDateAttributes = (timelineItems: TimelineItem[]): string[] => {
  return _(timelineItems)
    .map((d) => d.attributes) //{created: {display: "Created", value: new Date()}}
    .flatMap((o) => Object.keys(o)) //[created]
    .uniq()
    .value()
}
// Types
export type TimelineItem = {
  id: string
  selected: boolean
  data?: any
  attributes: {
    [key: string]: Moment[]
  }
}
type Bucket = {
  x1: number
  x2: number
  selected: boolean
  items: TimelineItem[]
}
export interface TimelineProps {
  /**
   * Height in pixels.
   */
  height: number
  /**
   * Mode that the timeline should be in.
   */
  mode?: 'single' | 'range'
  /**
   * Timezone to use when displaying times.
   */
  timezone: string
  /**
   * Date format to use when displaying times.
   */
  format: string
  /**
   * TimelineItem points
   */
  data?: TimelineItem[]
  /**
   * Alias Map for date attributes
   */
  dateAttributeAliases?: {
    [key: string]: string
  }
  /**
   * Called when the done button is clicked, providing the current selection range.
   */
  onDone?: (selectionRange: Moment[]) => void
  /**
   * Called when the a selection is made.
   */
  onSelect?: (data: TimelineItem[]) => void
  /**
   * Render function for tooltips
   */
  renderTooltip?: (data: TimelineItem[]) => any
  /**
   * Height offset to combat issues with dynamic heights when rendering the timeline.
   */
  heightOffset?: number
  /**
   * Called when a date is copied to the clipboard.
   */
  onCopy?: (copiedValue: string) => void
  /**
   * Minimum date bounds to render items between.
   */
  min?: Moment
  /**
   * Maximum date bounds to render items between.
   */
  max?: Moment
}
/*
 * TODOS
 * --------------------
 *
 * 1. On hover should work when the on hover is behind the area marker while still letting you brush drag (if possible)
 */
// Please see https://alignedleft.com/tutorials/d3/scales for more information about d3 scales.
export const Timeline = (props: TimelineProps) => {
  /**
   * The useRef Hook creates a variable that "holds on" to a value across rendering
   * passes. In this case it will hold our component's SVG DOM element. It's
   * initialized null and React will assign it later (see the return statement)
   */
  const rootRef = useRef(null)
  const d3ContainerRef = useRef(null)
  const hoverLineRef = useRef(null)
  const hoverLineTextRef = useRef(null)
  const leftMarkerRef = useRef(null)
  const rightMarkerRef = useRef(null)
  const brushBarRef = useRef(null)
  const { min, max } = props
  const [width, setWidth] = useState(0)
  const height = props.height
  const heightOffset = props.heightOffset ? props.heightOffset : 0
  const possibleDateAttributes = getPossibleDateAttributes(props.data || [])
  const timescale = getTimescaleFromWidth(width, min, max)
  const [xScale, setXScale] = useState(() => timescale)
  const [xAxis, setXAxis] = useState(() =>
    d3.axisBottom(xScale).tickSize(AXIS_HEIGHT).tickFormat(multiFormat)
  )
  const [dataBuckets, setDataBuckets] = useState<Bucket[]>([])
  const [tooltip, setTooltip] = useState<TooltipProps | null>()
  const [selectedDateAttribute, setSelectedDateAttribute] = useState('')
  useEffect(() => {
    if (selectedDateAttribute === '' && possibleDateAttributes.length > 0) {
      setSelectedDateAttribute(possibleDateAttributes[0])
    }
  }, [possibleDateAttributes])
  const [isDragging, setIsDragging] = useState(false)
  const [selectionRange, setSelectionRange] = useSelectionRange([], timescale)
  useEffect(() => {
    if (width != 0) {
      console.debug(`Width updated to ${width}`)
      setXScale(() => timescale)
    }
  }, [width])
  useEffect(() => {
    console.debug(`xScale updated to ${xScale.range()}`)
    const [left, right] = xScale.range()
    if (left < right) {
      const newXAxis = xAxis.scale(xScale)
      setXAxis(() => newXAxis)
      d3.select('.axis--x').call(newXAxis as any)
    }
  }, [xScale, props.timezone, props.format])
  useEffect(() => {
    if (rootRef.current) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      const rect = rootRef.current.getBoundingClientRect()
      setWidth(rect.width)
    }
  }, [rootRef])
  /**
   * Every 100 ms, poll to see the new parent rect width.
   * If the new parent rect width is different than current width, update the width.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (rootRef.current) {
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        const rect = rootRef.current.getBoundingClientRect()
        if (rect.width !== width) {
          setWidth(rect.width)
          clearInterval(interval)
        }
      }
    }, 100)
  }, [rootRef, width])
  useEffect(() => {
    zoomBehavior.scaleTo(
      d3.select(d3ContainerRef.current).transition().duration(0) as any,
      1
    )
  }, [width])
  const markerHeight = height - 70 - AXIS_HEIGHT - heightOffset
  /**
   * When a zoom event is triggered, use the transform event to create a new xScale,
   * then create a new xAxis using the scale and update existing xAxis
   */
  const handleZoom = (event: any) => {
    // Tooltip sticks around without this.
    setTooltip(null)
    const transform = event.transform
    if (width != 0) {
      const newXScale = transform.rescaleX(timescale)
      setXScale(() => newXScale)
      const newXAxis = xAxis.scale(newXScale)
      setXAxis(() => newXAxis)
      // Apply the new xAxis
      d3.select('.axis--x').call(xAxis as any)
    }
  }
  const zoomBehavior = d3
    .zoom()
    .scaleExtent([1, 24 * 60 * 60])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .extent([
      [0, 0],
      [width, height],
    ])
    .filter((event: any) => {
      // Allow wheel events, on axis or not
      if (event.type === 'wheel') {
        return true
      }

      // Check if event is on axis
      const clickedOnAxis = event.target.closest('#axis') !== null
      console.debug('Clicked On Axis: ', clickedOnAxis)

      // Block all pan behavior if not clicking on axis (we are brushing instead)
      return clickedOnAxis
    })
    .on('zoom', handleZoom)
  const zoomIn = () => {
    zoomBehavior.scaleBy(
      d3.select(d3ContainerRef.current).transition().duration(750) as any,
      2
    )
  }
  const zoomOut = () => {
    zoomBehavior.scaleBy(
      d3.select(d3ContainerRef.current).transition().duration(750) as any,
      0.5
    )
  }
  useEffect(() => {
    /**
     * Range is the range of possible output values used in display.
     * Domain maps to Range
     * i.e. Dates map to Pixels
     */
    const renderInitialXAxis = () => {
      const svg = d3
        .select(d3ContainerRef.current)
        .attr('width', width)
        .attr('height', height)
      svg
        .select('.axis--x')
        .attr(
          'transform',
          `translate(0 ${height - (AXIS_MARGIN + AXIS_HEIGHT + heightOffset)})`
        )
        .call(xAxis as any)
    }
    if (d3ContainerRef.current) {
      renderInitialXAxis()
      const container = d3.select(d3ContainerRef.current)
      container.call(zoomBehavior as any)
    }
  }, [height, width])
  // Add mouse handlers to listen to d3 mouse events
  useEffect(() => {
    d3.select(d3ContainerRef.current).on('mousemove', (event: any) => {
      const coord = d3.pointer(event)
      d3.select(hoverLineRef.current)
        .attr('transform', `translate(${coord[0]}, ${markerHeight})`)
        .attr('style', 'display: block')
      const hoverDate = moment.tz(xScale.invert(coord[0]), props.timezone)
      const formattedDate = formatDate(hoverDate, props.format)
      const widthBuffer = 150
      const maxX = width - widthBuffer
      let xPos = coord[0]
      if (xPos < widthBuffer) xPos = widthBuffer
      if (xPos > maxX) xPos = maxX
      const yPos = 20
      d3.select(hoverLineTextRef.current)
        .attr('transform', `translate(${xPos}, ${yPos})`)
        .attr('style', 'display: block')
        .attr('text-anchor', 'middle')
        .text(formattedDate)
    })
    // When the d3Container mouseleave event triggers, set the hoverValue to null and hide the hoverLine line
    d3.select(d3ContainerRef.current).on('mouseleave', function () {
      hideElement(d3.select(hoverLineRef.current))
      hideElement(d3.select(hoverLineTextRef.current))
    })
  }, [xScale, props.timezone, props.format, props.height])
  // Render rectangles
  useEffect(() => {
    const min = xScale.range()[0]
    const max = xScale.range()[1]
    const NUM_BUCKETS = Math.round(width / 30) // 30 is just a constant that I found to look good.
    const bucketWidth = (max - min) / NUM_BUCKETS
    const buckets: Bucket[] = range(NUM_BUCKETS).map((i) => ({
      x1: min + bucketWidth * i,
      x2: min + bucketWidth * (i + 1),
      items: [],
      selected: false,
    }))
    if (props.data && selectedDateAttribute !== undefined) {
      d3.selectAll('.data').remove()
      props.data.forEach((d) => {
        const date = d.attributes[selectedDateAttribute!]
        if (date == null) {
          return
        }
        const scaledDates = date.map((d) => xScale(d))
        scaledDates.forEach((scaledDate) => {
          for (let i = 0; i < buckets.length; i++) {
            const b = buckets[i]
            if (b.x1 < scaledDate && scaledDate < b.x2) {
              b.items.push(d)
              if (d.selected) {
                b.selected = true
              }
              break
            }
          }
        })
      })
      const mostItemsInABucket = Math.max(...buckets.map((b) => b.items.length))
      const heightPerItem = (height - (heightOffset + 75)) / mostItemsInABucket
      setDataBuckets(buckets)
      buckets.forEach((b, i) => {
        const rectangleHeight = b.items.length * heightPerItem
        const x = (b.x1 + b.x2) / 2 - 15
        const y =
          height - rectangleHeight - (AXIS_MARGIN + AXIS_HEIGHT + heightOffset)
        d3.select('.data-holder')
          .append('rect')
          .attr('class', `data ${b.selected ? 'selected' : ''}`)
          .attr('width', bucketWidth - 5)
          .attr('height', rectangleHeight)
          .attr('id', i)
          .attr('transform', `translate(${x}, ${y})`)
          .append('rect')
      })
    }
  }, [props.data, xScale, selectedDateAttribute, width, height])
  useEffect(() => {
    d3.select('.data-holder')
      .selectAll('.data')
      .on('mouseleave', () => {
        setTooltip(null)
      })
      .on('mousemove', (event: any) => {
        const id = (event.target as any).id
        const x = event.offsetX
        const y = event.offsetY
        const tooltipInBounds = x <= width * 0.75
        setTooltip({
          x: tooltipInBounds ? x + 25 : x - width * 0.25, // handles tooltip going off screen
          y: y - 20,
          message: props.renderTooltip
            ? props.renderTooltip(dataBuckets[id].items)
            : generateTooltipMessage(dataBuckets[id].items.map((d) => d.id)),
        })
      })
  }, [dataBuckets])
  // If dragging is finished, update selected results.
  useEffect(() => {
    if (
      !isDragging &&
      props.data &&
      selectedDateAttribute !== undefined &&
      !props.mode
    ) {
      if (selectionRange.length == 2) {
        const x1 = xScale(selectionRange[0])
        const x2 = xScale(selectionRange[1])
        // Prefilter to only buckets we care about
        const bucketsContainingRelevantData = dataBuckets.filter(
          (b) =>
            (x1 < b.x1 && b.x2 < x2) ||
            (b.x1 < x1 && x1 < b.x2) ||
            (b.x1 < x2 && x2 < b.x2)
        )
        // Get the data inside those buckets that falls within the selection
        const dataToSelect = _.flatMap(
          bucketsContainingRelevantData,
          (b) => b.items
        ).filter((d) =>
          d.attributes[selectedDateAttribute!].some((moment) =>
            dateWithinRange(moment, selectionRange)
          )
        )
        props.onSelect && props.onSelect(dataToSelect)
      }
    }
  }, [isDragging])
  useEffect(() => {
    /**
     * Selection Drag does two things:
     * 1. When the user drags across the timeline, a range selection will be created.
     * 2. If the drag event is only 5 pixels or less from start to finish AND ends on a rect object,
     * assume that the user meant to click instead of drag, and properly trigger a click action on the rect.
     */
    const getSelectionDrag = () => {
      let clickStart: number
      return d3
        .drag()
        .filter((event: any) => {
          // block events if they're on the axis
          const clickedOnAxis = event.target.closest('#axis') !== null
          console.debug('Clicked On Axis: ', clickedOnAxis)

          // Allow all events not on the axis
          return !clickedOnAxis
        })
        .on('start', (event) => {
          clickStart = event.x
          const newLeftDate = moment.tz(
            xScale.invert(clickStart),
            props.timezone
          )
          if (props.mode === 'single') {
            setSelectionRange([newLeftDate])
          } else {
            setIsDragging(true)
            hideElement(d3.select(hoverLineRef.current))
            hideElement(d3.select(hoverLineTextRef.current))
            setSelectionRange([newLeftDate])
          }
        })
        .on('drag', (event: any) => {
          if (props.mode !== 'single') {
            const diff = event.x - event.subject.x
            const initialDate = moment.tz(
              xScale.invert(clickStart),
              props.timezone
            )
            let dragCurrent = clickStart + diff
            const dragDate = moment.tz(
              xScale.invert(dragCurrent),
              props.timezone
            )
            if (diff > 0) {
              setSelectionRange([initialDate, dragDate])
            } else {
              setSelectionRange([dragDate, initialDate])
            }
          }
        })
        .on('end', (event) => {
          if (!props.mode) {
            showElement(d3.select(hoverLineRef.current))
            setIsDragging(false)
            const clickDistance = clickStart - event.x
            const sourceEvent = event.sourceEvent
            if (Math.abs(clickDistance) < 5) {
              const nodeName = sourceEvent.target.nodeName
              setSelectionRange([])
              if (nodeName === 'rect' || nodeName === 'line') {
                const x = event.x
                const bucket = dataBuckets.find((b) => b.x1 < x && x <= b.x2)
                bucket && props.onSelect && props.onSelect(bucket.items)
              }
            }
          }
        })
    }

    // Apply drag behavior to both the overlay and data-holder
    d3.select(d3ContainerRef.current)
      .select('.brush-overlay')
      .call(getSelectionDrag() as any)

    d3.select(d3ContainerRef.current)
      .select('.data-holder')
      .call(getSelectionDrag() as any)
  }, [dataBuckets, selectionRange, xScale, props.timezone, props.format])
  useEffect(() => {
    /**
     * Creates the drag behavior used when selecting the left or right slider.
     *
     * Validation for sliders:
     * - Left slider cannot be within 10 pixels of the right slider.
     * - Right slider cannot be within 10 pixels of the left slider.
     *
     * @param slider - Which slider the drag behavior should affect.
     */
    const getEdgeDrag = (slider: 'LEFT' | 'RIGHT') =>
      d3
        .drag()
        .on('start', () => {
          hideElement(d3.select(hoverLineRef.current))
          hideElement(d3.select(hoverLineTextRef.current))
          setIsDragging(true)
        })
        .on('end', () => setIsDragging(false))
        .on('drag', (event: any) => {
          const dragValue = xScale.invert(event.x)
          const dateWithTimezone = moment.tz(dragValue, props.timezone)
          const BUFFER = 10 // Buffer in pixels to keep sliders from overlapping/crossing
          if (slider === 'LEFT') {
            const maximumX = xScale(selectionRange[1]) - BUFFER
            if (event.x <= maximumX) {
              setSelectionRange([dateWithTimezone, selectionRange[1]])
            }
          } else if (slider === 'RIGHT') {
            const minimumX = xScale(selectionRange[0]) + BUFFER
            if (event.x >= minimumX) {
              setSelectionRange([selectionRange[0], dateWithTimezone])
            }
          }
        }) as any
    d3.select(leftMarkerRef.current).call(getEdgeDrag('LEFT'))
    d3.select(rightMarkerRef.current).call(getEdgeDrag('RIGHT'))
  }, [xScale, selectionRange, props.timezone])
  useEffect(() => {
    /**
     * Create the drag behavior used when selecting the middle area between a range.
     *
     * NOTE: This will not be used if .brushBar class has 'pointer-events: none' set, as the events will never be hit.
     */
    const getBrushDrag = () =>
      d3
        .drag()
        .on('start', () => {
          setIsDragging(true)
          hideElement(d3.select(hoverLineRef.current))
          hideElement(d3.select(hoverLineTextRef.current))
        })
        .on('end', () => setIsDragging(false))
        .on('drag', (event: any) => {
          const value = event.x - event.subject.x
          const currentLeft = xScale(selectionRange[0])
          const currentRight = xScale(selectionRange[1])
          const newLeft = currentLeft + value
          const newRight = currentRight + value
          const newLeftDate = moment.tz(xScale.invert(newLeft), props.timezone)
          const newRightDate = moment.tz(
            xScale.invert(newRight),
            props.timezone
          )
          setSelectionRange([newLeftDate, newRightDate])
        }) as any
    d3.select(brushBarRef.current).call(getBrushDrag())
  }, [xScale, selectionRange, props.timezone])
  // When the selection range is changed or the scale changes update the left, right, and brush markers
  useEffect(() => {
    if (
      leftMarkerRef.current &&
      rightMarkerRef.current &&
      brushBarRef.current
    ) {
      const leftMarker = d3.select(leftMarkerRef.current)
      const rightMarker = d3.select(rightMarkerRef.current)
      const brushBar = d3.select(brushBarRef.current)
      if (props.mode === 'single' && selectionRange.length === 1) {
        const leftMarker = d3.select(leftMarkerRef.current)
        const leftValue = selectionRange[0]
        leftMarker
          .attr('transform', `translate(${xScale(leftValue)}, ${markerHeight})`)
          .attr('style', 'display: block')
      } else if (props.mode !== 'single' && selectionRange.length == 2) {
        const [leftValue, rightValue] = selectionRange
        leftMarker
          .attr('transform', `translate(${xScale(leftValue)}, ${markerHeight})`)
          .attr('style', 'display: block')
        rightMarker
          .attr(
            'transform',
            `translate(${xScale(rightValue)}, ${markerHeight})`
          )
          .attr('style', 'display: block')
        brushBar
          .attr('transform', `translate(${xScale(leftValue)},${markerHeight})`)
          .attr('width', xScale(rightValue) - xScale(leftValue))
          .attr('height', '50')
          .attr('style', 'display: block')
      } else {
        hideElement(leftMarker as any)
        hideElement(rightMarker as any)
        hideElement(brushBar as any)
      }
    }
  }, [xScale, selectionRange, props.mode, props.height, props.timezone])
  const renderCopyableDate = (date: Moment) => {
    const formattedDate = convertToDisplayable(
      date,
      props.timezone,
      props.format
    )
    return (
      <>
        <br />
        <Button
          variant="contained"
          onClick={() => {
            const hiddenTextArea = document.createElement('textarea')
            hiddenTextArea.innerText = formattedDate
            document.body.appendChild(hiddenTextArea)
            hiddenTextArea.select()
            document.execCommand('copy')
            document.body.removeChild(hiddenTextArea)
            props.onCopy && props.onCopy(formattedDate)
          }}
        >
          {formattedDate}
        </Button>
      </>
    )
  }
  const renderContext = () => {
    const renderStartAndEnd = () => (
      <React.Fragment>
        <TimeText>
          <b>Start</b>
          {selectionRange[0] && renderCopyableDate(selectionRange[0])}
        </TimeText>
        <TimeText>
          <b>End</b>
          {selectionRange[1] && renderCopyableDate(selectionRange[1])}
        </TimeText>
      </React.Fragment>
    )
    // Single States - Empty, Single Time
    if (props.mode === 'single') {
      if (!selectionRange[0]) {
        return (
          <Message>Click to select a time. Zoom with the scroll wheel.</Message>
        )
      }
      return (
        <TimeText>
          <b>Time</b>
          {selectionRange[0] && renderCopyableDate(selectionRange[0])}
        </TimeText>
      )
      // Range States - Empty, Range of Times
    } else if (props.mode === 'range') {
      if (!selectionRange[0]) {
        return (
          <Message>Drag to select a range. Zoom with the scroll wheel.</Message>
        )
      }
      return renderStartAndEnd()
      // Selection States - Empty, Start Time, Start + End Times
    } else {
      if (!selectionRange[0]) {
        return (
          <Message>
            Click to select a cluster of results. Zoom with the scroll wheel.
          </Message>
        )
      }
      return renderStartAndEnd()
    }
  }
  const lookupAlias = (attribute: string) => {
    const { dateAttributeAliases } = props
    if (dateAttributeAliases && dateAttributeAliases[attribute]) {
      return dateAttributeAliases[attribute]
    } else {
      return attribute
    }
  }
  return (
    <Root ref={rootRef} style={{ height: '100%' }}>
      <div>
        <DateAttributeSelect
          visible={props.data && props.data!.length > 0}
          variant="outlined"
          onChange={(e: any) => setSelectedDateAttribute(e.target.value)}
          value={selectedDateAttribute}
        >
          {possibleDateAttributes.map((dateAttribute: string) => (
            <MenuItem value={dateAttribute}>
              {lookupAlias(dateAttribute)}
            </MenuItem>
          ))}
        </DateAttributeSelect>
      </div>
      {tooltip && (
        <Tooltip message={tooltip.message} x={tooltip.x} y={tooltip.y} />
      )}
      <svg ref={d3ContainerRef}>
        <rect
          className="brush-overlay"
          x={AXIS_MARGIN}
          y={0}
          width={width - 2 * AXIS_MARGIN}
          height={height - (AXIS_MARGIN + AXIS_HEIGHT + heightOffset)}
          fill="transparent"
        />
        <g className="data-holder" />

        <rect ref={brushBarRef} className="brushBar" />

        <g ref={hoverLineRef} style={{ display: 'none' }}>
          <HoverLine x1="0" y1="0" x2="0" y2="50" />
        </g>

        <HoverLineText
          x="0"
          y="0"
          style={{ display: 'none' }}
          ref={hoverLineTextRef}
        />

        <MarkerHover ref={leftMarkerRef}>
          <MarkerLine x1="0" y1="0" x2="0" y2="50" />
          <MarkerLine x1="0" y1="0" x2="0" y2="50" hidden={true} />
        </MarkerHover>
        <MarkerHover ref={rightMarkerRef}>
          <MarkerLine x1="0" y1="0" x2="0" y2="50" />
          <MarkerLine x1="0" y1="0" x2="0" y2="50" hidden={true} />
        </MarkerHover>

        <g className="axis axis--x" id="axis">
          <rect
            width={width}
            height={AXIS_HEIGHT + AXIS_MARGIN}
            fillOpacity="0"
            fill="black"
          />
        </g>
      </svg>
      <ContextRow>
        {renderContext()}
        <ButtonArea>
          <TimelineButton variant="contained" onClick={() => zoomOut()} icon>
            -
          </TimelineButton>
          <TimelineButton variant="contained" onClick={() => zoomIn()} icon>
            +
          </TimelineButton>
          {props.onDone && props.mode && (
            <TimelineButton
              color="primary"
              variant="contained"
              onClick={() => {
                props.onDone && props.onDone(selectionRange)
                setSelectionRange([])
              }}
            >
              Done
            </TimelineButton>
          )}
        </ButtonArea>
      </ContextRow>
    </Root>
  )
}
export default Timeline
