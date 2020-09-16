import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import sourcesInstance from '../../component/singletons/sources-instance'
import Typography from '@material-ui/core/Typography'
import Swath from '../swath/swath'
import Grid from '@material-ui/core/Grid'
import HomeIcon from '@material-ui/icons/Home'
import CloudIcon from '@material-ui/icons/Cloud'
import WarningIcon from '@material-ui/icons/Warning'
import Box from '@material-ui/core/Box'
import CheckIcon from '@material-ui/icons/Check'
import Chip from '@material-ui/core/Chip'
// @ts-ignore ts-migrate(6133) FIXME: 'Divider' is declared but its value is never read.
import Divider from '@material-ui/core/Divider'
import _ from 'lodash'
type Props = {
  search: any
}

type SourcesType = ('remote' | 'local' | 'enterprise' | string)[]

const getHumanReadableSourceName = (sourceId: string) => {
  if (sourceId === 'all') {
    return 'All'
  } else if (sourceId === 'remote') {
    return (
      <Grid container alignItems="center" direction="row">
        <Grid item>Slow (offsite)</Grid>{' '}
        <Grid item>
          <CloudIcon />
        </Grid>
      </Grid>
    )
  } else if (sourceId === 'local') {
    return (
      <Grid container alignItems="center" direction="row">
        <Grid item>Fast (onsite)</Grid>{' '}
        <Grid item>
          <HomeIcon />
        </Grid>
      </Grid>
    )
  }
  return sourceId
}

const getSourcesFromSearch = ({ search }: Props): SourcesType => {
  return search.get('sources') || []
}

const isHarvested = (sourceId: string) => {
  return sourcesInstance.getHarvested().includes(sourceId)
}

const shouldBeSelected = ({
  srcId,
  sources,
}: {
  srcId: string
  sources: SourcesType
}) => {
  if (sources.includes('all')) {
    return true
  } else if (sources.includes('local') && isHarvested(srcId)) {
    return true
  } else if (
    sources.includes('remote') &&
    !isHarvested(srcId) &&
    srcId !== 'all' &&
    srcId !== 'local'
  ) {
    return true
  }
  if (sources.includes(srcId)) {
    return true
  }
  return false
}

/**
 * So we used to use two separate search properties to track sources, federation and sources.
 * If federation was enterprise, we searched everything.  If not, we looked to sources.  I also think local was a thing.
 *
 * Instead, we're going to swap to storing only one property, sources (an array of strings).
 * If sources includes, 'all' then that's enterprise.  If it includes 'local', then that means everything local.
 * If it includes 'remote', that that means everything remote.  All other values are singular selections of a source.
 */
const SourceSelector = ({ search }: Props) => {
  // @ts-ignore ts-migrate(6133) FIXME: 'inputRef' is declared but its value is never read... Remove this comment to see the full error message
  const inputRef = React.useRef()
  // @ts-ignore ts-migrate(6133) FIXME: 'federation' is declared but its value is never re... Remove this comment to see the full error message
  const [federation, setFederation] = React.useState(search.get(
    'federation'
  ) as 'enterprise' | 'selected' | 'local')
  const [availableSources, setAvailableSources] = React.useState(
    sourcesInstance.toJSON()
  )
  const [sources, setSources] = React.useState(getSourcesFromSearch({ search }))
  const sourceIds = availableSources.map(source => source.id)
  const defaultSources = search.get('sources') as string[]
  const validDefaultSources =
    defaultSources && defaultSources.filter(src => sourceIds.includes(src))
  // @ts-ignore ts-migrate(6133) FIXME: 'hasValidDefaultSources' is declared but its value... Remove this comment to see the full error message
  const hasValidDefaultSources =
    validDefaultSources && validDefaultSources.length
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(search, 'change:federation change:sources', () => {
      setFederation(search.get('federation'))
      setSources(getSourcesFromSearch({ search }))
    })
    listenTo(sourcesInstance, 'change', () => {
      setAvailableSources(sourcesInstance.toJSON())
    })
  }, [])
  React.useEffect(
    () => {
      search.set('sources', sources)
    },
    [sources]
  )
  const availableLocalSources = availableSources.filter(availableSource => {
    return sourcesInstance.getHarvested().includes(availableSource.id)
  })
  const availableRemoteSources = availableSources.filter(availableSource => {
    return !sourcesInstance.getHarvested().includes(availableSource.id)
  })

  return (
    <div>
      <Typography className="pb-2">Data Sources</Typography>
      <TextField
        data-id="data-sources-select"
        fullWidth
        variant="outlined"
        select
        SelectProps={{
          multiple: true,
          renderValue: (selected: string[]) => {
            return (
              <Grid container alignItems="center" direction="row">
                {selected
                  .sort((a, b) => {
                    return a.toLowerCase().localeCompare(b.toLowerCase()) // case insensitive sort
                  })
                  // @ts-ignore ts-migrate(6133) FIXME: 'b' is declared but its value is never read.
                  .sort((a, b) => {
                    if (a === 'local' || a === 'remote') {
                      return -1 // move these subcategories upwards to front
                    }
                    return 0
                  })
                  // @ts-ignore ts-migrate(6133) FIXME: 'index' is declared but its value is never read.
                  .map((src, index) => {
                    return (
                      <Grid item key={src} className="mr-2">
                        <Chip
                          variant="outlined"
                          color="default"
                          className="cursor-pointer"
                          label={getHumanReadableSourceName(src)}
                        />
                      </Grid>
                    )
                  })}
              </Grid>
            )
          },
          MenuProps: {
            getContentAnchorEl: null, // makes it so this menu doesn't jump around, see https://stackoverflow.com/questions/48157863/how-to-make-a-dropdown-menu-open-below-the-appbar-using-material-ui && https://github.com/mui-org/material-ui/issues/20755
          },
        }}
        value={sources}
        onChange={e => {
          // first of all I'm sorry, second of all, order matters in these cases.  Should really just make a state machine out of this.
          // https://xstate.js.org/docs/  perhaps?
          let newSources = (e.target.value as unknown) as string[]
          // these first three if only apply if the value didn't previous exist (user is going from not all to 'all', etc.)
          const newLocalSources = newSources
            .filter(src => !['all', 'remote', 'local'].includes(src))
            .filter(src => isHarvested(src))
          const newRemoteSources = newSources
            .filter(src => !['all', 'remote', 'local'].includes(src))
            .filter(src => !isHarvested(src))

          if (
            (newSources.includes('all') && !sources.includes('all')) ||
            (newSources.includes('local') &&
              newSources.includes('remote') &&
              (!sources.includes('remote') || !sources.includes('local')) &&
              !sources.includes('all'))
          ) {
            setSources(['all'])
          } else if (sources.includes('all') && newSources.includes('local')) {
            setSources(['remote'])
          } else if (sources.includes('all') && newSources.includes('remote')) {
            setSources(['local'])
          } else if (sources.includes('all') && newLocalSources.length > 0) {
            setSources(
              _.difference(
                availableLocalSources.map(src => src.id).concat(['remote']),
                newLocalSources
              )
            )
          } else if (sources.includes('all') && newRemoteSources.length > 0) {
            setSources(
              _.difference(
                availableRemoteSources.map(src => src.id).concat(['local']),
                newRemoteSources
              )
            )
          } else if (sources.includes('local') && newLocalSources.length > 0) {
            setSources(
              _.difference(
                sources
                  .filter(src => src !== 'local')
                  .concat(availableLocalSources.map(src => src.id)),
                newLocalSources
              )
            )
          } else if (
            sources.includes('remote') &&
            newRemoteSources.length > 0
          ) {
            setSources(
              _.difference(
                sources
                  .filter(src => src !== 'remote')
                  .concat(availableRemoteSources.map(src => src.id)),
                newRemoteSources
              )
            )
          } else if (
            newSources.includes('local') &&
            !sources.includes('local')
          ) {
            setSources(
              newSources.filter(val => !isHarvested(val) && val !== 'all')
            )
          } else if (
            newSources.includes('remote') &&
            !sources.includes('remote')
          ) {
            setSources(
              ['remote'].concat(
                newSources.filter(val => isHarvested(val) && val !== 'all')
              )
            )
          } else if (
            newSources.length ===
              availableLocalSources.length + availableRemoteSources.length ||
            (newSources.includes('local') &&
              newSources.length === availableRemoteSources.length + 1) ||
            (newSources.includes('remote') &&
              newSources.length === availableLocalSources.length + 1)
          ) {
            setSources(['all'])
          } else if (
            availableLocalSources.length > 0 &&
            _.difference(
              availableLocalSources.map(src => src.id),
              newSources.filter(src => isHarvested(src))
            ).length === 0
          ) {
            setSources(
              ['local'].concat(newSources.filter(src => !isHarvested(src)))
            )
          } else if (
            availableRemoteSources.length > 0 &&
            _.difference(
              availableRemoteSources.map(src => src.id),
              newSources.filter(src => !isHarvested(src))
            ).length === 0
          ) {
            setSources(
              ['remote'].concat(newSources.filter(src => isHarvested(src)))
            )
          } else {
            // in these case, we now have to determine if we should remove all, remote, or local based on what is in newSources
            // no matter what all should be removed
            newSources = newSources.filter(src => src !== 'all')
            if (newSources.find(src => isHarvested(src))) {
              newSources = newSources.filter(src => src !== 'local')
            }
            if (newSources.find(src => src !== 'remote' && !isHarvested(src))) {
              newSources = newSources.filter(src => src !== 'remote')
            }
            setSources(newSources)
          }
        }}
        size="small"
      >
        <MenuItem data-id="all-option" value="all">
          <Grid container alignItems="stretch" direction="row" wrap="nowrap">
            <Grid container direction="row" alignItems="center">
              <Grid item className="pr-2">
                <CheckIcon
                  className={
                    shouldBeSelected({ srcId: 'all', sources })
                      ? ''
                      : 'invisible'
                  }
                />
              </Grid>
              <Grid item>All</Grid>
            </Grid>
          </Grid>
        </MenuItem>
        {availableLocalSources.length > 0 ? (
          <MenuItem data-id="onsite-option" value="local">
            <Grid container alignItems="stretch" direction="row" wrap="nowrap">
              <Grid item className="pr-2">
                <CheckIcon
                  className={
                    shouldBeSelected({ srcId: 'local', sources })
                      ? ''
                      : 'invisible'
                  }
                />
              </Grid>
              <Grid item className="pr-2">
                <Swath className="w-1 h-full" />
              </Grid>
              <Grid container direction="row" alignItems="center">
                <Grid item>Fast (onsite)</Grid>
                <Grid item className="pl-2">
                  <HomeIcon />
                </Grid>
              </Grid>
            </Grid>
          </MenuItem>
        ) : null}
        {availableLocalSources.length > 0
          ? availableLocalSources.map((source: any) => {
              return (
                <MenuItem
                  data-id={`source-${source.id}-option`}
                  key={source.id}
                  value={source.id}
                >
                  <Grid
                    container
                    alignItems="stretch"
                    direction="row"
                    wrap="nowrap"
                  >
                    <Grid item className="pr-2">
                      <CheckIcon
                        className={
                          shouldBeSelected({ srcId: source.id, sources })
                            ? ''
                            : 'invisible'
                        }
                      />
                    </Grid>
                    <Grid item className="pl-2 pr-3">
                      <Swath className="w-1 h-full" />
                    </Grid>
                    <Grid container direction="row" alignItems="center">
                      <Grid item>
                        <Box
                          color={
                            source.available ? 'text.primary' : 'warning.main'
                          }
                        >
                          {source.id}
                        </Box>
                      </Grid>
                      <Grid item className="pl-2">
                        {source.available ? null : <WarningIcon />}
                      </Grid>
                    </Grid>
                  </Grid>
                </MenuItem>
              )
            })
          : null}
        {availableRemoteSources.length > -1 ? (
          <MenuItem data-id="offsite-option" value="remote">
            <Grid container alignItems="stretch" direction="row" wrap="nowrap">
              <Grid item className="pr-2">
                <CheckIcon
                  className={
                    shouldBeSelected({ srcId: 'remote', sources })
                      ? ''
                      : 'invisible'
                  }
                />
              </Grid>
              <Grid item className="pr-2">
                <Swath className="w-1 h-full" />
              </Grid>
              <Grid container direction="row" alignItems="center">
                <Grid item>Slow (offsite)</Grid>
                <Grid item className="pl-2">
                  <CloudIcon />
                </Grid>
              </Grid>
            </Grid>
          </MenuItem>
        ) : null}
        {availableRemoteSources.length > 0
          ? availableRemoteSources.map((source: any) => {
              return (
                <MenuItem
                  data-id={`source-${source.id}-option`}
                  key={source.id}
                  value={source.id}
                >
                  <Grid
                    container
                    alignItems="stretch"
                    direction="row"
                    wrap="nowrap"
                  >
                    <Grid item className="pr-2">
                      <CheckIcon
                        className={
                          shouldBeSelected({ srcId: source.id, sources })
                            ? ''
                            : 'invisible'
                        }
                      />
                    </Grid>
                    <Grid item className="pl-2 pr-2">
                      <Swath className="w-1 h-full" />
                    </Grid>
                    <Grid container direction="row" alignItems="center">
                      <Grid item>
                        <Box
                          color={
                            source.available ? 'text.primary' : 'warning.main'
                          }
                        >
                          {source.id}
                        </Box>
                      </Grid>
                      <Grid item className="pl-2">
                        {source.available ? null : <WarningIcon />}
                      </Grid>
                    </Grid>
                  </Grid>
                </MenuItem>
              )
            })
          : null}
      </TextField>
    </div>
  )
}

export default hot(module)(SourceSelector)
