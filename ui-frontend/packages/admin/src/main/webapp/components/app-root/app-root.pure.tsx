import * as React from 'react'
import { RouteChildrenProps } from 'react-router'
import { setType } from '../../typescript/hooks'

export type PlatformConfigType = {
  background: string
  color: string
  favIcon: string
  footer: string
  header: string
  productImage: string
  systemUsageMessage?: string
  systemUsageOncePerSession?: boolean
  systemUsageTitle?: string
  timeout: number
  title: string
  vendorImage: string
  version: string
}

export type AdminConfigType = {
  branding: string
  disabledInstallerApps: string
}

export type AlertType = {
  alertAttribute?: string
  alertLevel?: string
  alertPattern?: string
  count?: number
  createddate?: string
  'event.topics'?: string
  details: string[]
  hostAddress?: string
  hostName?: string
  id?: string
  'last-updated'?: string
  noticeTime?: string
  priority?: number
  source?: string
  status?: string
  timestamp?: number
  title: string
  type?: string
}

export type ModuleType = {
  iframeLocation: string
  name: string
  active: boolean
  cssLocation: string
  id: string
  jsLocation: string
}

export type ApplicationType = {
  name: string
  description: string
}

export type ApplicationTheme = 'light' | 'dark'

export type MetatypeType = {
  value: string[]
  cardinality: number
  defaultValue: string[]
  description: string | null
  id: string
  name: string
  optionLabels: string[]
  optionValues: string[]
  type: number
  touched: boolean
  initialTouched: boolean
}

export type ExistingConfigurationType = {
  bundle: number
  bundle_location: string
  bundle_name: string
  enabled: boolean
  fpid?: string
  id: string
  name: string
  properties: {
    [key: string]: string | boolean | number | string[] | boolean[] | number[]
  }
  operation_actions?: any[] // these appear unique to source configurations
  report_actions?: any[] // these appear unique to source configurations
  // Let the child access parent info like metatype (we do this in our parsing, it's not a default prop from backend)
  service?: ConfigurationType
}

export type ConfigurationType = {
  configurations?: ExistingConfigurationType[]
  factory: boolean
  id: string
  fpid?: string
  metatype: MetatypeType[]
  name: string
}

export type FeatureType = {
  name: string
  repository: string
  status: 'Uninstalled' | 'Installed'
  version: string
}

// create context with no upfront defaultValue
// without having to do undefined check all the time
export function createCtx<A>() {
  const ctx = React.createContext<A | undefined>(undefined)
  function useCtx() {
    const c = React.useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }
  return [useCtx, ctx.Provider] as const // make TypeScript infer a tuple, not an array of union types
}

export type ExtensionType =
  | {
      links?: {
        name: string
        shortName: string
        url: string
        Icon: any
        content: (props: any) => JSX.Element
      }[]
      handleModuleRouting?: (moduleId: string) => JSX.Element | undefined
    }
  | undefined

export const [useAppRootContext, AppRootContextProvider] = createCtx<{
  platformConfig: PlatformConfigType
  adminConfig: AdminConfigType
  alerts: AlertType[]
  fetchAlerts: () => Promise<void>
  sourceConfigurations: ConfigurationType[]
  fetchSourceConfigurations: () => Promise<void>
  loadingSourceConfigurations: boolean
  isSourceFactoryId: (fpid?: string) => boolean
  sourceFactoryIds: string[]
  isSourceConfiguration: (configuration: ExistingConfigurationType) => boolean
  modules: ModuleType[]
  fetchModules: () => Promise<void>
  applications: ApplicationType[]
  fetchApplications: () => Promise<void>
  theme: ApplicationTheme
  setTheme: setType<ApplicationTheme>
  extension?: ExtensionType
}>()

export const [useRouteContext, RouteContextProvider] = createCtx<{
  routeProps: RouteChildrenProps
}>()
