import React, { useCallback, useEffect, useState } from 'react'
import _debounce from 'lodash/debounce'
import { Suggestion } from '../location/gazetteer'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import TextField from '@material-ui/core/TextField'

type Props = {
  suggester: (input: string) => Promise<Suggestion[]>
  debounce?: number
  minimumInputLength?: number
  onError?: any
  value: any
  placeholder?: string
  onChange: (suggestion: Suggestion) => Promise<void>
}

const GazetteerAutoComplete = ({
  debounce = 350,
  minimumInputLength = 3,
  suggester,
  onError,
  value,
  ...props
}: Props) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestionsFunc = async (input: string) => {
    if (!(input.length < minimumInputLength)) {
      try {
        const suggestions = await suggester(input)
        setSuggestions(suggestions)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError('Endpoint unavailable')
        if (typeof onError === 'function') onError(e)
      }
    } else {
      setLoading(false)
    }
  }

  const fetchSuggestions = useCallback(
    _debounce(fetchSuggestionsFunc, debounce),
    []
  )

  useEffect(() => {
    fetchSuggestions(input)
  }, [input])

  const onChange = (input: string) => {
    setInput(input)
    setLoading(true)
    setSuggestions([])
    setError(null)
  }

  const onValueSelect = (
    _event: React.ChangeEvent<HTMLInputElement>,
    suggestion: Suggestion
  ) => {
    if (suggestion) {
      props.onChange(suggestion)
    } else {
      setInput('')
    }
  }

  const placeholder =
    input.length < minimumInputLength
      ? `Please enter ${minimumInputLength} or more characters`
      : undefined

  const getNoOptionsText = () => {
    if (!input) {
      return 'Start typing to see suggestions'
    } else if (input.length < minimumInputLength) {
      const charactersToType = minimumInputLength - input.length
      const pluralCharacter = charactersToType === 1 ? '' : 's'
      return `Type ${charactersToType} more character${pluralCharacter} to see suggestions`
    } else {
      return error || 'No results found'
    }
  }

  return (
    <Autocomplete
      data-id="autocomplete"
      getOptionLabel={(suggestion: Suggestion) => suggestion.name}
      options={suggestions}
      loading={loading}
      loadingText="Searching..."
      onChange={onValueSelect}
      onBlur={() => setInput('')}
      noOptionsText={getNoOptionsText()}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          value={input}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

export default GazetteerAutoComplete
