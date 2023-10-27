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
import React from 'react'
import MetacardActions from '../../../react-component/metacard-actions'
import MetacardQuality from '../../../react-component/metacard-quality'
import MetacardHistory from '../../../react-component/metacard-history'
import Summary from './summary'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { MetacardPreviewReact } from '../../metacard-preview/metacard-preview.view'

export type TabContentProps = {
  result: LazyQueryResult
  selectionInterface?: any
}

type TabDefinition = {
  content:
    | (({ result }: TabContentProps) => React.ReactNode | any)
    | React.ComponentClass<TabContentProps, any>
  header?: ({ result }: TabContentProps) => React.ReactNode
}

export const TabNames = {
  Details: 'Details',
  Preview: 'Preview',
  History: 'History',
  Quality: 'Quality',
  Actions: 'Actions',
}

const Tabs = {
  Details: { content: Summary },
  Preview: {
    content: ({ result }) => {
      return <MetacardPreviewReact result={result} />
    },
  },
  History: { content: MetacardHistory },
  Quality: { content: MetacardQuality },
  Actions: { content: MetacardActions },
} as {
  [key: string]: TabDefinition
}

export default Tabs
