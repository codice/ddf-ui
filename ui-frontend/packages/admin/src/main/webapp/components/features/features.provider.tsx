import * as React from 'react'

import { FeaturesContextProvider } from './features.pure'
import { FeatureType } from '../app-root/app-root.pure'
import { COMMANDS } from '../fetch/fetch'

type Props = {
  children: any
}

export const ExtractedFeaturesProvider = ({ children }: Props) => {
  const [features, setFeatures] = React.useState([] as FeatureType[])
  const fetchFeatures = async () => {
    const featureData = await COMMANDS.FEATURES.LIST()
    setFeatures(featureData)
  }
  return (
    <FeaturesContextProvider
      value={{
        features,
        fetchFeatures,
      }}
    >
      {children}
    </FeaturesContextProvider>
  )
}
