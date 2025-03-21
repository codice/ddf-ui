export const options: Record<
  string,
  {
    label: string
    help: {
      ol?: string
      cesium?: string
    }
    config: Record<string, any>
  }
> = {
  OSM: {
    label: 'Open Street Map',
    help: {
      ol: 'https://openlayers.org/en/latest/apidoc/module-ol_source_OSM-OSM.html',
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/createOpenStreetMapImageryProvider.html',
    },
    config: {},
  },
  WMS: {
    label: 'Web Map Service',
    help: {
      ol: 'https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html',
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/WebMapServiceImageryProvider.html',
    },
    config: {
      parameters: {
        LAYERS: [],
        STYLES: '',
        VERSION: '1.3.0',
      },
    },
  },
  WMT: {
    label: 'Web Map Tile Service',
    help: {
      ol: 'https://openlayers.org/en/latest/apidoc/module-ol_source_WMTS-WMTS.html',
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/WebMapTileServiceImageryProvider.html',
    },
    config: {
      matrixSet: '',
      layer: '',
      format: 'image/jpeg',
      tileWidth: 256,
      tileHeight: 256,
    },
  },
  AGM: {
    label: 'ArcGIS Map Server',
    help: {
      ol: 'https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html',
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/ArcGisMapServerImageryProvider.html',
    },
    config: {},
  },
  SI: {
    label: 'Single Tile',
    help: {
      ol: 'https://openlayers.org/en/latest/apidoc/module-ol_source_ImageStatic-Static.html',
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/SingleTileImageryProvider.html',
    },
    config: {
      parameters: {},
    },
  },
  BM: {
    label: 'Bing Maps',
    help: {
      ol: 'https://openlayers.org/en/latest/apidoc/module-ol_source_BingMaps-BingMaps.html',
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/BingMapsImageryProvider.html',
    },
    config: {},
  },
  TMS: {
    label: 'Tile Map Service',
    help: {
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/createTileMapServiceImageryProvider.html',
    },
    config: {},
  },
  GE: {
    label: 'Google Earth',
    help: {
      cesium:
        'https://cesium.com/downloads/cesiumjs/releases/1.20/Build/Documentation/GoogleEarthImageryProvider.html',
    },
    config: {},
  },
}

export default options
