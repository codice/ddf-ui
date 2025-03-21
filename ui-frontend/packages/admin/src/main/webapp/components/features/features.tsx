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
import styled from 'styled-components'
import { ExtractedFeaturesProvider } from './features.provider'
import { useFeaturesContext } from './features.pure'
import { ApplicationType } from '../../types/App'
import { Feature } from './feature'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
type Props = {
  app?: ApplicationType
}

const Header = styled.div`
  text-align: center;
`

const Subfeatures = () => {
  const { features, fetchFeatures } = useFeaturesContext()
  React.useEffect(() => {
    if (features.length === 0) {
      fetchFeatures()
    }
  }, [])
  return (
    <>
      {features.length === 0 ? (
        <Header>
          <CircularProgress />
          <Typography variant="h5">Loading Configurations</Typography>
        </Header>
      ) : (
        <Grid container direction="column" wrap="nowrap" spacing={3}>
          {features.map((feature) => {
            return (
              <Grid item style={{}} key={feature.name + feature.version}>
                <Feature feature={feature} />
                <Divider />
              </Grid>
            )
          })}
        </Grid>
      )}
    </>
  )
}

export const Features = ({}: Props) => {
  return (
    <ExtractedFeaturesProvider>
      <Subfeatures />
    </ExtractedFeaturesProvider>
  )
}
