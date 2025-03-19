import * as React from 'react'
import { Step } from './step'
import { InstallerContext } from './installer.pure'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import RemoveIcon from '@material-ui/icons/Remove'

import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import { COMMANDS } from '../fetch/fetch'
import { CreatableSelect } from '../select/select'

const GUEST_CLAIMS_URL =
  '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/getClaimsConfiguration/(service.pid%3Dddf.security.guest.realm)'

const GUEST_CLAIMS_ADD_URL =
  '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/add'

type ServiceType = {
  claims: {
    availableClaims: string[]
    immutableClaims: string[]
  }
  configurations?: {
    bundle: number
    bundle_location: string
    bundle_name: string
    enabled: boolean
    id: string
    name: string
    properties: {
      attributes: string[]
      'service.pid': string
    }
  }[]
  description: string
  factory: boolean
  id: string
  metatype: {
    cardinality: number
    defaultValue: string[]
    description: string
    id: string
    name: string
    optionLabels: any[]
    optionValues: any[]
  }[]
  name: string
  profiles: {
    availableProfiles: {
      [key: string]: string[]
    }
    profileNames: string[]
  }
}

type ModeType =
  | 'loading'
  | 'normal'
  | 'submitting update'
  | 'submitting update guest claims'
const OPERATION_UPDATE = 'update'
const OPERATION_UPDATE_GUEST_CLAIMS_PROFILE = 'updateGuestClaimsProfile'

const createPayload = (
  attributes: AttributeType[],
  operation = OPERATION_UPDATE_GUEST_CLAIMS_PROFILE
) => {
  return {
    type: 'EXEC',
    mbean:
      'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
    operation,
    arguments: [
      'ddf.security.guest.realm',
      {
        attributes: attributes.map((attr) => {
          return `${attr.name}=${attr.value}`
        }),
        'service.pid': 'ddf.security.guest.realm',
      },
    ],
  }
}

type AttributeType = {
  name: string
  value: string
}

export const GuestClaims = () => {
  const { nextStep, previousStep } = React.useContext(InstallerContext)
  const [availableClaims, setAvailableClaims] = React.useState([] as string[])
  const [immutableClaims, setImmutableClaims] = React.useState([] as string[])
  const [mode, setMode] = React.useState('loading' as ModeType)
  const [profile] = React.useState('Default' as string)
  const [attributes, setAttributes] = React.useState([] as AttributeType[])
  const [availableProfiles, setAvailableProfiles] = React.useState(
    [] as string[]
  )
  const [, setService] = React.useState(undefined as ServiceType | undefined)

  React.useEffect(() => {
    if (mode === 'submitting update guest claims') {
      COMMANDS.FETCH(GUEST_CLAIMS_ADD_URL, {
        method: 'POST',
        body: JSON.stringify(createPayload(attributes)),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 200) {
            setMode('submitting update')
          } else {
            // warn?
          }
        })
    }
  }, [mode])
  React.useEffect(() => {
    if (mode === 'submitting update') {
      COMMANDS.FETCH(GUEST_CLAIMS_ADD_URL, {
        method: 'POST',
        body: JSON.stringify(createPayload(attributes, OPERATION_UPDATE)),
      })
        .then((response) => response.text())
        .then((response) => {
          //todo investigate why this returns text that isn't json parseable
          if (response.indexOf(`"status":200`) !== 0) {
            nextStep()
          } else {
            // warn?
          }
        })
    }
  }, [mode])
  React.useEffect(() => {
    if (mode === 'loading') {
      COMMANDS.FETCH(GUEST_CLAIMS_URL)
        .then((response) => response.json())
        .then((data) => {
          const serviceInfo = data.value as ServiceType
          if (serviceInfo.profiles.availableProfiles.Default === undefined) {
            serviceInfo.profiles.availableProfiles.Default =
              serviceInfo.configurations
                ? serviceInfo.configurations[0].properties.attributes
                : serviceInfo.metatype[0].defaultValue
            serviceInfo.profiles.profileNames.push('Default')
          }
          setAvailableProfiles(serviceInfo.profiles.profileNames)
          // @ts-ignore
          setAttributes(
            serviceInfo.profiles.availableProfiles.Default.map((claim) => {
              return {
                name: claim.split('=')[0],
                value: claim.split('=')[1],
              }
            })
          )
          setAvailableClaims(
            serviceInfo.claims.availableClaims.filter((availableClaim) => {
              return (
                serviceInfo.claims.immutableClaims.indexOf(availableClaim) ===
                -1
              )
            })
          )
          setImmutableClaims(serviceInfo.claims.immutableClaims)
          setService(serviceInfo)
          setMode('normal')
        })
    }
  }, [mode])
  switch (mode) {
    case 'loading':
      return <Step content={<CircularProgress />} />
    case 'submitting update guest claims':
    case 'submitting update':
      return (
        <Step
          content={
            <>
              Updating Guest Claims
              <CircularProgress />
            </>
          }
        />
      )
    case 'normal':
      return (
        <Step
          content={
            <>
              <Typography variant="h5">
                Configure guest claims attributes
              </Typography>
              <FormControl fullWidth>
                <FormLabel>Profile</FormLabel>
                <Select value={profile}>
                  {availableProfiles.map((availableProfile) => {
                    return (
                      <MenuItem key={availableProfile} value={availableProfile}>
                        {availableProfile}
                      </MenuItem>
                    )
                  })}
                </Select>
                <div style={{ padding: '20px' }}>
                  <Grid container spacing={3} justify="space-between">
                    <Grid item xs={9}>
                      <Typography>Name</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>Value</Typography>
                    </Grid>
                  </Grid>
                  {attributes.map((attribute, index) => {
                    const required =
                      immutableClaims.indexOf(attribute.name) !== -1
                    return (
                      <Grid
                        key={index}
                        container
                        spacing={3}
                        justify="space-between"
                        style={{ padding: '10px' }}
                        alignItems="center"
                      >
                        <Grid item xs={8}>
                          <CreatableSelect
                            value={[
                              {
                                value: attribute.name,
                                label: attribute.name,
                              },
                            ]}
                            isMulti={false}
                            options={availableClaims.map((availableClaim) => {
                              return {
                                value: availableClaim,
                                label: availableClaim,
                              }
                            })}
                            isDisabled={required}
                            onChange={(e: any) => {
                              attributes[index].name = e.value
                              setAttributes(attributes.slice(0))
                            }}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            disabled={required}
                            value={attribute.value}
                            onChange={(e) => {
                              attributes[index].value = e.target.value
                              setAttributes(attributes.slice(0))
                            }}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            disabled={required}
                            onClick={() => {
                              attributes.splice(index, 1)
                              setAttributes(attributes.slice(0))
                            }}
                          >
                            <RemoveIcon />
                          </Button>
                        </Grid>
                      </Grid>
                    )
                  })}
                </div>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setAttributes(
                      attributes.concat({
                        name: '',
                        value: '',
                      })
                    )
                  }}
                >
                  Add attribute
                </Button>
              </FormControl>
            </>
          }
          footer={
            <Grid container>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    previousStep()
                  }}
                >
                  Previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setMode('submitting update guest claims')
                  }}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
    default:
      return <div>Unknown state</div>
  }
}
