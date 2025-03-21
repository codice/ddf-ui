import * as React from 'react'
import { useAppRootContext } from '../app-root/app-root.pure'
import { handleReverseProxy } from '../fetch/fetch'
type Props = {
  url?: string
}

export const Iframe = ({ url }: Props) => {
  const { theme } = useAppRootContext()
  // only some iframes are brought in as relative
  const isRelativeUrl = url && url.startsWith('./')
  let fixedUrl = ''
  if (url && isRelativeUrl) {
    fixedUrl = `/admin${url.substring(1)}`
  } else {
    fixedUrl = url ? url : ''
  }
  return (
    <iframe
      src={handleReverseProxy(fixedUrl)}
      className="w-full h-full"
      style={{
        border: 'none',
        filter: theme === 'dark' ? 'invert(100%) hue-rotate(180deg)' : '', //emulates dark mode for iframes
      }}
    >
      <p>Your browser does not support iframes.</p>
    </iframe>
  )
}
