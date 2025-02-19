import { useNavigate } from 'react-router-dom'
import useSnack from '../hooks/useSnack'
import { OpenSearch } from './search'

const Open = () => {
  const navigate = useNavigate()
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
          // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
          navigate(`/search/${value.plain.id}`, {
            replace: true,
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

export default Open
