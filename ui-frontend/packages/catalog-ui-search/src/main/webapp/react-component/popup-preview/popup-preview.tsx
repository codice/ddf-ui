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

import { Metacard } from '.'

const sanitize = require('sanitize-html')
const PopupPresentation = require('./presentation').default

const NO_PREVIEW = 'No preview text available.'
const STATUS_OK = 200

const TOP_OFFSET = 60

const br2nl = (str: string) => {
  return str.replace(/<br\s*\/?>/gm, '\n')
}

const sanitizeHeader = (header: string) => {
  const sanitized = sanitize(header, {
    allowedTags: ['br'],
    allowedAttributes: [],
  })
  return br2nl(sanitized)
}

const mapPropsToState = (props: Props) => {
  const { map } = props
  const metacard = map.get('popupMetacard')
  const clusterModels = map.get('popupClusterModels')
  const location = map.get('popupLocation')

  return {
    showPopup: location && (metacard || clusterModels),
    left: location ? location.left + 'px' : 0,
    top: location ? location.top - TOP_OFFSET + 'px' : 0,
  }
}

type Props = {
  map: Backbone.Model
} & WithBackboneProps

type State = {
  showPopup: Boolean
  titleText?: String
  previewText?: String
  clusterModels?: Array<Metacard>
  clusterTitleCallback?: Function
}

class PopupPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      ...mapPropsToState(props),
      showPopup: false,
      clusterTitleCallback: this.clusterTitleCallback,
    }
  }

  componentDidMount() {
    this.listenToMap()
  }

  listenToMap = () => {
    const { listenTo, map } = this.props
    listenTo(map, 'change:popupLocation', this.handlePopupChange)
    listenTo(map, 'change:popupMetacard change:popupClusterModels', () => {
      this.setPopup(this.props)
    })
  }

  componentWillUnmount() {
    const { stopListening, map } = this.props
    stopListening(map, 'change:popupLocation', this.handlePopupChange)
    stopListening(
      map,
      'change:popupMetacard change:popupClusterModels',
      this.setPopup
    )
  }

  handlePopupChange = () => {
    this.setState(mapPropsToState(this.props))
  }

  setPopup = (props: Props) => {
    const metacard = props.map.get('popupMetacard')
    const clusterModels = props.map.get('popupClusterModels')

    if (metacard) {
      this.setPopupMetacard(metacard)
    } else if (clusterModels) {
      this.setPopupCluster(clusterModels)
    }
  }

  /**
    Set state values for a single metacard
   */
  setPopupMetacard = (metacard: Metacard) => {
    this.setPreviewText(metacard)
    this.setState({
      titleText: metacard.getTitle(),
      clusterModels: undefined,
    })
  }

  /**
   Set state values for a cluster
  */
  setPopupCluster = (clusterModels: Array<Metacard>) => {
    this.setState({ titleText: undefined, previewText: undefined })
    this.setState({ clusterModels })
  }

  /**
    Gets the previewText from the targetMetacard url
   */
  setPreviewText = (metacard: Metacard) => {
    const url = metacard.getPreview()

    if (url) {
      const xhr = new XMLHttpRequest()
      xhr.addEventListener('load', () => {
        if (xhr.status === STATUS_OK) {
          var responseText = sanitizeHeader(xhr.responseText)
          this.setState({
            previewText: responseText !== NO_PREVIEW ? responseText : undefined,
          })
        }
      })

      xhr.open('GET', url)
      xhr.send()
    } else {
      this.setState({ previewText: undefined })
    }
  }

  /**
   *  Switch from cluster to metacard when cluster titles are clicked
   */
  clusterTitleCallback = (title: String) => {
    const metacard = this.state!.clusterModels!.find(
      m => m.getTitle() === title
    )
    if (metacard) {
      this.setPopupMetacard(metacard)
    }
  }

  render() {
    return this.state.showPopup ? <PopupPresentation {...this.state} /> : null
  }
}

export default hot(module)(withListenTo(PopupPreview))
