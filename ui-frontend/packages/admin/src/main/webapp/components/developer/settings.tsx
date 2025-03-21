import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'
import Grow from '@material-ui/core/Grow'

type ServerSettingsType = {
  server: 'mock' | 'proxy'
  proxy: string
}

export const ServerSettings = {
  server: 'mock',
  proxy: 'localhost:8993',
} as {
  server: 'mock' | 'proxy'
  proxy: string
}

export const DeveloperSettings = () => {
  const [server, setServer] = React.useState(
    ServerSettings.server as ServerSettingsType['server']
  )
  const [proxy, setProxy] = React.useState(
    ServerSettings.proxy as ServerSettingsType['proxy']
  )
  React.useEffect(() => {
    ServerSettings['server'] = server
    ServerSettings['proxy'] = proxy
  })
  return (
    <Grid container spacing={3} direction="column">
      <Grid item>
        <Typography variant="h4" align="center">
          Developer Settings
        </Typography>
      </Grid>
      <Grid item>
        <TextField
          fullWidth
          variant="outlined"
          select
          label="Server"
          value={server}
          onChange={(e) => {
            setServer(e.target.value as ServerSettingsType['server'])
          }}
        >
          <MenuItem value="mock">Use Mocks</MenuItem>
          <MenuItem value="proxy">Use Proxy</MenuItem>
        </TextField>
      </Grid>
      <Grow in={server === 'proxy'}>
        <Grid item>
          <TextField
            fullWidth
            variant="outlined"
            label="proxy"
            value={proxy}
            onChange={(e) => {
              setProxy(e.target.value)
            }}
          />
        </Grid>
      </Grow>
    </Grid>
  )
}
