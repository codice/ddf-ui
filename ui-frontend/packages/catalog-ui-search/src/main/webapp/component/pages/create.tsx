import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Popover from '@material-ui/core/Popover'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useHistory } from 'react-router-dom'
import { AsyncTasks } from '../../js/model/AsyncTask/async-task'
import { useQuery, UserQuery } from '../../js/model/TypedQuery'
import { useMenuState } from '../menu-state/menu-state'
import { Elevations } from '../theme/theme'
import { OpenSearch, SaveForm } from './search'

import SelectionInterfaceModel from '../selection-interface/selection-interface.model'

const selectionInterface = new SelectionInterfaceModel()

const Open = () => {
  const history = useHistory()
  const openMenuState = useMenuState()
  const titleMenuState = useMenuState()
  const fromExistingMenuState = useMenuState()
  const [search] = useQuery()
  React.useEffect(() => {
    openMenuState.handleClick()
  }, [])
  React.useEffect(() => {
    selectionInterface.setCurrentQuery(search)
  }, [])
  return (
    <div className="w-full h-full p-2">
      <Button
        onClick={openMenuState.handleClick}
        className="text-2xl pb-2"
        variant="contained"
        color="primary"
        innerRef={openMenuState.anchorRef}
      >
        Create
      </Button>
      <Popover
        open={titleMenuState.open}
        anchorEl={titleMenuState.anchorRef.current}
        onClose={titleMenuState.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        getContentAnchorEl={null}
      >
        <Paper elevation={Elevations.overlays} className="p-2">
          <SaveForm
            selectionInterface={selectionInterface}
            onClose={() => {
              titleMenuState.handleClose()
            }}
            onSave={(title) => {
              const searchData = UserQuery().toJSON()
              searchData.title = title
              const task = AsyncTasks.createSearch({ data: searchData })
              history.push({
                pathname: `/search/${task.data.id}`,
                search: '',
              })
            }}
          />
        </Paper>
      </Popover>
      <Popover
        open={fromExistingMenuState.open}
        anchorEl={fromExistingMenuState.anchorRef.current}
        onClose={fromExistingMenuState.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        getContentAnchorEl={null}
      >
        <Paper elevation={Elevations.overlays} className="p-2 w-64">
          <OpenSearch
            label=""
            constructLink={(result) => {
              return `/search/${result.plain.id}`
            }}
            onFinish={(value) => {
              const copy = JSON.parse(
                JSON.stringify(value.plain.metacard.properties)
              )
              delete copy.id
              copy.title = `New from '${copy.title}'`
              const task = AsyncTasks.createSearch({ data: copy })
              // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
              history.replace({
                pathname: `/search/${task.data.id}`,
                search: '',
              })
            }}
            autocompleteProps={{
              fullWidth: true,
              className: 'w-full',
            }}
          />
        </Paper>
      </Popover>
      <Popover
        open={openMenuState.open}
        onClose={openMenuState.handleClose}
        anchorEl={openMenuState.anchorRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem
          innerRef={titleMenuState.anchorRef}
          onClick={() => {
            titleMenuState.handleClick()
          }}
        >
          Search
        </MenuItem>
        <MenuItem
          innerRef={fromExistingMenuState.anchorRef}
          onClick={() => {
            fromExistingMenuState.handleClick()
          }}
        >
          Search from existing
        </MenuItem>
      </Popover>
    </div>
  )
}

export default hot(module)(Open)
