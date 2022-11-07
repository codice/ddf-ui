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

import { Subscribable } from '../model/Base/base-classes'

type LayerType = {
  alpha: string
  id: string
  label: string
  name: string
  order: number
  parameters: any
  proxyEnabled: boolean
  show: boolean
  type: string
  url: string
  withCredentials: boolean
}

export class Layer extends Subscribable<'change'> {
  layer: LayerType
  constructor(layer: LayerType) {
    super()
    this.layer = layer
  }
}

export class Layers extends Subscribable<'sort' | 'add' | 'remove'> {
  layers: Array<any>
  constructor(layers: Array<any>) {
    super()
    this.layers = layers
  }
}
