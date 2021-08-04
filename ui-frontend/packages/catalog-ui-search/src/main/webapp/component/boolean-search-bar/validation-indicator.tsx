/* Copyright (c) Connexta, LLC */
import { green, red } from '@material-ui/core/colors'
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import Check from '@material-ui/icons/Check'
import Close from '@material-ui/icons/Close'
import * as React from 'react'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'

type ValidationIndicatorProps = {
  helperMessage?: string | JSX.Element
  error?: boolean
}

const ValidationIndicator = ({
  helperMessage: helperText,
  error,
}: ValidationIndicatorProps) => {
  return (
    <InputAdornment position="start">
      <Tooltip
        title={
          <Paper elevation={Elevations.overlays} className="p-2">
            {helperText}
          </Paper>
        }
      >
        {error ? (
          <Close style={{ color: red[500] }} />
        ) : (
          <Check style={{ color: green[500] }} />
        )}
      </Tooltip>
    </InputAdornment>
  )
}

export default ValidationIndicator
