import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import { ExtractedServicesProvider } from '@connexta/kanri/src/main/webapp/components/services/services.provider'
import { useServicesContext } from '@connexta/kanri/src/main/webapp/components/services/services.pure'
import CircularProgress from '@material-ui/core/CircularProgress'
import LinearProgress from '@material-ui/core/LinearProgress'

import Button from '@material-ui/core/Button'
import UploadIcon from '@material-ui/icons/CloudUpload'
import { COMMANDS } from '@connexta/kanri/src/main/webapp/components/fetch/fetch'
import {
  useSnackbar,
  generateDismissSnackbarAction,
} from '@connexta/kanri/src/main/webapp/components/snackbar/snackbar.provider'

type ImageInputType = {
  src: string
  updateSrc: (newSrc: string) => void
}

const ImageInput = ({ src = '', updateSrc }: ImageInputType) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  if (src.includes('postscript')) {
    alert(
      'postscript files are not supported, please convert to svg or png and then upload'
    )
    updateSrc('')
  }
  if (src === '') {
    return (
      <>
        <Button
          onClick={() => {
            if (inputRef.current !== null) {
              inputRef.current.click()
            }
          }}
          variant="outlined"
          color="primary"
        >
          <UploadIcon style={{ marginRight: '10' }} /> Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          onChange={e => {
            const img = e.target
            const reader = new FileReader()
            reader.onload = function(event) {
              const result = event.target ? event.target.result : ''
              updateSrc(result as string)
              img.onload = function() {}
              img.onerror = () => {}
            }
            reader.onerror = () => {}
            const file =
              e.target && e.target.files ? e.target.files[0] : new Blob()
            reader.readAsDataURL(file)
          }}
          style={{ display: 'none' }}
        />
      </>
    )
  }

  return (
    <>
      <Grid container alignItems="stretch">
        <Grid item>
          <Button
            onClick={() => {
              if (inputRef.current !== null) {
                inputRef.current.click()
              }
            }}
            style={{
              height: '100%',
            }}
            color="primary"
          >
            Upload
          </Button>
        </Grid>
        <Grid item>
          <img
            src={src}
            style={{
              maxHeight: 200,
              maxWidth: 200,
              minHeight: src.includes('image/svg') ? 200 : 0,
              minWidth: src.includes('image/svg') ? 200 : 0,
            }}
          />
        </Grid>

        <Grid item>
          <Button
            style={{
              height: '100%',
            }}
            color="secondary"
            onClick={() => {
              updateSrc('')
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
      <>
        <input
          ref={inputRef}
          type="file"
          onChange={e => {
            const img = e.target
            const reader = new FileReader()
            reader.onload = function(event) {
              const result = event.target ? event.target.result : ''
              updateSrc(result as string)
              img.onload = function() {}
              img.onerror = () => {}
            }
            reader.onerror = () => {}
            const file =
              e.target && e.target.files ? e.target.files[0] : new Blob()
            reader.readAsDataURL(file)
          }}
          style={{ display: 'none' }}
        />
      </>
    </>
  )
}

type BrandingPropertiesType = {
  landingPageBackgroundSrc: string
  topLeftLogoSrc: string
  bottomLeftLogoSrc: string
  bottomLeftBackgroundSrc: string
  menuIconSrc: string
}

const brandingConfigurationId = 'org.codice.ddf.catalog.ui'

const BrandingContents = () => {
  const { fetchServices } = useServicesContext()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [loading, setLoading] = React.useState(false)
  const [state, setState] = React.useState({
    landingPageBackgroundSrc: '',
    topLeftLogoSrc: '',
    bottomLeftLogoSrc: '',
    bottomLeftBackgroundSrc: '',
    menuIconSrc: '',
  } as BrandingPropertiesType)
  const { services } = useServicesContext()

  const brandingService = services.find(
    service => service.id === brandingConfigurationId
  )

  const submit = () => {
    setLoading(true)
    COMMANDS.CONFIGURATION.EDIT({
      body: {
        arguments: [
          brandingConfigurationId,
          {
            'service.factoryPid': brandingConfigurationId,
            'service.pid': brandingConfigurationId,
            ...state,
          },
        ],
        operation: 'update',
        type: 'EXEC',
        mbean:
          'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
      },
    }).then(response => {
      if (!response.success) {
        enqueueSnackbar(`Branding update failed`, {
          variant: 'error',
          persist: true,
          action: generateDismissSnackbarAction({ closeSnackbar }),
        })
        setLoading(false)
      } else {
        fetchServices().then(() => {
          enqueueSnackbar(`Branding updated`, {
            variant: 'success',
            autoHideDuration: 2000,
            action: generateDismissSnackbarAction({ closeSnackbar }),
          })
          setLoading(false)
        })
      }
    })
  }

  React.useEffect(
    () => {
      if (brandingService !== undefined) {
        const currentProperties = (brandingService.configurations
          ? brandingService.configurations[0].properties
          : {}) as BrandingPropertiesType
        setState({
          ...currentProperties,
        })
        setLoading(false)
      }
    },
    [services]
  )

  if (services.length === 0 && brandingService === undefined) {
    return <CircularProgress size={250} />
  } else if (brandingService === undefined) {
    return (
      <>
        <Typography variant="h2">Branding</Typography>
        <Typography variant="h3">
          Check to ensure the {brandingConfigurationId} is available.
        </Typography>
      </>
    )
  }

  return (
    <>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Typography variant="h2">Branding</Typography>
        </Grid>
        <Divider />
        <Grid item>
          <Grid container spacing={3} direction="row">
            <Grid item xs={12} sm={12}>
              <Grid container spacing={3} direction="column">
                <Grid item>
                  <Typography variant="h5">Menu Icon</Typography>
                  <ImageInput
                    src={state.menuIconSrc}
                    updateSrc={(newSrc: string) => {
                      setState({
                        ...state,
                        menuIconSrc: newSrc,
                      })
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h5">Top Left Logo</Typography>
                  <ImageInput
                    src={state.topLeftLogoSrc}
                    updateSrc={(newSrc: string) => {
                      setState({
                        ...state,
                        topLeftLogoSrc: newSrc,
                      })
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h5">Bottom Left Logo</Typography>
                  <ImageInput
                    src={state.bottomLeftLogoSrc}
                    updateSrc={(newSrc: string) => {
                      setState({
                        ...state,
                        bottomLeftLogoSrc: newSrc,
                      })
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h5">Landing Page Background</Typography>
                  <ImageInput
                    src={state.landingPageBackgroundSrc}
                    updateSrc={(newSrc: string) => {
                      setState({
                        ...state,
                        landingPageBackgroundSrc: newSrc,
                      })
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h5">Bottom Left Background</Typography>
                  <ImageInput
                    src={state.bottomLeftBackgroundSrc}
                    updateSrc={(newSrc: string) => {
                      setState({
                        ...state,
                        bottomLeftBackgroundSrc: newSrc,
                      })
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid item>
          <Button
            onClick={() => {
              setLoading(true)
              fetchServices()
            }}
            color="secondary"
            disabled={loading}
          >
            Reset Changes
          </Button>
          <Button
            onClick={submit}
            color="primary"
            variant="contained"
            disabled={loading}
            style={{ position: 'relative' }}
          >
            Save
            {loading ? (
              <LinearProgress
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0.2,
                }}
              />
            ) : null}
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export const Branding = () => {
  return (
    <ExtractedServicesProvider>
      <BrandingContents />
    </ExtractedServicesProvider>
  )
}
