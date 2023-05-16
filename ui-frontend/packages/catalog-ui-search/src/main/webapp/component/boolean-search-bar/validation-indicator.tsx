/* Copyright (c) Connexta, LLC */
import { green, red } from '@mui/material/colors'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import * as React from 'react'
import Paper from '@mui/material/Paper'
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
