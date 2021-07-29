/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react'
import { hot } from 'react-hot-loader'
import queryString from 'query-string'
import { useHistory, useLocation } from 'react-router-dom'
import { useMenuState, useRerenderingRef } from '../menu-state/menu-state'
import Popover from '@material-ui/core/Popover'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'
const _ = require('underscore')
const $ = require('jquery')
const CustomElements = require('../../js/CustomElements.js')

const zeroScale = 'matrix(0, 0, 0, 0, 0, 0)'
const zeroOpacity = '0'

// zeroScale to specifically to account for IE Edge Bug, see http://codepen.io/andrewkfiedler/pen/apBbxq
// zeroOpacity to account for how browsers work
function isEffectivelyHidden(element: any): boolean {
  if (element === document) {
    return false
  } else {
    const computedStyle = window.getComputedStyle(element)
    if (
      computedStyle.transform === zeroScale ||
      computedStyle.opacity === zeroOpacity
    ) {
      return true
    } else {
      return isEffectivelyHidden(element.parentNode)
    }
  }
}

// it'd be nice if we can use offsetParent directly, but that would require devs to be aware of how help.view works
function isOffsetParent(element: any) {
  return window.getComputedStyle(element).overflow !== 'visible'
}

function traverseAncestors(element: any, compareValue: any, extractValue: any) {
  let value = extractValue(element)
  element = element.parentNode
  while (element !== null && element !== document) {
    if (isOffsetParent(element)) {
      value = compareValue(value, extractValue(element))
    }
    element = element.parentNode
  }
  return value
}

function findHighestAncestorTop(element: any) {
  return traverseAncestors(
    element,
    (currentTop: any, proposedTop: any) => Math.max(currentTop, proposedTop),
    (element: any) => element.getBoundingClientRect().top
  )
}

function findHighestAncestorLeft(element: any) {
  return traverseAncestors(
    element,
    (currentLeft: any, proposedLeft: any) =>
      Math.max(currentLeft, proposedLeft),
    (element: any) => element.getBoundingClientRect().left
  )
}

function findLowestAncestorBottom(element: any) {
  return traverseAncestors(
    element,
    (currentBottom: any, proposedBottom: any) =>
      Math.min(currentBottom, proposedBottom),
    (element: any) => element.getBoundingClientRect().bottom
  )
}

function findLowestAncestorRight(element: any) {
  return traverseAncestors(
    element,
    (currentRight: any, proposedRight: any) =>
      Math.min(currentRight, proposedRight),
    (element: any) => element.getBoundingClientRect().right
  )
}

function findBlockers() {
  const blockingElements = $(
    CustomElements.getNamespace() + 'dropdown-companion.is-open'
  )
    .add(CustomElements.getNamespace() + 'menu-vertical.is-open')
    .add('.is-blocker')
  return _.map(blockingElements, (blockingElement: any) => ({
    boundingRect: blockingElement.getBoundingClientRect(),
    element: blockingElement,
  }))
}

function isBlocked(element: any, boundingRect: any) {
  //@ts-ignore
  return _.some(findBlockers(), (blocker: any) => {
    if (
      blocker.element !== element &&
      $(blocker.element).find(element).length === 0
    ) {
      const top = Math.max(blocker.boundingRect.top, boundingRect.top)
      const bottom = Math.min(blocker.boundingRect.bottom, boundingRect.bottom)
      const left = Math.max(blocker.boundingRect.left, boundingRect.left)
      const right = Math.min(blocker.boundingRect.right, boundingRect.right)
      const height = bottom - top
      const width = right - left
      if (height > 0 && width > 0) {
        return true
      }
    }
  })
}

let animationFrameId = -1

const paintHint = (element: HTMLElement): PaintedHintType | undefined => {
  if (isEffectivelyHidden(element)) {
    return undefined
  }
  const boundingRect = element.getBoundingClientRect()
  const top = Math.max(findHighestAncestorTop(element), boundingRect.top)
  const bottom = Math.min(
    findLowestAncestorBottom(element),
    boundingRect.bottom
  )
  const left = Math.max(findHighestAncestorLeft(element), boundingRect.left)
  const right = Math.min(findLowestAncestorRight(element), boundingRect.right)
  const height = bottom - top
  const width = right - left
  if (
    boundingRect.width > 0 &&
    height > 0 &&
    width > 0 &&
    !isBlocked(element, {
      top,
      bottom,
      left,
      right,
    })
  ) {
    return {
      height,
      width,
      top,
      left,
      text: element.getAttribute('data-help') || '',
      id: Math.random().toString(),
    }
  }
  return undefined
}

const startPaintingHints = (
  $elementsWithHints: any,
  attachElement: HTMLDivElement,
  setPaintedHints: (hints: PaintedHintType[]) => void
) => {
  window.cancelAnimationFrame(animationFrameId)
  paintHints($elementsWithHints, attachElement, [], setPaintedHints)
}

const paintHints = (
  $elementsWithHints: any,
  attachElement: HTMLDivElement,
  paintedHints: PaintedHintType[],
  setPaintedHints: (paintedHints: PaintedHintType[]) => void
) => {
  animationFrameId = window.requestAnimationFrame(() => {
    const elements = ($elementsWithHints.splice(
      0,
      4
    ) as unknown) as HTMLElement[]
    if (elements.length > 0) {
      const newHints = elements
        .map((element: HTMLElement) => {
          return paintHint(element)
        })
        .filter((hint) => hint !== undefined) as PaintedHintType[]
      const combinedValue = paintedHints.concat(newHints)
      setPaintedHints(combinedValue)
      paintHints(
        $elementsWithHints,
        attachElement,
        combinedValue,
        setPaintedHints
      )
    }
  })
}

const useCloseOnTyping = ({
  showHints,
  setShowHints,
}: {
  showHints: boolean
  setShowHints: (value: boolean) => void
}) => {
  React.useEffect(() => {
    const id = Math.random()
    $(window).on(`keydown.${id}`, (event: any) => {
      let code = event.keyCode
      if (event.charCode && code == 0) code = event.charCode
      switch (code) {
        case 27:
          // Escape
          setShowHints(false)
          break
        default:
          break
      }
    })
    return () => {
      $(window).off(`keydown.${id}`)
    }
  }, [showHints])
}

const useRerenderOnResize = () => {
  const [resizeRerender, setResizeRerender] = React.useState(Math.random())
  React.useEffect(() => {
    const id = Math.random()
    $(window).on(
      `resize.${id}`,
      _.debounce(() => {
        setResizeRerender(Math.random())
      }, 1000)
    )
    return () => {
      $(window).off(`resize.${id}`)
    }
  }, [])
  return resizeRerender
}

const usePaintHints = ({
  showHints,
  attachElement,
  setPaintedHints,
}: {
  showHints: boolean
  attachElement?: HTMLDivElement | null
  setPaintedHints: (hints: PaintedHintType[]) => void
}) => {
  const resizeRerender = useRerenderOnResize()
  React.useEffect(() => {
    if (showHints && attachElement) {
      let $elementsWithHints = $('[data-help]').not('.is-hidden [data-help]')
      $elementsWithHints = _.shuffle($elementsWithHints)
      startPaintingHints($elementsWithHints, attachElement, setPaintedHints)
    }
  }, [showHints, attachElement, resizeRerender])
}

type PaintedHintType = {
  width: number
  height: number
  top: number
  left: number
  text: string
  id: string
}

const HintsComponent = () => {
  const location = useLocation()
  const history = useHistory()
  const [showHints, setShowHints] = React.useState(false)
  const [paintedHints, setPaintedHints] = React.useState(
    [] as PaintedHintType[]
  )

  const attachRef = useRerenderingRef<HTMLDivElement | null>()

  const queryParams = queryString.parse(location.search)

  React.useEffect(() => {
    const openHelp = Boolean(queryParams['global-help'])
    if (openHelp) {
      setShowHints(true)
    } else {
      setShowHints(false)
    }
  })
  React.useEffect(() => {
    if (!showHints) {
      window.cancelAnimationFrame(animationFrameId)
      delete queryParams['global-help']
      history.push({
        pathname: location.pathname,
        search: `${queryString.stringify({
          ...queryParams,
        })}`,
      })
    }
  }, [showHints])

  usePaintHints({
    showHints,
    attachElement: attachRef.current,
    setPaintedHints,
  })

  useCloseOnTyping({ showHints, setShowHints })

  if (!showHints) {
    return null
  }

  return (
    <div
      className="help-component is-shown fixed left-0 top-0 h-full w-full bg-black opacity-50 z-50"
      onClick={() => {
        setShowHints(false)
      }}
    >
      <div className="help-hints" ref={attachRef.ref}>
        {paintedHints.map((paintedHint) => {
          return <PaintedHint key={paintedHint.id} {...paintedHint} />
        })}
      </div>
      <UntoggleElement setShowHints={setShowHints} />
    </div>
  )
}

const UntoggleElement = ({
  setShowHints,
}: {
  setShowHints: (val: boolean) => void
}) => {
  const [state, setState] = React.useState<DOMRect | undefined>()
  const resizeRerender = useRerenderOnResize()

  React.useEffect(() => {
    const untoggleElement = document.querySelector(
      '[data-id=sidebar-help-button]'
    )
    if (untoggleElement) {
      setState(untoggleElement.getBoundingClientRect())
    }
  }, [resizeRerender])
  if (state === undefined) {
    return null
  }
  const { width, height, top, left } = state
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setShowHints(false)
        }}
        className="absolute "
        style={{
          width,
          height,
          top,
          left,
          opacity: '.5',
        }}
      ></Button>
    </>
  )
}

const PaintedHint = ({ width, height, top, left, text }: PaintedHintType) => {
  const menuState = useMenuState()
  return (
    <>
      <Button
        className="absolute painted-hint"
        style={{
          width,
          height,
          top,
          left,
          opacity: '0.5',
        }}
        variant="contained"
        color="primary"
        {...menuState.MuiButtonProps}
        onClick={(e) => {
          e.stopPropagation()
          menuState.handleClick()
        }}
      ></Button>
      <Popover
        {...menuState.MuiPopoverProps}
        onClick={(e) => {
          e.stopPropagation()
          menuState.handleClose()
        }}
      >
        <Paper
          elevation={Elevations.overlays}
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="p-2"
        >
          {text}
        </Paper>
      </Popover>
    </>
  )
}

export default hot(module)(HintsComponent)
