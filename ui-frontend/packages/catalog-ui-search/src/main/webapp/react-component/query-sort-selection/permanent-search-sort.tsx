import * as React from 'react'
import _cloneDeep from 'lodash.clonedeep'

import SortSelections from './sort-selections'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import { QueryType } from '../../js/model/Query'

type Props = {
  model: QueryType
}

/**
 * If we don't do this, we might muck with how backbone determines changes.  That's because we might modify the object directly, then update it.
 * So then it would see the set, determine there are no changes, and weird things would be afoot.
 * @param param0
 */
const getCopyOfSortsFromModel = ({ model }: Props) => {
  return _cloneDeep(model.get('sorts'))
}

const PermanentSearchSort = ({ model }: Props) => {
  const [sorts, setSorts] = React.useState(getCopyOfSortsFromModel({ model }))
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(model, 'change:sorts', () => {
      setSorts(getCopyOfSortsFromModel({ model }))
    })
  }, [])
  return (
    <SortSelections
      value={sorts}
      onChange={(newVal) => {
        model.set('sorts', newVal)
        // something to do with this being an array causes the event not to trigger, I think?
        model.trigger('change:sorts')
      }}
    />
  )
}

export default PermanentSearchSort
