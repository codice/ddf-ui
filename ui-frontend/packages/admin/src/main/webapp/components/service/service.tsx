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
import { Configuration } from '../configuration/configuration'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import { ConfigurationType, useAppRootContext } from '../app-root/app-root.pure'
import { Link } from 'react-router-dom'
import { SourceService } from '../sources/sources'

type Props = {
  service: ConfigurationType
}

export const generateUrlForEditing = (displayName: string, hash: boolean) => {
  const firstPart = hash
    ? location.hash.split('/Edit')[0].substring(1)
    : location.pathname.split('/Edit')[0]
  return `${firstPart}/Edit/${encodeURIComponent(displayName)}`
}

const DefaultService = ({ service }: Props) => {
  const { name, configurations } = service

  const url = generateUrlForEditing(name, true)

  return (
    <div style={{ padding: '10px' }}>
      <Link to={url}>
        <Button>{name}</Button>
      </Link>
      <Divider />
      {configurations
        ? configurations.map((configuration) => {
            return (
              <Configuration
                key={configuration.id}
                configuration={configuration}
              />
            )
          })
        : null}
    </div>
  )
}

/**
 *  While we could wait until loading of source configurations is complete, there's no real need.  It's an enhancement of the regular view, so they can gradually render instead of
 *  holding up all non source service views.  In addition, the loading of source configurations happens immediately in the app, so it's likely to be complete long before this renders.
 */
export const Service = ({ service }: Props) => {
  const { isSourceFactoryId } = useAppRootContext()
  if (isSourceFactoryId(service.id)) {
    return <SourceService service={service} />
  }

  return <DefaultService service={service} />
}
