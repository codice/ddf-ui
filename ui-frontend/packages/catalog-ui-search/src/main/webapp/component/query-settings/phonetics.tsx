import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

type Props = {
  model: Backbone.Model
}

const Phonetics = ({ model }: Props) => {
  const [phonetics, setPhonetics] = React.useState(
    Boolean(model.get('phonetics'))
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(model, 'change:phonetics', () => {
      setPhonetics(model.get('phonetics'))
    })
  }, [])
  return (
    <FormControlLabel
      labelPlacement="start"
      control={
        <Checkbox
          color="default"
          checked={phonetics}
          onChange={e => {
            model.set('phonetics', e.target.checked)
          }}
        />
      }
      label="Similar word matching"
    />
  )
}

export default hot(module)(Phonetics)
