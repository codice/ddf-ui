import * as React from 'react'
import Button from '@mui/material/Button'
import LinkIcon from '@mui/icons-material/Link'
import { Grid2 } from '@mui/material'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'

type LinkButtonProps = {
  lazyResult: LazyQueryResult
}

export const LinkButton = ({ lazyResult }: LinkButtonProps) => {
  return (
    <Grid2 className="h-full">
      <Button
        component="div"
        title={lazyResult.plain.metacard.properties['ext.link']}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation()
          window.open(lazyResult.plain.metacard.properties['ext.link'])
        }}
        style={{ height: '100%' }}
        size="small"
        disabled={lazyResult.plain.metacard.properties['ext.link'] ? false : true}
      >
        <LinkIcon />
      </Button>
    </Grid2>
  )
}
