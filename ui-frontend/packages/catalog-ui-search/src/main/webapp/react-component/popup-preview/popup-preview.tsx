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
import withListenTo, { WithBackboneProps } from '../backbone-container'

const sanitize = require('sanitize-html')

const PopupPresentation = require('./presentation').default

const STATUS_OK = 200

const LEFT_OFFSET = 250
const BOTTOM_OFFSET = 180

const br2nl = (str: string) => {
  return str.replace(/<br\s*\/?>/gm, '\n')
}

const sanitizeHeader = (header: string) => {
  if (typeof header === 'string') {
    const sanitized = sanitize(header, {
      allowedTags: ['br'],
      allowedAttributes: [],
    })
    return br2nl(sanitized)
  }
  return header
}

type Props = {
  map: Backbone.Model
} & WithBackboneProps

type State = {
  showPopup: Boolean
  titleText: String
  previewText?: String
}

class PopupPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { ...this.mapPropsToState(props), showPopup: false }
  }

  mapPropsToState = (props: Props) => {
    const { map } = props
    const metacard = map.get('popupMetacard')
    const location = map.get('popupLocation')

    return {
      showPopup: metacard !== null && metacard !== undefined,
      titleText: metacard ? metacard.getTitle() : undefined,
      left: location.left - LEFT_OFFSET + 'px',
      bottom: location.bottom - BOTTOM_OFFSET + 'px',
    }
  }

  /**
    Gets the previewText from the targetMetacard url
   */
  setPreviewText = (props: Props) => {
    const metacard = props.map.get('popupMetacard')

    if (metacard) {
      const url = metacard.getPreview()

      if (url) {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('load', () => {
          if (xhr.status === STATUS_OK) {
            const responseText = sanitizeHeader(xhr.responseText)
            this.setState({ previewText: responseText })
          }
        })

        xhr.open('GET', url)
        xhr.send()
      } else {
        this.setState({ previewText: undefined })
      }
    }
  }

  componentDidMount() {
    this.listenToMap()
  }

  listenToMap = () => {
    const { listenTo, map } = this.props
    listenTo(
      map,
      'change:popupLocation change:popupMetacard',
      this.handlePopupChange
    )
    listenTo(map, 'change:popupMetacard', () => {
      this.setPreviewText(this.props)
    })
  }

  componentWillUnmount() {
    const { stopListening, map } = this.props
    stopListening(
      map,
      'change:popupLocation change:popupMetacard',
      this.handlePopupChange
    )
    stopListening(map, 'change:popupMetacard', this.setPreviewText)
  }

  handlePopupChange = () => {
    this.setState(this.mapPropsToState(this.props))
  }

  render() {
    return this.state.showPopup ? <PopupPresentation {...this.state} /> : null
  }
}

export default hot(module)(withListenTo(PopupPreview))
