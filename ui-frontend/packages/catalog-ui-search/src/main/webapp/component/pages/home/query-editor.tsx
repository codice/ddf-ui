import * as React from 'react'
import { hot } from 'react-hot-loader'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
const CQLUtils = require('catalog-ui-search/src/main/webapp/js/CQLUtils.js')

type QueryEditorProps = {
  query: any
}

export const QueryEditor = ({ query }: QueryEditorProps) => {
  const [text, setText] = React.useState('')

  return (
    <Grid container direction="row" alignItems="center" className="px-3 py-2">
      <Grid item>
        <TextField
          value={text}
          onChange={e => {
            setText(e.target.value)
          }}
          variant="outlined"
          placeholder="search"
        />
      </Grid>
      <Grid item className="px-2">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            query.set('')
            let cql
            if (text.length === 0) {
              cql = CQLUtils.generateFilter('ILIKE', 'anyText', '*')
            } else {
              cql = CQLUtils.generateFilter('ILIKE', 'anyText', text)
            }
            query.set('cql', CQLUtils.transformFilterToCQL(cql))
            query.startSearchFromFirstPage()
          }}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  )
}

export default hot(module)(QueryEditor)
