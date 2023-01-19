import { useRender } from '../hooks/useRender'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import Backbone from 'backbone'
import wreqr from '../../js/wreqr'
import $ from 'jquery'
type DrawingType = Backbone.Model & {
  turnOnDrawing: (model: Backbone.Model) => void
  turnOffDrawing: () => void
  isFuzzyDrawing: () => boolean
  isDrawing: () => boolean
  getDrawModel: () => Backbone.Model
}
let lastDrawing = 0
const DEBOUNCE = 250
export const Drawing = new (Backbone.Model.extend({
  defaults: {
    drawing: false,
    drawingModel: undefined,
  },
  initialize() {
    this.listenTo((wreqr as any).vent, 'search:drawline', this.turnOnDrawing)
    this.listenTo((wreqr as any).vent, 'search:drawcircle', this.turnOnDrawing)
    this.listenTo((wreqr as any).vent, 'search:drawpoly', this.turnOnDrawing)
    this.listenTo((wreqr as any).vent, 'search:drawbbox', this.turnOnDrawing)
    this.listenTo((wreqr as any).vent, 'search:drawend', this.turnOffDrawing)
  },
  turnOnDrawing(model: Backbone.Model) {
    this.set('drawing', true)
    this.set('drawingModel', model)
    $('html').toggleClass('is-drawing', true)
  },
  turnOffDrawing() {
    lastDrawing = Date.now()
    this.set('drawing', false)
    $('html').toggleClass('is-drawing', false)
  },
  timeSinceLastDrawing() {
    return Date.now() - lastDrawing
  },
  getDrawModel() {
    return this.get('drawingModel')
  },
  isFuzzyDrawing() {
    return this.isDrawing() || this.timeSinceLastDrawing() < DEBOUNCE
  },
  isDrawing() {
    return this.get('drawing')
  },
}))() as DrawingType
export const useIsDrawing = () => {
  const render = useRender()
  useListenTo(Drawing, 'change:drawing', render)
  return Drawing.isDrawing()
}
