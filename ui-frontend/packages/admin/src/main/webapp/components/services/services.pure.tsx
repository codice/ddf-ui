import { ConfigurationType, createCtx } from '../app-root/app-root.pure'

export const [useServicesContext, ServicesContextProvider] = createCtx<{
  services: ConfigurationType[]
  fetchServices: () => Promise<void>
  loading: boolean
}>()
