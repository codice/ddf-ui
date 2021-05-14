import * as React from 'react'
import { hot } from 'react-hot-loader'
import Paper from '@material-ui/core/Paper'
const moment = require('moment')
import styled from 'styled-components'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Status } from '../../js/model/LazyQueryResult/status'
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks'
import Tooltip from '@material-ui/core/Tooltip'
import { Elevations } from '../theme/theme'
import FilterListIcon from '@material-ui/icons/FilterList'
import { fuzzyHits, fuzzyResultCount } from './fuzzy-results'
import ErrorIcon from '@material-ui/icons/Error'
import { useMenuState } from '../menu-state/menu-state'
import Popover from '@material-ui/core/Popover'

type Props = {
  selectionInterface: any
}

const Cell = styled.td`
  padding: 20px;
`

const HeaderCell = styled.th`
  padding: 20px;
`

type CellValueProps = {
  value: string | number
  hasReturned: boolean
  successful: boolean
  message: string
  warnings: string[]
  alwaysShowValue?: boolean
}

const CellValue = (props: CellValueProps) => {
  const {
    value,
    warnings = [],
    message,
    alwaysShowValue,
    hasReturned,
    successful,
  } = props
  return (
    <React.Fragment>
      {(!successful || message || (warnings && warnings.length > 0)) && (
        <Tooltip
          title={
            <Paper elevation={Elevations.overlays} className="p-2">
              {(() => {
                if (message) {
                  return message
                } else if (warnings.length > 0) {
                  return warnings.map((warning) => (
                    <div key={warning}>{warning}</div>
                  ))
                } else {
                  return 'Something went wrong searching this source.'
                }
              })()}
            </Paper>
          }
        >
          <span className="fa fa-warning" style={{ paddingRight: '5px' }} />
        </Tooltip>
      )}
      {alwaysShowValue || (!message && hasReturned && successful)
        ? value
        : null}
      {!hasReturned && !alwaysShowValue && (
        <span
          className="fa fa-circle-o-notch fa-spin"
          title="Waiting for source to return"
        />
      )}
    </React.Fragment>
  )
}

const QueryStatusRow = ({ status, query }: { status: Status; query: any }) => {
  let hasReturned = status.hasReturned
  let successful = status.successful
  let message = status.message

  // @ts-ignore ts-migrate(2339) FIXME: Property 'warnings' does not exist on type 'Status... Remove this comment to see the full error message
  let warnings = status.warnings
  let id = status.id

  return (
    <tr data-id={`source-${id}-row`}>
      <Cell data-id="source-id-label">
        <CellValue
          value={id}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
          alwaysShowValue
        />
      </Cell>
      <Cell data-id="available-label">
        <CellValue
          value={`${status.count} hit${status.count === 1 ? '' : 's'}`}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
        />
      </Cell>
      <Cell data-id="possible-label">
        <CellValue
          value={fuzzyHits(status.hits)}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
        />
      </Cell>
      <Cell data-id="time-label">
        <CellValue
          value={status.elapsed / 1000}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
        />
      </Cell>
      <Cell className="status-filter">
        <Tooltip title="Click to search only this source.">
          <Button
            data-id="filter-button"
            onClick={() => {
              query.set('sources', [status.id])
              query.startSearchFromFirstPage()
            }}
            color="primary"
          >
            <FilterListIcon className="Mui-text-text-primary" />
            Filter
          </Button>
        </Tooltip>
      </Cell>
    </tr>
  )
}

const QueryStatus = ({
  statusBySource,
  query,
}: {
  statusBySource: Status[]
  query: any
}) => {
  return (
    <table>
      <tr>
        <HeaderCell>Source</HeaderCell>
        <HeaderCell data-help="This is the number of results available based on the current sorting.">
          Available
        </HeaderCell>
        <HeaderCell data-help="This is the total number of results (hits) that matched your search.">
          Possible
        </HeaderCell>
        <HeaderCell data-help="This is the time (in seconds) that it took for the search to run.">
          Time (s)
        </HeaderCell>
        <HeaderCell data-help="Locally filter results to be from a specific source.">
          Filter
        </HeaderCell>
      </tr>
      <tbody className="is-list">
        {statusBySource.map((status) => {
          return (
            <QueryStatusRow key={status.id} status={status} query={query} />
          )
        })}
      </tbody>
    </table>
  )
}

const LastRan = ({ currentAsOf }: { currentAsOf: number }) => {
  const [howLongAgo, setHowLongAgo] = React.useState(
    moment(currentAsOf).fromNow()
  )
  React.useEffect(() => {
    setHowLongAgo(moment(currentAsOf).fromNow())
    const intervalId = setInterval(() => {
      setHowLongAgo(moment(currentAsOf).fromNow())
    }, 60000)
    return () => {
      clearInterval(intervalId)
    }
  }, [currentAsOf])
  return <div style={{ whiteSpace: 'nowrap' }}>Current as of {howLongAgo}</div>
}

const QueryFeed = ({ selectionInterface }: Props) => {
  const { MuiButtonProps, MuiPopoverProps } = useMenuState()
  const {
    status,
    currentAsOf,
    isSearching,
  } = useLazyResultsStatusFromSelectionInterface({
    selectionInterface,
  })

  const statusBySource = Object.values(status)
  let resultMessage = '',
    pending = false,
    failed = false,
    warnings = false
  if (statusBySource.length === 0) {
    resultMessage = 'Has not been run'
  } else {
    const sourcesThatHaveReturned = statusBySource.filter(
      (status) => status.hasReturned
    )

    if (sourcesThatHaveReturned.length > 0) {
      const results = statusBySource
        .filter((status) => status.hasReturned)
        .filter((status) => status.successful)

      let available = 0
      let possible = 0

      results.forEach((result) => {
        available += result.count
        possible += result.hits
      })

      resultMessage = `${available} hit${
        available === 1 ? '' : 's'
      } out of ${fuzzyResultCount(possible)} possible`
    } else {
      resultMessage = 'Searching...'
    }

    failed = sourcesThatHaveReturned.some((status) => !status.successful)
    warnings = sourcesThatHaveReturned.some(
      (status) => status.warnings && status.warnings.length > 0
    )
    pending = isSearching
  }

  return (
    <>
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        <Grid item>
          <div
            data-id="results-count-label"
            title={resultMessage}
            style={{ whiteSpace: 'nowrap' }}
          >
            {pending ? (
              <i className="fa fa-circle-o-notch fa-spin is-critical-animation" />
            ) : (
              ''
            )}
            {failed ? <i className="fa fa-warning" /> : ''}
            {resultMessage}
          </div>
          <LastRan currentAsOf={currentAsOf} />
        </Grid>
        <Grid item>
          <div>
            <div className="relative">
              <Button
                data-id="heartbeat-button"
                className="details-view is-button"
                title="Show the full status for the search."
                data-help="Show the full status for the search."
                {...MuiButtonProps}
              >
                <span className="fa fa-heartbeat" />
              </Button>
              <Popover {...MuiPopoverProps}>
                <Paper
                  data-id="query-status-container"
                  style={{ padding: '20px' }}
                  className="intrigue-table"
                >
                  <QueryStatus
                    statusBySource={statusBySource}
                    query={selectionInterface.getCurrentQuery()}
                  />
                </Paper>
              </Popover>
              {warnings && (
                <div className="absolute bottom-0 right-0 text-sm">
                  <ErrorIcon fontSize="inherit" color="error" />
                </div>
              )}
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default hot(module)(QueryFeed)
