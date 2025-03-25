import * as React from 'react'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Services } from '../services/services'
import CircularProgress from '@material-ui/core/CircularProgress'
import { ApplicationType, getDisplayName } from '../../types/App'
import { useRouteContext } from '../app-root/app-root.pure'
import { Iframe } from '../iframe/iframe'
import { COMMANDS } from '../fetch/fetch'
import BackIcon from '@material-ui/icons/ArrowBackIos'

import Button from '@material-ui/core/Button'
import { SecurityCertificates } from '../security-certificates/security-certificates'
import { SourcesPage } from '../sources/sources'
import { MapLayersApp } from '../map-layers-app/app'
import { LayoutApp } from '../layout-app/app'

const DYNAMIC_PLUGINS_URL =
  '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/getPluginsForApplication(java.lang.String)/'

type Props = {
  app: ApplicationType
}

type TabType = {
  displayName: string
  iframeLocation?: string
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const TabContent = ({
  app,
  value,
  collectionJSON,
}: {
  app: ApplicationType
  value: string
  collectionJSON: TabType[]
}) => {
  switch (value) {
    case 'Info':
      return (
        <Grid item style={{ maxWidth: '600px', padding: '20px' }}>
          <Typography variant="body1">
            {app.description.split('::')[0]}
          </Typography>
        </Grid>
      )
    case 'Configuration':
      return <Services app={app} />
    case 'Certificates':
      if (app.name === 'security-services-app') {
        return <SecurityCertificates />
      }
    case 'Map Layers':
      return <MapLayersApp />
    case 'Sources':
      return <SourcesPage />
    case 'Layout':
      return <LayoutApp />
    default:
      const srcUrl = collectionJSON.filter(
        (tab) => tab.displayName === value
      )[0].iframeLocation
      return <Iframe url={srcUrl} />
  }
}

function getPluginsForApplication(app: ApplicationType) {
  if (app.name === 'security-services-app') {
    return ['Info', 'Configuration', 'Certificates']
  }
  return ['Info', 'Configuration']
}

const Application = ({ app }: Props) => {
  const { routeProps } = useRouteContext()
  const { history, location } = routeProps
  const [loading, setLoading] = React.useState(true)
  const [collection, setCollection] = React.useState([] as TabType[])
  React.useEffect(() => {
    COMMANDS.FETCH(DYNAMIC_PLUGINS_URL + app.name)
      .then((response) => response.json())
      .then((data) => {
        const backendTabs = data.value as TabType[]
        const tabNames = getPluginsForApplication(app)
        const plugins = tabNames.map((name) => ({
          displayName: name,
        }))
        // only add tabs that are not already known
        backendTabs.forEach((val) => {
          if (
            !plugins.find((plugin) => plugin.displayName === val.displayName)
          ) {
            plugins.push(val)
          }
        })
        setCollection(plugins)
        setLoading(false)
      })
  }, [])

  let value = location.pathname.split(`${app.name}/`)[1]
  if (value !== undefined) {
    value = value.split('/')[0]
  } else {
    value = 'Info'
  }
  function handleChange(_event: React.ChangeEvent<{}>, newValue: string) {
    history.push(`/admin/applications/${app.name}/${newValue}`)
  }
  return (
    <Paper style={{ padding: '20px', width: '100%' }}>
      <Grid container direction="column" spacing={3} className="w-full">
        <Grid item className="w-full">
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Button
                onClick={() => {
                  history.push('/admin/applications/')
                }}
              >
                <BackIcon></BackIcon>
              </Button>
            </Grid>
            <Grid item>
              <Typography variant="h4">{getDisplayName(app)}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className="w-full">
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="simple tabs example"
              >
                {collection.map((tab) => {
                  return (
                    <Tab
                      key={tab.displayName}
                      label={tab.displayName}
                      value={tab.displayName}
                      {...a11yProps(tab.displayName)}
                    />
                  )
                })}
              </Tabs>
              <TabContent app={app} value={value} collectionJSON={collection} />
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Application
