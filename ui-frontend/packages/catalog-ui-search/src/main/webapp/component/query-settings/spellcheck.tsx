import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { QueryType } from '../../js/model/Query'

type Props = {
  model: QueryType
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
