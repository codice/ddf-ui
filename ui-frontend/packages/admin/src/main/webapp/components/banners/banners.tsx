import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import { useAppRootContext } from '../app-root/app-root.pure'

export const BannerHeader = () => {
  const { platformConfig } = useAppRootContext()
  if (platformConfig.header === '') {
    return null
  }
  return (
    <Typography
      align="center"
      style={{
        height: 'auto',
        background: platformConfig.background,
        color: platformConfig.color,
        width: '100%',
      }}
    >
      {platformConfig.header}
    </Typography>
  )
}

export const BannerFooter = () => {
  const { platformConfig } = useAppRootContext()
  if (platformConfig.footer === '') {
    return null
  }
  return (
    <Typography
      align="center"
      style={{
        height: 'auto',
        background: platformConfig.background,
        color: platformConfig.color,
        width: '100%',
      }}
    >
      {platformConfig.footer}
    </Typography>
  )
}
