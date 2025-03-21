import { FeatureType, createCtx } from '../app-root/app-root.pure'

export const [useFeaturesContext, FeaturesContextProvider] = createCtx<{
  features: FeatureType[]
  fetchFeatures: () => Promise<void>
}>()
