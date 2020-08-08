import * as React from 'react'
import { GoldenLayout } from '../../golden-layout/golden-layout'
import {
  SplitPane,
  useResizableGridContext,
} from '../../resizable-grid/resizable-grid'
const SelectionInterfaceModel = require('../../selection-interface/selection-interface.model')
const Query = require('../../../js/model/Query.js')
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import QueryAddView from '../../query-add/query-add'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'

import MRC from '../../../react-component/marionette-region-container'
import ResultSelector from '../../result-selector/result-selector'
import Button from '@material-ui/core/Button'
import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import SearchInteractions from '../../search-interactions'
import { BetterClickAwayListener } from '../../better-click-away-listener/better-click-away-listener'
import MoreVert from '@material-ui/icons/MoreVert'
import Box from '@material-ui/core/Box'
import Swath from '../../swath/swath'
import Divider from '@material-ui/core/Divider'

const LeftTop = ({ selectionInterface }: { selectionInterface: any }) => {
  const { closed, setClosed, lastLength, setLength } = useResizableGridContext()

  if (closed) {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        className="w-full p-4"
      >
        <Grid item>
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={() => {
              setClosed(false)
              setLength(lastLength)
            }}
          >
            <Box color="primary.main">Expand</Box>
            <KeyboardArrowRightIcon color="inherit" />
            <KeyboardArrowRightIcon color="inherit" className="-ml-5" />
          </Button>
        </Grid>
        <Grid item className="mt-3">
          <Dropdown
            content={context => {
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
                  color="inherit"
                  size="small"
                  onClick={handleClick}
                >
                  <Box color="primary.main">Options</Box>
                  <MoreVert color="inherit" />
                </Button>
              )
            }}
          </Dropdown>
        </Grid>
        <Grid item className="mt-3">
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
          color="inherit"
          size="small"
          onClick={() => {
            setClosed(true)
          }}
        >
          <Box color="primary.main">Collapse</Box>
          <KeyboardArrowLeftIcon color="inherit" />
          <KeyboardArrowLeftIcon color="inherit" className="-ml-5" />
        </Button>
      </Grid>
      <Grid item className="ml-auto">
        <Dropdown
          content={context => {
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
                color="inherit"
                size="small"
                onClick={handleClick}
              >
                <Box color="primary.main">Options</Box>
                <MoreVert color="inherit" />
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

export const HomePage = () => {
  let urlBasedQuery = location.hash.split('?defaultQuery=')[1]
  if (urlBasedQuery) {
    urlBasedQuery = new Query.Model(
      JSON.parse(decodeURIComponent(urlBasedQuery))
    )
    ;(urlBasedQuery as any).startSearchFromFirstPage()
  }
  const [isSaved, setIsSaved] = React.useState(false)

  const [queryModel, setQueryModel] = React.useState(
    urlBasedQuery || new Query.Model()
  )
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: queryModel,
    })
  )
  return (
    <div className="w-full h-full">
      <SplitPane variant="horizontal" collapsedLength={140}>
        <Paper elevation={4} className="h-full overflow-auto">
          <LeftTop selectionInterface={selectionInterface} />
          <Divider />
          <LeftBottom selectionInterface={selectionInterface} />
        </Paper>
        <Grid
          container
          direction="column"
          className="w-full h-full"
          wrap="nowrap"
        >
          <Grid item className="w-full relative z-1">
            <Paper elevation={2} className="w-full min-h-16">
              <Grid
                container
                direction="row"
                wrap="nowrap"
                alignItems="center"
                justify="center"
              >
                <Grid item>
                  <ResultSelector
                    selectionInterface={selectionInterface}
                    model={queryModel}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item className="w-full h-full">
            <GoldenLayout
              selectionInterface={selectionInterface}
              width={0}
              closed={true}
            />
          </Grid>
        </Grid>
      </SplitPane>
    </div>
  )
}
