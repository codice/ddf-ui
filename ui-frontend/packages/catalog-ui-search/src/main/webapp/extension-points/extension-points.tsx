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
import * as React from 'react'
import { SFC } from '../react-component/hoc/utils'
import { providers, Props as ProviderProps } from './providers'
import metacardInteractions from './metacard-interactions'
import { Props } from '../react-component/filter/filter-input/filter-input'
import { LazyQueryResult } from '../js/model/LazyQueryResult/LazyQueryResult'
import { ResultType } from '../js/model/Types'

export type ExtensionPointsType = {
  providers: SFC<ProviderProps>
  metacardInteractions: any[]
  customFilterInput: (props: Props) => React.ReactNode | undefined
  customCanWritePermission: (props: {
    attribute: string
    lazyResult: LazyQueryResult
    user: any
    editableAttributes: string[]
  }) => boolean | undefined
  customEditableAttributes: () => string[]
  resultItemTitleAddOn: ({
    lazyResult,
  }: {
    lazyResult: LazyQueryResult
  }) => JSX.Element | null
  resultItemRowAddOn: ({
    lazyResult,
  }: {
    lazyResult: LazyQueryResult
  }) => JSX.Element | null
  layoutDropdown: (props: {
    goldenLayout: any
    layoutResult?: ResultType
    editLayoutRef?: any
  }) => JSX.Element | null
  customSourcesPage: (() => JSX.Element | null) | null
  navigationRight: any[]
}

const ExtensionPoints: ExtensionPointsType = {
  providers,
  metacardInteractions,
  customFilterInput: () => undefined,
  customCanWritePermission: () => undefined,
  customEditableAttributes: () => [],
  resultItemTitleAddOn: () => null,
  resultItemRowAddOn: () => null,
  layoutDropdown: () => null,
  customSourcesPage: null,
  navigationRight: [],
}

export default ExtensionPoints
