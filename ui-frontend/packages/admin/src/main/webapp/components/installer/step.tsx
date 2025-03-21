import * as React from 'react'
import Grid from '@material-ui/core/Grid'

type Props = {
  content?: React.ReactNode
  footer?: React.ReactNode
}

export const Step = ({ footer, content }: Props) => {
  return (
    <Grid
      container
      direction="column"
      style={{ minHeight: '50vh' }}
      justify="space-between"
      wrap="nowrap"
    >
      <Grid item>{content}</Grid>
      <Grid item style={{ padding: '20px' }}>
        {footer}
      </Grid>
    </Grid>
  )
}
