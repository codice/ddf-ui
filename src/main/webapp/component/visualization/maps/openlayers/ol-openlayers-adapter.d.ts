import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import ImageStatic from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';
import WMTS from 'ol/source/WMTS';
import Image from 'ol/source/Image';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import BingMaps from 'ol/source/BingMaps';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import { fromLonLat, toLonLat } from 'ol/proj';
import Zoom from 'ol/control/Zoom';
import { get as getProjection, transform, transformExtent } from 'ol/proj';
import { getCenter, boundingExtent, buffer, extend, createEmpty } from 'ol/extent';
import { format as formatCoordinate } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import CircleStyle from 'ol/style/Circle';
import TextStyle from 'ol/style/Text';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import Snap from 'ol/interaction/Snap';
import DragPan from 'ol/interaction/DragPan';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import MultiPoint from 'ol/geom/MultiPoint';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPolygon from 'ol/geom/MultiPolygon';
import GeometryCollection from 'ol/geom/GeometryCollection';
import Circle from 'ol/geom/Circle';
import { getArea, getLength, getDistance } from 'ol/sphere';
export declare const Openlayers: {
    Map: typeof Map;
    View: typeof View;
    layer: {
        Tile: typeof TileLayer;
        Vector: typeof VectorLayer;
        Image: typeof ImageLayer;
    };
    source: {
        OSM: typeof OSM;
        WMTS: typeof WMTS;
        Vector: typeof VectorSource;
        Image: typeof Image;
        ImageStatic: typeof ImageStatic;
        BingMaps: typeof BingMaps;
        TileWMS: typeof TileWMS;
        XYZ: typeof XYZ;
    };
    proj: {
        get: typeof getProjection;
        fromLonLat: typeof fromLonLat;
        toLonLat: typeof toLonLat;
        transform: typeof transform;
        transformExtent: typeof transformExtent;
        getProjection: typeof getProjection;
    };
    Control: {
        Zoom: typeof Zoom;
        defaultControls: typeof defaultControls;
    };
    interaction: {
        defaults: typeof defaultInteractions;
        defaultInteractions: typeof defaultInteractions;
        Draw: typeof Draw;
        Modify: typeof Modify;
        Select: typeof Select;
        Snap: typeof Snap;
        DragPan: typeof DragPan;
    };
    Feature: typeof Feature;
    geom: {
        Circle: typeof Circle;
        Point: typeof Point;
        LineString: typeof LineString;
        Polygon: typeof Polygon;
        MultiPoint: typeof MultiPoint;
        MultiLineString: typeof MultiLineString;
        MultiPolygon: typeof MultiPolygon;
        GeometryCollection: typeof GeometryCollection;
    };
    style: {
        Style: typeof Style;
        Stroke: typeof Stroke;
        Fill: typeof Fill;
        Icon: typeof Icon;
        Circle: typeof CircleStyle;
        Text: typeof TextStyle;
    };
    extent: {
        getCenter: typeof getCenter;
        boundingExtent: typeof boundingExtent;
        buffer: typeof buffer;
        extend: typeof extend;
        createEmpty: typeof createEmpty;
    };
    Coordinate: {
        format: typeof formatCoordinate;
    };
    Sphere: {
        getArea: typeof getArea;
        getLength: typeof getLength;
        getDistance: typeof getDistance;
    };
};
