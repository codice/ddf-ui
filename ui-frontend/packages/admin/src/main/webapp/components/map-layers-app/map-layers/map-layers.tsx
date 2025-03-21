/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React, { useState } from 'react'

import { Map, fromJS } from 'immutable'
import { connect } from 'react-redux'

import {
  Checkbox,
  Dialog,
  Button,
  Box,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  FormControlLabel,
  Typography,
  Link,
  DialogActions,
  LinearProgress,
} from '@material-ui/core'
import { useSnackbar } from '../../snackbar/snackbar.provider'
import {
  Add as ContentAdd,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  ArrowUpward as SortUp,
  ArrowDownward as SortDown,
  ExpandMore,
} from '@material-ui/icons'

import { useTheme, withTheme } from '@material-ui/core/styles'

import options from './options'

import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'

import {
  // actions
  set,
  fetch,
  update,
  save,
  validate,
  validateJson,
  validateStructure,
  reset,
  message,
  setInvalid,

  // selectors
  getProviders,
  isLoading,
  hasChanges,
  getMessage,
  getInvalid,
} from './reducer'

const DeleteIconThemed = withTheme(({ theme }: { theme: any }) => (
  <DeleteIcon style={{ color: theme.palette.error.main }} />
))

const Warning = withTheme(
  ({ children, theme }: { children: React.ReactNode; theme: any }) => (
    <Box
      display="flex"
      style={{ color: theme.palette.warning.main }}
      alignItems="center"
    >
      <Box pr={1}>
        <WarningIcon color="inherit" />
      </Box>
      <div>{children}</div>
    </Box>
  )
)

const implementationSupport = (implementors: string[]) => {
  if (!implementors.includes('ol')) {
    return '3D Only'
  } else if (!implementors.includes('cesium')) {
    return '2D Only'
  }
  return null
}

let Error = withTheme(
  ({
    theme: { palette },
    errorText,
    children,
  }: {
    theme: { palette: any }
    errorText: any
    children: React.ReactNode
  }) => (
    <div>
      <div
        style={{
          border: `2px solid ${
            errorText !== undefined
              ? palette.error.main
              : palette.action.disabled
          }`,
          borderRadius: 2,
        }}
      >
        {children}
      </div>
      <div
        style={{ color: palette.error.main, marginTop: 8, fontSize: '0.8em' }}
      >
        {errorText}
      </div>
    </div>
  )
)

let Description = withTheme(
  ({
    theme: { palette },
    children,
  }: {
    theme: { palette: any }
    children: React.ReactNode
  }) => <p style={{ color: palette.text.primary }}>{children}</p>
)

const bool = (value: any) => (typeof value === 'boolean' ? value : false)

const ProviderEditor = ({
  provider,
  onUpdate,
  buffer,
  onEdit,
  error = Map(),
}: {
  provider: any
  onUpdate: (value: any, path: any) => void
  buffer: any
  onEdit: (value: any) => void
  error: any
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  return (
    <div className="flex flex-col gap-4 p-4">
      <TextField
        variant="outlined"
        onChange={(e: any) => onUpdate(e.target.value, 'name')}
        fullWidth
        value={provider.get('name') || ''}
        id="name"
        label="Name"
      />
      <TextField
        variant="outlined"
        onChange={(e: any) => onUpdate(e.target.value, 'url')}
        fullWidth
        value={provider.get('url') || ''}
        id="provider-url"
        label="Provider URL"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={bool(provider.get('proxyEnabled'))}
            onChange={(e: any) => {
              onUpdate(e.target.checked, 'proxyEnabled')
            }}
          />
        }
        label="Proxy Imagery Provider URL"
      />
      <div className="flex flex-row gap-2 flex-nowrap items-center justify-start">
        <FormControlLabel
          control={
            <Checkbox
              checked={bool(provider.get('withCredentials'))}
              onChange={(e: any) => {
                onUpdate(e.target.checked, 'withCredentials')
              }}
            />
          }
          label="Allow Credential Forwarding"
        />
        {bool(provider.get('withCredentials')) ? (
          <Warning>
            Requests will fail if the server does not prompt for credentials
          </Warning>
        ) : null}
      </div>
      <div className="flex flex-row gap-2 flex-nowrap items-center justify-start">
        <Select
          variant="outlined"
          label="Provider Type"
          fullWidth
          value={provider.get('type') || ''}
          onChange={(e: any) => {
            const value = e.target.value
            onUpdate(value, 'type')
          }}
        >
          {Object.keys(options).map((type: any, i: any) => (
            <MenuItem key={i} value={type}>
              <Box display="flex" flex="1" justifyContent="space-between">
                <div>{options[type].label}</div>
                <div>
                  {implementationSupport(Object.keys(options[type].help))}
                </div>
              </Box>
            </MenuItem>
          ))}
        </Select>
        <TextField
          variant="outlined"
          type="number"
          inputProps={{
            step: 0.01,
          }}
          value={
            typeof provider.get('alpha') === 'number'
              ? provider.get('alpha')
              : ''
          }
          label="Alpha (0 - 1)"
          fullWidth
          onChange={(e: any) => {
            const value = e.target.value
            if (value === '') {
              onUpdate('', 'alpha')
            } else {
              const n = Number(value)
              if (!(n < 0 || n > 1)) {
                onUpdate(n, 'alpha')
              }
            }
          }}
        />
      </div>
      <FormControlLabel
        control={
          <Checkbox
            id="show"
            checked={bool(provider.get('show'))}
            onChange={(e: any) => {
              const value = e.target.checked
              onUpdate(value, 'show')
            }}
          />
        }
        label="Show"
      />
      <FormControlLabel
        control={
          <Checkbox
            id="transparent"
            checked={bool(provider.getIn(['parameters', 'transparent']))}
            onChange={(e: any) => {
              const value = e.target.checked
              onUpdate(value, ['parameters', 'transparent'])
              if (value) {
                onUpdate('image/png', ['parameters', 'format'])
              } else {
                onUpdate('', ['parameters', 'format'])
              }
            }}
          />
        }
        label="Transparent"
      />
      <div>
        <Button
          fullWidth
          className="!flex !flex-row gap-2 flex-nowrap items-center !justify-between"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Typography>Advanced Configuration</Typography>
          <ExpandMore />
        </Button>
        {showAdvanced ? (
          <>
            <div>
              <div key="description" style={{ margin: '0 15px' }}>
                <Description>
                  Advanced provider configuration is specified in the{' '}
                  <Link target="_blank" href="http://www.json.org">
                    JSON
                  </Link>{' '}
                  format. Configuration properties can be found at the provided
                  documentation links.
                </Description>
              </div>
              {options[provider.get('type')] !== undefined ? (
                <div
                  key="docs"
                  style={{
                    textAlign: 'center',
                    margin: '0 15px',
                    marginBottom: 20,
                  }}
                >
                  <Button
                    color="primary"
                    component="a"
                    target="_blank"
                    disabled={
                      options[provider.get('type')].help.ol === undefined
                    }
                    href={options[provider.get('type')].help.ol}
                  >
                    openlayers docs
                  </Button>
                  <Button
                    color="primary"
                    component="a"
                    target="_blank"
                    disabled={
                      options[provider.get('type')].help.cesium === undefined
                    }
                    href={options[provider.get('type')].help.cesium}
                  >
                    cesium docs
                  </Button>
                </div>
              ) : null}
              <div key="ace" style={{ margin: '0 15px' }}>
                <Error
                  errorText={
                    [
                      'buffer',
                      'proxyEnabled',
                      'order',
                      'show',
                      'withCredentials',
                    ]
                      .map((key) => error.get(key))
                      .filter((msg) => msg !== undefined)[0]
                  }
                >
                  <AceEditor
                    mode="json"
                    theme="github"
                    fontSize={15}
                    tabSize={2}
                    width="100%"
                    height="400px"
                    editorProps={{
                      $blockScrolling: Infinity,
                    }}
                    enableBasicAutocompletion
                    name={provider.get('url')}
                    value={buffer}
                    onChange={onEdit}
                  />
                </Error>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

const FixConfig = ({
  buffer,
  error,
  onUpdate,
  onDiscard,
  onSave,
}: {
  buffer: any
  error: any
  onUpdate: (buffer: any) => void
  onDiscard: () => void
  onSave: () => void
}) => {
  return (
    <Dialog
      open
      onClose={onDiscard}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <div>
        <h2 id="alert-dialog-title">Invalid Map Layer Configuration Found</h2>
        <p id="alert-dialog-description">
          Existing map layers configuration was found to be invalid. You can
          edit the JSON here and keep or discard the existing configuration.
        </p>
        <Error errorText={error}>
          {/* @ts-ignore */}
          <AceEditor
            mode="json"
            theme="github"
            fontSize={15}
            tabSize={2}
            width="100%"
            height="400px"
            editorProps={{
              $blockScrolling: Infinity,
            }}
            enableBasicAutocompletion
            name="json-editor"
            value={buffer}
            onChange={onUpdate}
          />
        </Error>
      </div>
      <DialogActions>
        <Button onClick={onDiscard}>discard</Button>
        <Button onClick={onSave}>keep</Button>
      </DialogActions>
    </Dialog>
  )
}

const MapLayers = (props: any) => {
  const {
    // actions
    onFetch,
    onUpdate,
    onSave,
    onReset,
    onSetInvalid,
    onSet,

    // data
    disabled,
    providers = [],
    errors,
    loading,
    message,
    invalid,
  } = props
  const { enqueueSnackbar } = useSnackbar()

  React.useEffect(() => {
    if (message.text !== undefined) {
      enqueueSnackbar(message.text, {
        variant: message.type,
      })
    }
  }, [message])
  const theme = useTheme()
  React.useEffect(() => {
    onFetch()
  }, [])
  if (loading) {
    return <LinearProgress />
  }
  return (
    <div className="max-w-[1000px] mx-auto pb-[50%]">
      <div
        className={`flex items-center justify-between sticky top-0 z-10 py-4 px-4 ${
          theme.palette.type === 'dark' ? 'bg-[#121212]' : 'bg-white'
        }`}
      >
        <div className="text-3xl">Map Layers Configuration</div>
        <div>
          <Button
            disabled={disabled}
            color="primary"
            variant="contained"
            onClick={onSave}
            style={{ marginRight: 10 }}
          >
            save
          </Button>
          <Button disabled={disabled} color="secondary" onClick={onReset}>
            reset
          </Button>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Description>
          The following form allows users to configure imagery providers for{' '}
          <Link target="_blank" href="../../search/catalog">
            Intrigue
          </Link>
          .
        </Description>
        <Description>
          Some provider types are currently only supported by the 2D{' '}
          <Link target="_blank" href="https://openlayers.org">
            Openlayers
          </Link>{' '}
          map and some only by the 3D{' '}
          <Link target="_blank" href="https://cesium.com/platform/cesiumjs/">
            Cesium
          </Link>{' '}
          map.
        </Description>
        {providers.map((provider: any, i: any) => (
          <Paper key={i} className="relative mt-5">
            <div className="flex flex-row items-center py-2 px-4 justify-between">
              <div className="text-center font-bold text-2xl">
                {i === 0 ? <div>Topmost Layer (1)</div> : null}
                {i > 0 && i === providers.size - 1 ? (
                  <div>Bottommost Layer ({providers.size})</div>
                ) : null}
                {i > 0 && i < providers.size - 1 ? (
                  <div>
                    Layer {i + 1} of {providers.size}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-row gap-2 items-center">
                {i < providers.size - 1 ? (
                  <IconButton
                    onClick={() => {
                      onUpdate(i + 1, [i, 'layer', 'order'])
                      onUpdate(i, [i + 1, 'layer', 'order'])
                    }}
                  >
                    <SortDown />
                  </IconButton>
                ) : null}
                {i > 0 ? (
                  <IconButton
                    title="Move Up"
                    onClick={() => {
                      onUpdate(i - 1, [i, 'layer', 'order'])
                      onUpdate(i, [i - 1, 'layer', 'order'])
                    }}
                  >
                    <SortUp />
                  </IconButton>
                ) : null}
                <IconButton
                  title="Delete Layer"
                  onClick={() => onUpdate(null, [i])}
                >
                  <DeleteIconThemed />
                </IconButton>
              </div>
            </div>
            <ProviderEditor
              error={errors.get(i)}
              provider={provider.get('layer')}
              onUpdate={(value: any, path = []) =>
                onUpdate(value, [i, 'layer'].concat(path))
              }
              buffer={provider.get('buffer')}
              onEdit={(value: any) => onUpdate(value, [i, 'buffer'])}
            />
          </Paper>
        ))}

        <Box style={{ padding: 20 }} display="flex" justifyContent="center">
          <IconButton
            onClick={() =>
              onUpdate(undefined, [providers.length || providers.size])
            }
          >
            <ContentAdd />
          </IconButton>
        </Box>
      </div>
      {invalid !== null ? (
        <FixConfig
          buffer={invalid}
          onSave={() => {
            const imageryProviders = JSON.parse(invalid)
            onSet(fromJS({ imageryProviders }))
            onSetInvalid(null)
          }}
          onDiscard={() => onSetInvalid(null)}
          onUpdate={(buffer: any) => onSetInvalid(buffer)}
          error={
            validateJson(invalid) || validateStructure(JSON.parse(invalid))
          }
        />
      ) : null}
    </div>
  )
}

export default connect(
  (state) => {
    const providers = getProviders(state)
    const errors = validate(providers)
    const loading = isLoading(state)
    const disabled = !hasChanges(state)
    const message = getMessage(state)
    const invalid = getInvalid(state)
    return { providers, errors, loading, disabled, message, invalid }
  },
  {
    onFetch: fetch,
    onUpdate: update,
    onSave: save,
    onReset: reset,
    onMessage: message,
    onSetInvalid: setInvalid,
    onSet: set,
  }
)(MapLayers)
