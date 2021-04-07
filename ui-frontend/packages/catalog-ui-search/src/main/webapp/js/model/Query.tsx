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
import { FilterBuilderClass } from '../../component/filter-builder/filter.structure'
const UntypedQuery = require('./Query.js')

type QueryAttributes = {
  filterTree?: FilterBuilderClass
  sources?: string[]
  [key: string]: any // slowly build out the proper type, then remove this (leave for now so we don't accidentally leave something off)
}

type QueryOptions = {
  useUserDefaults?: boolean
}

export const Query = (attributes?: QueryAttributes, options?: QueryOptions) => {
  return new UntypedQuery.Model(attributes, options)
}
