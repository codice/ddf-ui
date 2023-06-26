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
import { FC } from '../react-component/hoc/utils'
import { providers, Props as ProviderProps } from './providers'
import metacardInteractions from './metacard-interactions'
import { LazyQueryResult } from '../js/model/LazyQueryResult/LazyQueryResult'
import { MetacardAttribute, ResultType } from '../js/model/Types'
import { ValueTypes } from '../component/filter-builder/filter.structure'
import { Suggestion } from '../react-component/location/gazetteer'
import { MetacardInteractionProps } from '../react-component/metacard-interactions'
import { PermissiveComponentType } from '../typescript'
import { InputsType } from '../react-component/location/location'
import Button from '@mui/material/Button'
import { DragIndicator } from '@mui/icons-material'

export type ExtensionPointsType = {
  providers: FC<React.PropsWithChildren<ProviderProps>>
  metacardInteractions: ((
    props: MetacardInteractionProps
  ) => React.ReactNode | any)[]
  customFilterInput: (props: {
    value: string
    onChange: (val: any) => void
  }) => React.ReactNode | undefined
  customCanWritePermission: (props: {
    attribute: string
    lazyResult: LazyQueryResult
    user: any
    editableAttributes: string[]
  }) => boolean | undefined
  customEditableAttributes: () => Promise<any>
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
  inspectorTitleAddOn: ({
    lazyResult,
  }: {
    lazyResult: LazyQueryResult
  }) => JSX.Element | null
  layoutDropdown: (props: {
    goldenLayout: any
    layoutResult?: ResultType
    editLayoutRef?: any
  }) => JSX.Element | null
  customSourcesPage:
    | ((props: { onChange?: () => void }) => JSX.Element | null)
    | null
  serializeLocation: (
    property: string,
    value: ValueTypes['location']
  ) => null | any
  handleFilter: (map: any, filter: any) => null | any
  suggester: (input: string) => null | Promise<Suggestion[]>
  handleMetacardUpdate:
    | (({
        lazyResult,
        attributesToUpdate,
      }: {
        lazyResult: LazyQueryResult
        attributesToUpdate: MetacardAttribute[]
      }) => Promise<void>)
    | null
  extraRoutes: PermissiveComponentType
  locationTypes: (baseTypes: InputsType) => InputsType
  userInformation: PermissiveComponentType
  extraHeader: PermissiveComponentType
  extraFooter: PermissiveComponentType
  customMapBadge: (props: {
    results: LazyQueryResult[]
    isCluster: boolean
  }) => { text: string; color: string } | undefined
  useExtraResultItemAction: ({
    lazyResult,
    selectionInterface,
  }: {
    lazyResult: LazyQueryResult
    selectionInterface: any
  }) => null | PermissiveComponentType
}

const ExtensionPoints: ExtensionPointsType = {
  providers,
  metacardInteractions,
  customFilterInput: () => undefined,
  customCanWritePermission: () => undefined,
  customEditableAttributes: async () => undefined,
  resultItemTitleAddOn: () => null,
  inspectorTitleAddOn: () => null,
  resultItemRowAddOn: () => null,
  layoutDropdown: () => null,
  customSourcesPage: null,
  serializeLocation: () => null,
  handleFilter: () => null,
  suggester: () => null,
  handleMetacardUpdate: null,
  extraRoutes: () => null,
  locationTypes: (baseTypes: InputsType) => baseTypes,
  userInformation: () => null,
  extraFooter: () => null,
  extraHeader: () => null,
  customMapBadge: () => undefined,
  useExtraResultItemAction: ({
    selectionInterface: _selectionInterface,
    lazyResult: _lazyResult,
  }) => {
    // could have this be conditional, such as only showing for X type of result or on X page (using useLocation hook or something)
    const [shouldShow] = React.useState(Math.random() > 0.5)
    if (!shouldShow) {
      return null
    }
    return () => {
      return (
        <div className="scale-0 absolute z-10 left-0 -translate-x-full ml-[3px] group-hover:scale-100 transition pt-1">
          <Button
            className="cursor-grab"
            draggable={true}
            onDragStart={() => {}}
          >
            <DragIndicator />
          </Button>
        </div>
      )
    }
  },
}

export default ExtensionPoints
