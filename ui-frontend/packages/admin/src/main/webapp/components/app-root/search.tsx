import * as React from 'react'
import FilledInput from '@material-ui/core/FilledInput'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import useTheme from '@material-ui/core/styles/useTheme'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { useServicesContext } from '../services/services.pure'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { Link, useHistory } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {
  useAppRootContext,
  ApplicationType,
  ConfigurationType,
} from './app-root.pure'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import { debounce } from 'lodash'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fuse from 'fuse.js'
import scrollIntoView from 'scroll-into-view-if-needed'
import { setType } from '../../typescript/hooks'

const FUSE_OPTIONS = {
  shouldSort: true,
  tokenize: true,
  findAllMatches: true,
  includeScore: true,
  includeMatches: true,
  threshold: 0,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 3,
}

// https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case
const unCamelCase = (text: string) => {
  return text.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase()
  })
}

type PossibleType = {
  why: React.ComponentType<{ isSelected: boolean }>
  to: string
  match: string
}

const MAX_RESULTS = 20
const INCLUDE_APP_SUGGESTIONS = false

type determineSuggestionsProps = {
  applications: ApplicationType[]
  services: ConfigurationType[]
  properties: PropertyType[]
  setPropertySuggestions: setType<PossibleType[]>
  setAppSuggestions: setType<PossibleType[]>
  setConfigurationSuggestions: setType<PossibleType[]>
  value: string
  setLoading: setType<boolean>
  theme: Theme
}

type addHighlightingType = {
  text: string
  value: string
}

const MAX_TEXT_LENGTH = 50

/**
 * Uses the first token to truncate the text at an appropriate spot.  Assumption is the first token is likely the most important.
 */
const getTruncatedText = ({ text, value }: addHighlightingType) => {
  let firstOccurence = text.toLowerCase().indexOf(
    value
      .split(' ')
      .filter((token) => token !== '')[0]
      .toLowerCase()
  )
  let truncatedText = text.substring(0)
  if (firstOccurence === -1) {
    firstOccurence = 0
  }
  const lengthAvailable = MAX_TEXT_LENGTH - value.length
  const charsBefore = firstOccurence
  const charsAfter = text.length - firstOccurence - value.length
  const extraCharsAfter = Math.max(
    0,
    Math.floor(lengthAvailable / 2 - charsBefore)
  )
  const extraCharsBefore = Math.max(
    0,
    Math.floor(lengthAvailable / 2 - charsAfter)
  )

  const startIndex = Math.max(
    0,
    firstOccurence - lengthAvailable / 2 - extraCharsBefore
  )
  const endIndex = Math.min(
    text.length,
    firstOccurence + value.length + lengthAvailable / 2 + extraCharsAfter
  )
  truncatedText = text.substring(startIndex, endIndex)
  if (startIndex > 0) {
    truncatedText = ' . . . ' + truncatedText
  }
  if (endIndex < text.length) {
    truncatedText = truncatedText + ' . . .'
  }

  return truncatedText
}

const HighlightedText = ({
  text,
  value,
}: addHighlightingType): React.ReactElement => {
  const theme = useTheme()
  let truncatedText = getTruncatedText({ text, value })

  const indexes = [] as { index: number; length: number }[]

  value
    .toLowerCase()
    .split(' ')
    .filter((part) => part !== '')
    .forEach((token) => {
      const parts = truncatedText.toLowerCase().split(token.toLowerCase())
      let index = 0
      parts.forEach((part) => {
        index = index + part.length
        indexes.push({ index, length: token.length })
        index = index + value.length
      })
    })
  indexes.sort((a, b) => a.index - b.index)
  const highlights = [] as React.ReactNode[]
  indexes.forEach((startOfHighlight, i) => {
    const endOfLastHighlight =
      i !== 0 ? indexes[i - 1].index + indexes[i - 1].length : 0
    highlights.push(
      <>
        {truncatedText.substring(endOfLastHighlight, startOfHighlight.index)}
        <u
          style={{
            background:
              theme.palette.type === 'dark'
                ? fade(theme.palette.primary.dark, 0.3)
                : fade(theme.palette.primary.light, 0.1),
          }}
        >
          {truncatedText.substring(
            startOfHighlight.index,
            startOfHighlight.index + startOfHighlight.length
          )}
        </u>
      </>
    )
  })
  return <>{highlights}</>
}

const GENERAL_TYPOGRAPHY_STYLES = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

type FuseResponse<T> = {
  item: T
  highlights: {
    [key: string]: React.ReactNode
  }
  matches: {
    arrayIndex: 0
    indices: number[]
    key: string
    value: string
  }[]
  score: number
}[]

const propertyTypeFuseKeys = [
  {
    name: 'id',
    weight: 0.3,
  },
  {
    name: 'description',
    weight: 0.1,
  },
  {
    name: 'name',
    weight: 0.6,
  },
]

const propertyTypeFuse = new Fuse([] as PropertyType[], {
  ...FUSE_OPTIONS,
  keys: propertyTypeFuseKeys,
})

const configurationTypeFuseKeys = [
  {
    name: 'id',
    weight: 0.4,
  },
  {
    name: 'name',
    weight: 0.6,
  },
]

const configurationTypeFuse = new Fuse([] as ConfigurationType[], {
  ...FUSE_OPTIONS,
  keys: configurationTypeFuseKeys,
})

const determineSuggestions = ({
  properties,
  applications,
  services,
  setAppSuggestions,
  setConfigurationSuggestions,
  setPropertySuggestions,
  value,
  setLoading,
  theme,
}: determineSuggestionsProps) => {
  const HIGHLIGHT =
    theme.palette.type === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'
  if (INCLUDE_APP_SUGGESTIONS) {
    const appPossibles = [] as PossibleType[]
    applications.forEach((app) => {
      let concat = app.name + ' ' + app.description
      let matchIndex, match
      matchIndex = concat.toLowerCase().indexOf(value.toLowerCase())
      if (matchIndex === -1) {
        return
      }
      const prefixes = concat.substring(0, matchIndex).split(' ')
      const prefix = prefixes[prefixes.length - 1]
      match = concat.substring(matchIndex).split(' ')[0]
      if (prefix !== ' ') {
        match = prefix + match
      }
      appPossibles.push({
        match,
        why: ({ isSelected }: { isSelected: boolean }) => {
          return (
            <div
              style={{
                padding: '10px',
                width: '400px',
                background: isSelected ? HIGHLIGHT : 'inherit',
              }}
            >
              <Grid
                container
                alignItems="center"
                direction="row"
                wrap="nowrap"
                spacing={3}
              >
                <Grid item xs={5}>
                  <Typography
                    noWrap={false}
                    style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                  >
                    <HighlightedText value={value} text={app.name} />
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={5}
                  style={{
                    borderLeft: '1px solid rgba(0,0,0,.1)',
                    paddingLeft: '10px',
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                  >
                    <HighlightedText text={app.name} value={value} />
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{
                      fontSize: '12px',
                      opacity: 0.9,
                      ...GENERAL_TYPOGRAPHY_STYLES,
                    }}
                  >
                    <HighlightedText
                      text={app.description ? app.description : ''}
                      value={value}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </div>
          )
        },
        to: `/admin/applications/${encodeURIComponent(app.name)}`,
      })
    })
    setAppSuggestions(
      appPossibles
        .sort((a) => {
          if (a.match.toLowerCase().startsWith(value.toLowerCase())) {
            return -1
          } else {
            return 1
          }
        })
        .slice(0, MAX_RESULTS)
    )
  }

  const propertyPossibles = [] as PossibleType[]
  const servicePossibles = [] as PossibleType[]

  propertyTypeFuse.setCollection(properties)
  // @ts-ignore
  const propertyMatches = propertyTypeFuse.search(
    value
  ) as FuseResponse<PropertyType>

  propertyMatches.forEach((propertyMatch) => {
    propertyMatch.matches.forEach((match) => {
      const highlight = (
        <>
          {match.value.substring(0, match.indices[0])}
          <u
            style={{
              background:
                theme.palette.type === 'dark'
                  ? fade(theme.palette.primary.dark, 0.3)
                  : fade(theme.palette.primary.light, 0.1),
            }}
          >
            {match.value.substring(match.indices[0], match.indices[1])}
          </u>
          {match.value.substring(match.indices[1])}
        </>
      )
      propertyMatch.highlights = {
        ...propertyMatch.highlights,
        [match.key]: highlight,
      }
    })
  })
  propertyMatches.forEach((propertyMatch) => {
    propertyPossibles.push({
      why: ({ isSelected }: { isSelected: boolean }) => {
        return (
          <div
            style={{
              padding: '10px',
              width: '400px',
              background: isSelected ? HIGHLIGHT : 'inherit',
            }}
          >
            <Grid
              container
              alignItems="center"
              direction="row"
              wrap="nowrap"
              spacing={3}
            >
              <Grid item xs={5}>
                <Typography
                  noWrap={false}
                  style={{
                    ...GENERAL_TYPOGRAPHY_STYLES,
                  }}
                >
                  <HighlightedText
                    value={value}
                    text={
                      propertyMatch
                        ? propertyMatch.item.name || propertyMatch.item.id
                        : ''
                    }
                  />
                </Typography>
                {propertyMatch.item.name !== null &&
                !propertyMatch.item.name
                  .toLowerCase()
                  .includes(unCamelCase(propertyMatch.item.id).toLowerCase()) &&
                !propertyMatch.item.name
                  .toLowerCase()
                  .includes(propertyMatch.item.id.toLowerCase()) ? (
                  <>
                    <Typography
                      noWrap={false}
                      style={{
                        ...GENERAL_TYPOGRAPHY_STYLES,
                        fontSize: '12px',
                        opacity: 0.9,
                      }}
                      variant="body2"
                    >
                      <HighlightedText
                        value={value}
                        text={
                          propertyMatch.item.name !== null
                            ? propertyMatch.item.id
                            : ''
                        }
                      />
                    </Typography>
                  </>
                ) : null}
              </Grid>
              <Grid
                item
                xs={5}
                style={{
                  borderLeft: '1px solid rgba(0,0,0,.1)',
                  paddingLeft: '10px',
                }}
              >
                <Typography
                  variant="h6"
                  style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                >
                  <HighlightedText
                    value={value}
                    text={propertyMatch.item.parent.name}
                  />
                </Typography>
                <Typography
                  variant="body2"
                  style={{ opacity: 0.9, ...GENERAL_TYPOGRAPHY_STYLES }}
                >
                  <HighlightedText
                    value={value}
                    text={
                      propertyMatch
                        ? propertyMatch.item.name || propertyMatch.item.id
                        : ''
                    }
                  />
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    ...GENERAL_TYPOGRAPHY_STYLES,
                  }}
                >
                  <HighlightedText
                    text={
                      propertyMatch && propertyMatch.item.description
                        ? propertyMatch.item.description
                        : ''
                    }
                    value={value}
                  />
                </Typography>
              </Grid>
            </Grid>
          </div>
        )
      },
      match: '',
      to: `/admin/system/Configuration/Edit/${encodeURIComponent(
        propertyMatch.item.parent.name
      )}?focus=${encodeURIComponent(propertyMatch.item.id)}`,
    })
  })
  setPropertySuggestions(propertyPossibles.slice(0, MAX_RESULTS))

  configurationTypeFuse.setCollection(services)
  // @ts-ignore
  const configurationMatches = configurationTypeFuse.search(
    value
  ) as FuseResponse<ConfigurationType>
  configurationMatches.forEach((configurationMatch) => {
    servicePossibles.push({
      why: ({ isSelected }: { isSelected: boolean }) => {
        return (
          <div
            style={{
              padding: '10px',
              width: '400px',
              background: isSelected ? HIGHLIGHT : 'inherit',
            }}
          >
            <Grid
              container
              alignItems="center"
              direction="row"
              wrap="nowrap"
              spacing={3}
            >
              <Grid item xs={5}>
                <Typography
                  noWrap={false}
                  style={{
                    ...GENERAL_TYPOGRAPHY_STYLES,
                  }}
                >
                  <HighlightedText
                    text={configurationMatch.item.name}
                    value={value}
                  />
                </Typography>
              </Grid>
              <Grid
                item
                xs={5}
                style={{
                  borderLeft: '1px solid rgba(0,0,0,.1)',
                  paddingLeft: '10px',
                }}
              >
                <Typography
                  variant="h6"
                  style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                >
                  <HighlightedText
                    text={configurationMatch.item.name}
                    value={value}
                  />
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    ...GENERAL_TYPOGRAPHY_STYLES,
                  }}
                >
                  <HighlightedText
                    text={configurationMatch.item.id}
                    value={value}
                  />
                </Typography>
              </Grid>
            </Grid>
          </div>
        )
      },
      match: '',
      to: `/admin/system/Configuration/Edit/${encodeURIComponent(
        configurationMatch.item.name
      )}`,
    })
  })

  setConfigurationSuggestions(servicePossibles.slice(0, MAX_RESULTS))
  setLoading(false)
}

const debouncedDetermineSuggestions = debounce(determineSuggestions, 250)

type PropertyType = {
  parent: ConfigurationType
} & ConfigurationType['metatype'][0]

export const Search = () => {
  const anchorRef = React.useRef<null | HTMLElement>(null)
  const selectedRef = React.useRef<null | any>(null)
  const history = useHistory()
  const popperInstanceRef = React.useRef<null | any>(null)
  const [selected, setSelected] = React.useState(0 as number)
  const [value, setValue] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [properties, setProperties] = React.useState([] as PropertyType[])
  const { services } = useServicesContext()
  const [loading, setLoading] = React.useState(false)
  const [scrollTo, setScrollTo] = React.useState(false)
  const { applications } = useAppRootContext()
  const [configurationSuggestions, setConfigurationSuggestions] =
    React.useState([] as PossibleType[])
  const [propertySuggestions, setPropertySuggestions] = React.useState(
    [] as PossibleType[]
  )
  const [appSuggestions, setAppSuggestions] = React.useState(
    [] as PossibleType[]
  )
  const theme = useTheme()

  React.useEffect(() => {
    if (value.length > 2) {
      setOpen(true)
    } else {
      setOpen(false)
    }
    setSelected(0)
  }, [value])

  /**
   * Structuring the properties this way lets fusejs do proper ranking of the results.
   *
   * Removing factories for now since it doesn't really make sense to query on individual factory properties (for now).
   * They are still included in the configuration list though, since someone may be using this search bar to make a new one.
   * Maybe if we include things like "values" for properties in the results in the future including factories would make more sense.
   */
  React.useEffect(() => {
    setProperties(
      services
        .filter((service) => service.factory === false)
        .reduce((blob, service) => {
          return blob.concat(
            service.metatype.map((meta) => {
              return {
                parent: service,
                ...meta,
              }
            })
          )
        }, [] as PropertyType[])
    )
  }, [services])

  React.useEffect(() => {
    if (open === true) {
      //app suggestions
      setLoading(true)
      debouncedDetermineSuggestions({
        properties,
        applications,
        services,
        setAppSuggestions,
        setConfigurationSuggestions,
        setPropertySuggestions,
        value,
        setLoading,
        theme,
      })
    }
  }, [open, value])

  React.useEffect(() => {
    if (popperInstanceRef.current) {
      popperInstanceRef.current.update()
    }
    if (selectedRef.current && scrollTo) {
      scrollIntoView(selectedRef.current, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      })
      setScrollTo(false)
    }
  })

  const tryToOpen = () => {
    if (value.length > 2) {
      setTimeout(() => {
        setOpen(true)
      }, 100)
    }
  }

  return (
    <>
      <FilledInput
        ref={anchorRef}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        inputProps={{
          style: {
            padding: '10px',
          },
        }}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        placeholder="Search ..."
        margin="dense"
        style={{
          color: theme.palette.primary.contrastText,
          background: 'rgba(255,255,255,.1)',
        }}
        onFocus={tryToOpen}
        onClick={tryToOpen}
        onKeyDown={(e) => {
          const totalLength =
            appSuggestions.length +
            configurationSuggestions.length +
            propertySuggestions.length
          if (e.keyCode === 38) {
            //up
            e.preventDefault()
            setSelected(Math.max(0, selected - 1))
            setScrollTo(true)
          } else if (e.keyCode === 40) {
            //down
            e.preventDefault()
            setSelected(Math.min(selected + 1, totalLength - 1))
            setScrollTo(true)
            tryToOpen()
          } else if (e.keyCode === 13) {
            //enter
            e.preventDefault()
            const toLoad = appSuggestions
              .concat(configurationSuggestions)
              .concat(propertySuggestions)[selected]
            history.push(toLoad.to)
            setOpen(false)
          } else if (e.keyCode === 27) {
            //escape
            setOpen(false)
          }
        }}
      />
      <Popper
        popperRef={popperInstanceRef}
        open={open}
        anchorEl={anchorRef.current}
      >
        <ClickAwayListener
          onClickAway={() => {
            setOpen(false)
          }}
        >
          <Paper
            style={{ maxHeight: '50vh', overflow: 'auto', padding: '20px' }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                {appSuggestions.length > 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                    >
                      Applications
                    </Typography>
                    <Divider style={{ marginBottom: '10px' }} />
                    {appSuggestions.map((suggestion, index) => {
                      const isSelected = index === selected
                      const Suggestion = suggestion.why
                      return (
                        <Link
                          to={suggestion.to}
                          onClick={() => {
                            setOpen(false)
                          }}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                          onMouseMove={() => {
                            setSelected(index)
                          }}
                          ref={isSelected ? selectedRef : null}
                        >
                          <Suggestion isSelected={isSelected} />
                        </Link>
                      )
                    })}
                  </>
                ) : null}
                {configurationSuggestions.length > 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                    >
                      Configurations
                    </Typography>
                    <Divider style={{ marginBottom: '10px' }} />
                    {configurationSuggestions.map((suggestion, index) => {
                      const isSelected =
                        appSuggestions.length + index === selected
                      const Suggestion = suggestion.why
                      return (
                        <Link
                          to={suggestion.to}
                          onClick={() => {
                            setOpen(false)
                          }}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                          onMouseMove={() => {
                            setSelected(appSuggestions.length + index)
                          }}
                          ref={isSelected ? selectedRef : null}
                        >
                          <Suggestion isSelected={isSelected} />
                        </Link>
                      )
                    })}
                  </>
                ) : null}
                {propertySuggestions.length > 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      style={{ ...GENERAL_TYPOGRAPHY_STYLES }}
                    >
                      Configuration Properties
                    </Typography>
                    <Divider style={{ marginBottom: '10px' }} />
                    {propertySuggestions.map((suggestion, index) => {
                      const isSelected =
                        configurationSuggestions.length +
                          appSuggestions.length +
                          index ===
                        selected
                      const Suggestion = suggestion.why
                      return (
                        <Link
                          to={suggestion.to}
                          onClick={() => {
                            setOpen(false)
                          }}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                          onMouseMove={() => {
                            setSelected(
                              configurationSuggestions.length +
                                appSuggestions.length +
                                index
                            )
                          }}
                          ref={isSelected ? selectedRef : null}
                        >
                          <Suggestion isSelected={isSelected} />
                        </Link>
                      )
                    })}
                  </>
                ) : null}
                {configurationSuggestions.length === 0 &&
                appSuggestions.length === 0 &&
                propertySuggestions.length === 0 ? (
                  <div>No results found for query "{value}"</div>
                ) : null}
              </>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  )
}
