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

import About from './presentation'
import moment from 'moment-timezone'
import { Environment } from '../../js/Environment'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'

const AboutContainer = () => {
  const { config } = useConfiguration()
  return (
    <About
      date={moment(Environment.commitDate).format('MMMM Do YYYY')}
      branding={config?.customBranding || ''}
      isDirty={Environment.isDirty}
      commitHash={Environment.commitHash}
      commitDate={Environment.commitDate}
      product={config?.product || ''}
      version={config?.version || ''}
    />
  )
}

export default AboutContainer
