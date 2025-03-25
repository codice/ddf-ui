import * as React from 'react'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import { useAppRootContext, ApplicationTheme } from './app-root.pure'

export const Settings = () => {
  const { theme, setTheme } = useAppRootContext()
  return (
    <>
      <Typography variant="h4" align="center">
        Settings
      </Typography>
      <TextField
        select
        label="Theme"
        value={theme}
        onChange={(e) => {
          const value = e.target.value as ApplicationTheme
          setTheme(value)
        }}
      >
        <MenuItem value="dark">Dark</MenuItem>
        <MenuItem value="light">Light</MenuItem>
      </TextField>
    </>
  )
}
