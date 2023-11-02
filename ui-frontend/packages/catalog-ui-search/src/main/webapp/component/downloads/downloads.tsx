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

import { v4 } from 'uuid'

class Download {
  filename: string
  callback: (() => void) | undefined
  id: string

  constructor(filename: string, callback?: () => void) {
    this.filename = filename
    this.callback = callback
    this.id = v4()
  }
}

class Downloads {
  processing: string | undefined
  queue: Download[]
  autoDownload: boolean
  timeoutId: number | undefined

  constructor() {
    this.processing = undefined
    this.queue = []
    this.autoDownload = true
    this.timeoutId = undefined
  }

  downloadFromData({
    filename,
    type,
    data,
  }: {
    filename: string
    type: string
    data: any
  }) {
    this.addToQueue(filename, () => {
      fromData({
        filename,
        type,
        data,
        Downloads: this,
      })
    })
  }

  downloadFromUrl({ filename, url }: { filename: string; url: string }) {
    this.addToQueue(filename, () => {
      fromUrl({
        filename,
        url,
        Downloads: this,
      })
    })
  }

  addToQueue(filename: string, callback?: () => void) {
    this.queue.push(new Download(filename, callback))
    // announce download ?
    this.processQueue()
  }

  initiateDownload() {
    const next = this.queue.shift()
    if (next) {
      this.processing = next.filename
      next.callback?.()
    }
  }

  processQueue() {
    if (this.processing === undefined) {
      this.initiateDownload()
    }
  }

  finishDownload() {
    clearTimeout(this.timeoutId)
    window.onblur = () => {}
    window.onfocus = () => {}
    this.processing = undefined
    this.autoDownload = true
    this.processQueue()
  }

  onBlur() {
    this.autoDownload = false
  }

  onFocus() {
    this.finishDownload()
  }

  afterDownload() {
    clearTimeout(this.timeoutId)
    this.timeoutId = window.setTimeout(() => {
      if (this.autoDownload) {
        this.finishDownload()
      }
    }, 1000)
  }
}

// take in data and cause a download
function fromData({
  filename,
  type,
  data,
  Downloads,
}: {
  filename: string
  type?: string
  data: any
  Downloads: Downloads
}) {
  const blob = new Blob([data], { type })
  const elem = document.createElement('a')
  elem.href = URL.createObjectURL(blob)
  elem.download = filename
  document.body.appendChild(elem)
  elem.click()
  URL.revokeObjectURL(elem.href)
  document.body.removeChild(elem)
  Downloads.afterDownload()
}

function fromUrl({
  filename,
  url,
  Downloads,
}: {
  filename: string
  url: string
  Downloads: Downloads
}) {
  // convert the url so that if it has a port we swap the port to 8080
  // const proxyUrl = url.replace(/:\d{2,5}/, ':8080')
  const xhr = new XMLHttpRequest()
  xhr.withCredentials = true
  xhr.open('GET', proxyUrl, true)
  xhr.responseType = 'blob'
  xhr.onerror = () => {
    // announcement.announce({
    //   title: "Download failed",
    //   message: "Download failed",
    //   type: "error",
    // });
    Downloads.afterDownload()
  }
  xhr.onload = function (this: XMLHttpRequest) {
    if (this.status == 200) {
      const blob = this.response
      window.onblur = Downloads.onBlur.bind(Downloads)
      window.onfocus = Downloads.onFocus.bind(Downloads)
      fromData({
        filename,
        type: blob?.type,
        data: blob,
        Downloads,
      })
    } else {
      Downloads.afterDownload()
    }
  }

  xhr.send()
}

export const DownloadsManager = new Downloads()
