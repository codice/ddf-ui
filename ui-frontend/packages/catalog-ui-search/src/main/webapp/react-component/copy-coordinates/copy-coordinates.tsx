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
import Button from '@material-ui/core/Button'
import { useMenuState } from '../../component/menu-state/menu-state'
import Popover from '@material-ui/core/Popover'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
const Clipboard = require('clipboard')
const announcement = require('component/announcement')

type Props = {
  coordinateValues: {
    dms: string
    lat: string
    lon: string
    mgrs: string
    utmUps: string
  }
  closeParent: () => void
}

const generateClipboardHandler = (text: string, closeParent: () => void) => {
  return (e: React.MouseEvent) => {
    const clipboardInstance = new Clipboard(e.target, {
      text: () => {
        return text
      },
    })
    clipboardInstance.on('success', (e: any) => {
      announcement.announce({
        title: 'Copied to clipboard',
        message: e.text,
        type: 'success',
      })
    })
    clipboardInstance.on('error', (e: any) => {
      announcement.announce({
        title: 'Press Ctrl+C to copy',
        message: e.text,
        type: 'info',
      })
    })
    clipboardInstance.onClick(e)
    clipboardInstance.destroy()
    closeParent()
  }
}

const render = (props: Props) => {
  const { dms, lat, lon, mgrs, utmUps } = props.coordinateValues
  const { closeParent } = props
  const menuState = useMenuState()
  return (
    <>
      <Button
        className="metacard-interaction interaction-copy-coordinates"
        {...menuState.MuiButtonProps}
      >
        Copy Coordinates as
        <ExpandMoreIcon />
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
        <div className="flex flex-col">
          <Button
            data-help="Copies the coordinates to your clipboard."
            onClick={generateClipboardHandler(`${lat} ${lon}`, closeParent)}
          >
            <div>
              <div className="opacity-75">Decimal Degrees (DD)</div>
              {lat + ' ' + lon}
            </div>
          </Button>
          <Button
            data-help="Copies the DMS coordinates to your clipboard."
            onClick={generateClipboardHandler(dms, closeParent)}
          >
            <div>
              <div className="opacity-75">Degrees Minutes Seconds (DMS)</div>
              {dms}
            </div>
          </Button>
          {mgrs ? (
            <Button
              data-help="Copies the MGRS coordinates to your clipboard."
              onClick={generateClipboardHandler(mgrs, closeParent)}
            >
              <div>
                <div className="opacity-75">MGRS</div>
                {mgrs}
              </div>
            </Button>
          ) : null}
          <Button
            data-help="Copies the UTM/UPS coordinates to your clipboard."
            onClick={generateClipboardHandler(utmUps, closeParent)}
          >
            <div>
              <div className="opacity-75">UTM/UPS</div>
              {utmUps}
            </div>
          </Button>
          <Button
            data-help="Copies the WKT of the coordinates to your clipboard."
            onClick={generateClipboardHandler(
              `POINT (${lon} ${lat})`,
              closeParent
            )}
          >
            <div>
              <div className="opacity-75">Well Known (WKT)</div>
              POINT ({lon} {lat})
            </div>
          </Button>
        </div>
      </Popover>
    </>
  )
}

export default hot(module)(render)
