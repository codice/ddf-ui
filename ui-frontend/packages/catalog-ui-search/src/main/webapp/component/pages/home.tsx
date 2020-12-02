import * as React from 'react'
import { GoldenLayout } from '../golden-layout/golden-layout'
import {
  SplitPane,
  useResizableGridContext,
} from '../resizable-grid/resizable-grid'
const SelectionInterfaceModel = require('../selection-interface/selection-interface.model')
const Query = require('../../js/model/Query.js')
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import QueryAddView from '../query-add/query-add'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'

import MRC from '../../react-component/marionette-region-container'
import Button, { ButtonProps } from '@material-ui/core/Button'
import SearchInteractions from '../search-interactions'
import { BetterClickAwayListener } from '../better-click-away-listener/better-click-away-listener'
import MoreVert from '@material-ui/icons/MoreVert'
import { Dropdown } from '../atlas-dropdown'
import { Elevations } from '../theme/theme'
import SearchIcon from '@material-ui/icons/SearchTwoTone'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import _ from 'lodash'
import fetch from '../../react-component/utils/fetch'
import TextField from '@material-ui/core/TextField'
import { DarkDivider } from '../dark-divider/dark-divider'
import { DropdownContextType } from '../atlas-dropdown/dropdown.context'
import LinearProgress from '@material-ui/core/LinearProgress'
import { useUpdateEffect } from 'react-use'
import {
  FilterBuilderClass,
  FilterClass,
} from '../filter-builder/filter.structure'
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import Skeleton from '@material-ui/lab/Skeleton'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRerenderOnBackboneSync } from '../../js/model/LazyQueryResult/hooks'
import CloudDoneIcon from '@material-ui/icons/CloudDone'
const Common = require('../../js/Common.js')
import SaveIcon from '@material-ui/icons/Save'
type SaveFormType = {
  context: DropdownContextType
  selectionInterface: any
  onSave: () => void
}

const SaveForm = ({ context, selectionInterface, onSave }: SaveFormType) => {
  const currentQuery = selectionInterface.getCurrentQuery()

  const [title, setTitle] = React.useState(currentQuery.get('title') || '')
  const [validation, setValidation] = React.useState(
    {} as { [key: string]: string }
  )
  useUpdateEffect(() => {
    if (!title) {
      setValidation({
        title: 'Cannot be blank',
      })
    } else {
      setValidation({})
    }
  }, [title])

  return (
    <>
      <form
        action="./blank.html"
        method="POST"
        onSubmit={(e) => {
          if (!title) {
            setValidation({
              title: 'Cannot be blank',
            })
            e.preventDefault()
            return false
          } else {
            currentQuery.set('title', title)
            onSave()
            e.preventDefault()
            context.deepCloseAndRefocus()
            return false
          }
        }}
        className="w-full h-full"
      >
        <div className="p-2">
          <TextField
            variant="outlined"
            size="small"
            label="Name"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
            }}
            error={Boolean(validation.title)}
            autoFocus
            onFocus={(e) => {
              e.target.select()
            }}
            helperText={validation.title}
          />
        </div>

        <DarkDivider className="" />
        <div className="flex flex-row flex-no-wrap align justify-end p-2">
          <Button
            type="button"
            variant="text"
            color="primary"
            onClick={() => {
              context.deepCloseAndRefocus()
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={Object.keys(validation).length > 0}
            type="submit"
            className="ml-3"
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </div>
      </form>
    </>
  )
}

type ButtonWithMultipleStatesType = {
  states: { state: string; loading: boolean }[]
  state: string
  labelClassName?: string
} & Omit<ButtonProps, 'children'>
const ButtonWithTwoStates = (props: ButtonWithMultipleStatesType) => {
  const { states, state, ...buttonProps } = props
  if (states.length === 0) {
    return <div>You must specify at least one state</div>
  }
  const longestState = states.reduce((longest, current) => {
    if (current.state.length > longest.length) {
      return current.state
    }
    return longest
  }, states[0].state)
  const currentState = states.find((stateInfo) => stateInfo.state === state)
  if (currentState === undefined) {
    return <div>You must specify a valid state</div>
  }
  const isLoading = currentState?.loading
  return (
    <Button disabled={isLoading} {...buttonProps}>
      <span className={`invisible ${props.labelClassName}`}>
        {longestState}
      </span>
      <span className={`absolute ${props.labelClassName}`}>{state}</span>
      {isLoading ? (
        <LinearProgress
          className="absolute left-0 top-0 w-full h-full opacity-50"
          variant="indeterminate"
        />
      ) : null}
    </Button>
  )
}

const OptionsButton = () => {
  const {
    data,
    searchPageMode,
    isSaving,
    setIsSaving,
    selectionInterface,
  } = React.useContext(SavedSearchModeContext)
  return (
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
            disabled={typeof data === 'boolean' && searchPageMode === 'saved'}
            variant="text"
            color="primary"
            endIcon={<MoreVert className="Mui-text-text-primary" />}
            size="small"
            onClick={handleClick}
          >
            Options
          </Button>
        )
      }}
    </Dropdown>
  )
}

const SaveButton = () => {
  const { closed } = useResizableGridContext()
  const {
    data,
    searchPageMode,
    isSaving,
    setIsSaving,
    selectionInterface,
  } = React.useContext(SavedSearchModeContext)
  return (
    <Dropdown
      content={(context) => {
        return (
          <BetterClickAwayListener
            onClickAway={() => {
              context.deepCloseAndRefocus()
            }}
          >
            <Paper elevation={Elevations.overlays}>
              <SaveForm
                context={context}
                selectionInterface={selectionInterface}
                onSave={() => {
                  setIsSaving(true)
                }}
              />
            </Paper>
          </BetterClickAwayListener>
        )
      }}
    >
      {({ handleClick }) => {
        if (closed) {
          return (
            <Button
              disabled={data === true}
              variant="outlined"
              color="primary"
              size="small"
              onClick={(e) => {
                if (searchPageMode === 'adhoc') {
                  return // handled by another button
                }
                e.stopPropagation()
                handleClick(e)
              }}
            >
              <SaveIcon />
            </Button>
          )
        }
        return (
          <ButtonWithTwoStates
            disabled={data === true}
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => {
              if (searchPageMode === 'adhoc') {
                return // handled by another button
              }
              e.stopPropagation()
              handleClick(e)
            }}
            states={[
              { state: 'Saving', loading: true },
              {
                state: searchPageMode === 'adhoc' ? 'Save' : 'Save as',
                loading: false,
              },
            ]}
            state={
              isSaving
                ? 'Saving'
                : searchPageMode === 'adhoc'
                ? 'Save'
                : 'Save as'
            }
          />
        )
      }}
    </Dropdown>
  )
}

const LeftBottom = () => {
  const { closed, setClosed, lastLength, setLength } = useResizableGridContext()
  const { data, searchPageMode, selectionInterface } = React.useContext(
    SavedSearchModeContext
  )

  if (closed) {
    return (
      <div className="flex flex-col items-center w-full py-4  flex-no-wrap flex-shrink-0 overflow-hidden">
        <div className="px-2">
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

          <Button
            disabled={typeof data === 'boolean' && searchPageMode === 'saved'}
            className="mt-3"
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
        </div>
      </div>
    )
  }
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      className="w-full min-h-16 py-1 px-2"
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
            className="Mui-text-text-primary Mui-icon-size-small"
          />
          <KeyboardArrowLeftIcon
            color="inherit"
            className="-ml-3 Mui-text-text-primary Mui-icon-size-small"
          />
        </Button>
      </Grid>
      <Grid item className="ml-auto">
        <Button
          disabled={typeof data === 'boolean' && searchPageMode === 'saved'}
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

const SaveIndicator = () => {
  const { isSaving } = React.useContext(SavedSearchModeContext)
  const { closed } = useResizableGridContext()
  const [showTempMessage, setShowTempMessage] = React.useState(false)
  React.useEffect(() => {
    let timeoutid = (undefined as unknown) as NodeJS.Timeout
    if (isSaving === false) {
      setShowTempMessage(true)
      timeoutid = setTimeout(() => {
        setShowTempMessage(false)
      }, 4000)
    }
    return () => {
      clearTimeout(timeoutid)
    }
  }, [isSaving])
  return (
    <>
      <span
        className={`opacity-75 text-sm flex-shrink-0 flex items-center flex-no-wrap ${
          closed ? 'mr-min flex-col' : 'mt-min flex-row'
        }`}
      >
        {isSaving ? (
          <>
            <CircularProgress
              className="text-current text-base"
              style={{ width: '1rem', height: '1rem' }}
            />{' '}
            <span
              className={`${closed ? 'writing-mode-vertical-lr mt-1' : 'ml-1'}`}
            >
              Saving ...
            </span>
          </>
        ) : (
          <>
            <CloudDoneIcon className="text-base" />{' '}
            <span
              className={`${closed ? 'writing-mode-vertical-lr mt-1' : 'ml-1'}`}
            >
              {showTempMessage ? 'Saved' : ''}
            </span>
          </>
        )}
      </span>
    </>
  )
}

const LeftTop = () => {
  const { closed } = useResizableGridContext()
  const {
    data,
    searchPageMode,
    isSaving,
    setIsSaving,
    selectionInterface,
  } = React.useContext(SavedSearchModeContext)
  useRerenderOnBackboneSync({
    lazyResult: typeof data !== 'boolean' ? data : undefined,
  })
  return (
    <div
      className={`min-h-16 ${
        closed ? 'h-full flex-shrink overflow-hidden' : ''
      }`}
    >
      <div
        className={`h-full w-full p-2 ${
          closed
            ? 'flex flex-col flex-no-wrap items-center'
            : 'flex flex-row flex-no-wrap items-center'
        }`}
      >
        {searchPageMode === 'adhoc' ? (
          <Dropdown
            content={(context) => {
              return (
                <BetterClickAwayListener
                  onClickAway={() => {
                    context.deepCloseAndRefocus()
                  }}
                >
                  <Paper elevation={Elevations.overlays}>
                    <SaveForm
                      context={context}
                      selectionInterface={selectionInterface}
                      onSave={() => {
                        setIsSaving(true)
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
                  className={`children-block text-left text-2xl flex-shrink ${
                    closed ? '' : ''
                  }`}
                  onClick={handleClick}
                  size="small"
                >
                  <div
                    className={`flex items-center flex-no-wrap ${
                      closed ? 'flex-col' : 'flex-row w-full'
                    }`}
                  >
                    <span
                      className={`opacity-50 ${
                        closed ? 'writing-mode-vertical-lr mb-2' : 'mr-2'
                      }`}
                    >
                      Unsaved search{' '}
                    </span>
                    <SaveButton />
                  </div>
                </Button>
              )
            }}
          </Dropdown>
        ) : null}
        {data === false && searchPageMode === 'saved' ? (
          <div
            className={`text-2xl opacity-50 ${
              closed ? 'writing-mode-vertical-lr' : ''
            }`}
          >
            Could not find search
          </div>
        ) : null}
        {data === true ? (
          <>
            <Skeleton variant="rect" className="w-full h-full" />
          </>
        ) : null}
        {typeof data !== 'boolean' ? (
          <>
            <Dropdown
              popperProps={{
                placement: closed ? 'right-start' : 'bottom',
              }}
              content={(context) => {
                return (
                  <BetterClickAwayListener
                    onClickAway={() => {
                      context.deepCloseAndRefocus()
                    }}
                  >
                    <Paper elevation={Elevations.overlays}>
                      <SaveForm
                        context={context}
                        selectionInterface={selectionInterface}
                        onSave={() => {
                          setIsSaving(true)
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
                    className={`children-block children-h-full text-left text-2xl flex-shrink ${
                      closed ? 'h-full' : ''
                    }`}
                    onClick={handleClick}
                    size="small"
                  >
                    <div
                      className={`flex items-center flex-no-wrap ${
                        closed ? 'flex-col h-full' : 'w-full flex-row'
                      }`}
                    >
                      <span
                        className={`truncate ${
                          closed
                            ? 'writing-mode-vertical-lr mb-2 flex-shrink'
                            : 'mr-2'
                        }`}
                      >
                        {data.plain.metacard.properties.title}
                      </span>
                      <SaveIndicator />
                    </div>
                  </Button>
                )
              }}
            </Dropdown>
          </>
        ) : (
          <></>
        )}
        <div className={`ml-auto flex-shrink-0 ${closed ? 'hidden' : ''}`}>
          <OptionsButton />
        </div>
      </div>
      {closed ? null : <DarkDivider className="h-min w-full" />}
    </div>
  )
}

const LeftMiddle = () => {
  const { closed } = useResizableGridContext()
  const { data, searchPageMode, selectionInterface } = React.useContext(
    SavedSearchModeContext
  )

  if (data === false && searchPageMode === 'saved') {
    // eventually add something?
    return <div className="overflow-hidden w-full h-full flex-shrink"></div>
  }
  return (
    <div
      className={`overflow-hidden w-full ${
        closed ? 'flex-shrink hidden' : 'h-full'
      }`}
    >
      {data === true ? (
        <Skeleton variant="rect" className="w-full h-full p-10"></Skeleton>
      ) : (
        <MRC
          className={`w-full h-full overflow-auto pb-64 ${
            closed ? 'hidden' : ''
          }`}
          defaultStyling={false}
          view={QueryAddView}
          viewOptions={{
            selectionInterface,
            model: selectionInterface.getCurrentQuery(),
          }}
        />
      )}
    </div>
  )
}

const useKeepSearchInUrl = ({
  queryModel,
  on,
}: {
  queryModel: any
  on: boolean
}) => {
  const history = useHistory()
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    // this is fairly expensive, so keep it heavily debounced
    const debouncedUpdate = _.debounce(() => {
      if (on) {
        const encodedQueryModel = encodeURIComponent(
          JSON.stringify(queryModel.toJSON())
        )
        history.replace({
          search: `?defaultQuery=${encodedQueryModel}`,
        })
      }
    }, 2000)
    listenTo(queryModel, 'change', debouncedUpdate)

    return () => {
      debouncedUpdate.cancel()
      stopListening(queryModel, 'change', debouncedUpdate)
    }
  }, [on, queryModel])
}

type SearchPageMode = 'saved' | 'adhoc'

const useSearchPageMode = (): SearchPageMode => {
  const params = useParams<{ id?: string }>()
  const [mode, setMode] = React.useState<SearchPageMode>(
    params.id ? 'saved' : 'adhoc'
  )
  React.useEffect(() => {
    if (params.id) {
      return setMode('saved')
    }
    return setMode('adhoc')
  }, [params.id])
  return mode
}

type SavedSearchPageMode = boolean | LazyQueryResult
const useSavedSearchPageMode = (): SavedSearchPageMode => {
  // handle all loading / data in here
  const { id } = useParams<{ id?: string }>()
  const [data, setData] = React.useState<SavedSearchPageMode>(false)
  React.useEffect(() => {
    const query = new Query.Model({
      sources: ['local'],
    })
    let subscriptionCancel = () => {}

    if (id) {
      setData(true)
      query.set(
        'filterTree',
        new FilterBuilderClass({
          filters: [
            new FilterClass({
              type: '=',
              property: 'id',
              value: id,
            }),
            new FilterClass({
              type: 'ILIKE',
              property: 'metacard-tags',
              value: '*',
            }),
          ],
        })
      )
      query.startSearchFromFirstPage(undefined, () => {
        const lazyResults = query
          .get('result')
          .get('lazyResults') as LazyQueryResults
        subscriptionCancel = lazyResults.subscribeTo({
          subscribableThing: 'filteredResults',
          callback: () => {
            const results = Object.values(lazyResults.results)
            if (results.length > 0) {
              setData(results[0])
            } else {
              setData(false)
            }
          },
        })
      })
    } else {
      setData(false)
    }
    return () => {
      subscriptionCancel()
      query.cancelCurrentSearches()
    }
  }, [id])
  return data
}

const AutoSave = () => {
  const {
    data,
    searchPageMode,
    isSaving,
    setIsSaving,
    selectionInterface,
    setSaveVersion,
  } = React.useContext(SavedSearchModeContext)
  const queryModel = selectionInterface.getCurrentQuery()
  const on = searchPageMode === 'saved'

  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    const callback = () => {
      if (on) {
        setSaveVersion(Math.random())
        setIsSaving(true)
      }
    }
    listenTo(queryModel, 'change', callback)

    return () => {
      stopListening(queryModel, 'change', callback)
    }
  }, [on, queryModel])
  return null
}

const SavedSearchModeContext = React.createContext({
  data: false as SavedSearchPageMode,
  searchPageMode: 'adhoc' as SearchPageMode,
  isSaving: false as boolean,
  setIsSaving: (() => {}) as React.Dispatch<boolean>,
  selectionInterface: {} as any,
  setSaveVersion: (() => {}) as React.Dispatch<number>,
})

export const HomePage = () => {
  const searchPageMode = useSearchPageMode()
  const data = useSavedSearchPageMode()
  const [saveVersion, setSaveVersion] = React.useState(Math.random()) // use this to see if we should abort the current save since we have more current data
  const [isSaving, setIsSaving] = React.useState(false)
  const history = useHistory()
  console.log(searchPageMode)
  console.log(data)
  const location = useLocation()
  let urlBasedQuery = location.search.split('?defaultQuery=')[1]
  if (urlBasedQuery) {
    try {
      urlBasedQuery = new Query.Model(
        JSON.parse(decodeURIComponent(urlBasedQuery))
      )
      ;(urlBasedQuery as any).startSearchFromFirstPage()
    } catch (err) {
      console.log(err)
      urlBasedQuery = ''
    }
  }
  // @ts-ignore ts-migrate(6133) FIXME: 'setQueryModel' is declared but its value is never... Remove this comment to see the full error message
  const [queryModel, setQueryModel] = React.useState(
    urlBasedQuery || new Query.Model()
  )
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: queryModel,
    })
  )
  useKeepSearchInUrl({ queryModel, on: searchPageMode === 'adhoc' })
  React.useEffect(() => {
    if (typeof data !== 'boolean') {
      selectionInterface.getCurrentQuery().set(data.plain.metacard.properties)
    }
  }, [data])
  React.useEffect(() => {
    if (searchPageMode === 'adhoc') {
      selectionInterface.getCurrentQuery().unset('id')
      selectionInterface.getCurrentQuery().resetToDefaults()
    }
  }, [searchPageMode])
  React.useEffect(() => {
    const controller = new AbortController()
    let timeoutid = (undefined as unknown) as NodeJS.Timeout
    if (isSaving) {
      timeoutid = setTimeout(() => {
        const currentQuery = selectionInterface.getCurrentQuery()
        const isNew = currentQuery.id === undefined
        if (isNew) {
          currentQuery.set('id', Common.generateUUID())
        }
        const currentQueryJSON = currentQuery.toJSON()
        const payload = {
          id: '1',
          jsonrpc: '2.0',
          method: 'ddf.catalog/create',
          params: {
            metacards: [
              {
                attributes: {
                  'metacard-tags': ['query'],
                  'metacard-type': 'metacard.query',
                  ...currentQueryJSON,
                },
                'metacard-type': 'metacard.query',
              },
            ],
          },
        }

        fetch('/direct', {
          method: 'POST',
          body: JSON.stringify(payload),
          signal: controller.signal,
        }).then(() => {
          if (typeof data !== 'boolean') {
            data.getBackbone().refreshData()
          }
          setTimeout(() => {
            setIsSaving(false)

            history.replace({
              pathname: `/search/${currentQueryJSON.id}`,
              search: '',
            })
          }, 1000)
        })
      }, 500)
    }
    return () => {
      clearTimeout(timeoutid)
      console.log(saveVersion + ': aborting old version')
      controller.abort()
    }
  }, [isSaving, saveVersion])
  return (
    <SavedSearchModeContext.Provider
      value={{
        data,
        searchPageMode,
        isSaving,
        setIsSaving,
        selectionInterface,
        setSaveVersion,
      }}
    >
      <AutoSave />
      <div className="w-full h-full">
        <SplitPane
          variant="horizontal"
          collapsedLength={80}
          // startingLength={40} // good for rapidly testing collapsed mode in dev server
        >
          <div className="h-full w-full py-2">
            <Paper
              elevation={Elevations.panels}
              className="h-full overflow-hidden w-full"
            >
              <div className="flex flex-col flex-no-wrap w-full h-full">
                <LeftTop />

                <LeftMiddle />
                <DarkDivider className="h-min w-full" />
                <LeftBottom />
              </div>
            </Paper>
          </div>
          <div className="w-full h-full">
            <GoldenLayout selectionInterface={selectionInterface} />
          </div>
        </SplitPane>
      </div>
    </SavedSearchModeContext.Provider>
  )
}
