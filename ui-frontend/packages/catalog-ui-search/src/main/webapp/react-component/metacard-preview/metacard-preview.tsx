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
import { useState, useEffect } from 'react'
import { hot } from 'react-hot-loader'
import fetch from '../../react-component/utils/fetch'

type Props = {
  selectionInterface: any
}

const MetacardPreview = (props: Props) => {
  const [html, setHtml] = useState('')
  const selected = props.selectionInterface.getSelectedResults().first()
  const previewUrl = selected.getPreview()

  const getPreviewHtml = async (previewUrl: string) => {
    const res = await fetch(previewUrl)
    const text = await res.text()

    //avoid getting multiple html/body tags
    const htmlElement = document.createElement('html')
    htmlElement.innerHTML = text
    const bodyElement = htmlElement!.querySelector('body')
    if (bodyElement) {
      bodyElement.innerHTML = bodyElement.innerHTML.replace(
        /<br\s*\/?>/gm,
        '\n'
      )
      setHtml(text)
    }
  }

  useEffect(() => {
    getPreviewHtml(previewUrl)
  }, [])

  return (
    <>
      <html
        dangerouslySetInnerHTML={{ __html: html }}
        className="is-iframe is-preview"
      />
    </>
  )
}

export default hot(module)(MetacardPreview)
