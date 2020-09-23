import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

type Props = {
  model: Backbone.Model
}

const Spellcheck = ({ model }: Props) => {
  const [spellcheck, setSpellcheck] = React.useState(
    Boolean(model.get('spellcheck'))
  )
  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(model, 'change:spellcheck', () => {
      setSpellcheck(model.get('spellcheck'))
    })
  }, [])
  return (
    <FormControlLabel
      labelPlacement="start"
      control={
        <Checkbox
          color="default"
          checked={spellcheck}
          onChange={(e) => {
            model.set('spellcheck', e.target.checked)
          }}
        />
      }
      label="Spellcheck"
    />
  )
}

export default hot(module)(Spellcheck)
