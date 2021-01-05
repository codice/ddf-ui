import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useHistory } from 'react-router-dom'
import useSnack from '../hooks/useSnack'
import { OpenSearch } from './home'

const Open = () => {
  const history = useHistory()
  const addSnack = useSnack()
  return (
    <div className="w-full h-full p-2">
      <div className="text-2xl pb-2">Open a search</div>
      <OpenSearch
        label=""
        constructLink={(result) => {
          return `/search/${result.plain.id}`
        }}
        onFinish={(value) => {
          history.replace({
            pathname: `/search/${value.plain.id}`,
            search: '',
          })
          addSnack(`Search '${value.plain.metacard.properties.title}' opened`, {
            alertProps: { severity: 'info' },
          })
        }}
        autocompleteProps={{
          fullWidth: true,
          className: 'w-full',
        }}
      />
    </div>
  )
}

export default hot(module)(Open)
