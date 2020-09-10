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
import styled from 'styled-components'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'

export type MetacardType = {
  getPreview: Function
  getTitle: Function
  id: String
  toJSON: () => any
}

export type LocationType = {
  left: number
  top: number
}

const Root = styled.div`
  font-family: 'Inconsolata', 'Lucida Console', monospace;
  background: ${props => props.theme.backgroundModal};
  display: block;
  width: auto;
  height: auto;
  font-size: ${props => props.theme.mediumFontSize};
  position: absolute;
  text-align: left;
  padding: 4px;
  max-height: 290px;
  max-width: 50%;
  transform: translate(-51.25%, -100%);

  &::before {
    top: 100%;
    content: ' ';
    border-top: 15px solid ${props => props.theme.backgroundModal};
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    height: 0;
    width: 0;
    left: 50%;
    position: absolute;
    pointer-events: none;
  }
`

const Title = styled.div`
  font-size: 20px;
  margin: 0;
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Open Sans', arial, sans-serif;
`

const Preview = styled.div`
  position: relative;
  min-width: 200px;
  height: 100%;
  min-height: 15px;
  max-height: 250px;
  padding: 2px;
  background-color: ${props => props.theme.backgroundContent};
  border: 1px solid;
  overflow-y: auto;
  overflow-x: auto;
  text-overflow: ellipsis;
`

const PreviewText = styled.p`
  font-family: 'Open Sans', arial, sans-serif;
  font-size: 14px;
  padding: 2px 4px;
  white-space: pre-line;
`

const ClusterList = styled.ul`
  margin: 1px;
  padding: 1px;
  border: 1px solid;
`

const ClusterTitle = styled.li`
  font-size: 18px;
  margin: 0;
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Open Sans', arial, sans-serif;

  &:hover {
    background-color: ${props => props.theme.backgroundSlideout};
  }
`

const NO_PREVIEW = 'No preview text available.'
const STATUS_OK = 200

const TOP_OFFSET = 60

const DRAG_SENSITIVITY = 10

type Props = {
  map: any
  selectionInterface: {
    getSelectedResults: () => {
      models: MetacardType[]
    } & Array<MetacardType>
    getActiveSearchResults: () => {
      models: MetacardType[]
    } & Array<MetacardType>
    clearSelectedResults: () => void
    addSelectedResult: (metacard: MetacardType) => void
  }
  mapModel: any
}

const getLeft = (location: undefined | LocationType) => {
  return location ? location.left + 'px' : 0
}

const getTop = (location: undefined | LocationType) => {
  return location ? location.top - TOP_OFFSET + 'px' : 0
}

const extractPreviewText = (responseHtml: string) => {
  const htmlElement = document.createElement('html')
  htmlElement.innerHTML = responseHtml
  const bodyElement = htmlElement!.querySelector('body')
  if (bodyElement) {
    bodyElement.innerHTML = bodyElement.innerHTML.replace(/<br\s*\/?>/gm, '\n')
    return bodyElement.innerText
  }
  return NO_PREVIEW
}

const getPreviewText = ({
  targetMetacard,
  setPreviewText,
}: {
  targetMetacard: MetacardType | undefined
  setPreviewText: React.Dispatch<React.SetStateAction<string | undefined>>
}) => {
  if (targetMetacard) {
    const url = targetMetacard.getPreview() as string
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('load', () => {
      if (xhr.status === STATUS_OK) {
        const previewText = extractPreviewText(xhr.responseText)
        setPreviewText(previewText !== NO_PREVIEW ? previewText : undefined)
      }
    })

    xhr.open('GET', url)
    xhr.send()
  } else {
    setPreviewText(undefined)
  }
}

/**
 * Get the pixel location from a metacard(s)
 * returns { left, top } relative to the map view
 */
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
const getLocation = (map: any, target: MetacardType[]) => {
  if (target) {
    const location = map.getWindowLocationsOfResults(target)
    const coordinates = location ? location[0] : undefined
    return coordinates
      ? { left: coordinates[0], top: coordinates[1] }
      : undefined
  }
}

const HookPopupPreview = (props: Props) => {
  const { map, selectionInterface } = props
  const [location, setLocation] = React.useState(undefined as
    | undefined
    | LocationType)
  const dragRef = React.useRef(0)
  const [open, setOpen] = React.useState(false)
  const [previewText, setPreviewText] = React.useState(undefined as
    | undefined
    | string)
  const { listenTo } = useBackbone()

  const getTarget = () => {
    return selectionInterface.getSelectedResults()
  }

  let popupAnimationFrameId: any
  const startPopupAnimating = (map: any) => {
    if (getTarget().length !== 0) {
      popupAnimationFrameId = window.requestAnimationFrame(() => {
        const location = getLocation(map, getTarget())
        setLocation(location)
        startPopupAnimating(map)
      })
    }
  }

  const handleCameraMoveEnd = () => {
    if (getTarget().length !== 0) {
      window.cancelAnimationFrame(popupAnimationFrameId)
    }
  }

  React.useEffect(() => {
    listenTo(
      selectionInterface.getSelectedResults(),
      'reset add remove',
      () => {
        if (selectionInterface.getSelectedResults().length === 1) {
          getPreviewText({
            targetMetacard: selectionInterface.getSelectedResults().models[0],
            setPreviewText,
          })
        }
        setLocation(getLocation(map, getTarget()))
        if (selectionInterface.getSelectedResults().length !== 0) {
          setOpen(true)
        }
      }
    )
    map.onMouseTrackingForPopup(
      () => {
        dragRef.current = 0
      },
      () => {
        dragRef.current += 1
      },
      (_event: any, mapTarget: any) => {
        if (DRAG_SENSITIVITY > dragRef.current) {
          setOpen(mapTarget.mapTarget !== undefined)
        }
      }
    )

    map.onCameraMoveStart(() => {
      startPopupAnimating(map)
    })
    map.onCameraMoveEnd(() => {
      handleCameraMoveEnd()
    })

    return () => {
      window.cancelAnimationFrame(popupAnimationFrameId)
    }
  }, [])

  if (!open) {
    return null
  }

  return (
    <Root style={{ left: getLeft(location), top: getTop(location) }}>
      {/* @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value. */}
      {(function() {
        if (selectionInterface.getSelectedResults().length === 1) {
          const metacardJSON = selectionInterface
            .getSelectedResults()
            .models[0].toJSON()
          return (
            <>
              <Title>{metacardJSON.metacard.properties.title}</Title>
              {previewText && (
                <Preview>
                  <PreviewText>{previewText}</PreviewText>
                </Preview>
              )}
            </>
          )
        } else if (selectionInterface.getSelectedResults().length > 1) {
          return (
            <ClusterList>
              {selectionInterface
                .getSelectedResults()
                .map((clusterModel: any) => {
                  return (
                    <ClusterTitle
                      key={clusterModel.id}
                      onClick={() => {
                        selectionInterface.clearSelectedResults()
                        selectionInterface.addSelectedResult(clusterModel)
                      }}
                    >
                      {clusterModel.toJSON().metacard.properties.title}
                    </ClusterTitle>
                  )
                })}
            </ClusterList>
          )
        }
      })()}
    </Root>
  )
}

export default hot(module)(HookPopupPreview)
