import React, { useState } from 'react'
import { COMMANDS } from '../fetch/fetch'
import { ExtractedServicesProvider } from '../services/services.provider'
import { useServicesContext } from '../services/services.pure'
import { Link, Route } from 'react-router-dom'
import { ServiceRoute } from '../service/service.route'
import {
  ConfigurationType,
  ExistingConfigurationType,
} from '../app-root/app-root.pure'
import {
  Button,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  Divider,
} from '@material-ui/core'
import {
  useSnackbar,
  generateDismissSnackbarAction,
} from '../snackbar/snackbar.provider'
import CloseIcon from '@material-ui/icons/Close'
import LinearProgress from '@material-ui/core/LinearProgress'
import { generateUrlForEditing } from '../service/service'

export function useSourceAvailability({
  configuration,
}: {
  configuration: ExistingConfigurationType
}) {
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    setTimeout(() => {
      COMMANDS.SOURCES.SOURCESTATUS(configuration.id).then((status) => {
        setIsAvailable(status)
        setIsLoading(false)
      })
    }, 1000)

    const interval = setInterval(() => {
      COMMANDS.SOURCES.SOURCESTATUS(configuration.id).then((status) => {
        setIsAvailable(status)
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [configuration])

  return { isAvailable, isLoading }
}

export function useIsConfigurationEnabled({
  configuration,
}: {
  configuration: ExistingConfigurationType
}) {
  const { fetchServices } = useServicesContext()
  const toggleEnabled = React.useCallback(() => {
    if (configuration.enabled) {
      COMMANDS.CONFIGURATION.DISABLE(configuration.id).then(() => {
        fetchServices()
      })
    } else {
      COMMANDS.CONFIGURATION.ENABLE(configuration.id).then(() => {
        fetchServices()
      })
    }
  }, [configuration, fetchServices])
  return {
    isEnabled: configuration.enabled,
    toggleEnabled,
  }
}

export function SourceAvailability({
  isAvailable,
  isLoading,
}: {
  isAvailable: boolean
  isLoading: boolean
}) {
  if (isLoading) {
    return <div className="h-6 bg-gray-200 animate-pulse rounded w-full"></div>
  }
  if (isAvailable) {
    return <div className="text-green-500 text-xl">Available</div>
  }
  return <div className="text-red-500 text-xl">Unavailable</div>
}

const generateUrl = (displayName: string) => {
  const firstPart = location.hash.substring(1)
  return `${firstPart}/Edit/${encodeURIComponent(displayName)}`
}

function getConfigurations({
  services,
}: {
  services: ConfigurationType[]
}): ExistingConfigurationType[] {
  const knownConfigurations: ExistingConfigurationType[] = []
  services.forEach((service) => {
    service.configurations?.forEach((configuration) => {
      knownConfigurations.push(configuration)
    })
  })
  return knownConfigurations
}

function getBindingUrl(
  configuration: ExistingConfigurationType
): string | undefined {
  const configProps = configuration.properties
  if (!configProps) return undefined

  // Find properties that contain Address or Url, but not oauth
  const urlKeys = Object.keys(configProps).filter(
    (key) =>
      /.*Address|.*Url/.test(key) &&
      !/.*oauth/.test(key) &&
      /^(?!event|site).*$/.test(key)
  )

  // Return the first matching property value
  if (urlKeys.length > 0) {
    return configProps[urlKeys[0] as keyof typeof configProps] as string
  }

  return undefined
}

function isLoopBackUrl(url: string) {
  return /.*(localhost|org.codice.ddf.system.hostname).*/.test(url)
}

function getSourceName(configuration: ExistingConfigurationType): string {
  return (
    (configuration.properties.id as string) || (configuration.name as string)
  )
}

function getSourceType(configuration: ExistingConfigurationType): string {
  return (configuration.fpid || configuration.id).split('_disabled')[0]
}

function Source({
  configuration,
}: {
  configuration: ExistingConfigurationType
}) {
  const { fetchServices } = useServicesContext()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const { isAvailable, isLoading } = useSourceAvailability({ configuration })
  const { isEnabled, toggleEnabled } = useIsConfigurationEnabled({
    configuration,
  })
  const displayName = configuration.fpid ? configuration.id : configuration.name
  const url = generateUrl(displayName)
  const sourceName = getSourceName(configuration)
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newEnabled = event.target.value === 'enabled'
    if (newEnabled !== isEnabled) {
      toggleEnabled()
    }
  }
  const bindingUrl = getBindingUrl(configuration)
  return (
    <TableRow className="h-[70px]">
      <TableCell>
        <Link className="text-2xl" to={url}>
          {sourceName}
        </Link>
      </TableCell>
      <TableCell>
        <Select
          value={isEnabled ? 'enabled' : 'disabled'}
          onChange={handleChange}
          variant="standard"
        >
          <MenuItem value="enabled">Enabled</MenuItem>
          <MenuItem value="disabled">Disabled</MenuItem>
        </Select>
      </TableCell>
      <TableCell>{getSourceType(configuration)}</TableCell>

      <TableCell className="max-w-[200px] truncate">
        <div className="truncate" title={bindingUrl}>
          {bindingUrl}
        </div>
        <div className="text-xs">
          {bindingUrl && isLoopBackUrl(bindingUrl) ? 'Loopback' : ''}
        </div>
      </TableCell>
      <TableCell>
        {isEnabled ? (
          <SourceAvailability isAvailable={isAvailable} isLoading={isLoading} />
        ) : null}
      </TableCell>
      <TableCell>
        <Button
          color="secondary"
          onClick={async () => {
            var question =
              'Are you sure you want to remove the source: ' + displayName + '?'
            //@ts-ignore
            var confirmation = window.confirm(question)
            if (confirmation) {
              await COMMANDS.CONFIGURATION.DELETE(configuration.id)
              await fetchServices()
              enqueueSnackbar(`${configuration.id} deleted`, {
                variant: 'success',
                action: generateDismissSnackbarAction({ closeSnackbar }),
              })
            }
          }}
        >
          <CloseIcon />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function getPath() {
  return `${location.hash.split('/Edit')[0].substring(1)}/Edit/:configurationId`
}

function SourceRowSkeleton() {
  return (
    <TableRow className="h-[70px]">
      <TableCell>
        <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
      </TableCell>
    </TableRow>
  )
}

export function Sources({ filterToType }: { filterToType?: string }) {
  const { services, fetchServices, loading } = useServicesContext()
  const configurations = getConfigurations({ services })
  const path = getPath()

  const [sortField, setSortField] = React.useState<
    'name' | 'enabled disabled' | 'url' | 'source type'
  >('name')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    'asc'
  )

  const sortedConfigurations = [...configurations].sort((a, b) => {
    let aValue: string = ''
    let bValue: string = ''

    switch (sortField) {
      case 'name':
        aValue = getSourceName(a)
        bValue = getSourceName(b)
        break
      case 'enabled disabled':
        aValue = a.enabled ? 'Enabled' : 'Disabled'
        bValue = b.enabled ? 'Enabled' : 'Disabled'
        break
      case 'url':
        aValue = getBindingUrl(a) || ''
        bValue = getBindingUrl(b) || ''
        break
      case 'source type':
        aValue = getSourceType(a)
        bValue = getSourceType(b)
        break
    }

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })

  const filteredConfigurations = filterToType
    ? sortedConfigurations.filter((configuration) => {
        return getSourceType(configuration) === filterToType
      })
    : sortedConfigurations

  const handleSort = (
    field: 'name' | 'enabled disabled' | 'url' | 'source type'
  ) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleRefresh = () => {
    fetchServices()
  }

  return (
    <>
      <div className="p-4">
        <div className="flex flex-row flex-none gap-2 items-center justify-end pb-4">
          {!filterToType && (
            <Button variant="outlined" color="primary" onClick={handleClick}>
              Add Source
            </Button>
          )}
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {services.map((service) => (
              <MenuItem
                key={service.id}
                onClick={() => {
                  handleClose()
                }}
                component={Link}
                to={generateUrl(service.name)}
              >
                {service.name || service.id}
              </MenuItem>
            ))}
          </Menu>
          <Button
            className="!relative"
            variant="text"
            color="primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh Sources
            {loading && (
              <LinearProgress
                className="!absolute left-0 top-0 w-full !h-full opacity-20"
                color="primary"
              />
            )}
          </Button>
        </div>
        <TableContainer component={Paper} className="w-full">
          <Table className="w-full">
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  Name{' '}
                  {sortField === 'name' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('enabled disabled')}
                  style={{ cursor: 'pointer' }}
                >
                  Enabled / Disabled
                  {sortField === 'enabled disabled' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('source type')}
                  style={{ cursor: 'pointer' }}
                >
                  Source Type{' '}
                  {sortField === 'source type' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('url')}
                  style={{ cursor: 'pointer' }}
                >
                  Binding URL{' '}
                  {sortField === 'url' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && filteredConfigurations.length === 0 ? (
                <>
                  <SourceRowSkeleton />
                  <SourceRowSkeleton />
                  <SourceRowSkeleton />
                  <SourceRowSkeleton />
                  <SourceRowSkeleton />
                </>
              ) : null}
              {filteredConfigurations.map((configuration) => (
                <Source key={configuration.id} configuration={configuration} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {!filterToType && <Route path={path} component={ServiceRoute} />}
    </>
  )
}

export function SourcesPage({ filterToType }: { filterToType?: string }) {
  return (
    <ExtractedServicesProvider
      app={{ name: 'catalog-app/Sources', description: 'Sources' }}
      fetchServices={COMMANDS.SOURCES.ALLSOURCEINFO}
    >
      <Sources filterToType={filterToType} />
    </ExtractedServicesProvider>
  )
}

export const SourceService = ({ service }: { service: ConfigurationType }) => {
  const { name, configurations } = service

  const url = generateUrlForEditing(name, true)

  return (
    <div style={{ padding: '10px' }}>
      <Link to={url}>
        <Button>{name}</Button>
      </Link>
      <Divider />
      {configurations && configurations.length > 0 && (
        <div className="w-full">
          <SourcesPage filterToType={service.id} />
        </div>
      )}
    </div>
  )
}
