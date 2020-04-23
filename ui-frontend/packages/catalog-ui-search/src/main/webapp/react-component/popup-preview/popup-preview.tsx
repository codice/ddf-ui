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

export type Metacard = {
  getPreview: Function
  getTitle: Function
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
  transform: translate(-52.5%, -100%);

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
  white-space: normal;
  background-color: ${props => props.theme.backgroundContent};
  border: 1px solid;
  overflow-y: auto;
  overflow-x: auto;
  text-overflow: ellipsis;
`

const PreviewHtml = styled.html`
  font-family: 'Open Sans', arial, sans-serif;
  font-size: 14px;
  padding: 2px 4px;
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

const sanitize = require('sanitize-html')

const NO_PREVIEW = 'No preview text available.'
const STATUS_OK = 200

const TOP_OFFSET = 60

const br2nl = (str: string) => {
  return str.replace(/<br\s*\/?>/gm, '\n')
}

const hasPreview = (header: string) => {
  const sanitized = sanitize(header, {
    allowedTags: ['br'],
    allowedAttributes: [],
  })

  return br2nl(sanitized) !== NO_PREVIEW
}

type Props = {
  map: Backbone.Model
}

const getLeft = ({ map }: Props) => {
  const location = map.get('popupLocation')
  return location ? location.left + 'px' : 0
}

const getTop = ({ map }: Props) => {
  const location = map.get('popupLocation')
  return location ? location.top - TOP_OFFSET + 'px' : 0
}

const getShowPopup = ({ map }: Props) => {
  const location = map.get('popupLocation')
  const clusterModels = map.get('popupClusterModels')
  const metacard = map.get('popupMetacard')
  return location && (metacard || clusterModels)
}

const getPreviewHTML = ({
  map,
  setPreviewHTML,
}: {
  map: any
  setPreviewHTML: React.Dispatch<React.SetStateAction<string | undefined>>
}) => {
  if (map.get('popupMetacard')) {
    const url = map.get('popupMetacard').getPreview() as string
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('load', () => {
      if (xhr.status === STATUS_OK) {
        setPreviewHTML(
          hasPreview(xhr.responseText) ? xhr.responseText : undefined
        )
      }
    })

    xhr.open('GET', url)
    xhr.send()
  } else {
    setPreviewHTML(undefined)
  }
}

const HookPopupPreview = (props: Props) => {
  const { map } = props
  const forceRender = React.useState(Math.random())[1]
  const [previewHTML, setPreviewHTML] = React.useState(undefined as
    | undefined
    | string)
  const { listenTo } = useBackbone()

  React.useEffect(() => {
    listenTo(
      map,
      'change:popupMetacard change:popupClusterModels change:popupLocation',
      () => {
        forceRender(Math.random())
        getPreviewHTML({ map, setPreviewHTML })
      }
    )
  }, [])

  if (!getShowPopup(props)) {
    return null
  }

  return (
    <Root style={{ left: getLeft(props), top: getTop(props) }}>
      {(function() {
        if (map.get('popupMetacard')) {
          const metacardJSON = map.get('popupMetacard').toJSON()
          return (
            <>
              <Title>{metacardJSON.metacard.properties.title}</Title>
              {previewHTML && (
                <Preview>
                  <PreviewHtml
                    dangerouslySetInnerHTML={{ __html: previewHTML }}
                  />
                </Preview>
              )}
            </>
          )
        } else if (map.get('popupClusterModels')) {
          const clusterModels = map.get('popupClusterModels')
          return (
            <ClusterList>
              {clusterModels.map((clusterModel: any) => {
                return (
                  <ClusterTitle
                    key={clusterModel.id}
                    onClick={() => {
                      map.set('popupMetacard', clusterModel)
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
