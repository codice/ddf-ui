import { entry } from '@connexta/kanri/src/main/webapp/components/entry/entry'
import { hot } from 'react-hot-loader/root'
import * as React from 'react'
import BrandingIcon from '@material-ui/icons/Brush'
import { Branding } from '../branding/branding'

const links = [
  {
    name: 'Branding',
    shortName: 'Branding',
    url: 'branding',
    Icon: BrandingIcon,
    content: Branding,
  },
]

entry({
  extension: {
    links,
    handleModuleRouting: moduleId => {
      const Link = links.find(link => link.url === moduleId)
      return Link ? <Link.content /> : undefined
    },
  },
})
export default hot(() => {}) // just to enable hot reloading
