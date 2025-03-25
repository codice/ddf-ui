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
import { ConfigurationEdit } from '../configuration/edit'
import { ExistingConfigurationType } from '../app-root/app-root.pure'
import { RouteComponentProps } from 'react-router-dom'
import { useServicesContext } from '../services/services.pure'
import { ControlledModal } from '../modal/modal'

export const ServiceRoute = ({
  match,
  history,
}: RouteComponentProps<{ configurationId: string }>) => {
  const { services } = useServicesContext()
  if (services.length === 0) {
    return null
  }

  const goBackUrl = match.url.split(`/Edit/${match.params.configurationId}`)[0]
  const decodedConfigurationId = decodeURIComponent(
    match.params.configurationId
  )

  let correctService = services.find((service) => {
    return service.name === decodedConfigurationId
  })
  let correctConfiguration = undefined as ExistingConfigurationType | undefined

  services.forEach((service) => {
    if (service.configurations) {
      service.configurations.forEach((configuration) => {
        if (configuration.id === decodedConfigurationId) {
          correctConfiguration = configuration
        }
      })
    }
  })
  return (
    <ControlledModal
      defaultOpen={true}
      modalProps={{
        disableBackdropClick: true,
        onClose: () => {
          history.push(goBackUrl)
        },
      }}
      modalChildren={() => {
        if (correctService !== undefined) {
          return (
            <ConfigurationEdit
              service={correctService}
              onClose={() => {
                history.push(goBackUrl)
              }}
            />
          )
        }
        if (correctConfiguration !== undefined) {
          return (
            <ConfigurationEdit
              configuration={correctConfiguration}
              onClose={() => {
                history.push(goBackUrl)
              }}
            />
          )
        }
        return <></>
      }}
      paperProps={{
        style: {
          height: '100%',
        },
      }}
    >
      {() => {
        return <></>
      }}
    </ControlledModal>
  )
}
