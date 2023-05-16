import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { QueryType } from '../../js/model/Query'

type Props = {
  model: QueryType
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
          onChange={(e) => {
            model.set('phonetics', e.target.checked)
          }}
        />
      }
      label="Similar word matching"
    />
  )
}

export default hot(module)(Phonetics)
