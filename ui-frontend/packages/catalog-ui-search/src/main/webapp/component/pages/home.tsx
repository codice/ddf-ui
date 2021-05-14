import * as React from 'react'
import { GoldenLayout } from '../golden-layout/golden-layout'
import {
  SplitPane,
  useResizableGridContext,
} from '../resizable-grid/resizable-grid'
const SelectionInterfaceModel = require('../selection-interface/selection-interface.model')
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import QueryAddView from '../query-add/query-add'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'

import MRC from '../../react-component/marionette-region-container'
import Button from '@material-ui/core/Button'
import SearchInteractions from '../search-interactions'
import MoreVert from '@material-ui/icons/MoreVert'
import Divider from '@material-ui/core/Divider'
import { Elevations } from '../theme/theme'
import SearchIcon from '@material-ui/icons/SearchTwoTone'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useHistory, useLocation } from 'react-router-dom'
import _ from 'lodash'
import { useUserQuery } from '../../js/model/TypedQuery'
import { useMenuState } from '../menu-state/menu-state'
import Popover from '@material-ui/core/Popover'

const LeftTop = ({ selectionInterface }: { selectionInterface: any }) => {
  const { closed, setClosed, lastLength, setLength } = useResizableGridContext()
  const searchInteractionsMenuState = useMenuState()
  if (closed) {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        className="w-full py-4 px-2"
      >
        <Grid item className="w-full">
          <Button
            fullWidth
            variant="text"
            color="primary"
            size="small"
            onClick={() => {
              setClosed(false)
              setLength(lastLength)
            }}
          >
            <KeyboardArrowRightIcon
              color="inherit"
              className="Mui-text-text-primary"
            />
            <KeyboardArrowRightIcon
              color="inherit"
              className="-ml-5 Mui-text-text-primary"
            />
          </Button>
        </Grid>
        <Grid item className="mt-3 w-full">
          <Button
            fullWidth
            variant="text"
            color="primary"
            size="small"
            {...searchInteractionsMenuState.MuiButtonProps}
          >
            <MoreVert className="Mui-text-text-primary" />
          </Button>
          <Popover {...searchInteractionsMenuState.MuiPopoverProps}>
            <Paper>
              <SearchInteractions
                model={selectionInterface.getCurrentQuery()}
                onClose={searchInteractionsMenuState.handleClose}
              />
            </Paper>
          </Popover>
        </Grid>
        <Grid item className="mt-3 w-full">
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              selectionInterface.getCurrentQuery().startSearchFromFirstPage()
            }}
          >
            <SearchIcon />
          </Button>
        </Grid>
      </Grid>
    )
  }
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      className="w-full max-h-16 h-16 px-2"
    >
      <Grid item>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={() => {
            setClosed(true)
          }}
        >
          Collapse
          <KeyboardArrowLeftIcon
            color="inherit"
            className="Mui-text-text-primary"
          />
          <KeyboardArrowLeftIcon
            color="inherit"
            className="-ml-5 Mui-text-text-primary"
          />
        </Button>
      </Grid>
      <Grid item className="ml-auto">
        <Button
          variant="text"
          color="primary"
          size="small"
          {...searchInteractionsMenuState.MuiButtonProps}
        >
          Options
          <MoreVert className="Mui-text-text-primary" />
        </Button>
        <Popover {...searchInteractionsMenuState.MuiPopoverProps}>
          <Paper>
            <SearchInteractions
              model={selectionInterface.getCurrentQuery()}
              onClose={searchInteractionsMenuState.handleClose}
            />
          </Paper>
        </Popover>
      </Grid>
      <Grid item className="ml-3">
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            selectionInterface.getCurrentQuery().startSearchFromFirstPage()
          }}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  )
}

const LeftBottom = ({ selectionInterface }: { selectionInterface: any }) => {
  const { closed } = useResizableGridContext()

  return (
    <>
      <MRC
        className={`w-full pb-64 ${closed ? 'hidden' : ''}`}
        defaultStyling={false}
        view={QueryAddView}
        viewOptions={{
          selectionInterface,
          model: selectionInterface.getCurrentQuery(),
        }}
      />
    </>
  )
}

const decodeUrlIfValid = (urlBasedQuery: string) => {
  if (urlBasedQuery) {
    try {
      return JSON.parse(decodeURIComponent(urlBasedQuery))
    } catch (err) {
      console.error(err)
      return {}
    }
  } else {
    return {}
  }
}

export const HomePage = () => {
  const location = useLocation()
  let urlBasedQuery = location.search.split('?defaultQuery=')[1]
  const [queryModel] = useUserQuery(decodeUrlIfValid(urlBasedQuery))
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: queryModel,
    })
  )
  const history = useHistory()
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    // this is fairly expensive, so keep it heavily debounced
    const debouncedUpdate = _.debounce(() => {
      const encodedQueryModel = encodeURIComponent(
        JSON.stringify(queryModel.toJSON())
      )
      history.replace({
        pathname: '/home',
        search: `?defaultQuery=${encodedQueryModel}`,
      })
    }, 2000)
    listenTo(queryModel, 'change', debouncedUpdate)
  }, [])
  return (
    <div className="w-full h-full">
      <SplitPane variant="horizontal" collapsedLength={80}>
        <div className="h-full w-full py-2">
          <Paper
            elevation={Elevations.panels}
            className="h-full overflow-auto w-full"
          >
            <LeftTop selectionInterface={selectionInterface} />
            <Divider />
            <LeftBottom selectionInterface={selectionInterface} />
          </Paper>
        </div>
        <div className="w-full h-full">
          <GoldenLayout selectionInterface={selectionInterface} />
        </div>
      </SplitPane>
    </div>
  )
}
