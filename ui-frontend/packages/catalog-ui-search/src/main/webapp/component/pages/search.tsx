import * as React from 'react'
import { GoldenLayout } from '../golden-layout/golden-layout'
import {
  SplitPane,
  useResizableGridContext,
} from '../resizable-grid/resizable-grid'
import SelectionInterfaceModel from '../selection-interface/selection-interface.model'
import { useQuery, useUserQuery } from '../../js/model/TypedQuery'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { QueryAddReact } from '../query-add/query-add'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import queryString from 'query-string'

import Button, { ButtonProps } from '@material-ui/core/Button'
import MoreVert from '@material-ui/icons/MoreVert'
import { Elevations } from '../theme/theme'
import SearchIcon from '@material-ui/icons/SearchTwoTone'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import {
  Link,
  LinkProps,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom'
import _ from 'lodash'
import TextField from '@material-ui/core/TextField'
import { DarkDivider } from '../dark-divider/dark-divider'
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
import {
  useRerenderOnBackboneSync,
  useStatusOfLazyResults,
} from '../../js/model/LazyQueryResult/hooks'
import CloudDoneIcon from '@material-ui/icons/CloudDone'
import SaveIcon from '@material-ui/icons/Save'
import { useMenuState } from '../menu-state/menu-state'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import { TypedUserInstance } from '../singletons/TypedUser'
import useSnack from '../hooks/useSnack'
import Popover from '@material-ui/core/Popover'
import Autocomplete, { AutocompleteProps } from '@material-ui/lab/Autocomplete'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'
import OverflowTooltip, {
  OverflowTooltipHTMLElement,
} from '../overflow-tooltip/overflow-tooltip'
import {
  AsyncTasks,
  useCreateSearchTask,
  useRestoreSearchTask,
  useSaveSearchTaskBasedOnParams,
} from '../../js/model/AsyncTask/async-task'
import { Memo } from '../memo/memo'

type SaveFormType = {
  selectionInterface: any
  onSave: (title: string) => void
  onClose: () => void
}

export const SaveForm = ({
  onClose,
  selectionInterface,
  onSave,
}: SaveFormType) => {
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
            onSave(title)
            e.preventDefault()
            onClose()
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
              onClose()
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

const useSearchResults = ({
  searchText,
  archived = false,
}: {
  searchText: string
  archived?: boolean
}) => {
  const [state, setState] = React.useState({
    lazyResults: [],
    loading: true,
  } as { lazyResults: LazyQueryResult[]; loading: boolean })
  const [hasSearched, setHasSearched] = React.useState(false)
  const [queryModel] = useQuery({
    attributes: {
      sorts: [{ attribute: 'metacard.modified', direction: 'descending' }],
      filterTree: new FilterBuilderClass({
        type: 'AND',
        filters: [
          new FilterClass({
            property: 'title',
            value: `*${searchText}*`,
            type: 'ILIKE',
          }),
          new FilterClass({
            property: archived ? 'metacard.deleted.tags' : 'metacard-tags',
            value: 'query',
            type: 'ILIKE',
          }),
          ...(archived
            ? [
                new FilterClass({
                  property: 'metacard-tags',
                  value: '*',
                  type: 'ILIKE',
                }),
              ]
            : []),
        ],
      }),
    },
  })
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: queryModel,
    })
  )
  React.useEffect(() => {
    selectionInterface.getCurrentQuery().set(
      'filterTree',
      new FilterBuilderClass({
        type: 'AND',
        filters: [
          new FilterClass({
            property: 'title',
            value: `*${searchText}*`,
            type: 'ILIKE',
          }),
          new FilterClass({
            property: archived ? 'metacard.deleted.tags' : 'metacard-tags',
            value: 'query',
            type: 'ILIKE',
          }),
          ...(archived
            ? [
                new FilterClass({
                  property: 'metacard-tags',
                  value: '*',
                  type: 'ILIKE',
                }),
              ]
            : []),
        ],
      })
    )
    selectionInterface.getCurrentQuery().cancelCurrentSearches()
    setState({
      lazyResults: [],
      loading: true,
    })
    const timeoutId = window.setTimeout(() => {
      if (searchText.length >= 0) {
        selectionInterface.getCurrentQuery().startSearchFromFirstPage()
        setHasSearched(true)
      }
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchText])
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const { isSearching } = useStatusOfLazyResults({ lazyResults })
  React.useEffect(() => {
    setState({
      lazyResults: Object.values(lazyResults.results),
      loading: hasSearched ? isSearching : true,
    })
  }, [lazyResults, isSearching])
  return state
}

export const OpenSearch = ({
  onFinish,
  constructLink,
  label,
  archived = false,
  autocompleteProps,
}: {
  onFinish: (selection: LazyQueryResult) => void
  constructLink: (result: LazyQueryResult) => LinkProps['to']
  label: string
  archived?: boolean
  autocompleteProps?: Partial<
    AutocompleteProps<LazyQueryResult, false, true, false>
  >
}) => {
  const [positioningDone, setPositioningDone] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [open, setOpen] = React.useState(true)
  const inputRef = React.useRef<HTMLDivElement>(null)
  const [
    currentHighlight,
    setCurrentHighlight,
  ] = React.useState<OverflowTooltipHTMLElement | null>(null)
  const [options, setOptions] = React.useState<LazyQueryResult[]>([])
  const { lazyResults, loading } = useSearchResults({
    searchText: value,
    archived,
  })
  React.useEffect(() => {
    setOptions(lazyResults)
  }, [lazyResults])

  React.useEffect(() => {
    if (currentHighlight && currentHighlight.overflowTooltip) {
      currentHighlight.overflowTooltip.setOpen(true)
    }
    return () => {
      if (currentHighlight && currentHighlight.overflowTooltip)
        currentHighlight.overflowTooltip.setOpen(false)
    }
  }, [currentHighlight])
  React.useEffect(() => {
    const timeoutid = window.setTimeout(() => {
      setPositioningDone(true)
    }, 500)
    return () => {
      window.clearTimeout(timeoutid)
    }
  }, [])
  return (
    <Autocomplete
      className="w-64"
      getOptionSelected={(option) => option.plain.id === option.plain.id}
      getOptionLabel={(option) => option.plain.metacard.properties.title}
      options={options}
      innerRef={inputRef}
      open={open && positioningDone}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      loading={loading}
      autoHighlight
      onHighlightChange={() => {
        if (inputRef.current) {
          const highlightedElementString = (inputRef.current.querySelector(
            'input'
          ) as HTMLInputElement).getAttribute('aria-activedescendant')
          if (highlightedElementString) {
            setCurrentHighlight(
              (document.querySelector(
                `#${highlightedElementString}`
              ) as HTMLLIElement).querySelector(
                'div'
              ) as OverflowTooltipHTMLElement
            )
          } else {
            setCurrentHighlight(null)
          }
        } else {
          setCurrentHighlight(null)
        }
      }}
      noOptionsText="Nothing found."
      renderOption={(option) => {
        return (
          <Link
            className="w-full p-0 font-normal no-underline hover:font-normal hover:no-underline"
            to={constructLink(option)}
          >
            <OverflowTooltip
              tooltipProps={{
                title: (
                  <div className="w-full p-2">
                    {option.plain.metacard.properties.title}
                  </div>
                ),
              }}
            >
              <div className="truncate w-full p-2">
                {option.plain.metacard.properties.title}
              </div>
            </OverflowTooltip>
          </Link>
        )
      }}
      ListboxProps={{
        className: 'children-p-0 MuiAutocomplete-listbox', // we have to add the original class (MuiAutocomplete-listbox) back on unfortunately
      }}
      onChange={(_e, value) => {
        if (value) {
          onFinish(value)
        }
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
            }}
            label={label}
            variant="outlined"
            autoFocus
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )
      }}
      {...autocompleteProps}
    />
  )
}

const OptionsButton = () => {
  const { searchPageMode, data, selectionInterface } = React.useContext(
    SavedSearchModeContext
  )
  const { closed } = useResizableGridContext()
  const menuState = useMenuState()
  const menuStateOpenSearch = useMenuState()
  const menuStateNewFromExisting = useMenuState()
  const menuStateCopy = useMenuState()
  const menuStateRename = useMenuState()
  const menuStateRestore = useMenuState()
  const addSnack = useSnack()
  const history = useHistory()
  const [encodedQueryModelJSON, setEncodedQueryModelJSON] = React.useState('')

  React.useEffect(() => {
    setEncodedQueryModelJSON(
      encodeURIComponent(
        JSON.stringify(selectionInterface.getCurrentQuery().toJSON())
      )
    )
  }, [menuState.open])
  return (
    <>
      <Button
        fullWidth
        innerRef={menuState.anchorRef}
        onClick={menuState.handleClick}
      >
        {closed ? null : <span className="Mui-text-primary">Options</span>}
        <MoreVert />
      </Button>
      <Popover
        open={menuStateRestore.open}
        anchorEl={menuState.anchorRef.current}
        onClose={menuStateRestore.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper elevation={Elevations.overlays} className="p-2">
          <OpenSearch
            label="Restore a search from the trash"
            archived
            constructLink={(result) => {
              const copy = JSON.parse(
                JSON.stringify(result.plain.metacard.properties)
              )
              delete copy.id
              delete copy.title
              delete copy['metacard.deleted.date']
              delete copy['metacard.deleted.id']
              delete copy['metacard.deleted.tags']
              delete copy['metacard.deleted.version']
              delete copy['metacard-tags']
              delete copy['metacard-type']

              const encodedQueryModel = encodeURIComponent(JSON.stringify(copy))
              return {
                pathname: '/search',
                search: `?defaultQuery=${encodedQueryModel}`,
              }
            }}
            onFinish={(result) => {
              AsyncTasks.restore({ lazyResult: result })
              // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
              history.replace({
                pathname: `/search/${result.plain.metacard.properties['metacard.deleted.id']}`,
                search: '',
              })
              menuStateRestore.handleClose()
            }}
          />
        </Paper>
      </Popover>
      <Popover
        open={menuStateCopy.open}
        anchorEl={menuState.anchorRef.current}
        onClose={menuStateCopy.handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper elevation={Elevations.overlays} className="p-2">
          <SaveForm
            onClose={() => {
              menuStateCopy.handleClose()
            }}
            onSave={(title) => {
              const currentQueryJSON = selectionInterface
                .getCurrentQuery()
                .toJSON()
              currentQueryJSON.title = title
              const task = AsyncTasks.createSearch({ data: currentQueryJSON })
              history.push({
                pathname: `/search/${task.data.id}`,
                search: '',
              })

              addSnack(`Making a copy of ${title}`, {
                alertProps: { severity: 'info' },
              })
            }}
            selectionInterface={selectionInterface}
          />
        </Paper>
      </Popover>
      <Popover
        open={menuStateRename.open}
        anchorEl={menuState.anchorRef.current}
        onClose={menuStateRename.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper elevation={Elevations.overlays} className="p-2">
          <SaveForm
            onClose={() => {
              menuStateRename.handleClose()
            }}
            onSave={(title) => {
              if (typeof data !== 'boolean') {
                const currentQueryJSON = selectionInterface
                  .getCurrentQuery()
                  .toJSON()
                currentQueryJSON.title = title
                AsyncTasks.saveSearch({
                  data: currentQueryJSON,
                  lazyResult: data,
                })
              }
            }}
            selectionInterface={selectionInterface}
          />
        </Paper>
      </Popover>
      <Popover
        open={menuStateNewFromExisting.open}
        anchorEl={menuState.anchorRef.current}
        onClose={menuStateNewFromExisting.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper elevation={Elevations.overlays} className="p-2">
          <OpenSearch
            label="Start a new search from an existing saved search"
            constructLink={(result) => {
              const copy = JSON.parse(
                JSON.stringify(result.plain.metacard.properties)
              )
              delete copy.id
              delete copy.title
              const encodedQueryModel = encodeURIComponent(JSON.stringify(copy))
              return {
                pathname: '/search',
                search: `?defaultQuery=${encodedQueryModel}`,
              }
            }}
            onFinish={(result) => {
              const copy = JSON.parse(
                JSON.stringify(result.plain.metacard.properties)
              )
              delete copy.id
              delete copy.title
              const encodedQueryModel = encodeURIComponent(JSON.stringify(copy))
              // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
              history.replace({
                pathname: '/search',
                search: `?defaultQuery=${encodedQueryModel}`,
              })
              selectionInterface.getCurrentQuery().set({
                ...copy,
                id: null,
                title: '',
              })
              addSnack(
                `New search based on '${result.plain.metacard.properties.title}'`,
                {
                  alertProps: { severity: 'info' },
                }
              )
              menuStateNewFromExisting.handleClose()
            }}
          />
        </Paper>
      </Popover>
      <Popover
        open={menuStateOpenSearch.open}
        anchorEl={menuState.anchorRef.current}
        onClose={menuStateOpenSearch.handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper elevation={Elevations.overlays} className="p-2">
          <div className="flex flex-row flex-no-wrap">
            <OpenSearch
              label="Open a saved search"
              constructLink={(result) => {
                return `/search/${result.plain.id}`
              }}
              onFinish={(value) => {
                // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                history.replace({
                  pathname: `/search/${value.plain.id}`,
                  search: '',
                })
                addSnack(
                  `Search '${value.plain.metacard.properties.title}' opened`,
                  {
                    alertProps: { severity: 'info' },
                  }
                )
                menuStateOpenSearch.handleClose()
              }}
            />
            <Button
              color="primary"
              onClick={() => {
                menuStateOpenSearch.handleClose()
                menuStateRestore.handleClick()
              }}
            >
              Check Trash?
            </Button>
          </div>
        </Paper>
      </Popover>
      <Menu
        anchorEl={menuState.anchorRef.current}
        getContentAnchorEl={null}
        open={menuState.open}
        onClose={menuState.handleClose}
        keepMounted={true}
        disableEnforceFocus
        disableAutoFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem
          component={Link}
          to="/search"
          onClick={() => {
            menuState.handleClose()
            selectionInterface
              .getCurrentQuery()
              .set('id', null)
              .resetToDefaults()
            addSnack('Starting a new search', {
              alertProps: { severity: 'info' },
            })
          }}
        >
          New
        </MenuItem>
        <MenuItem
          innerRef={menuStateNewFromExisting.anchorRef}
          onClick={() => {
            menuState.handleClose()
            menuStateNewFromExisting.handleClick()
          }}
        >
          New from existing
        </MenuItem>
        <MenuItem
          innerRef={menuStateOpenSearch.anchorRef}
          onClick={() => {
            menuState.handleClose()
            menuStateOpenSearch.handleClick()
          }}
        >
          Open
        </MenuItem>
        {/* <MenuItem
          onClick={() => {
            menuStateRestore.handleClick()
            menuState.handleClose()
          }}
        >
          Restore from trash
        </MenuItem> */}
        <MenuItem
          component={Link}
          disabled={searchPageMode === 'adhoc' || typeof data === 'boolean'}
          to={`/search?defaultQuery=${encodedQueryModelJSON}`}
          onClick={(e: any) => {
            e.stopPropagation()
            e.preventDefault()
            menuState.handleClose()
            menuStateCopy.handleClick()
            return
          }}
        >
          Make a copy
        </MenuItem>
        <DarkDivider className="m-2" />
        {/* <MenuItem disabled={searchPageMode === 'adhoc'}>Save</MenuItem>
        <MenuItem disabled={searchPageMode === 'adhoc'}>Save as</MenuItem> */}
        <MenuItem
          disabled={searchPageMode === 'adhoc' || typeof data === 'boolean'}
          onClick={() => {
            menuStateRename.handleClick()
            menuState.handleClose()
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          disabled={searchPageMode === 'adhoc' || typeof data === 'boolean'}
          onClick={() => {
            if (typeof data !== 'boolean') {
              AsyncTasks.delete({ lazyResult: data })
              history.push({
                pathname: `/search`,
                search: '',
              })
            }
            menuState.handleClose()
          }}
        >
          Move to trash
        </MenuItem>
        <DarkDivider className="m-2" />
        <MenuItem
          disabled={searchPageMode === 'saved' && typeof data === 'boolean'}
          onClick={() => {
            selectionInterface.getCurrentQuery().set('type', 'advanced')
            if (searchPageMode === 'adhoc') {
              // set this as their preference
              TypedUserInstance.updateQuerySettings({
                type: 'advanced',
              })
            }
            menuState.handleClose()
          }}
        >
          Advanced View
        </MenuItem>
        <MenuItem
          disabled={searchPageMode === 'saved' && typeof data === 'boolean'}
          onClick={() => {
            selectionInterface.getCurrentQuery().set('type', 'basic')
            if (searchPageMode === 'adhoc') {
              // set this as their preference
              TypedUserInstance.updateQuerySettings({
                type: 'basic',
              })
            }
            menuState.handleClose()
          }}
        >
          Basic View
        </MenuItem>
      </Menu>
    </>
  )
}

const SaveButton = () => {
  const { closed } = useResizableGridContext()
  const { data, searchPageMode, isSaving } = React.useContext(
    SavedSearchModeContext
  )
  return (
    <>
      {closed ? (
        <Button
          disabled={data === true}
          variant="outlined"
          color="primary"
          size="small"
        >
          <SaveIcon />
        </Button>
      ) : (
        <ButtonWithTwoStates
          disabled={data === true}
          variant="outlined"
          color="primary"
          size="small"
          states={[
            { state: 'Saving', loading: true },
            {
              state: searchPageMode === 'adhoc' ? 'Save' : 'Save as',
              loading: false,
            },
          ]}
          state={(() => {
            if (isSaving) {
              return 'Saving'
            }
            return searchPageMode === 'adhoc' ? 'Save' : 'Save as'
          })()}
        />
      )}
    </>
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
  const popupState = useMenuState()
  useUpdateEffect(() => {
    let timeoutid = undefined as number | undefined
    if (isSaving === false) {
      setShowTempMessage(true)
      timeoutid = window.setTimeout(() => {
        setShowTempMessage(false)
      }, 4000)
    }
    return () => {
      window.clearTimeout(timeoutid)
    }
  }, [isSaving])
  return (
    <>
      <Popover
        anchorEl={popupState.anchorRef.current}
        open={popupState.open}
        onClose={popupState.handleClose}
        onMouseDown={(e) => {
          // otherwise since we're technically in a button this will trigger it
          e.stopPropagation()
        }}
        onClick={(e) => {
          // otherwise since we're technically in a button this will trigger it
          e.stopPropagation()
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper elevation={Elevations.overlays}>
          <div className="flex flex-row flex-no-wrap items-center p-4 text-2xl Mui-text-primary">
            {isSaving ? (
              <>
                <CircularProgress
                  className="mr-2"
                  style={{ width: '1rem', height: '1rem' }}
                />
                Saving ...
              </>
            ) : (
              <>
                <CloudDoneIcon className="mr-2" /> All changes saved to the
                system.
              </>
            )}
          </div>
          <DarkDivider />
          <div className="p-4">
            Every change you make is automatically saved.
          </div>
        </Paper>
      </Popover>
      <Button
        className="flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          popupState.handleClick()
        }}
        innerRef={popupState.anchorRef}
      >
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
                className={`${
                  closed ? 'writing-mode-vertical-lr mt-1' : 'ml-1'
                }`}
              >
                Saving ...
              </span>
            </>
          ) : (
            <>
              <CloudDoneIcon className="text-base" />{' '}
              <span
                className={`${
                  closed ? 'writing-mode-vertical-lr mt-1' : 'ml-1'
                }`}
              >
                {showTempMessage ? 'Saved' : ''}
              </span>
            </>
          )}
        </span>
      </Button>
    </>
  )
}

const LeftTop = () => {
  const { closed } = useResizableGridContext()
  const { data, searchPageMode, selectionInterface } = React.useContext(
    SavedSearchModeContext
  )
  useRerenderOnBackboneSync({
    lazyResult: typeof data !== 'boolean' ? data : undefined,
  })
  const history = useHistory()
  const adhocMenuState = useMenuState()
  const savedMenuState = useMenuState()
  return (
    <div
      className={`min-h-16 ${
        closed ? 'h-full flex-shrink overflow-hidden' : ''
      }`}
    >
      <div
        className={`h-full w-full relative p-2 ${
          closed
            ? 'flex flex-col flex-no-wrap items-center'
            : 'flex flex-row flex-no-wrap items-center'
        }`}
      >
        {searchPageMode === 'adhoc' ? (
          <>
            <Popover
              anchorEl={adhocMenuState.anchorRef.current}
              open={adhocMenuState.open}
              onClose={adhocMenuState.handleClose}
              anchorOrigin={{
                vertical: closed ? 'top' : 'bottom',
                horizontal: closed ? 'right' : 'left',
              }}
            >
              <Paper elevation={Elevations.overlays}>
                <SaveForm
                  onClose={() => {
                    adhocMenuState.handleClose()
                  }}
                  selectionInterface={selectionInterface}
                  onSave={(title) => {
                    selectionInterface.getCurrentQuery().set('title', title)
                    const searchData = selectionInterface
                      .getCurrentQuery()
                      .toJSON()
                    if (searchPageMode === 'adhoc') {
                      const task = AsyncTasks.createSearch({
                        data: searchData,
                      })
                      history.push({
                        pathname: `/search/${task.data.id}`,
                        search: '',
                      })
                    } else if (typeof data !== 'boolean') {
                      AsyncTasks.saveSearch({
                        lazyResult: data,
                        data: searchData,
                      })
                    }
                  }}
                />
              </Paper>
            </Popover>
            <Button
              className={`children-block children-h-full text-left text-2xl flex-shrink truncate ${
                closed ? 'h-full' : ''
              }`}
              onClick={adhocMenuState.handleClick}
              size="small"
              innerRef={adhocMenuState.anchorRef}
            >
              <div
                className={`flex items-center flex-no-wrap ${
                  closed ? 'flex-col h-full' : 'flex-row w-full'
                }`}
              >
                <span
                  className={`opacity-50 flex-shrink truncate ${
                    closed ? 'writing-mode-vertical-lr mb-2' : 'mr-2'
                  }`}
                >
                  Unsaved search{' '}
                </span>
                <SaveButton />
              </div>
            </Button>
          </>
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
            <Popover
              anchorEl={savedMenuState.anchorRef.current}
              open={savedMenuState.open}
              onClose={savedMenuState.handleClose}
              anchorOrigin={{
                vertical: closed ? 'top' : 'bottom',
                horizontal: closed ? 'right' : 'left',
              }}
            >
              <Paper elevation={Elevations.overlays}>
                <SaveForm
                  onClose={savedMenuState.handleClose}
                  selectionInterface={selectionInterface}
                  onSave={(title) => {
                    selectionInterface.getCurrentQuery().set('title', title)
                    const searchData = selectionInterface
                      .getCurrentQuery()
                      .toJSON()
                    if (searchPageMode === 'adhoc') {
                      AsyncTasks.createSearch({ data: searchData })
                    } else if (typeof data !== 'boolean') {
                      AsyncTasks.saveSearch({
                        lazyResult: data,
                        data: searchData,
                      })
                    }
                  }}
                />
              </Paper>
            </Popover>
            <Button
              fullWidth
              className={`children-block children-h-full text-left text-2xl flex-shrink overflow-hidden ${
                closed ? 'h-full' : ''
              }`}
              onClick={savedMenuState.handleClick}
              size="small"
              innerRef={savedMenuState.anchorRef}
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
          </>
        ) : (
          <></>
        )}
        <div
          className={`ml-auto flex-shrink-0 ${
            closed ? 'w-full order-first pt-1 h-16' : ''
          }`}
        >
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
        <div
          className={`w-full h-full overflow-auto pb-64 ${
            closed ? 'hidden' : ''
          }`}
        >
          <QueryAddReact model={selectionInterface.getCurrentQuery()} />
        </div>
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
          search: `${queryString.stringify({
            defaultQuery: encodedQueryModel,
          })}`,
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

const useSearchPageMode = ({ id }: { id?: string }): SearchPageMode => {
  const [mode, setMode] = React.useState<SearchPageMode>(id ? 'saved' : 'adhoc')
  React.useEffect(() => {
    if (id) {
      return setMode('saved')
    }
    return setMode('adhoc')
  }, [id])
  return mode
}

type SavedSearchPageMode = boolean | LazyQueryResult
const useSavedSearchPageMode = ({
  id,
}: {
  id?: string
}): SavedSearchPageMode => {
  // handle all loading / data in here
  const [data, setData] = React.useState<SavedSearchPageMode>(false)
  const task = useCreateSearchTask({ id })
  const restoreTask = useRestoreSearchTask({ id })
  const [queryModel] = useQuery({
    attributes: {
      sources: ['local'],
    },
  })
  console.info(task)
  React.useEffect(() => {
    if (task || restoreTask) {
      setData(true)
      return
    }
    let subscriptionCancel = () => {}

    if (id) {
      setData(true)
      queryModel.set(
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
      queryModel.initializeResult()
      const lazyResults = queryModel
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
      queryModel.startSearchFromFirstPage()
    } else {
      setData(false)
    }
    return () => {
      subscriptionCancel()
      queryModel.cancelCurrentSearches()
    }
  }, [id, task, restoreTask])
  return data
}

const AutoSave = () => {
  const { searchPageMode, selectionInterface, data } = React.useContext(
    SavedSearchModeContext
  )
  const queryModel = selectionInterface.getCurrentQuery()
  const on = searchPageMode === 'saved'

  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    const callback = () => {
      const changedAttributes = Object.keys(queryModel.changedAttributes())
      const isFromSwappingToSavedSearch = changedAttributes.includes('id')
      const isAttributeThatMatters =
        changedAttributes.includes('filterTree') ||
        changedAttributes.includes('sorts') ||
        changedAttributes.includes('sources')
      if (
        on &&
        queryModel.get('id') &&
        !isFromSwappingToSavedSearch &&
        isAttributeThatMatters &&
        typeof data !== 'boolean'
      ) {
        AsyncTasks.saveSearch({
          lazyResult: data,
          data: queryModel.toJSON(),
        })
      }
    }
    listenTo(queryModel, 'change', callback)

    return () => {
      stopListening(queryModel, 'change', callback)
    }
  }, [on, queryModel, data])
  return null
}

const SavedSearchModeContext = React.createContext({
  data: false as SavedSearchPageMode,
  searchPageMode: 'adhoc' as SearchPageMode,
  isSaving: false as boolean,
  selectionInterface: {} as any,
})

const decodeUrlIfValid = (search: string) => {
  if (location) {
    try {
      const queryParams = queryString.parse(search)
      const defaultQueryString = (queryParams['defaultQuery'] || '').toString()
      return JSON.parse(decodeURIComponent(defaultQueryString))
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
  const [queryModel] = useUserQuery({
    attributes: decodeUrlIfValid(location.search),
  })
  const { id } = useParams<{ id?: string }>()
  const searchPageMode = useSearchPageMode({ id })
  const data = useSavedSearchPageMode({ id })
  const saveSearchTask = useSaveSearchTaskBasedOnParams()
  const isSaving = saveSearchTask !== null
  React.useEffect(() => {
    let urlBasedQuery = location.search.split('?defaultQuery=')[1]
    if (urlBasedQuery) {
      ;(selectionInterface.getCurrentQuery() as any).startSearchFromFirstPage()
    }
  }, [])
  const [selectionInterface] = React.useState(
    new SelectionInterfaceModel({
      currentQuery: queryModel,
    })
  )
  useKeepSearchInUrl({
    queryModel: selectionInterface.getCurrentQuery(),
    on: searchPageMode === 'adhoc',
  })
  React.useEffect(() => {
    if (typeof data !== 'boolean') {
      selectionInterface.getCurrentQuery().set(data.plain.metacard.properties)
    }
  }, [data])
  useUpdateEffect(() => {
    if (searchPageMode === 'adhoc') {
      selectionInterface.getCurrentQuery().unset('id')
      if (location.search === '') {
        selectionInterface.getCurrentQuery().resetToDefaults()
      }
    }
  }, [searchPageMode, location.search])
  return (
    <SavedSearchModeContext.Provider
      value={{
        data,
        searchPageMode,
        isSaving,
        selectionInterface,
      }}
    >
      <Memo dependencies={[selectionInterface]}>
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
      </Memo>
    </SavedSearchModeContext.Provider>
  )
}
