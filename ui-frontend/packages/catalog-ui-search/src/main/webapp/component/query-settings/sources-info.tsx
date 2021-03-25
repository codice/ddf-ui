import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Popover, { PopoverActions } from '@material-ui/core/Popover'
import StorageIcon from '@material-ui/icons/Storage'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import ExtensionPoints from '../../extension-points'
import SourcesPage from '../../react-component/sources'
import { Elevations } from '../theme/theme'
import { useMenuState } from '../menu-state/menu-state'

const SourcesInfo = () => {
  const { anchorRef, handleClick, handleClose, open } = useMenuState()
  const popoverActions = React.useRef<PopoverActions>(null)

  const onChange = () => {
    if (popoverActions.current) {
      popoverActions.current.updatePosition()
    }
  }

  return (
    <React.Fragment>
      <Button
        data-id="sources-button"
        fullWidth
        variant="text"
        color="primary"
        onClick={handleClick}
      >
        <Grid container direction="row" alignItems="center" wrap="nowrap">
          <Grid item className="pr-1">
            <StorageIcon className="Mui-text-text-primary" />
          </Grid>
          <Grid item>Sources</Grid>
        </Grid>
      </Button>
      <Popover
        action={popoverActions}
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper elevation={Elevations.overlays} className="min-w-120">
          {ExtensionPoints.customSourcesPage ? (
            <ExtensionPoints.customSourcesPage onChange={onChange} />
          ) : (
            <SourcesPage />
          )}
        </Paper>
      </Popover>
    </React.Fragment>
  )
}

export default hot(module)(SourcesInfo)
