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
import './styles/tailwind.css'
import { detect } from 'detect-browser'

const browser = detect()

/**
 *  If we can't detect browser, assume it's supported
 *
 *  If we can, check if it's supported
 */
export const isSupportedBrowser = () => {
  if (sessionStorage.getItem('ignoreBrowserWarning')) {
    return true
  }
  if (browser && browser.version) {
    const version = parseInt(browser.version.split('.')[0])
    switch (browser && browser.name) {
      case 'chrome':
        // https://chromium.cypress.io/mac/ for those devs who wish to test old chromium versions
        return version >= 90
      case 'firefox':
        // https://ftp.mozilla.org/pub/firefox/releases/
        return version >= 78
      case 'edge':
      case 'edge-chromium':
        // https://officecdnmac.microsoft.com/pr/03adf619-38c6-4249-95ff-4a01c0ffc962/MacAutoupdate/MicrosoftEdge-90.0.818.39.pkg
        // change version on end to get to old versions
        return version >= 91
      default:
        return false
    }
  } else {
    return true
  }
}

export const handleUnsupportedBrowser = () => {
  document.querySelector('#loading')?.classList.add('hidden')
  document
    .querySelector('#incompatible-browser-bg button')
    ?.addEventListener('click', () => {
      sessionStorage.setItem('ignoreBrowserWarning', 'true')
      location.reload()
    })
}

export const handleSupportedBrowser = () => {
  document.querySelector('#incompatible-browser-bg')?.remove()
}

if (!isSupportedBrowser()) {
  handleUnsupportedBrowser()
} else {
  handleSupportedBrowser()
}
