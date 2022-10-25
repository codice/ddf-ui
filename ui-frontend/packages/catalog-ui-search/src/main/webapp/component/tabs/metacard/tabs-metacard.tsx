/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import MetacardPreviewView from '../../metacard-preview/metacard-preview.view'
import React from 'react'
import { MetacardOverwrite } from '../../metacard-overwrite/metacard-overwrite.view'
import MetacardArchive from '../../../react-component/metacard-archive'
import MetacardActions from '../../../react-component/metacard-actions'
import MetacardQuality from '../../../react-component/metacard-quality'
import MetacardHistory from '../../../react-component/metacard-history'
import Summary from './summary'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult.js'
import MRC from '../../../react-component/marionette-region-container'

export type TabContentProps = {
  result: LazyQueryResult
  selectionInterface?: any
}

type TabContentType =
  | (({ result }: TabContentProps) => React.ReactNode | any)
  | React.ComponentClass<TabContentProps, any>

export const TabNames = {
  Details: 'Details',
  Preview: 'Preview',
  History: 'History',
  Quality: 'Quality',
  Actions: 'Actions',
  Delete: 'Delete',
  Overwrite: 'Overwrite',
}

const Tabs = {
  Details: Summary,
  Preview: ({ result }) => {
    return <MRC view={MetacardPreviewView} viewOptions={{ result }} />
  },
  History: MetacardHistory,
  Quality: MetacardQuality,
  Actions: MetacardActions,
  Delete: ({ result }) => {
    return <MetacardArchive results={[result]} />
  },
  Overwrite: ({ result }) => {
    return <MetacardOverwrite lazyResult={result} />
  },
} as {
  [key: string]: TabContentType
}

export default Tabs
