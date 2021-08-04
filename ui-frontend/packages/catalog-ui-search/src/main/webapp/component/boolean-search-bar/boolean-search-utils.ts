/* Copyright (c) Connexta, LLC */
import fetch from '../../react-component/utils/fetch'

export const getRandomId = () => {
  return `a${Math.round(Math.random() * 10000000000000).toString()}`
}

export type Option = {
  type: string
  token: string
}

type Suggestions = {
  [key: string]: string[]
}

export const suggestionsToOptions = (suggestions: Suggestions): Option[] => {
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

export const fetchSuggestions = async ({
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

type BooleanEndpointReturnType = {
  cql?: string
  message?: string
}

export const fetchCql = async ({
  searchText,
  searchProperty,
  callback,
  signal,
}: {
  callback: (result: BooleanEndpointReturnType) => void
  searchText: string | null
  searchProperty?: string
  signal?: AbortSignal
}) => {
  let trimmedInput = searchText!.trim()

  if (trimmedInput) {
    const res = await fetch(
      `./internal/boolean-search/cql?q=${encodeURIComponent(
        trimmedInput!
      )}&e=${encodeURIComponent(searchProperty!)}`,
      {
        signal,
      }
    )

    const json = (await res.json()) as BooleanEndpointReturnType
    callback(json)
  } else {
    callback({ cql: '' })
  }
}
