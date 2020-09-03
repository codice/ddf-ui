import * as React from 'react'
import { hot } from 'react-hot-loader'
import StorageIcon from '@material-ui/icons/Storage'
import Grid from '@material-ui/core/Grid'
import { Link } from '../../component/link/link'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import SourcesPage from '../../react-component/sources'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'

const SourcesInfo = () => {
  return (
    <Tooltip
      title={
        <Paper elevation={Elevations.overlays} className="min-w-120">
          <SourcesPage />
        </Paper>
      }
    >
      <Button
        data-id="sources-button"
        fullWidth
        component={Link}
        to="/sources"
        variant="text"
        color="primary"
        target="_blank"
      >
        <Grid container direction="row" alignItems="center" wrap="nowrap">
          <Grid item>
            <Box color="text.primary">
              {' '}
              <StorageIcon />
            </Box>
          </Grid>
          <Grid item>Sources</Grid>
        </Grid>
      </Button>
    </Tooltip>
  )
}

export default hot(module)(SourcesInfo)
