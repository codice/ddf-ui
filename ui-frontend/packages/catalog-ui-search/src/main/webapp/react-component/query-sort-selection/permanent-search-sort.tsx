import * as React from 'react'
import { hot } from 'react-hot-loader'
import SortSelections from './sort-selections'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'

type Props = {
  model: Backbone.Model
}

const PermanentSearchSort = ({ model }: Props) => {
  const [sorts, setSorts] = React.useState(model.get('sorts'))
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(model, 'change:sorts', () => {
      setSorts(model.get('sorts'))
    })
  }, [])
  return (
    <SortSelections
      value={sorts}
      onChange={newVal => {
        model.set('sorts', newVal)
        // something to do with this being an array causes the event not to trigger, I think?
        model.trigger('change:sorts')
      }}
    />
  )
}

export default hot(module)(PermanentSearchSort)
