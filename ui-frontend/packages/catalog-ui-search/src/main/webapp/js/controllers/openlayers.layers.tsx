import { Subscribable } from '../model/Base/base-classes'
import { Layers } from './layers'

import _ from 'underscore'
import ol from 'openlayers'
import properties from '../properties.js'
import user from '../../component/singletons/user-instance.js'
import User from '../../js/model/User.js'
import Backbone from 'backbone'

const createTile = (
  { show, alpha, ...options }: any,
  Source: any,
  Layer = ol.layer.Tile
) =>
  new Layer({
    visible: show,
    preload: Infinity,
    opacity: alpha,
    source: new Source(options),
  })

const OSM = (opts: any) => {
  const { url } = opts
  return createTile(
    {
      ...opts,
      url: url + (url.indexOf('/{z}/{x}/{y}') === -1 ? '/{z}/{x}/{y}.png' : ''),
    },
    ol.source.OSM
  )
}

const BM = (opts: any) => {
  const imagerySet = opts.imagerySet || opts.url
  return createTile({ ...opts, imagerySet }, ol.source.BingMaps)
}

const WMS = (opts: any) => {
  const params = opts.params || {
    LAYERS: opts.layers,
    ...opts.parameters,
  }
  return createTile({ ...opts, params }, ol.source.TileWMS)
}

const WMT = async (opts: any) => {
  const { url, withCredentials } = opts
  const parser = new ol.format.WMTSCapabilities()

  const res = await window.fetch(url, {
    credentials: withCredentials ? 'include' : 'same-origin',
  })
  const text = await res.text()
  const result = parser.read(text)

  if (result.Contents.Layer.length === 0) {
    throw new Error('WMTS map layer source has no layers.')
  }

  let { layer, matrixSet } = opts

  /* If tileMatrixSetID is present (Cesium WMTS keyword) set matrixSet (OpenLayers WMTS keyword) */
  if (opts.tileMatrixSetID !== undefined) {
    matrixSet = opts.tileMatrixSetID
  }

  if (layer === undefined) {
    layer = result.Contents.Layer[0].Identifier
  }

  const options = ol.source.WMTS.optionsFromCapabilities(result, {
    layer,
    matrixSet,
    ...opts,
  })

  if (options === null) {
    throw new Error('WMTS map layer source could not be setup.')
  }

  return createTile(opts, () => new ol.source.WMTS(options))
}

const AGM = (opts: any) => {
  // We strip the template part of the url because we will manually format
  // it in the `tileUrlFunction` function.
  const url = opts.url.replace('tile/{z}/{y}/{x}', '')

  // arcgis url format:
  //      http://<mapservice-url>/tile/<level>/<row>/<column>
  //
  // reference links:
  //  - https://openlayers.org/en/latest/examples/xyz-esri-4326-512.html
  //  - https://developers.arcgis.com/rest/services-reference/map-tile.htm
  const tileUrlFunction = (tileCoord: any) => {
    const [z, x, y] = tileCoord
    return `${url}/tile/${z - 1}/${-y - 1}/${x}`
  }

  return createTile({ ...opts, tileUrlFunction }, ol.source.XYZ)
}

const SI = (opts: any) => {
  const imageExtent =
    opts.imageExtent || ol.proj.get(properties.projection).getExtent()
  return createTile(
    { ...opts, imageExtent, ...opts.parameters },
    ol.source.ImageStatic,
    ol.layer.Image
  )
}

const sources = { OSM, BM, WMS, WMT, AGM, SI } as { [key: string]: any }

const createLayer = (type: any, opts: any) => {
  const fn = sources[type]

  if (fn === undefined) {
    throw new Error(`Unsupported map layer type ${type}`)
  }

  return fn(opts)
}

type MakeMapType = {
  zoom: number
  minZoom: number
  center: [number, number]
  element: HTMLElement
}

export class OpenlayersLayers extends Subscribable<''> {
  layers: Layers
  map: any
  isMapCreated: boolean
  layerForCid: any
  backboneModel: any
  constructor() {
    super()
    this.backboneModel = new Backbone.Model({})
    this.isMapCreated = false
    this.layerForCid = {}
    const layerPrefs = user.get('user>preferences>mapLayers')
    User.updateMapLayers(layerPrefs)
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
  makeMap(mapOptions: MakeMapType) {
    this.layers.layers.forEach((layer) => {
      this.addLayer(layer)
    })

    const view = new ol.View({
      projection: ol.proj.get(properties.projection),
      center: ol.proj.transform([0, 0], 'EPSG:4326', properties.projection),
      zoom: mapOptions.zoom,
      minZoom: mapOptions.minZoom,
    })

    const config = {
      target: mapOptions.element,
      view,
      interactions: ol.interaction.defaults({ doubleClickZoom: false }),
    }

    this.map = new ol.Map(config)
    this.isMapCreated = true
    return this.map
  }
  async addLayer(model: any) {
    const { id, type } = model.toJSON()
    const opts = _.omit(model.attributes, 'type', 'label', 'index', 'modelCid')
    opts.show = model.shouldShowLayer()

    try {
      const layer = await Promise.resolve(createLayer(type, opts))
      this.map.addLayer(layer)
      this.layerForCid[id] = layer
      this.reIndexLayers()
    } catch (e) {
      model.set('warning', e.message)
    }
  }
  removeLayer(model: any) {
    const id = model.get('id')
    const layer = this.layerForCid[id]
    if (layer !== undefined) {
      this.map.removeLayer(layer)
    }
    delete this.layerForCid[id]
    this.reIndexLayers()
  }
  reIndexLayers() {
    this.layers.layers.forEach((model, index) => {
      const layer = this.layerForCid[model.id]
      if (layer !== undefined) {
        layer.setZIndex(-(index + 1))
      }
    }, this)
    user.savePreferences()
  }
  setAlpha(model: any) {
    const layer = this.layerForCid[model.id]
    if (layer !== undefined) {
      layer.setOpacity(model.get('alpha'))
    }
  }
  setShow(model: any) {
    const layer = this.layerForCid[model.id]
    if (layer !== undefined) {
      layer.setVisible(model.shouldShowLayer())
    }
  }
}
