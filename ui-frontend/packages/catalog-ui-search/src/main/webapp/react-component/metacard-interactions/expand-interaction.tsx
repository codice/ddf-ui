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
import { MetacardInteraction } from './metacard-interactions'
const router = require('../../component/router/router')
import { Props } from '.'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import { Link } from '../../component/link/link'
const wreqr = require('wreqr')

const ExpandMetacard = (props: Props) => {
  const isRouted = router && router.toJSON().name === 'openMetacard'

  if (isRouted || props.model.length > 1) {
    return null
  }
  let id = props.model
    .first()
    .get('metacard')
    .get('properties')
    .get('id')

  return (
    <Button
      fullWidth
      component={Link}
      to={`/metacards/${id}`}
      variant="text"
      color="primary"
      target="_blank"
    >
      Open Metacard View
    </Button>
  )
}

const handleExpand = (props: Props) => {
  props.onClose()
  let id = props.model
    .first()
    .get('metacard')
    .get('properties')
    .get('id')

  id = encodeURIComponent(id)

  wreqr.vent.trigger('router:navigate', {
    fragment: 'metacards/' + id,
    options: {
      trigger: true,
    },
  })
}

export default hot(module)(ExpandMetacard)
