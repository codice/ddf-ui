import * as React from 'react'

import { ServicesContextProvider } from './services.pure'
import { ConfigurationType } from '../app-root/app-root.pure'
import { ApplicationType } from '../../types/App'
import { COMMANDS } from '../fetch/fetch'

type Props = {
  app?: ApplicationType
  children: any
  fetchServices?: () => Promise<ConfigurationType[]>
}

async function defaultFetchServices({ app }: { app?: ApplicationType }) {
  const services = await COMMANDS.SERVICES.LIST({
    appName: app ? app.name : undefined,
  })
  return services
}

export const ExtractedServicesProvider = ({
  app,
  children,
  fetchServices,
}: Props) => {
  const [loading, setLoading] = React.useState(true)
  const [services, setServices] = React.useState([] as ConfigurationType[])

  const determinedFetchServices = async () => {
    setLoading(true)
    try {
      if (fetchServices) {
        const services = await fetchServices()
        setServices(services)
      } else {
        const services = await defaultFetchServices({ app })
        setServices(services)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  React.useEffect(() => {
    determinedFetchServices()
  }, [])
  return (
    <ServicesContextProvider
      value={{
        services,
        fetchServices: determinedFetchServices,
        loading,
      }}
    >
      {children}
    </ServicesContextProvider>
  )
}
