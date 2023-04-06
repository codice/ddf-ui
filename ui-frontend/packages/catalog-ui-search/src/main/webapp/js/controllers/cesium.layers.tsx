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
/*jshint newcap: false, bitwise: false */
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'
import properties from '../properties'
import url from 'url'
import { addLayer, shiftLayers, getShift } from './cesium.layer-ordering'
import _ from 'underscore'
const DEFAULT_HTTPS_PORT = 443
const DEFAULT_HTTP_PORT = 80
export const CesiumImageryProviderTypes = {
  OSM: Cesium.createOpenStreetMapImageryProvider,
  AGM: Cesium.ArcGisMapServerImageryProvider,
  BM: Cesium.BingMapsImageryProvider,
  WMS: Cesium.WebMapServiceImageryProvider,
  WMT: Cesium.WebMapTileServiceImageryProvider,
  TMS: Cesium.createTileMapServiceImageryProvider,
  GE: Cesium.GoogleEarthImageryProvider,
  CT: Cesium.CesiumTerrainProvider,
  AGS: Cesium.ArcGisImageServerTerrainProvider,
  VRW: Cesium.VRTheWorldTerrainProvider,
  SI: Cesium.SingleTileImageryProvider,
} as {
  [key: string]: any
}
import { Subscribable } from '../model/Base/base-classes'
import { Layers } from './layers'
import user from '../../component/singletons/user-instance'
import User from '../../js/model/User'
import Backbone from 'backbone'
type MakeMapType = {
  cesiumOptions: any
  element: HTMLElement
}
export class CesiumLayers extends Subscribable<''> {
  layers: Layers
  map: any
  isMapCreated: boolean
  layerForCid: any
  backboneModel: any
  layerOrder: Array<any>
  constructor() {
    super()
    this.backboneModel = new Backbone.Model({})
    this.isMapCreated = false
    this.layerOrder = []
    this.layerForCid = {}
    const layerPrefs = user.get('user>preferences>mapLayers')
    ;(User as any).updateMapLayers(layerPrefs)
    this.layers = new Layers(layerPrefs)
    this.backboneModel.listenTo(
      layerPrefs,
      'change:alpha',
      this.setAlpha.bind(this)
    )
    this.backboneModel.listenTo(
      layerPrefs,
      'change:show change:alpha',
      this.setShow.bind(this)
    )
    this.backboneModel.listenTo(layerPrefs, 'add', this.addLayer.bind(this))
    this.backboneModel.listenTo(
      layerPrefs,
      'remove',
      this.removeLayer.bind(this)
    )
    this.backboneModel.listenTo(
      layerPrefs,
      'sort',
      this.reIndexLayers.bind(this)
    )
  }
  makeMap(options: MakeMapType) {
    // must create cesium map after containing DOM is attached.
    this.map = new Cesium.Viewer(options.element, options.cesiumOptions)
    this.map.scene.requestRenderMode = true
    this.layers.layers.forEach((model) => {
      if (model.get('show')) {
        this.initLayer(model)
      }
    }, this)
    this.isMapCreated = true
    return this.map
  }
  initLayer(model: any) {
    const type = CesiumImageryProviderTypes[model.get('type')]
    const initObj = _.omit(
      model.attributes,
      'type',
      'label',
      'index',
      'modelCid'
    )
    if (model.get('type') === 'WMT') {
      /* If matrixSet is present (OpenLayers WMTS keyword) set tileMatrixSetID (Cesium WMTS keyword) */
      if (initObj.matrixSet) {
        initObj.tileMatrixSetID = initObj.matrixSet
      }
      /* Set the tiling scheme for WMTS imagery providers that are EPSG:4326 */
      if ((properties as any).projection === 'EPSG:4326') {
        initObj.tilingScheme = new Cesium.GeographicTilingScheme()
      }
    }
    const provider = new type(initObj)
    /*
          Optionally add this provider as a TrustedServer. This sets withCredentials = true
          on the XmlHttpRequests for CORS.
        */
    if (model.get('withCredentials')) {
      const parsedUrl = url.parse(provider.url)
      let port = parsedUrl.port
      if (!port) {
        // @ts-expect-error ts-migrate(2322) FIXME: Type '443 | 80' is not assignable to type 'string ... Remove this comment to see the full error message
        port =
          parsedUrl.protocol === 'https:'
            ? DEFAULT_HTTPS_PORT
            : DEFAULT_HTTP_PORT
      }
      Cesium.TrustedServers.add(parsedUrl.hostname, port)
    }
    this.layerOrder = addLayer({
      initialized: this.layerOrder,
      all: this.layers.layers.map((model) => model.id).reverse(),
      layer: model.id,
    })
    const layerIndex = this.layerOrder.indexOf(model.id)
    const layer = this.map.imageryLayers.addImageryProvider(
      provider,
      layerIndex
    )
    this.layerForCid[model.id] = layer
    layer.alpha = model.get('alpha')
    layer.show = model.shouldShowLayer()
  }
  addLayer() {
    // never done
  }
  removeLayer() {
    // never done
  }
  setAlpha(model: any) {
    const layer = this.layerForCid[model.id]
    layer.alpha = model.get('alpha')
  }
  setShow(model: any) {
    if (!this.layerForCid[model.id]) {
      this.initLayer(model)
    }
    const layer = this.layerForCid[model.id]
    layer.show = model.shouldShowLayer()
    this.map.scene.requestRender()
  }
  /*
      removing/re-adding the layers causes visible "re-render" of entire map;
      raising/lowering is smoother.
      raising means to move to a higher index.  higher indexes are displayed on top of lower indexes.
      so we have to reverse the order property here to make it display correctly.
      in other words, order 1 means highest index.
    */
  reIndexLayers() {
    const newLayerOrder = shiftLayers({
      prev: this.layerOrder,
      cur: this.layers.layers.map((model) => model.id).reverse(),
    })
    const { layer, method, count } = getShift({
      prev: this.layerOrder,
      cur: newLayerOrder,
    })
    _.times(
      count,
      () => {
        this.map.imageryLayers[method](this.layerForCid[layer])
      },
      this
    )
    this.layerOrder = newLayerOrder
  }
}
