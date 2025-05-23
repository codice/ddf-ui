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
import { CustomHover } from '../component/visualization/histogram/add-on-helpers'

type EditorProps = {
  result: LazyQueryResult
  attribute: string
  onCancel?: () => void
  onSave?: () => void
  goBack?: () => void
}

export type ExtensionPointsType = {
  providers: FC<React.PropsWithChildren<ProviderProps>>
  metacardInteractions: ((
    props: MetacardInteractionProps
  ) => React.ReactNode | any)[]
  customFilterInput: (props: {
    value: string
    onChange: (val: any) => void
  }) => React.ReactNode | undefined
  resultItemTitleAddOn: ({
    lazyResult,
  }: {
    lazyResult: LazyQueryResult
  }) => React.ReactNode | null
  resultItemRowAddOn: ({
    lazyResult,
    isTableView,
  }: {
    lazyResult: LazyQueryResult
    isTableView?: boolean
  }) => React.ReactNode | null
  resultTitleIconAddOn: ({
    lazyResult,
  }: {
    lazyResult: LazyQueryResult
  }) => React.ReactNode | null
  layoutDropdown: (props: {
    goldenLayout: any
    layoutResult?: ResultType
    editLayoutRef?: any
  }) => React.ReactNode | null
  customSourcesPage:
    | ((props: { onChange?: () => void }) => React.ReactNode | null)
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
  resultItemAction: ({
    lazyResult,
    selectionInterface,
    itemContentRef,
    className,
  }: {
    lazyResult: LazyQueryResult
    selectionInterface: any
    itemContentRef: React.RefObject<HTMLElement | null>
    className?: string
  }) => null | PermissiveComponentType
  attributeEditor: (
    result: LazyQueryResult,
    attribute: string
  ) => React.FC<EditorProps> | null
  customHistogramHover:
    | ((props: { results: LazyQueryResult[] }) => CustomHover | undefined)
    | undefined
  timelineItemAddOn: (props: {
    results: LazyQueryResult[]
    isSingleItem: boolean
  }) => React.ReactNode | null
  extraSidebarButtons?: PermissiveComponentType
  includeNavigationButtons?: boolean
}

const ExtensionPoints: ExtensionPointsType = {
  providers,
  metacardInteractions,
  customFilterInput: () => undefined,
  resultItemTitleAddOn: () => null,
  resultTitleIconAddOn: () => null,
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
  resultItemAction: ({
    selectionInterface: _selectionInterface,
    lazyResult: _lazyResult,
    itemContentRef: _containerRef,
  }) => null,
  attributeEditor: () => null,
  customHistogramHover: undefined,
  timelineItemAddOn: () => null,
  extraSidebarButtons: () => null,
  includeNavigationButtons: false,
}

export default ExtensionPoints
