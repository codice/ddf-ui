import * as React from 'react'
import Typography from '@material-ui/core/Typography'

type BannerProps = {
  background: string
  color: string
  text: string
}

export const Banner = ({ background, text, color }: BannerProps) => {
  return (
    <Typography
      align="center"
      style={{
        height: 'auto',
        background: background,
        color: color,
        width: '100%',
      }}
    >
      {text}
    </Typography>
  )
}
