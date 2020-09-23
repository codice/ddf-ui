import * as React from 'react'
import { hot } from 'react-hot-loader'
import SortSelections from './sort-selections'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
const user = require('../../component/singletons/user-instance.js')

const getResultSort = () => {
  return user.get('user').get('preferences').get('resultSort') || []
}

type Props = {
  closeDropdown: () => void
}

const PermanentSearchSort = ({ closeDropdown }: Props) => {
  const [sorts, setSorts] = React.useState(getResultSort())
  const [hasSort, setHasSort] = React.useState(sorts.length > 0)
  const { listenTo } = useBackbone()

  React.useEffect(() => {
    listenTo(user.get('user').get('preferences'), 'change:resultSort', () => {
      const resultSort = getResultSort()
      setHasSort(resultSort !== undefined && resultSort.length > 0)
      setSorts(resultSort)
    })
  }, [])
  const removeSort = () => {
    user.get('user').get('preferences').set('resultSort', undefined)
    user.get('user').get('preferences').savePreferences()
    closeDropdown()
  }
  const saveSort = () => {
    user
      .get('user')
      .get('preferences')
      .set('resultSort', sorts.length === 0 ? undefined : sorts)

    user.get('user').get('preferences').savePreferences()
    closeDropdown()
    // once again, something is weird with arrays and backbone?
    user.get('user').get('preferences').trigger('change:resultSort')
  }
  return (
    <div data-id="results-sort-container" className="min-w-120">
      <div className="pb-2">
        <SortSelections
          value={sorts}
          onChange={(newVal) => {
            setSorts(newVal)
          }}
        />
      </div>
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        {hasSort ? (
          <Grid item className="w-full">
            <Button
              data-id="remove-all-results-sorts-button"
              fullWidth
              onClick={removeSort}
              variant="text"
              color="secondary"
            >
              Remove Sort
            </Button>
          </Grid>
        ) : null}
        <Grid item className="w-full">
          <Button
            data-id="save-results-sorts-button"
            fullWidth
            onClick={saveSort}
            variant="contained"
            color="primary"
          >
            Save Sort
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

export default hot(module)(PermanentSearchSort)
