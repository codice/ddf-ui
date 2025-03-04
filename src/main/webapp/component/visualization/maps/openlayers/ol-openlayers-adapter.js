// Import the necessary parts of the ol package
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
import { getCenter, boundingExtent, buffer, extend, createEmpty, } from 'ol/extent';
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
// Recreate OpenLayers namespace structure
export var Openlayers = {
    Map: Map,
    View: View,
    layer: {
        Tile: TileLayer,
        Vector: VectorLayer,
        Image: ImageLayer,
    },
    source: {
        OSM: OSM,
        WMTS: WMTS,
        Vector: VectorSource,
        Image: Image,
        ImageStatic: ImageStatic,
        BingMaps: BingMaps,
        TileWMS: TileWMS,
        XYZ: XYZ,
    },
    proj: {
        get: getProjection,
        fromLonLat: fromLonLat,
        toLonLat: toLonLat,
        transform: transform,
        transformExtent: transformExtent,
        getProjection: getProjection,
    },
    Control: {
        Zoom: Zoom,
        defaultControls: defaultControls,
    },
    interaction: {
        defaults: defaultInteractions,
        defaultInteractions: defaultInteractions,
        Draw: Draw,
        Modify: Modify,
        Select: Select,
        Snap: Snap,
        DragPan: DragPan,
    },
    Feature: Feature,
    geom: {
        Circle: Circle,
        Point: Point,
        LineString: LineString,
        Polygon: Polygon,
        MultiPoint: MultiPoint,
        MultiLineString: MultiLineString,
        MultiPolygon: MultiPolygon,
        GeometryCollection: GeometryCollection,
    },
    style: {
        Style: Style,
        Stroke: Stroke,
        Fill: Fill,
        Icon: Icon,
        Circle: CircleStyle,
        Text: TextStyle,
    },
    extent: {
        getCenter: getCenter,
        boundingExtent: boundingExtent,
        buffer: buffer,
        extend: extend,
        createEmpty: createEmpty,
    },
    Coordinate: {
        format: formatCoordinate,
    },
    Sphere: {
        getArea: getArea,
        getLength: getLength,
        getDistance: getDistance,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2wtb3BlbmxheWVycy1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvb3BlbmxheWVycy9vbC1vcGVubGF5ZXJzLWFkYXB0ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtDQUErQztBQUMvQyxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUE7QUFDeEIsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFBO0FBQzFCLE9BQU8sU0FBUyxNQUFNLGVBQWUsQ0FBQTtBQUNyQyxPQUFPLFdBQVcsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLFdBQVcsTUFBTSx1QkFBdUIsQ0FBQTtBQUMvQyxPQUFPLFVBQVUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUN2QyxPQUFPLElBQUksTUFBTSxnQkFBZ0IsQ0FBQTtBQUNqQyxPQUFPLEtBQUssTUFBTSxpQkFBaUIsQ0FBQTtBQUNuQyxPQUFPLEdBQUcsTUFBTSxlQUFlLENBQUE7QUFDL0IsT0FBTyxZQUFZLE1BQU0sa0JBQWtCLENBQUE7QUFDM0MsT0FBTyxRQUFRLE1BQU0sb0JBQW9CLENBQUE7QUFDekMsT0FBTyxPQUFPLE1BQU0sbUJBQW1CLENBQUE7QUFDdkMsT0FBTyxHQUFHLE1BQU0sZUFBZSxDQUFBO0FBQy9CLE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQTtBQUNoQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUM5QyxPQUFPLElBQUksTUFBTSxpQkFBaUIsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsR0FBRyxJQUFJLGFBQWEsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQzFFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsY0FBYyxFQUNkLE1BQU0sRUFDTixNQUFNLEVBQ04sV0FBVyxHQUNaLE1BQU0sV0FBVyxD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QTtRQUNOLE1BQU0sUUFBQTtRQUNOLFdBQVcsYUFBQTtLQUNaO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsTUFBTSxFQUFFLGdCQUFnQjtLQUN6QjtJQUNELE1BQU0sRUFBRTtRQUNOLE9BQU8sU0FBQTtRQUNQLFNBQVMsV0FBQTtRQUNULFdBQVcsYUFBQTtLQUNaO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCB0aGUgbmVjZXNzYXJ5IHBhcnRzIG9mIHRoZSBvbCBwYWNrYWdlXG5pbXBvcnQgTWFwIGZyb20gJ29sL01hcCdcbmltcG9ydCBWaWV3IGZyb20gJ29sL1ZpZXcnXG5pbXBvcnQgVGlsZUxheWVyIGZyb20gJ29sL2xheWVyL1RpbGUnXG5pbXBvcnQgVmVjdG9yTGF5ZXIgZnJvbSAnb2wvbGF5ZXIvVmVjdG9yJ1xuaW1wb3J0IEltYWdlU3RhdGljIGZyb20gJ29sL3NvdXJjZS9JbWFnZVN0YXRpYydcbmltcG9ydCBJbWFnZUxheWVyIGZyb20gJ29sL2xheWVyL0ltYWdlJ1xuaW1wb3J0IFdNVFMgZnJvbSAnb2wvc291cmNlL1dNVFMnXG5pbXBvcnQgSW1hZ2UgZnJvbSAnb2wvc291cmNlL0ltYWdlJ1xuaW1wb3J0IE9TTSBmcm9tICdvbC9zb3VyY2UvT1NNJ1xuaW1wb3J0IFZlY3RvclNvdXJjZSBmcm9tICdvbC9zb3VyY2UvVmVjdG9yJ1xuaW1wb3J0IEJpbmdNYXBzIGZyb20gJ29sL3NvdXJjZS9CaW5nTWFwcydcbmltcG9ydCBUaWxlV01TIGZyb20gJ29sL3NvdXJjZS9UaWxlV01TJ1xuaW1wb3J0IFhZWiBmcm9tICdvbC9zb3VyY2UvWFlaJ1xuaW1wb3J0IEZlYXR1cmUgZnJvbSAnb2wvRmVhdHVyZSdcbmltcG9ydCB7IGZyb21Mb25MYXQsIHRvTG9uTGF0IH0gZnJvbSAnb2wvcHJvaidcbmltcG9ydCBab29tIGZyb20gJ29sL2NvbnRyb2wvWm9vbSdcbmltcG9ydCB7IGdldCBhcyBnZXRQcm9qZWN0aW9uLCB0cmFuc2Zvcm0sIHRyYW5zZm9ybUV4dGVudCB9IGZyb20gJ29sL3Byb2onXG5pbXBvcnQge1xuICBnZXRDZW50ZXIsXG4gIGJvdW5kaW5nRXh0ZW50LFxuICBidWZmZXIsXG4gIGV4dGVuZCxcbiAgY3JlYXRlRW1wdHksXG59IGZyb20gJ29sL2V4dGVudCdcbmltcG9ydCB7IGZvcm1hdCBhcyBmb3JtYXRDb29yZGluYXRlIH0gZnJvbSAnb2wvY29vcmRpbmF0ZSdcbmltcG9ydCB7IGRlZmF1bHRzIGFzIGRlZmF1bHRDb250cm9scyB9IGZyb20gJ29sL2NvbnRyb2wnXG5pbXBvcnQgeyBkZWZhdWx0cyBhcyBkZWZhdWx0SW50ZXJhY3Rpb25zIH0gZnJvbSAnb2wvaW50ZXJhY3Rpb24nXG5cbmltcG9ydCBTdHlsZSBmcm9tICdvbC9zdHlsZS9TdHlsZSdcbmltcG9ydCBTdHJva2UgZnJvbSAnb2wvc3R5bGUvU3Ryb2tlJ1xuaW1wb3J0IEZpbGwgZnJvbSAnb2wvc3R5bGUvRmlsbCdcbmltcG9ydCBJY29uIGZyb20gJ29sL3N0eWxlL0ljb24nXG5pbXBvcnQgQ2lyY2xlU3R5bGUgZnJvbSAnb2wvc3R5bGUvQ2lyY2xlJ1xuaW1wb3J0IFRleHRTdHlsZSBmcm9tICdvbC9zdHlsZS9UZXh0J1xuaW1wb3J0IERyYXcgZnJvbSAnb2wvaW50ZXJhY3Rpb24vRHJhdydcbmltcG9ydCBNb2RpZnkgZnJvbSAnb2wvaW50ZXJhY3Rpb24vTW9kaWZ5J1xuaW1wb3J0IFNlbGVjdCBmcm9tICdvbC9pbnRlcmFjdGlvbi9TZWxlY3QnXG5pbXBvcnQgU25hcCBmcm9tICdvbC9pbnRlcmFjdGlvbi9TbmFwJ1xuaW1wb3J0IERyYWdQYW4gZnJvbSAnb2wvaW50ZXJhY3Rpb24vRHJhZ1BhbidcblxuaW1wb3J0IFBvaW50IGZyb20gJ29sL2dlb20vUG9pbnQnXG5pbXBvcnQgTGluZVN0cmluZyBmcm9tICdvbC9nZW9tL0xpbmVTdHJpbmcnXG5pbXBvcnQgUG9seWdvbiBmcm9tICdvbC9nZW9tL1BvbHlnb24nXG5pbXBvcnQgTXVsdGlQb2ludCBmcm9tICdvbC9nZW9tL011bHRpUG9pbnQnXG5pbXBvcnQgTXVsdGlMaW5lU3RyaW5nIGZyb20gJ29sL2dlb20vTXVsdGlMaW5lU3RyaW5nJ1xuaW1wb3J0IE11bHRpUG9seWdvbiBmcm9tICdvbC9nZW9tL011bHRpUG9seWdvbidcbmltcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb24gZnJvbSAnb2wvZ2VvbS9HZW9tZXRyeUNvbGxlY3Rpb24nXG5pbXBvcnQgQ2lyY2xlIGZyb20gJ29sL2dlb20vQ2lyY2xlJ1xuaW1wb3J0IHsgZ2V0QXJlYSwgZ2V0TGVuZ3RoLCBnZXREaXN0YW5jZSB9IGZyb20gJ29sL3NwaGVyZSdcblxuLy8gUmVjcmVhdGUgT3BlbkxheWVycyBuYW1lc3BhY2Ugc3RydWN0dXJlXG5leHBvcnQgY29uc3QgT3BlbmxheWVycyA9IHtcbiAgTWFwLFxuICBWaWV3LFxuICBsYXllcjoge1xuICAgIFRpbGU6IFRpbGVMYXllcixcbiAgICBWZWN0b3I6IFZlY3RvckxheWVyLFxuICAgIEltYWdlOiBJbWFnZUxheWVyLFxuICB9LFxuICBzb3VyY2U6IHtcbiAgICBPU00sXG4gICAgV01UUyxcbiAgICBWZWN0b3I6IFZlY3RvclNvdXJjZSxcbiAgICBJbWFnZTogSW1hZ2UsXG4gICAgSW1hZ2VTdGF0aWMsXG4gICAgQmluZ01hcHMsXG4gICAgVGlsZVdNUyxcbiAgICBYWVosXG4gIH0sXG4gIHByb2o6IHtcbiAgICBnZXQ6IGdldFByb2plY3Rpb24sXG4gICAgZnJvbUxvbkxhdCxcbiAgICB0b0xvbkxhdCxcbiAgICB0cmFuc2Zvcm0sXG4gICAgdHJhbnNmb3JtRXh0ZW50LFxuICAgIGdldFByb2plY3Rpb24sXG4gIH0sXG4gIENvbnRyb2w6IHtcbiAgICBab29tLFxuICAgIGRlZmF1bHRDb250cm9scyxcbiAgfSxcbiAgaW50ZXJhY3Rpb246IHtcbiAgICBkZWZhdWx0czogZGVmYXVsdEludGVyYWN0aW9ucyxcbiAgICBkZWZhdWx0SW50ZXJhY3Rpb25zLFxuICAgIERyYXcsXG4gICAgTW9kaWZ5LFxuICAgIFNlbGVjdCxcbiAgICBTbmFwLFxuICAgIERyYWdQYW4sXG4gIH0sXG4gIEZlYXR1cmUsXG4gIGdlb206IHtcbiAgICBDaXJjbGUsXG4gICAgUG9pbnQsXG4gICAgTGluZVN0cmluZyxcbiAgICBQb2x5Z29uLFxuICAgIE11bHRpUG9pbnQsXG4gICAgTXVsdGlMaW5lU3RyaW5nLFxuICAgIE11bHRpUG9seWdvbixcbiAgICBHZW9tZXRyeUNvbGxlY3Rpb24sXG4gIH0sXG4gIHN0eWxlOiB7XG4gICAgU3R5bGUsXG4gICAgU3Ryb2tlLFxuICAgIEZpbGwsXG4gICAgSWNvbixcbiAgICBDaXJjbGU6IENpcmNsZVN0eWxlLFxuICAgIFRleHQ6IFRleHRTdHlsZSxcbiAgfSxcbiAgZXh0ZW50OiB7XG4gICAgZ2V0Q2VudGVyLFxuICAgIGJvdW5kaW5nRXh0ZW50LFxuICAgIGJ1ZmZlcixcbiAgICBleHRlbmQsXG4gICAgY3JlYXRlRW1wdHksXG4gIH0sXG4gIENvb3JkaW5hdGU6IHtcbiAgICBmb3JtYXQ6IGZvcm1hdENvb3JkaW5hdGUsXG4gIH0sXG4gIFNwaGVyZToge1xuICAgIGdldEFyZWEsXG4gICAgZ2V0TGVuZ3RoLFxuICAgIGdldERpc3RhbmNlLFxuICB9LFxufVxuIl19