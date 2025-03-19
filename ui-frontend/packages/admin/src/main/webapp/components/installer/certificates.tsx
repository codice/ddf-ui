import * as React from 'react'
import { InstallerContext } from './installer.pure'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Step } from './step'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dropzone from 'dropzone'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import InfoIcon from '@material-ui/icons/Info'

import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'

import { createGlobalStyle } from 'styled-components'
import { COMMANDS } from '../fetch/fetch'
import { setType } from '../../typescript/hooks'

const SYSTEM_PROPERTIES_READ_URL =
  '/admin/jolokia/exec/org.codice.ddf.ui.admin.api:type=SystemPropertiesAdminMBean/readSystemProperties'

const CERTIFICATE_REPLACE_URL =
  '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/replaceSystemStores'

const CERTIFICATE_DEMO_URL =
  '/admin/jolokia/exec/org.codice.ddf.security.certificate.generator.CertificateGenerator:service=certgenerator/configureDemoCert'

const getDemoPayload = ({ hostName }: { hostName: string }) => {
  return {
    type: 'EXEC',
    mbean:
      'org.codice.ddf.security.certificate.generator.CertificateGenerator:service=certgenerator',
    operation: 'configureDemoCert',
    arguments: [hostName],
  }
}

const getReplacePayload = ({
  hostName,
  keyPass,
  keystorePass,
  keystoreFile,
  keystoreFileName,
  truststorePass,
  truststoreFile,
  truststoreFileName,
}: {
  hostName: string
  keyPass: string
  keystorePass: string
  keystoreFile: string
  keystoreFileName: string
  truststorePass: string
  truststoreFile: string
  truststoreFileName: string
}) => {
  return {
    type: 'EXEC',
    mbean:
      'org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore',
    operation: 'replaceSystemStores',
    arguments: [
      hostName,
      keyPass,
      keystorePass,
      keystoreFile,
      keystoreFileName,
      truststorePass,
      truststoreFile,
      truststoreFileName,
    ],
  }
}

type ModeType = 'loading' | 'normal' | 'submitting'
type AttributeType = {
  defaultValue: string
  description: string
  /**
   * ID for attr on backend
   */
  key: string
  options: null
  /**
   * Human Readable Name
   */
  title: string
  value: string
}

const DropzoneStyles = createGlobalStyle`
  .dz-preview {
    display: none;
  }
`

type SubModeType = 'skip' | 'provide' | 'demo'

const Submitting = ({ subMode }: { subMode: SubModeType }) => {
  switch (subMode) {
    case 'demo':
      return (
        <>
          <Typography variant="h6">Installing demo certficates</Typography>
          <CircularProgress />
        </>
      )
    case 'skip':
      return (
        <>
          <Typography variant="h6">Skipping certificates</Typography>
          <CircularProgress />
        </>
      )
    case 'provide':
      return (
        <>
          <Typography variant="h6">Installing certficates</Typography>
          <CircularProgress />
        </>
      )
  }
}

/**
 * Todo, go back and rip out dropzone since we're just base64 encoding to send later.  Or do real time validation.
 */
export const Certificates = () => {
  const [subMode, setSubMode] = React.useState('skip' as SubModeType)
  const [errors, setErrors] = React.useState([] as string[])
  const { nextStep, previousStep } = React.useContext(InstallerContext)
  const [hostName, setHostName] = React.useState(
    undefined as AttributeType | undefined
  )
  const [keystoreFile, setKeystoreFile] = React.useState('')
  const [keystoreFileName, setKeystoreFileName] = React.useState('')
  const [keystorePass, setKeystorePass] = React.useState('')
  const [keyPass, setKeyPass] = React.useState('')
  const [truststoreFile, setTruststoreFile] = React.useState('')
  const [truststoreFileName, setTruststoreFileName] = React.useState('')
  const [truststorePass, setTruststorePass] = React.useState('')
  const [mode, setMode] = React.useState('loading' as ModeType)
  const keystoreDropzoneRef = React.useRef<HTMLDivElement>()
  React.useEffect(() => {
    if (
      mode === 'normal' &&
      subMode === 'provide' &&
      keystoreDropzoneRef.current
    ) {
      new Dropzone(keystoreDropzoneRef.current, {
        url: '../services/content',
        complete: (file) => {
          const fileReader = new FileReader()
          fileReader.onloadend = () => {
            const result = fileReader.result as string
            setKeystoreFile(result.split(',')[1])
          }
          setKeystoreFileName(file.name)
          fileReader.readAsDataURL(file)
        },
      })
    }
  }, [mode, subMode])
  const truststoreDropzoneRef = React.useRef<HTMLDivElement>()
  React.useEffect(() => {
    if (
      mode === 'normal' &&
      subMode === 'provide' &&
      truststoreDropzoneRef.current
    ) {
      new Dropzone(truststoreDropzoneRef.current, {
        url: '../services/content',
        complete: (file) => {
          const fileReader = new FileReader()
          fileReader.onloadend = () => {
            const result = fileReader.result as string
            setTruststoreFile(result.split(',')[1])
          }
          setTruststoreFileName(file.name)
          fileReader.readAsDataURL(file)
        },
        clickable: true,
      })
    }
  }, [mode, subMode])

  React.useEffect(() => {
    if (mode === 'loading') {
      COMMANDS.FETCH(SYSTEM_PROPERTIES_READ_URL)
        .then((response) => response.json())
        .then((data) => {
          setHostName(
            data.value.filter(
              (attr: AttributeType) =>
                attr.key === 'org.codice.ddf.system.hostname'
            )[0]
          )
          setMode('normal')
        })
    }
  }, [mode])
  React.useEffect(() => {
    if (mode === 'submitting' && hostName) {
      if (subMode === 'demo') {
        COMMANDS.FETCH(CERTIFICATE_DEMO_URL, {
          method: 'POST',
          body: JSON.stringify(getDemoPayload({ hostName: hostName.value })),
        }).then(() => {
          //todo verify this with someone
          nextStep()
        })
      } else if (subMode === 'provide') {
        COMMANDS.FETCH(CERTIFICATE_REPLACE_URL, {
          method: 'POST',
          body: JSON.stringify(
            getReplacePayload({
              hostName: hostName.value,
              keyPass,
              keystorePass,
              keystoreFile,
              keystoreFileName,
              truststoreFile,
              truststoreFileName,
              truststorePass,
            })
          ),
        })
          .then((response) => response.json())
          .then((data) => {
            const errors = data.value as string[]
            if (errors.length > 0) {
              setErrors(errors)
              setMode('normal')
            } else {
              nextStep()
            }
          })
      } else {
        nextStep()
      }
    }
  }, [mode])
  switch (mode) {
    case 'submitting':
      return <Step content={<Submitting subMode={subMode} />} />
    case 'normal':
      if (hostName === undefined) {
        return (
          <>
            <Step
              content={<div>Could not get hostname</div>}
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
          </>
        )
      }
      return (
        <SubModeComponent
          mode={subMode}
          setSubMode={setSubMode}
          setMode={setMode}
          keystoreDropzoneRef={keystoreDropzoneRef}
          keystoreFileName={keystoreFileName}
          keyPass={keyPass}
          keystorePass={keystorePass}
          setKeyPass={setKeyPass}
          setTruststorePass={setTruststorePass}
          setKeystorePass={setKeystorePass}
          truststoreDropzoneRef={truststoreDropzoneRef}
          truststoreFileName={truststoreFileName}
          truststorePass={truststorePass}
          errors={errors}
          hostName={hostName}
        />
      )
    case 'loading':
      return (
        <Step
          content={<CircularProgress />}
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
    default:
      return (
        <Step
          content={<div>Unknown Mode</div>}
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

export const TopMatter = ({
  mode,
  setSubMode,
}: {
  mode: SubModeType
  setSubMode: setType<SubModeType>
}) => {
  return (
    <>
      <Grid item>
        <Typography variant="h4">Certificates</Typography>
      </Grid>
      <Grid item>
        <Select
          fullWidth
          value={mode}
          variant="outlined"
          onChange={(e) => {
            setSubMode(e.target.value as SubModeType)
          }}
        >
          <MenuItem value="skip">Skip Certs</MenuItem>
          <MenuItem value="provide">Provide Certs</MenuItem>
          <MenuItem value="demo">Use Demo Certs</MenuItem>
        </Select>
      </Grid>
    </>
  )
}

const BottomMatter = ({ setMode }: { setMode: setType<ModeType> }) => {
  const { previousStep } = React.useContext(InstallerContext)

  return (
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
  )
}

export const SubModeComponent = ({
  mode,
  setSubMode,
  setMode,
  keystoreDropzoneRef,
  keystoreFileName,
  keystorePass,
  setKeystorePass,
  keyPass,
  setKeyPass,
  truststoreDropzoneRef,
  truststoreFileName,
  truststorePass,
  setTruststorePass,
  errors,
  hostName,
}: {
  mode: SubModeType
  setSubMode: setType<SubModeType>
  setMode: setType<ModeType>
  keystoreDropzoneRef: React.MutableRefObject<HTMLDivElement | undefined>
  keystoreFileName: string
  keystorePass: string
  setKeystorePass: setType<string>
  keyPass: string
  setKeyPass: setType<string>
  truststoreDropzoneRef: React.MutableRefObject<HTMLDivElement | undefined>
  truststoreFileName: string
  truststorePass: string
  setTruststorePass: setType<string>
  errors: string[]
  hostName: AttributeType
}) => {
  switch (mode) {
    case 'skip':
      return (
        <Step
          content={
            <Grid container spacing={3} direction="column">
              <TopMatter mode={mode} setSubMode={setSubMode} />
            </Grid>
          }
          footer={<BottomMatter setMode={setMode} />}
        />
      )
    case 'demo':
      return (
        <Step
          content={
            <Grid container spacing={3} direction="column">
              <TopMatter mode={mode} setSubMode={setSubMode} />
            </Grid>
          }
          footer={<BottomMatter setMode={setMode} />}
        />
      )
    case 'provide':
    default:
      return (
        <Step
          content={
            <Grid container spacing={3} direction="column">
              <DropzoneStyles />
              <TopMatter mode={mode} setSubMode={setSubMode} />
              <Grid container spacing={3}>
                <Grid item sm={12}>
                  <Typography variant="h5" align="center">
                    Add Keystore{' '}
                    <Tooltip title="This is a keystore file in jks or pkcs12 format that contains the system's private key and associated CA. The CN of the private key should match that of the configured hostname/FQDN.">
                      <InfoIcon />
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <div
                    style={{
                      width: '100%',
                      border: 'dashed medium black',
                      padding: '10px',
                    }}
                  >
                    <Grid
                      container
                      direction="column"
                      spacing={3}
                      alignItems="center"
                      ref={keystoreDropzoneRef as any}
                      onClick={() => {
                        if (keystoreDropzoneRef.current) {
                          keystoreDropzoneRef.current.click()
                        }
                      }}
                    >
                      <Grid item>
                        <Button variant="outlined" style={{ padding: '10px' }}>
                          <AddIcon />
                          Select file to upload
                        </Button>
                      </Grid>
                      <Grid item>
                        <Typography>OR drag file to this box</Typography>
                      </Grid>
                      {keystoreFileName !== '' ? (
                        <Grid item>{keystoreFileName}</Grid>
                      ) : null}
                    </Grid>
                  </div>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Grid container spacing={3} direction="column">
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        label="Keystore Password"
                        value={keystorePass}
                        onChange={(e) => {
                          setKeystorePass(e.target.value)
                        }}
                        type="password"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        label="Private Key Password"
                        value={keyPass}
                        onChange={(e) => {
                          setKeyPass(e.target.value)
                        }}
                        type="password"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sm={12}>
                  <Typography variant="h5" align="center">
                    Add Truststore
                    <Tooltip title="This is a keystore file in jks or pkcs12 format that contains the trusted CA certificates. At a minimum must contain one CA associated with the system's private key.">
                      <InfoIcon />
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <div
                    style={{
                      width: '100%',
                      border: 'dashed medium black',
                      padding: '10px',
                    }}
                  >
                    <Grid
                      container
                      direction="column"
                      spacing={3}
                      alignItems="center"
                      ref={truststoreDropzoneRef as any}
                      onClick={() => {
                        if (truststoreDropzoneRef.current) {
                          truststoreDropzoneRef.current.click()
                        }
                      }}
                    >
                      <Grid item>
                        <Button variant="outlined" style={{ padding: '10px' }}>
                          <AddIcon />
                          Select file to upload
                        </Button>
                      </Grid>
                      <Grid item>
                        <Typography>OR drag file to this box</Typography>
                      </Grid>
                      {truststoreFileName !== '' ? (
                        <Grid item>{truststoreFileName}</Grid>
                      ) : null}
                    </Grid>
                  </div>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Truststore Password"
                    value={truststorePass}
                    onChange={(e) => {
                      setTruststorePass(e.target.value)
                    }}
                    type="password"
                  />
                </Grid>
              </Grid>
              {errors.length > 0 ? (
                <div>
                  <Typography variant="h6" color="secondary">
                    Something went wrong!
                  </Typography>
                  {errors.map((err) => {
                    return (
                      <>
                        <Typography variant="body1" color="secondary">
                          {err.indexOf(
                            'Keystore does not contain the required key'
                          ) !== -1
                            ? `Keystore does not contain the required key for the given hostname: ${hostName.value}`
                            : err}
                        </Typography>
                        <Typography variant="body1" color="secondary">
                          {err.indexOf(
                            'Keystore does not contain the required key'
                          ) !== -1
                            ? 'Either update the keystore or return to the previous step and update the given hostname.'
                            : ''}
                        </Typography>
                      </>
                    )
                  })}
                </div>
              ) : null}
            </Grid>
          }
          footer={<BottomMatter setMode={setMode} />}
        />
      )
  }
}
