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
import wrapNum from '../../../react-component/utils/wrap-num/wrap-num'
import * as React from 'react'
import ExtensionPoints from '../../../extension-points'

const wreqr = require('../../../js/wreqr.js')
const Marionette = require('marionette')
const CustomElements = require('../../../js/CustomElements.js')
const LoadingCompanionView = require('../../loading-companion/loading-companion.view.js')
const PopupPreviewView = require('./popup.view.js')
const CQLUtils = require('../../../js/CQLUtils.js')
const LocationModel = require('../../location-old/location-old.js')
const user = require('../../singletons/user-instance.js')
const MapContextMenuDropdown = require('../../dropdown/map-context-menu/dropdown.map-context-menu.view.js')
const MapModel = require('./map.model')
const properties = require('../../../js/properties.js')
const announcement = require('../../announcement')

import MapInfo from '../../../react-component/map-info'
import DistanceInfo from '../../../react-component/distance-info'
import getDistance from 'geolib/es/getDistance'
import { Drawing } from '../../singletons/drawing'
import { GeometriesView } from './react/geometries.view'
import MapToolbar from './map-toolbar'
const DropdownModel = require('../../dropdown/dropdown.js')

function findExtreme({ objArray, property, comparator }) {
  if (objArray.length === 0) {
    return undefined
  }
  return objArray.reduce(
    (extreme, coordinateObj) =>
      (extreme = comparator(extreme, coordinateObj[property])),
    objArray[0][property]
  )
}

function getHomeCoordinates() {
  if (properties.mapHome !== '' && properties.mapHome !== undefined) {
    const separateCoordinates = properties.mapHome.replace(/\s/g, '').split(',')
    if (separateCoordinates.length % 2 === 0) {
      return separateCoordinates
        .reduce((coordinates, coordinate, index) => {
          if (index % 2 === 0) {
            coordinates.push({
              lon: coordinate,
              lat: separateCoordinates[index + 1],
            })
          }
          return coordinates
        }, [])
        .map((coordinateObj) => {
          let lon = parseFloat(coordinateObj.lon)
          let lat = parseFloat(coordinateObj.lat)
          if (isNaN(lon) || isNaN(lat)) {
            return undefined
          }
          lon = wrapNum(lon, -180, 180)
          lat = wrapNum(lat, -90, 90)
          return {
            lon,
            lat,
          }
        })
        .filter((coordinateObj) => {
          return coordinateObj !== undefined
        })
    }
  } else {
    return []
  }
}

function getBoundingBox(coordinates) {
  const north = findExtreme({
    objArray: coordinates,
    property: 'lat',
    comparator: Math.max,
  })
  const south = findExtreme({
    objArray: coordinates,
    property: 'lat',
    comparator: Math.min,
  })
  const east = findExtreme({
    objArray: coordinates,
    property: 'lon',
    comparator: Math.max,
  })
  const west = findExtreme({
    objArray: coordinates,
    property: 'lon',
    comparator: Math.min,
  })
  if (
    north === undefined ||
    south === undefined ||
    east === undefined ||
    west === undefined
  ) {
    return undefined
  }
  return {
    north,
    east,
    south,
    west,
  }
}

const homeBoundingBox = getBoundingBox(getHomeCoordinates())
const defaultHomeBoundingBox = {
  west: -128,
  south: 24,
  east: -63,
  north: 52,
}

module.exports = Marionette.LayoutView.extend({
  tagName: CustomElements.register('map'),
  template() {
    return (
      <React.Fragment>
        <div id="mapDrawingPopup"></div>
        <div className="map-context-menu"></div>
        <div id="mapTools">
          <MapToolbar mapView={this} />
        </div>
        <div
          data-id="map-container"
          id="mapContainer"
          className="height-full px-2"
        ></div>
        <div className="mapInfo">
          <div className="info-feature"></div>
          <div className="info-coordinates">
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="distanceInfo">
          <div className="info-feature"></div>
        </div>
        <div className="popupPreview">
          <div className="info-feature"></div>
        </div>
        <div className="not-supported">
          <h3 align="center">The 3D Map is not supported by your browser.</h3>
          <button className="old-button switch-map is-positive">
            <span className="fa fa-map"></span>
            <span>2D Map</span>
          </button>
          <h3 align="center">
            2D Map will automatically load after 10 seconds.
          </h3>
        </div>
      </React.Fragment>
    )
  },
  regions: {
    mapDrawingPopup: '#mapDrawingPopup',
    mapContextMenu: '.map-context-menu',
    mapInfo: '.mapInfo',
    distanceInfo: '.distanceInfo',
    popupPreview: '.popupPreview',
  },
  geometriesView: undefined,
  map: undefined,
  mapModel: undefined,
  hasLoadedMap: false,
  initialize(options) {
    if (!options.selectionInterface) {
      throw 'Selection interface has not been provided'
    }
    this.onMapLoaded = options.onMapLoaded || (() => {})
    this.mapModel = new MapModel()
    this.listenTo(Drawing, 'change:drawing', this.handleDrawing)
    this.handleDrawing()
    this.setupMouseLeave()
  },
  setupMouseLeave() {
    this.$el.on('mouseleave', () => {
      this.mapModel.clearMouseCoordinates()
    })
  },
  setupCollections() {
    if (!this.map) {
      throw 'Map has not been set.'
    }
    this.geometriesView = new GeometriesView({
      selectionInterface: this.options.selectionInterface,
      map: this.map,
      mapView: this,
    })
  },
  setupListeners() {
    this.listenTo(
      wreqr.vent,
      'metacard:overlay',
      this.map.overlayImage.bind(this.map)
    )
    this.listenTo(
      wreqr.vent,
      'metacard:overlay:remove',
      this.map.removeOverlay.bind(this.map)
    )
    this.listenTo(
      wreqr.vent,
      'search:maprectanglefly',
      this.map.zoomToExtent.bind(this.map)
    )
    this.listenTo(
      this.options.selectionInterface,
      'reset:activeSearchResults',
      this.map.removeAllOverlays.bind(this.map)
    )
    this.listenTo(
      user.get('user').get('preferences'),
      'change:resultFilter',
      this.handleCurrentQuery
    )
    this.listenTo(
      this.options.selectionInterface,
      'change:currentQuery',
      this.handleCurrentQuery
    )
    this.listenTo(
      this.options.selectionInterface,
      'panToShapesExtent:currentQuery',
      this.panToShapesExtent
    )

    setTimeout(() => {
      this.handleCurrentQuery()
    }, 1000)

    // listener for when the measurement state changes in map model
    this.listenTo(
      this.mapModel,
      'change:measurementState',
      this.handleMeasurementStateChange.bind(this)
    )

    this.listenTo(
      this.mapModel,
      'change:mouseLat change:mouseLon',
      this.updateDistance.bind(this)
    )

    this.map.onMouseMove(this.onMapHover.bind(this))
    this.map.onRightClick(this.onRightClick.bind(this))
    this.setupRightClickMenu()
    this.setupMapInfo()
    this.setupDistanceInfo()
    this.setupPopupPreview()
  },
  handleInitialZoom() {
    if (user.get('user').get('preferences').get('autoPan')) {
      this.map.panToShapesExtent()
    } else {
      this.zoomToHome()
    }
  },
  zoomToHome() {
    const home = [
      user.get('user').get('preferences').get('mapHome'),
      homeBoundingBox,
      defaultHomeBoundingBox,
    ].find((element) => element !== undefined)

    this.map.zoomToBoundingBox(home)
  },
  saveAsHome() {
    const boundingBox = this.map.getBoundingBox()
    const userPreferences = user.get('user').get('preferences')
    userPreferences.set('mapHome', boundingBox)
    announcement.announce({
      title: 'Success!',
      message: 'New map home location set.',
      type: 'success',
    })
  },
  panToShapesExtent() {
    if (user.get('user').get('preferences').get('autoPan')) {
      if (this.map.getShapes().length) {
        this.map.panToShapesExtent()
      } else {
        this.zoomToHome()
      }
    }
  },
  onMapHover(event, mapEvent) {
    const currentQuery = this.options.selectionInterface.get('currentQuery')
    if (!currentQuery) {
      return
    }
    const result = currentQuery.get('result')
    if (!result) {
      return
    }
    const metacard = result.get('lazyResults').results[mapEvent.mapTarget]
    this.updateTarget(metacard)
    this.$el.toggleClass(
      'is-hovering',
      Boolean(
        mapEvent.mapTarget &&
          mapEvent.mapTarget !== 'userDrawing' &&
          (mapEvent.mapTarget.constructor === Array ||
            mapEvent.mapTarget.length > 10) // why ten?  Well, for some reason we don't put 'userDrawing' as the id on openlayers targets, instead we put a random cid from marionette / backbone. Not sure why to be honest.  We have to check if it's an array though, because clusters come back as arrays
      )
    )
  },
  updateTarget(metacard) {
    let target
    let targetMetacard
    if (metacard) {
      target = metacard.plain.metacard.properties.title
      targetMetacard = metacard
    }
    this.mapModel.set({
      target,
      targetMetacard,
    })
  },
  /*
   *  Redraw and recalculate the ruler line and distanceInfo tooltip. Will not redraw while the menu is currently
   *  displayed updateOnMenu allows updating while the menu is up
   */
  updateDistance(updateOnMenu = false) {
    if (this.mapModel.get('measurementState') === 'START') {
      const openMenu = this.mapContextMenu.currentView.model.changed.isOpen
      const lat = this.mapModel.get('mouseLat')
      const lon = this.mapModel.get('mouseLon')

      if ((updateOnMenu === true || !openMenu) && lat && lon) {
        // redraw ruler line
        const mousePoint = { lat, lon }
        this.map.setRulerLine(mousePoint)

        // update distance info
        const startingCoordinates = this.mapModel.get('startingCoordinates')
        const dist = getDistance(
          { latitude: lat, longitude: lon },
          {
            latitude: startingCoordinates['lat'],
            longitude: startingCoordinates['lon'],
          }
        )
        this.mapModel.setDistanceInfoPosition(event.clientX, event.clientY)
        this.mapModel.setCurrentDistance(dist)
      }
    }
  },
  /*
    Handles drawing or clearing the ruler as needed by the measurement state.

    START indicates that a starting point should be drawn, 
    so the map clears any previous points drawn and draws a new start point.

    END indicates that an ending point should be drawn,
    so the map draws an end point and a line, and calculates the distance.

    NONE indicates that the ruler should be cleared.
  */
  handleMeasurementStateChange() {
    const state = this.mapModel.get('measurementState')
    let point = null
    switch (state) {
      case 'START':
        this.clearRuler()
        point = this.map.addRulerPoint(this.mapModel.get('coordinateValues'))
        this.mapModel.addPoint(point)
        this.mapModel.setStartingCoordinates({
          lat: this.mapModel.get('coordinateValues')['lat'],
          lon: this.mapModel.get('coordinateValues')['lon'],
        })
        const polyline = this.map.addRulerLine(
          this.mapModel.get('coordinateValues')
        )
        this.mapModel.setLine(polyline)
        break
      case 'END':
        point = this.map.addRulerPoint(this.mapModel.get('coordinateValues'))
        this.mapModel.addPoint(point)
        this.map.setRulerLine({
          lat: this.mapModel.get('coordinateValues')['lat'],
          lon: this.mapModel.get('coordinateValues')['lon'],
        })
        break
      case 'NONE':
        this.clearRuler()
        break
      default:
        break
    }
  },
  /*
    Handles tasks for clearing the ruler, which include removing all points
    (endpoints of the line) and the line.
  */
  clearRuler() {
    const points = this.mapModel.get('points')
    points.forEach((point) => {
      this.map.removeRulerPoint(point)
    })
    this.mapModel.clearPoints()
    const line = this.mapModel.removeLine()
    this.map.removeRulerLine(line)
  },
  onRightClick(event, mapEvent) {
    event.preventDefault()
    this.$el
      .find('.map-context-menu')
      .css('left', event.offsetX)
      .css('top', event.offsetY)
    this.mapModel.updateClickCoordinates()
    if (this.mapModel.get('mouseLat') !== undefined) {
      this.mapContextMenu.currentView.model.open()
    }
    this.updateDistance(true)
  },
  setupRightClickMenu() {
    this.mapContextMenu.show(
      new MapContextMenuDropdown({
        model: new DropdownModel(),
        mapModel: this.mapModel,
        selectionInterface: this.options.selectionInterface,
      })
    )
  },
  setupMapInfo() {
    const map = this.mapModel
    const MapInfoView = Marionette.ItemView.extend({
      template() {
        return <MapInfo map={map} />
      },
    })

    this.mapInfo.show(new MapInfoView())
  },
  setupDistanceInfo() {
    const map = this.mapModel
    const DistanceInfoView = Marionette.ItemView.extend({
      template() {
        return <DistanceInfo map={map} />
      },
    })

    const distanceInfoView = new DistanceInfoView()

    this.mapModel.addDistanceInfo(distanceInfoView)
    this.distanceInfo.show(distanceInfoView)
  },
  setupPopupPreview() {
    this.popupPreview.show(
      new PopupPreviewView({
        map: this.map,
        mapModel: this.mapModel,
        selectionInterface: this.options.selectionInterface,
      })
    )
  },
  /*
        Map creation is deferred to this method, so that all resources pertaining to the map can be loaded lazily and
        not be included in the initial page payload.
        Because of this, make sure to return a deferred that will resolve when your respective map implementation
        is finished loading / starting up.
        Also, make sure you resolve that deferred by passing the reference to the map implementation.
    */
  loadMap() {
    throw 'Map not implemented'
  },
  createMap(Map) {
    this.map = Map(
      this.el.querySelector('#mapContainer'),
      this.options.selectionInterface,
      this.mapDrawingPopup.el,
      this.el,
      this.mapModel
    )
    this.setupCollections()
    this.setupListeners()
    this.endLoading()
    setTimeout(() => {
      this.handleInitialZoom()
    }, 1000)
  },
  initializeMap() {
    this.loadMap().then((Map) => {
      this.createMap(Map)
      this.hasLoadedMap = true
      this.onMapLoaded(this.map.getMap())
    })
  },
  startLoading() {
    LoadingCompanionView.beginLoading(this)
  },
  endLoading() {
    LoadingCompanionView.endLoading(this)
  },
  onRender() {
    this.startLoading()
    setTimeout(() => {
      this.initializeMap()
    }, 1000)
  },
  toggleClustering() {
    this.$el.toggleClass('is-clustering')
    this.geometriesView.toggleClustering()
  },
  handleDrawing() {
    this.$el.toggleClass('is-drawing', Drawing.isDrawing())
  },
  handleCurrentQuery() {
    this.removePreviousLocations()
    const currentQuery = this.options.selectionInterface.get('currentQuery')
    if (currentQuery) {
      this.handleFilter(
        currentQuery.get('filterTree'),
        currentQuery.get('color')
      )
    }
    const resultFilter = user.get('user').get('preferences').get('resultFilter')
    if (resultFilter) {
      this.handleFilter(resultFilter, '#c89600')
    }
  },
  handleFilter(filter, color) {
    if (filter.filters) {
      filter.filters.forEach((subfilter) => {
        this.handleFilter(subfilter, color)
      })
    } else {
      const extensionModel = ExtensionPoints.handleFilter(this.map, filter)

      if (extensionModel) {
        return
      }

      if (filter.type === 'GEOMETRY') {
        const locationModel = new LocationModel(filter.value)
        switch (filter.value.type) {
          case 'LINE':
            this.map.showLineShape(locationModel)
            break
          case 'POLYGON':
            this.map.showPolygonShape(locationModel)
            break
          case 'MULTIPOLYGON':
            this.map.showPolygonShape(locationModel)
            break
          case 'BBOX':
            this.map.showBboxShape(locationModel)
            break
          case 'POINTRADIUS':
            this.map.showCircleShape(locationModel)
            break
        }
      }
    }
  },
  handleFilterAsLine(filter, color) {
    const pointText = filter.value.value.substring(
      11,
      filter.value.value.length - 1
    )
    const locationModel = new LocationModel({
      lineWidth: filter.distance || 0,
      line: pointText
        .split(',')
        .map((coordinate) =>
          coordinate.split(' ').map((value) => Number(value))
        ),
      color,
    })
    this.map.showLineShape(locationModel)
  },
  handleFilterAsPolygon(value, color, distance) {
    const filterValue = typeof value === 'string' ? value : value.value
    const locationModel = new LocationModel({
      polygon: CQLUtils.arrayFromPolygonWkt(filterValue),
      color,
      ...(distance && { polygonBufferWidth: distance }),
    })
    this.map.showPolygonShape(locationModel)
  },
  removePreviousLocations() {
    this.map.destroyShapes()
  },
  onDestroy() {
    if (this.geometriesView) {
      this.geometriesView.destroy()
    }
    if (this.map) {
      this.map.destroy()
    }
  },
})
