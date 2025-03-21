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
import React, { ReactNode } from 'react'
import { connect } from 'react-redux'
import { CardMedia, CardContent, CardHeader, Paper } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import { useTheme, withTheme, WithTheme } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'
import { Map } from 'immutable'

import {
  // actions
  fetch,
  update,
  save,
  rendered,
  validate,
  reset,
  message,

  // selectors
  getBuffer,
  isLoading,
  hasChanges,
  getMessage,
} from './reducer'

interface SpinnerProps {
  submitting?: boolean
  children: ReactNode
}

interface ErrorProps extends WithTheme {
  errorText?: string
  children: ReactNode
}

interface LinkProps extends WithTheme {
  children: ReactNode
  [key: string]: any
}

interface LayoutEditorProps {
  onRender: () => void
}

interface ConfigEditorProps {
  buffer: string
  onEdit: (value: string) => void
  error?: string
}

interface Message {
  text?: string
  action?: string
}

interface MapLayersProps {
  onFetch: () => any
  onRender: () => any
  onUpdate: (value: string, field: string) => any
  onSave: () => any
  onReset: () => any
  onMessage: (text?: string, action?: string) => any
  disabled: boolean
  buffer: Map<string, any>
  error?: string
  loading: boolean
  message: Message
}

const submittingStyle = {
  position: 'absolute' as const,
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  background: 'rgba(0, 0, 0, 0.1)',
  zIndex: 9001,
}

const Spinner = ({ submitting = false, children }: SpinnerProps) => (
  <div className="relative">
    {submitting ? (
      <div style={submittingStyle} className="flex justify-center items-center">
        <CircularProgress size={60} thickness={7} />
      </div>
    ) : null}
    {children}
  </div>
)
const Error = withTheme(({ theme, errorText, children }: ErrorProps) => (
  <div>
    <div
      style={{
        border: `2px solid ${
          errorText !== undefined
            ? theme.palette.error.main
            : theme.palette.action.disabled
        }`,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      {children}
    </div>
    <Typography variant="caption" color="error" className="mt-2">
      {errorText}
    </Typography>
  </div>
))
const Link = withTheme(({ theme, children, ...props }: LinkProps) => (
  <a style={{ color: theme.palette.primary.main }} {...props}>
    {children}
  </a>
))

const LayoutEditor = ({ onRender }: LayoutEditorProps) => {
  React.useEffect(() => {
    onRender()
  }, [])
  return <div id="layoutContainer" className="h-[650px]" />
}

const ConfigEditor = ({ buffer, onEdit, error }: ConfigEditorProps) => (
  <div className="p-4">
    <div className="text-center mx-4 mb-5">
      <Button
        color="primary"
        target="_blank"
        href="http://golden-layout.com/docs/ItemConfig.html"
      >
        Window Items
      </Button>
    </div>
    <div className="mx-4">
      <Error errorText={error}>
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
          name="layoutConfig"
          value={buffer}
          onChange={onEdit}
        />
      </Error>
    </div>
  </div>
)

const MapLayers = ({
  onFetch,
  onRender,
  onUpdate,
  onSave,
  onReset,
  onMessage,
  disabled,
  buffer,
  error,
  loading,
  message,
}: MapLayersProps) => {
  const theme = useTheme()

  React.useEffect(() => {
    onFetch()
  }, [])
  return (
    <div className="max-w-[1000px] mx-auto pb-[50%]">
      <Spinner submitting={loading}>
        <div
          className={`flex items-center justify-between sticky top-0 z-10 py-4 px-4 ${
            theme.palette.type === 'dark' ? 'bg-[#121212]' : 'bg-white'
          } border-b border-gray-300`}
        >
          <div className="text-3xl">Default Layout Configuration</div>
          <div>
            <Button
              disabled={disabled}
              color="primary"
              variant="contained"
              onClick={onSave}
              className="mr-2"
            >
              save
            </Button>
            <Button disabled={disabled} color="secondary" onClick={onReset}>
              reset
            </Button>
          </div>
        </div>
        <div className="pt-2 px-4">
          <div className="text-base">
            The following form allows administrators to configure the default
            layout for visualization windows within{' '}
            <Link target="_blank" href="../../search/catalog">
              Intrigue
            </Link>
            .
          </div>
          <Paper className="p-4 mt-2">
            <div className="flex items-center">
              <Typography variant="h6">Visualizations</Typography>
              <div id="layoutMenu" />
            </div>
            <CardMedia>
              <LayoutEditor onRender={onRender} />
            </CardMedia>
          </Paper>
          <Paper className="relative mt-5 p-4">
            <CardHeader title="Advanced Generated Configuration" />
            <CardContent>
              <Typography>
                This is the automatically generated configuration based on the
                layout specified in the layout editor above. The advanced
                default window layout configuration is specified in the{' '}
                <Link target="_blank" href="http://www.json.org">
                  JSON
                </Link>{' '}
                format. A description of the configuration properties for the
                visualization windows within the default layout can be found at
                the provided documentation link. NOTE: If the JSON is malformed
                or has invalid components, the visualization window will not
                update and changes will not be saved.
              </Typography>
            </CardContent>
            <ConfigEditor
              error={error}
              buffer={buffer.get('buffer')}
              onEdit={(value) => onUpdate(value, 'buffer')}
            />
          </Paper>
          <Snackbar
            open={message.text !== undefined}
            message={message.text || ''}
            action={message.action}
            autoHideDuration={5000}
            onClose={() => onMessage()}
          />
        </div>
      </Spinner>
    </div>
  )
}

const mapState = (state: any) => {
  const buffer = getBuffer(state)
  const error = validate(buffer)
  const loading = isLoading(state)
  const disabled = !hasChanges(state)
  const message = getMessage(state)
  return { buffer, error, loading, disabled, message }
}

const mapDispatch = {
  onFetch: fetch,
  onRender: rendered,
  onUpdate: update,
  onSave: save,
  onReset: reset,
  onMessage: message,
}

export default connect(mapState, mapDispatch)(MapLayers)
