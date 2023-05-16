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

import Group from '../../../react-component/group/index'
import Button from '@mui/material/Button'
class ListEditor extends React.Component<{
  list: any
  defaultItem: any
  onChange: any
  children: React.ReactNode
}> {
  handleAdd() {
    const { list, defaultItem, onChange } = this.props
    const newList = list.slice()
    newList.push(defaultItem)
    onChange(newList)
  }

  handleRemove(index: any) {
    const { list, onChange } = this.props
    const newList = list.slice()
    newList.splice(index, 1)
    onChange(newList)
  }

  render() {
    const listItems = React.Children.map(
      this.props.children,
      (child, index) => (
        <li className="item">
          <Group>
            {child}
            <Button onClick={this.handleRemove.bind(this, index)}>
              Remove
            </Button>
          </Group>
        </li>
      )
    )
    return (
      <div>
        <ul className="list flex flex-col flex-nowrap space-y-2">
          {listItems}
        </ul>
        <Button onClick={this.handleAdd.bind(this)} className="mt-2" fullWidth>
          Add
        </Button>
      </div>
    )
  }
}

export default ListEditor
