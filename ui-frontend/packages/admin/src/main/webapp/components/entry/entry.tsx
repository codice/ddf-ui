import { ExtensionType } from '../app-root/app-root.pure'
import { AppRoot } from '../app-root'
import * as React from 'react'
import * as ReactDom from 'react-dom'

type EntryProps = {
  extension?: ExtensionType
}

export const entry = ({ extension }: EntryProps) => {
  // setup the area that the modules will load into and asynchronously require in each module
  // so that it can render itself into the area that was just constructed for it
  ReactDom.render(
    <AppRoot extension={extension}></AppRoot>,
    document.querySelector('#root')
  )
}
