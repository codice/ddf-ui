import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import CircularProgress from '@material-ui/core/CircularProgress'
import { SystemInformation } from '../system-information/system-information'
import { Services } from '../services/services'
import { LogViewer } from '../log-viewer/log-viewer'
import { useRouteContext } from '../app-root/app-root.pure'
import { Features } from '../features'
import { COMMANDS } from '../fetch/fetch'
import { Paper } from '@material-ui/core'

const DYNAMIC_PLUGINS_URL =
  '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/getPluginsForApplication(java.lang.String)/'

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

type ModuleType = {
  displayName: string
  id: string
  iframeLocation: string
}

const TabContent = ({ value }: { value: string }) => {
  switch (value) {
    case 'Information':
      return <SystemInformation />
    case 'Configuration':
      return <Services />
    case 'Features':
      return <Features />
    case 'Logs':
      return <LogViewer />
    default:
      return <div>Not found</div>
  }
}

export const System = () => {
  const { routeProps } = useRouteContext()
  const { history, location } = routeProps
  const [loading, setLoading] = React.useState(true)
  const [collection, setCollection] = React.useState([] as ModuleType[])
  React.useEffect(() => {
    COMMANDS.FETCH(DYNAMIC_PLUGINS_URL + 'system-module')
      .then((response) => response.json())
      .then((data) => {
        const plugins = [
          {
            displayName: 'Information',
          },
          {
            displayName: 'Configuration',
          },
          {
            displayName: 'Features',
          },
        ].concat(data.value) as ModuleType[]
        setCollection(plugins)
        setLoading(false)
      })
  }, [])

  let value = location.pathname.split(`system/`)[1]
  if (value !== undefined) {
    value = value.split('/')[0]
  } else {
    value = 'Information'
  }
  function handleChange(_event: React.ChangeEvent<{}>, newValue: string) {
    history.push(`/admin/system/${newValue}`)
  }
  return (
    <Paper style={{ padding: '20px' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
          >
            {collection.map((module) => {
              return (
                <Tab
                  key={module.displayName}
                  label={module.displayName}
                  value={module.displayName}
                  {...a11yProps(module.displayName)}
                />
              )
            })}
          </Tabs>
          <TabContent value={value} />
        </>
      )}
    </Paper>
  )
}
