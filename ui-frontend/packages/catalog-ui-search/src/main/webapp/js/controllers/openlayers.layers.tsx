import { Layers } from './layers'
import _ from 'underscore'
import user from '../../component/singletons/user-instance'
import { Tile as TileLayer } from 'ol/layer'
import { OSM as olSourceOSM, BingMaps, TileWMS, WMTS, XYZ } from 'ol/source'
import { transform as projTransform, get as projGet } from 'ol/proj'
import { Image as ImageLayer } from 'ol/layer'
import { ImageStatic as ImageStaticSource } from 'ol/source'
import { defaults as interactionsDefaults } from 'ol/interaction'
import { Map } from 'ol'
import Backbone from 'backbone'
import { StartupDataStore } from '../model/Startup/startup'
import { optionsFromCapabilities } from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import { ProjectionLike } from 'ol/proj'
import Layer from 'ol/layer/Layer'
import { View } from 'ol'
const createTile = (
  { show, alpha, ...options }: any,
  Source: any,
  Layer = TileLayer
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
    olSourceOSM
  )
}
const BM = (opts: any) => {
  const imagerySet = opts.imagerySet || opts.url
  return createTile({ ...opts, imagerySet }, BingMaps)
}
const WMS = (opts: any) => {
  const params = opts.params || {
    LAYERS: opts.layers,
    ...opts.parameters,
  }
  return createTile({ ...opts, params }, TileWMS)
}
const WMT = async (opts: any) => {
  const { url, withCredentials, proxyEnabled } = opts
  const originalUrl = proxyEnabled
    ? new URL(url, window.location.origin + window.location.pathname)
    : new URL(url)
  const getCapabilitiesUrl = new URL(originalUrl)
  getCapabilitiesUrl.searchParams.set('request', 'GetCapabilities')
  const res = await window.fetch(getCapabilitiesUrl, {
    credentials: withCredentials ? 'include' : 'same-origin',
  })
  const text = await res.text()
  const parser = new WMTSCapabilities()
  const result = parser.read(text)
  if ((result as any).Contents.Layer.length === 0) {
    throw new Error('WMTS map layer source has no layers.')
  }
  let { layer, matrixSet } = opts
  /* If tileMatrixSetID is present (Cesium WMTS keyword) set matrixSet (OpenLayers WMTS keyword) */
  if (opts.tileMatrixSetID) {
    matrixSet = opts.tileMatrixSetID
  }
  if (!layer) {
    layer = (result as any).Contents.Layer[0].Identifier
  }
  const options = optionsFromCapabilities(result, {
    ...opts,
    layer,
    matrixSet,
    wrapX: true,
  })
  if (options === null) {
    throw new Error('WMTS map layer source could not be setup.')
  }
  if (proxyEnabled) {
    // Set this to the proxy URL. Otherwise, OpenLayers will use the URL provided by the
    // GetCapabilities response.
    options.url = originalUrl.toString()
    options.urls = [originalUrl.toString()]
  }
  return createTile(opts, () => new WMTS(options))
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
  return createTile({ ...opts, tileUrlFunction }, XYZ)
}
const SI = (opts: any) => {
  const imageExtent =
    opts.imageExtent ||
    projGet(StartupDataStore.Configuration.getProjection())?.getExtent()
  return createTile(
    { ...opts, imageExtent, ...opts.parameters },
    ImageStaticSource,
    ImageLayer as any
  )
}
const sources = { OSM, BM, WMS, WMT, AGM, SI } as {
  [key: string]: any
}
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
export class OpenlayersLayers {
  layers: Layers
  map: any
  isMapCreated: boolean
  layerForCid: any
  backboneModel: any
  constructor({ collection }: { collection: any }) {
    this.backboneModel = new Backbone.Model({})
    this.isMapCreated = false
    this.layerForCid = {}
    const layerPrefs = collection
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
    const view = new View({
      projection: projGet(
        StartupDataStore.Configuration.getProjection()
      ) as ProjectionLike,
      center: projTransform(
        [0, 0],
        'EPSG:4326',
        StartupDataStore.Configuration.getProjection()
      ),
      zoom: mapOptions.zoom,
      minZoom: mapOptions.minZoom,
    })
    const config = {
      target: mapOptions.element,
      view,
      interactions: interactionsDefaults({ doubleClickZoom: false }),
    }
    this.map = new Map(config)
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
    const layer = this.layerForCid[model.id] as Layer
    if (layer !== undefined) {
      layer.setOpacity(parseFloat(model.get('alpha')))
    }
  }
  setShow(model: any) {
    const layer = this.layerForCid[model.id]
    if (layer !== undefined) {
      layer.setVisible(model.shouldShowLayer())
    }
  }
}
