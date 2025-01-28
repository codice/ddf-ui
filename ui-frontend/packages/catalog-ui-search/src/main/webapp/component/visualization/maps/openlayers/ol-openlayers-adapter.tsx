// Import the necessary parts of the ol package
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import WMTS from 'ol/source/WMTS'
import Image from 'ol/source/Image'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import BingMaps from 'ol/source/BingMaps'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import Feature from 'ol/Feature'
import { fromLonLat, toLonLat } from 'ol/proj'
import Zoom from 'ol/control/Zoom'
import { get as getProjection, transform, transformExtent } from 'ol/proj'
import {
  getCenter,
  boundingExtent,
  buffer,
  extend,
  createEmpty,
} from 'ol/extent'
import { format as formatCoordinate } from 'ol/coordinate'
import { defaults as defaultControls } from 'ol/control'
import { defaults as defaultInteractions } from 'ol/interaction'

import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'
import CircleStyle from 'ol/style/Circle'
import TextStyle from 'ol/style/Text'
import Draw from 'ol/interaction/Draw'
import Modify from 'ol/interaction/Modify'
import Select from 'ol/interaction/Select'
import Snap from 'ol/interaction/Snap'
import DragPan from 'ol/interaction/DragPan'

import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Polygon from 'ol/geom/Polygon'
import MultiPoint from 'ol/geom/MultiPoint'
import MultiLineString from 'ol/geom/MultiLineString'
import MultiPolygon from 'ol/geom/MultiPolygon'
import GeometryCollection from 'ol/geom/GeometryCollection'
import Circle from 'ol/geom/Circle'
import { getArea, getLength, getDistance } from 'ol/sphere'

// Recreate OpenLayers namespace structure
export const Openlayers = {
  Map,
  View,
  layer: {
    Tile: TileLayer,
    Vector: VectorLayer,
    Image: ImageLayer,
  },
  source: {
    OSM,
    WMTS,
    Vector: VectorSource,
    Image: Image,
    ImageStatic,
    BingMaps,
    TileWMS,
    XYZ,
  },
  proj: {
    get: getProjection,
    fromLonLat,
    toLonLat,
    transform,
    transformExtent,
    getProjection,
  },
  Control: {
    Zoom,
    defaultControls,
  },
  interaction: {
    defaults: defaultInteractions,
    defaultInteractions,
    Draw,
    Modify,
    Select,
    Snap,
    DragPan,
  },
  Feature,
  geom: {
    Circle,
    Point,
    LineString,
    Polygon,
    MultiPoint,
    MultiLineString,
    MultiPolygon,
    GeometryCollection,
  },
  style: {
    Style,
    Stroke,
    Fill,
    Icon,
    Circle: CircleStyle,
    Text: TextStyle,
  },
  extent: {
    getCenter,
    boundingExtent,
    buffer,
    extend,
    createEmpty,
  },
  Coordinate: {
    format: formatCoordinate,
  },
  Sphere: {
    getArea,
    getLength,
    getDistance,
  },
}
