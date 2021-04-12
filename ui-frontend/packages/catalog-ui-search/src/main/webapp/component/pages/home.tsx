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
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import MoreVert from '@material-ui/icons/MoreVert'
import Divider from '@material-ui/core/Divider'
import { Dropdown } from '../atlas-dropdown'
import { Elevations } from '../theme/theme'
import SearchIcon from '@material-ui/icons/SearchTwoTone'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useHistory, useLocation } from 'react-router-dom'
import _ from 'lodash'
import { UserQuery, useUserQuery } from '../../js/model/TypedQuery'

const LeftTop = ({ selectionInterface }: { selectionInterface: any }) => {
  const { closed, setClosed, lastLength, setLength } = useResizableGridContext()

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
          <Dropdown
            content={(context) => {
              return (
                <BetterClickAwayListener
                  onClickAway={() => {
                    context.deepCloseAndRefocus.bind(context)()
                  }}
                >
                  <Paper>
                    <SearchInteractions
                      model={selectionInterface.getCurrentQuery()}
                      onClose={() => {
                        context.deepCloseAndRefocus.bind(context)()
                      }}
                    />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button
                  fullWidth
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={handleClick}
                >
                  <MoreVert className="Mui-text-text-primary" />
                </Button>
              )
            }}
          </Dropdown>
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
        <Dropdown
          content={(context) => {
            return (
              <BetterClickAwayListener
                onClickAway={() => {
                  context.deepCloseAndRefocus.bind(context)()
                }}
              >
                <Paper>
                  <SearchInteractions
                    model={selectionInterface.getCurrentQuery()}
                    onClose={() => {
                      context.deepCloseAndRefocus.bind(context)()
                    }}
                  />
                </Paper>
              </BetterClickAwayListener>
            )
          }}
        >
          {({ handleClick }) => {
            return (
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={handleClick}
              >
                Options
                <MoreVert className="Mui-text-text-primary" />
              </Button>
            )
          }}
        </Dropdown>
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
  console.log(queryModel)
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
