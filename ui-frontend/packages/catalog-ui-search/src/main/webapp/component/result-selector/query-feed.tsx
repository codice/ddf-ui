import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useLazyResultsStatusFromSelectionInterface } from 'catalog-ui-search/src/main/webapp/component/selection-interface/hooks'
import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import Paper from '@material-ui/core/Paper'
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import { Status } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/status'
const moment = require('moment')
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance')

import styled from 'styled-components'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

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
    warnings,
    message,
    alwaysShowValue,
    hasReturned,
    successful,
  } = props
  return (
    <React.Fragment>
      {(message || (warnings && warnings.length > 0)) && (
        <span
          className="fa fa-warning"
          title={message || warnings}
          style={{ paddingRight: '5px' }}
        />
      )}
      {alwaysShowValue || (!message && hasReturned && successful)
        ? value
        : null}
      {!hasReturned &&
        !alwaysShowValue && (
          <span
            className="fa fa-circle-o-notch fa-spin"
            title="Waiting for source to return"
          />
        )}
    </React.Fragment>
  )
}

const QueryStatusRow = ({ status }: { status: Status }) => {
  let hasReturned = status.hasReturned
  let successful = status.successful
  let message = status.message

  //@ts-ignore
  let warnings = status.warnings
  let id = status.id

  return (
    <tr>
      <Cell>
        <CellValue
          value={id}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
          alwaysShowValue
        />
      </Cell>
      <Cell>
        <CellValue
          value={status.count}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
        />
      </Cell>
      <Cell>
        <CellValue
          value={status.hits}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
        />
      </Cell>
      <Cell>
        <CellValue
          value={status.elapsed / 1000}
          hasReturned={hasReturned}
          successful={successful}
          warnings={warnings}
          message={message}
        />
      </Cell>
      <Cell className="status-filter">
        <button
          className="is-button is-primary in-text"
          title="Locally filter results to this source only."
          onClick={() => {
            user
              .get('user')
              .get('preferences')
              .set('resultFilter', {
                type: '=',
                property: 'source-id',
                value: status.id,
              })
            user
              .get('user')
              .get('preferences')
              .savePreferences()
          }}
        >
          <span className="fa fa-filter" />
        </button>
      </Cell>
    </tr>
  )
}

const QueryStatus = ({ statusBySource }: { statusBySource: Status[] }) => {
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
        {statusBySource.map(status => {
          return <QueryStatusRow key={status.id} status={status} />
        })}
      </tbody>
    </table>
  )
}

const LastRan = ({ currentAsOf }: { currentAsOf: number }) => {
  const [howLongAgo, setHowLongAgo] = React.useState(
    moment(currentAsOf).fromNow()
  )
  React.useEffect(
    () => {
      setHowLongAgo(moment(currentAsOf).fromNow())
      const intervalId = setInterval(() => {
        setHowLongAgo(moment(currentAsOf).fromNow())
      }, 60000)
      return () => {
        clearInterval(intervalId)
      }
    },
    [currentAsOf]
  )
  return <div style={{ whiteSpace: 'nowrap' }}>Current as of {howLongAgo}</div>
}

const QueryFeed = ({ selectionInterface }: Props) => {
  const {
    status,
    currentAsOf,
    isSearching,
  } = useLazyResultsStatusFromSelectionInterface({
    selectionInterface,
  })
  const statusBySource = Object.values(status)
  let resultCount = '',
    pending = false,
    failed = false
  if (statusBySource.length === 0) {
    resultCount = 'Has not been run'
  } else {
    const sourcesThatHaveReturned = statusBySource.filter(
      status => status.hasReturned
    )
    resultCount =
      sourcesThatHaveReturned.length > 0
        ? `${statusBySource
            .filter(status => status.hasReturned)
            .filter(status => status.successful)
            .reduce((amt, status) => {
              amt = amt + status.hits
              return amt
            }, 0)} hits`
        : 'Searching...'
    failed = sourcesThatHaveReturned.some(status => !status.successful)
    pending = isSearching
  }

  return (
    <>
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        <Grid item>
          <div title={resultCount} style={{ whiteSpace: 'nowrap' }}>
            {pending ? (
              <i className="fa fa-circle-o-notch fa-spin is-critical-animation" />
            ) : (
              ''
            )}
            {failed ? <i className="fa fa-warning" /> : ''}
            {resultCount}
          </div>
          <LastRan currentAsOf={currentAsOf} />
        </Grid>
        <Grid item>
          <Dropdown
            content={({ closeAndRefocus }) => {
              return (
                <BetterClickAwayListener onClickAway={closeAndRefocus}>
                  <Paper style={{ padding: '20px' }} className="intrigue-table">
                    <QueryStatus statusBySource={statusBySource} />
                  </Paper>
                </BetterClickAwayListener>
              )
            }}
          >
            {({ handleClick }) => {
              return (
                <Button
                  onClick={handleClick}
                  className="details-view is-button"
                  title="Show the full status for the search."
                  data-help="Show the full status for the search."
                >
                  <span className="fa fa-heartbeat" />
                </Button>
              )
            }}
          </Dropdown>
        </Grid>
      </Grid>
    </>
  )
}

export default hot(module)(QueryFeed)
