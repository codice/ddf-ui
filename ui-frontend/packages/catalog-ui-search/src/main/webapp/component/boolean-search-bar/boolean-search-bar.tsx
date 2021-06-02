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
import { Suggestion } from '../types/graphql'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'
const properties = require('../../js/properties.js')

const defaultFilterOptions = createFilterOptions()

const SearchBarContainer = styled.div`
  display: flex;
  align-self: center;
  justify-self: center;
  width: 100%;

  *:focus {
    animation: unset !important;
    box-shadow: unset;
  }
`

type Props = {
  searchButtonText: string
  inputPlaceholder: string
  onChange: (event: any) => void
  error: boolean
  errorMessage: TextFieldProps['helperText']
  options: any
  loading: boolean
}

const getRandomId = () => {
  return `a${Math.round(Math.random() * 10000000000000).toString()}`
}

const BooleanSearchBar = (props: Props) => {
  const [inputValue, setInputValue] = React.useState<string>('')
  const [suggestion, setSuggestion] = React.useState('')
  const [id] = React.useState(getRandomId())
  const [cursorLocation, setCursorLocation] = React.useState(0)
  const [tokens, setTokens] = React.useState([] as string[])
  const inputRef = React.useRef<HTMLInputElement>()

  const optionToValue = (option: any) => option.token

  let helpText = props.error ? props.errorMessage : 'Valid'

  let indicator = props.error ? (
    <Close style={{ color: red[500] }} />
  ) : (
    <Check style={{ color: green[500] }} />
  )

  React.useEffect(() => {
    props.onChange(inputValue)
  }, [inputValue, props.onChange])

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

  const getTokenToRemove = (suggestion: Suggestion) => {
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
    <SearchBarContainer>
      <FormControl fullWidth className="m-2">
        <Autocomplete
          filterOptions={(optionsToFilter) =>
            // eslint-disable-next-line no-unused-vars
            filterOptions(optionsToFilter).sort(
              // @ts-ignore ts-migrate(6133) FIXME: 'o2' is declared but its value is never read.
              (o1: any, o2: any) => (o1.type === 'mandatory' ? -1 : 1)
            )
          }
          options={getLogicalOperators(props.options)}
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
              if (
                tokenToRemove !== '' &&
                cursor &&
                cursor < inputValue.length
              ) {
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
              className="pl-6"
              inputRef={inputRef}
              size={'small'}
              variant="outlined"
              defaultValue={'*'}
              onChange={handleTextChange}
              value={inputValue}
              placeholder={`Search ${properties.customBranding} ${properties.product}`}
              autoFocus
              helperText={props.error ? <>{props.errorMessage}</> : ''}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                startAdornment: (
                  <React.Fragment>
                    {props.loading ? (
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
            />
          )}
        />
      </FormControl>
    </SearchBarContainer>
  )
}

export default hot(module)(BooleanSearchBar)
