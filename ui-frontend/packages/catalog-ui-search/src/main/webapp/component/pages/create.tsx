import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import * as React from 'react'

import { useNavigate } from 'react-router-dom'
import { AsyncTasks } from '../../js/model/AsyncTask/async-task'
import { useQuery, UserQuery } from '../../js/model/TypedQuery'
import { useMenuState } from '../menu-state/menu-state'
import { Elevations } from '../theme/theme'
import { OpenSearch, SaveForm } from './search'

import SelectionInterfaceModel from '../selection-interface/selection-interface.model'

const selectionInterface = new SelectionInterfaceModel()

const Open = () => {
  const navigate = useNavigate()
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
        component="div"
        onClick={openMenuState.handleClick}
        className="text-2xl pb-2"
        variant="contained"
        color="primary"
        ref={openMenuState.anchorRef}
      >
        Create
      </Button>
      <Popover
        open={titleMenuState.open}
        anchorEl={titleMenuState.anchorRef.current}
        onClose={titleMenuState.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
              navigate(`/search/${task.data.id}`)
            }}
          />
        </Paper>
      </Popover>
      <Popover
        open={fromExistingMenuState.open}
        anchorEl={fromExistingMenuState.anchorRef.current}
        onClose={fromExistingMenuState.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
              navigate(`/search/${task.data.id}`, {
                replace: true,
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
          component="div"
          ref={titleMenuState.anchorRef}
          onClick={() => {
            titleMenuState.handleClick()
          }}
        >
          Search
        </MenuItem>
        <MenuItem
          component="div"
          ref={fromExistingMenuState.anchorRef}
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

export default Open
