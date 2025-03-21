import * as React from 'react'
import { useAppRootContext, useRouteContext } from './app-root.pure'
import { Link } from 'react-router-dom'

import BookIcon from '@material-ui/icons/MenuBook'
import InfoIcon from '@material-ui/icons/Info'
import InstallerIcon from '@material-ui/icons/SettingsApplications'
import AppsIcon from '@material-ui/icons/Apps'
import CardModeIcon from '@material-ui/icons/ViewModule'
import SourcesIcon from '@material-ui/icons/Cloud'
import MapLayersIcon from '@material-ui/icons/Map'
import LayoutIcon from '@material-ui/icons/ViewStream'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import BrandingIcon from '@material-ui/icons/Brush'

import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    shortName: {
      transition: theme.transitions.create(['opacity', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  })
)

const ID_TO_ICON = {
  applications: AppsIcon,
  docs: BookIcon,
  installation: InstallerIcon,
  configurations: InfoIcon,
  setup: CardModeIcon,
  sources: SourcesIcon,
  mapLayers: MapLayersIcon,
  layout: LayoutIcon,
  branding: BrandingIcon,
} as { [key: string]: any }

export const ID_TO_NAME = {
  applications: 'Applications',
  docs: 'Documentation',
  installation: 'Installer',
  configurations: 'System',
  setup: 'Wizards',
  sources: 'Sources',
  mapLayers: 'Map Layers',
  layout: 'Visual Layout',
  branding: 'Branding',
} as { [key: string]: any }

export const ID_TO_SHORT_NAME = {
  applications: 'Apps',
  docs: 'Docs',
  installation: 'Installer',
  configurations: 'System',
  setup: 'Wizards',
  sources: 'Sources',
  mapLayers: 'Map Layers',
  layout: 'Layout',
  branding: 'Branding',
} as { [key: string]: any }

function SourcesLink({ open }: { open: boolean }) {
  const classes = useStyles()
  const Icon = ID_TO_ICON['sources'] as any
  const url = `/admin/sources`
  const isCurrentUrl = location.pathname.indexOf(url) !== -1
  return (
    <Link to={url} key={url}>
      <ListItem
        button
        selected={isCurrentUrl}
        tabIndex={-1}
        style={{ position: 'relative' }}
      >
        <ListItemIcon>
          {Icon ? (
            <>
              <Icon
                className={classes.shortName}
                style={{
                  transform: open ? 'none' : 'translateY(-6px)',
                }}
              />
              <Typography
                className={classes.shortName}
                style={{
                  opacity: open ? 0 : 1,
                  fontSize: '.8rem',
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {ID_TO_SHORT_NAME['sources']}
              </Typography>
            </>
          ) : (
            <></>
          )}
        </ListItemIcon>
        <ListItemText primary={ID_TO_NAME['sources']} />
      </ListItem>
    </Link>
  )
}

function MapLayersLink({ open }: { open: boolean }) {
  const classes = useStyles()
  const Icon = ID_TO_ICON['mapLayers'] as any
  const url = `/admin/map-layers`
  const isCurrentUrl = location.pathname.indexOf(url) !== -1
  return (
    <Link to={url} key={url}>
      <ListItem
        button
        selected={isCurrentUrl}
        tabIndex={-1}
        style={{ position: 'relative' }}
      >
        <ListItemIcon>
          {Icon ? (
            <>
              <Icon
                className={classes.shortName}
                style={{
                  transform: open ? 'none' : 'translateY(-6px)',
                }}
              />
              <Typography
                className={classes.shortName}
                style={{
                  opacity: open ? 0 : 1,
                  fontSize: '.8rem',
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {ID_TO_SHORT_NAME['mapLayers']}
              </Typography>
            </>
          ) : (
            <></>
          )}
        </ListItemIcon>
        <ListItemText primary={ID_TO_NAME['mapLayers']} />
      </ListItem>
    </Link>
  )
}

function LayoutLink({ open }: { open: boolean }) {
  const classes = useStyles()
  const Icon = ID_TO_ICON['layout'] as any
  const url = `/admin/layout`
  const isCurrentUrl = location.pathname.indexOf(url) !== -1
  return (
    <Link to={url} key={url}>
      <ListItem
        button
        selected={isCurrentUrl}
        tabIndex={-1}
        style={{ position: 'relative' }}
      >
        <ListItemIcon>
          {Icon ? (
            <>
              <Icon
                className={classes.shortName}
                style={{
                  transform: open ? 'none' : 'translateY(-6px)',
                }}
              />
              <Typography
                className={classes.shortName}
                style={{
                  opacity: open ? 0 : 1,
                  fontSize: '.8rem',
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {ID_TO_SHORT_NAME['layout']}
              </Typography>
            </>
          ) : (
            <></>
          )}
        </ListItemIcon>
        <ListItemText primary={ID_TO_NAME['layout']} />
      </ListItem>
    </Link>
  )
}

function BrandingLink({ open }: { open: boolean }) {
  const classes = useStyles()
  const Icon = ID_TO_ICON['branding'] as any
  const url = `/admin/branding`
  const isCurrentUrl = location.pathname.indexOf(url) !== -1
  return (
    <Link to={url} key={url}>
      <ListItem
        button
        selected={isCurrentUrl}
        tabIndex={-1}
        style={{ position: 'relative' }}
      >
        <ListItemIcon>
          {Icon ? (
            <>
              <Icon
                className={classes.shortName}
                style={{
                  transform: open ? 'none' : 'translateY(-6px)',
                }}
              />
              <Typography
                className={classes.shortName}
                style={{
                  opacity: open ? 0 : 1,
                  fontSize: '.8rem',
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {ID_TO_SHORT_NAME['branding']}
              </Typography>
            </>
          ) : (
            <></>
          )}
        </ListItemIcon>
        <ListItemText primary={ID_TO_NAME['branding']} />
      </ListItem>
    </Link>
  )
}

export const Links = ({ open }: { open: boolean }) => {
  const classes = useStyles()
  const { modules, extension } = useAppRootContext()
  const { routeProps } = useRouteContext()
  const { location } = routeProps
  return (
    <>
      <List>
        {modules.map((module) => {
          const Icon = ID_TO_ICON[module.id] as any
          const url = `/admin/${ID_TO_NAME[module.id].toLowerCase()}`
          const isCurrentUrl = location.pathname.indexOf(url) !== -1

          return (
            <Link to={url} key={url}>
              <ListItem
                button
                selected={isCurrentUrl}
                tabIndex={-1}
                style={{ position: 'relative' }}
              >
                <ListItemIcon>
                  {Icon ? (
                    <>
                      <Icon
                        className={classes.shortName}
                        style={{
                          transform: open ? 'none' : 'translateY(-6px)',
                        }}
                      />
                      <Typography
                        className={classes.shortName}
                        style={{
                          opacity: open ? 0 : 1,
                          fontSize: '.8rem',
                          position: 'absolute',
                          bottom: '2px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {ID_TO_SHORT_NAME[module.id]}
                      </Typography>
                    </>
                  ) : (
                    <></>
                  )}
                </ListItemIcon>
                <ListItemText primary={ID_TO_NAME[module.id]} />
              </ListItem>
            </Link>
          )
        })}
        <SourcesLink open={open} />
        <MapLayersLink open={open} />
        <LayoutLink open={open} />
        <BrandingLink open={open} />
        {extension &&
          extension.links &&
          extension.links.map(({ url, Icon, name, shortName }) => {
            const isCurrentUrl = location.pathname.indexOf(url) !== -1
            const constructedUrl = `/admin/${url}`
            return (
              <Link to={constructedUrl} key={constructedUrl}>
                <ListItem
                  button
                  selected={isCurrentUrl}
                  tabIndex={-1}
                  style={{ position: 'relative' }}
                >
                  <ListItemIcon>
                    {Icon ? (
                      <>
                        <Icon
                          className={classes.shortName}
                          style={{
                            transform: open ? 'none' : 'translateY(-6px)',
                          }}
                        />
                        <Typography
                          className={classes.shortName}
                          style={{
                            opacity: open ? 0 : 1,
                            fontSize: '.8rem',
                            position: 'absolute',
                            bottom: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                        >
                          {shortName}
                        </Typography>
                      </>
                    ) : (
                      <></>
                    )}
                  </ListItemIcon>
                  <ListItemText primary={name} />
                </ListItem>
              </Link>
            )
          })}
      </List>
    </>
  )
}
