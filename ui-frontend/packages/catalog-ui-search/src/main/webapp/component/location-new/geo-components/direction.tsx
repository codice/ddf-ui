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
import React from 'react'
import TextField from '@material-ui/core/TextField'
class Direction extends React.Component {
  getToggledOption() {
    return (this.props as any).value === (this.props as any).options[0]
      ? (this.props as any).options[1]
      : (this.props as any).options[0]
  }
  handleMouseDown(e: any) {
    e.preventDefault()
    ;(this.props as any).onChange(this.getToggledOption())
  }
  handleKeyPress(e: any) {
    const toggledOption = this.getToggledOption()
    if (
      String.fromCharCode(e.which).toUpperCase() === toggledOption.toUpperCase()
    ) {
      ;(this.props as any).onChange(toggledOption)
    }
  }
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { value } = this.props
    return (
      <div className="shrink-0 grow-0">
        <TextField
          size="small"
          variant="outlined"
          value={value}
          className="flex-1 w-12 cursor-pointer"
          onMouseDown={this.handleMouseDown.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)}
          onChange={(e) => e.stopPropagation()}
        />
      </div>
    )
  }
}
export default Direction
