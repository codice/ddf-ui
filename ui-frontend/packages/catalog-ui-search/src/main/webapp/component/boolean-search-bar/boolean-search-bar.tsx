/* Copyright (c) Connexta, LLC */
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { green, red } from '@material-ui/core/colors'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'
import Check from '@material-ui/icons/Check'
import Close from '@material-ui/icons/Close'
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import styled from 'styled-components'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'
import { useState } from 'react'
import fetch from '../../react-component/utils/fetch'
import { BooleanTextType } from '../filter-builder/filter.structure'
// import { useLazyQuery } from '@apollo/react-hooks'
// import { GET_SUGGESTIONS } from '../suggestions/suggestions.graphql'
const properties = require('../../js/properties.js')

const defaultFilterOptions = createFilterOptions()

type Props = {
  value: BooleanTextType
  onChange: (value: BooleanTextType) => void
  TextFieldProps?: Partial<TextFieldProps>
}

const getRandomId = () => {
  return `a${Math.round(Math.random() * 10000000000000).toString()}`
}

type Option = {
  type: string
  token: string
}

type Suggestions = {
  [key: string]: string[]
}

const suggestionsToOptions = (suggestions: Suggestions): Option[] => {
  if (suggestions === undefined || Object.keys(suggestions).length === 0) {
    return []
  } else {
    // @ts-ignore
    return Object.entries(suggestions).flatMap(([category, tokens]) =>
      tokens.map((token: string) => ({
        type: category,
        token,
      }))
    )
  }
}

type CallbackType = ({
  options,
  error,
}: {
  options: Option[]
  error: any
}) => void

const fetchSuggestions = async ({
  text,
  callback,
  signal,
}: {
  text: string
  callback: CallbackType
  signal: AbortSignal
}) => {
  const res = await fetch(
    `./internal/boolean-search/suggest?q=${encodeURIComponent(text)}`,
    {
      signal,
    }
  )

  if (!res.ok) {
    throw new Error(res.statusText)
  }

  const json = await res.json()
  callback({
    options: suggestionsToOptions(json.suggestions),
    error: json.error,
  })
}

const ERROR_MESSAGES = {
  punctuation: (
    <div>
      Invalid Query:
      <div>
        If using characters outside the alphabet (a-z), make sure to quote them
        like so ("big.doc" or "bill's car").
      </div>
    </div>
  ),
  syntax: (
    <div>
      Invalid Query:
      <div>Check that syntax of AND / OR / NOT is used correctly.</div>
    </div>
  ),
  both: (
    <div>
      Invalid Query:
      <div>
        If using characters outside the alphabet (a-z), make sure to quote them
        like so ("big.doc" or "bill's car").
      </div>
      <div>Check that syntax of AND / OR / NOT is used correctly.</div>
    </div>
  ),
}

const defaultValue = {
  text: '',
  cql: '',
  error: false,
} as BooleanTextType

const validateShape = ({ value, onChange }: Props) => {
  if (
    value.text === undefined ||
    value.cql === undefined ||
    value.error === undefined
  ) {
    onChange(defaultValue)
  }
}

const ShapeValidator = ({ value, onChange, TextFieldProps }: Props) => {
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])

  if (value.text !== undefined) {
    return (
      <BooleanSearchBar
        value={value}
        onChange={onChange}
        TextFieldProps={TextFieldProps}
      />
    )
  }
  return null
}

/**
 * We want to take in a value, and onChange update it.  That would then flow a new value
 * back down.
 */
const BooleanSearchBar = ({ value, onChange, TextFieldProps }: Props) => {
  const [error, setError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [inputValue, setInputValue] = React.useState<string>('')
  const [suggestion, setSuggestion] = React.useState('')
  const [id] = React.useState(getRandomId())
  const [cursorLocation, setCursorLocation] = React.useState(0)
  const [tokens, setTokens] = React.useState([] as string[])
  const inputRef = React.useRef<HTMLInputElement>()

  const optionToValue = (option: any) => option.token

  const [options, setOptions] = useState<Option[]>([])

  const isValidBeginningToken = (query: any) => {
    const trimmedToken = query.trim().toLowerCase()
    if (
      trimmedToken === 'not' ||
      trimmedToken === 'and' ||
      trimmedToken === 'or'
    ) {
      return false
    }

    return true
  }

  React.useEffect(() => {
    var controller = new AbortController()
    if (inputValue !== null && isValidBeginningToken(inputValue)) {
      fetchSuggestions({
        text: inputValue,
        callback: ({ options }) => {
          setOptions(options)
        },
        signal: controller.signal,
      })
    } else {
      setOptions([])
    }
    return () => {
      controller.abort()
    }
  }, [inputValue])

  let helpText = error ? errorMessage : 'Valid'

  let indicator = error ? (
    <Close style={{ color: red[500] }} />
  ) : (
    <Check style={{ color: green[500] }} />
  )
  //test

  React.useEffect(() => {
    onChange({
      text: inputValue,
      cql: '',
      error: false,
    })
  }, [inputValue])

  React.useEffect(() => {
    if (value.text !== inputValue) {
      setInputValue(value.text)
    }
  }, [value.text])

  React.useEffect(() => {
    const rawTokens = inputValue.split(/[ ())]+/)
    const joinTokens = []
    for (let i = 0; i < rawTokens.length; i++) {
      joinTokens.push(rawTokens.slice(i, rawTokens.length).join(' ').trim())
    }
    // @ts-ignore ts-migrate(2345) FIXME: Type 'string' is not assignable to type 'never'.
    setTokens(joinTokens)
  }, [inputValue])

  const getOptionLabel = (option: any) => {
    if (!option || !option.token) return ''
    if (option.length === 0) return ''
    return option.token
  }

  // Used to determine what we can go for next in context the the previous.
  const filterOptions = React.useCallback(
    (optionsToFilter) => {
      const lastToken = tokens[tokens.length - 1]
      if (lastToken === '') {
        return optionsToFilter
      } else {
        const strippedOptions = optionsToFilter.map((o: any) => ({
          token: o.token,
        }))
        const filteredOptions = defaultFilterOptions(strippedOptions, {
          inputValue: lastToken,
          getOptionLabel,
        })
        // @ts-ignore ts-migrate(2571) FIXME: Object is of type 'unknown'.
        const flatFilteredOptions = filteredOptions.map((o) => o.token)
        const reconstructedOptions = optionsToFilter.filter((o: any) =>
          flatFilteredOptions.includes(o.token)
        )

        return reconstructedOptions
      }
    },
    [tokens]
  )

  React.useEffect(() => {
    if (inputValue) {
      const replaceIndex = inputValue.indexOf('?')
      if (replaceIndex > -1) {
        // Make the selection around "?"
        // @ts-ignore ts-migrate(2532) FIXME: Object is possibly 'undefined'.
        inputRef.current.setSelectionRange(replaceIndex, replaceIndex + 1)
      }

      if (suggestion === 'AND' || suggestion === 'OR') {
        // @ts-ignore ts-migrate(2532) FIXME: Object is possibly 'undefined'.
        inputRef.current.setSelectionRange(cursorLocation, cursorLocation)
        setSuggestion('')
      }
    }
  }, [inputValue])

  const handleTextChange = (e: any) => {
    setInputValue(e.target.value)
  }

  const getLogicalOperators = (options: any) => {
    return options.filter((option: any) => option.type === 'logical')
  }

  const getTokenToRemove = (suggestion: Option) => {
    let tokenToRemove = ''
    for (let i = 0; i < tokens.length; i++) {
      const match = suggestion.token
        .toLowerCase()
        .match(tokens[i].toLowerCase())
      if (match && match[0]) {
        tokenToRemove = tokens[i]
        break
      }
    }
    return tokenToRemove
  }

  return (
    <FormControl fullWidth>
      <Autocomplete
        filterOptions={(optionsToFilter) =>
          // eslint-disable-next-line no-unused-vars
          filterOptions(optionsToFilter).sort(
            // @ts-ignore ts-migrate(6133) FIXME: 'o2' is declared but its value is never read.
            (o1: any, o2: any) => (o1.type === 'mandatory' ? -1 : 1)
          )
        }
        options={getLogicalOperators(options)}
        includeInputInList={true}
        // @ts-ignore ts-migrate(6133) FIXME: 'e' is declared but its value is never read.
        onChange={(e: any, suggestion: any) => {
          if (
            suggestion &&
            suggestion.token &&
            suggestion.token !== inputValue
          ) {
            let selectedSuggestion = optionToValue(suggestion).toUpperCase()

            if (selectedSuggestion === 'NOT') {
              selectedSuggestion = 'NOT (?)'
            }

            setSuggestion(selectedSuggestion)

            const cursor = inputRef.current?.selectionStart

            const tokenToRemove = getTokenToRemove(suggestion)

            let newInputValue = inputValue
            if (tokenToRemove !== '' && cursor && cursor < inputValue.length) {
              const postText = inputValue.substr(cursor, inputValue.length)
              const preText = inputValue.slice(
                0,
                (tokenToRemove.length + postText.length) * -1
              )

              setInputValue(`${preText}${selectedSuggestion}${postText}`)
              const str = `${preText}${selectedSuggestion}`
              setCursorLocation(str.length)
            } else if (tokenToRemove !== '') {
              newInputValue = inputValue.slice(0, tokenToRemove.length * -1)
            } else if (cursor && cursor < inputValue.length) {
              const preText = inputValue.substr(0, cursor).trim()
              const postText = inputValue.substr(cursor, inputValue.length)
              setInputValue(`${preText} ${selectedSuggestion}${postText}`)
              const str = `${preText} ${selectedSuggestion}`
              setCursorLocation(str.length)
            }

            if (cursor && cursor >= inputValue.length) {
              let newInput = `${newInputValue}${selectedSuggestion} `
              setInputValue(newInput)
              setCursorLocation(newInput.length + 1)
            }
          }
        }}
        inputValue={inputValue}
        getOptionLabel={getOptionLabel}
        multiple={false}
        disableCloseOnSelect
        disableClearable
        freeSolo
        id={id}
        renderOption={(option) => (
          <Typography noWrap>{optionToValue(option)}</Typography>
        )}
        renderInput={(params) => (
          <TextField
            data-id="search-input"
            {...params}
            inputRef={inputRef}
            size={'small'}
            variant="outlined"
            defaultValue={'*'}
            onChange={handleTextChange}
            value={inputValue}
            autoFocus
            helperText={error ? <>{errorMessage}</> : ''}
            InputProps={{
              ...params.InputProps,
              type: 'search',
              startAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress
                      size={20}
                      style={{ marginRight: 13, marginLeft: 2 }}
                    />
                  ) : (
                    <InputAdornment position="start">
                      <Tooltip
                        title={
                          <Paper
                            elevation={Elevations.overlays}
                            className="p-2"
                          >
                            {helpText}
                          </Paper>
                        }
                      >
                        {indicator}
                      </Tooltip>
                    </InputAdornment>
                  )}
                </React.Fragment>
              ),
            }}
            {...TextFieldProps}
          />
        )}
      />
    </FormControl>
  )
}

export default hot(module)(ShapeValidator)
