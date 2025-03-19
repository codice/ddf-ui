import * as React from 'react'
import { Step } from './step'
import { InstallerContext } from './installer.pure'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import { COMMANDS } from '../fetch/fetch'

type MetatypeEntryValueTypeSingle = string | number | boolean

type MetatypeEntryValueType =
  | MetatypeEntryValueTypeSingle
  | MetatypeEntryValueTypeSingle[]

type ValueType = {
  metatypeEntries: { id: string; value: MetatypeEntryValueType }[]
  metatypeId: string
  metatypeName: string
}

const configurationsToValue = (
  configurations: ConfigurationType[]
): ValueType[] => {
  return configurations.map((configuration) => {
    return {
      metatypeEntries: configuration.metatype.map((val) => {
        let value = val.value as MetatypeEntryValueType
        if (val.type === 3) {
          //num
          value = val.value.map((subval) => parseInt(subval))
        } else if (val.type === 11) {
          //boolean
          value = val.value.map((subval) => subval === 'true')
        }
        return {
          id: val.id,
          value:
            val.cardinality === 0
              ? (value as MetatypeEntryValueTypeSingle[])[0]
              : value,
        }
      }),
      metatypeId: configuration.id,
      metatypeName: configuration.name,
    }
  })
}

const createPayload = (value: ValueType[]) => {
  return {
    type: 'WRITE',
    mbean:
      'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
    attribute: 'SsoConfigurations',
    value: value,
  }
}

type MetatypeType = {
  value: string[]
  cardinality: number
  defaultValue: string[]
  description: string
  id: string
  name: string
  optionLabels: string[]
  optionValues: string[]
  type: number
}

type ExistingConfigurationType = {
  bundle: number
  bundle_location: string
  bundle_name: string
  enabled: boolean
  id: string
  name: string
  properties: {
    [key: string]: string | boolean | number
  }
}

type ConfigurationType = {
  configurations?: ExistingConfigurationType[]
  factory: boolean
  id: string
  metatype: MetatypeType[]
  name: string
}

type ModeType = 'loading' | 'normal' | 'submitting'

//todo, update this to take from existing configurations rather than default values
export const SSO = () => {
  const [configurations, setConfigurations] = React.useState(
    [] as ConfigurationType[]
  )
  const { nextStep, previousStep } = React.useContext(InstallerContext)

  const [mode, setMode] = React.useState('loading' as ModeType)
  React.useEffect(() => {
    if (mode === 'submitting') {
      COMMANDS.FETCH(
        '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
        {
          method: 'POST',
          body: JSON.stringify(
            createPayload(configurationsToValue(configurations))
          ),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 200) {
            nextStep()
          } else {
            //warn ?
          }
        })
    }
  }, [mode])
  React.useEffect(() => {
    COMMANDS.FETCH(
      '/admin/jolokia/read/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/SsoConfigurations'
    )
      .then((response) => response.json())
      .then((data) => {
        const configurations = data.value as ConfigurationType[]
        configurations.forEach((configuration) => {
          configuration.metatype.forEach((metatype) => {
            metatype.value = metatype.defaultValue.slice(0)
          })
        })
        setConfigurations(configurations)
        setMode('normal')
      })
  }, [])

  switch (mode) {
    case 'normal':
      return (
        <Step
          content={
            <Grid container spacing={3} direction="column">
              <Grid item>
                <Typography variant="h4">
                  Configure connection to a Single Sign On Service
                </Typography>
              </Grid>
              <Grid item>
                <Grid container spacing={3} direction="column">
                  {configurations.map((configuration) => {
                    return (
                      <Grid item xs={12} key={configuration.id}>
                        <Paper style={{ padding: '20px' }}>
                          <Typography
                            variant="h5"
                            align="center"
                            style={{ marginBottom: '10px' }}
                          >
                            {configuration.name}
                          </Typography>
                          <Grid
                            container
                            spacing={3}
                            direction="row"
                            alignItems="center"
                          >
                            {configuration.metatype.map((val) => {
                              if (val.optionLabels.length > 0) {
                                return (
                                  <Grid item xs={12} sm={6} key={val.id}>
                                    <TextField
                                      label={val.name}
                                      select
                                      variant="outlined"
                                      fullWidth
                                      type="number"
                                      value={val.value[0]}
                                      onChange={(e) => {
                                        val.value[0] = e.target.value
                                        setConfigurations(
                                          configurations.slice(0)
                                        )
                                      }}
                                    >
                                      {val.optionLabels.map(
                                        (optionLabel, index) => {
                                          return (
                                            <MenuItem
                                              value={val.optionValues[index]}
                                              key={val.id}
                                            >
                                              {optionLabel}
                                            </MenuItem>
                                          )
                                        }
                                      )}
                                    </TextField>
                                  </Grid>
                                )
                              }
                              switch (val.type) {
                                case 3:
                                  return (
                                    <Grid item xs={12} sm={6} key={val.id}>
                                      <TextField
                                        variant="outlined"
                                        label={val.name}
                                        fullWidth
                                        type="number"
                                        value={val.value[0]}
                                        onChange={(e) => {
                                          val.value[0] = e.target.value
                                          setConfigurations(
                                            configurations.slice(0)
                                          )
                                        }}
                                      />
                                    </Grid>
                                  )
                                case 11:
                                  return (
                                    <Grid item xs={12} sm={6} key={val.id}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            value={val.id}
                                            checked={val.value[0] === 'true'}
                                            onChange={(e: any) => {
                                              val.value[0] = e.target.checked
                                                ? 'true'
                                                : 'false'
                                              setConfigurations(
                                                configurations.slice(0)
                                              )
                                            }}
                                          />
                                        }
                                        label={val.name}
                                      />
                                    </Grid>
                                  )
                                case 1:
                                default:
                                  if (val.cardinality > 0) {
                                    return (
                                      <Grid item xs={12} key={val.id}>
                                        <Grid
                                          container
                                          spacing={3}
                                          alignItems="center"
                                        >
                                          {val.value.map((subval, index) => {
                                            return (
                                              <React.Fragment key={index}>
                                                <Grid item xs={10}>
                                                  <TextField
                                                    variant="outlined"
                                                    label={val.name}
                                                    fullWidth
                                                    value={subval}
                                                    onChange={(e) => {
                                                      val.value[index] =
                                                        e.target.value
                                                      setConfigurations(
                                                        configurations.slice(0)
                                                      )
                                                    }}
                                                  />
                                                </Grid>
                                                <Grid item xs={2}>
                                                  <Button
                                                    variant="outlined"
                                                    onClick={() => {
                                                      val.value.splice(index, 1)
                                                      setConfigurations(
                                                        configurations.slice(0)
                                                      )
                                                    }}
                                                  >
                                                    <RemoveIcon />
                                                  </Button>
                                                </Grid>
                                              </React.Fragment>
                                            )
                                          })}
                                          <Grid item xs={12}>
                                            <Button
                                              fullWidth
                                              variant="outlined"
                                              onClick={() => {
                                                val.value.push('')
                                                setConfigurations(
                                                  configurations.slice(0)
                                                )
                                              }}
                                            >
                                              <AddIcon />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    )
                                  }
                                  return (
                                    <Grid item xs={12} sm={6} key={val.id}>
                                      <TextField
                                        variant="outlined"
                                        label={val.name}
                                        fullWidth
                                        value={val.value[0]}
                                        onChange={(e) => {
                                          val.value[0] = e.target.value
                                          setConfigurations(
                                            configurations.slice(0)
                                          )
                                        }}
                                      />
                                    </Grid>
                                  )
                              }
                            })}
                          </Grid>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </Grid>
            </Grid>
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
                    setMode('submitting')
                  }}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
    case 'loading':
      return <Step content={<CircularProgress />} />
    default:
      return (
        <Step
          content={<Typography>Unknown Mode</Typography>}
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
                  onClick={() => {}}
                  disabled
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
  }
}
