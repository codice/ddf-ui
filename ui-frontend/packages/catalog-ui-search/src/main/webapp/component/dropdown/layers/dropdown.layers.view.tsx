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
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import { useMenuState } from '../../menu-state/menu-state'
import MRC from '../../../react-component/marionette-region-container/marionette-region-container'
const Marionette = require('marionette')
const LayersView = require('../../layers/layers.view.js')
import TuneIcon from '@material-ui/icons/Tune'
const ReactLayers = () => {
  const menuState = useMenuState()

  return (
    <>
      <Button
        size="small"
        data-id="layers-button"
        {...menuState.MuiButtonProps}
      >
        <div className="flex flex-row items-center">
          <span>Layers</span>
          <TuneIcon />
        </div>
      </Button>
      <Popover {...menuState.MuiPopoverProps}>
        <div className="px-2">
          <MRC view={LayersView} />
        </div>
      </Popover>
    </>
  )
}

export default Marionette.ItemView.extend({
  template() {
    return <ReactLayers />
  },
  className: 'is-layers',
})
